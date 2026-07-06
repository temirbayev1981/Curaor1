'use client';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Briefcase,
  Cake,
  Clover,
  Heart,
  Martini,
  Tent,
} from 'lucide-react';

const occasions = [
  { key: 'weddings', icon: Heart },
  { key: 'corporate', icon: Briefcase },
  { key: 'private', icon: Martini },
  { key: 'festivals', icon: Tent },
  { key: 'birthdays', icon: Cake },
  { key: 'more', icon: Clover },
] as const;

export function OccasionsSection() {
  const { t } = useTranslation();

  return (
    <section className="bg-[#f5f0e6] py-20 text-emerald-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.h2
          initial={false}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-14 text-center font-serif text-3xl font-bold uppercase tracking-wide sm:text-4xl"
        >
          {t('landing.occasions.title')}
        </motion.h2>

        <div className="grid grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-6">
          {occasions.map(({ key, icon: Icon }, i) => (
            <motion.div
              key={key}
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex flex-col items-center text-center"
            >
              <Icon className="mb-4 h-12 w-12 text-emerald-800" strokeWidth={1.25} />
              <p className="text-xs font-bold uppercase tracking-wider">
                {t(`landing.occasions.${key}`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
