'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'next/navigation';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import type { Locale } from '@/lib/i18n/config';

const DEFAULT_TENANT_ID = 'a0000000-0000-4000-8000-000000000001';

export function BookingForm({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    eventType: 'wedding',
    guestCount: 50,
    date: '',
    startTime: '18:00',
    endTime: '23:00',
    venueAddress: '',
    venueCity: searchParams.get('city') ?? '',
    depositPercent: 25 as 25 | 50 | 100,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');

    const bookingStart = new Date(`${form.date}T${form.startTime}`).toISOString();
    const bookingEnd = new Date(`${form.date}T${form.endTime}`).toISOString();

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: DEFAULT_TENANT_ID,
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          bookingStart,
          bookingEnd,
          eventType: form.eventType,
          guestCount: form.guestCount,
          venueAddress: form.venueAddress,
          venueCity: form.venueCity,
          venueState: 'NC',
          depositPercent: form.depositPercent,
        }),
      });

      const json = (await res.json()) as { error: { message: string } | null };
      if (!res.ok || json.error) {
        setStatus('error');
        return;
      }
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <>
      <PublicHeader locale={locale} />
      <main className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <h1 className="mb-8 text-3xl font-bold text-white">{t('booking.title')}</h1>

          {status === 'success' ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-emerald-300">
              {t('booking.success')}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-zinc-400">Name</label>
                  <input
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-zinc-400">Email</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-zinc-400">{t('booking.eventType')}</label>
                  <select
                    value={form.eventType}
                    onChange={(e) => setForm({ ...form, eventType: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  >
                    <option value="wedding">Wedding</option>
                    <option value="corporate">Corporate</option>
                    <option value="private">Private Party</option>
                    <option value="stpatricks">St. Patrick&apos;s Day</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-zinc-400">{t('booking.guestCount')}</label>
                  <input
                    required
                    type="number"
                    min={10}
                    max={500}
                    value={form.guestCount}
                    onChange={(e) => setForm({ ...form, guestCount: Number(e.target.value) })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm text-zinc-400">{t('booking.date')}</label>
                  <input
                    required
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-zinc-400">{t('booking.startTime')}</label>
                  <input
                    required
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-zinc-400">{t('booking.endTime')}</label>
                  <input
                    required
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm text-zinc-400">{t('booking.venue')}</label>
                <input
                  required
                  value={form.venueAddress}
                  onChange={(e) => setForm({ ...form, venueAddress: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-zinc-400">{t('booking.city')}</label>
                <input
                  required
                  value={form.venueCity}
                  onChange={(e) => setForm({ ...form, venueCity: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-zinc-400">{t('booking.deposit')}</label>
                <select
                  value={form.depositPercent}
                  onChange={(e) =>
                    setForm({ ...form, depositPercent: Number(e.target.value) as 25 | 50 | 100 })
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
                >
                  <option value={25}>25%</option>
                  <option value={50}>50%</option>
                  <option value={100}>100%</option>
                </select>
              </div>

              {status === 'error' && (
                <p className="text-sm text-red-400">{t('booking.error')}</p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full rounded-xl bg-emerald-500 py-3 font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
              >
                {status === 'loading' ? '...' : t('booking.submit')}
              </button>
            </form>
          )}
        </div>
      </main>
      <PublicFooter locale={locale} />
    </>
  );
}
