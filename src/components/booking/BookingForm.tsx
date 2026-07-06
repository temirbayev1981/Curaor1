'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, User, Calendar, MapPin } from 'lucide-react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Input';
import type { Locale } from '@/lib/i18n/config';
import { DEFAULT_TENANT_ID } from '@/lib/tenant/constants';

const EVENT_TYPES = ['wedding', 'corporate', 'private', 'stpatricks'] as const;

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
    venueState: 'NC' as 'NC' | 'SC',
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
          venueState: form.venueState,
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
      <main className="relative min-h-screen pt-24 pb-16">
        <div className="bg-grid fixed inset-0 opacity-20" />
        <div className="relative mx-auto max-w-2xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="mb-2 text-3xl font-bold text-white">{t('booking.title')}</h1>
            <p className="mb-8 text-zinc-400">{t('hero.description')}</p>
          </motion.div>

          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="flex flex-col items-center py-12 text-center">
                <CheckCircle className="mb-4 h-16 w-16 text-emerald-400" />
                <p className="mb-6 text-lg text-emerald-300">{t('booking.success')}</p>
                <Link href={`/${locale}/portal`}>
                  <Button>{t('nav.portal')}</Button>
                </Link>
              </Card>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <div className="mb-4 flex items-center gap-2 text-emerald-400">
                  <User className="h-5 w-5" />
                  <h2 className="font-semibold text-white">{t('booking.contactSection')}</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t('booking.name')}>
                    <Input
                      required
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    />
                  </Field>
                  <Field label={t('booking.email')}>
                    <Input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </Field>
                </div>
              </Card>

              <Card>
                <div className="mb-4 flex items-center gap-2 text-emerald-400">
                  <Calendar className="h-5 w-5" />
                  <h2 className="font-semibold text-white">{t('booking.eventSection')}</h2>
                </div>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={t('booking.eventType')}>
                      <Select
                        value={form.eventType}
                        onChange={(e) => setForm({ ...form, eventType: e.target.value })}
                      >
                        {EVENT_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {t(`services.${type}`)}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label={t('booking.guestCount')}>
                      <Input
                        required
                        type="number"
                        min={10}
                        max={500}
                        value={form.guestCount}
                        onChange={(e) =>
                          setForm({ ...form, guestCount: Number(e.target.value) })
                        }
                      />
                    </Field>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label={t('booking.date')}>
                      <Input
                        required
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                      />
                    </Field>
                    <Field label={t('booking.startTime')}>
                      <Input
                        required
                        type="time"
                        value={form.startTime}
                        onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                      />
                    </Field>
                    <Field label={t('booking.endTime')}>
                      <Input
                        required
                        type="time"
                        value={form.endTime}
                        onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                      />
                    </Field>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="mb-4 flex items-center gap-2 text-emerald-400">
                  <MapPin className="h-5 w-5" />
                  <h2 className="font-semibold text-white">{t('booking.venueSection')}</h2>
                </div>
                <div className="space-y-4">
                  <Field label={t('booking.venue')}>
                    <Input
                      required
                      value={form.venueAddress}
                      onChange={(e) => setForm({ ...form, venueAddress: e.target.value })}
                    />
                  </Field>
                  <Field label={t('booking.city')}>
                    <Input
                      required
                      value={form.venueCity}
                      onChange={(e) => setForm({ ...form, venueCity: e.target.value })}
                    />
                  </Field>
                  <Field label={t('booking.state')}>
                    <Select
                      value={form.venueState}
                      onChange={(e) =>
                        setForm({ ...form, venueState: e.target.value as 'NC' | 'SC' })
                      }
                    >
                      <option value="NC">North Carolina</option>
                      <option value="SC">South Carolina</option>
                    </Select>
                  </Field>
                  <Field label={t('booking.deposit')}>
                    <Select
                      value={form.depositPercent}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          depositPercent: Number(e.target.value) as 25 | 50 | 100,
                        })
                      }
                    >
                      <option value={25}>25%</option>
                      <option value={50}>50%</option>
                      <option value={100}>100%</option>
                    </Select>
                  </Field>
                </div>
              </Card>

              {status === 'error' && (
                <p className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                  {t('booking.error')}
                </p>
              )}

              <Button type="submit" loading={status === 'loading'} size="lg" className="w-full">
                {t('booking.submit')}
              </Button>
            </form>
          )}
        </div>
      </main>
      <PublicFooter locale={locale} />
    </>
  );
}
