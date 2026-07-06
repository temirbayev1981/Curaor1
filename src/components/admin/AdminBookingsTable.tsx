'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Booking } from '@/types/database';
import { BookingActions } from '@/components/admin/BookingActions';
import { Badge, statusToBadge } from '@/components/ui/Badge';
import { BOOKING_STATUS_KEYS } from '@/lib/i18n/booking-status';
import { DEFAULT_TENANT_ID } from '@/lib/tenant/constants';

export function AdminBookingsTable() {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/bookings')
      .then((res) => res.json())
      .then((json: { data: Booking[] | null }) => {
        setBookings(json.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleUpdated(updated: Booking) {
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  }

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  if (loading) {
    return <div className="skeleton h-48 rounded-xl" />;
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
                <td className="px-4 py-3 font-medium text-white capitalize">
                  {booking.event_type}
                </td>
                <td className="px-4 py-3 text-zinc-300">
                  {new Date(booking.booking_start).toLocaleDateString()}
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
