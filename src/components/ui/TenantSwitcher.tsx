'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTenant } from '@/components/providers/TenantProvider';
import type { Locale } from '@/lib/i18n/config';

interface PublicTenant {
  slug: string;
  name: string;
}

export function TenantSwitcher() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { tenantSlug } = useTenant();
  const [tenants, setTenants] = useState<PublicTenant[]>([]);

  const locale = (pathname.split('/')[1] ?? 'en') as Locale;

  useEffect(() => {
    fetch('/api/tenants')
      .then((res) => res.json())
      .then((json: { data: PublicTenant[] | null }) => {
        setTenants(json.data ?? []);
      })
      .catch(() => {
        setTenants([]);
      });
  }, []);

  if (tenants.length < 2) return null;

  function switchTenant(newSlug: string) {
    const params = new URLSearchParams(window.location.search);
    params.set('tenant', newSlug);
    const query = params.toString();
    const basePath = pathname || `/${locale}`;
    window.location.href = query ? `${basePath}?${query}` : basePath;
  }

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-emerald-400" aria-hidden />
      <label htmlFor="tenant-select" className="sr-only">
        {t('tenant.switch')}
      </label>
      <select
        id="tenant-select"
        value={tenantSlug}
        onChange={(e) => switchTenant(e.target.value)}
        className="max-w-[9rem] rounded-md border border-white/10 bg-white/5 px-2 py-1 text-sm text-white backdrop-blur-sm"
      >
        {tenants.map((tenant) => (
          <option key={tenant.slug} value={tenant.slug} className="bg-gray-900">
            {tenant.name}
          </option>
        ))}
      </select>
    </div>
  );
}
