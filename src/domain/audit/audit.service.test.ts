import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockInsert = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

describe('AuditService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ insert: mockInsert });
  });

  it('writes audit log entry', async () => {
    const { auditService } = await import('@/domain/audit/audit.service');
    await auditService.log({
      tenantId: 't1',
      actorId: 'u1',
      action: 'tenant.settings_updated',
      resourceType: 'tenant',
      resourceId: 't1',
      details: { field: 'pricing' },
      ipAddress: '127.0.0.1',
    });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        tenant_id: 't1',
        action: 'tenant.settings_updated',
      })
    );
  });
});
