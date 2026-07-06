import { randomUUID } from 'crypto';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireStaff, AuthError } from '@/lib/auth/rbac';
import { staffService } from '@/domain/staff/staff.service';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = randomUUID();
  const { id } = await params;

  try {
    const ctx = await requireStaff();
    await staffService.deleteShift(ctx.tenantId, id);
    return Response.json(apiSuccess({ deleted: true }, requestId));
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json(apiError(err.code, err.message, requestId), {
        status: err.code === 'FORBIDDEN' ? 403 : 401,
      });
    }
    const message = err instanceof Error ? err.message : 'Delete failed';
    return Response.json(apiError('STAFF_ERROR', message, requestId), { status: 500 });
  }
}
