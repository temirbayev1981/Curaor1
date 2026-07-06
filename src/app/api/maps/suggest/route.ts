import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { apiSuccess, apiError } from '@/lib/api/response';
import { suggestAddresses } from '@/domain/maps/geocode.service';
import { isMapboxConfigured } from '@/lib/config/env';

const schema = z.object({
  q: z.string().min(1).max(200),
});

export async function GET(request: NextRequest) {
  const requestId = randomUUID();
  const q = request.nextUrl.searchParams.get('q') ?? '';
  const parsed = schema.safeParse({ q });

  if (!parsed.success) {
    return Response.json(
      apiError('VALIDATION_ERROR', parsed.error.message, requestId),
      { status: 400 }
    );
  }

  if (!isMapboxConfigured()) {
    return Response.json(apiSuccess({ suggestions: [] }, requestId));
  }

  try {
    const suggestions = await suggestAddresses(parsed.data.q);
    return Response.json(apiSuccess({ suggestions }, requestId));
  } catch {
    return Response.json(apiSuccess({ suggestions: [] }, requestId));
  }
}
