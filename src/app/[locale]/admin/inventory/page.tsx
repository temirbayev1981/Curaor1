import { inventoryService } from '@/domain/inventory/inventory.service';
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
          <span className="font-semibold text-emerald-400">
            ${cogs.toFixed(2)}
          </span>
        </p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-admin-border bg-admin-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-admin-border bg-admin-bg">
            <tr>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                {t.admin.inventoryTable.name}
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                {t.admin.inventoryTable.sku}
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                {t.admin.inventoryTable.category}
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                {t.admin.inventoryTable.qty}
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                {t.admin.inventoryTable.unitCost}
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                {t.admin.inventoryTable.unitPrice}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                  {t.admin.inventoryTable.empty}
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-admin-border transition hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3 font-medium text-white">{item.name}</td>
                  <td className="px-4 py-3 text-zinc-400">{item.sku}</td>
                  <td className="px-4 py-3 text-zinc-400">{item.category}</td>
                  <td className="px-4 py-3 text-zinc-300">
                    <span
                      className={
                        item.quantity <= item.reorder_level ? 'text-amber-400' : ''
                      }
                    >
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">${item.unit_cost}</td>
                  <td className="px-4 py-3 text-zinc-300">${item.unit_price}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
