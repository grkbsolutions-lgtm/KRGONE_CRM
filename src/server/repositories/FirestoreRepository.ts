import { adminDb } from '../firebase-admin';

export class FirestoreRepository {
  protected readonly companiesCol = 'companies';
  protected readonly contactsCol = 'contacts';
  protected readonly addressesCol = 'addresses';
  protected readonly importLogsCol = 'importLogs';
  protected readonly systemCol = 'system';

  protected get firestore() {
    return adminDb;
  }

  // Execute Firestore operation without fallback to local filesystem
  protected async safeExec<T>(
    op: () => Promise<T>,
    fallbackMsg: string
  ): Promise<T> {
    try {
      return await op();
    } catch (err: any) {
      console.error(`[Firestore Error] ${fallbackMsg}:`, err);
      throw new Error(`${fallbackMsg}: ${err?.message || 'Firestore connection issue'}`);
    }
  }
}
