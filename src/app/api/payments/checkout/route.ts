import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { apiSuccess, apiError } from '@/lib/api/response';
import { paymentService } from '@/domain/payment/payment.service';
import { createClient } from '@/lib/supabase/server';

const checkoutSchema = z.object({
  tenantId: z.string().uuid(),
  bookingId: z.string().uuid(),
  paymentType: z.enum(['deposit', 'balance', 'full']),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export async function POST(request: NextRequest) {
  const requestId = randomUUID();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(apiError('UNAUTHORIZED', 'Authentication required', requestId), {
      status: 401,
    });
  }

  try {
    const body: unknown = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        apiError('VALIDATION_ERROR', parsed.error.message, requestId),
        { status: 400 }
      );
    }

    const session = await paymentService.createCheckoutSession(
      parsed.data.tenantId,
      parsed.data.bookingId,
      parsed.data.paymentType,
      parsed.data.successUrl,
      parsed.data.cancelUrl
    );

    return Response.json(apiSuccess(session, requestId));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Payment error';
    return Response.json(apiError('PAYMENT_ERROR', message, requestId), { status: 500 });
  }
}
