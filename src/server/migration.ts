import fs from 'fs';
import path from 'path';
import { adminDb } from './firebase-admin';
import { CompanyRecord, ContactRecord, AddressRecord, ImportLogRecord } from '../types';

let migrationExecuted = false;

export async function checkAndRunMigration(): Promise<void> {
  if (migrationExecuted) return;

  try {
    const migrationDocRef = adminDb.collection('system').doc('migration');
    const migrationSnap = await migrationDocRef.get();

    if (migrationSnap.exists && migrationSnap.data()?.migrated) {
      migrationExecuted = true;
      return;
    }

    // Check if companies collection already has documents
    const companiesSnap = await adminDb.collection('companies').get();
    if (!companiesSnap.empty) {
      await migrationDocRef.set({ migrated: true, timestamp: new Date().toISOString() });
      migrationExecuted = true;
      return;
    }

    // Try reading local scanner_db.json if it exists
    let dbData: {
      companies?: CompanyRecord[];
      contacts?: ContactRecord[];
      addresses?: AddressRecord[];
      importLogs?: ImportLogRecord[];
    } | null = null;

    const possiblePaths = [
      path.join(process.cwd(), 'data', 'scanner_db.json'),
      path.join('/tmp', 'scanner_db.json'),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        try {
          const content = fs.readFileSync(p, 'utf-8');
          dbData = JSON.parse(content);
          break;
        } catch (e) {
          // Ignore read error
        }
      }
    }

    // Fallback seed data if no file existed
    if (!dbData || !dbData.companies || dbData.companies.length === 0) {
      const company1Id = 'comp_101';
      const company2Id = 'comp_102';
      const company3Id = 'comp_103';

      dbData = {
        companies: [
          {
            id: company1Id,
            companyName: 'Apex Industrial Solutions Pvt Ltd',
            category: 'Manufacturing & Machinery',
            website: 'https://apexindustrial.com',
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          },
          {
            id: company2Id,
            companyName: 'Nexus Global Logistics',
            category: 'Supply Chain & Freight',
            website: 'https://nexusgloballogistics.org',
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          },
          {
            id: company3Id,
            companyName: 'Vanguard Electronics Corp',
            category: 'Electronics & Components',
            website: 'https://vanguard-elec.com',
            createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
          },
        ],
        contacts: [
          {
            id: 'cont_101',
            companyId: company1Id,
            contactPerson: 'Rajesh Sharma',
            mobile: '+91 98201 44512',
            phone: '022 2845 9901',
            email: 'r.sharma@apexindustrial.com',
          },
          {
            id: 'cont_102',
            companyId: company2Id,
            contactPerson: 'Priya Mehta',
            mobile: '+91 98922 11094',
            phone: '022 6712 3400',
            email: 'priya.mehta@nexusgloballogistics.org',
          },
          {
            id: 'cont_103',
            companyId: company3Id,
            contactPerson: 'Vikram Singh',
            mobile: '+91 97110 88234',
            phone: '011 4152 7700',
            email: 'vikram.singh@vanguard-elec.com',
          },
        ],
        addresses: [
          {
            id: 'addr_101',
            companyId: company1Id,
            officeAddress: 'Suite 402, Trade Tower, Bandra Kurla Complex',
            factoryAddress: 'Plot 45, MIDC Industrial Area, Tarapur',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400051',
          },
          {
            id: 'addr_102',
            companyId: company2Id,
            officeAddress: 'Building B, Logistics Park, NH 8',
            factoryAddress: 'Warehouse Hub 3, Bhiwandi Road',
            city: 'Thane',
            state: 'Maharashtra',
            pincode: '421302',
          },
          {
            id: 'addr_103',
            companyId: company3Id,
            officeAddress: '7th Floor, Cyber Tech Park, Okhla Phase III',
            factoryAddress: 'Unit 12, Tech Zone, Greater Noida',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110020',
          },
        ],
        importLogs: [
          {
            id: 'log_101',
            importedBy: 'Admin Scanner',
            importDate: new Date(Date.now() - 86400000 * 3).toISOString(),
            sourceType: 'pdf',
            totalCompanies: 4,
            importedCompanies: 3,
            duplicates: 1,
            processingTime: 2450,
          },
        ],
      };
    }

    const batch = adminDb.batch();

    if (dbData.companies) {
      for (const comp of dbData.companies) {
        batch.set(adminDb.collection('companies').doc(comp.id), comp);
      }
    }

    if (dbData.contacts) {
      for (const cont of dbData.contacts) {
        batch.set(adminDb.collection('contacts').doc(cont.id), cont);
      }
    }

    if (dbData.addresses) {
      for (const addr of dbData.addresses) {
        batch.set(adminDb.collection('addresses').doc(addr.id), addr);
      }
    }

    if (dbData.importLogs) {
      for (const log of dbData.importLogs) {
        batch.set(adminDb.collection('importLogs').doc(log.id), log);
      }
    }

    batch.set(migrationDocRef, { migrated: true, timestamp: new Date().toISOString() });
    await batch.commit();

    migrationExecuted = true;
    console.log('[Migration] Successfully migrated initial data into Firestore');
  } catch (err: any) {
    migrationExecuted = true;
    console.log('[Migration] Local mode active or Firestore permissions locked:', err?.message || err);
  }
}
