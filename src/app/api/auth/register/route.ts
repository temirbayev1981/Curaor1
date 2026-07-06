import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { apiSuccess, apiError } from '@/lib/api/response';
import { createAdminClient } from '@/lib/supabase/admin';
import { linkCustomerToUser } from '@/lib/auth/rbac';
import { auditService } from '@/domain/audit/audit.service';

const registerSchema = z.object({
  tenantId: z.string().uuid(),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  fullName: z.string().min(1).max(200),
  phone: z.string().max(20).optional(),
});

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

  try {
    const body: unknown = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        apiError('VALIDATION_ERROR', parsed.error.message, requestId),
        { status: 400 }
      );
    }

    const { tenantId, email, password, fullName, phone } = parsed.data;
    const admin = createAdminClient();

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, phone },
    });

    if (authError || !authData.user) {
      return Response.json(
        apiError('AUTH_ERROR', authError?.message ?? 'Registration failed', requestId),
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    await admin.from('tenant_users').insert({
      tenant_id: tenantId,
      user_id: userId,
      role: 'customer',
    });

    await linkCustomerToUser(tenantId, userId, email);

    await auditService.log({
      tenantId,
      actorId: userId,
      action: 'user.registered',
      resourceType: 'user',
      resourceId: userId,
      details: { email, fullName },
      ipAddress: ip,
    });

    return Response.json(
      apiSuccess({ userId, email }, requestId),
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    return Response.json(apiError('REGISTER_ERROR', message, requestId), { status: 500 });
  }
}
