import React from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  RotateCw,
  RefreshCw,
  Crop,
} from 'lucide-react';

interface ToolbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToScreen: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onResetView: () => void;
  isCropping: boolean;
  onToggleCrop: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  onRotateLeft,
  onRotateRight,
  onResetView,
  isCropping,
  onToggleCrop,
}) => {
  return (
    <div className="flex items-center space-x-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1.5 shadow-lg text-white">
      {/* Zoom Out */}
      <button
        type="button"
        onClick={onZoomOut}
        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition"
        title="Zoom Out (-)"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      {/* Zoom % Indicator */}
      <span className="text-[11px] font-mono font-medium px-1 text-slate-300 min-w-[42px] text-center">
        {Math.round(zoom * 100)}%
      </span>

      {/* Zoom In */}
      <button
        type="button"
        onClick={onZoomIn}
        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition"
        title="Zoom In (+)"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      <div className="w-px h-4 bg-slate-700 mx-0.5" />

      {/* Fit to Screen */}
      <button
        type="button"
        onClick={onFitToScreen}
        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition"
        title="Fit to Screen"
      >
        <Maximize2 className="w-4 h-4" />
      </button>

      {/* Rotate Left */}
      <button
        type="button"
        onClick={onRotateLeft}
        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition"
        title="Rotate Left 90°"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      {/* Rotate Right */}
      <button
        type="button"
        onClick={onRotateRight}
        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition"
        title="Rotate Right 90°"
      >
        <RotateCw className="w-4 h-4" />
      </button>

      <div className="w-px h-4 bg-slate-700 mx-0.5" />

      {/* Crop Tool Toggle */}
      <button
        type="button"
        onClick={onToggleCrop}
        className={`p-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition ${
          isCropping
            ? 'bg-blue-600 text-white shadow-sm'
            : 'hover:bg-slate-800 text-slate-300 hover:text-white'
        }`}
        title="Crop Selection"
      >
        <Crop className="w-4 h-4" />
        <span className="hidden sm:inline text-[11px]">Crop</span>
      </button>

      {/* Reset View */}
      <button
        type="button"
        onClick={onResetView}
        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-amber-400 transition"
        title="Reset Zoom & Rotation"
      >
        <RefreshCw className="w-4 h-4" />
      </button>
    </div>
  );
};
