'use client';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Heart, Building2, PartyPopper, Clover } from 'lucide-react';

const services = [
  { key: 'weddings', icon: Heart, color: 'text-rose-400' },
  { key: 'corporate', icon: Building2, color: 'text-blue-400' },
  { key: 'private', icon: PartyPopper, color: 'text-purple-400' },
  { key: 'stpatricks', icon: Clover, color: 'text-emerald-400' },
] as const;

export function ServicesSection() {
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
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, borderColor: 'rgba(16, 185, 129, 0.3)' }}
            >
              <Icon className={`mb-4 h-8 w-8 ${color}`} />
              <h3 className="mb-2 text-lg font-semibold text-white">
                {t(`services.${key}`)}
              </h3>
              <p className="text-sm text-zinc-400">
                {t(`services.${key}Desc`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
