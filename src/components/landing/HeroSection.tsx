'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useHydrated } from '@/lib/hooks/use-hydrated';
import type { Locale } from '@/lib/i18n/config';

export function HeroSection({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const fadeUp = hydrated ? { opacity: 0, y: 30 } : false;

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-black to-emerald-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent" />

      <motion.div
        className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-gold/10 blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6">
        <motion.div
          initial={fadeUp}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-300">
            <Sparkles className="h-4 w-4" />
            <span>{t('hero.badge')}</span>
          </div>
        </motion.div>

        <motion.h1
          className="mb-4 text-5xl font-bold tracking-tight text-white sm:text-7xl"
          initial={fadeUp}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          {t('hero.title')}
        </motion.h1>

        <motion.p
          className="mb-2 text-xl text-emerald-300 sm:text-2xl"
          initial={fadeUp}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {t('hero.subtitle')}
        </motion.p>

        <motion.p
          className="mx-auto mb-10 max-w-2xl text-lg text-zinc-400"
          initial={fadeUp}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {t('hero.description')}
        </motion.p>

        <motion.div
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          initial={fadeUp}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Link
            href={`/${locale}/book`}
            className="group flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400"
          >
            {t('hero.cta')}
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
          </Link>
          <Link
            href={`/${locale}/gallery`}
            className="rounded-xl border border-white/20 px-8 py-4 text-lg font-medium text-white backdrop-blur-sm transition hover:bg-white/10"
          >
            {t('hero.secondary')}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
