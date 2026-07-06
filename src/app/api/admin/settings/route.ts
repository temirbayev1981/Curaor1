import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireStaff, AuthError } from '@/lib/auth/rbac';
import { tenantService } from '@/domain/tenant/tenant.service';
import { updateSettingsSchema } from '@/domain/tenant/tenant.schema';
import { auditService } from '@/domain/audit/audit.service';

const patchSchema = updateSettingsSchema.extend({
  tenantId: z.string().uuid().optional(),
});

export async function GET() {
  const requestId = randomUUID();

  try {
    const ctx = await requireStaff();
    const settings = await tenantService.getResolvedSettings(ctx.tenantId);
    return Response.json(apiSuccess(settings, requestId));
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json(apiError(err.code, err.message, requestId), {
        status: err.code === 'FORBIDDEN' ? 403 : 401,
      });
    }
    return Response.json(apiError('FETCH_ERROR', 'Failed to load settings', requestId), {
      status: 500,
    });
  }
}

export async function PATCH(request: NextRequest) {
  const requestId = randomUUID();
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

  try {
    const ctx = await requireStaff();
    const body: unknown = await request.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        apiError('VALIDATION_ERROR', parsed.error.message, requestId),
        { status: 400 }
      );
    }

    await tenantService.updateSettings(ctx.tenantId, parsed.data);

    await auditService.log({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: 'tenant.settings_updated',
      resourceType: 'tenant',
      resourceId: ctx.tenantId,
      details: {
        settings: parsed.data.settings,
        admin_overrides: parsed.data.admin_overrides,
      },
      ipAddress: ip,
    });

    const settings = await tenantService.getResolvedSettings(ctx.tenantId);
    return Response.json(apiSuccess(settings, requestId));
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json(apiError(err.code, err.message, requestId), {
        status: err.code === 'FORBIDDEN' ? 403 : 401,
      });
    }
    const message = err instanceof Error ? err.message : 'Update failed';
    return Response.json(apiError('UPDATE_ERROR', message, requestId), { status: 500 });
  }
}
