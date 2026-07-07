'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { useTenantId } from '@/components/providers/TenantProvider';
import type { PackageTierId } from '@/lib/booking/packages';

interface AvailabilityData {
  available: boolean;
  message: string;
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
  const tenantId = useTenantId();
  const [availability, setAvailability] = useState<AvailabilityData | null>(null);
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
      tenantId,
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
        .then((json: { data: { availability: AvailabilityData } | null }) => {
          const next = json.data?.availability ?? null;
          setAvailability(next);
          if (next && props.onAvailabilityChange) {
            props.onAvailabilityChange(next.available);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 400);

    return () => clearTimeout(timer);
  }, [props]);

  if (!availability && !loading) return null;

  const availabilityKey = availability?.message ?? 'select_date';

  return (
    <Card className="sticky top-24 border-gold/20 bg-surface">
      <h3 className="mb-4 font-semibold text-gold">{t('booking.availability.title')}</h3>
      {loading && !availability ? (
        <div className="skeleton h-20 rounded-lg" />
      ) : availability ? (
        <div className="space-y-3 text-sm">
          <p
            className={`rounded-lg px-3 py-2 text-xs ${
              availability.available
                ? 'bg-irish/10 text-irish'
                : 'bg-amber-500/10 text-amber-300'
            }`}
          >
            {t(`booking.quote.availability.${availabilityKey}`)}
          </p>
          <p className="text-xs text-muted-secondary">{t('booking.availability.note')}</p>
        </div>
      ) : null}
    </Card>
  );
}
