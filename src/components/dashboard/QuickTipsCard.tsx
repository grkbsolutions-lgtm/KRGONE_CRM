import React from 'react';
import { Check, Lightbulb, Sparkles } from 'lucide-react';

export const QuickTipsCard: React.FC = () => {
  const tips = [
    {
      title: 'Upload clear images',
      desc: 'Ensure high resolution and proper lighting on visiting cards or documents.',
    },
    {
      title: 'Review extracted data',
      desc: 'Edit or complete missing categories, phone numbers, or addresses before saving.',
    },
    {
      title: 'Check duplicates',
      desc: 'Automatic conflict resolution shields database from repeat phone and email records.',
    },
    {
      title: 'Save to database',
      desc: 'Batch save structured business leads instantly to CSV or CRM lead records.',
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
            <Lightbulb className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Quick Tips for Best Results</h3>
        </div>

        <ul className="space-y-3.5">
          {tips.map((tip, idx) => (
            <li key={idx} className="flex items-start space-x-3 text-xs">
              <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3" />
              </div>
              <div>
                <strong className="text-slate-800 block font-semibold">{tip.title}</strong>
                <span className="text-slate-500 text-[11px] leading-relaxed block mt-0.5">
                  {tip.desc}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 bg-blue-50/60 p-3 rounded-xl border border-blue-100 flex items-center space-x-2 text-[11px] text-blue-900">
        <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <span>Gemini AI multimodal OCR handles skewed text, B&W scans, and multi-card layouts automatically.</span>
      </div>
    </div>
  );
};
