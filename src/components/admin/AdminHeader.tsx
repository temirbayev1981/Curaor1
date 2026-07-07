'use client';

import { useTranslation } from 'react-i18next';
import { Beer, Menu } from 'lucide-react';

export function AdminHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const { t } = useTranslation();
  const now = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="flex h-16 items-center justify-between border-b border-admin-border bg-admin-bg/80 px-4 backdrop-blur-xl sm:px-8">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white lg:hidden"
            aria-label={t('admin.openMenu')}
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
          <Beer className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-white">
            {t('admin.panelTitle')}
          </h1>
          <p className="text-[10px] text-zinc-500">
            {t('admin.lastUpdated')}: {now}
          </p>
        </div>
      </div>
    </header>
  );
}
