import { createAdminClient } from '@/lib/supabase/admin';
import { AuthError } from '@/lib/auth/rbac';

export async function verifyBookingOwnership(
  tenantId: string,
  userId: string,
  bookingId: string
): Promise<void> {
  const admin = createAdminClient();

  const { data: customer } = await admin
    .from('customers')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!customer) {
    throw new AuthError('FORBIDDEN', 'Customer profile not found');
  }

  const { data: booking } = await admin
    .from('bookings')
    .select('customer_id')
    .eq('id', bookingId)
    .eq('tenant_id', tenantId)
    .maybeSingle();

  if (!booking) {
    throw new AuthError('NOT_FOUND', 'Booking not found');
  }

  if ((booking as { customer_id: string }).customer_id !== (customer as { id: string }).id) {
    throw new AuthError('FORBIDDEN', 'Access denied to this booking');
  }
}

export async function getCustomerIdForUser(
  tenantId: string,
  userId: string
): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('customers')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('user_id', userId)
    .maybeSingle();

  return (data as { id: string } | null)?.id ?? null;
}
