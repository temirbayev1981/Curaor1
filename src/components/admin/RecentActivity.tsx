'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  CreditCard,
  FileText,
  Settings,
  UserPlus,
  ArrowRight,
  Activity,
} from 'lucide-react';
import type { AuditLog } from '@/types/database';
import type { Locale } from '@/lib/i18n/config';

const ACTION_ICONS: Record<string, typeof Activity> = {
  payment: CreditCard,
  contract: FileText,
  settings: Settings,
  register: UserPlus,
};

function getIcon(action: string): typeof Activity {
  const key = Object.keys(ACTION_ICONS).find((k) =>
    action.toLowerCase().includes(k)
  );
  return key ? ACTION_ICONS[key]! : Activity;
}

export function RecentActivity({
  logs,
  locale,
}: {
  logs: AuditLog[];
  locale: Locale;
}) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-admin-border bg-admin-surface p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-400">
          {t('admin.recentActivity')}
        </h3>
        <Link
          href={`/${locale}/admin/audit`}
          className="flex items-center gap-1 text-xs text-emerald-400 transition hover:text-emerald-300"
        >
          {t('admin.viewAll')}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      {logs.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">
          {t('admin.noActivity')}
        </p>
      ) : (
        <div className="space-y-3">
          {logs.slice(0, 6).map((log, i) => {
            const Icon = getIcon(log.action);
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 rounded-xl bg-white/[0.02] p-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Icon className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">{log.action}</p>
                  <p className="truncate text-xs text-zinc-500">
                    {log.resource_type}
                    {log.resource_id ? ` · ${log.resource_id.slice(0, 8)}` : ''}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] text-zinc-600">
                  {new Date(log.created_at).toLocaleDateString(locale, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
