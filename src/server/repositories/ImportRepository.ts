import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { FirestoreRepository } from './FirestoreRepository';
import { localFallbackStore } from './LocalFallbackStore';
import { ImportLogRecord } from '../../types';

export class ImportRepository extends FirestoreRepository {
  public async addImportLog(
    log: Omit<ImportLogRecord, 'id' | 'importDate'>
  ): Promise<ImportLogRecord> {
    return this.safeExec(
      async () => {
        const logId = `log_${Date.now()}`;
        const newLog: ImportLogRecord = {
          id: logId,
          importedBy: log.importedBy || 'Scanner User',
          importDate: new Date().toISOString(),
          sourceType: log.sourceType,
          totalCompanies: log.totalCompanies,
          importedCompanies: log.importedCompanies,
          duplicates: log.duplicates,
          processingTime: log.processingTime,
        };

        await setDoc(doc(this.firestore, this.importLogsCol, logId), newLog);
        localFallbackStore.addImportLog(log);
        return newLog;
      },
      'Failed to add import log',
      () => localFallbackStore.addImportLog(log)
    );
  }

  public async getLogs(): Promise<ImportLogRecord[]> {
    return this.safeExec(
      async () => {
        const snap = await getDocs(collection(this.firestore, this.importLogsCol));
        const logs: ImportLogRecord[] = [];
        snap.forEach((d) => logs.push(d.data() as ImportLogRecord));

        logs.sort((a, b) => new Date(b.importDate || 0).getTime() - new Date(a.importDate || 0).getTime());
        return logs;
      },
      'Failed to fetch import logs',
      () => localFallbackStore.getLogs()
    );
  }
}

export const importRepository = new ImportRepository();
