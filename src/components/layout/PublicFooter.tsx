'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Beer } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';

export function PublicFooter({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const quickLinks = [
    { href: '/about', key: 'about' },
    { href: '/services', key: 'services' },
    { href: '/menu', key: 'menu' },
    { href: '/gallery', key: 'gallery' },
    { href: '/locations', key: 'locations' },
    { href: '/book', key: 'book' },
    { href: '/faq', key: 'faq' },
    { href: '/articles', key: 'articles' },
    { href: '/contact', key: 'contact' },
    { href: '/portal', key: 'portal' },
  ] as const;

  return (
    <footer className="relative z-10 border-t border-white/5 bg-black/60 pb-20 md:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                <Beer className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="font-semibold text-white">The Emerald Pour</span>
            </div>
            <p className="text-sm leading-relaxed text-zinc-500">{t('footer.tagline')}</p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
              {t('footer.quickLinks')}
            </h3>
            <div className="flex flex-col gap-2">
              {quickLinks.map(({ href, key }) => (
                <Link
                  key={key}
                  href={`/${locale}${href}`}
                  className="text-sm text-zinc-500 transition hover:text-emerald-400"
                >
                  {t(`nav.${key}`)}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
              {t('footer.legal')}
            </h3>
            <div className="flex flex-col gap-2">
              <Link
                href={`/${locale}/privacy`}
                className="text-sm text-zinc-500 transition hover:text-white"
              >
                {t('footer.privacy')}
              </Link>
              <Link
                href={`/${locale}/terms`}
                className="text-sm text-zinc-500 transition hover:text-white"
              >
                {t('footer.terms')}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/5 pt-8 text-center text-sm text-zinc-600">
          © {year} The Emerald Pour. {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
}
