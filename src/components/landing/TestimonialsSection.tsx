'use client';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Quote } from 'lucide-react';

const testimonials = ['t1', 't2', 't3'] as const;

export function TestimonialsSection() {
  const { t } = useTranslation();

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-3 text-3xl font-bold text-white sm:text-4xl">
            {t('testimonials.title')}
          </h2>
          <p className="mx-auto max-w-2xl text-zinc-400">
            {t('testimonials.subtitle')}
          </p>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((key, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card flex flex-col rounded-2xl p-6"
            >
              <Quote className="mb-4 h-8 w-8 text-emerald-500/40" />
              <p className="mb-6 flex-1 text-sm leading-relaxed text-zinc-300">
                &ldquo;{t(`testimonials.${key}.quote`)}&rdquo;
              </p>
              <div className="border-t border-white/5 pt-4">
                <p className="font-medium text-white">
                  {t(`testimonials.${key}.name`)}
                </p>
                <p className="text-xs text-zinc-500">
                  {t(`testimonials.${key}.event`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
