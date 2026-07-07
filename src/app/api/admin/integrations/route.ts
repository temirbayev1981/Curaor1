import { randomUUID } from 'crypto';
import { apiSuccess, apiError } from '@/lib/api/response';
import { requireStaff, AuthError } from '@/lib/auth/rbac';
import {
  isMapboxConfigured,
  isOpenAiConfigured,
  isStripeConfigured,
} from '@/lib/config/env';

export async function GET() {
  const requestId = randomUUID();

  try {
    await requireStaff();

    return Response.json(
      apiSuccess(
        {
          mapbox: isMapboxConfigured(),
          openai: isOpenAiConfigured(),
          stripe: isStripeConfigured(),
        },
        requestId
      )
    );
  } catch (err) {
    if (err instanceof AuthError) {
      return Response.json(apiError(err.code, err.message, requestId), {
        status: err.code === 'FORBIDDEN' ? 403 : 401,
      });
    }
    const message = err instanceof Error ? err.message : 'Failed to load integrations';
    return Response.json(apiError('INTEGRATIONS_ERROR', message, requestId), { status: 500 });
  }
}
