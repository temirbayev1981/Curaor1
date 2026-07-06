export const ADMIN_USERNAME = 'Admin';
export const ADMIN_EMAIL = 'admin@emeraldpour.com';

/** Map display username "Admin" to Supabase email. */
export function resolveAdminEmail(username: string): string | null {
  if (username.trim().toLowerCase() === ADMIN_USERNAME.toLowerCase()) {
    return ADMIN_EMAIL;
  }
  return null;
}

export function userMustChangePassword(
  user: { user_metadata?: Record<string, unknown> } | null | undefined
): boolean {
  return user?.user_metadata?.must_change_password === true;
}

export const ADMIN_LOGIN_PATH = '/admin/login';
export const ADMIN_CHANGE_PASSWORD_PATH = '/admin/change-password';

export function isAdminAuthPage(pathWithoutLocale: string): boolean {
  return (
    pathWithoutLocale === ADMIN_LOGIN_PATH ||
    pathWithoutLocale.startsWith(`${ADMIN_LOGIN_PATH}/`) ||
    pathWithoutLocale === ADMIN_CHANGE_PASSWORD_PATH ||
    pathWithoutLocale.startsWith(`${ADMIN_CHANGE_PASSWORD_PATH}/`)
  );
}
