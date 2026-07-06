'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ArrowUp, Calendar } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-24 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-emerald-950/90 text-white shadow-lg backdrop-blur transition hover:border-gold/40 hover:text-gold md:bottom-8"
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}

export function StickyMobileCta({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/20 bg-emerald-950/95 p-3 backdrop-blur-md md:hidden">
      <Link
        href={`/${locale}/book`}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold py-3 text-sm font-bold uppercase tracking-wider text-emerald-950"
      >
        <Calendar className="h-4 w-4" />
        {t('nav.book')}
      </Link>
    </div>
  );
}
