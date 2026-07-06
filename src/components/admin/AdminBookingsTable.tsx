'use client';

import { useEffect, useState } from 'react';
import type { Booking } from '@/types/database';
import { BookingActions } from '@/components/admin/BookingActions';
import { DEFAULT_TENANT_ID } from '@/lib/tenant/constants';

export function AdminBookingsTable() {
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

  if (loading) {
    return <div className="skeleton h-48 rounded-xl" />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-admin-border">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-admin-border bg-admin-bg">
          <tr>
            <th className="px-4 py-3 text-zinc-400">Event</th>
            <th className="px-4 py-3 text-zinc-400">Date</th>
            <th className="px-4 py-3 text-zinc-400">City</th>
            <th className="px-4 py-3 text-zinc-400">Guests</th>
            <th className="px-4 py-3 text-zinc-400">Total</th>
            <th className="px-4 py-3 text-zinc-400">Status</th>
            <th className="px-4 py-3 text-zinc-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                No bookings yet
              </td>
            </tr>
          ) : (
            bookings.map((booking) => (
              <tr key={booking.id} className="border-b border-admin-border">
                <td className="px-4 py-3 text-white capitalize">{booking.event_type}</td>
                <td className="px-4 py-3 text-zinc-300">
                  {new Date(booking.booking_start).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-zinc-300">{booking.venue_city}</td>
                <td className="px-4 py-3 text-zinc-300">{booking.guest_count}</td>
                <td className="px-4 py-3 text-zinc-300">${booking.subtotal}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400 capitalize">
                    {booking.status.replace('_', ' ')}
                  </span>
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
