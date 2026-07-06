'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Heart,
  Building2,
  PartyPopper,
  Clover,
  Shield,
  Truck,
  Star,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Locale } from '@/lib/i18n/config';
import { interpolate, CITY_SERVICE_KEYS, CITY_WHY_KEYS } from '@/lib/i18n/city-content';

const SERVICE_ICONS = {
  weddings: Heart,
  corporate: Building2,
  private: PartyPopper,
  stpatricks: Clover,
} as const;

const WHY_ICONS = {
  authentic: Star,
  premium: Sparkles,
  flexible: Truck,
  insured: Shield,
} as const;

interface RelatedCity {
  slug: string;
  name: string;
  state: string;
}

interface CityArticle {
  slug: string;
  title: string;
  updated_at: string;
}

interface CityPageContentProps {
  locale: Locale;
  citySlug: string;
  cityName: string;
  state: string;
  stateFull: string;
  relatedCities: RelatedCity[];
  articles?: CityArticle[];
}

export function CityPageContent({
  locale,
  citySlug,
  cityName,
  state,
  stateFull,
  relatedCities,
  articles = [],
}: CityPageContentProps) {
  const { t } = useTranslation();
  const vars = { city: cityName, state, stateFull };

  return (
    <div className="relative">
      <div className="bg-grid pointer-events-none fixed inset-0 opacity-20" />

      <div className="relative mx-auto max-w-6xl px-4 pt-24 pb-16 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-300">
            <MapPin className="h-4 w-4" />
            {cityName}, {state}
          </div>
          <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
            {interpolate(t('cityPage.h1'), vars)}
          </h1>
          <p className="max-w-3xl text-lg leading-relaxed text-zinc-400">
            {interpolate(t('cityPage.intro'), vars)}
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <section>
              <h2 className="mb-6 text-2xl font-semibold text-white">
                {interpolate(t('cityPage.servicesTitle'), vars)}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {CITY_SERVICE_KEYS.map((key, i) => {
                  const Icon = SERVICE_ICONS[key];
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <Card className="h-full transition hover:border-emerald-500/20">
                        <Icon className="mb-3 h-6 w-6 text-emerald-400" />
                        <h3 className="mb-2 font-semibold text-white">
                          {t(`services.${key}`)}
                        </h3>
                        <p className="text-sm text-zinc-400">
                          {t(`services.${key}Desc`)}
                        </p>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="mb-6 text-2xl font-semibold text-white">
                {t('cityPage.whyTitle')}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {CITY_WHY_KEYS.map((key, i) => {
                  const Icon = WHY_ICONS[key];
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.08 }}
                      className="glass-card rounded-xl p-5"
                    >
                      <Icon className="mb-2 h-5 w-5 text-emerald-400" />
                      <h3 className="mb-1 font-medium text-white">
                        {t(`cityPage.why.${key}.title`)}
                      </h3>
                      <p className="text-sm text-zinc-400">
                        {t(`cityPage.why.${key}.desc`)}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {articles.length > 0 && (
              <section>
                <h2 className="mb-4 text-xl font-semibold text-white">
                  {t('cityPage.articlesTitle')}
                </h2>
                <div className="space-y-3">
                  {articles.map((article) => (
                    <Link
                      key={article.slug}
                      href={`/${locale}/articles/${article.slug}`}
                      className="glass-card flex items-center justify-between rounded-xl p-4 transition hover:border-emerald-500/20"
                    >
                      <span className="font-medium text-white">{article.title}</span>
                      <ArrowRight className="h-4 w-4 text-emerald-400" />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {relatedCities.length > 0 && (
              <section>
                <h2 className="mb-4 text-xl font-semibold text-white">
                  {t('cityPage.relatedCities')}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {relatedCities.map((city) => (
                    <Link
                      key={city.slug}
                      href={`/${locale}/locations/${city.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 transition hover:border-emerald-500/30 hover:text-emerald-300"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      {city.name}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="!border-emerald-500/20 !bg-gradient-to-br from-emerald-500/10 to-transparent">
                <h3 className="mb-2 text-xl font-semibold text-white">
                  {interpolate(t('cityPage.ctaTitle'), vars)}
                </h3>
                <p className="mb-6 text-sm text-zinc-400">
                  {t('cityPage.ctaDesc')}
                </p>
                <Link href={`/${locale}/book?city=${citySlug}`}>
                  <Button size="lg" className="w-full">
                    {interpolate(t('cityPage.ctaButton'), vars)}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <p className="mt-4 text-center text-xs text-zinc-500">
                  {t('cta.call')}
                </p>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
