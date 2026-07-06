import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { apiSuccess, apiError } from '@/lib/api/response';
import { getAuthContext, linkCustomerToUser } from '@/lib/auth/rbac';
import { auditService } from '@/domain/audit/audit.service';

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

  const ctx = await getAuthContext();
  if (!ctx) {
    return Response.json(apiError('UNAUTHORIZED', 'Authentication required', requestId), {
      status: 401,
    });
  }

  try {
    await linkCustomerToUser(ctx.tenantId, ctx.userId, ctx.email);

    await auditService.log({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: 'customer.linked',
      resourceType: 'customer',
      resourceId: ctx.userId,
      details: { email: ctx.email },
      ipAddress: ip,
    });

    return Response.json(apiSuccess({ linked: true }, requestId));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Link failed';
    return Response.json(apiError('LINK_ERROR', message, requestId), { status: 500 });
  }
}
