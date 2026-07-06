'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import type { MonthlyRevenue } from '@/domain/analytics/analytics.service';

export function RevenueChart({ data }: { data: MonthlyRevenue[] }) {
  const { t } = useTranslation();
  const max = Math.max(...data.map((d) => d.revenue), 1);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="rounded-2xl border border-admin-border bg-admin-surface p-6">
      <h3 className="mb-6 text-sm font-medium text-zinc-400">
        {t('admin.revenueChart')}
      </h3>
      <div className="flex h-48 items-end gap-3">
        {data.map((item, i) => {
          const height = (item.revenue / max) * 100;
          return (
            <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-[10px] font-medium text-emerald-400">
                {item.revenue > 0 ? formatCurrency(item.revenue) : ''}
              </span>
              <motion.div
                className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400"
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(height, 4)}%` }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: 'easeOut' }}
              />
              <span className="text-xs text-zinc-500">{item.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
