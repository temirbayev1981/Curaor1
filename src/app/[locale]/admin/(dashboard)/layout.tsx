import { AdminShell } from '@/components/admin/AdminShell';
import type { Locale } from '@/lib/i18n/config';

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <AdminShell locale={locale as Locale}>{children}</AdminShell>;
}
