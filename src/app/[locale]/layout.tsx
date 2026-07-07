import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { isValidLocale, type Locale } from '@/lib/i18n/config';
import { I18nProvider } from '@/components/providers/I18nProvider';
import { TenantProvider } from '@/components/providers/TenantProvider';
import { getPublicTenantId, getPublicTenantSlug } from '@/lib/tenant/public-tenant.server';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ru' }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const headerStore = await headers();
  const hostname = headerStore.get('host') ?? '';
  const [tenantId, tenantSlug] = await Promise.all([
    getPublicTenantId(hostname),
    getPublicTenantSlug(),
  ]);

  return (
    <I18nProvider locale={locale as Locale}>
      <TenantProvider tenantId={tenantId} tenantSlug={tenantSlug}>
        {children}
      </TenantProvider>
    </I18nProvider>
  );
}
