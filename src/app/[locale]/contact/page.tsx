import { ContactSection } from '@/components/landing/ContactSection';
import { CTASection } from '@/components/landing/CTASection';
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
    title: t.nav.contact,
    description: t.landing.contact.subtitle,
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <PublicSubpageLayout locale={locale as Locale} extras>
      <ContactSection locale={locale as Locale} />
      <CTASection locale={locale as Locale} />
    </PublicSubpageLayout>
  );
}
