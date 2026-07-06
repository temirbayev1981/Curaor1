'use client';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Award, Beer, Shield, Truck } from 'lucide-react';

const badges = [
  { key: 'licensed', icon: Beer },
  { key: 'insured', icon: Shield },
  { key: 'mobile', icon: Truck },
  { key: 'rated', icon: Award },
] as const;

export function TrustBadgesSection() {
  const { t } = useTranslation();

  return (
    <section className="py-16">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {badges.map(({ key, icon: Icon }, i) => (
          <motion.div
            key={key}
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="glass-card flex items-start gap-4 rounded-2xl p-5"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/10">
              <Icon className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{t(`landing.trust.${key}.title`)}</h3>
              <p className="mt-1 text-sm text-zinc-400">{t(`landing.trust.${key}.desc`)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
