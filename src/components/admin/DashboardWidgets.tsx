'use client';

import { TrendingUp, DollarSign, Package, Users, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import type { DashboardMetrics } from '@/domain/analytics/analytics.service';

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  delay?: number;
}

function MetricCard({ label, value, icon, trend, delay = 0 }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group rounded-2xl border border-admin-border bg-admin-surface p-5 transition hover:border-emerald-500/20 hover:bg-admin-surface-elevated"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          {label}
        </span>
        <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 transition group-hover:bg-emerald-500/20">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {trend && <p className="mt-1 text-xs text-emerald-400">{trend}</p>}
    </motion.div>
  );
}

export function DashboardWidgets({ metrics }: { metrics: DashboardMetrics }) {
  const { t } = useTranslation();

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <MetricCard
        label={t('admin.totalRevenue')}
        value={formatCurrency(metrics.totalRevenue)}
        icon={<DollarSign className="h-4 w-4" />}
        delay={0}
      />
      <MetricCard
        label={t('admin.netProfit')}
        value={formatCurrency(metrics.netProfit)}
        icon={<TrendingUp className="h-4 w-4" />}
        delay={0.05}
      />
      <MetricCard
        label={t('admin.roi')}
        value={`${metrics.roi}%`}
        icon={<TrendingUp className="h-4 w-4" />}
        delay={0.1}
      />
      <MetricCard
        label={t('admin.cogs')}
        value={formatCurrency(metrics.cogs)}
        icon={<Package className="h-4 w-4" />}
        delay={0.15}
      />
      <MetricCard
        label={t('admin.ltv')}
        value={formatCurrency(metrics.customerLtv)}
        icon={<Users className="h-4 w-4" />}
        delay={0.2}
      />
      <MetricCard
        label={t('admin.conversion')}
        value={`${metrics.conversionRate}%`}
        icon={<Target className="h-4 w-4" />}
        trend={t('admin.bookingsTrend', {
          completed: metrics.completedBookings,
          total: metrics.totalBookings,
        })}
        delay={0.25}
      />
    </div>
  );
}
