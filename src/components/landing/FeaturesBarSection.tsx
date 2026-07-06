'use client';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Beer, Clover, Music2, Truck } from 'lucide-react';

const features = [
  { key: 'fullBar', icon: Beer },
  { key: 'mobile', icon: Truck },
  { key: 'events', icon: Music2 },
  { key: 'authentic', icon: Clover },
] as const;

export function FeaturesBarSection() {
  const { t } = useTranslation();

  return (
    <section className="border-y border-gold/10 bg-emerald-950 py-12">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {features.map(({ key, icon: Icon }, i) => (
          <motion.div
            key={key}
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="text-center"
          >
            <Icon className="mx-auto mb-4 h-10 w-10 text-gold" strokeWidth={1.5} />
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-white">
              {t(`landing.features.${key}.title`)}
            </h3>
            <p className="text-sm leading-relaxed text-emerald-100/70">
              {t(`landing.features.${key}.desc`)}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
