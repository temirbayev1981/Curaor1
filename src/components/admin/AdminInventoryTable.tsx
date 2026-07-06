'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { InventoryItem } from '@/types/database';
import { Button } from '@/components/ui/Button';

export function AdminInventoryTable({ initialItems }: { initialItems: InventoryItem[] }) {
  const { t } = useTranslation();
  const [items, setItems] = useState(initialItems);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function adjust(itemId: string, delta: number) {
    setLoadingId(itemId);
    const res = await fetch(`/api/admin/inventory/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta }),
    });
    const json = (await res.json()) as { data: InventoryItem | null };
    if (json.data) {
      setItems((prev) => prev.map((i) => (i.id === itemId ? json.data! : i)));
    }
    setLoadingId(null);
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-admin-border bg-admin-surface px-4 py-12 text-center text-zinc-500">
        {t('admin.inventoryTable.empty')}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-admin-border bg-admin-surface">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-admin-border bg-admin-bg">
          <tr>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
              {t('admin.inventoryTable.name')}
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
              {t('admin.inventoryTable.sku')}
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
              {t('admin.inventoryTable.qty')}
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
              {t('admin.inventoryTable.actions')}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-admin-border">
              <td className="px-4 py-3 font-medium text-white">{item.name}</td>
              <td className="px-4 py-3 text-zinc-400">{item.sku}</td>
              <td className="px-4 py-3">
                <span
                  className={
                    item.quantity <= item.reorder_level ? 'text-amber-400' : 'text-zinc-300'
                  }
                >
                  {item.quantity}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    loading={loadingId === item.id}
                    onClick={() => adjust(item.id, 1)}
                  >
                    +1
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    loading={loadingId === item.id}
                    onClick={() => adjust(item.id, -1)}
                  >
                    -1
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
