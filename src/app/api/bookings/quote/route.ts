import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { apiSuccess, apiError } from '@/lib/api/response';
import { buildBookingQuote } from '@/lib/booking/quote.service';
import { checkQuoteRateLimit } from '@/lib/api/rate-limit';
import { assertPublicTenantId } from '@/lib/tenant/validate-tenant';

const quoteSchema = z.object({
  tenantId: z.string().uuid(),
  guestCount: z.coerce.number().int().positive().max(500),
  depositPercent: z.coerce.number().pipe(z.union([z.literal(25), z.literal(50), z.literal(100)])).optional(),
  packageTier: z.enum(['shamrock', 'emerald', 'legend']).optional(),
  venueAddress: z.string().max(500).optional(),
  venueCity: z.string().max(100).optional(),
  venueState: z.string().length(2).optional(),
  deliveryDistanceMiles: z.coerce.number().nonnegative().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  bookingStart: z.string().datetime().optional(),
  bookingEnd: z.string().datetime().optional(),
});

export async function GET(request: NextRequest) {
  const requestId = randomUUID();
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  const allowed = await checkQuoteRateLimit(ip);
  if (!allowed) {
    return Response.json(
      apiError('RATE_LIMITED', 'Too many quote requests', requestId),
      { status: 429 }
    );
  }

  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = quoteSchema.safeParse(params);

  if (!parsed.success) {
    return Response.json(
      apiError('VALIDATION_ERROR', parsed.error.message, requestId),
      { status: 400 }
    );
  }

  try {
    assertPublicTenantId(parsed.data.tenantId);
    const quote = await buildBookingQuote(parsed.data);
    return Response.json(apiSuccess(quote, requestId));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Quote failed';
    return Response.json(apiError('QUOTE_ERROR', message, requestId), { status: 500 });
  }
}
