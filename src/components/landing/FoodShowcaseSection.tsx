'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FOOD_IMAGES } from '@/lib/media/landing-images';

export function FoodShowcaseSection() {
  const { t } = useTranslation();

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={false}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-gold">
            {t('landing.food.eyebrow')}
          </p>
          <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">
            {t('landing.food.title')}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-secondary">{t('landing.food.subtitle')}</p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {FOOD_IMAGES.map((image, i) => (
            <motion.div
              key={image.id}
              initial={false}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className={`relative overflow-hidden rounded-2xl ${
                i === 0 ? 'md:col-span-2 md:row-span-2 md:aspect-auto min-h-[320px]' : 'aspect-square'
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                unoptimized
                className="object-cover transition duration-700 hover:scale-105"
                sizes={i === 0 ? '50vw' : '25vw'}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
