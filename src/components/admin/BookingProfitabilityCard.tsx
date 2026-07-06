'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingDown, TrendingUp } from 'lucide-react';
import type { EventProfitability } from '@/domain/profit/profit.service';
import { Card } from '@/components/ui/Card';

export function BookingProfitabilityCard({ bookingId }: { bookingId: string }) {
  const { t } = useTranslation();
  const [data, setData] = useState<EventProfitability | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/admin/bookings/${bookingId}/profit`)
      .then(async (res) => {
        const json = (await res.json()) as {
          data: EventProfitability | null;
          error?: { message: string };
        };
        if (!res.ok || json.error) {
          setError(json.error?.message ?? t('admin.profit.fetchError'));
          return;
        }
        setData(json.data);
      })
      .catch(() => setError(t('admin.profit.fetchError')));
  }, [bookingId, t]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  if (error) {
    return (
      <Card>
        <p className="text-sm text-zinc-500">{error}</p>
      </Card>
    );
  }

  if (!data) {
    return <div className="skeleton h-48 rounded-xl" />;
  }

  const positive = data.margin >= 0;

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-white">{t('admin.profit.title')}</h2>
        <div
          className={`flex items-center gap-1 text-sm font-semibold ${
            positive ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          {positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {data.marginPercent.toFixed(1)}%
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-admin-border bg-admin-bg p-3">
          <p className="text-xs text-zinc-500">{t('admin.profit.revenue')}</p>
          <p className="text-lg font-bold text-white">{formatCurrency(data.revenue)}</p>
        </div>
        <div className="rounded-lg border border-admin-border bg-admin-bg p-3">
          <p className="text-xs text-zinc-500">{t('admin.profit.cogs')}</p>
          <p className="text-lg font-bold text-white">{formatCurrency(data.cogs)}</p>
        </div>
        <div className="rounded-lg border border-admin-border bg-admin-bg p-3">
          <p className="text-xs text-zinc-500">{t('admin.profit.delivery')}</p>
          <p className="text-lg font-bold text-white">{formatCurrency(data.deliveryCost)}</p>
        </div>
        <div className="rounded-lg border border-admin-border bg-admin-bg p-3">
          <p className="text-xs text-zinc-500">{t('admin.profit.labor')}</p>
          <p className="text-lg font-bold text-white">{formatCurrency(data.laborCost)}</p>
        </div>
        <div className="rounded-lg border border-admin-border bg-admin-bg p-3">
          <p className="text-xs text-zinc-500">{t('admin.profit.totalCosts')}</p>
          <p className="text-lg font-bold text-white">{formatCurrency(data.totalCosts)}</p>
        </div>
        <div className="rounded-lg border border-admin-border bg-admin-bg p-3">
          <p className="text-xs text-zinc-500">{t('admin.profit.margin')}</p>
          <p
            className={`text-lg font-bold ${positive ? 'text-emerald-400' : 'text-red-400'}`}
          >
            {formatCurrency(data.margin)}
          </p>
        </div>
      </div>

      {(data.cogsBreakdown.length > 0 || data.laborBreakdown.length > 0) && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {data.cogsBreakdown.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase text-zinc-500">
                {t('admin.profit.cogsDetail')}
              </p>
              <ul className="space-y-1 text-sm text-zinc-400">
                {data.cogsBreakdown.map((row) => (
                  <li key={row.sku}>
                    {row.name}: {row.quantity} × {formatCurrency(row.cost / row.quantity)} ={' '}
                    {formatCurrency(row.cost)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.laborBreakdown.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase text-zinc-500">
                {t('admin.profit.laborDetail')}
              </p>
              <ul className="space-y-1 text-sm text-zinc-400">
                {data.laborBreakdown.map((row) => (
                  <li key={row.name}>
                    {row.name}: {row.hours}h = {formatCurrency(row.pay)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
