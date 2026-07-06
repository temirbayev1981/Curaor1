import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireStaff, AuthError } from '@/lib/auth/rbac';
import { staffService } from '@/domain/staff/staff.service';
import { createStaffMemberSchema } from '@/domain/staff/staff.schema';

export async function GET(request: NextRequest) {
  const requestId = randomUUID();

  try {
    const ctx = await requireStaff();
    const members = await staffService.listMembers(ctx.tenantId);
    return Response.json(apiSuccess(members, requestId));
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json(apiError(err.code, err.message, requestId), {
        status: err.code === 'FORBIDDEN' ? 403 : 401,
      });
    }
    const message = err instanceof Error ? err.message : 'Fetch failed';
    return Response.json(apiError('STAFF_ERROR', message, requestId), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID();

  try {
    const ctx = await requireStaff();
    const body = createStaffMemberSchema.parse(await request.json());
    const member = await staffService.createMember(ctx.tenantId, body);
    return Response.json(apiSuccess(member, requestId));
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
    return Response.json(apiError('STAFF_ERROR', message, requestId), { status: 500 });
  }
}
