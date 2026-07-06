import { describe, expect, it } from 'vitest';
import {
  ADMIN_EMAIL,
  resolveAdminEmail,
  userMustChangePassword,
} from './admin-auth';

describe('admin-auth', () => {
  it('resolves Admin username to admin email', () => {
    expect(resolveAdminEmail('Admin')).toBe(ADMIN_EMAIL);
    expect(resolveAdminEmail(' admin ')).toBe(ADMIN_EMAIL);
    expect(resolveAdminEmail('ADMIN')).toBe(ADMIN_EMAIL);
  });

  it('rejects unknown usernames', () => {
    expect(resolveAdminEmail('owner')).toBeNull();
    expect(resolveAdminEmail('')).toBeNull();
  });

  it('detects must_change_password metadata', () => {
    expect(userMustChangePassword({ user_metadata: { must_change_password: true } })).toBe(
      true
    );
    expect(userMustChangePassword({ user_metadata: { must_change_password: false } })).toBe(
      false
    );
    expect(userMustChangePassword(null)).toBe(false);
  });
});
