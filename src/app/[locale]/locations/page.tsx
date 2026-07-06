import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { CAROLINA_CITIES } from '@/domain/ai/ai-content.service';
import { getTranslations } from '@/lib/i18n/server';
import type { Locale } from '@/lib/i18n/config';
import { MapPin } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getTranslations(locale as Locale);
  return {
    title: t.locations.title,
    description: t.locations.subtitle,
  };
}

export default async function LocationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getTranslations(locale as Locale);

  return (
    <>
      <PublicHeader locale={locale as Locale} />
      <main className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="mb-4 text-4xl font-bold text-white">{t.locations.title}</h1>
          <p className="mb-12 text-lg text-zinc-400">{t.locations.subtitle}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(CAROLINA_CITIES).map(([slug, city]) => (
              <Link
                key={slug}
                href={`/${locale}/locations/${slug}`}
                className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-6 transition hover:border-emerald-500/30 hover:bg-white/10"
              >
                <MapPin className="h-6 w-6 text-emerald-400" />
                <div>
                  <h2 className="text-lg font-semibold text-white group-hover:text-emerald-300">
                    {city[locale as Locale]}
                  </h2>
                  <p className="text-sm text-zinc-500">{city.state}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <PublicFooter locale={locale as Locale} />
    </>
  );
}
