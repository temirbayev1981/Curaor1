import { describe, expect, it } from 'vitest';
import { GET } from '@/app/api/health/route';

describe('GET /api/health', () => {
  it('returns structured health payload', async () => {
    const response = await GET();
    const json = await response.json();

    expect(json.data).toBeTruthy();
    expect(['ok', 'degraded']).toContain(json.data.status);
    expect(json.data).toHaveProperty('supabase');
    expect(json.data).toHaveProperty('database');
    expect(json.error).toBeNull();
    expect(json.meta.requestId).toBeTruthy();
  });
});
