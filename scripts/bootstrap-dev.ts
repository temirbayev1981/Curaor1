#!/usr/bin/env npx tsx
/**
 * Bootstrap development users for The Emerald Pour.
 *
 * Usage:
 *   cp .env.example .env.local  # fill Supabase keys
 *   npx tsx scripts/bootstrap-dev.ts
 *
 * Creates:
 *   - admin@emeraldpour.com (owner) — Admin / 12345678, must change password on first login
 *   - owner@emeraldpour.com (owner) — legacy dev owner
 *   - customer@example.com (customer) — portal access, linked to seed booking
 */

import { createClient } from '@supabase/supabase-js';
import {
  getDefaultTenantId,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from '../src/lib/config/env';
import { ADMIN_EMAIL } from '../src/lib/auth/admin-auth';

const DEV_PASSWORD = 'DevPassword123!';
const ADMIN_PASSWORD = '12345678';

const USERS = [
  {
    email: ADMIN_EMAIL,
    role: 'owner' as const,
    fullName: 'Admin',
    phone: '+17045550199',
    password: ADMIN_PASSWORD,
    userMetadata: { must_change_password: true },
  },
  {
    email: 'owner@emeraldpour.com',
    role: 'owner' as const,
    fullName: 'Dev Owner',
    phone: '+17045550100',
    password: DEV_PASSWORD,
    userMetadata: { must_change_password: false },
  },
  {
    email: 'customer@example.com',
    role: 'customer' as const,
    fullName: 'Sarah Mitchell',
    phone: '+17045550101',
    password: DEV_PASSWORD,
    userMetadata: { must_change_password: false },
  },
];

async function main() {
  const url = getSupabaseUrl();
  const serviceKey = getSupabaseServiceRoleKey();
  const tenantId = getDefaultTenantId();

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log('Bootstrapping dev users...\n');

  for (const user of USERS) {
    const { data: existing } = await supabase.auth.admin.listUsers();
    const found = existing?.users.find((u) => u.email === user.email);

    let userId: string;

    if (found) {
      userId = found.id;
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        {
          password: user.password,
          user_metadata: {
            ...found.user_metadata,
            full_name: user.fullName,
            phone: user.phone,
            ...user.userMetadata,
          },
        }
      );
      if (updateError) {
        console.error(`  ✗ Failed to update ${user.email}:`, updateError.message);
        continue;
      }
      console.log(`  ✓ ${user.email} updated (${userId})`);
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.fullName,
          phone: user.phone,
          ...user.userMetadata,
        },
      });

      if (error || !data.user) {
        console.error(`  ✗ Failed to create ${user.email}:`, error?.message);
        continue;
      }
      userId = data.user.id;
      console.log(`  ✓ Created ${user.email} (${userId})`);
    }

    await supabase.from('tenant_users').upsert(
      { tenant_id: tenantId, user_id: userId, role: user.role },
      { onConflict: 'tenant_id,user_id' }
    );

    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('email', user.email)
      .maybeSingle();

    if (customer) {
      await supabase
        .from('customers')
        .update({ user_id: userId, full_name: user.fullName, phone: user.phone })
        .eq('id', customer.id);
    } else if (user.role === 'customer') {
      await supabase.from('customers').insert({
        tenant_id: tenantId,
        user_id: userId,
        email: user.email,
        full_name: user.fullName,
        phone: user.phone,
      });
    }

    console.log(`  ✓ Role: ${user.role}, tenant linked`);
  }

  console.log('\n─────────────────────────────────────────');
  console.log('Admin panel:');
  console.log('  Username: Admin');
  console.log(`  Password: ${ADMIN_PASSWORD} (change on first login)`);
  console.log('  URL:      /en/admin/login');
  console.log('\nOther dev accounts (password: DevPassword123!):');
  console.log('  owner@emeraldpour.com  → /en/admin');
  console.log('  customer@example.com   → /en/portal');
  console.log('─────────────────────────────────────────\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
