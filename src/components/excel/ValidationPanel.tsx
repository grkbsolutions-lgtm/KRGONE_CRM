import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, Copy, Trash2, Info } from 'lucide-react';
import { ExcelParsedRow } from '../../types';

interface ValidationPanelProps {
  parsedRows: ExcelParsedRow[];
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({ parsedRows }) => {
  const totalRows = parsedRows.length;
  const validRows = parsedRows.filter((r) => r.status === 'valid').length;
  const duplicateRows = parsedRows.filter((r) => r.status === 'duplicate').length;
  const errorRows = parsedRows.filter((r) => r.status === 'error').length;
  const warningRows = parsedRows.filter((r) => r.status === 'warning').length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
            <ShieldCheck className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Data Validation & Quality Check</h3>
            <p className="text-[11px] text-slate-500">Validation scan across {totalRows.toLocaleString()} rows</p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold px-2.5 py-1 bg-slate-100 rounded-md text-slate-700">
          {validRows} / {totalRows} Ready
        </span>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl">
          <span className="block text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Valid Leads</span>
          <span className="text-base font-mono font-bold text-emerald-900">{validRows.toLocaleString()}</span>
        </div>

        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl">
          <span className="block text-[10px] font-bold text-amber-800 uppercase tracking-wider">Duplicates</span>
          <span className="text-base font-mono font-bold text-amber-900">{duplicateRows.toLocaleString()}</span>
        </div>

        <div className="p-3 bg-red-50/80 border border-red-200 rounded-xl">
          <span className="block text-[10px] font-bold text-red-800 uppercase tracking-wider">Missing Required</span>
          <span className="text-base font-mono font-bold text-red-900">{errorRows.toLocaleString()}</span>
        </div>

        <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl">
          <span className="block text-[10px] font-bold text-indigo-800 uppercase tracking-wider">Format Warnings</span>
          <span className="text-base font-mono font-bold text-indigo-900">{warningRows.toLocaleString()}</span>
        </div>
      </div>

      {/* Rules Check Summary */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
        <div className="font-semibold text-slate-800 flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5 text-blue-600" />
          <span>Automated Validation Rules Checked:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Company Name presence check</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Email format syntax check</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mobile phone length & digits check</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>In-file & Database duplicate detection</span>
          </div>
        </div>
      </div>
    </div>
  );
};
