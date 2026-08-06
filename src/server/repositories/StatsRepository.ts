import { collection, getDocs } from 'firebase/firestore';
import { FirestoreRepository } from './FirestoreRepository';
import { localFallbackStore } from './LocalFallbackStore';
import { CompanyRecord, ContactRecord, ImportLogRecord, DashboardStats } from '../../types';

export class StatsRepository extends FirestoreRepository {
  public async getStats(): Promise<DashboardStats> {
    return this.safeExec(
      async () => {
        const companiesSnap = await getDocs(collection(this.firestore, this.companiesCol));
        const contactsSnap = await getDocs(collection(this.firestore, this.contactsCol));
        const logsSnap = await getDocs(collection(this.firestore, this.importLogsCol));

        const companies: CompanyRecord[] = [];
        companiesSnap.forEach((d) => companies.push(d.data() as CompanyRecord));

        const contacts: ContactRecord[] = [];
        contactsSnap.forEach((d) => contacts.push(d.data() as ContactRecord));

        const logs: ImportLogRecord[] = [];
        logsSnap.forEach((d) => logs.push(d.data() as ImportLogRecord));

        logs.sort((a, b) => new Date(b.importDate || 0).getTime() - new Date(a.importDate || 0).getTime());

        const categoryMap: Record<string, number> = {};
        for (const company of companies) {
          const cat = company.category || 'General';
          categoryMap[cat] = (categoryMap[cat] || 0) + 1;
        }

        const categoryCounts = Object.entries(categoryMap).map(([category, count]) => ({
          category,
          count,
        }));

        const totalImports = logs.length;
        let totalDuplicatesDetected = 0;
        let totalParsedInLogs = 0;

        for (const log of logs) {
          totalDuplicatesDetected += log.duplicates || 0;
          totalParsedInLogs += log.totalCompanies || 0;
        }

        const duplicateRate =
          totalParsedInLogs > 0 ? Math.round((totalDuplicatesDetected / totalParsedInLogs) * 100) : 0;

        const activeContacts = contacts.filter((c) => c.contactPerson || c.mobile || c.email).length;

        return {
          totalCompanies: companies.length,
          totalContacts: activeContacts,
          totalImports,
          duplicateRate,
          categoryCounts,
          recentLogs: logs.slice(0, 10),
        };
      },
      'Failed to fetch dashboard stats',
      () => localFallbackStore.getStats()
    );
  }
}

export const statsRepository = new StatsRepository();
