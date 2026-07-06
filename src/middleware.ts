import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { defaultLocale, isValidLocale } from '@/lib/i18n/config';
import { isStaffRole } from '@/lib/auth/rbac';
import { resolveRedirect } from '@/lib/auth/safe-redirect';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/config/env';
import { isApiRoute, isStaticAsset, needsLocaleRedirect } from '@/lib/middleware/paths';
import { DEFAULT_TENANT_ID } from '@/lib/tenant/constants';
import type { UserRole } from '@/types/database';

const AUTH_PATHS = ['/portal'];
const ADMIN_PATHS = ['/admin'];
const AUTH_PAGES = ['/login', '/signup'];

/** Preserve Supabase session cookies when returning a redirect. */
function redirectWithCookies(url: URL, sessionResponse: NextResponse) {
  const response = NextResponse.redirect(url);
  sessionResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value, cookie);
  });
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  if (needsLocaleRedirect(pathname)) {
    const localeCookie = request.cookies.get('locale')?.value;
    const locale =
      localeCookie && isValidLocale(localeCookie) ? localeCookie : defaultLocale;

    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
    return NextResponse.redirect(url);
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // API routes: refresh session cookies only — no locale prefix, no page guards
  if (isApiRoute(pathname)) {
    return supabaseResponse;
  }

  const segments = pathname.split('/').filter(Boolean);
  const locale = segments[0]!;
  const pathWithoutLocale = '/' + segments.slice(1).join('/');

  let role: UserRole | null = null;
  if (user) {
    const admin = createAdminClient();
    const { data: membership } = await admin
      .from('tenant_users')
      .select('role')
      .eq('user_id', user.id)
      .eq('tenant_id', DEFAULT_TENANT_ID)
      .maybeSingle();
    role = (membership as { role: UserRole } | null)?.role ?? null;
  }

  if (ADMIN_PATHS.some((p) => pathWithoutLocale.startsWith(p))) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/login`;
      url.searchParams.set('redirect', pathname);
      return redirectWithCookies(url, supabaseResponse);
    }
    if (!role || !isStaffRole(role)) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/portal`;
      return redirectWithCookies(url, supabaseResponse);
    }
  }

  if (AUTH_PATHS.some((p) => pathWithoutLocale.startsWith(p))) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/login`;
      url.searchParams.set('redirect', pathname);
      return redirectWithCookies(url, supabaseResponse);
    }
  }

  if (AUTH_PAGES.some((p) => pathWithoutLocale.startsWith(p)) && user) {
    const redirect = request.nextUrl.searchParams.get('redirect');
    const fallback =
      role && isStaffRole(role) ? `/${locale}/admin` : `/${locale}/portal`;
    const url = request.nextUrl.clone();
    url.pathname = resolveRedirect(redirect, fallback);
    url.search = '';
    return redirectWithCookies(url, supabaseResponse);
  }

  supabaseResponse.cookies.set('locale', locale, {
    path: '/',
    maxAge: 31536000,
  });

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
