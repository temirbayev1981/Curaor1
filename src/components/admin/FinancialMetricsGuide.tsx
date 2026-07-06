'use client';

import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { DashboardMetrics } from '@/domain/analytics/analytics.service';

export function FinancialMetricsGuide({ metrics }: { metrics: DashboardMetrics }) {
  const { t } = useTranslation();

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const items = [
    {
      label: t('admin.totalRevenue'),
      value: formatCurrency(metrics.totalRevenue),
      hint: t('admin.metricsHints.revenue'),
    },
    {
      label: t('admin.netProfit'),
      value: formatCurrency(metrics.netProfit),
      hint: t('admin.metricsHints.netProfit'),
    },
    {
      label: t('admin.roi'),
      value: `${metrics.roi}%`,
      hint: t('admin.metricsHints.roi'),
    },
    {
      label: t('admin.cogs'),
      value: formatCurrency(metrics.cogs),
      hint: t('admin.metricsHints.cogs'),
    },
    {
      label: t('admin.ltv'),
      value: formatCurrency(metrics.customerLtv),
      hint: t('admin.metricsHints.ltv'),
    },
    {
      label: t('admin.conversion'),
      value: `${metrics.conversionRate}%`,
      hint: t('admin.metricsHints.conversion'),
    },
  ];

  return (
    <div className="rounded-2xl border border-admin-border bg-admin-surface p-6">
      <div className="mb-4 flex items-center gap-2">
        <Info className="h-5 w-5 text-emerald-400" />
        <h3 className="text-lg font-semibold text-white">{t('admin.metricsGuide.title')}</h3>
      </div>
      <p className="mb-6 text-sm text-zinc-400">{t('admin.metricsGuide.subtitle')}</p>
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-admin-border bg-admin-bg/50 p-4"
          >
            <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              {item.label}
            </dt>
            <dd className="mt-1 text-xl font-bold text-emerald-400">{item.value}</dd>
            <dd className="mt-2 text-xs leading-relaxed text-zinc-500">{item.hint}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
