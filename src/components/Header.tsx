import React from 'react';
import { Scan, Database, History, Sparkles, Building2, ShieldCheck, PlusCircle } from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'review' | 'leads' | 'logs';
  setActiveTab: (tab: 'dashboard' | 'review' | 'leads' | 'logs') => void;
  extractedCount: number;
  totalLeadsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  extractedCount,
  totalLeadsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/10">
              <Scan className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-white">AI Smart Scanner</h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  <Sparkles className="w-3 h-3 mr-1 text-blue-400" /> MVP 1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Automated Lead Extraction & OCR Parsing</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              id="nav-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Scan Document</span>
            </button>

            <button
              id="nav-tab-review"
              onClick={() => setActiveTab('review')}
              className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'review'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Review Batch</span>
              {extractedCount > 0 && (
                <span className="ml-1.5 px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-slate-950 animate-bounce">
                  {extractedCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-leads"
              onClick={() => setActiveTab('leads')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'leads'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span className="hidden md:inline">Saved Leads</span>
              <span className="md:hidden">Leads</span>
              <span className="px-1.5 py-0.2 rounded text-xs bg-slate-800 text-slate-300 border border-slate-700">
                {totalLeadsCount}
              </span>
            </button>

            <button
              id="nav-tab-logs"
              onClick={() => setActiveTab('logs')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'logs'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Import History</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
