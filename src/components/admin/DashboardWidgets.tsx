'use client';

import { TrendingUp, DollarSign, Package, Users, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { DashboardMetrics } from '@/domain/analytics/analytics.service';

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
}

function MetricCard({ label, value, icon, trend }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-admin-border bg-admin-surface p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-zinc-400">{label}</span>
        <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">{icon}</div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {trend && <p className="mt-1 text-xs text-emerald-400">{trend}</p>}
    </div>
  );
}

export function DashboardWidgets({ metrics }: { metrics: DashboardMetrics }) {
  const { t } = useTranslation();

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <MetricCard
        label={t('admin.netProfit')}
        value={formatCurrency(metrics.netProfit)}
        icon={<DollarSign className="h-4 w-4" />}
      />
      <MetricCard
        label={t('admin.roi')}
        value={`${metrics.roi}%`}
        icon={<TrendingUp className="h-4 w-4" />}
      />
      <MetricCard
        label={t('admin.cogs')}
        value={formatCurrency(metrics.cogs)}
        icon={<Package className="h-4 w-4" />}
      />
      <MetricCard
        label={t('admin.ltv')}
        value={formatCurrency(metrics.customerLtv)}
        icon={<Users className="h-4 w-4" />}
      />
      <MetricCard
        label={t('admin.conversion')}
        value={`${metrics.conversionRate}%`}
        icon={<Target className="h-4 w-4" />}
        trend={`${metrics.completedBookings}/${metrics.totalBookings} bookings`}
      />
    </div>
  );
}
