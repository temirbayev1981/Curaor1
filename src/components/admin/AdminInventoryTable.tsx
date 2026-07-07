'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { InventoryItem } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';

const EMPTY_FORM = {
  name: '',
  sku: '',
  category: 'supplies',
  quantity: '0',
  unitCost: '0',
  unitPrice: '0',
  reorderLevel: '10',
};

export function AdminInventoryTable({ initialItems }: { initialItems: InventoryItem[] }) {
  const { t } = useTranslation();
  const [items, setItems] = useState(initialItems);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');

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

  async function createItem(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoadingId('create');

    const res = await fetch('/api/admin/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        sku: form.sku,
        category: form.category,
        quantity: Number(form.quantity),
        unitCost: Number(form.unitCost),
        unitPrice: Number(form.unitPrice),
        reorderLevel: Number(form.reorderLevel),
      }),
    });

    const json = (await res.json()) as {
      data: InventoryItem | null;
      error: { message: string } | null;
    };

    if (!res.ok || !json.data) {
      setError(json.error?.message ?? t('admin.inventoryTable.createError'));
      setLoadingId(null);
      return;
    }

    setItems((prev) => [...prev, json.data!].sort((a, b) => a.name.localeCompare(b.name)));
    setForm(EMPTY_FORM);
    setLoadingId(null);
  }

  async function saveEdit(item: InventoryItem) {
    setLoadingId(item.id);
    setError('');

    const res = await fetch(`/api/admin/inventory/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: item.name,
        sku: item.sku,
        category: item.category,
        quantity: item.quantity,
        unitCost: item.unit_cost,
        unitPrice: item.unit_price,
        reorderLevel: item.reorder_level,
      }),
    });

    const json = (await res.json()) as {
      data: InventoryItem | null;
      error: { message: string } | null;
    };

    if (!res.ok || !json.data) {
      setError(json.error?.message ?? t('admin.inventoryTable.updateError'));
      setLoadingId(null);
      return;
    }

    setItems((prev) => prev.map((i) => (i.id === item.id ? json.data! : i)));
    setEditingId(null);
    setLoadingId(null);
  }

  async function removeItem(itemId: string) {
    if (!window.confirm(t('admin.inventoryTable.confirmDelete'))) return;

    setLoadingId(itemId);
    const res = await fetch(`/api/admin/inventory/${itemId}`, { method: 'DELETE' });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    }
    setLoadingId(null);
  }

  function updateEditing(itemId: string, field: keyof InventoryItem, value: string | number) {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, [field]: value } : i))
    );
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={createItem}
        className="rounded-2xl border border-admin-border bg-admin-surface p-4"
      >
        <h2 className="mb-4 font-semibold text-white">{t('admin.inventoryTable.addItem')}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label={t('admin.inventoryTable.name')}>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label={t('admin.inventoryTable.sku')}>
            <Input
              required
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
          </Field>
          <Field label={t('admin.inventoryTable.category')}>
            <Input
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </Field>
          <Field label={t('admin.inventoryTable.qty')}>
            <Input
              type="number"
              min={0}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </Field>
          <Field label={t('admin.inventoryTable.unitCost')}>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.unitCost}
              onChange={(e) => setForm({ ...form, unitCost: e.target.value })}
            />
          </Field>
          <Field label={t('admin.inventoryTable.unitPrice')}>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.unitPrice}
              onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
            />
          </Field>
          <Field label={t('admin.inventoryTable.reorderLevel')}>
            <Input
              type="number"
              min={0}
              value={form.reorderLevel}
              onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })}
            />
          </Field>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button type="submit" loading={loadingId === 'create'}>
            {t('admin.inventoryTable.saveItem')}
          </Button>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      </form>

      {items.length === 0 ? (
        <div className="rounded-xl border border-admin-border bg-admin-surface px-4 py-12 text-center text-zinc-500">
          {t('admin.inventoryTable.empty')}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-admin-border bg-admin-surface">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-admin-border bg-admin-bg">
              <tr>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {t('admin.inventoryTable.name')}
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {t('admin.inventoryTable.sku')}
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {t('admin.inventoryTable.category')}
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {t('admin.inventoryTable.qty')}
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {t('admin.inventoryTable.unitCost')}
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {t('admin.inventoryTable.actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const editing = editingId === item.id;
                return (
                  <tr key={item.id} className="border-b border-admin-border">
                    <td className="px-4 py-3">
                      {editing ? (
                        <Input
                          value={item.name}
                          onChange={(e) => updateEditing(item.id, 'name', e.target.value)}
                        />
                      ) : (
                        <span className="font-medium text-white">{item.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {editing ? (
                        <Input
                          value={item.sku}
                          onChange={(e) => updateEditing(item.id, 'sku', e.target.value)}
                        />
                      ) : (
                        item.sku
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {editing ? (
                        <Input
                          value={item.category}
                          onChange={(e) => updateEditing(item.id, 'category', e.target.value)}
                        />
                      ) : (
                        item.category
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          item.quantity <= item.reorder_level ? 'text-amber-400' : 'text-zinc-300'
                        }
                      >
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {editing ? (
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={item.unit_cost}
                          onChange={(e) =>
                            updateEditing(item.id, 'unit_cost', Number(e.target.value))
                          }
                        />
                      ) : (
                        `$${Number(item.unit_cost).toFixed(2)}`
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {editing ? (
                          <>
                            <Button
                              size="sm"
                              loading={loadingId === item.id}
                              onClick={() => saveEdit(item)}
                            >
                              {t('admin.inventoryTable.saveItem')}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingId(null)}
                            >
                              {t('admin.inventoryTable.cancel')}
                            </Button>
                          </>
                        ) : (
                          <>
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
                            <Button size="sm" variant="outline" onClick={() => setEditingId(item.id)}>
                              {t('admin.inventoryTable.editItem')}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              loading={loadingId === item.id}
                              onClick={() => removeItem(item.id)}
                            >
                              {t('admin.inventoryTable.deleteItem')}
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
