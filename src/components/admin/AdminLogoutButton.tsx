'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Locale } from '@/lib/i18n/config';

export function AdminLogoutButton({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${locale}/admin/login`);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
    >
      <LogOut className="h-4 w-4" />
      {t('admin.logout')}
    </button>
  );
}
