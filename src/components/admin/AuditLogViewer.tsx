'use client';

import { useEffect, useState } from 'react';
import type { AuditLog } from '@/types/database';

export function AuditLogViewer() {
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
    <div className="overflow-hidden rounded-xl border border-admin-border">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-admin-border bg-admin-bg">
          <tr>
            <th className="px-4 py-3 text-zinc-400">Time</th>
            <th className="px-4 py-3 text-zinc-400">Action</th>
            <th className="px-4 py-3 text-zinc-400">Resource</th>
            <th className="px-4 py-3 text-zinc-400">Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                No audit logs yet
              </td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr key={log.id} className="border-b border-admin-border">
                <td className="px-4 py-3 text-zinc-400">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-white">{log.action}</td>
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
