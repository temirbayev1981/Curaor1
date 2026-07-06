'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { getGoogleReviewsUrl } from '@/lib/config/env';

const REVIEWS = [
  {
    key: 'r1',
    rating: 5,
  },
  {
    key: 'r2',
    rating: 5,
  },
  {
    key: 'r3',
    rating: 5,
  },
] as const;

export function GoogleReviewsSection() {
  const { t } = useTranslation();
  const reviewsUrl = getGoogleReviewsUrl();

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-zinc-300">
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google Reviews
          </div>
          <h2 className="text-3xl font-bold text-white">{t('landing.googleReviews.title')}</h2>
          <p className="mt-2 text-zinc-400">{t('landing.googleReviews.subtitle')}</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-gold text-gold" />
              ))}
            </div>
            <span className="text-lg font-semibold text-white">4.9</span>
            <span className="text-zinc-500">({t('landing.googleReviews.count')})</span>
          </div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {REVIEWS.map(({ key, rating }, i) => (
            <motion.div
              key={key}
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="mb-3 flex">
                {Array.from({ length: rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>
              <p className="mb-4 text-sm leading-relaxed text-zinc-300">
                &ldquo;{t(`landing.googleReviews.${key}.text`)}&rdquo;
              </p>
              <p className="text-sm font-medium text-white">
                {t(`landing.googleReviews.${key}.name`)}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href={reviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:border-emerald-500/30 hover:bg-emerald-500/10"
          >
            {t('landing.googleReviews.cta')}
          </Link>
        </div>
      </div>
    </section>
  );
}
