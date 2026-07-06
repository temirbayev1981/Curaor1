'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';

export function ContactSection({ locale }: { locale: Locale }) {
  const { t } = useTranslation();

  return (
    <section id="contact" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          <motion.div
            initial={false}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 font-serif text-3xl font-bold text-white sm:text-4xl">
              {t('landing.contact.title')}
            </h2>
            <p className="mb-8 text-lg text-zinc-400">{t('landing.contact.subtitle')}</p>
            <div className="space-y-4">
              <a
                href="tel:+17045550199"
                className="flex items-center gap-3 text-zinc-300 transition hover:text-gold"
              >
                <Phone className="h-5 w-5 text-emerald-400" />
                (704) 555-0199
              </a>
              <a
                href="mailto:bookings@emeraldpour.com"
                className="flex items-center gap-3 text-zinc-300 transition hover:text-gold"
              >
                <Mail className="h-5 w-5 text-emerald-400" />
                bookings@emeraldpour.com
              </a>
              <p className="flex items-center gap-3 text-zinc-300">
                <MapPin className="h-5 w-5 text-emerald-400" />
                {t('landing.contact.area')}
              </p>
              <p className="flex items-center gap-3 text-zinc-300">
                <Clock className="h-5 w-5 text-emerald-400" />
                {t('landing.contact.hours')}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={false}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-8"
          >
            <h3 className="mb-4 text-xl font-semibold text-white">
              {t('landing.contact.ctaTitle')}
            </h3>
            <p className="mb-6 text-sm text-zinc-400">{t('landing.contact.ctaDesc')}</p>
            <Link
              href={`/${locale}/book`}
              className="mb-4 inline-flex w-full items-center justify-center rounded-lg bg-gold px-6 py-3 font-semibold text-emerald-950 transition hover:bg-gold/90"
            >
              {t('landing.contact.ctaButton')}
            </Link>
            <Link
              href={`/${locale}/faq`}
              className="inline-flex w-full items-center justify-center rounded-lg border border-white/20 px-6 py-3 text-sm text-zinc-300 transition hover:bg-white/5"
            >
              {t('landing.contact.faqLink')}
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
