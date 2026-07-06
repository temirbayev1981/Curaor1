'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';
import { SignaturePad } from '@/components/portal/SignaturePad';
import { ChangeDatesModal } from '@/components/portal/ChangeDatesModal';
import {
  PortalLayout,
  PortalWelcome,
  PortalStatsBar,
} from '@/components/portal/PortalLayout';
import { BookingCard, EmptyBookings } from '@/components/portal/BookingCard';
import { useToast } from '@/components/ui/Toast';
import { absoluteUrl } from '@/lib/config/env';
import type { Booking } from '@/types/database';
import type { Locale } from '@/lib/i18n/config';

export function CustomerPortal({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [signingBookingId, setSigningBookingId] = useState<string | null>(null);
  const [signerName, setSignerName] = useState('');
  const [datesBooking, setDatesBooking] = useState<Booking | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('paid') === 'true') {
      toast(t('portal.paymentSuccess'), 'success');
    }
  }, [searchParams, t, toast]);

  useEffect(() => {
    fetch('/api/portal/bookings')
      .then((res) => res.json())
      .then((json: { data: Booking[] | null }) => {
        setBookings(json.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handlePay(bookingId: string, type: 'deposit' | 'balance') {
    setPayingId(bookingId);
    const res = await fetch('/api/payments/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId,
        paymentType: type,
        successUrl: absoluteUrl(`/${locale}/portal?paid=true`),
        cancelUrl: absoluteUrl(`/${locale}/portal`),
      }),
    });
    const json = (await res.json()) as { data: { url: string } | null; error: { message: string } | null };
    if (json.data?.url) {
      globalThis.location.assign(json.data.url);
    } else {
      toast(json.error?.message ?? t('portal.paymentError'), 'error');
      setPayingId(null);
    }
  }

  function handleDownloadInvoice(bookingId: string) {
    window.open(`/api/portal/invoices/${bookingId}`, '_blank');
  }

  async function handleSign(bookingId: string, signatureDataUrl: string) {
    const res = await fetch(`/api/portal/contracts/${bookingId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signatureDataUrl, signerName }),
    });
    const json = (await res.json()) as { error: { message: string } | null };
    if (json.error) {
      toast(json.error.message, 'error');
      return;
    }
    setSigningBookingId(null);
    setSignerName('');
    toast(t('portal.contractSigned'), 'success');
  }

  function handleDatesUpdated(updated: Booking) {
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    toast(t('portal.datesUpdated'), 'success');
  }

  const upcoming = bookings.filter(
    (b) => b.status !== 'completed' && b.status !== 'cancelled'
  ).length;
  const totalSpent = bookings.reduce((sum, b) => {
    if (b.status === 'pending') return sum;
    return sum + Number(b.deposit_amount);
  }, 0);

  return (
    <PortalLayout locale={locale}>
      <PortalWelcome />
      {!loading && bookings.length > 0 && (
        <PortalStatsBar
          total={bookings.length}
          upcoming={upcoming}
          totalSpent={totalSpent}
          locale={locale}
        />
      )}

      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="skeleton h-64 rounded-2xl" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyBookings locale={locale} />
      ) : (
        <div className="space-y-6 pb-20 lg:pb-0">
          <AnimatePresence>
            {bookings.map((booking) => (
              <div key={booking.id}>
                <BookingCard
                  booking={booking}
                  locale={locale}
                  onPay={handlePay}
                  onDownloadInvoice={handleDownloadInvoice}
                  onChangeDates={setDatesBooking}
                  onSign={setSigningBookingId}
                  paying={payingId === booking.id}
                />
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
          </AnimatePresence>
        </div>
      )}

      {datesBooking && (
        <ChangeDatesModal
          booking={datesBooking}
          onClose={() => setDatesBooking(null)}
          onSuccess={handleDatesUpdated}
        />
      )}
    </PortalLayout>
  );
}
