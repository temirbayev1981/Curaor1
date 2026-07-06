'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Beer, Martini, UtensilsCrossed, Wine } from 'lucide-react';
import { MENU_CATEGORY_IMAGES } from '@/lib/media/landing-images';

const categories = [
  { key: 'beer', icon: Beer, image: MENU_CATEGORY_IMAGES.beer },
  { key: 'whiskey', icon: Wine, image: MENU_CATEGORY_IMAGES.whiskey },
  { key: 'cocktails', icon: Martini, image: MENU_CATEGORY_IMAGES.cocktails },
  { key: 'food', icon: UtensilsCrossed, image: MENU_CATEGORY_IMAGES.food },
] as const;

export function MenuPreviewSection() {
  const { t } = useTranslation();

  return (
    <section id="menu" className="relative overflow-hidden border-y border-gold/10 py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/80 via-black to-emerald-950/60" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={false}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-gold">
            {t('landing.menu.eyebrow')}
          </p>
          <h2 className="font-serif text-3xl font-bold text-white sm:text-5xl">
            {t('landing.menu.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
            {t('landing.menu.subtitle')}
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {categories.map(({ key, icon: Icon, image }, i) => (
            <motion.article
              key={key}
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl shadow-black/50"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  unoptimized
                  className="object-cover transition duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <Icon className="h-5 w-5 text-gold" />
                  <h3 className="font-serif text-xl font-bold text-white">
                    {t(`landing.menu.categories.${key}.title`)}
                  </h3>
                </div>
              </div>
              <ul className="space-y-2 p-5">
                {[1, 2, 3, 4].map((n) => (
                  <li
                    key={n}
                    className="border-b border-white/5 pb-2 text-sm text-zinc-300 last:border-0"
                  >
                    {t(`landing.menu.categories.${key}.items.i${n}`)}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
