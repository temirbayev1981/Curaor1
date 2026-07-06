'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Check, Clover } from 'lucide-react';
import { PACKAGE_TIER_IDS } from '@/lib/booking/packages';
import type { Locale } from '@/lib/i18n/config';

const FEATURE_COUNTS = { shamrock: 4, emerald: 5, legend: 6 } as const;

export function PricingPackagesSection({ locale }: { locale: Locale }) {
  const { t } = useTranslation();

  return (
    <section id="packages" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={false}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-gold">
            {t('landing.pricing.eyebrow')}
          </p>
          <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">
            {t('landing.pricing.title')}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-zinc-400">{t('landing.pricing.subtitle')}</p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {PACKAGE_TIER_IDS.map((tier, i) => (
            <motion.div
              key={tier}
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                tier === 'emerald'
                  ? 'border-gold/40 bg-gradient-to-b from-gold/10 to-transparent shadow-lg shadow-gold/5'
                  : 'border-white/10 bg-white/[0.03]'
              }`}
            >
              {tier === 'emerald' && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-950">
                  {t('landing.pricing.popular')}
                </span>
              )}
              <div className="mb-6 flex items-center gap-2">
                <Clover className="h-5 w-5 text-gold" />
                <h3 className="text-xl font-bold text-white">
                  {t(`landing.pricing.tiers.${tier}.name`)}
                </h3>
              </div>
              <p className="mb-6 text-sm text-zinc-400">
                {t(`landing.pricing.tiers.${tier}.guests`)}
              </p>
              <ul className="mb-8 flex-1 space-y-3">
                {Array.from({ length: FEATURE_COUNTS[tier] }).map((_, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-zinc-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    {t(`landing.pricing.tiers.${tier}.features.f${idx + 1}`)}
                  </li>
                ))}
              </ul>
              <Link
                href={`/${locale}/book?package=${tier}`}
                className={`rounded-lg px-6 py-3 text-center text-sm font-semibold transition ${
                  tier === 'emerald'
                    ? 'bg-gold text-emerald-950 hover:bg-gold/90'
                    : 'border border-white/20 text-white hover:bg-white/5'
                }`}
              >
                {t('landing.pricing.cta')}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
