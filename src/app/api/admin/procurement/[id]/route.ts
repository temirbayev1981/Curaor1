import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireStaff, AuthError } from '@/lib/auth/rbac';
import { procurementService } from '@/domain/procurement/procurement.service';
import { updatePurchaseOrderSchema } from '@/domain/procurement/procurement.schema';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = randomUUID();
  const { id } = await params;

  try {
    const ctx = await requireStaff();
    const body = updatePurchaseOrderSchema.parse(await request.json());
    const order = await procurementService.update(ctx.tenantId, id, body);
    return Response.json(apiSuccess(order, requestId));
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json(apiError(err.code, err.message, requestId), {
        status: err.code === 'FORBIDDEN' ? 403 : 401,
      });
    }
    if (err instanceof z.ZodError) {
      return Response.json(apiError('VALIDATION_ERROR', err.message, requestId), {
        status: 400,
      });
    }
    const message = err instanceof Error ? err.message : 'Update failed';
    return Response.json(apiError('PROCUREMENT_ERROR', message, requestId), { status: 500 });
  }
}
