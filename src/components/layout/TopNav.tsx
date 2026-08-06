import React, { useState } from 'react';
import { Search, Bell, Menu, User, Sparkles, CheckCircle2 } from 'lucide-react';

interface TopNavProps {
  onToggleMobileSidebar: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  unreadNotificationsCount?: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  onToggleMobileSidebar,
  searchTerm,
  setSearchTerm,
  unreadNotificationsCount = 2,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Left: Mobile Sidebar Trigger + Global Search */}
      <div className="flex items-center space-x-3 flex-1 max-w-md">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Box */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search leads, companies, phone numbers..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 transition outline-none"
          />
        </div>
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center space-x-3">
        {/* Notifications Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-900">Notifications</span>
                <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                  2 New
                </span>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-800 font-medium">Duplicate Shield Active</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Database checks preventing duplicate phone and company records automatically.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start space-x-2.5">
                  <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-800 font-medium">Gemini 2.5 Vision Ready</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Batch visiting card & catalog OCR extraction ready.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-xs shadow-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">CRM Operator</p>
            <p className="text-[10px] text-slate-500 leading-tight">Admin User</p>
          </div>
        </div>
      </div>
    </header>
  );
};
