/** Only allow same-site relative paths (prevents open redirects). */
export function isSafeRedirect(path: string): boolean {
  return (
    path.startsWith('/') &&
    !path.startsWith('//') &&
    !path.includes('//') &&
    !path.includes(':') &&
    !path.includes('\\')
  );
}

export function resolveRedirect(
  redirect: string | null,
  fallback: string
): string {
  if (redirect && isSafeRedirect(redirect)) return redirect;
  return fallback;
}
