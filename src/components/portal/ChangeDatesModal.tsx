'use client';

import { useState } from 'react';
import { X, CalendarClock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
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
  const { t } = useTranslation();
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
      setErrorMsg(json.error?.message ?? t('portal.changeDatesModal.error'));
      return;
    }

    if (json.data) onSuccess(json.data);
    onClose();
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="glass-card w-full max-w-md rounded-2xl p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                <CalendarClock className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                {t('portal.changeDatesModal.title')}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-zinc-400">
                {t('portal.changeDatesModal.date')}
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm text-zinc-400">
                  {t('portal.changeDatesModal.start')}
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-zinc-400">
                  {t('portal.changeDatesModal.end')}
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>
            </div>
            {status === 'error' && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-400">
                {errorMsg}
              </p>
            )}
            <Button type="submit" loading={status === 'loading'} className="w-full">
              {status === 'loading'
                ? t('portal.changeDatesModal.saving')
                : t('portal.changeDatesModal.save')}
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
