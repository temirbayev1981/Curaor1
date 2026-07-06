import { AdminBookingDetail } from '@/components/admin/AdminBookingDetail';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { getTranslations } from '@/lib/i18n/server';
import type { Locale } from '@/lib/i18n/config';

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = getTranslations(locale as Locale);

  return (
    <div>
      <AdminPageHeader
        title={t.admin.bookingDetail.title}
        description={t.admin.bookingDetail.desc}
      />
      <AdminBookingDetail locale={locale as Locale} bookingId={id} />
    </div>
  );
}
