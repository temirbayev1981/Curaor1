import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { AboutSection } from '@/components/landing/AboutSection';
import { GalleryStripSection } from '@/components/landing/GalleryStripSection';
import { ExperienceGridSection } from '@/components/landing/ExperienceGridSection';
import { FeaturesBarSection } from '@/components/landing/FeaturesBarSection';
import { HeroSection } from '@/components/landing/HeroSection';
import { OccasionsSection } from '@/components/landing/OccasionsSection';
import { ServicesSection } from '@/components/landing/ServicesSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { CTASection } from '@/components/landing/CTASection';
import type { Locale } from '@/lib/i18n/config';
import { absoluteUrl } from '@/lib/config/env';
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
      canonical: absoluteUrl(`/${locale}`),
      languages: {
        en: absoluteUrl('/en'),
        ru: absoluteUrl('/ru'),
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
    url: absoluteUrl(`/${locale}`),
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
        <FeaturesBarSection />
        <AboutSection locale={locale as Locale} />
        <OccasionsSection />
        <ServicesSection />
        <GalleryStripSection locale={locale as Locale} />
        <ExperienceGridSection />
        <TestimonialsSection />
        <CTASection locale={locale as Locale} />
      </main>
      <PublicFooter locale={locale as Locale} />
    </>
  );
}
