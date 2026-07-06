import { AboutSection } from '@/components/landing/AboutSection';
import { TrustBadgesSection } from '@/components/landing/TrustBadgesSection';
import { StatsSection } from '@/components/landing/StatsSection';
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
    title: t.nav.about,
    description: t.landing.about.body,
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <PublicSubpageLayout locale={locale as Locale}>
      <AboutSection locale={locale as Locale} />
      <StatsSection />
      <TrustBadgesSection />
    </PublicSubpageLayout>
  );
}
