import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { defaultLocale, isValidLocale } from '@/lib/i18n/config';
import { isStaffRole } from '@/lib/auth/rbac';
import { resolveRedirect } from '@/lib/auth/safe-redirect';
import { DEFAULT_TENANT_ID } from '@/lib/tenant/constants';
import type { UserRole } from '@/types/database';

const PUBLIC_PATHS = ['/api/webhooks', '/api/gallery', '/api/bookings', '/api/health'];
const AUTH_PATHS = ['/portal'];
const ADMIN_PATHS = ['/admin'];
const AUTH_PAGES = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  if (!firstSegment || !isValidLocale(firstSegment)) {
    const locale =
      request.cookies.get('locale')?.value &&
      isValidLocale(request.cookies.get('locale')!.value)
        ? request.cookies.get('locale')!.value
        : defaultLocale;

    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
    return NextResponse.redirect(url);
  }

  const locale = firstSegment;
  const pathWithoutLocale = '/' + segments.slice(1).join('/');

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
      return NextResponse.redirect(url);
    }
    if (!role || !isStaffRole(role)) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/portal`;
      return NextResponse.redirect(url);
    }
  }

  if (AUTH_PATHS.some((p) => pathWithoutLocale.startsWith(p))) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/login`;
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  if (AUTH_PAGES.some((p) => pathWithoutLocale.startsWith(p)) && user) {
    const redirect = request.nextUrl.searchParams.get('redirect');
    const fallback = role && isStaffRole(role)
      ? `/${locale}/admin`
      : `/${locale}/portal`;
    const url = request.nextUrl.clone();
    url.pathname = resolveRedirect(redirect, fallback);
    url.search = '';
    return NextResponse.redirect(url);
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
