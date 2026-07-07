import { randomUUID } from 'crypto';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireStaff, AuthError } from '@/lib/auth/rbac';
import { contractService } from '@/domain/contract/contract.service';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = randomUUID();
  const { id: bookingId } = await params;

  try {
    const ctx = await requireStaff();
    const contract = await contractService.getByBooking(ctx.tenantId, bookingId);

    let downloadUrl: string | null = null;
    if (contract) {
      try {
        downloadUrl = await contractService.getSignedUrl(ctx.tenantId, contract.id);
      } catch {
        downloadUrl = null;
      }
    }

    return Response.json(apiSuccess({ contract, downloadUrl }, requestId));
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
