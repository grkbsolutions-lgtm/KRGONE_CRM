import { FirestoreRepository } from './FirestoreRepository';
import { CompanyRecord, ContactRecord, ImportLogRecord, DashboardStats } from '../../types';

export class StatsRepository extends FirestoreRepository {
  public async getStats(): Promise<DashboardStats> {
    return this.safeExec(
      async () => {
        const companiesSnap = await this.firestore.collection(this.companiesCol).get();
        const contactsSnap = await this.firestore.collection(this.contactsCol).get();
        const logsSnap = await this.firestore.collection(this.importLogsCol).get();

        const companies: CompanyRecord[] = companiesSnap.docs.map(
          (d) => d.data() as CompanyRecord
        );
        const contacts: ContactRecord[] = contactsSnap.docs.map(
          (d) => d.data() as ContactRecord
        );
        const logs: ImportLogRecord[] = logsSnap.docs.map(
          (d) => d.data() as ImportLogRecord
        );

        logs.sort(
          (a, b) => new Date(b.importDate || 0).getTime() - new Date(a.importDate || 0).getTime()
        );

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
      'Failed to fetch dashboard stats'
    );
  }
}

export const statsRepository = new StatsRepository();
