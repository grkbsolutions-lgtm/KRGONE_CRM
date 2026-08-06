import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, Sun, Contrast, Wand2, Check, X, Sliders, RefreshCw, Sparkles } from 'lucide-react';
import { PreprocessOptions } from '../types';

interface ImagePreprocessModalProps {
  isOpen: boolean;
  imageSrc: string;
  mimeType: string;
  sourceType: 'pdf' | 'image' | 'camera';
  onClose: () => void;
  onProceed: (processedDataUrl: string, options: PreprocessOptions) => void;
}

export const ImagePreprocessModal: React.FC<ImagePreprocessModalProps> = ({
  isOpen,
  imageSrc,
  mimeType,
  sourceType,
  onClose,
  onProceed,
}) => {
  const [rotation, setRotation] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(100);
  const [brightness, setBrightness] = useState<number>(100);
  const [grayscale, setGrayscale] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isOpen && imageSrc) {
      renderProcessedCanvas();
    }
  }, [isOpen, imageSrc, rotation, contrast, brightness, grayscale]);

  const renderProcessedCanvas = () => {
    if (!imageSrc || mimeType === 'application/pdf') return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Handle rotated canvas dimensions
      const isRotatedQuarter = rotation === 90 || rotation === 270;
      canvas.width = isRotatedQuarter ? img.height : img.width;
      canvas.height = isRotatedQuarter ? img.width : img.height;

      ctx.save();

      // Move to center for rotation
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);

      // Apply CSS Filters directly to Canvas context if supported
      const filterStr = `brightness(${brightness}%) contrast(${contrast}%)${grayscale ? ' grayscale(100%)' : ''}`;
      ctx.filter = filterStr;

      ctx.drawImage(
        img,
        -img.width / 2,
        -img.height / 2,
        img.width,
        img.height
      );

      ctx.restore();
    };
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setRotation(0);
    setContrast(100);
    setBrightness(100);
    setGrayscale(false);
  };

  const handleAutoEnhance = () => {
    setContrast(130);
    setBrightness(110);
    setGrayscale(true); // Grayscale enhances B&W document OCR accuracy
  };

  const handleConfirm = () => {
    setIsProcessing(true);

    if (mimeType === 'application/pdf') {
      // PDF documents pass through direct base64 data to Gemini
      onProceed(imageSrc, { rotation, contrast, brightness, grayscale });
      setIsProcessing(false);
      onClose();
      return;
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const processedUrl = canvas.toDataURL('image/jpeg', 0.95);
      onProceed(processedUrl, { rotation, contrast, brightness, grayscale });
    } else {
      onProceed(imageSrc, { rotation, contrast, brightness, grayscale });
    }
    setIsProcessing(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Document Preprocessing & Enhancement</h3>
              <p className="text-xs text-slate-500">Optimize contrast and orientation for higher AI OCR accuracy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Grid: Preview + Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 overflow-y-auto">
          {/* Left / Center Canvas Preview */}
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-center min-h-[300px] max-h-[480px] overflow-hidden relative shadow-inner">
            {mimeType === 'application/pdf' ? (
              <div className="text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mx-auto mb-3">
                  <span className="font-bold text-lg">PDF</span>
                </div>
                <h4 className="text-white font-medium text-base mb-1">PDF Document Selected</h4>
                <p className="text-slate-400 text-xs">
                  Gemini AI will scan all text pages natively. Click Scan to proceed.
                </p>
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <canvas ref={canvasRef} className="max-w-full max-h-[420px] object-contain rounded shadow-lg" />
              </div>
            )}
          </div>

          {/* Right Controls Panel */}
          <div className="space-y-5 bg-slate-50 p-4 border border-slate-200 rounded-xl flex flex-col justify-between shadow-xs">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Image Tuning</span>
                <button
                  type="button"
                  onClick={handleAutoEnhance}
                  className="flex items-center space-x-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-medium hover:bg-indigo-100 transition"
                >
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>Auto OCR Enhance</span>
                </button>
              </div>

              {/* Rotation Button */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Rotate Document</label>
                <button
                  type="button"
                  onClick={handleRotate}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-sm font-medium transition shadow-xs"
                >
                  <RotateCw className="w-4 h-4 text-blue-600" />
                  <span>Rotate 90° ({rotation}°)</span>
                </button>
              </div>

              {/* Contrast Slider */}
              <div>
                <div className="flex justify-between items-center text-xs text-slate-700 mb-1">
                  <span className="flex items-center space-x-1">
                    <Contrast className="w-3.5 h-3.5 text-blue-600" />
                    <span>Contrast</span>
                  </span>
                  <span className="font-mono text-slate-900 font-semibold">{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  disabled={mimeType === 'application/pdf'}
                />
              </div>

              {/* Brightness Slider */}
              <div>
                <div className="flex justify-between items-center text-xs text-slate-700 mb-1">
                  <span className="flex items-center space-x-1">
                    <Sun className="w-3.5 h-3.5 text-amber-600" />
                    <span>Brightness</span>
                  </span>
                  <span className="font-mono text-slate-900 font-semibold">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  disabled={mimeType === 'application/pdf'}
                />
              </div>

              {/* High Contrast B&W Mode Toggle */}
              <div className="pt-2">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={grayscale}
                    onChange={(e) => setGrayscale(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    disabled={mimeType === 'application/pdf'}
                  />
                  <span className="text-xs font-medium text-slate-700">
                    B&W High-Contrast Mode (Recommended for dirty scans)
                  </span>
                </label>
              </div>
            </div>

            {/* Reset */}
            <div className="pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={handleReset}
                className="w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 transition"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-500 hover:text-slate-800 text-sm font-medium transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleConfirm}
            className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-600/20 transition transform active:scale-95 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>Proceed to AI Scan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
