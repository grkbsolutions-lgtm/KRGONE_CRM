import React from 'react';
import { CheckSquare, Square, Trash2, FileText, Layers } from 'lucide-react';
import { DocumentPage } from '../../types';

interface PageSelectorProps {
  pages: DocumentPage[];
  activePageIndex: number;
  scanMode: 'current' | 'selected' | 'all';
  onScanModeChange: (mode: 'current' | 'selected' | 'all') => void;
  onSelectAllPages: () => void;
  onDeselectAllPages: () => void;
  onDeleteSelectedPages: () => void;
  onTogglePageSelect: (pageNumber: number) => void;
  onActivePageChange: (index: number) => void;
}

export const PageSelector: React.FC<PageSelectorProps> = ({
  pages,
  activePageIndex,
  scanMode,
  onScanModeChange,
  onSelectAllPages,
  onDeselectAllPages,
  onDeleteSelectedPages,
  onTogglePageSelect,
  onActivePageChange,
}) => {
  const selectedCount = pages.filter((p) => p.selected).length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">PDF Page Selection</h3>
            <p className="text-[11px] text-slate-500">{pages.length} Pages Available</p>
          </div>
        </div>

        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-bold">
          {selectedCount} Selected
        </span>
      </div>

      {/* Target Scan Scope Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700">Scan Scope Option</label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => onScanModeChange('current')}
            className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg transition ${
              scanMode === 'current'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Current Page
          </button>
          <button
            type="button"
            onClick={() => onScanModeChange('selected')}
            className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg transition ${
              scanMode === 'selected'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Selected ({selectedCount})
          </button>
          <button
            type="button"
            onClick={() => onScanModeChange('all')}
            className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg transition ${
              scanMode === 'all'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Pages
          </button>
        </div>
      </div>

      {/* Action Buttons: Select All, Deselect All, Delete Selected */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onSelectAllPages}
            className="flex items-center space-x-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium rounded-lg transition"
          >
            <CheckSquare className="w-3 h-3 text-blue-600" />
            <span>Select All</span>
          </button>

          <button
            type="button"
            onClick={onDeselectAllPages}
            className="flex items-center space-x-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium rounded-lg transition"
          >
            <Square className="w-3 h-3 text-slate-500" />
            <span>Deselect All</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onDeleteSelectedPages}
          disabled={selectedCount === 0 || pages.length <= 1}
          className="flex items-center space-x-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-medium rounded-lg transition disabled:opacity-40"
          title="Remove selected pages from document preview"
        >
          <Trash2 className="w-3 h-3" />
          <span>Delete</span>
        </button>
      </div>

      {/* Pages Thumbnail Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
        {pages.map((p, idx) => (
          <div
            key={p.id}
            onClick={() => onActivePageChange(idx)}
            className={`relative rounded-lg p-2 border cursor-pointer transition flex flex-col items-center justify-between text-center ${
              activePageIndex === idx
                ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            {/* Checkbox */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePageSelect(p.pageNumber);
              }}
              className="absolute top-1 right-1 p-0.5 rounded text-blue-600 hover:bg-blue-100"
            >
              {p.selected ? (
                <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            <FileText className={`w-6 h-6 my-1 ${activePageIndex === idx ? 'text-blue-600' : 'text-slate-400'}`} />
            <span className="text-[10px] font-mono font-medium text-slate-700">
              Page {p.pageNumber}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
