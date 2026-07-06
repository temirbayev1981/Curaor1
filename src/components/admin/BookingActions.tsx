'use client';

import { useState } from 'react';
import type { Booking, BookingStatus } from '@/types/database';
import { getNextStatuses } from '@/domain/booking/booking.state-machine';

interface BookingActionsProps {
  booking: Booking;
  tenantId: string;
  onUpdated: (booking: Booking) => void;
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  deposit_paid: 'Deposit Paid',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function BookingActions({ booking, tenantId, onUpdated }: BookingActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const nextStatuses = getNextStatuses(booking.status);

  async function handleTransition(status: BookingStatus) {
    setLoading(status);
    const res = await fetch(`/api/admin/bookings/${booking.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, status }),
    });
    const json = (await res.json()) as { data: Booking | null };
    if (json.data) onUpdated(json.data);
    setLoading(null);
  }

  if (nextStatuses.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {nextStatuses.map((status) => (
        <button
          key={status}
          onClick={() => handleTransition(status)}
          disabled={loading !== null}
          className={`rounded px-2 py-1 text-xs font-medium transition ${
            status === 'cancelled'
              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
          } disabled:opacity-50`}
        >
          {loading === status ? '...' : STATUS_LABELS[status]}
        </button>
      ))}
    </div>
  );
}
