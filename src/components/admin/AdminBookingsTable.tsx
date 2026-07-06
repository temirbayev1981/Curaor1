'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Booking } from '@/types/database';
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
    <div className="overflow-hidden rounded-2xl border border-admin-border bg-admin-surface">
      <table className="w-full text-left text-sm">
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
          {bookings.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                {t('admin.bookingsTable.empty')}
              </td>
            </tr>
          ) : (
            bookings.map((booking) => (
              <tr
                key={booking.id}
                className="border-b border-admin-border transition hover:bg-white/[0.02]"
              >
                <td className="px-4 py-3 font-medium text-white">
                  {t(EVENT_TYPE_KEYS[booking.event_type] ?? booking.event_type)}
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
  );
}
