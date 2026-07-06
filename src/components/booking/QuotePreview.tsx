'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { DEFAULT_TENANT_ID } from '@/lib/tenant/constants';
import type { PackageTierId } from '@/lib/booking/packages';

interface QuoteData {
  subtotal: number;
  depositAmount: number;
  balanceDue: number;
  deliveryCost: number;
  deliveryDistanceMiles: number | null;
  depositPercent: number;
  currency: string;
  availability: { available: boolean; message: string };
}

interface QuotePreviewProps {
  guestCount: number;
  depositPercent: 25 | 50 | 100;
  packageTier: PackageTierId;
  date: string;
  startTime: string;
  endTime: string;
  venueAddress: string;
  venueCity: string;
  venueState: string;
  onAvailabilityChange?: (available: boolean) => void;
}

export function QuotePreview(props: QuotePreviewProps) {
  const { t } = useTranslation();
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!props.guestCount) return;

    const bookingStart = props.date
      ? new Date(`${props.date}T${props.startTime}`).toISOString()
      : undefined;
    const bookingEnd = props.date
      ? new Date(`${props.date}T${props.endTime}`).toISOString()
      : undefined;

    const params = new URLSearchParams({
      tenantId: DEFAULT_TENANT_ID,
      guestCount: String(props.guestCount),
      depositPercent: String(props.depositPercent),
      packageTier: props.packageTier,
    });

    if (props.date) params.set('date', props.date);
    if (bookingStart) params.set('bookingStart', bookingStart);
    if (bookingEnd) params.set('bookingEnd', bookingEnd);
    if (props.venueAddress) params.set('venueAddress', props.venueAddress);
    if (props.venueCity) params.set('venueCity', props.venueCity);
    if (props.venueState) params.set('venueState', props.venueState);

    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/bookings/quote?${params}`)
        .then((res) => res.json())
        .then((json: { data: QuoteData | null }) => {
          setQuote(json.data);
          if (json.data && props.onAvailabilityChange) {
            props.onAvailabilityChange(json.data.availability.available);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 400);

    return () => clearTimeout(timer);
  }, [props]);

  if (!quote && !loading) return null;

  const format = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: quote?.currency ?? 'USD' }).format(n);

  const availabilityKey = quote?.availability.message ?? 'select_date';

  return (
    <Card className="sticky top-24 border-gold/20 bg-emerald-950/50">
      <h3 className="mb-4 font-semibold text-gold">{t('booking.quote.title')}</h3>
      {loading && !quote ? (
        <div className="skeleton h-32 rounded-lg" />
      ) : quote ? (
        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-zinc-400">
            <span>{t('booking.quote.subtotal')}</span>
            <span className="text-white">{format(quote.subtotal)}</span>
          </div>
          {quote.deliveryCost > 0 && (
            <div className="flex justify-between text-zinc-400">
              <span>
                {t('booking.quote.delivery')}
                {quote.deliveryDistanceMiles != null &&
                  ` (${quote.deliveryDistanceMiles.toFixed(0)} mi)`}
              </span>
              <span className="text-white">{format(quote.deliveryCost)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-white/10 pt-3 font-semibold text-white">
            <span>{t('booking.quote.deposit', { percent: quote.depositPercent })}</span>
            <span className="text-gold">{format(quote.depositAmount)}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>{t('booking.quote.balance')}</span>
            <span>{format(quote.balanceDue)}</span>
          </div>
          <p
            className={`rounded-lg px-3 py-2 text-xs ${
              quote.availability.available
                ? 'bg-emerald-500/10 text-emerald-300'
                : 'bg-amber-500/10 text-amber-300'
            }`}
          >
            {t(`booking.quote.availability.${availabilityKey}`)}
          </p>
        </div>
      ) : null}
    </Card>
  );
}
