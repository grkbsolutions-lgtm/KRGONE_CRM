import React, { useState } from 'react';
import { Settings, ShieldCheck, Database, Key, Sparkles, Save, Check } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [apiKey, setApiKey] = useState('●●●●●●●●●●●●●●●●●●●●●●●●');
  const [duplicateThreshold, setDuplicateThreshold] = useState('medium');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Application & OCR Settings</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure Gemini AI models, duplicate matching algorithms, and storage preferences.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Gemini AI Settings Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Gemini AI Vision Model Config</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Gemini Model Alias
              </label>
              <input
                type="text"
                disabled
                value="gemini-2.5-flash (Server-Side Auto Managed)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-500 cursor-not-allowed"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Utilizes Google Gemini 2.5 Flash for high-speed multimodal OCR image and PDF understanding.
              </p>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Server-Side API Key Status
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="password"
                  value={apiKey}
                  readOnly
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                />
                <span className="px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold whitespace-nowrap">
                  Connected
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Duplicate Protection Settings */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">Duplicate Lead Protection Shield</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Matching Strictness
              </label>
              <select
                value={duplicateThreshold}
                onChange={(e) => setDuplicateThreshold(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:border-blue-500"
              >
                <option value="strict">Strict (Exact match on Mobile or Company Name or Email)</option>
                <option value="medium">Medium (Matches phone digits without spaces or company fuzzy text)</option>
                <option value="lenient">Lenient (Flag only if exact 10-digit mobile number matches)</option>
              </select>
            </div>

            <div className="pt-2">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSaveEnabled}
                  onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-700 font-medium">
                  Auto-select clean (non-duplicate) leads during Review Screen launch
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center space-x-3">
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/20 transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>

          {savedSuccess && (
            <span className="flex items-center space-x-1 text-xs font-semibold text-emerald-600">
              <Check className="w-4 h-4" />
              <span>Settings saved successfully!</span>
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
