'use client';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, Star, Award } from 'lucide-react';

const items = [
  { key: 'events', value: '500+', icon: Calendar },
  { key: 'cities', value: '25+', icon: MapPin },
  { key: 'rating', value: '4.9', icon: Star },
  { key: 'years', value: '8+', icon: Award },
] as const;

export function StatsSection() {
  const { t } = useTranslation();

  return (
    <section className="relative border-y border-white/5 bg-white/[0.02] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {items.map(({ key, value, icon: Icon }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <Icon className="mx-auto mb-3 h-6 w-6 text-emerald-400" />
              <p className="text-3xl font-bold text-white sm:text-4xl">{value}</p>
              <p className="mt-1 text-sm text-zinc-500">{t(`stats.${key}`)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
