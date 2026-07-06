'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { SignaturePad } from '@/components/portal/SignaturePad';
import { ChangeDatesModal } from '@/components/portal/ChangeDatesModal';
import type { Booking } from '@/types/database';
import type { Locale } from '@/lib/i18n/config';
import { Calendar, CreditCard, FileText, Pen, CalendarClock } from 'lucide-react';

const DEFAULT_TENANT_ID = 'a0000000-0000-4000-8000-000000000001';

export function CustomerPortal({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [signingBookingId, setSigningBookingId] = useState<string | null>(null);
  const [signerName, setSignerName] = useState('');
  const [datesBooking, setDatesBooking] = useState<Booking | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`/api/portal/bookings?tenantId=${DEFAULT_TENANT_ID}`)
      .then((res) => res.json())
      .then((json: { data: Booking[] | null }) => {
        setBookings(json.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handlePay(bookingId: string, type: 'deposit' | 'balance') {
    const res = await fetch('/api/payments/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId: DEFAULT_TENANT_ID,
        bookingId,
        paymentType: type,
        successUrl: `${window.location.origin}/${locale}/portal?paid=true`,
        cancelUrl: `${window.location.origin}/${locale}/portal`,
      }),
    });
    const json = (await res.json()) as { data: { url: string } | null };
    if (json.data?.url) {
      globalThis.location.assign(json.data.url);
    }
  }

  function handleDownloadInvoice(bookingId: string) {
    const url = `/api/portal/invoices/${bookingId}?tenantId=${DEFAULT_TENANT_ID}`;
    window.open(url, '_blank');
  }

  async function handleSign(bookingId: string, signatureDataUrl: string) {
    const res = await fetch(`/api/portal/contracts/${bookingId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId: DEFAULT_TENANT_ID,
        signatureDataUrl,
        signerName,
      }),
    });
    const json = (await res.json()) as { error: { message: string } | null };
    if (json.error) {
      setMessage(json.error.message);
      return;
    }
    setSigningBookingId(null);
    setSignerName('');
    setMessage(t('portal.contractSigned'));
  }

  function handleDatesUpdated(updated: Booking) {
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setMessage(t('portal.datesUpdated'));
  }

  const canChangeDates = (status: string) =>
    status === 'pending' || status === 'deposit_paid';

  return (
    <>
      <PublicHeader locale={locale} />
      <main className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h1 className="mb-8 text-3xl font-bold text-white">{t('portal.title')}</h1>

          {message && (
            <div className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-300">
              {message}
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-32 rounded-xl" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <p className="text-zinc-400">{t('portal.noBookings')}</p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id}>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white capitalize">
                          {booking.event_type}
                        </h3>
                        <p className="text-sm text-zinc-400">
                          {booking.venue_city}, {booking.venue_state}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 capitalize">
                        {booking.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="mb-4 flex items-center gap-2 text-sm text-zinc-300">
                      <Calendar className="h-4 w-4" />
                      {new Date(booking.booking_start).toLocaleDateString(locale)} —{' '}
                      {new Date(booking.booking_end).toLocaleTimeString(locale, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handlePay(booking.id, 'deposit')}
                          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm text-white hover:bg-emerald-600"
                        >
                          <CreditCard className="h-4 w-4" />
                          Pay Deposit (${booking.deposit_amount})
                        </button>
                      )}
                      {booking.status === 'deposit_paid' && booking.balance_due > 0 && (
                        <button
                          onClick={() => handlePay(booking.id, 'balance')}
                          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm text-white hover:bg-emerald-600"
                        >
                          <CreditCard className="h-4 w-4" />
                          {t('portal.payBalance')} (${booking.balance_due})
                        </button>
                      )}
                      {canChangeDates(booking.status) && (
                        <button
                          onClick={() => setDatesBooking(booking)}
                          className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
                        >
                          <CalendarClock className="h-4 w-4" />
                          {t('portal.changeDates')}
                        </button>
                      )}
                      <button
                        onClick={() => handleDownloadInvoice(booking.id)}
                        className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
                      >
                        <FileText className="h-4 w-4" />
                        {t('portal.downloadInvoice')}
                      </button>
                      {booking.status !== 'cancelled' && (
                        <button
                          onClick={() => setSigningBookingId(booking.id)}
                          className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
                        >
                          <Pen className="h-4 w-4" />
                          {t('portal.signContract')}
                        </button>
                      )}
                    </div>
                  </div>

                  {signingBookingId === booking.id && (
                    <div className="mt-4">
                      <SignaturePad
                        signerName={signerName}
                        onSignerNameChange={setSignerName}
                        onSign={(dataUrl) => handleSign(booking.id, dataUrl)}
                        onCancel={() => {
                          setSigningBookingId(null);
                          setSignerName('');
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <PublicFooter locale={locale} />

      {datesBooking && (
        <ChangeDatesModal
          booking={datesBooking}
          tenantId={DEFAULT_TENANT_ID}
          onClose={() => setDatesBooking(null)}
          onSuccess={handleDatesUpdated}
        />
      )}
    </>
  );
}
