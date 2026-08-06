import React from 'react';
import { Download, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { ExcelParsedRow, ExcelValidationError } from '../../types';

interface ErrorExporterProps {
  parsedRows: ExcelParsedRow[];
}

export const ErrorExporter: React.FC<ErrorExporterProps> = ({ parsedRows }) => {
  // Collect all validation errors across rows
  const allErrors: {
    'Row Number': number;
    'Column Header': string;
    'Field': string;
    'Error Details': string;
    'Suggested Fix': string;
  }[] = [];

  parsedRows.forEach((row) => {
    if (row.errors && row.errors.length > 0) {
      row.errors.forEach((err) => {
        allErrors.push({
          'Row Number': err.rowNumber,
          'Column Header': err.excelColumn || '—',
          'Field': err.fieldKey,
          'Error Details': err.errorMessage,
          'Suggested Fix': err.suggestedFix,
        });
      });
    } else if (row.status === 'duplicate') {
      allErrors.push({
        'Row Number': row.rowNumber,
        'Column Header': 'Company Name / Mobile',
        'Field': 'companyName',
        'Error Details': 'Duplicate lead detected in database or inside spreadsheet',
        'Suggested Fix': 'Review lead data before importing or choose update existing option in review queue',
      });
    }
  });

  if (allErrors.length === 0) return null;

  const handleExportErrors = () => {
    const ws = XLSX.utils.json_to_sheet(allErrors);

    // Auto fit column widths
    const wscols = [
      { wch: 12 },
      { wch: 20 },
      { wch: 18 },
      { wch: 45 },
      { wch: 45 },
    ];
    ws['!cols'] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Import_Errors');
    XLSX.writeFile(wb, 'ImportErrors.xlsx');
  };

  return (
    <div className="bg-red-50/80 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-center space-x-2.5">
        <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold flex-shrink-0">
          <AlertCircle className="w-4.5 h-4.5" />
        </div>
        <div>
          <h4 className="font-bold text-red-900">
            Detected {allErrors.length} Issue{allErrors.length > 1 ? 's' : ''} in Spreadsheet
          </h4>
          <p className="text-red-700 text-[11px]">
            You can download a detailed error report with row numbers & suggested fixes to fix in Excel.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleExportErrors}
        className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5 flex-shrink-0"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Download ImportErrors.xlsx</span>
      </button>
    </div>
  );
};
