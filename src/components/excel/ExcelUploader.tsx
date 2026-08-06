import React, { useRef } from 'react';
import { FileSpreadsheet, UploadCloud, RefreshCw, Trash2, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { ExcelWorksheetMeta } from '../../types';

interface ExcelUploaderProps {
  file: File | null;
  fileMeta: {
    fileName: string;
    fileSizeFormatted: string;
    totalRows: number;
    totalColumns: number;
    sheetCount: number;
  } | null;
  sheets: ExcelWorksheetMeta[];
  onFileSelect: (file: File) => void;
  onRemoveFile: () => void;
  error: string | null;
  isReading: boolean;
}

export const ExcelUploader: React.FC<ExcelUploaderProps> = ({
  file,
  fileMeta,
  sheets,
  onFileSelect,
  onRemoveFile,
  error,
  isReading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSelect(droppedFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelect(e.target.files[0]);
    }
  };

  const validateAndSelect = (selectedFile: File) => {
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xls', 'xlsx'].includes(ext || '')) {
      alert('Invalid file format. Please upload a CSV, XLS, or XLSX file.');
      return;
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      alert('File size exceeds the 50 MB limit.');
      return;
    }
    onFileSelect(selectedFile);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Upload Excel or CSV File</h3>
            <p className="text-xs text-slate-500">Supports .CSV, .XLS, .XLSX up to 50MB (100,000 max rows)</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
            Batch Import Ready
          </span>
        </div>
      </div>

      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/40 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-4 group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv, .xls, .xlsx"
            className="hidden"
            onChange={handleFileInput}
          />
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 group-hover:bg-emerald-200 text-emerald-600 flex items-center justify-center transition group-hover:scale-110">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-800">
              Drag & Drop your spreadsheet here, or <span className="text-emerald-600 hover:underline">Browse</span>
            </p>
            <p className="text-xs text-slate-500">
              CSV, XLS, XLSX • Max size 50 MB • Auto Column & Duplicate Detection
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs font-bold">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                  <span>{fileMeta?.fileName || file.name}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </h4>
                <p className="text-xs text-slate-500 font-mono">{fileMeta?.fileSizeFormatted}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center space-x-1 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Replace</span>
              </button>

              <button
                type="button"
                onClick={onRemoveFile}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold rounded-xl transition flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv, .xls, .xlsx"
            className="hidden"
            onChange={handleFileInput}
          />

          {/* Detailed File Meta Specs */}
          {fileMeta && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                  Total Rows
                </span>
                <span className="text-sm font-mono font-bold text-slate-900">
                  {fileMeta.totalRows.toLocaleString()}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                  Total Columns
                </span>
                <span className="text-sm font-mono font-bold text-slate-900">
                  {fileMeta.totalColumns}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                  Worksheets
                </span>
                <span className="text-sm font-mono font-bold text-slate-900">
                  {fileMeta.sheetCount}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                  Format
                </span>
                <span className="text-sm font-mono font-bold text-emerald-600 uppercase">
                  {file.name.split('.').pop()}
                </span>
              </div>
            </div>
          )}

          {isReading && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-semibold text-emerald-800 flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <span>Parsing Excel workbook & extracting headers...</span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
