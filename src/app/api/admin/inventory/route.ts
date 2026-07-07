import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireStaff, AuthError } from '@/lib/auth/rbac';
import { inventoryService } from '@/domain/inventory/inventory.service';
import { createInventoryItemSchema } from '@/domain/inventory/inventory.schema';

export async function POST(request: NextRequest) {
  const requestId = randomUUID();

  try {
    const ctx = await requireStaff();
    const parsed = createInventoryItemSchema.safeParse(await request.json());

    if (!parsed.success) {
      return Response.json(
        apiError('VALIDATION_ERROR', parsed.error.message, requestId),
        { status: 400 }
      );
    }

    const item = await inventoryService.create(ctx.tenantId, parsed.data);
    return Response.json(apiSuccess(item, requestId), { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json(apiError(err.code, err.message, requestId), {
        status: err.code === 'FORBIDDEN' ? 403 : 401,
      });
    }
    const message = err instanceof Error ? err.message : 'Create failed';
    return Response.json(apiError('INVENTORY_ERROR', message, requestId), { status: 500 });
  }
}
