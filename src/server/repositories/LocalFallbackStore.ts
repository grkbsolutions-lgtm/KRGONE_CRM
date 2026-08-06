import fs from 'fs';
import path from 'path';
import { CompanyRecord, ContactRecord, AddressRecord, ImportLogRecord, FullLeadRecord, DashboardStats } from '../../types';

export class LocalFallbackStore {
  private companies: CompanyRecord[] = [];
  private contacts: ContactRecord[] = [];
  private addresses: AddressRecord[] = [];
  private importLogs: ImportLogRecord[] = [];
  private initialized = false;

  private get filePath(): string {
    return path.join(process.cwd(), 'data', 'scanner_db.json');
  }

  private init() {
    if (this.initialized) return;
    this.initialized = true;

    try {
      if (fs.existsSync(this.filePath)) {
        const data = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
        this.companies = data.companies || [];
        this.contacts = data.contacts || [];
        this.addresses = data.addresses || [];
        this.importLogs = data.importLogs || [];
        if (this.companies.length > 0) return;
      }
    } catch (err) {
      // ignore
    }

    // Default Seed Data
    const comp1 = 'comp_101';
    const comp2 = 'comp_102';
    const comp3 = 'comp_103';

    this.companies = [
      {
        id: comp1,
        companyName: 'Apex Industrial Solutions Pvt Ltd',
        category: 'Manufacturing & Machinery',
        website: 'https://apexindustrial.com',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: comp2,
        companyName: 'Nexus Global Logistics',
        category: 'Supply Chain & Freight',
        website: 'https://nexusgloballogistics.org',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: comp3,
        companyName: 'Vanguard Electronics Corp',
        category: 'Electronics & Components',
        website: 'https://vanguard-elec.com',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
    ];

    this.contacts = [
      {
        id: 'cont_101',
        companyId: comp1,
        contactPerson: 'Rajesh Sharma',
        mobile: '+91 98201 44512',
        phone: '022 2845 9901',
        email: 'r.sharma@apexindustrial.com',
      },
      {
        id: 'cont_102',
        companyId: comp2,
        contactPerson: 'Priya Mehta',
        mobile: '+91 98922 11094',
        phone: '022 6712 3400',
        email: 'priya.mehta@nexusgloballogistics.org',
      },
      {
        id: 'cont_103',
        companyId: comp3,
        contactPerson: 'Vikram Singh',
        mobile: '+91 97110 88234',
        phone: '011 4152 7700',
        email: 'vikram.singh@vanguard-elec.com',
      },
    ];

    this.addresses = [
      {
        id: 'addr_101',
        companyId: comp1,
        officeAddress: 'Suite 402, Trade Tower, Bandra Kurla Complex',
        factoryAddress: 'Plot 45, MIDC Industrial Area, Tarapur',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400051',
      },
      {
        id: 'addr_102',
        companyId: comp2,
        officeAddress: 'Building B, Logistics Park, NH 8',
        factoryAddress: 'Warehouse Hub 3, Bhiwandi Road',
        city: 'Thane',
        state: 'Maharashtra',
        pincode: '421302',
      },
      {
        id: 'addr_103',
        companyId: comp3,
        officeAddress: '7th Floor, Cyber Tech Park, Okhla Phase III',
        factoryAddress: 'Unit 12, Tech Zone, Greater Noida',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110020',
      },
    ];

    this.importLogs = [
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

    this.saveToFile();
  }

  private saveToFile() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(
        this.filePath,
        JSON.stringify(
          {
            companies: this.companies,
            contacts: this.contacts,
            addresses: this.addresses,
            importLogs: this.importLogs,
          },
          null,
          2
        )
      );
    } catch (err) {
      // ignore write error
    }
  }

