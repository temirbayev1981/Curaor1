import { ServicesSection } from '@/components/landing/ServicesSection';
import { OccasionsSection } from '@/components/landing/OccasionsSection';
import { PricingPackagesSection } from '@/components/landing/PricingPackagesSection';
import { PublicSubpageLayout } from '@/components/layout/PublicSubpageLayout';
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
    title: t.nav.services,
    description: t.services.weddingsDesc,
  };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <PublicSubpageLayout locale={locale as Locale}>
      <ServicesSection locale={locale as Locale} />
      <OccasionsSection />
      <PricingPackagesSection locale={locale as Locale} />
    </PublicSubpageLayout>
  );
}
