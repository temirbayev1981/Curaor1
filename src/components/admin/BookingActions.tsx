'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Booking, BookingStatus } from '@/types/database';
import { getNextStatuses } from '@/domain/booking/booking.state-machine';
import { Button } from '@/components/ui/Button';
import { BOOKING_STATUS_KEYS } from '@/lib/i18n/booking-status';

interface BookingActionsProps {
  booking: Booking;
  tenantId: string;
  onUpdated: (booking: Booking) => void;
}

export function BookingActions({ booking, tenantId, onUpdated }: BookingActionsProps) {
  const { t } = useTranslation();
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
        <Button
          key={status}
          size="sm"
          variant={status === 'cancelled' ? 'danger' : 'outline'}
          onClick={() => handleTransition(status)}
          loading={loading === status}
        >
          {t(BOOKING_STATUS_KEYS[status])}
        </Button>
      ))}
    </div>
  );
}
