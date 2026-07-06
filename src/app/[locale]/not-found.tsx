'use client';

import { useParams } from 'next/navigation';
import { NotFoundContent } from '@/components/errors/NotFoundContent';
import type { Locale } from '@/lib/i18n/config';

export default function LocaleNotFound() {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'en';
  return <NotFoundContent locale={locale as Locale} />;
}
