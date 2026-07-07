import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

export function captureError(error: unknown, context?: { digest?: string; tags?: Record<string, string> }): void {
  const message = error instanceof Error ? error.message : String(error);

  if (dsn) {
    Sentry.captureException(error instanceof Error ? error : new Error(message), {
      tags: context?.tags,
      extra: { digest: context?.digest },
    });
    return;
  }

  console.error(
    JSON.stringify({
      level: 'error',
      message,
      stack: error instanceof Error ? error.stack : undefined,
      digest: context?.digest,
      tags: context?.tags,
      timestamp: new Date().toISOString(),
    })
  );
}
