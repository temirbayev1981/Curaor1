import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import type { Locale } from '@/lib/i18n/config';

const content = {
  en: {
    title: 'Terms of Service',
    sections: [
      {
        heading: 'Booking & Deposits',
        body: 'A deposit of 25%, 50%, or 100% is required to secure your event date. The remaining balance is due before the event date unless otherwise agreed in writing.',
      },
      {
        heading: 'Cancellation Policy',
        body: 'Cancellations made more than 30 days before the event receive a full deposit refund. Cancellations within 30 days forfeit the deposit. Weather-related cancellations will be rescheduled at no additional cost.',
      },
      {
        heading: 'Service Area',
        body: 'The Emerald Pour serves North and South Carolina. Delivery costs are calculated based on distance from our Charlotte base at $2.50 per mile.',
      },
      {
        heading: 'Liability',
        body: 'We carry full liability insurance. Clients are responsible for obtaining any required venue permits. Guests must be 21+ for alcohol service with valid ID.',
      },
    ],
  },
  ru: {
    title: 'Условия использования',
    sections: [
      {
        heading: 'Бронирование и депозит',
        body: 'Для подтверждения даты мероприятия требуется депозит 25%, 50% или 100%. Остаток оплачивается до даты мероприятия, если не согласовано иное.',
      },
      {
        heading: 'Политика отмены',
        body: 'При отмене более чем за 30 дней депозит возвращается полностью. При отмене в течение 30 дней депозит не возвращается. Отмена из-за погоды — перенос без доплаты.',
      },
      {
        heading: 'Зона обслуживания',
        body: 'The Emerald Pour обслуживает Северную и Южную Каролину. Стоимость доставки рассчитывается от Шарлотты — $2.50 за милю.',
      },
      {
        heading: 'Ответственность',
        body: 'Мы имеем полную страховку ответственности. Клиенты отвечают за разрешения площадки. Гостям 21+ для алкоголя с удостоверением личности.',
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

export default async function TermsPage({
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
