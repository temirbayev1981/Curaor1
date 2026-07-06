import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { PublicSiteExtras } from '@/components/layout/PublicSiteExtras';
import { AboutSection } from '@/components/landing/AboutSection';
import { ContactSection } from '@/components/landing/ContactSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { GalleryStripSection } from '@/components/landing/GalleryStripSection';
import { ExperienceGridSection } from '@/components/landing/ExperienceGridSection';
import { FeaturesBarSection } from '@/components/landing/FeaturesBarSection';
import { HeroSection } from '@/components/landing/HeroSection';
import { FoodShowcaseSection } from '@/components/landing/FoodShowcaseSection';
import { MenuPreviewSection } from '@/components/landing/MenuPreviewSection';
import { OccasionsSection } from '@/components/landing/OccasionsSection';
import { PricingPackagesSection } from '@/components/landing/PricingPackagesSection';
import { ServicesSection } from '@/components/landing/ServicesSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { TrustBadgesSection } from '@/components/landing/TrustBadgesSection';
import { CTASection } from '@/components/landing/CTASection';
import type { Locale } from '@/lib/i18n/config';
import { absoluteUrl } from '@/lib/config/env';
import { getTranslations } from '@/lib/i18n/server';

const FAQ_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'] as const;

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
      type: 'website',
      url: absoluteUrl(`/${locale}`),
      images: [
        {
          url: 'https://images.unsplash.com/photo-1720110919165-49df0e4f5d49?w=1200&q=85',
          width: 1200,
          height: 630,
          alt: 'Pint of Guinness stout',
        },
      ],
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getTranslations(locale as Locale);

  const jsonLdBusiness = {
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
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '500',
    },
  };

  const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_KEYS.map((key) => ({
      '@type': 'Question',
      name: t.landing.faq.items[key].q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: t.landing.faq.items[key].a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBusiness) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />
      <PublicHeader locale={locale as Locale} />
      <main>
        <HeroSection locale={locale as Locale} />
        <FeaturesBarSection />
        <StatsSection />
        <AboutSection locale={locale as Locale} />
        <TrustBadgesSection />
        <OccasionsSection />
        <PricingPackagesSection locale={locale as Locale} />
        <MenuPreviewSection />
        <FoodShowcaseSection />
        <ServicesSection />
        <GalleryStripSection locale={locale as Locale} />
        <ExperienceGridSection />
        <TestimonialsSection />
        <FAQSection />
        <ContactSection locale={locale as Locale} />
        <CTASection locale={locale as Locale} />
      </main>
      <PublicFooter locale={locale as Locale} />
      <PublicSiteExtras locale={locale as Locale} />
    </>
  );
}
