'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  MapPin,
  Users,
  CreditCard,
  FileText,
  Pen,
  CalendarClock,
  Beer,
} from 'lucide-react';
import type { Booking } from '@/types/database';
import type { Locale } from '@/lib/i18n/config';
import { Card } from '@/components/ui/Card';
import { Badge, statusToBadge } from '@/components/ui/Badge';
import { BOOKING_STATUS_KEYS } from '@/lib/i18n/booking-status';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { BookingTimeline } from '@/components/portal/BookingTimeline';

interface BookingCardProps {
  booking: Booking;
  locale: Locale;
  onPay: (id: string, type: 'deposit' | 'balance') => void;
  onDownloadInvoice: (id: string) => void;
  onChangeDates: (booking: Booking) => void;
  onSign: (id: string) => void;
  paying?: boolean;
}

export function BookingCard({
  booking,
  locale,
  onPay,
  onDownloadInvoice,
  onChangeDates,
  onSign,
  paying,
}: BookingCardProps) {
  const { t } = useTranslation();
  const canChangeDates = booking.status === 'pending' || booking.status === 'deposit_paid';

  const paidAmount =
    booking.status === 'pending'
      ? 0
      : booking.status === 'deposit_paid'
        ? Number(booking.deposit_amount)
        : Number(booking.subtotal);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(n);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden !p-0">
        <div className="border-b border-white/5 bg-gradient-to-r from-emerald-500/5 to-transparent p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                <Beer className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold capitalize text-white">
                  {booking.event_type}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {booking.venue_city}, {booking.venue_state}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {booking.guest_count} {t('portal.guests')}
                  </span>
                </div>
              </div>
            </div>
            <Badge variant={statusToBadge(booking.status)}>
              {t(BOOKING_STATUS_KEYS[booking.status])}
            </Badge>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
            <Calendar className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-sm font-medium text-white">
                {new Date(booking.booking_start).toLocaleDateString(locale, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="text-xs text-zinc-500">
                {new Date(booking.booking_start).toLocaleTimeString(locale, {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {' — '}
                {new Date(booking.booking_end).toLocaleTimeString(locale, {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          <BookingTimeline status={booking.status} />

          <div className="grid grid-cols-3 gap-4 rounded-xl bg-white/[0.02] p-4">
            <div>
              <p className="text-xs text-zinc-500">{t('portal.total')}</p>
              <p className="text-lg font-semibold text-white">{formatCurrency(Number(booking.subtotal))}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">{t('portal.depositPaid')}</p>
              <p className="text-lg font-semibold text-emerald-400">
                {formatCurrency(
                  booking.status === 'pending' ? 0 : Number(booking.deposit_amount)
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">{t('portal.balance')}</p>
              <p className="text-lg font-semibold text-zinc-300">
                {formatCurrency(Number(booking.balance_due))}
              </p>
            </div>
          </div>

          {booking.status !== 'cancelled' && booking.status !== 'completed' && (
            <Progress
              value={paidAmount}
              max={Number(booking.subtotal)}
              showLabel
            />
          )}

          <div className="flex flex-wrap gap-2">
            {booking.status === 'pending' && (
              <Button
                onClick={() => onPay(booking.id, 'deposit')}
                loading={paying}
              >
                <CreditCard className="h-4 w-4" />
                {t('portal.payDeposit')} ({formatCurrency(Number(booking.deposit_amount))})
              </Button>
            )}
            {booking.status === 'deposit_paid' && booking.balance_due > 0 && (
              <Button onClick={() => onPay(booking.id, 'balance')} loading={paying}>
                <CreditCard className="h-4 w-4" />
                {t('portal.payBalance')} ({formatCurrency(Number(booking.balance_due))})
              </Button>
            )}
            {canChangeDates && (
              <Button variant="outline" onClick={() => onChangeDates(booking)}>
                <CalendarClock className="h-4 w-4" />
                {t('portal.changeDates')}
              </Button>
            )}
            <Button variant="outline" onClick={() => onDownloadInvoice(booking.id)}>
              <FileText className="h-4 w-4" />
              {t('portal.downloadInvoice')}
            </Button>
            {booking.status !== 'cancelled' && (
              <Button variant="outline" onClick={() => onSign(booking.id)}>
                <Pen className="h-4 w-4" />
                {t('portal.signContract')}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function EmptyBookings({ locale }: { locale: Locale }) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center py-20 text-center"
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500/10">
        <Beer className="h-10 w-10 text-emerald-400" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-white">{t('portal.emptyTitle')}</h3>
      <p className="mb-8 max-w-md text-zinc-400">{t('portal.emptyDesc')}</p>
      <Link href={`/${locale}/book`}>
        <Button size="lg">{t('portal.bookNow')}</Button>
      </Link>
    </motion.div>
  );
}
