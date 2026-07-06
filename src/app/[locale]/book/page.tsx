import { Suspense } from 'react';
import { BookingForm } from '@/components/booking/BookingForm';
import type { Locale } from '@/lib/i18n/config';
import { getTranslations } from '@/lib/i18n/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getTranslations(locale as Locale);
  return { title: t.booking.title };
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <Suspense>
      <BookingForm locale={locale as Locale} />
    </Suspense>
  );
}
