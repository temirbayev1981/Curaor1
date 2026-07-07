'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Beer, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Locale } from '@/lib/i18n/config';

export function NotFoundContent({ locale }: { locale: Locale }) {
  const { t } = useTranslation();

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#070b09] px-4">
      <div className="bg-grid pointer-events-none fixed inset-0 opacity-30" />
      <div className="relative z-10 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-irish/10">
          <Beer className="h-8 w-8 text-irish" />
        </div>
        <p className="mb-2 text-6xl font-bold text-irish">404</p>
        <h1 className="mb-3 text-2xl font-bold text-white">{t('errors.notFoundTitle')}</h1>
        <p className="mb-8 max-w-md text-zinc-400">{t('errors.notFoundDesc')}</p>
        <Link href={`/${locale}`}>
          <Button size="lg">
            <Home className="h-4 w-4" />
            {t('errors.backHome')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
