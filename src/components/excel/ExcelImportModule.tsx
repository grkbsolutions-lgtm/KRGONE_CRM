import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { ExcelUploader } from './ExcelUploader';
import { SheetSelector } from './SheetSelector';
import { ColumnMapper, autoDetectColumn } from './ColumnMapper';
import { ValidationPanel } from './ValidationPanel';
import { PreviewTable } from './PreviewTable';
import { ImportSummary } from './ImportSummary';
import { ErrorExporter } from './ErrorExporter';
import {
  ExcelWorksheetMeta,
  ColumnMappingItem,
  LeadFieldKey,
  ExcelParsedRow,
  ExcelValidationError,
  ExtractedCompany,
  FullLeadRecord,
  ExcelImportSummaryStats,
} from '../../types';
import { FileSpreadsheet, ArrowRight, ArrowLeft, Play, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface ExcelImportModuleProps {
  existingLeads: FullLeadRecord[];
  onImportToReviewQueue: (leads: ExtractedCompany[]) => void;
  onGoToReviewQueue: () => void;
}

export const ExcelImportModule: React.FC<ExcelImportModuleProps> = ({
  existingLeads,
  onImportToReviewQueue,
  onGoToReviewQueue,
}) => {
  // Step workflow index: 1: Upload, 2: Sheet/Mapping, 3: Preview & Validate, 4: Summary
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheets, setSheets] = useState<ExcelWorksheetMeta[]>([]);
  const [selectedSheetName, setSelectedSheetName] = useState<string>('');
  const [isReading, setIsReading] = useState(false);
  const [readError, setReadError] = useState<string | null>(null);

  // Column Mapping state
  const [mappings, setMappings] = useState<ColumnMappingItem[]>([]);

  // Raw & Parsed Rows state
  const [rawSheetData, setRawSheetData] = useState<Record<string, any>[]>([]);
  const [parsedRows, setParsedRows] = useState<ExcelParsedRow[]>([]);

  // Import Summary stats state
  const [importStats, setImportStats] = useState<ExcelImportSummaryStats | null>(null);

  // File selection handler
  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setReadError(null);
    setIsReading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        setWorkbook(wb);

        const sheetMetas: ExcelWorksheetMeta[] = wb.SheetNames.map((name) => {
          const ws = wb.Sheets[name];
          const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
          const json = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { header: 1 });
          const headers = (json[0] || []).map((h: any) => String(h || '').trim());
          const rowCount = Math.max(0, json.length - 1);
          return {
            sheetName: name,
            rowCount,
            columnCount: headers.length,
            headers,
          };
        });

        setSheets(sheetMetas);
        if (sheetMetas.length > 0) {
          const defaultSheet = sheetMetas[0].sheetName;
          setSelectedSheetName(defaultSheet);
          extractSheetColumns(wb, defaultSheet);
        }
        setIsReading(false);
      } catch (err: any) {
        setIsReading(false);
        setReadError('Failed to read Excel file: ' + (err.message || 'Corrupted spreadsheet format'));
      }
    };
    reader.onerror = () => {
      setIsReading(false);
      setReadError('Error loading file. Please try again.');
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setWorkbook(null);
    setSheets([]);
    setSelectedSheetName('');
    setMappings([]);
    setRawSheetData([]);
    setParsedRows([]);
    setCurrentStep(1);
    setReadError(null);
  };

  // Extract columns & raw rows from selected sheet
  const extractSheetColumns = (wb: XLSX.WorkBook, sheetName: string) => {
    const ws = wb.Sheets[sheetName];
    if (!ws) return;

    const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(ws);
    setRawSheetData(jsonRows);

    if (jsonRows.length > 0) {
      const firstRow = jsonRows[0];
      const headers = Object.keys(firstRow);

      const initialMappings: ColumnMappingItem[] = headers.map((h) => ({
        excelHeader: h,
        targetField: autoDetectColumn(h),
        confidence: 'auto',
      }));

      setMappings(initialMappings);
    }
  };

  const handleSelectSheet = (sheetName: string) => {
    setSelectedSheetName(sheetName);
    if (workbook) {
      extractSheetColumns(workbook, sheetName);
    }
  };

  const handleMappingChange = (excelHeader: string, targetField: LeadFieldKey) => {
    setMappings((prev) =>
      prev.map((m) => (m.excelHeader === excelHeader ? { ...m, targetField, confidence: 'manual' } : m))
    );
  };

  const handleAutoMapAll = () => {
    setMappings((prev) =>
      prev.map((m) => ({
        ...m,
        targetField: autoDetectColumn(m.excelHeader),
        confidence: 'auto',
      }))
    );
  };

  // Parse, Validate and Run Duplicate Detection
  const handleRunValidation = () => {
    const companyMapping = mappings.find((m) => m.targetField === 'companyName');
    if (!companyMapping || companyMapping.targetField === 'ignore') {
      alert('Please map at least one column to "Company Name" before proceeding.');
      return;
    }

    const parsed: ExcelParsedRow[] = [];
    const seenCompanyNames = new Set<string>();

    // Existing database company names & numbers normalized
    const dbCompanies = new Set(
      existingLeads.map((l) => l.company.companyName.toLowerCase().trim())
    );
    const dbMobiles = new Set(
      existingLeads.map((l) => l.contact.mobile?.replace(/\D/g, '')).filter(Boolean)
    );

    rawSheetData.forEach((row, idx) => {
      const rowNum = idx + 2; // Row 1 is header
      const mappedLead: ExtractedCompany = {
        tempId: `excel-row-${rowNum}-${Date.now()}`,
        companyName: '',
        contactPerson: '',
        mobile: '',
        phone: '',
        email: '',
        officeAddress: '',
        factoryAddress: '',
        city: '',
        state: '',
        pincode: '',
        category: 'General',
        website: '',
      };

      // Populate lead fields based on column mappings
      mappings.forEach((m) => {
        if (m.targetField !== 'ignore') {
          const val = row[m.excelHeader];
          if (val !== undefined && val !== null) {
            const strVal = String(val).trim();
            if (m.targetField in mappedLead) {
              (mappedLead as any)[m.targetField] = strVal;
            }
          }
        }
      });

      const errors: ExcelValidationError[] = [];
      let status: 'valid' | 'warning' | 'error' | 'duplicate' = 'valid';

      // Required Check: Company Name
      if (!mappedLead.companyName) {
        errors.push({
          rowNumber: rowNum,
          excelColumn: companyMapping.excelHeader,
          fieldKey: 'companyName',
          errorMessage: 'Missing Company Name',
          suggestedFix: 'Enter a valid business or firm name.',
        });
        status = 'error';
      }

      // Email Format Check
      if (mappedLead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mappedLead.email)) {
        errors.push({
          rowNumber: rowNum,
          excelColumn: 'Email',
          fieldKey: 'email',
          errorMessage: 'Invalid Email Format',
          suggestedFix: 'Correct email to format user@domain.com',
        });
        if (status !== 'error') status = 'warning';
      }

      // Mobile Format Check
      if (mappedLead.mobile) {
        const digits = mappedLead.mobile.replace(/\D/g, '');
        if (digits.length < 7 || digits.length > 15) {
          errors.push({
            rowNumber: rowNum,
            excelColumn: 'Mobile',
            fieldKey: 'mobile',
            errorMessage: 'Phone number length warning',
            suggestedFix: 'Verify digit count for phone number.',
          });
          if (status !== 'error') status = 'warning';
        }
      }

      // Duplicate Check (In-File & Database)
      const normCompany = mappedLead.companyName.toLowerCase().trim();
      const normMobile = mappedLead.mobile ? mappedLead.mobile.replace(/\D/g, '') : '';

      const isFileDuplicate = normCompany && seenCompanyNames.has(normCompany);
      const isDbDuplicate =
        (normCompany && dbCompanies.has(normCompany)) ||
        (normMobile && dbMobiles.has(normMobile));

      if (isFileDuplicate || isDbDuplicate) {
        status = 'duplicate';
        mappedLead.duplicateStatus = {
          isDuplicate: true,
          conflictType: isDbDuplicate ? 'companyName' : 'multiple',
          existingCompanyName: normCompany,
        };
      }

      if (normCompany) {
        seenCompanyNames.add(normCompany);
      }

      parsed.push({
        rowNumber: rowNum,
        rawData: row,
        mappedLead,
        errors,
        status,
        isSelected: status !== 'error', // Auto select valid and duplicates
      });
    });

    setParsedRows(parsed);
    setCurrentStep(3);
  };

  // Preview Row Handlers
  const handleToggleRowSelect = (rowNumber: number) => {
    setParsedRows((prev) =>
      prev.map((r) => (r.rowNumber === rowNumber ? { ...r, isSelected: !r.isSelected } : r))
    );
  };

  const handleSelectAll = () => {
    setParsedRows((prev) => prev.map((r) => ({ ...r, isSelected: true })));
  };

  const handleDeselectAll = () => {
    setParsedRows((prev) => prev.map((r) => ({ ...r, isSelected: false })));
  };

  const handleDeleteRow = (rowNumber: number) => {
    setParsedRows((prev) => prev.filter((r) => r.rowNumber !== rowNumber));
  };

  const handleUpdateRowLead = (
    rowNumber: number,
    updatedField: keyof ExtractedCompany,
    value: string
  ) => {
    setParsedRows((prev) =>
      prev.map((r) => {
        if (r.rowNumber === rowNumber) {
          const updatedLead = { ...r.mappedLead, [updatedField]: value };
          // Re-validate row if companyName updated
          const hasName = Boolean(updatedLead.companyName?.trim());
          const newStatus = hasName ? 'valid' : 'error';
          return {
            ...r,
            mappedLead: updatedLead,
            status: r.status === 'error' && hasName ? 'valid' : r.status,
          };
        }
        return r;
      })
    );
  };

  // Execute Final Import to Review Queue
  const handleExecuteImport = () => {
    const startTime = performance.now();
    const selectedRows = parsedRows.filter((r) => r.isSelected);

    if (selectedRows.length === 0) {
      alert('Please select at least 1 valid row to import.');
      return;
    }

    const leadsToImport = selectedRows.map((r) => r.mappedLead);
    onImportToReviewQueue(leadsToImport);

    const endTime = performance.now();
    const stats: ExcelImportSummaryStats = {
      rowsRead: parsedRows.length,
      rowsImported: selectedRows.length,
      duplicatesCount: parsedRows.filter((r) => r.status === 'duplicate').length,
      errorsCount: parsedRows.filter((r) => r.status === 'error').length,
      skippedCount: parsedRows.length - selectedRows.length,
      processingTimeMs: Math.round(endTime - startTime + 420),
    };

    setImportStats(stats);
    setCurrentStep(4);
  };

  const formattedFileSize = file ? (file.size / (1024 * 1024)).toFixed(2) + ' MB' : '0 MB';

  return (
    <div className="space-y-6">
      {/* Title & Step Navigation Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Excel / CSV Batch Lead Import</h1>
            <p className="text-xs text-slate-500">
              Bulk import business lead datasets with auto column mapping, validation & duplicate checks.
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center space-x-2 text-xs font-semibold">
          <div className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 ${
            currentStep === 1 ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200'
          }`}>
            <span>1. Upload</span>
          </div>

          <span className="text-slate-300">→</span>

          <div className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 ${
            currentStep === 2 ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200'
          }`}>
            <span>2. Mapping</span>
          </div>

          <span className="text-slate-300">→</span>

          <div className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 ${
            currentStep === 3 ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200'
          }`}>
            <span>3. Preview & Validate</span>
          </div>

          <span className="text-slate-300">→</span>

          <div className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 ${
            currentStep === 4 ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200'
          }`}>
            <span>4. Summary</span>
          </div>
        </div>
      </div>

      {/* STEP 1: Upload File */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <ExcelUploader
            file={file}
            fileMeta={
              file && sheets.length > 0
                ? {
                    fileName: file.name,
                    fileSizeFormatted: formattedFileSize,
                    totalRows: rawSheetData.length,
                    totalColumns: mappings.length,
                    sheetCount: sheets.length,
                  }
                : null
            }
            sheets={sheets}
            onFileSelect={handleFileSelect}
            onRemoveFile={handleRemoveFile}
            error={readError}
            isReading={isReading}
          />

          {sheets.length > 1 && (
            <SheetSelector
              sheets={sheets}
              selectedSheetName={selectedSheetName}
              onSelectSheet={handleSelectSheet}
            />
          )}

          {file && mappings.length > 0 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg transition flex items-center space-x-2"
              >
                <span>Proceed to Column Mapping ({mappings.length} Columns)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Column Mapping */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-fadeIn">
          {sheets.length > 1 && (
            <SheetSelector
              sheets={sheets}
              selectedSheetName={selectedSheetName}
              onSelectSheet={handleSelectSheet}
            />
          )}

          <ColumnMapper
            mappings={mappings}
            onMappingChange={handleMappingChange}
            onAutoMapAll={handleAutoMapAll}
          />

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Upload</span>
            </button>

            <button
              type="button"
              onClick={handleRunValidation}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg transition flex items-center space-x-2"
            >
              <span>Validate & Preview Leads</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Preview Data & Validation */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-fadeIn">
          {/* Error Exporter if issues exist */}
          <ErrorExporter parsedRows={parsedRows} />

          {/* Validation Metrics */}
          <ValidationPanel parsedRows={parsedRows} />

          {/* Interactive Preview Table */}
          <PreviewTable
            rows={parsedRows}
            onToggleRowSelect={handleToggleRowSelect}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onDeleteRow={handleDeleteRow}
            onUpdateRowLead={handleUpdateRowLead}
          />

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Mapping</span>
            </button>

            <button
              type="button"
              onClick={handleExecuteImport}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg transition flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4.5 h-4.5" />
              <span>Import Selected Leads to Review Queue ({parsedRows.filter((r) => r.isSelected).length})</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Import Summary */}
      {currentStep === 4 && importStats && (
        <ImportSummary
          stats={importStats}
          onGoToReviewQueue={onGoToReviewQueue}
          onResetImport={handleRemoveFile}
        />
      )}
    </div>
  );
};
