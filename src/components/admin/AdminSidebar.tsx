'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Package,
  Image,
  Sparkles,
  Settings,
  Beer,
  ScrollText,
} from 'lucide-react';
import { AdminLogoutButton } from '@/components/admin/AdminLogoutButton';
import { cn } from '@/lib/utils';
import type { Locale } from '@/lib/i18n/config';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, key: 'dashboard' },
  { href: '/admin/calendar', icon: CalendarDays, key: 'calendar' },
  { href: '/admin/bookings', icon: Calendar, key: 'bookings' },
  { href: '/admin/inventory', icon: Package, key: 'inventory' },
  { href: '/admin/media', icon: Image, key: 'media' },
  { href: '/admin/ai', icon: Sparkles, key: 'ai' },
  { href: '/admin/audit', icon: ScrollText, key: 'audit' },
  { href: '/admin/settings', icon: Settings, key: 'settings' },
] as const;

export function AdminSidebar({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <aside className="flex w-64 flex-col border-r border-admin-border bg-admin-surface">
      <div className="flex h-16 items-center gap-2 border-b border-admin-border px-6">
        <Beer className="h-6 w-6 text-emerald-400" />
        <span className="font-semibold text-white">Emerald Pour</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ href, icon: Icon, key }) => {
          const fullHref = `/${locale}${href}`;
          const active = pathname === fullHref;
          return (
            <Link
              key={key}
              href={fullHref}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
                active
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4" />
              {t(`admin.${key}`)}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-admin-border p-4">
        <AdminLogoutButton locale={locale} />
      </div>
    </aside>
  );
}
