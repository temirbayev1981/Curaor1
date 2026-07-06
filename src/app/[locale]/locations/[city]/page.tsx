import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { CAROLINA_CITIES } from '@/domain/ai/ai-content.service';
import { getTranslations } from '@/lib/i18n/server';
import type { Locale } from '@/lib/i18n/config';

export function generateStaticParams() {
  return Object.keys(CAROLINA_CITIES).flatMap((city) => [
    { locale: 'en', city },
    { locale: 'ru', city },
  ]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; city: string }>;
}) {
  const { locale, city: citySlug } = await params;
  const city = CAROLINA_CITIES[citySlug];
  if (!city) return {};

  const cityName = city[locale as Locale];
  const title =
    locale === 'ru'
      ? `Мобильный ирландский паб в ${cityName} — The Emerald Pour`
      : `Mobile Irish Pub Catering in ${cityName}, ${city.state}`;

  const description =
    locale === 'ru'
      ? `Аренда мобильного ирландского паба в ${cityName}, ${city.state}. Свадьбы, корпоративы, частные вечеринки.`
      : `Rent a mobile Irish pub in ${cityName}, ${city.state}. Weddings, corporate events, and private parties.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://emeraldpour.com/${locale}/locations/${citySlug}`,
      languages: {
        en: `https://emeraldpour.com/en/locations/${citySlug}`,
        ru: `https://emeraldpour.com/ru/locations/${citySlug}`,
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

  const cityName = city[locale as Locale];
  const t = getTranslations(locale as Locale);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `The Emerald Pour — ${cityName}`,
    description:
      locale === 'ru'
        ? `Мобильный ирландский паб в ${cityName}`
        : `Mobile Irish pub catering in ${cityName}, ${city.state}`,
    url: `https://emeraldpour.com/${locale}/locations/${citySlug}`,
    areaServed: {
      '@type': 'City',
      name: cityName,
      containedInPlace: {
        '@type': 'State',
        name: city.state === 'NC' ? 'North Carolina' : 'South Carolina',
      },
    },
    priceRange: '$$$',
  };

  const content =
    locale === 'ru'
      ? {
          h1: `Мобильный ирландский паб в ${cityName}`,
          intro: `The Emerald Pour привозит аутентичную атмосферу ирландского паба прямо к вашей площадке в ${cityName}, ${city.state}. Независимо от того, планируете ли вы свадебный приём, корпоративное мероприятие или празднование Дня Святого Патрика, наш мобильный бар создаст незабываемый опыт.`,
          services: [
            'Свадебные приёмы и торжества',
            'Корпоративные мероприятия',
            'Частные вечеринки и юбилеи',
            'Празднование Дня Святого Патрика',
          ],
        }
      : {
          h1: `Mobile Irish Pub Catering in ${cityName}`,
          intro: `The Emerald Pour brings the authentic atmosphere of an Irish pub directly to your venue in ${cityName}, ${city.state}. Whether you're planning a wedding reception, corporate event, or St. Patrick's Day celebration, our mobile bar creates an unforgettable experience.`,
          services: [
            'Wedding receptions and celebrations',
            'Corporate events and team building',
            'Private parties and anniversaries',
            "St. Patrick's Day celebrations",
          ],
        };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicHeader locale={locale as Locale} />
      <main className="min-h-screen pt-24 pb-16">
        <article className="mx-auto max-w-4xl px-4 sm:px-6">
          <h1 className="mb-6 text-4xl font-bold text-white">{content.h1}</h1>
          <p className="mb-8 text-lg leading-relaxed text-zinc-300">{content.intro}</p>
          <h2 className="mb-4 text-2xl font-semibold text-white">
            {locale === 'ru' ? 'Наши услуги' : 'Our Services'}
          </h2>
          <ul className="mb-10 list-inside list-disc space-y-2 text-zinc-300">
            {content.services.map((service) => (
              <li key={service}>{service}</li>
            ))}
          </ul>
          <Link
            href={`/${locale}/book?city=${citySlug}`}
            className="inline-block rounded-xl bg-emerald-500 px-8 py-4 text-lg font-semibold text-white hover:bg-emerald-600"
          >
            {t.nav.book}
          </Link>
        </article>
      </main>
      <PublicFooter locale={locale as Locale} />
    </>
  );
}
