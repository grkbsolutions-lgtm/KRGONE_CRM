import React, { useRef } from 'react';
import { FileText, Image as ImageIcon, Camera, Sparkles, Upload, Eye } from 'lucide-react';

interface SmartScannerPanelProps {
  onFileSelect: (file: File) => void;
  onOpenCamera: () => void;
  onOpenSampleDocs: () => void;
  isScanning: boolean;
}

export const SmartScannerPanel: React.FC<SmartScannerPanelProps> = ({
  onFileSelect,
  onOpenCamera,
  onOpenSampleDocs,
  isScanning,
}) => {
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
      {/* Hidden File Inputs */}
      <input
        ref={pdfInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handlePdfChange}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/heic"
        className="hidden"
        onChange={handleImageChange}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Smart Scanner Studio</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Extract structured B2B business leads, visiting cards & catalogs using Gemini AI OCR.
          </p>
        </div>

        {/* Quick Sample Documents Trigger */}
        <button
          onClick={onOpenSampleDocs}
          className="inline-flex items-center space-x-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition"
        >
          <Eye className="w-4 h-4 text-blue-600" />
          <span>Try Sample Documents</span>
        </button>
      </div>

      {/* Three Large Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Upload PDF */}
        <button
          onClick={() => pdfInputRef.current?.click()}
          disabled={isScanning}
          className="group relative bg-slate-50 hover:bg-red-50/30 border border-slate-200 hover:border-red-300 rounded-2xl p-6 text-left transition duration-200 hover:shadow-md flex flex-col justify-between min-h-[160px] active:scale-[0.98] disabled:opacity-50"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 border border-red-200 flex items-center justify-center transition duration-200 group-hover:scale-110">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
              PDF Document
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition flex items-center justify-between">
              <span>📄 Upload PDF</span>
              <Upload className="w-4 h-4 opacity-0 group-hover:opacity-100 transition text-red-600" />
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Multi-page PDF catalogs, directories & invoices.
            </p>
          </div>
        </button>

        {/* 2. Upload Image */}
        <button
          onClick={() => imageInputRef.current?.click()}
          disabled={isScanning}
          className="group relative bg-slate-50 hover:bg-indigo-50/30 border border-slate-200 hover:border-indigo-300 rounded-2xl p-6 text-left transition duration-200 hover:shadow-md flex flex-col justify-between min-h-[160px] active:scale-[0.98] disabled:opacity-50"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 border border-indigo-200 flex items-center justify-center transition duration-200 group-hover:scale-110">
              <ImageIcon className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
              JPG, PNG, WEBP
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition flex items-center justify-between">
              <span>🖼 Upload Image</span>
              <Upload className="w-4 h-4 opacity-0 group-hover:opacity-100 transition text-indigo-600" />
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Visiting card photos, exhibition boards & brochures.
            </p>
          </div>
        </button>

        {/* 3. Camera Capture */}
        <button
          onClick={onOpenCamera}
          disabled={isScanning}
          className="group relative bg-slate-50 hover:bg-amber-50/30 border border-slate-200 hover:border-amber-300 rounded-2xl p-6 text-left transition duration-200 hover:shadow-md flex flex-col justify-between min-h-[160px] active:scale-[0.98] disabled:opacity-50"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 border border-amber-200 flex items-center justify-center transition duration-200 group-hover:scale-110">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
              Live Webcam
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition flex items-center justify-between">
              <span>📷 Camera Capture</span>
              <Camera className="w-4 h-4 opacity-0 group-hover:opacity-100 transition text-amber-600" />
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Snap visiting cards directly using device camera.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
