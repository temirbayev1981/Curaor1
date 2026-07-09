import { headers } from 'next/headers';
import { buildServicesPricing, getDefaultServicesPricing, buildPackagePricing, getDefaultPackagePricing, type PackagePricing, type ServicesPricing } from '@/lib/booking/service-pricing';
import { getPublicTenantId } from '@/lib/tenant/public-tenant.server';
import { tenantService } from '@/domain/tenant/tenant.service';

export async function getPublicServicesPricing(): Promise<ServicesPricing> {
  try {
    const hostname = (await headers()).get('host') ?? '';
    const tenantId = await getPublicTenantId(hostname);
    const settings = await tenantService.getResolvedSettings(tenantId);
    return buildServicesPricing(settings);
  } catch {
    return getDefaultServicesPricing();
  }
}

export async function getPublicPackagePricing(): Promise<PackagePricing> {
  try {
    const hostname = (await headers()).get('host') ?? '';
    const tenantId = await getPublicTenantId(hostname);
    const settings = await tenantService.getResolvedSettings(tenantId);
    return buildPackagePricing(settings);
  } catch {
    return getDefaultPackagePricing();
  }
}
