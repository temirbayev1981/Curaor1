import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { HeroSection } from '@/components/landing/HeroSection';
import { ServicesSection } from '@/components/landing/ServicesSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { CTASection } from '@/components/landing/CTASection';
import type { Locale } from '@/lib/i18n/config';
import { getTranslations } from '@/lib/i18n/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getTranslations(locale as Locale);

  return {
    title: t.hero.title,
    description: t.hero.description,
    alternates: {
      canonical: `https://emeraldpour.com/${locale}`,
      languages: {
        en: 'https://emeraldpour.com/en',
        ru: 'https://emeraldpour.com/ru',
      },
    },
    openGraph: {
      title: t.hero.title,
      description: t.hero.description,
      locale: locale === 'ru' ? 'ru_RU' : 'en_US',
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'The Emerald Pour',
    description: 'Mobile Irish Pub catering across North and South Carolina',
    url: `https://emeraldpour.com/${locale}`,
    telephone: '+1-704-555-0199',
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'NC',
      addressCountry: 'US',
    },
    areaServed: [
      'Charlotte, NC',
      'Raleigh, NC',
      'Greensboro, NC',
      'Charleston, SC',
      'Columbia, SC',
    ],
    priceRange: '$$$',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicHeader locale={locale as Locale} />
      <main>
        <HeroSection locale={locale as Locale} />
        <StatsSection />
        <ServicesSection />
        <TestimonialsSection />
        <CTASection locale={locale as Locale} />
      </main>
      <PublicFooter locale={locale as Locale} />
    </>
  );
}