  public getAllLeads(): FullLeadRecord[] {
    this.init();
    const sortedComps = [...this.companies].sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    return sortedComps.map((company) => {
      const contact = this.contacts.find((c) => c.companyId === company.id) || {
        id: `cont_${company.id}`,
        companyId: company.id,
        contactPerson: '',
        mobile: '',
        phone: '',
        email: '',
      };
      const address = this.addresses.find((a) => a.companyId === company.id) || {
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
    this.init();
    const company = this.companies.find((c) => c.id === companyId);
    if (!company) return null;

    const contact = this.contacts.find((c) => c.companyId === companyId) || {
      id: `cont_${companyId}`,
      companyId,
      contactPerson: '',
      mobile: '',
      phone: '',
      email: '',
    };
    const address = this.addresses.find((a) => a.companyId === companyId) || {
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
    this.init();
    const cleanName = companyName?.trim().toLowerCase();
    const cleanMobile = mobile?.replace(/[^0-9]/g, '');
    const cleanEmail = email?.trim().toLowerCase();

    const matchedFields: string[] = [];
    let matchedCompany: CompanyRecord | undefined;

    for (const company of this.companies) {
      const contact = this.contacts.find((c) => c.companyId === company.id);
      const nameMatch = cleanName && company.companyName?.trim().toLowerCase() === cleanName;
      const contactMobileClean = contact?.mobile ? contact.mobile.replace(/[^0-9]/g, '') : '';
      const mobileMatch =
        cleanMobile && cleanMobile.length >= 7 && contactMobileClean.endsWith(cleanMobile.slice(-10));
      const emailMatch = cleanEmail && contact?.email?.trim().toLowerCase() === cleanEmail;

      if (nameMatch || mobileMatch || emailMatch) {
        matchedCompany = company;
        if (nameMatch) matchedFields.push('Company Name');
        if (mobileMatch) matchedFields.push('Mobile Number');
        if (emailMatch) matchedFields.push('Email');
        break;
      }
    }

    if (!matchedCompany) return { isDuplicate: false };

    let conflictType: 'companyName' | 'mobile' | 'email' | 'multiple' | undefined;
    if (matchedFields.length > 1) conflictType = 'multiple';
    else if (matchedFields.includes('Company Name')) conflictType = 'companyName';
    else if (matchedFields.includes('Mobile Number')) conflictType = 'mobile';
    else if (matchedFields.includes('Email')) conflictType = 'email';

    return {
      isDuplicate: true,
      conflictType,
      existingCompanyId: matchedCompany.id,
      existingCompanyName: matchedCompany.companyName,
      matchedFields,
    };
  }

  public saveLead(data: any): FullLeadRecord {
    this.init();
    const companyId = `comp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const contactId = `cont_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const addressId = `addr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const company: CompanyRecord = {
      id: companyId,
      companyName: String(data?.companyName || 'Unnamed Business').trim(),
      category: String(data?.category || 'General / Uncategorized').trim(),
      website: String(data?.website || '').trim(),
      createdAt: new Date().toISOString(),
    };

    const contact: ContactRecord = {
      id: contactId,
      companyId,
      contactPerson: String(data?.contactPerson || '').trim(),
      mobile: String(data?.mobile || '').trim(),
      phone: String(data?.phone || '').trim(),
      email: String(data?.email || '').trim(),
    };

    const address: AddressRecord = {
      id: addressId,
      companyId,
      officeAddress: String(data?.officeAddress || '').trim(),
      factoryAddress: String(data?.factoryAddress || '').trim(),
      city: String(data?.city || '').trim(),
      state: String(data?.state || '').trim(),
      pincode: String(data?.pincode || '').trim(),
    };

    this.companies.push(company);
    this.contacts.push(contact);
    this.addresses.push(address);
    this.saveToFile();

    return { company, contact, address };
  }

  public updateLead(companyId: string, data: any): FullLeadRecord | null {
    this.init();
    const companyIndex = this.companies.findIndex((c) => c.id === companyId);
    if (companyIndex === -1) return null;

    const company = { ...this.companies[companyIndex] };
    if (data?.companyName) company.companyName = String(data.companyName).trim();
    if (data?.category) company.category = String(data.category).trim();
    if (data?.website) company.website = String(data.website).trim();
    this.companies[companyIndex] = company;

    let contactIndex = this.contacts.findIndex((c) => c.companyId === companyId);
    let contact = contactIndex !== -1 ? { ...this.contacts[contactIndex] } : {
      id: `cont_${companyId}`,
      companyId,
      contactPerson: '',
      mobile: '',
      phone: '',
      email: '',
    };
    if (data?.contactPerson !== undefined) contact.contactPerson = String(data.contactPerson).trim();
    if (data?.mobile !== undefined) contact.mobile = String(data.mobile).trim();
    if (data?.phone !== undefined) contact.phone = String(data.phone).trim();
    if (data?.email !== undefined) contact.email = String(data.email).trim();

    if (contactIndex !== -1) this.contacts[contactIndex] = contact;
    else this.contacts.push(contact);

    let addressIndex = this.addresses.findIndex((a) => a.companyId === companyId);
    let address = addressIndex !== -1 ? { ...this.addresses[addressIndex] } : {
      id: `addr_${companyId}`,
      companyId,
      officeAddress: '',
      factoryAddress: '',
      city: '',
      state: '',
      pincode: '',
    };
    if (data?.officeAddress !== undefined) address.officeAddress = String(data.officeAddress).trim();
    if (data?.factoryAddress !== undefined) address.factoryAddress = String(data.factoryAddress).trim();
    if (data?.city !== undefined) address.city = String(data.city).trim();
    if (data?.state !== undefined) address.state = String(data.state).trim();
    if (data?.pincode !== undefined) address.pincode = String(data.pincode).trim();

    if (addressIndex !== -1) this.addresses[addressIndex] = address;
    else this.addresses.push(address);

    this.saveToFile();
    return { company, contact, address };
  }

  public deleteLead(companyId: string): boolean {
    this.init();
    const idx = this.companies.findIndex((c) => c.id === companyId);
    if (idx === -1) return false;

    this.companies.splice(idx, 1);
    this.contacts = this.contacts.filter((c) => c.companyId !== companyId);
    this.addresses = this.addresses.filter((a) => a.companyId !== companyId);
    this.saveToFile();
    return true;
  }

  public addImportLog(log: Omit<ImportLogRecord, 'id' | 'importDate'>): ImportLogRecord {
    this.init();
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
    this.importLogs.unshift(newLog);
    this.saveToFile();
    return newLog;
  }

  public getLogs(): ImportLogRecord[] {
    this.init();
    return [...this.importLogs].sort(
      (a, b) => new Date(b.importDate || 0).getTime() - new Date(a.importDate || 0).getTime()
    );
  }

  public getStats(): DashboardStats {
    this.init();
    const leads = this.getAllLeads();
    const logs = this.getLogs();

    const categoryMap: Record<string, number> = {};
    for (const l of leads) {
      const cat = l.company.category || 'General';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    }

    const categoryCounts = Object.entries(categoryMap).map(([category, count]) => ({
      category,
      count,
    }));

    let totalDuplicatesDetected = 0;
    let totalParsedInLogs = 0;
    for (const log of logs) {
      totalDuplicatesDetected += log.duplicates || 0;
      totalParsedInLogs += log.totalCompanies || 0;
    }

    const duplicateRate =
      totalParsedInLogs > 0 ? Math.round((totalDuplicatesDetected / totalParsedInLogs) * 100) : 0;

    const activeContacts = leads.filter(
      (l) => l.contact.contactPerson || l.contact.mobile || l.contact.email
    ).length;

    return {
      totalCompanies: leads.length,
      totalContacts: activeContacts,
      totalImports: logs.length,
      duplicateRate,
      categoryCounts,
      recentLogs: logs.slice(0, 10),
    };
  }
}

export const localFallbackStore = new LocalFallbackStore();
