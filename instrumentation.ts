export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('@/domain/events/register-consumers');

    const dsn = process.env.SENTRY_DSN;
    if (dsn) {
      const Sentry = await import('@sentry/nextjs');
      Sentry.init({
        dsn,
        tracesSampleRate: 0.1,
        environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
      });
    }
  }

  if (process.env.NEXT_RUNTIME === 'edge' && process.env.SENTRY_DSN) {
    const Sentry = await import('@sentry/nextjs');
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.1,
    });
  }
}

export const onRequestError = async (
  error: Error,
  request: { path: string },
  context: { routerKind: string; routePath: string }
) => {
  if (!process.env.SENTRY_DSN) return;

  const Sentry = await import('@sentry/nextjs');
  Sentry.captureException(error, {
    extra: { path: request.path, ...context },
  });
};
