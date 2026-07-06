import { randomUUID } from 'crypto';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireStaff, AuthError } from '@/lib/auth/rbac';
import { profitService } from '@/domain/profit/profit.service';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = randomUUID();
  const { id: bookingId } = await params;

  try {
    const ctx = await requireStaff();
    const profitability = await profitService.getEventProfitability(
      ctx.tenantId,
      bookingId
    );
    return Response.json(apiSuccess(profitability, requestId));
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json(apiError(err.code, err.message, requestId), {
        status: err.code === 'FORBIDDEN' ? 403 : 401,
      });
    }
    const message = err instanceof Error ? err.message : 'Calculation failed';
    return Response.json(apiError('PROFIT_ERROR', message, requestId), { status: 500 });
  }
}
