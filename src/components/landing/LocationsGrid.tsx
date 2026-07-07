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
            className="glass-card group flex items-center justify-between gap-4 rounded-2xl p-6 transition hover:border-irish/30"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-irish/10">
                <MapPin className="h-6 w-6 text-irish" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white group-hover:text-accent-neon">
                  {city.name}
                </h2>
                <p className="text-sm text-muted-secondary">{city.state}</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-secondary transition group-hover:text-irish" />
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
