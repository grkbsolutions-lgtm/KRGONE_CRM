import React from 'react';
import { ImageEnhancementState } from './ImageControls';
import { CropTool } from './CropTool';
import { Toolbar } from './Toolbar';
import { Image as ImageIcon } from 'lucide-react';

interface ImageViewerProps {
  imageSrc: string;
  zoom: number;
  rotation: number;
  enhancement: ImageEnhancementState;
  isCropping: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToScreen: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onResetView: () => void;
  onToggleCrop: () => void;
  onApplyCrop: (crop: { x: number; y: number; width: number; height: number }) => void;
  onCancelCrop: () => void;
  fileName?: string;
  resolution?: string;
  fileSize?: string;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  imageSrc,
  zoom,
  rotation,
  enhancement,
  isCropping,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  onRotateLeft,
  onRotateRight,
  onResetView,
  onToggleCrop,
  onApplyCrop,
  onCancelCrop,
  fileName = 'Scanned_Document.jpg',
  resolution = '1920x1080',
  fileSize = '420 KB',
}) => {
  // Construct CSS filter string from enhancement controls
  const filterStyle = `
    brightness(${enhancement.brightness}%)
    contrast(${enhancement.contrast}%)
    saturate(${enhancement.saturation}%)
    ${enhancement.grayscale ? 'grayscale(100%)' : ''}
    ${enhancement.sharpness > 0 ? `contrast(${100 + enhancement.sharpness}%)` : ''}
  `;

  return (
    <div className="relative w-full h-full min-h-[420px] max-h-[600px] bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col items-center justify-center p-4 shadow-inner group">
      {/* Top Floating Toolbar */}
      <div className="absolute top-4 z-30 opacity-90 hover:opacity-100 transition">
        <Toolbar
          zoom={zoom}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          onFitToScreen={onFitToScreen}
          onRotateLeft={onRotateLeft}
          onRotateRight={onRotateRight}
          onResetView={onResetView}
          isCropping={isCropping}
          onToggleCrop={onToggleCrop}
        />
      </div>

      {/* Main Image Stage */}
      <div className="w-full h-full flex items-center justify-center overflow-auto p-8 relative">
        <img
          src={imageSrc}
          alt="Document Preview"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            filter: filterStyle,
            transition: 'transform 0.2s ease-out, filter 0.2s ease-out',
          }}
          className="max-w-full max-h-[480px] object-contain rounded shadow-2xl pointer-events-none select-none"
        />

        {/* Crop Tool Overlay */}
        {isCropping && (
          <CropTool onApplyCrop={onApplyCrop} onCancelCrop={onCancelCrop} />
        )}
      </div>

      {/* Bottom Info Overlay Badge */}
      <div className="absolute bottom-4 left-4 z-20 bg-slate-950/80 backdrop-blur-md border border-slate-800 text-slate-300 text-[11px] px-3 py-1.5 rounded-xl flex items-center space-x-3 shadow-lg">
        <span className="flex items-center space-x-1 font-medium text-white">
          <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
          <span className="truncate max-w-[140px]">{fileName}</span>
        </span>
        <span className="text-slate-500">•</span>
        <span className="font-mono">{resolution}</span>
        <span className="text-slate-500">•</span>
        <span className="font-mono">{fileSize}</span>
      </div>
    </div>
  );
};
