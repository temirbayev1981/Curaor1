import { FAQSection } from '@/components/landing/FAQSection';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import type { Locale } from '@/lib/i18n/config';
import { getTranslations } from '@/lib/i18n/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getTranslations(locale as Locale);
  return { title: t.landing.faq.title, description: t.landing.faq.subtitle };
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <PublicHeader locale={locale as Locale} />
      <main className="pt-16">
        <FAQSection />
      </main>
      <PublicFooter locale={locale as Locale} />
    </>
  );
}
