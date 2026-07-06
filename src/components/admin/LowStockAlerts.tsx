import { createAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_TENANT_ID } from '@/lib/tenant/constants';
import type { InventoryItem } from '@/types/database';
import { getTranslations } from '@/lib/i18n/server';
import type { Locale } from '@/lib/i18n/config';
import { AlertTriangle } from 'lucide-react';

export async function LowStockAlerts({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);
  let lowStock: InventoryItem[] = [];

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('tenant_id', DEFAULT_TENANT_ID)
      .order('quantity', { ascending: true });

    lowStock = ((data ?? []) as InventoryItem[]).filter(
      (item) => item.quantity <= item.reorder_level
    );
  } catch {
    lowStock = [];
  }

  if (lowStock.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
      <div className="mb-3 flex items-center gap-2 text-amber-400">
        <AlertTriangle className="h-5 w-5" />
        <h3 className="font-semibold">{t.admin.lowStock.title}</h3>
      </div>
      <ul className="space-y-2">
        {lowStock.slice(0, 5).map((item) => (
          <li key={item.id} className="flex justify-between text-sm text-zinc-300">
            <span>{item.name}</span>
            <span className="text-amber-300">
              {item.quantity} / {t.admin.lowStock.reorder} {item.reorder_level}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
