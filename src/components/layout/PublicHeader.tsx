'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { Clover, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Locale } from '@/lib/i18n/config';

const links = [
  { href: '/', key: 'home' },
  { href: '#about', key: 'about' },
  { href: '#services', key: 'services' },
  { href: '/gallery', key: 'gallery' },
  { href: '/locations', key: 'locations' },
] as const;

function linkHref(locale: Locale, href: string) {
  if (href === '/') return `/${locale}`;
  if (href.startsWith('#')) return `/${locale}${href}`;
  return `/${locale}${href}`;
}

export function PublicHeader({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-emerald-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href={`/${locale}`} className="flex items-center gap-2.5">
          <Clover className="h-6 w-6 shrink-0 text-gold" />
          <div className="leading-tight">
            <span className="block font-serif text-sm font-bold tracking-wide text-white">
              The Emerald Pour
            </span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-gold/80">
              Mobile Irish Pub
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {links.map(({ href, key }) => (
            <Link
              key={key}
              href={linkHref(locale, href)}
              className="text-xs font-medium uppercase tracking-wider text-zinc-300 transition hover:text-white"
            >
              {t(`nav.${key}`)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <Link
            href={`/${locale}/admin/login`}
            className="hidden rounded-md border border-white/20 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-200 transition hover:border-gold/40 hover:text-gold md:inline-flex"
          >
            {t('nav.admin')}
          </Link>
          <Link
            href={`/${locale}/book`}
            className="hidden rounded-md bg-gold px-4 py-2 text-xs font-bold uppercase tracking-wider text-emerald-950 transition hover:bg-gold/90 sm:inline-flex"
          >
            {t('nav.book')}
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white lg:hidden"
            aria-label={t('nav.menu')}
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
            className="overflow-hidden border-t border-white/5 bg-emerald-950/95 backdrop-blur-xl lg:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {links.map(({ href, key }) => (
                <Link
                  key={key}
                  href={linkHref(locale, href)}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'block rounded-xl px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white'
                  )}
                >
                  {t(`nav.${key}`)}
                </Link>
              ))}
              <Link
                href={`/${locale}/admin/login`}
                onClick={() => setMobileOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
              >
                {t('nav.admin')}
              </Link>
              <Link
                href={`/${locale}/book`}
                onClick={() => setMobileOpen(false)}
                className="block pt-2"
              >
                <span className="flex w-full items-center justify-center rounded-md bg-gold px-4 py-3 text-sm font-bold uppercase tracking-wider text-emerald-950">
                  {t('nav.book')}
                </span>
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
