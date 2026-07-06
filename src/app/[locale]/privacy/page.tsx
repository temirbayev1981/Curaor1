import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import type { Locale } from '@/lib/i18n/config';

const content = {
  en: {
    title: 'Privacy Policy',
    sections: [
      {
        heading: 'Information We Collect',
        body: 'We collect information you provide when booking our mobile Irish pub services, including your name, email, phone number, event details, and payment information processed securely through Stripe.',
      },
      {
        heading: 'How We Use Your Data',
        body: 'Your data is used to process bookings, send confirmations, manage contracts, and improve our services. We do not sell your personal information to third parties.',
      },
      {
        heading: 'Data Security',
        body: 'All data is stored with tenant-level isolation using PostgreSQL Row Level Security. Payment data is handled exclusively by Stripe and never stored on our servers.',
      },
      {
        heading: 'Your Rights',
        body: 'You may request access, correction, or deletion of your personal data by contacting bookings@emeraldpour.com.',
      },
    ],
  },
  ru: {
    title: 'Политика конфиденциальности',
    sections: [
      {
        heading: 'Какие данные мы собираем',
        body: 'Мы собираем информацию, которую вы предоставляете при бронировании услуг мобильного ирландского паба: имя, email, телефон, детали мероприятия и платёжные данные, обрабатываемые через Stripe.',
      },
      {
        heading: 'Как мы используем данные',
        body: 'Ваши данные используются для обработки бронирований, отправки подтверждений, управления договорами и улучшения сервиса. Мы не продаём вашу личную информацию третьим лицам.',
      },
      {
        heading: 'Безопасность данных',
        body: 'Все данные хранятся с изоляцией на уровне арендатора (RLS). Платёжные данные обрабатываются исключительно Stripe и не хранятся на наших серверах.',
      },
      {
        heading: 'Ваши права',
        body: 'Вы можете запросить доступ, исправление или удаление ваших данных, написав на bookings@emeraldpour.com.',
      },
    ],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const c = content[locale as Locale] ?? content.en;
  return { title: c.title };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const c = content[locale as Locale] ?? content.en;

  return (
    <>
      <PublicHeader locale={locale as Locale} />
      <main className="min-h-screen pt-24 pb-16">
        <article className="mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="mb-8 text-4xl font-bold text-white">{c.title}</h1>
          <div className="space-y-8">
            {c.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="mb-3 text-xl font-semibold text-emerald-400">
                  {section.heading}
                </h2>
                <p className="leading-relaxed text-zinc-300">{section.body}</p>
              </section>
            ))}
          </div>
        </article>
      </main>
      <PublicFooter locale={locale as Locale} />
    </>
  );
}
