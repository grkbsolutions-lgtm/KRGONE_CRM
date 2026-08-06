import React from 'react';
import { Users, Calendar, ShieldAlert, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';

interface StatsCardsProps {
  totalLeads: number;
  todaysImports: number;
  duplicateLeads: number;
  successRatePercentage: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  totalLeads,
  todaysImports,
  duplicateLeads,
  successRatePercentage,
}) => {
  const stats = [
    {
      title: 'Total Leads',
      value: totalLeads.toLocaleString(),
      subtitle: 'Persisted Records',
      icon: Users,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      badge: '+12% this month',
      badgeColor: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
    },
    {
      title: "Today's Imports",
      value: todaysImports.toLocaleString(),
      subtitle: 'Scanned Batches',
      icon: Calendar,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      badge: 'Active Today',
      badgeColor: 'text-blue-700 bg-blue-50 border border-blue-200',
    },
    {
      title: 'Duplicate Leads',
      value: duplicateLeads.toLocaleString(),
      subtitle: 'Conflict Shielded',
      icon: ShieldAlert,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      badge: 'Auto Detected',
      badgeColor: 'text-amber-700 bg-amber-50 border border-amber-200',
    },
    {
      title: 'Success Rate',
      value: `${successRatePercentage}%`,
      subtitle: 'AI Precision Rate',
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      badge: 'OCR Accuracy',
      badgeColor: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;

        return (
          <div
            key={idx}
            className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition relative overflow-hidden group"
          >
            {/* Top Row: Icon + Badge */}
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-11 h-11 rounded-xl ${stat.color} border flex items-center justify-center transition transform group-hover:scale-105`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.badgeColor}`}
              >
                {stat.badge}
              </span>
            </div>

            {/* Value and Label */}
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {stat.value}
              </p>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">{stat.title}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{stat.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
