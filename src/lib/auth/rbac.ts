import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { UserRole } from '@/types/database';

export interface AuthContext {
  userId: string;
  email: string;
  tenantId: string;
  role: UserRole;
}

const STAFF_ROLES: UserRole[] = ['owner', 'admin', 'staff'];

export function isStaffRole(role: UserRole): boolean {
  return STAFF_ROLES.includes(role);
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = createAdminClient();
  const { data: membership } = await admin
    .from('tenant_users')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) return null;

  return {
    userId: user.id,
    email: user.email ?? '',
    tenantId: (membership as { tenant_id: string }).tenant_id,
    role: (membership as { role: UserRole }).role,
  };
}

export async function requireAuth(): Promise<AuthContext> {
  const ctx = await getAuthContext();
  if (!ctx) throw new AuthError('UNAUTHORIZED', 'Authentication required');
  return ctx;
}

export async function requireStaff(): Promise<AuthContext> {
  const ctx = await requireAuth();
  if (!isStaffRole(ctx.role)) {
    throw new AuthError('FORBIDDEN', 'Staff access required');
  }
  return ctx;
}

export async function requireRole(roles: UserRole[]): Promise<AuthContext> {
  const ctx = await requireAuth();
  if (!roles.includes(ctx.role)) {
    throw new AuthError('FORBIDDEN', 'Insufficient permissions');
  }
  return ctx;
}

export class AuthError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function linkCustomerToUser(
  tenantId: string,
  userId: string,
  email: string
): Promise<void> {
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from('customers')
    .select('id, user_id')
    .eq('tenant_id', tenantId)
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    if (!(existing as { user_id: string | null }).user_id) {
      await admin
        .from('customers')
        .update({ user_id: userId })
        .eq('id', (existing as { id: string }).id);
    }
    return;
  }

  const { data: { user } } = await admin.auth.admin.getUserById(userId);
  const meta = user?.user_metadata as Record<string, string> | undefined;

  await admin.from('customers').insert({
    tenant_id: tenantId,
    user_id: userId,
    email,
    full_name: meta?.full_name ?? email.split('@')[0] ?? 'Customer',
    phone: meta?.phone ?? null,
  });
}
