'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import type { Booking } from '@/types/database';
import { Badge, statusToBadge } from '@/components/ui/Badge';
import { BOOKING_STATUS_KEYS } from '@/lib/i18n/booking-status';
import type { Locale } from '@/lib/i18n/config';

export function OperationsCalendar({ locale }: { locale: Locale }) {
  const { t, i18n } = useTranslation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    fetch('/api/admin/bookings')
      .then((res) => res.json())
      .then((json: { data: Booking[] | null }) => setBookings(json.data ?? []))
      .catch(() => setBookings([]));
  }, []);

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const dateLocale = i18n.language === 'ru' ? 'ru-RU' : 'en-US';

  const byDate = new Map<string, Booking[]>();
  for (const booking of bookings) {
    const key = booking.booking_start.slice(0, 10);
    const list = byDate.get(key) ?? [];
    list.push(booking);
    byDate.set(key, list);
  }

  const cells: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function shiftMonth(delta: number) {
    setMonth(new Date(year, monthIndex + delta, 1));
  }

  return (
    <div className="rounded-xl border border-admin-border bg-admin-surface p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{t('admin.calendar.title')}</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="rounded-lg border border-admin-border px-3 py-1 text-sm text-zinc-400 hover:text-white"
          >
            ←
          </button>
          <span className="min-w-[140px] text-center text-sm font-medium text-white">
            {month.toLocaleDateString(dateLocale, { month: 'long', year: 'numeric' })}
          </span>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="rounded-lg border border-admin-border px-3 py-1 text-sm text-zinc-400 hover:text-white"
          >
            →
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium uppercase text-zinc-500">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day == null) {
            return <div key={`empty-${i}`} className="min-h-[72px]" />;
          }
          const dateKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayBookings = byDate.get(dateKey) ?? [];

          return (
            <div
              key={dateKey}
              className={`min-h-[72px] rounded-lg border p-1 ${
                dayBookings.length
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-admin-border bg-admin-surface-elevated'
              }`}
            >
              <span className="text-xs text-zinc-500">{day}</span>
              <div className="mt-1 space-y-1">
                {dayBookings.slice(0, 2).map((b) => (
                  <Link
                    key={b.id}
                    href={`/${locale}/admin/bookings`}
                    className="block truncate rounded bg-emerald-500/20 px-1 py-0.5 text-[10px] text-emerald-300"
                    title={b.venue_city}
                  >
                    {b.venue_city}
                  </Link>
                ))}
                {dayBookings.length > 2 && (
                  <span className="text-[10px] text-zinc-500">+{dayBookings.length - 2}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 space-y-2">
        <h3 className="text-sm font-medium text-zinc-400">{t('admin.calendar.upcoming')}</h3>
        {bookings
          .filter((b) => new Date(b.booking_start) >= new Date() && b.status !== 'cancelled')
          .slice(0, 5)
          .map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between rounded-lg border border-admin-border px-3 py-2 text-sm"
            >
              <div>
                <p className="text-white">
                  {new Date(b.booking_start).toLocaleDateString(dateLocale)} — {b.venue_city}
                </p>
                <p className="text-xs text-zinc-500">{b.event_type}</p>
              </div>
              <Badge variant={statusToBadge(b.status)}>
                {t(BOOKING_STATUS_KEYS[b.status])}
              </Badge>
            </div>
          ))}
      </div>
    </div>
  );
}
