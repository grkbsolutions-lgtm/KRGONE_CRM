import fs from 'fs';
import path from 'path';
import { CompanyRecord, ContactRecord, AddressRecord, ImportLogRecord, FullLeadRecord, DashboardStats } from '../types.js';

interface DatabaseSchema {
  companies: CompanyRecord[];
  contacts: ContactRecord[];
  addresses: AddressRecord[];
  importLogs: ImportLogRecord[];
}

const DB_PATH = path.join(process.cwd(), 'data', 'scanner_db.json');

class LocalDatabase {
  private data: DatabaseSchema = {
    companies: [],
    contacts: [],
    addresses: [],
    importLogs: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(DB_PATH)) {
        const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
        this.data = JSON.parse(fileContent);
      } else {
        this.seedDemoData();
        this.save();
      }
    } catch (err) {
      console.error('Error initializing database:', err);
      this.seedDemoData();
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database:', err);
    }
  }

  private seedDemoData() {
    const now = new Date().toISOString();
    
    // Seed Sample Companies
    const company1Id = 'comp_101';
    const company2Id = 'comp_102';
    const company3Id = 'comp_103';

    this.data.companies = [
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
    ];

    this.data.contacts = [
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
    ];

    this.data.addresses = [
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
    ];

    this.data.importLogs = [
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
    ];
  }

  // Helper getters
  public getAllLeads(): FullLeadRecord[] {
    return this.data.companies.map((company) => {
      const contact = this.data.contacts.find((c) => c.companyId === company.id) || {
        id: `cont_${company.id}`,
        companyId: company.id,
        contactPerson: '',
        mobile: '',
        phone: '',
        email: '',
      };

      const address = this.data.addresses.find((a) => a.companyId === company.id) || {
        id: `addr_${company.id}`,
        companyId: company.id,
        officeAddress: '',
        factoryAddress: '',
        city: '',
        state: '',
        pincode: '',
      };

      return { company, contact, address };
    });
  }

  public getLeadById(companyId: string): FullLeadRecord | null {
    const company = this.data.companies.find((c) => c.id === companyId);
    if (!company) return null;

    const contact = this.data.contacts.find((c) => c.companyId === companyId) || {
      id: `cont_${companyId}`,
      companyId,
      contactPerson: '',
      mobile: '',
      phone: '',
      email: '',
    };

    const address = this.data.addresses.find((a) => a.companyId === companyId) || {
      id: `addr_${companyId}`,
      companyId,
      officeAddress: '',
      factoryAddress: '',
      city: '',
      state: '',
      pincode: '',
    };

    return { company, contact, address };
  }

  public checkDuplicate(companyName: string, mobile: string, email: string) {
    const cleanName = companyName?.trim().toLowerCase();
    const cleanMobile = mobile?.replace(/[^0-9]/g, '');
    const cleanEmail = email?.trim().toLowerCase();

    let conflictType: 'companyName' | 'mobile' | 'email' | 'multiple' | undefined;
    const matchedFields: string[] = [];
    let matchedCompany: CompanyRecord | undefined;

    for (const company of this.data.companies) {
      const contact = this.data.contacts.find((c) => c.companyId === company.id);

      const nameMatch = cleanName && company.companyName.trim().toLowerCase() === cleanName;
      const contactMobileClean = contact?.mobile ? contact.mobile.replace(/[^0-9]/g, '') : '';
      const mobileMatch = cleanMobile && cleanMobile.length >= 7 && contactMobileClean.endsWith(cleanMobile.slice(-10));
      const emailMatch = cleanEmail && contact?.email.trim().toLowerCase() === cleanEmail;

      if (nameMatch || mobileMatch || emailMatch) {
        matchedCompany = company;
        if (nameMatch) matchedFields.push('Company Name');
        if (mobileMatch) matchedFields.push('Mobile Number');
        if (emailMatch) matchedFields.push('Email');

        break;
      }
    }

    if (!matchedCompany) {
      return { isDuplicate: false };
    }

    if (matchedFields.length > 1) {
      conflictType = 'multiple';
    } else if (matchedFields.includes('Company Name')) {
      conflictType = 'companyName';
    } else if (matchedFields.includes('Mobile Number')) {
      conflictType = 'mobile';
    } else if (matchedFields.includes('Email')) {
      conflictType = 'email';
    }

    return {
      isDuplicate: true,
      conflictType,
      existingCompanyId: matchedCompany.id,
      existingCompanyName: matchedCompany.companyName,
      matchedFields,
    };
  }

  public saveLead(data: {
    companyName: string;
    contactPerson?: string;
    mobile?: string;
    phone?: string;
    email?: string;
    officeAddress?: string;
    factoryAddress?: string;
    city?: string;
    state?: string;
    pincode?: string;
    category?: string;
    website?: string;
  }): FullLeadRecord {
    const companyId = `comp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const company: CompanyRecord = {
      id: companyId,
      companyName: data.companyName.trim(),
      category: data.category?.trim() || 'General / Uncategorized',
      website: data.website?.trim() || '',
      createdAt: new Date().toISOString(),
    };

    const contact: ContactRecord = {
      id: `cont_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      companyId,
      contactPerson: data.contactPerson?.trim() || '',
      mobile: data.mobile?.trim() || '',
      phone: data.phone?.trim() || '',
      email: data.email?.trim() || '',
    };

    const address: AddressRecord = {
      id: `addr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      companyId,
      officeAddress: data.officeAddress?.trim() || '',
      factoryAddress: data.factoryAddress?.trim() || '',
      city: data.city?.trim() || '',
      state: data.state?.trim() || '',
      pincode: data.pincode?.trim() || '',
    };

    this.data.companies.unshift(company);
    this.data.contacts.unshift(contact);
    this.data.addresses.unshift(address);

    this.save();
    return { company, contact, address };
  }

  public updateLead(
    companyId: string,
    data: {
      companyName?: string;
      contactPerson?: string;
      mobile?: string;
      phone?: string;
      email?: string;
      officeAddress?: string;
      factoryAddress?: string;
      city?: string;
      state?: string;
      pincode?: string;
      category?: string;
      website?: string;
    }
  ): FullLeadRecord | null {
    const company = this.data.companies.find((c) => c.id === companyId);
    if (!company) return null;

    if (data.companyName !== undefined) company.companyName = data.companyName.trim();
    if (data.category !== undefined) company.category = data.category.trim();
    if (data.website !== undefined) company.website = data.website.trim();

    let contact = this.data.contacts.find((c) => c.companyId === companyId);
    if (!contact) {
      contact = {
        id: `cont_${Date.now()}`,
        companyId,
        contactPerson: '',
        mobile: '',
        phone: '',
        email: '',
      };
      this.data.contacts.push(contact);
    }

    if (data.contactPerson !== undefined) contact.contactPerson = data.contactPerson.trim();
    if (data.mobile !== undefined) contact.mobile = data.mobile.trim();
    if (data.phone !== undefined) contact.phone = data.phone.trim();
    if (data.email !== undefined) contact.email = data.email.trim();

    let address = this.data.addresses.find((a) => a.companyId === companyId);
    if (!address) {
      address = {
        id: `addr_${Date.now()}`,
        companyId,
        officeAddress: '',
        factoryAddress: '',
        city: '',
        state: '',
        pincode: '',
      };
      this.data.addresses.push(address);
    }

    if (data.officeAddress !== undefined) address.officeAddress = data.officeAddress.trim();
    if (data.factoryAddress !== undefined) address.factoryAddress = data.factoryAddress.trim();
    if (data.city !== undefined) address.city = data.city.trim();
    if (data.state !== undefined) address.state = data.state.trim();
    if (data.pincode !== undefined) address.pincode = data.pincode.trim();

    this.save();
    return { company, contact, address };
  }

  public deleteLead(companyId: string): boolean {
    const initialLen = this.data.companies.length;
    this.data.companies = this.data.companies.filter((c) => c.id !== companyId);
    this.data.contacts = this.data.contacts.filter((c) => c.companyId !== companyId);
    this.data.addresses = this.data.addresses.filter((a) => a.companyId !== companyId);

    const deleted = this.data.companies.length < initialLen;
    if (deleted) this.save();
    return deleted;
  }

  public addImportLog(log: Omit<ImportLogRecord, 'id' | 'importDate'>): ImportLogRecord {
    const newLog: ImportLogRecord = {
      id: `log_${Date.now()}`,
      importedBy: log.importedBy || 'Scanner User',
      importDate: new Date().toISOString(),
      sourceType: log.sourceType,
      totalCompanies: log.totalCompanies,
      importedCompanies: log.importedCompanies,
      duplicates: log.duplicates,
      processingTime: log.processingTime,
    };

    this.data.importLogs.unshift(newLog);
    this.save();
    return newLog;
  }

  public getStats(): DashboardStats {
    const categoryMap: Record<string, number> = {};
    for (const company of this.data.companies) {
      const cat = company.category || 'General';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    }

    const categoryCounts = Object.entries(categoryMap).map(([category, count]) => ({
      category,
      count,
    }));

    const totalImports = this.data.importLogs.length;
    let totalDuplicatesDetected = 0;
    let totalParsedInLogs = 0;

    for (const log of this.data.importLogs) {
      totalDuplicatesDetected += log.duplicates || 0;
      totalParsedInLogs += log.totalCompanies || 0;
    }

    const duplicateRate = totalParsedInLogs > 0 ? Math.round((totalDuplicatesDetected / totalParsedInLogs) * 100) : 0;

    return {
      totalCompanies: this.data.companies.length,
      totalContacts: this.data.contacts.filter((c) => c.contactPerson || c.mobile || c.email).length,
      totalImports,
      duplicateRate,
      categoryCounts,
      recentLogs: this.data.importLogs.slice(0, 10),
    };
  }

  public getLogs(): ImportLogRecord[] {
    return this.data.importLogs;
  }
}

export const db = new LocalDatabase();
