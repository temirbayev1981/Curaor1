import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { PublicSiteExtras } from '@/components/layout/PublicSiteExtras';
import type { Locale } from '@/lib/i18n/config';

export function PublicSubpageLayout({
  locale,
  children,
  extras = false,
}: {
  locale: Locale;
  children: React.ReactNode;
  extras?: boolean;
}) {
  return (
    <>
      <PublicHeader locale={locale} />
      <main className="pt-16">{children}</main>
      <PublicFooter locale={locale} />
      {extras ? <PublicSiteExtras locale={locale} /> : null}
    </>
  );
}
