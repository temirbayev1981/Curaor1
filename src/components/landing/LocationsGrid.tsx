'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';

interface CityEntry {
  slug: string;
  name: string;
  state: string;
}

export function LocationsGrid({
  locale,
  cities,
}: {
  locale: Locale;
  cities: CityEntry[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cities.map((city, i) => (
        <motion.div
          key={city.slug}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Link
            href={`/${locale}/locations/${city.slug}`}
            className="glass-card group flex items-center justify-between gap-4 rounded-2xl p-6 transition hover:border-emerald-500/30"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                <MapPin className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white group-hover:text-emerald-300">
                  {city.name}
                </h2>
                <p className="text-sm text-zinc-500">{city.state}</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-zinc-600 transition group-hover:text-emerald-400" />
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
