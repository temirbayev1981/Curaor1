import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { apiSuccess, apiError } from '@/lib/api/response';
import { getMonthAvailability } from '@/lib/booking/availability.service';

const schema = z.object({
  tenantId: z.string().uuid(),
  month: z.string().regex(/^\d{4}-\d{2}$/),
});

export async function GET(request: NextRequest) {
  const requestId = randomUUID();
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = schema.safeParse(params);

  if (!parsed.success) {
    return Response.json(
      apiError('VALIDATION_ERROR', parsed.error.message, requestId),
      { status: 400 }
    );
  }

  try {
    const days = await getMonthAvailability(parsed.data.tenantId, parsed.data.month);
    return Response.json(apiSuccess({ days }, requestId));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Availability check failed';
    return Response.json(apiError('AVAILABILITY_ERROR', message, requestId), { status: 500 });
  }
}
