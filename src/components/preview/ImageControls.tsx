import React from 'react';
import {
  Sparkles,
  Sun,
  Contrast,
  Sliders,
  Wand2,
  RefreshCw,
  FileCheck,
  Zap,
} from 'lucide-react';

export interface ImageEnhancementState {
  brightness: number; // default 100
  contrast: number; // default 100
  sharpness: number; // default 0
  saturation: number; // default 100
  grayscale: boolean;
  deskew: boolean;
  noiseRemoved: boolean;
  textImproved: boolean;
  isAutoEnhanced: boolean;
}

interface ImageControlsProps {
  enhancement: ImageEnhancementState;
  onChange: (updated: Partial<ImageEnhancementState>) => void;
  onAutoEnhance: () => void;
  onReset: () => void;
}

export const ImageControls: React.FC<ImageControlsProps> = ({
  enhancement,
  onChange,
  onAutoEnhance,
  onReset,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">AI Preprocessing & Tuning</h3>
            <p className="text-[11px] text-slate-500">Fine-tune document readability</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          title="Reset Sliders"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Preset Action Buttons Grid */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onAutoEnhance}
          className={`flex items-center justify-center space-x-1.5 p-2.5 rounded-xl border text-xs font-semibold transition ${
            enhancement.isAutoEnhanced
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Auto Enhance</span>
        </button>

        <button
          type="button"
          onClick={() => onChange({ noiseRemoved: !enhancement.noiseRemoved })}
          className={`flex items-center justify-center space-x-1.5 p-2.5 rounded-xl border text-xs font-semibold transition ${
            enhancement.noiseRemoved
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Remove Noise</span>
        </button>

        <button
          type="button"
          onClick={() => onChange({ textImproved: !enhancement.textImproved })}
          className={`flex items-center justify-center space-x-1.5 p-2.5 rounded-xl border text-xs font-semibold transition ${
            enhancement.textImproved
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Improve Text</span>
        </button>

        <button
          type="button"
          onClick={() => onChange({ deskew: !enhancement.deskew })}
          className={`flex items-center justify-center space-x-1.5 p-2.5 rounded-xl border text-xs font-semibold transition ${
            enhancement.deskew
              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Deskew</span>
        </button>
      </div>

      {/* Sliders Area */}
      <div className="space-y-3.5 pt-1">
        {/* Brightness */}
        <div>
          <div className="flex justify-between items-center text-xs text-slate-700 font-medium mb-1">
            <span className="flex items-center space-x-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              <span>Brightness</span>
            </span>
            <span className="font-mono text-slate-900 font-semibold">{enhancement.brightness}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="180"
            value={enhancement.brightness}
            onChange={(e) => onChange({ brightness: Number(e.target.value), isAutoEnhanced: false })}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Contrast */}
        <div>
          <div className="flex justify-between items-center text-xs text-slate-700 font-medium mb-1">
            <span className="flex items-center space-x-1.5">
              <Contrast className="w-3.5 h-3.5 text-blue-600" />
              <span>Contrast</span>
            </span>
            <span className="font-mono text-slate-900 font-semibold">{enhancement.contrast}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="200"
            value={enhancement.contrast}
            onChange={(e) => onChange({ contrast: Number(e.target.value), isAutoEnhanced: false })}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Sharpness */}
        <div>
          <div className="flex justify-between items-center text-xs text-slate-700 font-medium mb-1">
            <span className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Sharpness</span>
            </span>
            <span className="font-mono text-slate-900 font-semibold">{enhancement.sharpness}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={enhancement.sharpness}
            onChange={(e) => onChange({ sharpness: Number(e.target.value), isAutoEnhanced: false })}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Saturation */}
        <div>
          <div className="flex justify-between items-center text-xs text-slate-700 font-medium mb-1">
            <span className="flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-rose-600" />
              <span>Saturation</span>
            </span>
            <span className="font-mono text-slate-900 font-semibold">{enhancement.saturation}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            value={enhancement.saturation}
            onChange={(e) => onChange({ saturation: Number(e.target.value), isAutoEnhanced: false })}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* B&W High-Contrast Mode Checkbox */}
        <div className="pt-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enhancement.grayscale}
              onChange={(e) => onChange({ grayscale: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-slate-700 font-medium">
              High-Contrast Black & White OCR Mode
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};
