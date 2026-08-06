import React from 'react';
import { FileText, Image as ImageIcon, Calendar, HardDrive, Maximize, Layers } from 'lucide-react';
import { DocumentMeta } from '../../types';

interface DocumentInfoProps {
  meta: DocumentMeta;
}

export const DocumentInfo: React.FC<DocumentInfoProps> = ({ meta }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
      {/* Title Header */}
      <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5">
        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
          {meta.fileType.includes('pdf') ? (
            <FileText className="w-4 h-4 text-red-600" />
          ) : (
            <ImageIcon className="w-4 h-4 text-blue-600" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-slate-900 truncate" title={meta.fileName}>
            {meta.fileName}
          </h4>
          <span className="text-[10px] text-slate-500 font-mono uppercase">{meta.fileType}</span>
        </div>
      </div>

      {/* Grid of Attributes */}
      <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-600 pt-1">
        <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
          <Layers className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
          <div>
            <span className="block text-[10px] text-slate-400 font-medium">Pages</span>
            <span className="font-semibold text-slate-800">{meta.totalPages} Page(s)</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
          <Maximize className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <div>
            <span className="block text-[10px] text-slate-400 font-medium">Resolution</span>
            <span className="font-semibold text-slate-800">{meta.resolution}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
          <HardDrive className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          <div>
            <span className="block text-[10px] text-slate-400 font-medium">File Size</span>
            <span className="font-semibold text-slate-800">{meta.fileSizeFormatted}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
          <Calendar className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
          <div>
            <span className="block text-[10px] text-slate-400 font-medium">Upload Time</span>
            <span className="font-semibold text-slate-800">{meta.uploadTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
