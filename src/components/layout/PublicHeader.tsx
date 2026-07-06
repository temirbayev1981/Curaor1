'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { Button } from '@/components/ui/Button';
import { Beer, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Locale } from '@/lib/i18n/config';

const links = [
  { href: '#services', key: 'services' },
  { href: '/locations', key: 'locations' },
  { href: '/gallery', key: 'gallery' },
  { href: '/book', key: 'book' },
  { href: '/portal', key: 'portal' },
] as const;

export function PublicHeader({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href={`/${locale}`} className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
            <Beer className="h-5 w-5 text-emerald-400" />
          </div>
          <span className="text-sm font-semibold text-white">The Emerald Pour</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map(({ href, key }) => (
            <Link
              key={key}
              href={`/${locale}${href}`}
              className="text-sm text-zinc-300 transition hover:text-white"
            >
              {t(`nav.${key}`)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link href={`/${locale}/book`} className="hidden sm:block">
            <Button size="sm">{t('nav.book')}</Button>
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white md:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/5 bg-black/90 backdrop-blur-xl md:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {links.map(({ href, key }) => (
                <Link
                  key={key}
                  href={`/${locale}${href}`}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'block rounded-xl px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white'
                  )}
                >
                  {t(`nav.${key}`)}
                </Link>
              ))}
              <Link
                href={`/${locale}/book`}
                onClick={() => setMobileOpen(false)}
                className="block pt-2"
              >
                <Button className="w-full">{t('nav.book')}</Button>
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
