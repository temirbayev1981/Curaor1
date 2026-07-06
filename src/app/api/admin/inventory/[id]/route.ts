import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireStaff, AuthError } from '@/lib/auth/rbac';
import { inventoryService } from '@/domain/inventory/inventory.service';

const schema = z.object({
  delta: z.number().int(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = randomUUID();
  const { id } = await params;

  try {
    const ctx = await requireStaff();
    const body = schema.parse(await request.json());
    const item = await inventoryService.adjustQuantity(ctx.tenantId, id, body.delta);
    return Response.json(apiSuccess(item, requestId));
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json(apiError(err.code, err.message, requestId), {
        status: err.code === 'FORBIDDEN' ? 403 : 401,
      });
    }
    if (err instanceof z.ZodError) {
      return Response.json(
        apiError('VALIDATION_ERROR', err.message, requestId),
        { status: 400 }
      );
    }
    const message = err instanceof Error ? err.message : 'Update failed';
    return Response.json(apiError('INVENTORY_ERROR', message, requestId), { status: 500 });
  }
}
