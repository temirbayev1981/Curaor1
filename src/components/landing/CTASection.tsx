'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';

export function CTASection({ locale }: { locale: Locale }) {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/50 via-emerald-900/30 to-emerald-950/50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            {t('cta.title')}
          </h2>
          <p className="mb-8 text-lg text-zinc-400">{t('cta.subtitle')}</p>
          <Link
            href={`/${locale}/book`}
            className="group inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400"
          >
            {t('cta.button')}
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
          </Link>
          <p className="mt-6 text-sm text-zinc-500">{t('cta.call')}</p>
        </motion.div>
      </div>
    </section>
  );
}
