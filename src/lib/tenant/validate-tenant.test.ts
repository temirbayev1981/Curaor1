import { describe, it, expect, vi, afterEach } from 'vitest';
import { assertPublicTenantId } from './validate-tenant';
import { DEFAULT_TENANT_ID } from '@/lib/tenant/constants';
import * as env from '@/lib/config/env';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('assertPublicTenantId', () => {
  it('accepts default tenant', () => {
    expect(() => assertPublicTenantId(DEFAULT_TENANT_ID)).not.toThrow();
  });

  it('rejects unknown tenant when supabase is not configured', () => {
    vi.spyOn(env, 'isSupabaseConfigured').mockReturnValue(false);
    expect(() =>
      assertPublicTenantId('b0000000-0000-4000-8000-000000000002')
    ).toThrow('Invalid tenant');
  });

  it('rejects malformed tenant id', () => {
    expect(() => assertPublicTenantId('not-a-uuid')).toThrow('Invalid tenant');
  });

  it('accepts valid uuid when supabase is configured', () => {
    vi.spyOn(env, 'isSupabaseConfigured').mockReturnValue(true);
    expect(() =>
      assertPublicTenantId('b0000000-0000-4000-8000-000000000002')
    ).not.toThrow();
  });
});
