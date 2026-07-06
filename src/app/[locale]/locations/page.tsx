import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { LocationsGrid } from '@/components/landing/LocationsGrid';
import { CAROLINA_CITIES } from '@/domain/ai/ai-content.service';
import { getTranslations } from '@/lib/i18n/server';
import type { Locale } from '@/lib/i18n/config';

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

  const cities = Object.entries(CAROLINA_CITIES).map(([slug, city]) => ({
    slug,
    name: city[locale as Locale],
    state: city.state,
  }));

  return (
    <>
      <PublicHeader locale={locale as Locale} />
      <main className="relative min-h-screen pt-24 pb-16">
        <div className="bg-grid fixed inset-0 opacity-20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="mb-4 text-4xl font-bold text-white">{t.locations.title}</h1>
          <p className="mb-12 text-lg text-zinc-400">{t.locations.subtitle}</p>
          <LocationsGrid locale={locale as Locale} cities={cities} />
        </div>
      </main>
      <PublicFooter locale={locale as Locale} />
    </>
  );
}
