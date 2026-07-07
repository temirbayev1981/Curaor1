import { randomUUID } from 'crypto';
import { apiSuccess, apiError } from '@/lib/api/response';
import { tenantService } from '@/domain/tenant/tenant.service';
import { isSupabaseConfigured } from '@/lib/config/env';
import { DEFAULT_TENANT_SLUG } from '@/lib/tenant/constants';

const FALLBACK_TENANTS = [
  { slug: DEFAULT_TENANT_SLUG, name: 'The Emerald Pour' },
  { slug: 'shamrock-mobile', name: 'Shamrock Mobile Bar' },
];

export async function GET() {
  const requestId = randomUUID();

  try {
    if (!isSupabaseConfigured()) {
      return Response.json(apiSuccess(FALLBACK_TENANTS, requestId));
    }

    const tenants = await tenantService.listPublic();
    return Response.json(apiSuccess(tenants.length ? tenants : FALLBACK_TENANTS, requestId));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load tenants';
    return Response.json(apiError('TENANT_ERROR', message, requestId), { status: 500 });
  }
}
