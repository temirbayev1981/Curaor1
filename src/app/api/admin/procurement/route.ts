import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireStaff, AuthError } from '@/lib/auth/rbac';
import { procurementService } from '@/domain/procurement/procurement.service';
import {
  createPurchaseOrderSchema,
  generateLowStockSchema,
} from '@/domain/procurement/procurement.schema';

export async function GET() {
  const requestId = randomUUID();

  try {
    const ctx = await requireStaff();
    const orders = await procurementService.list(ctx.tenantId);
    return Response.json(apiSuccess(orders, requestId));
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json(apiError(err.code, err.message, requestId), {
        status: err.code === 'FORBIDDEN' ? 403 : 401,
      });
    }
    const message = err instanceof Error ? err.message : 'Fetch failed';
    return Response.json(apiError('PROCUREMENT_ERROR', message, requestId), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID();

  try {
    const ctx = await requireStaff();
    const body = createPurchaseOrderSchema.parse(await request.json());
    const order = await procurementService.create(ctx.tenantId, body);
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
    const message = err instanceof Error ? err.message : 'Create failed';
    return Response.json(apiError('PROCUREMENT_ERROR', message, requestId), { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const requestId = randomUUID();

  try {
    const ctx = await requireStaff();
    const body = generateLowStockSchema.parse(await request.json());
    const order = await procurementService.generateFromLowStock(ctx.tenantId, body);
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
    const message = err instanceof Error ? err.message : 'Generate failed';
    return Response.json(apiError('PROCUREMENT_ERROR', message, requestId), { status: 500 });
  }
}
