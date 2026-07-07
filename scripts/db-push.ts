#!/usr/bin/env npx tsx
/**
 * Apply all Supabase SQL migrations in order.
 *
 * Usage:
 *   1. Supabase Dashboard → Settings → Database → Connection string (URI)
 *   2. Add to .env.local: SUPABASE_DB_URL=postgresql://postgres.[ref]:[PASSWORD]@...
 *   3. npm run db:push
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import pg from 'pg';

const { Client } = pg;

const MIGRATIONS_DIR = join(process.cwd(), 'supabase/migrations');

async function main() {
  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    console.error(`
Missing SUPABASE_DB_URL in environment.

Get it from Supabase Dashboard:
  Settings → Database → Connection string → URI (Session pooler)

Add to .env.local:
  SUPABASE_DB_URL=postgresql://postgres.erdbighafvvboimxmweh:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres

Then run: npm run db:push
`);
    process.exit(1);
  }

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log(`Connected. Applying ${files.length} migration(s)...`);

  for (const file of files) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
    console.log(`→ ${file}`);
    try {
      await client.query(sql);
      console.log(`  ✓ OK`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('already exists')) {
        console.log(`  ⚠ Skipped (already exists)`);
      } else {
        console.error(`  ✗ Failed: ${message}`);
        await client.end();
        process.exit(1);
      }
    }
  }

  const seedPath = join(process.cwd(), 'supabase/seed.sql');
  const seed = readFileSync(seedPath, 'utf8');
  console.log('→ seed.sql');
  try {
    await client.query(seed);
    console.log('  ✓ OK');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`  ⚠ Seed: ${message}`);
  }

  const checks = ['tenants', 'bookings', 'staff_members', 'purchase_orders'];
  for (const table of checks) {
    const res = await client.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = $1
      ) AS exists`,
      [table]
    );
    const exists = (res.rows[0] as { exists: boolean }).exists;
    console.log(`  ${exists ? '✓' : '✗'} table ${table}`);
  }

  await client.end();
  console.log('\nDone! Restart the app and test /en/admin/staff');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
