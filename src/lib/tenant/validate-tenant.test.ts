import { describe, it, expect } from 'vitest';
import { assertPublicTenantId } from './validate-tenant';
import { DEFAULT_TENANT_ID } from '@/lib/tenant/constants';

describe('assertPublicTenantId', () => {
  it('accepts default tenant', () => {
    expect(() => assertPublicTenantId(DEFAULT_TENANT_ID)).not.toThrow();
  });

  it('rejects unknown tenant', () => {
    expect(() =>
      assertPublicTenantId('b0000000-0000-4000-8000-000000000002')
    ).toThrow('Invalid tenant');
  });
});
