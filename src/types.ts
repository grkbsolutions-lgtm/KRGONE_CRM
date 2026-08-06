export interface ExtractedCompany {
  tempId: string;
  companyName: string;
  contactPerson: string;
  mobile: string;
  phone: string;
  email: string;
  officeAddress: string;
  factoryAddress: string;
  city: string;
  state: string;
  pincode: string;
  category: string;
  website: string;
  // Metadata for review UI
  selected?: boolean;
  duplicateStatus?: {
    isDuplicate: boolean;
    conflictType?: 'companyName' | 'mobile' | 'email' | 'multiple';
    existingCompanyId?: string;
    existingCompanyName?: string;
    matchedFields?: string[];
    action?: 'save_new' | 'update_existing' | 'skip';
  };
}

export interface CompanyRecord {
  id: string;
  companyName: string;
  category: string;
  website?: string;
  createdAt: string;
}

export interface ContactRecord {
  id: string;
  companyId: string;
  contactPerson: string;
  mobile: string;
  phone: string;
  email: string;
}

export interface AddressRecord {
  id: string;
  companyId: string;
  officeAddress: string;
  factoryAddress: string;
  city: string;
  state: string;
  pincode: string;
}

export interface FullLeadRecord {
  company: CompanyRecord;
  contact: ContactRecord;
  address: AddressRecord;
}

export interface ImportLogRecord {
  id: string;
  importedBy: string;
  importDate: string;
  sourceType: 'pdf' | 'image' | 'camera' | 'excel';
  totalCompanies: number;
  importedCompanies: number;
  duplicates: number;
  processingTime: number; // in milliseconds
}

export interface PreprocessOptions {
  rotation: number; // 0, 90, 180, 270
  contrast: number; // 100 is normal
  brightness: number; // 100 is normal
  sharpness?: number; // 0 to 100
  saturation?: number; // 100 is normal
  grayscale: boolean;
  deskew?: boolean;
  noiseRemoved?: boolean;
  textImproved?: boolean;
  cropRect?: { x: number; y: number; width: number; height: number } | null;
  scanMode?: 'current' | 'selected' | 'all';
  selectedPages?: number[];
}

export interface DocumentPage {
  id: number;
  pageNumber: number;
  thumbnailUrl?: string;
  selected: boolean;
}

export interface DocumentMeta {
  fileName: string;
  fileType: string;
  totalPages: number;
  resolution: string;
  fileSizeFormatted: string;
  uploadTime: string;
  quality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  recommendedAction?: string;
}

export interface ScanResponse {
  success: boolean;
  companies: ExtractedCompany[];
  ocrTextSummary?: string;
  processingTimeMs: number;
  error?: string;
}

export interface BatchSaveRequest {
  importedBy?: string;
  sourceType: 'pdf' | 'image' | 'camera' | 'excel';
  processingTimeMs: number;
  leads: {
    data: ExtractedCompany;
    action: 'save_new' | 'update_existing' | 'skip';
    targetCompanyId?: string;
  }[];
}

export interface ExcelWorksheetMeta {
  sheetName: string;
  rowCount: number;
  columnCount: number;
  headers: string[];
}

export type LeadFieldKey =
  | 'companyName'
  | 'contactPerson'
  | 'designation'
  | 'mobile'
  | 'phone'
  | 'email'
  | 'website'
  | 'category'
  | 'products'
  | 'officeAddress'
  | 'factoryAddress'
  | 'city'
  | 'state'
  | 'pincode'
  | 'ignore';

export interface ColumnMappingItem {
  excelHeader: string;
  targetField: LeadFieldKey;
  confidence: 'auto' | 'manual';
}

export interface ExcelValidationError {
  rowNumber: number;
  excelColumn: string;
  fieldKey: string;
  errorMessage: string;
  suggestedFix: string;
}

export interface ExcelParsedRow {
  rowNumber: number;
  rawData: Record<string, any>;
  mappedLead: ExtractedCompany;
  errors: ExcelValidationError[];
  status: 'valid' | 'warning' | 'error' | 'duplicate';
  isSelected: boolean;
}

export interface ExcelImportSummaryStats {
  rowsRead: number;
  rowsImported: number;
  duplicatesCount: number;
  errorsCount: number;
  skippedCount: number;
  processingTimeMs: number;
}

export interface DashboardStats {
  totalCompanies: number;
  totalContacts: number;
  totalImports: number;
  duplicateRate: number;
  categoryCounts: { category: string; count: number }[];
  recentLogs: ImportLogRecord[];
}
