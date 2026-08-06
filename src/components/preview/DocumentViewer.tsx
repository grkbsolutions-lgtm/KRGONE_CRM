import React, { useState } from 'react';
import { ImageViewer } from './ImageViewer';
import { PDFViewer } from './PDFViewer';
import { ImageControls, ImageEnhancementState } from './ImageControls';
import { PageSelector } from './PageSelector';
import { DocumentInfo } from './DocumentInfo';
import { ProcessingSummary } from './ProcessingSummary';
import { BottomActions } from './BottomActions';
import { DocumentMeta, DocumentPage, PreprocessOptions } from '../../types';
import { FileText, Image as ImageIcon, Sparkles, X } from 'lucide-react';

interface DocumentViewerProps {
  dataUrl: string;
  mimeType: string;
  sourceType: 'pdf' | 'image' | 'camera';
  fileName?: string;
  onClose: () => void;
  onBack: () => void;
  onStartAIScan: (processedDataUrl: string, options: PreprocessOptions) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  dataUrl,
  mimeType,
  sourceType,
  fileName = sourceType === 'pdf' ? 'Scanned_Document.pdf' : 'Business_Card_Scan.jpg',
  onClose,
  onBack,
  onStartAIScan,
}) => {
  const isPDF = sourceType === 'pdf' || mimeType.includes('pdf');

  // Zoom & Rotation state
  const [zoom, setZoom] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [cropRect, setCropRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // PDF Multi-page state
  const [pages, setPages] = useState<DocumentPage[]>([
    { id: 1, pageNumber: 1, selected: true },
    { id: 2, pageNumber: 2, selected: true },
    { id: 3, pageNumber: 3, selected: true },
  ]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [scanMode, setScanMode] = useState<'current' | 'selected' | 'all'>('selected');

  // AI Preprocessing & Enhancement State
  const [enhancement, setEnhancement] = useState<ImageEnhancementState>({
    brightness: 100,
    contrast: 100,
    sharpness: 0,
    saturation: 100,
    grayscale: false,
    deskew: false,
    noiseRemoved: false,
    textImproved: false,
    isAutoEnhanced: false,
  });

  // Metadata
  const docMeta: DocumentMeta = {
    fileName,
    fileType: mimeType.includes('pdf') ? 'PDF Document' : 'JPEG / PNG Image',
    totalPages: isPDF ? pages.length : 1,
    resolution: isPDF ? 'A4 (300 DPI)' : '2400 x 1350 px',
    fileSizeFormatted: isPDF ? '1.8 MB' : '480 KB',
    uploadTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    quality: enhancement.isAutoEnhanced ? 'Excellent' : 'Good',
    recommendedAction: enhancement.isAutoEnhanced
      ? 'Contrast optimized for max Gemini OCR accuracy.'
      : 'Run Auto Enhance to optimize contrast and clarity.',
  };

  // Zoom / View Handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(2.5, prev + 0.15));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.5, prev - 0.15));
  const handleFitToScreen = () => {
    setZoom(1.0);
    setRotation(0);
  };
  const handleRotateLeft = () => setRotation((prev) => (prev - 90 + 360) % 360);
  const handleRotateRight = () => setRotation((prev) => (prev + 90) % 360);
  const handleResetView = () => {
    setZoom(1.0);
    setRotation(0);
    setIsCropping(false);
    setCropRect(null);
  };

  // Crop Handlers
  const handleApplyCrop = (crop: { x: number; y: number; width: number; height: number }) => {
    setCropRect(crop);
    setIsCropping(false);
  };

  // Preprocessing Sliders Change
  const handleEnhancementChange = (updated: Partial<ImageEnhancementState>) => {
    setEnhancement((prev) => ({ ...prev, ...updated }));
  };

  const handleAutoEnhance = () => {
    setEnhancement({
      brightness: 110,
      contrast: 130,
      sharpness: 40,
      saturation: 105,
      grayscale: false,
      deskew: true,
      noiseRemoved: true,
      textImproved: true,
      isAutoEnhanced: true,
    });
  };

  const handleResetEnhance = () => {
    setEnhancement({
      brightness: 100,
      contrast: 100,
      sharpness: 0,
      saturation: 100,
      grayscale: false,
      deskew: false,
      noiseRemoved: false,
      textImproved: false,
      isAutoEnhanced: false,
    });
  };

  // PDF Page Selection Handlers
  const handleTogglePageSelect = (pageNumber: number) => {
    setPages((prev) =>
      prev.map((p) => (p.pageNumber === pageNumber ? { ...p, selected: !p.selected } : p))
    );
  };

  const handleSelectAllPages = () => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: true })));
  };

  const handleDeselectAllPages = () => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: false })));
  };

  const handleDeleteSelectedPages = () => {
    if (pages.length <= 1) return;
    setPages((prev) => prev.filter((p) => !p.selected));
    setActivePageIndex(0);
  };

  // Trigger Start AI Scan
  const handleProceedScan = () => {
    const options: PreprocessOptions = {
      rotation,
      contrast: enhancement.contrast,
      brightness: enhancement.brightness,
      sharpness: enhancement.sharpness,
      saturation: enhancement.saturation,
      grayscale: enhancement.grayscale,
      deskew: enhancement.deskew,
      noiseRemoved: enhancement.noiseRemoved,
      textImproved: enhancement.textImproved,
      cropRect,
      scanMode,
      selectedPages: pages.filter((p) => p.selected).map((p) => p.pageNumber),
    };

    onStartAIScan(dataUrl, options);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col space-y-0">
      {/* Top Section Banner */}
      <div className="bg-slate-900 text-white p-5 px-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            {isPDF ? <FileText className="w-5 h-5 text-red-400" /> : <ImageIcon className="w-5 h-5 text-blue-400" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white">Document Preview & AI Preprocessing</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {isPDF ? 'PDF Multi-Page' : 'Image Scan'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Inspect, enhance contrast, crop, or select PDF pages before initiating Gemini AI OCR
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          title="Close Preview"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Grid: Left Stage Viewer + Right Control Sidebar */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/50">
        {/* Left Column: Canvas / PDF Viewer Stage (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          {isPDF ? (
            <PDFViewer
              pdfSrc={dataUrl}
              pages={pages}
              activePageIndex={activePageIndex}
              zoom={zoom}
              rotation={rotation}
              enhancement={enhancement}
              onActivePageChange={(idx) => setActivePageIndex(idx)}
              onTogglePageSelect={handleTogglePageSelect}
              onSelectAllPages={handleSelectAllPages}
              onDeselectAllPages={handleDeselectAllPages}
              onDeleteSelectedPages={handleDeleteSelectedPages}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onRotateRight={handleRotateRight}
              onFitToScreen={handleFitToScreen}
            />
          ) : (
            <ImageViewer
              imageSrc={dataUrl}
              zoom={zoom}
              rotation={rotation}
              enhancement={enhancement}
              isCropping={isCropping}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onFitToScreen={handleFitToScreen}
              onRotateLeft={handleRotateLeft}
              onRotateRight={handleRotateRight}
              onResetView={handleResetView}
              onToggleCrop={() => setIsCropping(!isCropping)}
              onApplyCrop={handleApplyCrop}
              onCancelCrop={() => setIsCropping(false)}
              fileName={fileName}
            />
          )}

          {/* Document Information Card below viewer */}
          <DocumentInfo meta={docMeta} />
        </div>

        {/* Right Column: AI Tuning + Selection + Processing Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          {/* PDF Page Selector (if PDF) */}
          {isPDF && (
            <PageSelector
              pages={pages}
              activePageIndex={activePageIndex}
              scanMode={scanMode}
              onScanModeChange={(mode) => setScanMode(mode)}
              onSelectAllPages={handleSelectAllPages}
              onDeselectAllPages={handleDeselectAllPages}
              onDeleteSelectedPages={handleDeleteSelectedPages}
              onTogglePageSelect={handleTogglePageSelect}
              onActivePageChange={(idx) => setActivePageIndex(idx)}
            />
          )}

          {/* AI Preprocessing Tuning Sliders */}
          <ImageControls
            enhancement={enhancement}
            onChange={handleEnhancementChange}
            onAutoEnhance={handleAutoEnhance}
            onReset={handleResetEnhance}
          />

          {/* Processing Summary Card */}
          <ProcessingSummary
            estimatedCompanies={isPDF ? `${pages.length * 2} - ${pages.length * 4} Leads` : '1 - 3 Leads'}
            estimatedTimeSec={isPDF ? pages.length * 3 : 4}
            qualityScore={docMeta.quality}
            recommendedAction={docMeta.recommendedAction}
          />
        </div>
      </div>

      {/* Bottom Action Footer Bar */}
      <BottomActions
        onCancel={onClose}
        onBack={onBack}
        onAutoEnhance={handleAutoEnhance}
        onStartAIScan={handleProceedScan}
      />
    </div>
  );
};
