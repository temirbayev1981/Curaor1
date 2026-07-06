'use client';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Beer, Martini, Wine } from 'lucide-react';

const categories = [
  { key: 'beer', icon: Beer },
  { key: 'whiskey', icon: Wine },
  { key: 'cocktails', icon: Martini },
] as const;

export function MenuPreviewSection() {
  const { t } = useTranslation();

  return (
    <section id="menu" className="border-y border-white/5 bg-emerald-950/30 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={false}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">
            {t('landing.menu.title')}
          </h2>
          <p className="mt-3 text-zinc-400">{t('landing.menu.subtitle')}</p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {categories.map(({ key, icon: Icon }, i) => (
            <motion.div
              key={key}
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-white/10 bg-black/20 p-6"
            >
              <Icon className="mb-4 h-8 w-8 text-gold" />
              <h3 className="mb-4 text-lg font-semibold text-white">
                {t(`landing.menu.categories.${key}.title`)}
              </h3>
              <ul className="space-y-2">
                {[1, 2, 3, 4].map((n) => (
                  <li
                    key={n}
                    className="flex justify-between border-b border-white/5 pb-2 text-sm"
                  >
                    <span className="text-zinc-300">
                      {t(`landing.menu.categories.${key}.items.i${n}`)}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
