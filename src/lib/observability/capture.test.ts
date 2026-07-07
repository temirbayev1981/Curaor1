import { describe, expect, it } from 'vitest';
import { captureError } from '@/lib/observability/capture';

describe('captureError', () => {
  it('does not throw when reporting an error', () => {
    expect(() => captureError(new Error('test'))).not.toThrow();
  });

  it('handles non-Error values', () => {
    expect(() => captureError('something broke')).not.toThrow();
  });
});
