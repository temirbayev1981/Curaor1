import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { defaultLocale, isValidLocale } from '@/lib/i18n/config';
import { isStaffRole } from '@/lib/auth/rbac';
import {
  ADMIN_CHANGE_PASSWORD_PATH,
  ADMIN_LOGIN_PATH,
  userMustChangePassword,
} from '@/lib/auth/admin-auth';
import { resolveRedirect } from '@/lib/auth/safe-redirect';
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from '@/lib/config/env';
import { isApiRoute, isStaticAsset, needsLocaleRedirect } from '@/lib/middleware/paths';
import { DEFAULT_TENANT_ID } from '@/lib/tenant/constants';
import type { UserRole } from '@/types/database';

const AUTH_PATHS = ['/portal'];
const AUTH_PAGES = ['/login', '/signup'];

/** Preserve Supabase session cookies when returning a redirect. */
function redirectWithCookies(url: URL, sessionResponse: NextResponse) {
  const response = NextResponse.redirect(url);
  sessionResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value, cookie);
  });
  return response;
}

function pathWithoutLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] && isValidLocale(segments[0])) {
    return '/' + segments.slice(1).join('/');
  }
  return pathname;
}

/** Skip auth guards when Supabase env is missing or still has placeholder values. */
function finishWithoutSupabase(
  request: NextRequest,
  pathname: string,
  response: NextResponse
): NextResponse {
  if (process.env.NODE_ENV === 'production') {
    const bare = pathWithoutLocale(pathname);
    if (
      bare.startsWith('/admin') ||
      bare.startsWith('/portal') ||
      (isApiRoute(pathname) && pathname.startsWith('/api/admin'))
    ) {
      if (isApiRoute(pathname)) {
        return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
      }
      const url = request.nextUrl.clone();
      url.pathname = `/${defaultLocale}`;
      return NextResponse.redirect(url);
    }
  }

  if (isApiRoute(pathname)) {
    return response;
  }

  const segments = pathname.split('/').filter(Boolean);
  const locale = segments[0];
  if (locale && isValidLocale(locale)) {
    response.cookies.set('locale', locale, {
      path: '/',
      maxAge: 31536000,
    });
  }

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

  if (!isSupabaseConfigured()) {
    return finishWithoutSupabase(request, pathname, supabaseResponse);
  }

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

  const mustChangePassword = userMustChangePassword(user);

  if (pathWithoutLocale.startsWith('/admin')) {
    const onLoginPage =
      pathWithoutLocale === ADMIN_LOGIN_PATH ||
      pathWithoutLocale.startsWith(`${ADMIN_LOGIN_PATH}/`);
    const onChangePasswordPage =
      pathWithoutLocale === ADMIN_CHANGE_PASSWORD_PATH ||
      pathWithoutLocale.startsWith(`${ADMIN_CHANGE_PASSWORD_PATH}/`);

    if (onLoginPage) {
      if (user && role && isStaffRole(role)) {
        const url = request.nextUrl.clone();
        url.pathname = mustChangePassword
          ? `/${locale}${ADMIN_CHANGE_PASSWORD_PATH}`
          : `/${locale}/admin`;
        url.search = '';
        return redirectWithCookies(url, supabaseResponse);
      }
    } else if (onChangePasswordPage) {
      if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = `/${locale}${ADMIN_LOGIN_PATH}`;
        return redirectWithCookies(url, supabaseResponse);
      }
      if (!role || !isStaffRole(role)) {
        const url = request.nextUrl.clone();
        url.pathname = `/${locale}/portal`;
        return redirectWithCookies(url, supabaseResponse);
      }
      if (!mustChangePassword) {
        const url = request.nextUrl.clone();
        url.pathname = `/${locale}/admin`;
        return redirectWithCookies(url, supabaseResponse);
      }
    } else {
      if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = `/${locale}${ADMIN_LOGIN_PATH}`;
        url.searchParams.set('redirect', pathname);
        return redirectWithCookies(url, supabaseResponse);
      }
      if (mustChangePassword) {
        const url = request.nextUrl.clone();
        url.pathname = `/${locale}${ADMIN_CHANGE_PASSWORD_PATH}`;
        return redirectWithCookies(url, supabaseResponse);
      }
      if (!role || !isStaffRole(role)) {
        const url = request.nextUrl.clone();
        url.pathname = `/${locale}/portal`;
        return redirectWithCookies(url, supabaseResponse);
      }
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
    const staffFallback = mustChangePassword
      ? `/${locale}${ADMIN_CHANGE_PASSWORD_PATH}`
      : `/${locale}/admin`;
    const fallback =
      role && isStaffRole(role) ? staffFallback : `/${locale}/portal`;
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
