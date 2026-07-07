'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Beer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import type { Locale } from '@/lib/i18n/config';

export function AuthLayout({
  locale,
  title,
  subtitle,
  children,
}: {
  locale: Locale;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="bg-grid fixed inset-0 opacity-30" />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-emerald-dark/40 via-background to-emerald-cta/30" />

      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-card rounded-2xl p-8">
          <div className="mb-8 flex flex-col items-center text-center">
            <Link href={`/${locale}`} className="mb-4 flex flex-col items-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-irish/10">
                <Beer className="h-8 w-8 text-irish" />
              </div>
              <span className="text-sm font-semibold text-white">The Emerald Pour</span>
            </Link>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-muted-secondary">{subtitle}</p>}
          </div>
          {children}
        </div>
        <p className="mt-6 text-center text-xs text-muted-secondary">
          © {new Date().getFullYear()} The Emerald Pour. {t('footer.rights')}
        </p>
      </motion.div>
    </div>
  );
}
