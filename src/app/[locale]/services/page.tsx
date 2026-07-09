import { ServicesSection } from '@/components/landing/ServicesSection';
import { OccasionsSection } from '@/components/landing/OccasionsSection';
import { PricingPackagesSection } from '@/components/landing/PricingPackagesSection';
import { PublicSubpageLayout } from '@/components/layout/PublicSubpageLayout';
import { getPublicPackagePricing, getPublicServicesPricing } from '@/lib/booking/service-pricing.server';
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
  const servicesPricing = await getPublicServicesPricing();
  const packagePricing = await getPublicPackagePricing();

  return (
    <PublicSubpageLayout locale={locale as Locale}>
      <ServicesSection locale={locale as Locale} pricing={servicesPricing} />
      <OccasionsSection />
      <PricingPackagesSection locale={locale as Locale} pricing={packagePricing} />
    </PublicSubpageLayout>
  );
}
