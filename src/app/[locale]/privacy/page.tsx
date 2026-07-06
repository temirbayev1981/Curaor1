import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { LegalDocument } from '@/components/legal/LegalDocument';
import { getTranslations } from '@/lib/i18n/server';
import type { Locale } from '@/lib/i18n/config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getTranslations(locale as Locale);
  return {
    title: t.privacy.title,
    description: t.privacy.s1Body.slice(0, 160),
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <PublicHeader locale={locale as Locale} />
      <main>
        <LegalDocument namespace="privacy" />
      </main>
      <PublicFooter locale={locale as Locale} />
    </>
  );
}
