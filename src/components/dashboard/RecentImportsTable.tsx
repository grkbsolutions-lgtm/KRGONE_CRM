import React from 'react';
import { FileText, Image as ImageIcon, Camera, CheckCircle, AlertTriangle, ArrowRight, Eye, RefreshCw } from 'lucide-react';
import { ImportLogRecord } from '../../types';

interface RecentImportsTableProps {
  logs: ImportLogRecord[];
  onViewAllLogs: () => void;
}

export const RecentImportsTable: React.FC<RecentImportsTableProps> = ({ logs, onViewAllLogs }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Table Header Bar */}
      <div className="p-5 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Recent Import Activity</h3>
          <p className="text-xs text-slate-500 mt-0.5">Audit log of latest scan sessions and parsed company leads.</p>
        </div>

        <button
          onClick={onViewAllLogs}
          className="flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
        >
          <span>View All Logs</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="px-5 py-3.5">Date</th>
              <th className="px-5 py-3.5">Source Type</th>
              <th className="px-5 py-3.5 text-center">Companies Found</th>
              <th className="px-5 py-3.5 text-center">Imported</th>
              <th className="px-5 py-3.5 text-center">Duplicates</th>
              <th className="px-5 py-3.5 text-center">Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.slice(0, 5).map((log) => {
              const getSourceIcon = () => {
                switch (log.sourceType) {
                  case 'pdf':
                    return <FileText className="w-3.5 h-3.5 text-red-600" />;
                  case 'camera':
                    return <Camera className="w-3.5 h-3.5 text-amber-600" />;
                  default:
                    return <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />;
                }
              };

              return (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3.5 font-medium text-slate-900 whitespace-nowrap">
                    {new Date(log.importDate).toLocaleString(undefined, {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </td>

                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-semibold uppercase text-[10px]">
                      {getSourceIcon()}
                      <span>{log.sourceType}</span>
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-center font-bold text-slate-800">
                    {log.totalCompanies}
                  </td>

                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {log.importedCompanies}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                    {log.duplicates > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[11px]">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {log.duplicates}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono">0</span>
                    )}
                  </td>

                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      Completed
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={onViewAllLogs}
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
