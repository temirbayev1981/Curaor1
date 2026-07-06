import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getTranslations } from '@/lib/i18n/server';
import { absoluteUrl } from '@/lib/config/env';
import type { Locale } from '@/lib/i18n/config';
import { ArrowRight } from 'lucide-react';

const EVENT_TYPES = ['wedding', 'corporate', 'private', 'stpatricks'] as const;
type EventType = (typeof EVENT_TYPES)[number];

function isEventType(value: string): value is EventType {
  return (EVENT_TYPES as readonly string[]).includes(value);
}

export function generateStaticParams() {
  return EVENT_TYPES.flatMap((type) => [
    { locale: 'en', type },
    { locale: 'ru', type },
  ]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}) {
  const { locale, type } = await params;
  if (!isEventType(type)) return {};

  const t = getTranslations(locale as Locale);
  const title = t.eventPages[type].metaTitle;
  const description = t.eventPages[type].metaDesc;

  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(`/${locale}/events/${type}`) },
    openGraph: { title, description },
  };
}

export default async function EventTypePage({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}) {
  const { locale, type } = await params;
  if (!isEventType(type)) notFound();

  const loc = locale as Locale;
  const t = getTranslations(loc);

  return (
    <>
      <PublicHeader locale={loc} />
      <main className="relative min-h-screen pt-24 pb-16">
        <div className="bg-grid fixed inset-0 opacity-20" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
          <h1 className="mb-4 text-4xl font-bold text-white">{t.eventPages[type].h1}</h1>
          <p className="mb-8 text-lg text-zinc-400">{t.eventPages[type].intro}</p>

          <Card className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-white">
              {t.eventPages[type].includesTitle}
            </h2>
            <ul className="space-y-2 text-zinc-300">
              {t.eventPages[type].includes.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 text-emerald-400">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          <Link href={`/${loc}/book?package=emerald&event=${type}`}>
            <Button size="lg">
              {t.eventPages[type].cta}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>
      <PublicFooter locale={loc} />
    </>
  );
}
