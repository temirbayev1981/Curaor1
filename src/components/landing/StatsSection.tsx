'use client';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Calendar, Clover, MapPin, Star } from 'lucide-react';

const items = [
  { key: 'newlyOpened', icon: Clover },
  { key: 'serving', icon: MapPin },
  { key: 'premium', icon: Star },
  { key: 'booking', icon: Calendar },
] as const;

export function StatsSection() {
  const { t } = useTranslation();

  return (
    <section className="relative border-y border-border bg-background py-14">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {items.map(({ key, icon: Icon }, i) => (
          <motion.div
            key={key}
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl border border-border bg-card/50 px-4 py-6 text-center"
          >
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-irish/10">
              <Icon className="h-5 w-5 text-irish" strokeWidth={1.75} />
            </div>
            <h3 className="mb-1.5 text-sm font-bold uppercase tracking-wide text-white">
              {t(`stats.${key}.title`)}
            </h3>
            <p className="text-sm leading-relaxed text-muted-caption">
              {t(`stats.${key}.desc`)}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
