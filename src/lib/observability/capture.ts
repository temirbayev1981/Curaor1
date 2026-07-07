/**
 * Lightweight error reporting — structured JSON logs for production monitoring.
 * Set SENTRY_DSN to enable external forwarding via your log drain.
 */

interface ErrorContext {
  digest?: string;
  tags?: Record<string, string>;
}

export function captureError(error: unknown, context?: ErrorContext): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  const payload = {
    level: 'error',
    message,
    stack,
    digest: context?.digest,
    tags: context?.tags,
    timestamp: new Date().toISOString(),
    sentryConfigured: Boolean(process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN),
  };

  console.error(JSON.stringify(payload));
}
