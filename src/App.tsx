import React, { useState, useEffect } from 'react';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { Dashboard } from './components/Dashboard';
import { SmartScannerPanel } from './components/scanner/SmartScannerPanel';
import { ReviewScreen } from './components/ReviewScreen';
import { LeadsList } from './components/LeadsList';
import { ImportLogsView } from './components/ImportLogsView';
import { SettingsView } from './components/SettingsView';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { DocumentViewer } from './components/preview/DocumentViewer';
import { SampleDocsModal } from './components/SampleDocsModal';
import { ExcelImportModule } from './components/excel/ExcelImportModule';
import {
  ExtractedCompany,
  FullLeadRecord,
  ImportLogRecord,
  DashboardStats,
  ScanResponse,
  PreprocessOptions,
} from './types';
import { Sparkles, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

// Helper to compress image payloads for Vercel serverless function limits
async function compressImageDataUrlIfNeeded(dataUrl: string, maxBytes = 2 * 1024 * 1024): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image/') || dataUrl.length <= maxBytes) {
    return dataUrl;
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      const maxDim = 2000;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);
      ctx.drawImage(img, 0, 0, width, height);
      const compressed = canvas.toDataURL('image/jpeg', 0.82);
      resolve(compressed);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export default function App() {
  // Navigation & Layout State
  const [activeTab, setActiveTab] = useState<ActiveTab | 'review'>('dashboard');
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Data Persistence State
  const [leads, setLeads] = useState<FullLeadRecord[]>([]);
  const [importLogs, setImportLogs] = useState<ImportLogRecord[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  // Extracted Scan Results State
  const [extractedCompanies, setExtractedCompanies] = useState<ExtractedCompany[]>([]);
  const [processingTimeMs, setProcessingTimeMs] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isSavingBatch, setIsSavingBatch] = useState<boolean>(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Modals & Document Processing State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isPreprocessOpen, setIsPreprocessOpen] = useState(false);
  const [isSampleDocsOpen, setIsSampleDocsOpen] = useState(false);

  const [selectedFileSource, setSelectedFileSource] = useState<{
    dataUrl: string;
    mimeType: string;
    sourceType: 'pdf' | 'image' | 'camera';
  } | null>(null);

  // Fetch initial leads and stats on mount
  useEffect(() => {
    fetchLeadsAndStats();
  }, []);

  const fetchLeadsAndStats = async () => {
    try {
      const [leadsRes, statsRes, logsRes] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/stats'),
        fetch('/api/import-logs'),
      ]);

      if (leadsRes.ok) {
        const data = await leadsRes.json();
        setLeads(data.leads || []);
      }
      if (statsRes.ok) {
        const stats = await statsRes.json();
        setDashboardStats(stats);
      }
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setImportLogs(logsData.logs || []);
      }
    } catch (err) {
      console.error('Error fetching leads and stats:', err);
    }
  };

  // Step 1: User selects a file or captures from camera
  const handleFileSelect = (file: File) => {
    setScanError(null);
    const mimeType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
    const sourceType = mimeType === 'application/pdf' ? 'pdf' : 'image';

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setSelectedFileSource({ dataUrl, mimeType, sourceType });
        setIsPreprocessOpen(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (capturedDataUrl: string) => {
    setScanError(null);
    setSelectedFileSource({
      dataUrl: capturedDataUrl,
      mimeType: 'image/jpeg',
      sourceType: 'camera',
    });
    setIsPreprocessOpen(true);
  };

  const handleSelectSample = (sampleDataUrl: string, sampleMimeType: string) => {
    setScanError(null);
    const sourceType = sampleMimeType === 'application/pdf' ? 'pdf' : 'image';
    setSelectedFileSource({
      dataUrl: sampleDataUrl,
      mimeType: sampleMimeType,
      sourceType,
    });
    setIsPreprocessOpen(true);
  };

  // Step 2: Confirm Preprocessing & Send to Gemini AI OCR
  const handleProceedToScan = async (
    processedDataUrl: string,
    options: PreprocessOptions
  ) => {
    if (!selectedFileSource) return;

    setIsScanning(true);
    setScanError(null);
    setStatusMessage('Analyzing document with Gemini AI vision... Detecting multi-company leads...');

    try {
      const payloadDataUrl = await compressImageDataUrlIfNeeded(processedDataUrl);

      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileData: payloadDataUrl,
          mimeType: selectedFileSource.mimeType,
          sourceType: selectedFileSource.sourceType,
          options,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      let data: ScanResponse;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const rawText = await response.text();
        throw new Error(
          `Server returned HTTP ${response.status} (${response.statusText}). If deployed on Vercel, ensure GEMINI_API_KEY environment variable is added under Vercel Project Settings.`
        );
      }

      if (data.success && data.companies) {
        setExtractedCompanies(data.companies);
        setProcessingTimeMs(data.processingTimeMs);
        setActiveTab('review');
        setStatusMessage(
          `Scan completed! Detected ${data.companies.length} company listing(s) in ${(
            data.processingTimeMs / 1000
          ).toFixed(2)}s.`
        );
      } else {
        setScanError(data.error || 'Failed to extract companies from document.');
      }
    } catch (err: any) {
      console.error('Scan API call failed:', err);
      setScanError(err?.message || 'Error connecting to Gemini scanner server.');
    } finally {
      setIsScanning(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  // Review Screen Actions
  const handleUpdateExtractedCompany = (
    tempId: string,
    updated: Partial<ExtractedCompany>
  ) => {
    setExtractedCompanies((prev) =>
      prev.map((c) => (c.tempId === tempId ? { ...c, ...updated } : c))
    );
  };

  const handleDeleteExtractedCompany = (tempId: string) => {
    setExtractedCompanies((prev) => prev.filter((c) => c.tempId !== tempId));
  };

  const handleAddManualCompany = () => {
    const newTempId = `manual_${Date.now()}`;
    const newCompany: ExtractedCompany = {
      tempId: newTempId,
      companyName: 'New Company Name',
      contactPerson: '',
      mobile: '',
      phone: '',
      email: '',
      officeAddress: '',
      factoryAddress: '',
      city: '',
      state: '',
      pincode: '',
      category: 'General Industry',
      website: '',
      selected: true,
      duplicateStatus: { isDuplicate: false, action: 'save_new' },
    };
    setExtractedCompanies((prev) => [newCompany, ...prev]);
  };

  // Batch Save Selected Extracted Leads
  const handleSaveBatch = async (selectedList: ExtractedCompany[]) => {
    if (selectedList.length === 0) return;

    setIsSavingBatch(true);
    try {
      const payload = {
        importedBy: 'Scanner User',
        sourceType: selectedFileSource?.sourceType || 'excel',
        processingTimeMs,
        leads: selectedList.map((c) => ({
          data: {
            ...c,
            companyName: c.companyName || 'Unnamed Lead',
          },
          action: c.duplicateStatus?.action || 'save_new',
          targetCompanyId: c.duplicateStatus?.existingCompanyId,
        })),
      };

      const res = await fetch('/api/leads/batch-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get('content-type') || '';
      let result: any = null;

      if (contentType.includes('application/json')) {
        result = await res.json();
      } else {
        const textStr = await res.text();
        throw new Error(`Server returned status ${res.status}: ${res.statusText}`);
      }

      if (res.ok && result?.success) {
        // Remove saved items from review list
        const savedTempIds = new Set(selectedList.map((s) => s.tempId));
        setExtractedCompanies((prev) => prev.filter((c) => !savedTempIds.has(c.tempId)));

        // Refresh leads database
        await fetchLeadsAndStats();

        setStatusMessage(
          `Successfully saved ${result.importedCompanies} lead(s) to database!`
        );

        if (extractedCompanies.length === selectedList.length) {
          setActiveTab('leads');
        }
      } else {
        alert(`Error saving leads: ${result?.error || 'Unknown error on server'}`);
      }
    } catch (err: any) {
      console.error('Batch save error:', err);
      alert(`Error saving leads: ${err?.message || 'Connection error'}`);
    } finally {
      setIsSavingBatch(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleSaveSingleIndividual = (company: ExtractedCompany) => {
    handleSaveBatch([company]);
  };

  const handleClearBatch = () => {
    if (confirm('Are you sure you want to clear this entire review batch?')) {
      setExtractedCompanies([]);
      setActiveTab('dashboard');
    }
  };

  // Leads CRUD
  const handleUpdateLead = async (companyId: string, updated: Partial<FullLeadRecord>) => {
    try {
      const res = await fetch(`/api/leads/${companyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: updated.company?.companyName,
          category: updated.company?.category,
          website: updated.company?.website,
          contactPerson: updated.contact?.contactPerson,
          mobile: updated.contact?.mobile,
          phone: updated.contact?.phone,
          email: updated.contact?.email,
          officeAddress: updated.address?.officeAddress,
          factoryAddress: updated.address?.factoryAddress,
          city: updated.address?.city,
          state: updated.address?.state,
          pincode: updated.address?.pincode,
        }),
      });

      if (res.ok) {
        fetchLeadsAndStats();
      }
    } catch (err) {
      console.error('Error updating lead:', err);
    }
  };

  const handleDeleteLead = async (companyId: string) => {
    if (!confirm('Are you sure you want to delete this company lead record?')) return;
    try {
      const res = await fetch(`/api/leads/${companyId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchLeadsAndStats();
      }
    } catch (err) {
      console.error('Error deleting lead:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab === 'review' ? 'scanner' : activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setScanError(null);
        }}
        isOpenMobile={isOpenMobileSidebar}
        setIsOpenMobile={setIsOpenMobileSidebar}
        totalLeadsCount={leads.length}
      />

      {/* Main Right Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        {/* Top Navbar */}
        <TopNav
          onToggleMobileSidebar={() => setIsOpenMobileSidebar(true)}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Status Notification Banner */}
        {statusMessage && (
          <div className="bg-emerald-600 text-white text-xs font-semibold px-6 py-2.5 flex items-center justify-between shadow-md animate-fadeIn">
            <span className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{statusMessage}</span>
            </span>
            <button onClick={() => setStatusMessage(null)} className="text-white/80 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {scanError && (
          <div className="bg-red-600 text-white text-xs font-semibold px-6 py-2.5 flex items-center justify-between shadow-md animate-fadeIn">
            <span className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>{scanError}</span>
            </span>
            <button onClick={() => setScanError(null)} className="text-white/80 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Main Body Canvas */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
          {/* Scanning Overlay Loader */}
          {isScanning && (
            <div className="bg-white border border-blue-200 rounded-2xl p-12 text-center my-8 shadow-xl space-y-4 animate-pulse">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Gemini AI OCR Vision Processing</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Extracting company profiles, contact numbers, emails, categories, and dual addresses...
              </p>
            </div>
          )}

          {!isScanning && (
            <>
              {/* Tab 1: Dashboard */}
              {activeTab === 'dashboard' && (
                <Dashboard
                  stats={dashboardStats}
                  onOpenCamera={() => setIsCameraOpen(true)}
                  onFileSelect={handleFileSelect}
                  onOpenSamples={() => setIsSampleDocsOpen(true)}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  isScanning={isScanning}
                />
              )}

              {/* Tab 2: Smart Scanner Studio */}
              {activeTab === 'scanner' && (
                <div className="space-y-6">
                  <SmartScannerPanel
                    onFileSelect={handleFileSelect}
                    onOpenCamera={() => setIsCameraOpen(true)}
                    onOpenSampleDocs={() => setIsSampleDocsOpen(true)}
                    isScanning={isScanning}
                  />

                  {extractedCompanies.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
                      <p className="text-slate-700 text-sm mb-3">
                        You have <strong className="text-slate-900 font-bold">{extractedCompanies.length}</strong> extracted lead(s) ready for review.
                      </p>
                      <button
                        onClick={() => setActiveTab('review')}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition"
                      >
                        Open Lead Review Screen
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Excel & CSV Import Module */}
              {activeTab === 'excel' && (
                <ExcelImportModule
                  existingLeads={leads}
                  onImportToReviewQueue={(importedLeads) => {
                    setExtractedCompanies((prev) => [...prev, ...importedLeads]);
                    setStatusMessage(`Imported ${importedLeads.length} leads into the Review Queue.`);
                  }}
                  onGoToReviewQueue={() => setActiveTab('review')}
                />
              )}

              {/* Tab 4: Review Screen */}
              {activeTab === 'review' && (
                <ReviewScreen
                  extractedCompanies={extractedCompanies}
                  processingTimeMs={processingTimeMs}
                  onUpdateCompany={handleUpdateExtractedCompany}
                  onDeleteCompany={handleDeleteExtractedCompany}
                  onSaveIndividual={handleSaveSingleIndividual}
                  onSaveBatch={handleSaveBatch}
                  onAddCompanyManually={handleAddManualCompany}
                  onClearBatch={handleClearBatch}
                  isSavingBatch={isSavingBatch}
                />
              )}

              {/* Tab 4: Leads Database */}
              {activeTab === 'leads' && (
                <LeadsList
                  leads={leads.filter((l) => {
                    if (!searchTerm) return true;
                    const term = searchTerm.toLowerCase();
                    return (
                      l.company.companyName.toLowerCase().includes(term) ||
                      l.contact.contactPerson.toLowerCase().includes(term) ||
                      l.contact.mobile.includes(term) ||
                      l.contact.email.toLowerCase().includes(term) ||
                      l.address.city.toLowerCase().includes(term)
                    );
                  })}
                  onUpdateLead={handleUpdateLead}
                  onDeleteLead={handleDeleteLead}
                  onRefreshLeads={fetchLeadsAndStats}
                />
              )}

              {/* Tab 5: Import Session Audit Logs */}
              {activeTab === 'logs' && <ImportLogsView logs={importLogs} />}

              {/* Tab 6: Application Settings */}
              {activeTab === 'settings' && <SettingsView />}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />

      {/* Document Preview & Preprocessing Module */}
      {selectedFileSource && isPreprocessOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 lg:p-8 flex items-center justify-center animate-fadeIn">
          <div className="w-full max-w-6xl my-auto">
            <DocumentViewer
              dataUrl={selectedFileSource.dataUrl}
              mimeType={selectedFileSource.mimeType}
              sourceType={selectedFileSource.sourceType}
              onClose={() => {
                setIsPreprocessOpen(false);
                setSelectedFileSource(null);
              }}
              onBack={() => {
                setIsPreprocessOpen(false);
              }}
              onStartAIScan={(processedDataUrl, options) => {
                setIsPreprocessOpen(false);
                handleProceedToScan(processedDataUrl, options);
              }}
            />
          </div>
        </div>
      )}

      <SampleDocsModal
        isOpen={isSampleDocsOpen}
        onClose={() => setIsSampleDocsOpen(false)}
        onSelectSample={handleSelectSample}
      />
    </div>
  );
}
