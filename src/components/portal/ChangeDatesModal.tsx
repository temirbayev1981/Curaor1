'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { Booking } from '@/types/database';

interface ChangeDatesModalProps {
  booking: Booking;
  onClose: () => void;
  onSuccess: (updated: Booking) => void;
}

export function ChangeDatesModal({
  booking,
  onClose,
  onSuccess,
}: ChangeDatesModalProps) {
  const startDate = new Date(booking.booking_start);
  const endDate = new Date(booking.booking_end);

  const [date, setDate] = useState(startDate.toISOString().split('T')[0] ?? '');
  const [startTime, setStartTime] = useState(
    startDate.toTimeString().slice(0, 5)
  );
  const [endTime, setEndTime] = useState(endDate.toTimeString().slice(0, 5));
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    const bookingStart = new Date(`${date}T${startTime}`).toISOString();
    const bookingEnd = new Date(`${date}T${endTime}`).toISOString();

    const res = await fetch(`/api/portal/bookings/${booking.id}/dates`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingStart, bookingEnd }),
    });

    const json = (await res.json()) as {
      data: Booking | null;
      error: { message: string } | null;
    };

    if (!res.ok || json.error) {
      setStatus('error');
      setErrorMsg(json.error?.message ?? 'Failed to update dates');
      return;
    }

    if (json.data) onSuccess(json.data);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-zinc-900 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Change Event Dates</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-zinc-400">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-zinc-400">Start</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-400">End</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
              />
            </div>
          </div>
          {status === 'error' && (
            <p className="text-sm text-red-400">{errorMsg}</p>
          )}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full rounded-lg bg-emerald-500 py-2 font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            {status === 'loading' ? 'Saving...' : 'Save New Dates'}
          </button>
        </form>
      </div>
    </div>
  );
}
