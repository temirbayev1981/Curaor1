import { inventoryService } from '@/domain/inventory/inventory.service';
import { AdminInventoryTable } from '@/components/admin/AdminInventoryTable';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { DEFAULT_TENANT_ID } from '@/lib/tenant/constants';
import { getTranslations } from '@/lib/i18n/server';
import type { Locale } from '@/lib/i18n/config';

export default async function AdminInventoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getTranslations(locale as Locale);

  let items: Awaited<ReturnType<typeof inventoryService.list>> = [];

  try {
    items = await inventoryService.list(DEFAULT_TENANT_ID);
  } catch {
    // DB not connected
  }

  const cogs = inventoryService.calculateCogs(items);

  return (
    <div>
      <AdminPageHeader
        title={t.admin.inventory}
        description={t.admin.inventoryDesc}
      />
      <div className="mb-4 flex justify-end">
        <p className="text-sm text-zinc-400">
          {t.admin.inventoryTable.totalCogs}:{' '}
          <span className="font-semibold text-emerald-400">${cogs.toFixed(2)}</span>
        </p>
      </div>
      <AdminInventoryTable initialItems={items} />
    </div>
  );
}
