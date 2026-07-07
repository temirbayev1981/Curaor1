import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFrom = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockFrom,
    storage: {
      from: vi.fn().mockReturnValue({
        createSignedUrl: vi.fn().mockResolvedValue({
          data: { signedUrl: 'https://signed.example/media.jpg' },
          error: null,
        }),
      }),
    },
  }),
}));

describe('MediaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists folders for tenant', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [{ id: 'f1', tenant_id: 't1', name: 'Events', parent_id: null, created_at: '' }],
            error: null,
          }),
        }),
      }),
    });

    const { mediaService } = await import('@/domain/media/media.service');
    const folders = await mediaService.listFolders('t1');
    expect(folders).toHaveLength(1);
    expect(folders[0]?.name).toBe('Events');
  });

  it('creates signed url for storage path', async () => {
    const { mediaService } = await import('@/domain/media/media.service');
    const url = await mediaService.getSignedUrl('t1/photo.jpg');
    expect(url).toContain('https://');
  });
});
