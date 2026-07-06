import { MenuPreviewSection } from '@/components/landing/MenuPreviewSection';
import { FoodShowcaseSection } from '@/components/landing/FoodShowcaseSection';
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
    title: t.nav.menu,
    description: t.landing.menu.subtitle,
  };
}

export default async function MenuPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <PublicSubpageLayout locale={locale as Locale}>
      <MenuPreviewSection />
      <FoodShowcaseSection />
    </PublicSubpageLayout>
  );
}
