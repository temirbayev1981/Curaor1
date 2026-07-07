'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTenantId } from '@/components/providers/TenantProvider';
import {
  buildDefaultMonthDays,
  type DayAvailabilityStatus,
} from '@/lib/booking/availability-utils';

interface AvailabilityCalendarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

function formatMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function statusClass(status: DayAvailabilityStatus): string {
  switch (status) {
    case 'open':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30';
    case 'limited':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30';
    case 'full':
      return 'bg-red-500/10 text-zinc-500 border-white/5 cursor-not-allowed';
  }
}

interface DayEntry {
  date: string;
  status: DayAvailabilityStatus;
  bookingCount: number;
}

export function AvailabilityCalendar({ selectedDate, onSelectDate }: AvailabilityCalendarProps) {
  const { t } = useTranslation();
  const tenantId = useTenantId();
  const [viewMonth, setViewMonth] = useState(() => {
    const base = selectedDate ? new Date(`${selectedDate}T12:00:00`) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [monthData, setMonthData] = useState<
    Record<string, { days: DayEntry[]; loaded: boolean }>
  >({});

  const monthKey = formatMonthKey(viewMonth);
  const currentMonth = monthData[monthKey];
  const days = currentMonth?.days ?? [];
  const loading = !currentMonth?.loaded;

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ tenantId, month: monthKey });
    fetch(`/api/bookings/availability?${params}`)
      .then((res) => res.json())
      .then((json: { data: { days: DayEntry[] } | null; error?: { message: string } | null }) => {
        if (cancelled) return;
        const next = json.data?.days?.length ? json.data.days : buildDefaultMonthDays(monthKey);
        setMonthData((prev) => ({
          ...prev,
          [monthKey]: { days: next, loaded: true },
        }));
      })
      .catch(() => {
        if (cancelled) return;
        setMonthData((prev) => ({
          ...prev,
          [monthKey]: { days: buildDefaultMonthDays(monthKey), loaded: true },
        }));
      });
    return () => {
      cancelled = true;
    };
  }, [monthKey, tenantId]);

  const weekdayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(2024, 0, i + 7);
      return formatter.format(d);
    });
  }, []);

  const firstWeekday = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1).getDay();
  const monthLabel = viewMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const today = new Date().toISOString().slice(0, 10);

  function shiftMonth(delta: number) {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/5 hover:text-white"
          aria-label={t('booking.calendar.prevMonth')}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium text-white">{monthLabel}</span>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/5 hover:text-white"
          aria-label={t('booking.calendar.nextMonth')}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs text-zinc-500">
        {weekdayLabels.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>

      {loading ? (
        <div className="skeleton h-48 rounded-lg" />
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstWeekday }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {days.map((day) => {
            const dayNum = Number(day.date.slice(8, 10));
            const isPast = day.date < today;
            const isSelected = day.date === selectedDate;
            const disabled = day.status === 'full' || isPast;

            return (
              <button
                key={day.date}
                type="button"
                disabled={disabled}
                onClick={() => onSelectDate(day.date)}
                title={t(`booking.calendar.status.${day.status}`)}
                className={`flex h-9 items-center justify-center rounded-lg border text-sm transition ${statusClass(day.status)} ${
                  isSelected ? 'ring-2 ring-gold ring-offset-1 ring-offset-emerald-950' : ''
                } ${isPast ? 'opacity-40' : ''}`}
              >
                {dayNum}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-emerald-500/40" />
          {t('booking.calendar.legend.open')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-amber-500/40" />
          {t('booking.calendar.legend.limited')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-red-500/20" />
          {t('booking.calendar.legend.full')}
        </span>
      </div>
    </div>
  );
}
