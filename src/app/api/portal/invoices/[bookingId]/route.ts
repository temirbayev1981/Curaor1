import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { apiError } from '@/lib/api/response';
import { invoiceService } from '@/domain/invoice/invoice.service';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const requestId = randomUUID();
  const { bookingId } = await params;
  const tenantId = request.nextUrl.searchParams.get('tenantId');

  if (!tenantId) {
    return Response.json(apiError('VALIDATION_ERROR', 'tenantId required', requestId), {
      status: 400,
    });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(apiError('UNAUTHORIZED', 'Authentication required', requestId), {
      status: 401,
    });
  }

  try {
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('user_id', user.id)
      .single();

    if (!customer) {
      return Response.json(apiError('FORBIDDEN', 'Access denied', requestId), { status: 403 });
    }

    const { data: booking } = await supabase
      .from('bookings')
      .select('customer_id')
      .eq('id', bookingId)
      .eq('tenant_id', tenantId)
      .single();

    if (!booking || (booking as { customer_id: string }).customer_id !== (customer as { id: string }).id) {
      return Response.json(apiError('FORBIDDEN', 'Booking not found', requestId), { status: 403 });
    }

    const invoice = await invoiceService.generate(tenantId, bookingId);
    const html = invoiceService.renderHtml(invoice);

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${invoice.invoiceNumber}.html"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invoice generation failed';
    return Response.json(apiError('INVOICE_ERROR', message, requestId), { status: 500 });
  }
}
