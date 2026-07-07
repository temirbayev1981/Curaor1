'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Clover } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';

export function CTASection({ locale }: { locale: Locale }) {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden border-t border-border bg-emerald-cta py-24">
      <div className="absolute -left-16 top-1/2 h-72 w-72 -translate-y-1/2 text-irish/10">
        <Clover className="h-full w-full" strokeWidth={0.5} />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <motion.div
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-2 text-3xl font-extrabold uppercase tracking-wide text-white sm:text-4xl">
            {t('cta.title')}{' '}
            <span className="text-accent-script">{t('cta.titleAccent')}</span>
          </h2>
          <p className="mb-8 text-lg text-muted">{t('cta.subtitle')}</p>
          <Link
            href={`/${locale}/book`}
            className="btn-primary inline-flex items-center gap-2 px-10 py-4 text-base font-bold uppercase tracking-wider shadow-lg hover:bg-primary-cta-hover"
          >
            <Clover className="h-5 w-5" />
            {t('cta.button')}
          </Link>
          <p className="mt-6 text-sm text-muted-secondary">{t('cta.call')}</p>
        </motion.div>
      </div>
    </section>
  );
}
