'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Quote } from 'lucide-react';
import { TESTIMONIAL_IMAGES } from '@/lib/media/landing-images';

const testimonials = ['t1', 't2', 't3'] as const;

export function TestimonialsSection() {
  const { t } = useTranslation();

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          className="mb-16 text-center"
          initial={false}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-3 text-3xl font-bold text-white sm:text-4xl">
            {t('testimonials.title')}
          </h2>
          <p className="mx-auto max-w-2xl text-muted-secondary">
            {t('testimonials.subtitle')}
          </p>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((key, i) => (
            <motion.div
              key={key}
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card overflow-hidden rounded-2xl"
            >
              <div className="relative h-40 w-full">
                <Image
                  src={TESTIMONIAL_IMAGES[key]}
                  alt={t(`testimonials.${key}.event`)}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
              </div>
              <div className="flex flex-col p-6">
              <Quote className="mb-4 h-8 w-8 text-irish/40" />
              <p className="mb-6 flex-1 text-sm leading-relaxed text-muted">
                &ldquo;{t(`testimonials.${key}.quote`)}&rdquo;
              </p>
              <div className="border-t border-border pt-4">
                <p className="font-medium text-white">
                  {t(`testimonials.${key}.name`)}
                </p>
                <p className="text-xs text-muted-secondary">
                  {t(`testimonials.${key}.event`)}
                </p>
              </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
