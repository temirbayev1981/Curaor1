import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireStaff, AuthError } from '@/lib/auth/rbac';
import { customerService } from '@/domain/customer/customer.service';

export async function GET(_request: NextRequest) {
  const requestId = randomUUID();

  try {
    const ctx = await requireStaff();
    const customers = await customerService.listWithStats(ctx.tenantId);
    return Response.json(apiSuccess(customers, requestId));
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json(apiError(err.code, err.message, requestId), {
        status: err.code === 'FORBIDDEN' ? 403 : 401,
      });
    }
    const message = err instanceof Error ? err.message : 'Fetch failed';
    return Response.json(apiError('FETCH_ERROR', message, requestId), { status: 500 });
  }
}
