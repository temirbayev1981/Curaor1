'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Heart, Building2, PartyPopper, Clover } from 'lucide-react';
import { SERVICE_IMAGES } from '@/lib/media/landing-images';
import { formatCurrency } from '@/lib/format/currency';
import type { ServiceEventKey, ServicesPricing } from '@/lib/booking/service-pricing';
import type { Locale } from '@/lib/i18n/config';

const services: Array<{ key: ServiceEventKey; icon: typeof Heart; color: string }> = [
  { key: 'weddings', icon: Heart, color: 'text-rose-400' },
  { key: 'corporate', icon: Building2, color: 'text-blue-400' },
  { key: 'private', icon: PartyPopper, color: 'text-purple-400' },
  { key: 'stpatricks', icon: Clover, color: 'text-irish' },
] as const;

export function ServicesSection({
  locale,
  pricing,
}: {
  locale: Locale;
  pricing: ServicesPricing;
}) {
  const { t } = useTranslation();

  const formatPrice = (amount: number) =>
    formatCurrency(amount, locale, pricing.currency);

  return (
    <section id="services" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.h2
          className="mb-4 text-center text-3xl font-bold text-white sm:text-4xl"
          initial={false}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {t('services.title')}
        </motion.h2>
        <p className="mb-16 text-center text-sm text-muted-secondary">{t('services.priceNote')}</p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map(({ key, icon: Icon, color }, i) => {
            const price = pricing.events[key] ?? 0;
            const priceLabel = t('services.priceFrom', { price: formatPrice(price) });

            return (
              <motion.div
                key={key}
                className="overflow-hidden rounded-2xl border border-border bg-card"
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, borderColor: 'rgba(0, 166, 58, 0.3)' }}
              >
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src={SERVICE_IMAGES[key as keyof typeof SERVICE_IMAGES]}
                    alt={t(`services.${key}`)}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <Icon className={`absolute left-4 top-4 h-8 w-8 ${color} drop-shadow`} />
                </div>
                <div className="p-6">
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    {t(`services.${key}`)}
                  </h3>
                  <p className="mb-4 text-sm text-muted-secondary">
                    {t(`services.${key}Desc`)}
                  </p>
                  <p className="text-lg font-bold text-gold">{priceLabel}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
