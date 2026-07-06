'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  LayoutGrid,
  LogOut,
  Beer,
  Plus,
} from 'lucide-react';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { Locale } from '@/lib/i18n/config';

const nav = [
  { href: '/portal', icon: LayoutGrid, key: 'overview' },
  { href: '/book', icon: Plus, key: 'newBooking' },
] as const;

export function PortalLayout({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { t } = useTranslation();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    globalThis.location.assign(`/${locale}/login`);
  }

  return (
    <div className="min-h-screen bg-[#070b09]">
      <div className="bg-grid fixed inset-0 opacity-30" />
      <div className="fixed inset-0 bg-gradient-to-b from-emerald-950/20 via-transparent to-transparent" />

      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href={`/${locale}/portal`} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
              <Beer className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white">The Emerald Pour</span>
              <span className="block text-[10px] text-zinc-500">{t('portal.subtitle')}</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t('portal.logout')}</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="relative mx-auto flex max-w-6xl gap-8 px-4 pt-24 pb-16 sm:px-6">
        <aside className="hidden w-52 shrink-0 lg:block">
          <nav className="sticky top-24 space-y-1">
            {nav.map(({ href, icon: Icon, key }) => {
              const full = `/${locale}${href}`;
              const active = pathname === full;
              return (
                <Link
                  key={key}
                  href={full}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all',
                    active
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t(`portal.nav.${key}`)}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-black/80 backdrop-blur-xl lg:hidden">
        <div className="flex justify-around py-2">
          {nav.map(({ href, icon: Icon, key }) => {
            const full = `/${locale}${href}`;
            const active = pathname === full;
            return (
              <Link
                key={key}
                href={full}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-4 py-1 text-[10px]',
                  active ? 'text-emerald-400' : 'text-zinc-500'
                )}
              >
                <Icon className="h-5 w-5" />
                {t(`portal.nav.${key}`)}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function PortalWelcome({ name }: { name?: string }) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <h1 className="text-3xl font-bold text-white">
        {name ? t('portal.welcome', { name }) : t('portal.title')}
      </h1>
      <p className="mt-1 text-zinc-400">{t('portal.welcomeDesc')}</p>
    </motion.div>
  );
}

export function PortalStatsBar({
  total,
  upcoming,
  totalSpent,
  locale,
}: {
  total: number;
  upcoming: number;
  totalSpent: number;
  locale: Locale;
}) {
  const { t } = useTranslation();
  const fmt = (n: number) =>
    new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(n);

  const stats = [
    { label: t('portal.stats.bookings'), value: String(total) },
    { label: t('portal.stats.upcoming'), value: String(upcoming) },
    { label: t('portal.stats.spent'), value: fmt(totalSpent) },
  ];

  return (
    <div className="mb-8 grid grid-cols-3 gap-4">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card rounded-xl p-4 text-center"
        >
          <p className="text-2xl font-bold text-white">{s.value}</p>
          <p className="text-xs text-zinc-500">{s.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
