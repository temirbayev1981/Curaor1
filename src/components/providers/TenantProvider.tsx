'use client';

import { createContext, useContext } from 'react';
import { DEFAULT_TENANT_ID } from '@/lib/tenant/constants';

const TenantContext = createContext<{ tenantId: string; tenantSlug: string }>({
  tenantId: DEFAULT_TENANT_ID,
  tenantSlug: 'emerald-pour',
});

export function TenantProvider({
  tenantId,
  tenantSlug,
  children,
}: {
  tenantId: string;
  tenantSlug: string;
  children: React.ReactNode;
}) {
  return (
    <TenantContext.Provider value={{ tenantId, tenantSlug }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
}

export function useTenantId(): string {
  return useContext(TenantContext).tenantId;
}
