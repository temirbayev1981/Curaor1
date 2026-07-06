import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import type { Locale } from '@/lib/i18n/config';

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="admin-theme flex min-h-screen">
      <AdminSidebar locale={locale as Locale} />
      <div className="flex-1 overflow-auto">
        <AdminHeader />
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}
