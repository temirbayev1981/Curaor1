import { AdminCustomersTable } from '@/components/admin/AdminCustomersTable';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { getTranslations } from '@/lib/i18n/server';
import type { Locale } from '@/lib/i18n/config';

export default async function AdminCustomersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getTranslations(locale as Locale);

  return (
    <div>
      <AdminPageHeader
        title={t.admin.customers}
        description={t.admin.customersDesc}
      />
      <AdminCustomersTable locale={locale} />
    </div>
  );
}
