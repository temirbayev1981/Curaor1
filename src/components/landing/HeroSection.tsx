'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Clover } from 'lucide-react';
import { LANDING_IMAGES } from '@/lib/media/landing-images';
import type { Locale } from '@/lib/i18n/config';

export function HeroSection({ locale }: { locale: Locale }) {
  const { t } = useTranslation();

  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden pt-16">
      <Image
        src={LANDING_IMAGES.hero.src}
        alt={LANDING_IMAGES.hero.alt}
        fill
        priority
        unoptimized
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/80 via-[#111111]/55 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/75 via-transparent to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#c57a20]/10 via-transparent to-[#f5c26b]/5" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <motion.div
          initial={false}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="max-w-xl"
        >
          <p className="mb-4 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.2em] text-gold">
            <Clover className="h-4 w-4 text-irish" />
            {t('hero.badge')}
          </p>

          <h1 className="mb-2 text-5xl font-extrabold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
            {t('hero.headline')}
          </h1>
          <p className="mb-6 text-3xl text-accent-script sm:text-4xl">
            {t('hero.headlineAccent')}
          </p>

          <p className="mb-8 max-w-lg text-lg leading-relaxed text-muted">
            {t('hero.description')}
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href={`/${locale}/book`}
              className="btn-primary group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold shadow-lg"
            >
              <Clover className="h-4 w-4" />
              {t('hero.cta')}
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </Link>
            <Link
              href={`/${locale}/gallery`}
              className="inline-flex items-center justify-center rounded-lg border border-white px-8 py-4 text-base font-medium text-white transition hover:border-irish hover:text-irish"
            >
              {t('hero.secondary')}
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={false}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative hidden aspect-[4/5] overflow-hidden rounded-2xl border border-gold/20 shadow-2xl lg:block"
        >
          <Image
            src={LANDING_IMAGES.heroAccent.src}
            alt={LANDING_IMAGES.heroAccent.alt}
            fill
            unoptimized
            className="object-cover"
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-dark/80 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#ffcc66]/10 via-transparent to-[#ffd27a]/5" />
          <div className="absolute bottom-6 left-6 right-6 rounded-xl border border-gold/30 bg-black/50 p-4 backdrop-blur-sm">
            <p className="font-serif text-2xl text-gold">Sláinte!</p>
            <p className="mt-1 text-sm text-muted">{t('hero.sideTagline')}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
