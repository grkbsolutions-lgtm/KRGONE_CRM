import React from 'react';
import {
  LayoutDashboard,
  Scan,
  Users,
  History,
  Settings,
  Sparkles,
  X,
  FileSpreadsheet,
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'scanner' | 'excel' | 'leads' | 'logs' | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  totalLeadsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile,
  totalLeadsCount = 0,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'scanner' as ActiveTab,
      label: 'Smart Scanner',
      icon: Scan,
      badge: 'AI Vision',
    },
    {
      id: 'excel' as ActiveTab,
      label: 'Excel Import',
      icon: FileSpreadsheet,
      badge: 'Batch',
    },
    {
      id: 'leads' as ActiveTab,
      label: 'Leads',
      icon: Users,
      badge: totalLeadsCount > 0 ? `${totalLeadsCount}` : null,
    },
    {
      id: 'logs' as ActiveTab,
      label: 'Import Logs',
      icon: History,
      badge: null,
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-sm ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo Section */}
          <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
                <Scan className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  <span>AI Smart Scanner</span>
                </h1>
                <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider block -mt-0.5">
                  CRM Lead Extraction
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpenMobile(false)}
              className="lg:hidden text-slate-500 hover:text-slate-800 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.id === 'scanner'
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer / System Status */}
        <div className="p-4 border-t border-slate-200">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center space-x-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <p className="text-xs font-semibold text-slate-800">Gemini Vision OCR</p>
              <p className="text-[10px] text-slate-500">Ready for Document Scanning</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
