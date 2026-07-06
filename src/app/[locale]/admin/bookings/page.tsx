import { AdminBookingsTable } from '@/components/admin/AdminBookingsTable';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { getTranslations } from '@/lib/i18n/server';
import type { Locale } from '@/lib/i18n/config';

export default async function AdminBookingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getTranslations(locale as Locale);

  return (
    <div>
      <AdminPageHeader
        title={t.admin.bookings}
        description={t.admin.bookingsDesc}
      />
      <AdminBookingsTable locale={locale as Locale} />
    </div>
  );
}
