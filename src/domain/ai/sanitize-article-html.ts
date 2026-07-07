import sanitizeHtml from 'sanitize-html';

const ARTICLE_TAGS = ['h2', 'h3', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'a'] as const;

export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [...ARTICLE_TAGS],
    allowedAttributes: {
      a: ['href'],
    },
  });
}
