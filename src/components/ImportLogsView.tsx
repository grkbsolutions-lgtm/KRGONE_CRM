import React from 'react';
import { History, FileText, Image as ImageIcon, Camera, Clock, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { ImportLogRecord } from '../types';

interface ImportLogsViewProps {
  logs: ImportLogRecord[];
}

export const ImportLogsView: React.FC<ImportLogsViewProps> = ({ logs }) => {
  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Import Session History & Audit Trail</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Detailed tracking of every document scan, parsed lead volume, and OCR processing duration.
            </p>
          </div>
        </div>
      </div>

      {/* Logs Table / Cards */}
      {logs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 my-8 shadow-xs">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-slate-800 font-semibold mb-1">No Import History Found</h4>
          <p className="text-xs text-slate-500">Scan and save leads to record your first session audit log.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Import Date & Time</th>
                  <th className="px-6 py-4">Source Type</th>
                  <th className="px-6 py-4">Operator</th>
                  <th className="px-6 py-4 text-center">Total Parsed</th>
                  <th className="px-6 py-4 text-center">Saved Leads</th>
                  <th className="px-6 py-4 text-center">Duplicates Shielded</th>
                  <th className="px-6 py-4 text-right">Processing Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  const getSourceIcon = () => {
                    switch (log.sourceType) {
                      case 'pdf':
                        return <FileText className="w-4 h-4 text-red-600" />;
                      case 'camera':
                        return <Camera className="w-4 h-4 text-amber-600" />;
                      default:
                        return <ImageIcon className="w-4 h-4 text-indigo-600" />;
                    }
                  };

                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-medium text-slate-900 flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(log.importDate).toLocaleString()}</span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-semibold uppercase text-[10px]">
                          {getSourceIcon()}
                          <span>{log.sourceType}</span>
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-600 font-mono">{log.importedBy || 'Scanner User'}</td>

                      <td className="px-6 py-4 text-center font-bold text-slate-800">{log.totalCompanies}</td>

                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {log.importedCompanies}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        {log.duplicates > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {log.duplicates}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">0</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right font-mono text-slate-500">
                        {(log.processingTime / 1000).toFixed(2)}s
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
