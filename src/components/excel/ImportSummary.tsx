import React from 'react';
import { CheckCircle2, Clock, Copy, AlertTriangle, Layers, ArrowRight, ShieldCheck } from 'lucide-react';
import { ExcelImportSummaryStats } from '../../types';

interface ImportSummaryProps {
  stats: ExcelImportSummaryStats;
  onGoToReviewQueue: () => void;
  onResetImport: () => void;
}

export const ImportSummary: React.FC<ImportSummaryProps> = ({
  stats,
  onGoToReviewQueue,
  onResetImport,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl max-w-3xl mx-auto space-y-6 text-center animate-fadeIn">
      {/* Icon Badge */}
      <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900">Excel Import Completed Successfully!</h2>
        <p className="text-sm text-slate-500">
          Selected leads were processed, checked for duplicates, and sent to the Review Queue.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-left pt-2">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
          <div className="flex items-center space-x-1.5 text-slate-500 text-xs font-semibold">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Total Rows Read</span>
          </div>
          <span className="text-2xl font-mono font-bold text-slate-900 block">
            {stats.rowsRead.toLocaleString()}
          </span>
        </div>

        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
          <div className="flex items-center space-x-1.5 text-emerald-700 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Sent to Review Queue</span>
          </div>
          <span className="text-2xl font-mono font-bold text-emerald-900 block">
            {stats.rowsImported.toLocaleString()}
          </span>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
          <div className="flex items-center space-x-1.5 text-amber-700 text-xs font-semibold">
            <Copy className="w-4 h-4 text-amber-600" />
            <span>Duplicates Handled</span>
          </div>
          <span className="text-2xl font-mono font-bold text-amber-900 block">
            {stats.duplicatesCount.toLocaleString()}
          </span>
        </div>

        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-1">
          <div className="flex items-center space-x-1.5 text-red-700 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>Errors / Invalid</span>
          </div>
          <span className="text-2xl font-mono font-bold text-red-900 block">
            {stats.errorsCount.toLocaleString()}
          </span>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
          <div className="flex items-center space-x-1.5 text-slate-500 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>Skipped Rows</span>
          </div>
          <span className="text-2xl font-mono font-bold text-slate-700 block">
            {stats.skippedCount.toLocaleString()}
          </span>
        </div>

        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-1">
          <div className="flex items-center space-x-1.5 text-indigo-700 text-xs font-semibold">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Processing Speed</span>
          </div>
          <span className="text-2xl font-mono font-bold text-indigo-900 block">
            {(stats.processingTimeMs / 1000).toFixed(2)}s
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <button
          type="button"
          onClick={onGoToReviewQueue}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
        >
          <span>Open Review Queue ({stats.rowsImported})</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onResetImport}
          className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition"
        >
          Import Another File
        </button>
      </div>
    </div>
  );
};
