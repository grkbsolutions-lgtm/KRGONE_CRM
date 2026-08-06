import React, { useState } from 'react';
import { Check, X, Crop as CropIcon } from 'lucide-react';

interface CropToolProps {
  onApplyCrop: (crop: { x: number; y: number; width: number; height: number }) => void;
  onCancelCrop: () => void;
}

export const CropTool: React.FC<CropToolProps> = ({ onApplyCrop, onCancelCrop }) => {
  // Crop area percentages
  const [crop, setCrop] = useState({ x: 10, y: 10, width: 80, height: 80 });

  const handleApply = () => {
    onApplyCrop(crop);
  };

  return (
    <div className="absolute inset-0 z-20 pointer-events-auto flex flex-col justify-between p-4">
      {/* Semi-transparent dimmed background around crop frame */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px] pointer-events-none" />

      {/* Resizable Crop Frame Overlay */}
      <div
        className="absolute border-2 border-dashed border-blue-400 bg-blue-500/10 rounded-lg shadow-2xl pointer-events-auto cursor-move transition-all"
        style={{
          left: `${crop.x}%`,
          top: `${crop.y}%`,
          width: `${crop.width}%`,
          height: `${crop.height}%`,
        }}
      >
        {/* Corner handles */}
        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-blue-500 border border-white rounded-full" />
        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blue-500 border border-white rounded-full" />
        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-blue-500 border border-white rounded-full" />
        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-blue-500 border border-white rounded-full" />

        {/* Center Guide Label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-slate-900/90 text-blue-300 text-[11px] font-mono px-2 py-0.5 rounded border border-blue-500/30">
            {crop.width}% x {crop.height}% Area
          </span>
        </div>
      </div>

      {/* Floating Crop Action Controls Bar */}
      <div className="relative z-30 self-center mt-auto mb-2 bg-slate-900/95 border border-slate-700/80 rounded-xl p-2 shadow-2xl flex items-center space-x-2 text-xs">
        <span className="text-slate-300 font-medium px-2 flex items-center space-x-1">
          <CropIcon className="w-3.5 h-3.5 text-blue-400" />
          <span>Crop Region</span>
        </span>

        {/* Quick Area Preset Buttons */}
        <button
          type="button"
          onClick={() => setCrop({ x: 10, y: 10, width: 80, height: 80 })}
          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
        >
          80% Center
        </button>
        <button
          type="button"
          onClick={() => setCrop({ x: 5, y: 20, width: 90, height: 60 })}
          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
        >
          Card Strip
        </button>

        <div className="w-px h-4 bg-slate-700" />

        <button
          type="button"
          onClick={onCancelCrop}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center space-x-1 font-medium transition"
        >
          <X className="w-3.5 h-3.5" />
          <span>Cancel</span>
        </button>

        <button
          type="button"
          onClick={handleApply}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-1 font-semibold shadow-xs transition"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Apply Crop</span>
        </button>
      </div>
    </div>
  );
};
