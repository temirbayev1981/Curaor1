'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MapPin, Users, Calendar, DollarSign } from 'lucide-react';
import type { Booking, Customer, Payment } from '@/types/database';
import { BookingProfitabilityCard } from '@/components/admin/BookingProfitabilityCard';
import { ContractStatusCard } from '@/components/admin/ContractStatusCard';
import { BookingActions } from '@/components/admin/BookingActions';
import { Badge, statusToBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BOOKING_STATUS_KEYS } from '@/lib/i18n/booking-status';
import { DEFAULT_TENANT_ID } from '@/lib/tenant/constants';
import type { Locale } from '@/lib/i18n/config';

const EVENT_TYPE_KEYS: Record<string, string> = {
  wedding: 'services.weddings',
  corporate: 'services.corporate',
  private: 'services.private',
  stpatricks: 'services.stpatricks',
};

interface BookingDetailData {
  booking: Booking;
  customer: Customer | null;
  payments: Payment[];
}

export function AdminBookingDetail({
  locale,
  bookingId,
}: {
  locale: Locale;
  bookingId: string;
}) {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<BookingDetailData | null>(null);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const dateLocale = i18n.language === 'ru' ? 'ru-RU' : 'en-US';
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat(dateLocale, { style: 'currency', currency: 'USD' }).format(n);

  useEffect(() => {
    fetch(`/api/admin/bookings/${bookingId}`)
      .then(async (res) => {
        const json = (await res.json()) as {
          data: BookingDetailData | null;
          error: { message: string } | null;
        };
        if (!res.ok || json.error || !json.data) {
          setError(json.error?.message ?? t('admin.bookingDetail.fetchError'));
          return;
        }
        setData(json.data);
        setNotes(json.data.booking.notes ?? '');
      })
      .catch(() => setError(t('admin.bookingDetail.fetchError')));
  }, [bookingId, t]);

  function handleBookingUpdated(booking: Booking) {
    setData((prev) => (prev ? { ...prev, booking } : prev));
  }

  async function saveNotes() {
    setSavingNotes(true);
    const res = await fetch(`/api/admin/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    });
    const json = (await res.json()) as { data: Booking | null };
    if (json.data) {
      setData((prev) => (prev ? { ...prev, booking: json.data! } : prev));
    }
    setSavingNotes(false);
  }

  async function refundPayment(paymentId: string) {
    setRefundingId(paymentId);
    const res = await fetch(`/api/admin/payments/${paymentId}/refund`, {
      method: 'POST',
    });
    const json = (await res.json()) as { data: Payment | null };
    if (json.data) {
      setData((prev) =>
        prev
          ? {
              ...prev,
              payments: prev.payments.map((p) =>
                p.id === paymentId ? json.data! : p
              ),
            }
          : prev
      );
    }
    setRefundingId(null);
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-8 text-center text-red-400">
        {error}
      </div>
    );
  }

  if (!data) {
    return <div className="skeleton h-64 rounded-xl" />;
  }

  const { booking, customer, payments } = data;

  return (
    <div className="space-y-6">
      <Link
        href={`/${locale}/admin/bookings`}
        className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('admin.bookingDetail.back')}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {t(EVENT_TYPE_KEYS[booking.event_type] ?? booking.event_type)}
          </h1>
          <p className="mt-1 text-zinc-400">
            {new Date(booking.booking_start).toLocaleString(dateLocale)}
          </p>
        </div>
        <Badge variant={statusToBadge(booking.status)}>
          {t(BOOKING_STATUS_KEYS[booking.status])}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-semibold text-white">{t('admin.bookingDetail.eventInfo')}</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-zinc-300">
              <Calendar className="h-4 w-4 text-emerald-400" />
              <span>
                {new Date(booking.booking_start).toLocaleString(dateLocale)} —{' '}
                {new Date(booking.booking_end).toLocaleTimeString(dateLocale, {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <MapPin className="h-4 w-4 text-emerald-400" />
              <span>
                {booking.venue_address}, {booking.venue_city}, {booking.venue_state}
              </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <Users className="h-4 w-4 text-emerald-400" />
              <span>{booking.guest_count} {t('portal.guests')}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              <span>{formatCurrency(Number(booking.subtotal))}</span>
            </div>
          </dl>
          <div className="mt-6">
            <BookingActions
              booking={booking}
              tenantId={DEFAULT_TENANT_ID}
              onUpdated={handleBookingUpdated}
            />
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-semibold text-white">{t('admin.bookingDetail.customer')}</h2>
          {customer ? (
            <dl className="space-y-2 text-sm text-zinc-300">
              <div>
                <dt className="text-zinc-500">{t('booking.name')}</dt>
                <dd className="text-white">{customer.full_name}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">{t('booking.email')}</dt>
                <dd>{customer.email}</dd>
              </div>
              {customer.phone && (
                <div>
                  <dt className="text-zinc-500">{t('booking.phone')}</dt>
                  <dd>{customer.phone}</dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="text-zinc-500">{t('admin.bookingDetail.noCustomer')}</p>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 font-semibold text-white">{t('admin.bookingDetail.payments')}</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-zinc-500">{t('admin.bookingDetail.noPayments')}</p>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-admin-border bg-admin-bg px-4 py-3 text-sm"
              >
                <div>
                  <span className="font-medium capitalize text-white">
                    {payment.payment_type}
                  </span>
                  <span className="ml-2 text-zinc-400">
                    {formatCurrency(Number(payment.amount))}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      payment.status === 'succeeded'
                        ? 'success'
                        : payment.status === 'refunded'
                          ? 'warning'
                          : 'default'
                    }
                  >
                    {payment.status}
                  </Badge>
                  {payment.status === 'succeeded' && (
                    <Button
                      size="sm"
                      variant="outline"
                      loading={refundingId === payment.id}
                      onClick={() => refundPayment(payment.id)}
                    >
                      {t('admin.bookingDetail.refund')}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <BookingProfitabilityCard bookingId={bookingId} />

      <ContractStatusCard bookingId={bookingId} />

      <Card>
        <h2 className="mb-4 font-semibold text-white">{t('admin.bookingDetail.crmNotes')}</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          className="w-full rounded-lg border border-admin-border bg-admin-bg px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:outline-none"
          placeholder={t('admin.bookingDetail.notesPlaceholder')}
        />
        <Button
          className="mt-3"
          size="sm"
          loading={savingNotes}
          onClick={saveNotes}
        >
          {t('admin.bookingDetail.saveNotes')}
        </Button>
      </Card>
    </div>
  );
}
