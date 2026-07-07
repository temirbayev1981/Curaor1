'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import type { Booking, BookingStatus } from '@/types/database';
import { Input, Select } from '@/components/ui/Input';
import { BookingActions } from '@/components/admin/BookingActions';
import { Badge, statusToBadge } from '@/components/ui/Badge';
import { BOOKING_STATUS_KEYS } from '@/lib/i18n/booking-status';
import { DEFAULT_TENANT_ID } from '@/lib/tenant/constants';
import type { Locale } from '@/lib/i18n/config';

const EVENT_TYPE_KEYS: Record<string, string> = {
  wedding: 'services.weddings',
  corporate: 'services.corporate',
  private: 'services.private',
  stpatricks: 'services.stpatricks',
};

export function AdminBookingsTable({ locale }: { locale: Locale }) {
  const { t, i18n } = useTranslation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [citySearch, setCitySearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/bookings')
      .then(async (res) => {
        const json = (await res.json()) as {
          data: Booking[] | null;
          error: { message: string } | null;
        };
        if (!res.ok || json.error) {
          setError(json.error?.message ?? t('admin.bookingsTable.fetchError'));
          setBookings([]);
        } else {
          setBookings(json.data ?? []);
        }
        setLoading(false);
      })
      .catch(() => {
        setError(t('admin.bookingsTable.fetchError'));
        setLoading(false);
      });
  }, [t]);

  function handleUpdated(updated: Booking) {
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  }

  const dateLocale = i18n.language === 'ru' ? 'ru-RU' : 'en-US';
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat(dateLocale, { style: 'currency', currency: 'USD' }).format(n);

  const filtered = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (citySearch && !b.venue_city.toLowerCase().includes(citySearch.toLowerCase())) {
      return false;
    }
    return true;
  });

  function exportCsv() {
    const rows = [
      ['event', 'date', 'city', 'guests', 'total', 'status'].join(','),
      ...filtered.map((b) =>
        [
          b.event_type,
          b.booking_start,
          b.venue_city,
          b.guest_count,
          b.subtotal,
          b.status,
        ].join(',')
      ),
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookings.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return <div className="skeleton h-48 rounded-xl" />;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-8 text-center text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'all')}
          className="w-40"
        >
          <option value="all">{t('admin.bookingsTable.allStatuses')}</option>
          <option value="pending">{t('status.pending')}</option>
          <option value="deposit_paid">{t('status.deposit_paid')}</option>
          <option value="confirmed">{t('status.confirmed')}</option>
          <option value="completed">{t('status.completed')}</option>
          <option value="cancelled">{t('status.cancelled')}</option>
        </Select>
        <Input
          placeholder={t('admin.bookingsTable.searchCity')}
          value={citySearch}
          onChange={(e) => setCitySearch(e.target.value)}
          className="max-w-xs"
        />
        <button
          type="button"
          onClick={exportCsv}
          className="rounded-lg border border-admin-border px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
        >
          {t('admin.bookingsTable.export')}
        </button>
      </div>
    <div className="overflow-x-auto rounded-2xl border border-admin-border bg-admin-surface">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="border-b border-admin-border bg-admin-bg">
          <tr>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
              {t('admin.bookingsTable.event')}
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
              {t('admin.bookingsTable.date')}
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
              {t('admin.bookingsTable.city')}
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
              {t('admin.bookingsTable.guests')}
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
              {t('admin.bookingsTable.total')}
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
              {t('admin.bookingsTable.status')}
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
              {t('admin.bookingsTable.actions')}
            </th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                {t('admin.bookingsTable.empty')}
              </td>
            </tr>
          ) : (
            filtered.map((booking) => (
              <tr
                key={booking.id}
                className="border-b border-admin-border transition hover:bg-white/[0.02]"
              >
                <td className="px-4 py-3 font-medium text-white">
                  <Link
                    href={`/${locale}/admin/bookings/${booking.id}`}
                    className="transition hover:text-emerald-400"
                  >
                    {t(EVENT_TYPE_KEYS[booking.event_type] ?? booking.event_type)}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-300">
                  {new Date(booking.booking_start).toLocaleDateString(dateLocale)}
                </td>
                <td className="px-4 py-3 text-zinc-300">{booking.venue_city}</td>
                <td className="px-4 py-3 text-zinc-300">{booking.guest_count}</td>
                <td className="px-4 py-3 text-zinc-300">
                  {formatCurrency(Number(booking.subtotal))}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusToBadge(booking.status)}>
                    {t(BOOKING_STATUS_KEYS[booking.status])}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <BookingActions
                    booking={booking}
                    tenantId={DEFAULT_TENANT_ID}
                    onUpdated={handleUpdated}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
    </div>
  );
}
