'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Clover } from 'lucide-react';
import { GALLERY_STRIP_IMAGES } from '@/lib/media/landing-images';
import type { Locale } from '@/lib/i18n/config';

export function GalleryStripSection({ locale }: { locale: Locale }) {
  const { t } = useTranslation();

  return (
    <section className="py-20">
      <div className="mx-auto mb-10 max-w-7xl px-4 text-center sm:px-6">
        <div className="mb-3 inline-flex items-center gap-2 text-gold">
          <Clover className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-widest">
            {t('landing.galleryStrip.eyebrow')}
          </span>
        </div>
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          {t('landing.galleryStrip.title')}
        </h2>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="mx-auto flex w-max gap-4 px-4 sm:px-6">
          {GALLERY_STRIP_IMAGES.map((image, i) => (
            <motion.div
              key={image.src}
              initial={false}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="relative h-64 w-80 shrink-0 overflow-hidden rounded-2xl border border-white/10 sm:h-72 sm:w-96"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition duration-500 hover:scale-105"
                sizes="384px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          href={`/${locale}/gallery`}
          className="text-sm font-medium text-emerald-400 transition hover:text-emerald-300"
        >
          {t('landing.galleryStrip.viewAll')} →
        </Link>
      </div>
    </section>
  );
}
