import React from 'react';
import { ArrowLeft, Sparkles, Check, X } from 'lucide-react';

interface BottomActionsProps {
  onCancel: () => void;
  onBack: () => void;
  onAutoEnhance: () => void;
  onStartAIScan: () => void;
  isProcessing?: boolean;
}

export const BottomActions: React.FC<BottomActionsProps> = ({
  onCancel,
  onBack,
  onAutoEnhance,
  onStartAIScan,
  isProcessing = false,
}) => {
  return (
    <div className="bg-white border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md rounded-b-2xl">
      {/* Left side actions: Cancel / Back */}
      <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-start">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold rounded-xl hover:bg-slate-100 transition flex items-center space-x-1"
        >
          <X className="w-4 h-4" />
          <span>Cancel</span>
        </button>

        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition flex items-center space-x-1.5 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Right side actions: Auto Enhance / Start AI Scan */}
      <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
        <button
          type="button"
          onClick={onAutoEnhance}
          className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs rounded-xl transition flex items-center space-x-1.5"
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Auto Enhance</span>
        </button>

        <button
          type="button"
          onClick={onStartAIScan}
          disabled={isProcessing}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/20 transition flex items-center space-x-2 disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          <span>Start AI Scan</span>
        </button>
      </div>
    </div>
  );
};
