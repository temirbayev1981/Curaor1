'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import type { Customer } from '@/types/database';

interface CustomerRow extends Customer {
  booking_count: number;
  total_spent: number;
}

export function AdminCustomersTable({ locale }: { locale: string }) {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/customers')
      .then((res) => res.json())
      .then((json: { data: CustomerRow[] | null }) => {
        setCustomers(json.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="skeleton h-48 rounded-xl" />;

  return (
    <div className="overflow-x-auto rounded-2xl border border-admin-border bg-admin-surface">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-admin-border bg-admin-bg">
          <tr>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
              {t('admin.customersTable.name')}
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
              {t('admin.customersTable.email')}
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
              {t('admin.customersTable.bookings')}
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
              {t('admin.customersTable.spent')}
            </th>
          </tr>
        </thead>
        <tbody>
          {customers.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-12 text-center text-zinc-500">
                {t('admin.customersTable.empty')}
              </td>
            </tr>
          ) : (
            customers.map((c) => (
              <tr key={c.id} className="border-b border-admin-border hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-medium text-white">{c.full_name}</td>
                <td className="px-4 py-3 text-zinc-300">{c.email}</td>
                <td className="px-4 py-3 text-zinc-300">{c.booking_count}</td>
                <td className="px-4 py-3 text-zinc-300">${c.total_spent.toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="border-t border-admin-border px-4 py-3 text-xs text-zinc-500">
        <Link href={`/${locale}/admin/bookings`} className="text-emerald-400 hover:underline">
          {t('admin.customersTable.viewBookings')}
        </Link>
      </div>
    </div>
  );
}
