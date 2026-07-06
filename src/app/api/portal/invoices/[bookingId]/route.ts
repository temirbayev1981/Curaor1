import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { apiError } from '@/lib/api/response';
import { invoiceService } from '@/domain/invoice/invoice.service';
import { getAuthContext, AuthError } from '@/lib/auth/rbac';
import { verifyBookingOwnership } from '@/lib/auth/ownership';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const requestId = randomUUID();
  const { bookingId } = await params;

  try {
    const ctx = await getAuthContext();
    if (!ctx) {
      return Response.json(apiError('UNAUTHORIZED', 'Authentication required', requestId), {
        status: 401,
      });
    }

    await verifyBookingOwnership(ctx.tenantId, ctx.userId, bookingId);

    const invoice = await invoiceService.generate(ctx.tenantId, bookingId);
    const html = invoiceService.renderHtml(invoice);

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${invoice.invoiceNumber}.html"`,
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      const status = err.code === 'NOT_FOUND' ? 404 : err.code === 'FORBIDDEN' ? 403 : 401;
      return Response.json(apiError(err.code, err.message, requestId), { status });
    }
    const message = err instanceof Error ? err.message : 'Invoice generation failed';
    return Response.json(apiError('INVOICE_ERROR', message, requestId), { status: 500 });
  }
}
