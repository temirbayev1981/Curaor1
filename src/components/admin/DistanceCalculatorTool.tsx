'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Route } from 'lucide-react';
import type { Booking } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

interface DistanceResult {
  originAddress: string;
  destinationAddress: string;
  distanceMiles: number;
  durationMinutes: number;
  pricePerMile: number;
  deliveryCost: number;
  booking?: Booking | null;
}

export function DistanceCalculatorTool() {
  const { t } = useTranslation();
  const [origin, setOrigin] = useState('Charlotte, NC');
  const [destination, setDestination] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [result, setResult] = useState<DistanceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/bookings')
      .then((res) => res.json())
      .then((json: { data: Booking[] | null }) => setBookings(json.data ?? []))
      .catch(() => setBookings([]));
  }, []);

  async function calculate() {
    setLoading(true);
    setError('');
    setResult(null);
    const res = await fetch('/api/admin/distance/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        originAddress: origin,
        destinationAddress: destination,
        bookingId: bookingId || undefined,
      }),
    });
    const json = (await res.json()) as {
      data: DistanceResult | null;
      error?: { message: string };
    };
    if (!res.ok || json.error) {
      setError(json.error?.message ?? t('admin.distance.error'));
    } else {
      setResult(json.data);
    }
    setLoading(false);
  }

  function fillFromBooking(id: string) {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) return;
    setBookingId(id);
    setDestination(
      `${booking.venue_address}, ${booking.venue_city}, ${booking.venue_state}`
    );
  }

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-4 font-semibold text-white">{t('admin.distance.title')}</h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-zinc-500">
              {t('admin.distance.origin')}
            </label>
            <Input
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Charlotte, NC"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-500">
              {t('admin.distance.destination')}
            </label>
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={t('admin.distance.destinationPlaceholder')}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-500">
              {t('admin.distance.saveToBooking')}
            </label>
            <select
              value={bookingId}
              onChange={(e) => fillFromBooking(e.target.value)}
              className="w-full rounded-lg border border-admin-border bg-admin-bg px-3 py-2 text-sm text-white"
            >
              <option value="">{t('admin.distance.noBooking')}</option>
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {new Date(b.booking_start).toLocaleDateString()} — {b.venue_city}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={calculate} loading={loading} className="w-full sm:w-auto">
            <Route className="h-4 w-4" />
            {t('admin.distance.calculate')}
          </Button>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      </Card>

      {result && (
        <Card>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs uppercase text-zinc-500">{t('admin.distance.miles')}</p>
              <p className="text-2xl font-bold text-white">{result.distanceMiles}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-zinc-500">{t('admin.distance.duration')}</p>
              <p className="text-2xl font-bold text-white">{result.durationMinutes} min</p>
            </div>
            <div>
              <p className="text-xs uppercase text-zinc-500">{t('admin.distance.rate')}</p>
              <p className="text-2xl font-bold text-white">
                ${result.pricePerMile.toFixed(2)}/mi
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-zinc-500">{t('admin.distance.cost')}</p>
              <p className="text-2xl font-bold text-emerald-400">
                {formatCurrency(result.deliveryCost)}
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-1 text-sm text-zinc-400">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> A: {result.originAddress}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> B: {result.destinationAddress}
            </p>
          </div>
          {result.booking && (
            <p className="mt-4 text-sm text-emerald-400">
              {t('admin.distance.savedToBooking')}
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
