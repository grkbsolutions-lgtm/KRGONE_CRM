import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckSquare,
  Square,
  Trash2,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from 'lucide-react';
import { DocumentPage } from '../../types';
import { ImageEnhancementState } from './ImageControls';

interface PDFViewerProps {
  pdfSrc?: string;
  pages: DocumentPage[];
  activePageIndex: number;
  zoom: number;
  rotation: number;
  enhancement: ImageEnhancementState;
  onActivePageChange: (index: number) => void;
  onTogglePageSelect: (pageNumber: number) => void;
  onSelectAllPages: () => void;
  onDeselectAllPages: () => void;
  onDeleteSelectedPages: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotateRight: () => void;
  onFitToScreen: () => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfSrc,
  pages,
  activePageIndex,
  zoom,
  rotation,
  enhancement,
  onActivePageChange,
  onTogglePageSelect,
  onSelectAllPages,
  onDeselectAllPages,
  onDeleteSelectedPages,
  onZoomIn,
  onZoomOut,
  onRotateRight,
  onFitToScreen,
}) => {
  const activePage = pages[activePageIndex] || pages[0];
  const selectedCount = pages.filter((p) => p.selected).length;

  const filterStyle = `
    brightness(${enhancement.brightness}%)
    contrast(${enhancement.contrast}%)
    saturate(${enhancement.saturation}%)
    ${enhancement.grayscale ? 'grayscale(100%)' : ''}
  `;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full h-full min-h-[420px] max-h-[620px]">
      {/* Left Column: PDF Pages Thumbnails Sidebar */}
      <div className="md:col-span-1 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center space-x-1.5">
            <FileText className="w-4 h-4 text-red-600" />
            <span className="text-xs font-bold text-slate-900">PDF Pages</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-bold">
            {pages.length} Pages
          </span>
        </div>

        {/* Thumbnail Items List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[380px]">
          {pages.map((p, idx) => (
            <div
              key={p.id}
              onClick={() => onActivePageChange(idx)}
              className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                activePageIndex === idx
                  ? 'border-blue-500 bg-blue-50/70 text-blue-900 font-bold shadow-xs'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className={`w-5 h-5 ${activePageIndex === idx ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="text-xs font-mono">Page {p.pageNumber}</span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePageSelect(p.pageNumber);
                }}
                className="p-1 hover:bg-white rounded text-blue-600"
              >
                {p.selected ? (
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Thumbnails Control Actions */}
        <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onSelectAllPages}
              className="text-[11px] text-blue-600 hover:underline font-semibold"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={onDeselectAllPages}
              className="text-[11px] text-slate-500 hover:underline font-medium"
            >
              Deselect All
            </button>
          </div>

          <button
            type="button"
            onClick={onDeleteSelectedPages}
            disabled={selectedCount === 0 || pages.length <= 1}
            className="w-full flex items-center justify-center space-x-1 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-semibold transition disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Selected ({selectedCount})</span>
          </button>
        </div>
      </div>

      {/* Right Column: PDF Large Viewer Stage */}
      <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between relative shadow-inner">
        {/* Navigation & Toolbar Header */}
        <div className="flex items-center justify-between bg-slate-950/80 backdrop-blur-md border border-slate-800 p-2 rounded-xl text-white z-20">
          {/* Previous / Next Navigation */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              disabled={activePageIndex === 0}
              onClick={() => onActivePageChange(activePageIndex - 1)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg disabled:opacity-30 transition"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono font-medium px-2 text-slate-200">
              Page {activePageIndex + 1} of {pages.length}
            </span>

            <button
              type="button"
              disabled={activePageIndex === pages.length - 1}
              onClick={() => onActivePageChange(activePageIndex + 1)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg disabled:opacity-30 transition"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Large View Controls */}
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={onZoomOut}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono px-1">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={onZoomIn}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onRotateRight}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
              title="Rotate 90°"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onFitToScreen}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
              title="Fit to Screen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Page Render Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-auto relative my-2">
          {pdfSrc && pdfSrc.startsWith('data:application/pdf') ? (
            <embed
              src={pdfSrc}
              type="application/pdf"
              className="w-full h-full min-h-[380px] rounded shadow-2xl"
            />
          ) : (
            <div
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                filter: filterStyle,
                transition: 'transform 0.2s ease-out, filter 0.2s ease-out',
              }}
              className="bg-white border border-slate-200 rounded-xl shadow-2xl p-8 max-w-lg w-full min-h-[360px] flex flex-col justify-between text-slate-800 select-none"
            >
              <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
                    PDF
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">PDF Document Page #{activePage?.pageNumber || 1}</h4>
                    <p className="text-[10px] text-slate-500">Multipage Document Scan Preview</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold bg-slate-100 px-2.5 py-1 rounded-md text-slate-700">
                  Page {activePage?.pageNumber || 1}
                </span>
              </div>

              {/* Simulated PDF text lines content */}
              <div className="space-y-3 py-6 text-xs text-slate-600">
                <div className="h-3 bg-slate-200 rounded w-3/4 animate-pulse" />
                <div className="h-2.5 bg-slate-100 rounded w-full" />
                <div className="h-2.5 bg-slate-100 rounded w-5/6" />
                <div className="grid grid-cols-2 gap-3 py-2 border-y border-slate-100 my-2">
                  <div className="p-2 bg-slate-50 rounded border border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-800">Company Listing A</span>
                    <span className="text-[9px] text-slate-500">Contact: +91 98200 12345</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-800">Company Listing B</span>
                    <span className="text-[9px] text-slate-500">Contact: +91 98765 43210</span>
                  </div>
                </div>
                <div className="h-2.5 bg-slate-100 rounded w-4/5" />
                <div className="h-2.5 bg-slate-100 rounded w-2/3" />
              </div>

              <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>AI Smart Scanner PDF Engine</span>
                <span>Page {activePage?.pageNumber} / {pages.length}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
