import { notFound } from 'next/navigation';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { CityPageContent } from '@/components/landing/CityPageContent';
import { CAROLINA_CITIES } from '@/domain/ai/ai-content.service';
import { absoluteUrl } from '@/lib/config/env';
import { getTranslations } from '@/lib/i18n/server';
import { getStateName, interpolate } from '@/lib/i18n/city-content';
import type { Locale } from '@/lib/i18n/config';

export function generateStaticParams() {
  return Object.keys(CAROLINA_CITIES).flatMap((city) => [
    { locale: 'en', city },
    { locale: 'ru', city },
  ]);
}

function getRelatedCities(citySlug: string, locale: Locale) {
  const current = CAROLINA_CITIES[citySlug];
  if (!current) return [];

  const sameState = Object.entries(CAROLINA_CITIES)
    .filter(([slug, c]) => slug !== citySlug && c.state === current.state)
    .map(([slug, c]) => ({ slug, name: c[locale], state: c.state }));

  const otherState = Object.entries(CAROLINA_CITIES)
    .filter(([slug, c]) => slug !== citySlug && c.state !== current.state)
    .map(([slug, c]) => ({ slug, name: c[locale], state: c.state }));

  return [...sameState, ...otherState].slice(0, 5);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; city: string }>;
}) {
  const { locale, city: citySlug } = await params;
  const city = CAROLINA_CITIES[citySlug];
  if (!city) return {};

  const loc = locale as Locale;
  const cityName = city[loc];
  const stateFull = getStateName(city.state, loc);
  const t = getTranslations(loc);

  const title = interpolate(t.cityPage.metaTitle, {
    city: cityName,
    state: city.state,
    stateFull,
  });
  const description = interpolate(t.cityPage.metaDescription, {
    city: cityName,
    state: city.state,
    stateFull,
  });

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(`/${locale}/locations/${citySlug}`),
      languages: {
        en: absoluteUrl(`/en/locations/${citySlug}`),
        ru: absoluteUrl(`/ru/locations/${citySlug}`),
      },
    },
    openGraph: { title, description },
  };
}

export default async function CityLocationPage({
  params,
}: {
  params: Promise<{ locale: string; city: string }>;
}) {
  const { locale, city: citySlug } = await params;
  const city = CAROLINA_CITIES[citySlug];
  if (!city) notFound();

  const loc = locale as Locale;
  const cityName = city[loc];
  const stateFull = getStateName(city.state, loc);
  const t = getTranslations(loc);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `The Emerald Pour — ${cityName}`,
    description: interpolate(t.cityPage.metaDescription, {
      city: cityName,
      state: city.state,
      stateFull,
    }),
    url: absoluteUrl(`/${locale}/locations/${citySlug}`),
    areaServed: {
      '@type': 'City',
      name: cityName,
      containedInPlace: {
        '@type': 'State',
        name: stateFull,
      },
    },
    priceRange: '$$$',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicHeader locale={loc} />
      <main>
        <CityPageContent
          locale={loc}
          citySlug={citySlug}
          cityName={cityName}
          state={city.state}
          stateFull={stateFull}
          relatedCities={getRelatedCities(citySlug, loc)}
        />
      </main>
      <PublicFooter locale={loc} />
    </>
  );
}
