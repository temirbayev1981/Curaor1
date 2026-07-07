import { describe, it, expect } from 'vitest';
import { sanitizeArticleHtml } from '@/domain/ai/sanitize-article-html';

describe('sanitizeArticleHtml', () => {
  it('keeps allowed tags', () => {
    const html = '<h2>Title</h2><p>Hello <strong>world</strong></p>';
    expect(sanitizeArticleHtml(html)).toContain('<h2>Title</h2>');
    expect(sanitizeArticleHtml(html)).toContain('<strong>world</strong>');
  });

  it('removes script tags', () => {
    const html = '<p>Safe</p><script>alert(1)</script>';
    expect(sanitizeArticleHtml(html)).not.toContain('script');
    expect(sanitizeArticleHtml(html)).toContain('Safe');
  });
});
