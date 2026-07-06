'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Beer } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';

export function PublicFooter({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-black/60 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <Beer className="h-6 w-6 text-emerald-400" />
            <span className="font-semibold text-white">The Emerald Pour</span>
          </div>
          <div className="flex gap-6 text-sm text-zinc-400">
            <Link href={`/${locale}/privacy`} className="hover:text-white">
              {t('footer.privacy')}
            </Link>
            <Link href={`/${locale}/terms`} className="hover:text-white">
              {t('footer.terms')}
            </Link>
          </div>
          <p className="text-sm text-zinc-500">
            © {year} The Emerald Pour. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
