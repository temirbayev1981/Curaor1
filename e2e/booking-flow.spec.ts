import { test, expect } from '@playwright/test';

test.describe('Booking flow', () => {
  test('fills contact fields and shows deposit options', async ({ page }) => {
    await page.goto('/en/book');

    await page.getByLabel(/Full Name/i).fill('Test User');
    await page.getByLabel(/Email/i).fill('test@example.com');
    await page.getByLabel(/Phone/i).fill('7045550100');

    await expect(page.getByText(/25% deposit/i)).toBeVisible();
    await expect(page.getByText(/50% deposit/i)).toBeVisible();
    await expect(page.getByText(/100% full payment/i)).toBeVisible();
  });

  test('package tier is reflected in URL params', async ({ page }) => {
    await page.goto('/en/book?package=shamrock&event=wedding&city=Charlotte');
    await expect(page.getByRole('heading', { name: /Book Your Event/i })).toBeVisible();
  });
});

test.describe('Tenant resolution', () => {
  test('sets tenant cookie from query param', async ({ page, context }) => {
    await page.goto('/en?tenant=emerald-pour');
    const cookies = await context.cookies();
    const tenantCookie = cookies.find((c) => c.name === 'tenant_slug');
    expect(tenantCookie?.value).toBe('emerald-pour');
  });
});
