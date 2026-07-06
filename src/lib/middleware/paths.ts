import { isValidLocale } from '@/lib/i18n/config';

export function isStaticAsset(pathname: string): boolean {
  return pathname.startsWith('/_next') || pathname.includes('.');
}

export function isApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/');
}

/** Page routes without a locale prefix need redirect to /{locale}/... */
export function needsLocaleRedirect(pathname: string): boolean {
  if (isApiRoute(pathname)) return false;
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  return !firstSegment || !isValidLocale(firstSegment);
}
