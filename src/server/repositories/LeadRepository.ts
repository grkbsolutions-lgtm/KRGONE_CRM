import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { FirestoreRepository } from './FirestoreRepository';
import { localFallbackStore } from './LocalFallbackStore';
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
        const companiesSnap = await getDocs(collection(this.firestore, this.companiesCol));
        const contactsSnap = await getDocs(collection(this.firestore, this.contactsCol));
        const addressesSnap = await getDocs(collection(this.firestore, this.addressesCol));

        const companies: CompanyRecord[] = [];
        companiesSnap.forEach((d) => companies.push(d.data() as CompanyRecord));

        const contacts: ContactRecord[] = [];
        contactsSnap.forEach((d) => contacts.push(d.data() as ContactRecord));

        const addresses: AddressRecord[] = [];
        addressesSnap.forEach((d) => addresses.push(d.data() as AddressRecord));

        companies.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

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
      'Failed to fetch all leads',
      () => localFallbackStore.getAllLeads()
    );
  }

  public async getLeadById(companyId: string): Promise<FullLeadRecord | null> {
    return this.safeExec(
      async () => {
        const companyDoc = await getDoc(doc(this.firestore, this.companiesCol, companyId));
        if (!companyDoc.exists()) return null;

        const company = companyDoc.data() as CompanyRecord;

        const contactsQ = query(
          collection(this.firestore, this.contactsCol),
          where('companyId', '==', companyId)
        );
        const contactsSnap = await getDocs(contactsQ);
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

        const addressesQ = query(
          collection(this.firestore, this.addressesCol),
          where('companyId', '==', companyId)
        );
        const addressesSnap = await getDocs(addressesQ);
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
      `Failed to fetch lead by ID: ${companyId}`,
      () => localFallbackStore.getLeadById(companyId)
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

        const companiesSnap = await getDocs(collection(this.firestore, this.companiesCol));
        const contactsSnap = await getDocs(collection(this.firestore, this.contactsCol));

        const companies: CompanyRecord[] = [];
        companiesSnap.forEach((d) => companies.push(d.data() as CompanyRecord));

        const contacts: ContactRecord[] = [];
        contactsSnap.forEach((d) => contacts.push(d.data() as ContactRecord));

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
      'Failed to check duplicate company',
      () => localFallbackStore.checkDuplicate(companyName, mobile, email)
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

        const batch = writeBatch(this.firestore);
        batch.set(doc(this.firestore, this.companiesCol, companyId), company);
        batch.set(doc(this.firestore, this.contactsCol, contactId), contact);
        batch.set(doc(this.firestore, this.addressesCol, addressId), address);

        await batch.commit();

        // Keep local store in sync
        localFallbackStore.saveLead(data);

        return { company, contact, address };
      },
      'Failed to save new lead',
      () => localFallbackStore.saveLead(data)
    );
  }

  public async updateLead(
    companyId: string,
    data: LeadDataInput
  ): Promise<FullLeadRecord | null> {
    return this.safeExec(
      async () => {
        const companyRef = doc(this.firestore, this.companiesCol, companyId);
        const companySnap = await getDoc(companyRef);
        if (!companySnap.exists()) return null;

        const company = companySnap.data() as CompanyRecord;

        if (data?.companyName !== undefined && data?.companyName !== null)
          company.companyName = String(data.companyName).trim();
        if (data?.category !== undefined && data?.category !== null)
          company.category = String(data.category).trim();
        if (data?.website !== undefined && data?.website !== null)
          company.website = String(data.website).trim();

        const contactsQ = query(
          collection(this.firestore, this.contactsCol),
          where('companyId', '==', companyId)
        );
        const contactsSnap = await getDocs(contactsQ);

        let contactId = `cont_${companyId}`;
        let contact: ContactRecord = {
          id: contactId,
          companyId,
          contactPerson: '',
          mobile: '',
          phone: '',
          email: '',
        };

        if (!contactsSnap.empty) {
          contactId = contactsSnap.docs[0].id;
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

        const addressesQ = query(
          collection(this.firestore, this.addressesCol),
          where('companyId', '==', companyId)
        );
        const addressesSnap = await getDocs(addressesQ);

        let addressId = `addr_${companyId}`;
        let address: AddressRecord = {
          id: addressId,
          companyId,
          officeAddress: '',
          factoryAddress: '',
          city: '',
          state: '',
          pincode: '',
        };

        if (!addressesSnap.empty) {
          addressId = addressesSnap.docs[0].id;
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

        const batch = writeBatch(this.firestore);
        batch.set(companyRef, company);
        batch.set(doc(this.firestore, this.contactsCol, contactId), contact);
        batch.set(doc(this.firestore, this.addressesCol, addressId), address);

        await batch.commit();

        localFallbackStore.updateLead(companyId, data);
        return { company, contact, address };
      },
      `Failed to update lead ${companyId}`,
      () => localFallbackStore.updateLead(companyId, data)
    );
  }

  public async deleteLead(companyId: string): Promise<boolean> {
    return this.safeExec(
      async () => {
        const companyRef = doc(this.firestore, this.companiesCol, companyId);
        const companySnap = await getDoc(companyRef);
        if (!companySnap.exists()) return false;

        const batch = writeBatch(this.firestore);
        batch.delete(companyRef);

        const contactsQ = query(
          collection(this.firestore, this.contactsCol),
          where('companyId', '==', companyId)
        );
        const contactsSnap = await getDocs(contactsQ);
        contactsSnap.forEach((d) => batch.delete(d.ref));

        const addressesQ = query(
          collection(this.firestore, this.addressesCol),
          where('companyId', '==', companyId)
        );
        const addressesSnap = await getDocs(addressesQ);
        addressesSnap.forEach((d) => batch.delete(d.ref));

        await batch.commit();
        localFallbackStore.deleteLead(companyId);
        return true;
      },
      `Failed to delete lead ${companyId}`,
      () => localFallbackStore.deleteLead(companyId)
    );
  }
}

export const leadRepository = new LeadRepository();
