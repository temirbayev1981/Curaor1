'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Clover } from 'lucide-react';
import { LANDING_IMAGES } from '@/lib/media/landing-images';
import type { Locale } from '@/lib/i18n/config';

export function AboutSection({ locale }: { locale: Locale }) {
  const { t } = useTranslation();

  return (
    <section id="about" className="relative overflow-hidden border-y border-white/5 bg-emerald-950/30 py-24">
      <div className="absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 translate-x-1/3 text-emerald-500/5">
        <Clover className="h-full w-full" strokeWidth={0.5} />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <motion.div
          initial={false}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40"
        >
          <Image
            src={LANDING_IMAGES.guinness.src}
            alt={LANDING_IMAGES.guinness.alt}
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </motion.div>

        <motion.div
          initial={false}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-gold">
            {t('landing.about.eyebrow')}
          </p>
          <h2 className="mb-6 font-serif text-4xl font-bold leading-tight text-white sm:text-5xl">
            {t('landing.about.title')}{' '}
            <span className="text-gradient">{t('landing.about.titleAccent')}</span>
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-zinc-300">
            {t('landing.about.body')}
          </p>
          <p className="mb-8 text-zinc-400">{t('landing.about.body2')}</p>
          <Link
            href={`/${locale}/book`}
            className="inline-flex rounded-xl border border-emerald-500/40 px-6 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/10"
          >
            {t('landing.about.cta')}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
