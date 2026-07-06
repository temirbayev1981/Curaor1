'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { Beer } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';

export function PublicHeader({ locale }: { locale: Locale }) {
  const { t } = useTranslation();

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <Beer className="h-7 w-7 text-emerald-400" />
          <span className="text-lg font-semibold text-white">The Emerald Pour</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link href={`/${locale}#services`} className="text-sm text-zinc-300 hover:text-white">
            {t('nav.services')}
          </Link>
          <Link href={`/${locale}/locations`} className="text-sm text-zinc-300 hover:text-white">
            {t('nav.locations')}
          </Link>
          <Link href={`/${locale}/gallery`} className="text-sm text-zinc-300 hover:text-white">
            {t('nav.gallery')}
          </Link>
          <Link href={`/${locale}/book`} className="text-sm text-zinc-300 hover:text-white">
            {t('nav.book')}
          </Link>
          <Link href={`/${locale}/portal`} className="text-sm text-zinc-300 hover:text-white">
            {t('nav.portal')}
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link
            href={`/${locale}/book`}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
          >
            {t('nav.book')}
          </Link>
        </div>
      </div>
    </header>
  );
}
