'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, User, Calendar, MapPin, Star } from 'lucide-react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { PublicSiteExtras } from '@/components/layout/PublicSiteExtras';
import { QuotePreview } from '@/components/booking/QuotePreview';
import { AvailabilityCalendar } from '@/components/booking/AvailabilityCalendar';
import { AddressAutocomplete } from '@/components/booking/AddressAutocomplete';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Input';
import type { Locale } from '@/lib/i18n/config';
import { useTenantId } from '@/components/providers/TenantProvider';
import {
  isPackageTierId,
  PACKAGE_TIER_IDS,
  type PackageTierId,
} from '@/lib/booking/packages';

const EVENT_TYPES = ['wedding', 'corporate', 'private', 'stpatricks'] as const;

function initialPackage(searchParams: ReturnType<typeof useSearchParams>): PackageTierId {
  const pkg = searchParams.get('package');
  return pkg && isPackageTierId(pkg) ? pkg : 'shamrock';
}

export function BookingForm({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const tenantId = useTenantId();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [slotAvailable, setSlotAvailable] = useState(true);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    eventType: searchParams.get('event') ?? 'wedding',
    guestCount: 50,
    date: '',
    startTime: '18:00',
    endTime: '23:00',
    venueAddress: '',
    venueCity: searchParams.get('city') ?? '',
    venueState: 'NC' as 'NC' | 'SC',
    packageTier: initialPackage(searchParams),
    depositPercent: 25 as 25 | 50 | 100,
  });

  const { depositPercent } = form;

  const paid = searchParams.get('paid') === '1';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!slotAvailable) return;

    setStatus('loading');
    setErrorMessage('');

    const bookingStart = new Date(`${form.date}T${form.startTime}`).toISOString();
    const bookingEnd = new Date(`${form.date}T${form.endTime}`).toISOString();

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          locale,
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
          depositPercent,
          packageTier: form.packageTier,
        }),
      });

      const json = (await res.json()) as {
        data: { booking: { id: string }; checkoutUrl: string | null } | null;
        error: { message: string } | null;
      };

      if (!res.ok || json.error) {
        setErrorMessage(json.error?.message ?? t('booking.error'));
        setStatus('error');
        return;
      }

      if (json.data?.checkoutUrl) {
        window.location.href = json.data.checkoutUrl;
        return;
      }

      setStatus('success');
    } catch {
      setErrorMessage(t('booking.error'));
      setStatus('error');
    }
  }

  if (paid) {
    return (
      <>
        <PublicHeader locale={locale} />
        <main className="relative min-h-screen pt-24 pb-16">
          <div className="relative mx-auto max-w-lg px-4 text-center">
            <Card className="py-12">
              <CheckCircle className="mx-auto mb-4 h-16 w-16 text-irish" />
              <p className="mb-6 text-lg text-irish">{t('booking.paymentSuccess')}</p>
              <Link href={`/${locale}/portal`}>
                <Button>{t('nav.portal')}</Button>
              </Link>
            </Card>
          </div>
        </main>
        <PublicFooter locale={locale} />
      </>
    );
  }

  return (
    <>
      <PublicHeader locale={locale} />
      <main className="relative min-h-screen pt-24 pb-16">
        <div className="bg-grid pointer-events-none fixed inset-0 opacity-20" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="mb-2 text-3xl font-bold text-white">{t('booking.title')}</h1>
            <p className="mb-4 text-zinc-400">{t('hero.description')}</p>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-4 py-1.5 text-sm text-gold">
              <Star className="h-4 w-4 fill-gold" />
              {t('booking.socialProof')}
            </div>
          </motion.div>

          {status === 'success' ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="flex flex-col items-center py-12 text-center">
                <CheckCircle className="mb-4 h-16 w-16 text-irish" />
                <p className="mb-6 text-lg text-irish">{t('booking.success')}</p>
                <Link href={`/${locale}/portal`}>
                  <Button>{t('nav.portal')}</Button>
                </Link>
              </Card>
            </motion.div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                  <div className="mb-4 flex items-center gap-2 text-irish">
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
                  <div className="mb-4 flex items-center gap-2 text-irish">
                    <Calendar className="h-5 w-5" />
                    <h2 className="font-semibold text-white">{t('booking.eventSection')}</h2>
                  </div>
                  <div className="space-y-4">
                    <Field label={t('booking.package')}>
                      <Select
                        value={form.packageTier}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            packageTier: e.target.value as PackageTierId,
                          })
                        }
                      >
                        {PACKAGE_TIER_IDS.map((tier) => (
                          <option key={tier} value={tier}>
                            {t(`landing.pricing.tiers.${tier}.name`)}
                          </option>
                        ))}
                      </Select>
                    </Field>
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
                    <Field label={t('booking.date')}>
                      <AvailabilityCalendar
                        selectedDate={form.date}
                        onSelectDate={(date) => setForm({ ...form, date })}
                      />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
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
                  <div className="mb-4 flex items-center gap-2 text-irish">
                    <MapPin className="h-5 w-5" />
                    <h2 className="font-semibold text-white">{t('booking.venueSection')}</h2>
                  </div>
                  <div className="space-y-4">
                    <Field label={t('booking.venue')}>
                      <AddressAutocomplete
                        required
                        value={form.venueAddress}
                        onChange={(venueAddress) => setForm({ ...form, venueAddress })}
                        onSelect={(s) =>
                          setForm({
                            ...form,
                            venueAddress: s.address,
                            venueCity: s.city || form.venueCity,
                            venueState: (s.state === 'SC' ? 'SC' : 'NC') as 'NC' | 'SC',
                          })
                        }
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
                        <option value={25}>{t('booking.deposit25')}</option>
                        <option value={50}>{t('booking.deposit50')}</option>
                        <option value={100}>{t('booking.deposit100')}</option>
                      </Select>
                    </Field>
                  </div>
                </Card>

                {status === 'error' && (
                  <p className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                    {errorMessage || t('booking.error')}
                  </p>
                )}

                <Button
                  type="submit"
                  loading={status === 'loading'}
                  size="lg"
                  className="w-full"
                  disabled={!slotAvailable || !form.date}
                >
                  {t('booking.submitPay')}
                </Button>
              </form>

              <QuotePreview
                guestCount={form.guestCount}
                depositPercent={depositPercent}
                packageTier={form.packageTier}
                date={form.date}
                startTime={form.startTime}
                endTime={form.endTime}
                venueAddress={form.venueAddress}
                venueCity={form.venueCity}
                venueState={form.venueState}
                onAvailabilityChange={setSlotAvailable}
              />
            </div>
          )}
        </div>
      </main>
      <PublicFooter locale={locale} />
      <PublicSiteExtras locale={locale} />
    </>
  );
}
