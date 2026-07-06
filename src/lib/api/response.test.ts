import { describe, it, expect } from 'vitest';
import { apiSuccess, apiError } from '@/lib/api/response';

describe('ApiResponse', () => {
  it('creates success response', () => {
    const res = apiSuccess({ id: '123' }, 'req-1');
    expect(res.data).toEqual({ id: '123' });
    expect(res.error).toBeNull();
    expect(res.meta.requestId).toBe('req-1');
    expect(res.meta.timestamp).toBeDefined();
  });

  it('creates error response', () => {
    const res = apiError('NOT_FOUND', 'Resource not found');
    expect(res.data).toBeNull();
    expect(res.error?.code).toBe('NOT_FOUND');
    expect(res.error?.message).toBe('Resource not found');
  });
});
