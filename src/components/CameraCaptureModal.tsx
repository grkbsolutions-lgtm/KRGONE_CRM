import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, X, Check, AlertCircle, FlipHorizontal } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async (mode: 'user' | 'environment') => {
    setIsStarting(true);
    setErrorMsg(null);
    setCapturedImage(null);
    stopCamera();

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setErrorMsg('Camera access requested. If unavailable or blocked by browser permissions, use file camera upload.');
    } finally {
      setIsStarting(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleTakeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setCapturedImage(dataUrl);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      stopCamera();
      onClose();
    }
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">Capture Visiting Card or Document</h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Canvas Area */}
        <div className="relative bg-slate-950 flex items-center justify-center min-h-[360px] max-h-[500px] overflow-hidden">
          {errorMsg ? (
            <div className="p-8 text-center text-slate-300 flex flex-col items-center">
              <AlertCircle className="w-12 h-12 text-amber-400 mb-3" />
              <p className="text-sm max-w-md mb-4 text-slate-300">{errorMsg}</p>
              <label className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-md transition">
                <span>Select File from Camera</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const url = event.target?.result as string;
                        if (url) {
                          onCapture(url);
                          stopCamera();
                          onClose();
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
          ) : capturedImage ? (
            <img src={capturedImage} alt="Captured scan" className="max-h-[460px] object-contain w-full" />
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full max-h-[460px] object-cover" />
              {/* Overlay Guide Frame for Business Card / Document */}
              <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-blue-400/70 m-8 sm:m-12 rounded-xl flex items-center justify-center">
                <span className="bg-slate-900/80 text-blue-300 text-xs px-3 py-1 rounded-full border border-blue-500/30 font-medium">
                  Align business card or document inside frame
                </span>
              </div>
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Action Controls Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          {!capturedImage ? (
            <>
              <button
                type="button"
                onClick={toggleCameraFacing}
                className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-medium transition shadow-xs"
                title="Switch Camera"
              >
                <FlipHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Switch Camera</span>
              </button>

              <button
                type="button"
                disabled={!!errorMsg || isStarting}
                onClick={handleTakeSnapshot}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-600/20 transition transform active:scale-95 disabled:opacity-50"
              >
                <Camera className="w-5 h-5" />
                <span>Take Snapshot</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                className="px-4 py-2 text-slate-500 hover:text-slate-800 text-sm font-medium"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="flex items-center space-x-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-medium transition shadow-xs"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retake</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition"
              >
                <Check className="w-5 h-5" />
                <span>Use Captured Image</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
