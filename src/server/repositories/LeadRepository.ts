import { FirestoreRepository } from './FirestoreRepository';
import { CompanyRecord, ContactRecord, AddressRecord, FullLeadRecord } from '../../types';

export interface LeadDataInput {
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

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  conflictType?: 'companyName' | 'mobile' | 'email' | 'multiple';
  existingCompanyId?: string;
  existingCompanyName?: string;
  matchedFields?: string[];
}

export class LeadRepository extends FirestoreRepository {
  public async getAllLeads(): Promise<FullLeadRecord[]> {
    return this.safeExec(
      async () => {
        const companiesSnap = await this.firestore.collection(this.companiesCol).get();
        const contactsSnap = await this.firestore.collection(this.contactsCol).get();
        const addressesSnap = await this.firestore.collection(this.addressesCol).get();

        const companies: CompanyRecord[] = companiesSnap.docs.map(
          (d) => d.data() as CompanyRecord
        );
        const contacts: ContactRecord[] = contactsSnap.docs.map(
          (d) => d.data() as ContactRecord
        );
        const addresses: AddressRecord[] = addressesSnap.docs.map(
          (d) => d.data() as AddressRecord
        );

        companies.sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );

        return companies.map((company) => {
          const contact = contacts.find((c) => c.companyId === company.id) || {
            id: `cont_${company.id}`,
            companyId: company.id,
            contactPerson: '',
            mobile: '',
            phone: '',
            email: '',
          };

          const address = addresses.find((a) => a.companyId === company.id) || {
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
      },
      'Failed to fetch all leads'
    );
  }

  public async getLeadById(companyId: string): Promise<FullLeadRecord | null> {
    return this.safeExec(
      async () => {
        const companyDoc = await this.firestore
          .collection(this.companiesCol)
          .doc(companyId)
          .get();
        if (!companyDoc.exists) return null;

        const company = companyDoc.data() as CompanyRecord;

        const contactsSnap = await this.firestore
          .collection(this.contactsCol)
          .where('companyId', '==', companyId)
          .get();
        let contact: ContactRecord = {
          id: `cont_${companyId}`,
          companyId,
          contactPerson: '',
          mobile: '',
          phone: '',
          email: '',
        };
        if (!contactsSnap.empty) {
          contact = contactsSnap.docs[0].data() as ContactRecord;
        }

        const addressesSnap = await this.firestore
          .collection(this.addressesCol)
          .where('companyId', '==', companyId)
          .get();
        let address: AddressRecord = {
          id: `addr_${companyId}`,
          companyId,
          officeAddress: '',
          factoryAddress: '',
          city: '',
          state: '',
          pincode: '',
        };
        if (!addressesSnap.empty) {
          address = addressesSnap.docs[0].data() as AddressRecord;
        }

        return { company, contact, address };
      },
      `Failed to fetch lead by ID: ${companyId}`
    );
  }

  public async checkDuplicate(
    companyName: string,
    mobile: string,
    email: string
  ): Promise<DuplicateCheckResult> {
    return this.safeExec(
      async () => {
        const cleanName = companyName?.trim().toLowerCase();
        const cleanMobile = mobile?.replace(/[^0-9]/g, '');
        const cleanEmail = email?.trim().toLowerCase();

        const companiesSnap = await this.firestore.collection(this.companiesCol).get();
        const contactsSnap = await this.firestore.collection(this.contactsCol).get();

        const companies: CompanyRecord[] = companiesSnap.docs.map(
          (d) => d.data() as CompanyRecord
        );
        const contacts: ContactRecord[] = contactsSnap.docs.map(
          (d) => d.data() as ContactRecord
        );

        let conflictType: 'companyName' | 'mobile' | 'email' | 'multiple' | undefined;
        const matchedFields: string[] = [];
        let matchedCompany: CompanyRecord | undefined;

        for (const company of companies) {
          const contact = contacts.find((c) => c.companyId === company.id);

          const nameMatch = cleanName && company.companyName?.trim().toLowerCase() === cleanName;
          const contactMobileClean = contact?.mobile ? contact.mobile.replace(/[^0-9]/g, '') : '';
          const mobileMatch =
            cleanMobile &&
            cleanMobile.length >= 7 &&
            contactMobileClean.endsWith(cleanMobile.slice(-10));
          const emailMatch = cleanEmail && contact?.email?.trim().toLowerCase() === cleanEmail;

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
      },
      'Failed to check duplicate company'
    );
  }

  public async saveLead(data: LeadDataInput): Promise<FullLeadRecord> {
    return this.safeExec(
      async () => {
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

        const batch = this.firestore.batch();
        batch.set(this.firestore.collection(this.companiesCol).doc(companyId), company);
        batch.set(this.firestore.collection(this.contactsCol).doc(contactId), contact);
        batch.set(this.firestore.collection(this.addressesCol).doc(addressId), address);

        await batch.commit();

        return { company, contact, address };
      },
      'Failed to save new lead'
    );
  }

  public async updateLead(
    companyId: string,
    data: LeadDataInput
  ): Promise<FullLeadRecord | null> {
    return this.safeExec(
      async () => {
        const companyRef = this.firestore.collection(this.companiesCol).doc(companyId);
        const companySnap = await companyRef.get();
        if (!companySnap.exists) return null;

        const company = companySnap.data() as CompanyRecord;

        if (data?.companyName !== undefined && data?.companyName !== null)
          company.companyName = String(data.companyName).trim();
        if (data?.category !== undefined && data?.category !== null)
          company.category = String(data.category).trim();
        if (data?.website !== undefined && data?.website !== null)
          company.website = String(data.website).trim();

        const contactsSnap = await this.firestore
          .collection(this.contactsCol)
          .where('companyId', '==', companyId)
          .get();

        let contactRef = this.firestore.collection(this.contactsCol).doc(`cont_${companyId}`);
        let contact: ContactRecord = {
          id: `cont_${companyId}`,
          companyId,
          contactPerson: '',
          mobile: '',
          phone: '',
          email: '',
        };

        if (!contactsSnap.empty) {
          contactRef = contactsSnap.docs[0].ref;
          contact = contactsSnap.docs[0].data() as ContactRecord;
        }

        if (data?.contactPerson !== undefined && data?.contactPerson !== null)
          contact.contactPerson = String(data.contactPerson).trim();
        if (data?.mobile !== undefined && data?.mobile !== null)
          contact.mobile = String(data.mobile).trim();
        if (data?.phone !== undefined && data?.phone !== null)
          contact.phone = String(data.phone).trim();
        if (data?.email !== undefined && data?.email !== null)
          contact.email = String(data.email).trim();

        const addressesSnap = await this.firestore
          .collection(this.addressesCol)
          .where('companyId', '==', companyId)
          .get();

        let addressRef = this.firestore.collection(this.addressesCol).doc(`addr_${companyId}`);
        let address: AddressRecord = {
          id: `addr_${companyId}`,
          companyId,
          officeAddress: '',
          factoryAddress: '',
          city: '',
          state: '',
          pincode: '',
        };

        if (!addressesSnap.empty) {
          addressRef = addressesSnap.docs[0].ref;
          address = addressesSnap.docs[0].data() as AddressRecord;
        }

        if (data?.officeAddress !== undefined && data?.officeAddress !== null)
          address.officeAddress = String(data.officeAddress).trim();
        if (data?.factoryAddress !== undefined && data?.factoryAddress !== null)
          address.factoryAddress = String(data.factoryAddress).trim();
        if (data?.city !== undefined && data?.city !== null)
          address.city = String(data.city).trim();
        if (data?.state !== undefined && data?.state !== null)
          address.state = String(data.state).trim();
        if (data?.pincode !== undefined && data?.pincode !== null)
          address.pincode = String(data.pincode).trim();

        const batch = this.firestore.batch();
        batch.set(companyRef, company);
        batch.set(contactRef, contact);
        batch.set(addressRef, address);

        await batch.commit();

        return { company, contact, address };
      },
      `Failed to update lead ${companyId}`
    );
  }

  public async deleteLead(companyId: string): Promise<boolean> {
    return this.safeExec(
      async () => {
        const companyRef = this.firestore.collection(this.companiesCol).doc(companyId);
        const companySnap = await companyRef.get();
        if (!companySnap.exists) return false;

        const batch = this.firestore.batch();
        batch.delete(companyRef);

        const contactsSnap = await this.firestore
          .collection(this.contactsCol)
          .where('companyId', '==', companyId)
          .get();
        contactsSnap.forEach((d) => batch.delete(d.ref));

        const addressesSnap = await this.firestore
          .collection(this.addressesCol)
          .where('companyId', '==', companyId)
          .get();
        addressesSnap.forEach((d) => batch.delete(d.ref));

        await batch.commit();
        return true;
      },
      `Failed to delete lead ${companyId}`
    );
  }
}

export const leadRepository = new LeadRepository();
