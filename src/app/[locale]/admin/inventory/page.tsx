import { inventoryService } from '@/domain/inventory/inventory.service';

import { DEFAULT_TENANT_ID } from '@/lib/tenant/constants';

export default async function AdminInventoryPage() {
  let items: Awaited<ReturnType<typeof inventoryService.list>> = [];

  try {
    items = await inventoryService.list(DEFAULT_TENANT_ID);
  } catch {
    // DB not connected
  }

  const cogs = inventoryService.calculateCogs(items);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Inventory</h2>
        <p className="text-sm text-zinc-400">
          Total COGS: <span className="text-emerald-400">${cogs.toFixed(2)}</span>
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border border-admin-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-admin-border bg-admin-bg">
            <tr>
              <th className="px-4 py-3 text-zinc-400">Name</th>
              <th className="px-4 py-3 text-zinc-400">SKU</th>
              <th className="px-4 py-3 text-zinc-400">Category</th>
              <th className="px-4 py-3 text-zinc-400">Qty</th>
              <th className="px-4 py-3 text-zinc-400">Unit Cost</th>
              <th className="px-4 py-3 text-zinc-400">Unit Price</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  No inventory items
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-admin-border">
                  <td className="px-4 py-3 text-white">{item.name}</td>
                  <td className="px-4 py-3 text-zinc-400">{item.sku}</td>
                  <td className="px-4 py-3 text-zinc-400">{item.category}</td>
                  <td className="px-4 py-3 text-zinc-300">
                    <span className={item.quantity <= item.reorder_level ? 'text-amber-400' : ''}>
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
