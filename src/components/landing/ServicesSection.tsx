'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Heart, Building2, PartyPopper, Clover, Users } from 'lucide-react';
import { GUEST_PACKAGE_IMAGES, SERVICE_IMAGES } from '@/lib/media/landing-images';
import type { Locale } from '@/lib/i18n/config';

const services = [
  { key: 'weddings', icon: Heart, color: 'text-rose-400' },
  { key: 'corporate', icon: Building2, color: 'text-blue-400' },
  { key: 'private', icon: PartyPopper, color: 'text-purple-400' },
  { key: 'stpatricks', icon: Clover, color: 'text-irish' },
] as const;

const guestPackages = [
  { key: 'g10', guests: 10 },
  { key: 'g15', guests: 15 },
  { key: 'g20', guests: 20 },
  { key: 'g30', guests: 30 },
] as const;

export function ServicesSection({ locale }: { locale: Locale }) {
  const { t } = useTranslation();

  return (
    <section id="services" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.h2
          className="mb-16 text-center text-3xl font-bold text-white sm:text-4xl"
          initial={false}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {t('services.title')}
        </motion.h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map(({ key, icon: Icon, color }, i) => (
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
                  src={SERVICE_IMAGES[key]}
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
                <p className="text-sm text-muted-secondary">
                  {t(`services.${key}Desc`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-20 text-center"
          initial={false}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-white sm:text-3xl">
            {t('services.packagesTitle')}
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-muted-secondary">
            {t('services.packagesSubtitle')}
          </p>
        </motion.div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {guestPackages.map(({ key, guests }, i) => (
            <motion.div
              key={key}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, borderColor: 'rgba(0, 166, 58, 0.3)' }}
            >
              <div className="relative aspect-[16/10] w-full">
                <Image
                  src={GUEST_PACKAGE_IMAGES[key]}
                  alt={t(`services.${key}`)}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <Users className="absolute left-4 top-4 h-8 w-8 text-gold drop-shadow" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="mb-2 text-lg font-semibold text-white">
                  {t(`services.${key}`)}
                </h3>
                <p className="mb-6 flex-1 text-sm text-muted-secondary">
                  {t(`services.${key}Desc`)}
                </p>
                <Link
                  href={`/${locale}/book?guests=${guests}`}
                  className="rounded-lg border border-border px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:border-irish hover:text-irish"
                >
                  {t('services.bookPackage')}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
