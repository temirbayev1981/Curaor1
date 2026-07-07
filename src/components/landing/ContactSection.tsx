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
            <p className="mb-8 text-lg text-muted-secondary">{t('landing.contact.subtitle')}</p>
            <div className="space-y-4">
              <a
                href="tel:+17045550199"
                className="flex items-center gap-3 text-muted transition hover:text-irish"
              >
                <Phone className="h-5 w-5 text-irish" />
                (704) 555-0199
              </a>
              <a
                href="mailto:bookings@emeraldpour.com"
                className="flex items-center gap-3 text-muted transition hover:text-irish"
              >
                <Mail className="h-5 w-5 text-irish" />
                bookings@emeraldpour.com
              </a>
              <p className="flex items-center gap-3 text-muted">
                <MapPin className="h-5 w-5 text-irish" />
                {t('landing.contact.area')}
              </p>
              <p className="flex items-center gap-3 text-muted">
                <Clock className="h-5 w-5 text-irish" />
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
            <p className="mb-6 text-sm text-muted-secondary">{t('landing.contact.ctaDesc')}</p>
            <Link
              href={`/${locale}/book`}
              className="btn-primary mb-4 inline-flex w-full items-center justify-center px-6 py-3 font-semibold"
            >
              {t('landing.contact.ctaButton')}
            </Link>
            <Link
              href={`/${locale}/faq`}
              className="inline-flex w-full items-center justify-center rounded-lg border border-border px-6 py-3 text-sm text-muted transition hover:border-irish hover:text-irish"
            >
              {t('landing.contact.faqLink')}
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
