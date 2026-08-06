import React from 'react';
import { StatsCards } from './dashboard/StatsCards';
import { SmartScannerPanel } from './scanner/SmartScannerPanel';
import { RecentImportsTable } from './dashboard/RecentImportsTable';
import { QuickTipsCard } from './dashboard/QuickTipsCard';
import { DashboardStats, ImportLogRecord } from '../types';

interface DashboardProps {
  stats: DashboardStats | null;
  onOpenCamera: () => void;
  onFileSelect: (file: File) => void;
  onOpenSamples: () => void;
  onNavigateTab: (tab: 'dashboard' | 'scanner' | 'leads' | 'logs') => void;
  isScanning: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  onOpenCamera,
  onFileSelect,
  onOpenSamples,
  onNavigateTab,
  isScanning,
}) => {
  const totalLeads = stats?.totalCompanies || 0;
  const todaysImports = stats?.recentLogs ? stats.recentLogs.length : 0;
  const duplicateLeads = stats?.recentLogs
    ? stats.recentLogs.reduce((acc, l) => acc + l.duplicates, 0)
    : 0;
  const successRatePercentage = 98.4;

  const logs: ImportLogRecord[] = stats?.recentLogs || [];

  return (
    <div className="space-y-8 pb-16">
      {/* Four Statistic Cards */}
      <StatsCards
        totalLeads={totalLeads}
        todaysImports={todaysImports}
        duplicateLeads={duplicateLeads}
        successRatePercentage={successRatePercentage}
      />

      {/* Main Scanner Panel */}
      <SmartScannerPanel
        onFileSelect={onFileSelect}
        onOpenCamera={onOpenCamera}
        onOpenSampleDocs={onOpenSamples}
        isScanning={isScanning}
      />

      {/* Grid: Recent Imports Table (Left 2 cols) + Quick Tips Card (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentImportsTable logs={logs} onViewAllLogs={() => onNavigateTab('logs')} />
        </div>

        <div>
          <QuickTipsCard />
        </div>
      </div>
    </div>
  );
};
