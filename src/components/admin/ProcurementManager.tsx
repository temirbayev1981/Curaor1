'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, ShoppingCart } from 'lucide-react';
import type { Booking } from '@/types/database';
import type { PurchaseOrderWithItems } from '@/domain/procurement/procurement.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function ProcurementManager() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<PurchaseOrderWithItems[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingId, setBookingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const loadData = useCallback(async () => {
    try {
      const [ordersRes, bookingsRes] = await Promise.all([
        fetch('/api/admin/procurement'),
        fetch('/api/admin/bookings'),
      ]);
      const ordersJson = (await ordersRes.json()) as { data: PurchaseOrderWithItems[] | null };
      const bookingsJson = (await bookingsRes.json()) as { data: Booking[] | null };
      setOrders(ordersJson.data ?? []);
      setBookings(bookingsJson.data ?? []);
    } catch {
      setError(t('admin.procurementTools.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [ordersRes, bookingsRes] = await Promise.all([
          fetch('/api/admin/procurement'),
          fetch('/api/admin/bookings'),
        ]);
        if (cancelled) return;
        const ordersJson = (await ordersRes.json()) as { data: PurchaseOrderWithItems[] | null };
        const bookingsJson = (await bookingsRes.json()) as { data: Booking[] | null };
        setOrders(ordersJson.data ?? []);
        setBookings(bookingsJson.data ?? []);
      } catch {
        if (!cancelled) setError(t('admin.procurementTools.fetchError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  async function generateLowStock() {
    setGenerating(true);
    setError('');
    const res = await fetch('/api/admin/procurement', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: bookingId || null }),
    });
    const json = (await res.json()) as { data: PurchaseOrderWithItems | null; error?: { message: string } };
    if (!res.ok || json.error) {
      setError(json.error?.message ?? t('admin.procurementTools.generateError'));
    } else {
      await loadData();
    }
    setGenerating(false);
  }

  async function updateStatus(orderId: string, status: 'draft' | 'ordered' | 'received') {
    await fetch(`/api/admin/procurement/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await loadData();
  }

  if (loading) {
    return <div className="skeleton h-64 rounded-xl" />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[200px] flex-1">
            <label className="mb-1 block text-xs text-zinc-500">
              {t('admin.procurementTools.linkBooking')}
            </label>
            <select
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              className="w-full rounded-lg border border-admin-border bg-admin-bg px-3 py-2 text-sm text-white"
            >
              <option value="">{t('admin.procurementTools.noBooking')}</option>
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {new Date(b.booking_start).toLocaleDateString()} — {b.venue_city}
                </option>
              ))}
            </select>
          </div>
          <Button loading={generating} onClick={generateLowStock}>
            <ShoppingCart className="h-4 w-4" />
            {t('admin.procurementTools.generateLowStock')}
          </Button>
        </div>
        {error && <p className="mt-3 text-sm text-amber-400">{error}</p>}
      </Card>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-admin-border bg-admin-surface px-4 py-12 text-center text-zinc-500">
          {t('admin.procurementTools.empty')}
        </div>
      ) : (
        orders.map((order) => (
          <Card key={order.id}>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-white">{order.title}</h2>
                <p className="text-sm text-zinc-500">
                  {new Date(order.created_at).toLocaleString()} ·{' '}
                  <span className="capitalize">{order.status}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-emerald-400">
                  {formatCurrency(Number(order.total_cost))}
                </p>
                <div className="mt-2 flex gap-2">
                  {(['draft', 'ordered', 'received'] as const).map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={order.status === status ? 'primary' : 'outline'}
                      onClick={() => updateStatus(order.id, status)}
                    >
                      {t(`admin.procurementTools.status.${status}`)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-admin-border bg-admin-bg px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-zinc-500" />
                    <span className="text-white">{item.item_name}</span>
                    {item.sku && <span className="text-zinc-500">({item.sku})</span>}
                  </div>
                  <span className="text-zinc-300">
                    {item.quantity} × {formatCurrency(Number(item.unit_cost))} ={' '}
                    {formatCurrency(Number(item.line_total))}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
