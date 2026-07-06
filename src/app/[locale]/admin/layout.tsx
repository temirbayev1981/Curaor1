import { AdminSidebar } from '@/components/admin/AdminSidebar';
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
        <header className="flex h-16 items-center border-b border-admin-border px-8">
          <h1 className="text-lg font-semibold text-white">Admin Panel</h1>
        </header>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}
