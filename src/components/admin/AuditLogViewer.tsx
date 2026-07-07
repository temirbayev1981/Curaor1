'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AuditLog } from '@/types/database';

export function AuditLogViewer() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/audit')
      .then((res) => res.json())
      .then((json: { data: AuditLog[] | null }) => {
        setLogs(json.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="skeleton h-48 rounded-xl" />;

  return (
    <div className="overflow-x-auto rounded-2xl border border-admin-border bg-admin-surface">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-admin-border bg-admin-bg">
          <tr>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
              {t('admin.auditTable.time')}
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
              {t('admin.auditTable.action')}
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
              {t('admin.auditTable.resource')}
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
              {t('admin.auditTable.details')}
            </th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-12 text-center text-zinc-500">
                {t('admin.auditTable.empty')}
              </td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr
                key={log.id}
                className="border-b border-admin-border transition hover:bg-white/[0.02]"
              >
                <td className="px-4 py-3 text-zinc-400">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 font-medium text-white">{log.action}</td>
                <td className="px-4 py-3 text-zinc-300">
                  {log.resource_type}
                  {log.resource_id ? ` #${log.resource_id.slice(0, 8)}` : ''}
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-zinc-500">
                  {JSON.stringify(log.details)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
