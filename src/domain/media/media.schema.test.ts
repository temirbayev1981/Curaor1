import { describe, expect, it } from 'vitest';
import { z } from 'zod';

const bulkTagSchema = z.object({
  assetIds: z.array(z.string().uuid()).min(1).max(100),
  tag: z.string().min(1).max(50),
  action: z.enum(['add', 'remove']).default('add'),
});

describe('media bulk-tag schema', () => {
  it('accepts valid bulk tag payload', () => {
    const result = bulkTagSchema.safeParse({
      assetIds: ['a0000000-0000-4000-8000-000000000001'],
      tag: 'gallery',
      action: 'add',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty asset list', () => {
    const result = bulkTagSchema.safeParse({
      assetIds: [],
      tag: 'gallery',
    });
    expect(result.success).toBe(false);
  });
});
