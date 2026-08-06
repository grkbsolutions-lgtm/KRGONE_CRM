import { leadRepository, LeadDataInput } from './repositories/LeadRepository';
import { importRepository } from './repositories/ImportRepository';
import { statsRepository } from './repositories/StatsRepository';
import { checkAndRunMigration } from './migration';
import { FullLeadRecord, ImportLogRecord, DashboardStats } from '../types';

export class DatabaseFacade {
  private async ensureInitialized() {
    await checkAndRunMigration();
  }

  public async getAllLeads(): Promise<FullLeadRecord[]> {
    await this.ensureInitialized();
    return await leadRepository.getAllLeads();
  }

  public async getLeadById(companyId: string): Promise<FullLeadRecord | null> {
    await this.ensureInitialized();
    return await leadRepository.getLeadById(companyId);
  }

  public async checkDuplicate(companyName: string, mobile: string, email: string) {
    await this.ensureInitialized();
    return await leadRepository.checkDuplicate(companyName, mobile, email);
  }

  public async saveLead(data: LeadDataInput): Promise<FullLeadRecord> {
    await this.ensureInitialized();
    return await leadRepository.saveLead(data);
  }

  public async updateLead(companyId: string, data: LeadDataInput): Promise<FullLeadRecord | null> {
    await this.ensureInitialized();
    return await leadRepository.updateLead(companyId, data);
  }

  public async deleteLead(companyId: string): Promise<boolean> {
    await this.ensureInitialized();
    return await leadRepository.deleteLead(companyId);
  }

  public async addImportLog(log: Omit<ImportLogRecord, 'id' | 'importDate'>): Promise<ImportLogRecord> {
    await this.ensureInitialized();
    return await importRepository.addImportLog(log);
  }

  public async getStats(): Promise<DashboardStats> {
    await this.ensureInitialized();
    return await statsRepository.getStats();
  }

  public async getLogs(): Promise<ImportLogRecord[]> {
    await this.ensureInitialized();
    return await importRepository.getLogs();
  }
}

export const db = new DatabaseFacade();
