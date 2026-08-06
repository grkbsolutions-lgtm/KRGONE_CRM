import React from 'react';
import {
  Sparkles,
  Clock,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

interface ProcessingSummaryProps {
  estimatedCompanies?: string;
  estimatedTimeSec?: number;
  qualityScore?: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  recommendedAction?: string;
}

export const ProcessingSummary: React.FC<ProcessingSummaryProps> = ({
  estimatedCompanies = 'Unknown',
  estimatedTimeSec = 5,
  qualityScore = 'Good',
  recommendedAction = 'Run Auto Enhance to boost contrast & OCR precision.',
}) => {
  const getQualityBadge = () => {
    switch (qualityScore) {
      case 'Excellent':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
            Excellent
          </span>
        );
      case 'Good':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3 h-3 mr-1 text-blue-600" />
            Good
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
            {qualityScore}
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">AI Processing Summary</h3>
        </div>

        {getQualityBadge()}
      </div>

      {/* Summary Metrics */}
      <div className="space-y-3 text-xs">
        <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <span className="flex items-center space-x-2 text-slate-600 font-medium">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Estimated Companies</span>
          </span>
          <span className="font-bold text-slate-900 font-mono">{estimatedCompanies}</span>
        </div>

        <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <span className="flex items-center space-x-2 text-slate-600 font-medium">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Estimated Scan Time</span>
          </span>
          <span className="font-bold text-slate-900 font-mono">{estimatedTimeSec} seconds</span>
        </div>
      </div>

      {/* Quick Tips / Recommended Action */}
      <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1">
        <div className="flex items-center space-x-1.5 text-amber-800 text-xs font-bold">
          <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>Recommended Preprocessing</span>
        </div>
        <p className="text-[11px] text-amber-700 leading-relaxed pl-5">
          {recommendedAction}
        </p>
      </div>
    </div>
  );
};
