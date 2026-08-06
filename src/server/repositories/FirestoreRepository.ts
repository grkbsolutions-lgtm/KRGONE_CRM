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

  // Handle Firestore operations with local store fallback on permission/connection errors
  protected async safeExec<T>(
    op: () => Promise<T>,
    fallbackMsg: string,
    fallbackOp?: () => T | Promise<T>
  ): Promise<T> {
    try {
      return await op();
    } catch (err: any) {
      if (fallbackOp) {
        return await fallbackOp();
      }
      throw new Error(`${fallbackMsg}: ${err?.message || 'Firestore connection issue'}`);
    }
  }
}
