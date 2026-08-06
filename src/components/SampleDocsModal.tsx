import React from 'react';
import { FileText, Sparkles, X, CreditCard, BookOpen } from 'lucide-react';

interface SampleDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (imageDataUrl: string, title: string) => void;
}

export const SampleDocsModal: React.FC<SampleDocsModalProps> = ({ isOpen, onClose, onSelectSample }) => {
  if (!isOpen) return null;

  // Generate synthetic high-resolution sample visiting card / directory images on HTML5 Canvas
  const generateVisitingCardCanvas = (): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 1050;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Background
    const grad = ctx.createLinearGradient(0, 0, 1050, 600);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, '#f1f5f9');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1050, 600);

    // Accent line
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(0, 0, 24, 600);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 38px sans-serif';
    ctx.fillText('NEXUS TECHTRONICS INDIA PVT LTD', 70, 90);

    ctx.fillStyle = '#475569';
    ctx.font = '22px sans-serif';
    ctx.fillText('Industrial Automation & Electronic Sensors', 70, 130);

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(70, 160);
    ctx.lineTo(980, 160);
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('Mr. Anish Deshmukh', 70, 230);

    ctx.fillStyle = '#2563eb';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('Senior Director - Industrial Sales', 70, 270);

    ctx.fillStyle = '#334155';
    ctx.font = '22px sans-serif';
    ctx.fillText('Mobile: +91 98334 12099 / +91 98200 44102', 70, 340);
    ctx.fillText('Phone: 022 6124 8800', 70, 380);
    ctx.fillText('Email: anish.d@nexustechtronics.co.in', 70, 420);
    ctx.fillText('Office: Plot 88, Sector 18, Vashi, Navi Mumbai, MS - 400703', 70, 460);
    ctx.fillText('Factory: Gate No 12, Chakan Industrial Phase 2, Pune - 410501', 70, 500);
    ctx.fillText('Website: www.nexustechtronics.co.in', 70, 540);

    return canvas.toDataURL('image/jpeg', 0.95);
  };

  const generateDirectoryPageCanvas = (): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Page Background
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, 1200, 1400);

    // Header Banner (Should be ignored by AI OCR parser)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(40, 40, 1120, 100);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('MAHARASHTRA INDUSTRIAL DIRECTORY 2026 - SECTION C', 70, 100);

    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Page 142 | Category: Heavy Engineering & Valve Manufacturing', 70, 125);

    // Grid Column 1: Company A
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(50, 180, 530, 540);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 180, 530, 540);

    ctx.fillStyle = '#2563eb';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('VALVE-TECH ENGINEERING WORKS', 70, 230);

    ctx.fillStyle = '#475569';
    ctx.font = '18px sans-serif';
    ctx.fillText('Contact: Suresh R. Patil (Managing Partner)', 70, 270);
    ctx.fillText('Mobile: +91 94220 88123', 70, 310);
    ctx.fillText('Tel: 0251 2401192', 70, 350);
    ctx.fillText('Email: info@valvetech-eng.com', 70, 390);
    ctx.fillText('Category: Valve Manufacturing', 70, 430);
    ctx.fillText('Office: 12, MIDC Phase 1, Dombivli East, Thane', 70, 470);
    ctx.fillText('Factory: Survey 104, Ambernath MIDC, Maharashtra', 70, 510);
    ctx.fillText('Web: www.valvetech-eng.com', 70, 550);

    // Grid Column 2: Company B
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(620, 180, 530, 540);
    ctx.strokeRect(620, 180, 530, 540);

    ctx.fillStyle = '#2563eb';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('OCEANIC FREIGHT & LOGISTICS', 700, 230);

    ctx.fillStyle = '#475569';
    ctx.font = '18px sans-serif';
    ctx.fillText('Contact: Kavita Nair (General Manager)', 700, 270);
    ctx.fillText('Mobile: +91 98201 99887', 700, 310);
    ctx.fillText('Tel: 022 2833 4400', 700, 350);
    ctx.fillText('Email: ops@oceanicfreight.in', 700, 390);
    ctx.fillText('Category: Supply Chain & Freight', 700, 430);
    ctx.fillText('Office: Suite 301, Sahar Cargo Complex, Andheri East, Mumbai', 700, 470);
    ctx.fillText('Pincode: 400099', 700, 510);
    ctx.fillText('Web: www.oceanicfreight.in', 700, 550);

    // Bottom Ad Box (Should be IGNORED by AI parser)
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(50, 760, 1100, 180);
    ctx.strokeStyle = '#f59e0b';
    ctx.strokeRect(50, 760, 1100, 180);

    ctx.fillStyle = '#b45309';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('[SPONSORED ADVERTISEMENT] BEST INDUSTRIAL LOANS AT 7.5%', 80, 810);
    ctx.font = '18px sans-serif';
    ctx.fillText('Call 1800-000-8888 for instant machinery finance quotes. Limited period offer!', 80, 850);

    // Company C at Bottom
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(50, 970, 1100, 380);
    ctx.strokeStyle = '#e2e8f0';
    ctx.strokeRect(50, 970, 1100, 380);

    ctx.fillStyle = '#2563eb';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('STARLIGHT PHARMACEUTICAL & CHEMICALS', 80, 1020);

    ctx.fillStyle = '#475569';
    ctx.font = '19px sans-serif';
    ctx.fillText('Contact Person: Dr. Arvind Subramanian', 80, 1060);
    ctx.fillText('Mobile: +91 97690 12345 | Phone: 022 4000 5500', 80, 1100);
    ctx.fillText('Email: arvind@starlightpharma.com', 80, 1140);
    ctx.fillText('Category: Chemical & Pharmaceuticals', 80, 1180);
    ctx.fillText('Office: 502, B Wing, Solitaire Corporate Park, Ghatkopar East, Mumbai - 400077', 80, 1220);
    ctx.fillText('Factory: Plot B-12, Lote Parshuram Industrial Area, Ratnagiri - 415722', 80, 1260);

    return canvas.toDataURL('image/jpeg', 0.95);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-slate-900">Instant Test Samples</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Samples */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            Select a pre-built sample document to test the AI Smart Scanner instantly:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => {
                const imgData = generateVisitingCardCanvas();
                onSelectSample(imgData, 'Sample Visiting Card');
                onClose();
              }}
              className="p-4 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition group flex flex-col justify-between shadow-xs"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition">Sample Business Card</h4>
                  <p className="text-xs text-slate-500">1 Company | Dual Address</p>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Tests extraction of single corporate card with Office + Factory address, Mobile, Phone, Email & Website.
              </p>
            </button>

            <button
              onClick={() => {
                const imgData = generateDirectoryPageCanvas();
                onSelectSample(imgData, 'Multi-Company Directory Page');
                onClose();
              }}
              className="p-4 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition group flex flex-col justify-between shadow-xs"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition">Multi-Company Page</h4>
                  <p className="text-xs text-slate-500">3 Companies + Ad Banner</p>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Tests AI layout parsing: extracts 3 separate companies while automatically ignoring sponsored ads and page headers!
              </p>
            </button>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-slate-500 hover:text-slate-800 text-sm font-medium">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
