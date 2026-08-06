import React from 'react';
import { Layers, FileSpreadsheet, Check } from 'lucide-react';
import { ExcelWorksheetMeta } from '../../types';

interface SheetSelectorProps {
  sheets: ExcelWorksheetMeta[];
  selectedSheetName: string;
  onSelectSheet: (sheetName: string) => void;
}

export const SheetSelector: React.FC<SheetSelectorProps> = ({
  sheets,
  selectedSheetName,
  onSelectSheet,
}) => {
  if (sheets.length <= 1) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
      <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
          <Layers className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Select Worksheet</h3>
          <p className="text-[11px] text-slate-500">This workbook contains {sheets.length} sheets. Choose one to import.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {sheets.map((sheet) => {
          const isSelected = sheet.sheetName === selectedSheetName;
          return (
            <div
              key={sheet.sheetName}
              onClick={() => onSelectSheet(sheet.sheetName)}
              className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                isSelected
                  ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FileSpreadsheet className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <span>{sheet.sheetName}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </h4>
                  <p className="text-[10px] font-mono text-slate-500">
                    {sheet.rowCount.toLocaleString()} Rows • {sheet.columnCount} Cols
                  </p>
                </div>
              </div>

              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {isSelected ? 'Active' : 'Select'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
