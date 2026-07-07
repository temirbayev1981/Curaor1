import { test, expect } from '@playwright/test';

test.describe('Public site smoke tests', () => {
  test('home page loads in English', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('h1')).toContainText('The Emerald Pour');
  });

  test('home page loads in Russian', async ({ page }) => {
    await page.goto('/ru');
    await expect(page.locator('h1')).toContainText('The Emerald Pour');
  });

  test('booking page has form sections', async ({ page }) => {
    await page.goto('/en/book');
    await expect(page.getByRole('heading', { name: /Book Your Event/i })).toBeVisible();
  });

  test('booking page has deposit selector', async ({ page }) => {
    await page.goto('/en/book');
    await expect(page.getByText(/25% deposit/i)).toBeVisible();
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/en/login');
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();
  });

  test('admin login page loads', async ({ page }) => {
    await page.goto('/en/admin/login');
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();
  });

  test('404 page renders', async ({ page }) => {
    await page.goto('/en/this-page-does-not-exist');
    await expect(page.getByText('404')).toBeVisible();
  });

  test('health API returns status payload', async ({ request }) => {
    const res = await request.get('/api/health');
    const json = await res.json();
    expect(['ok', 'degraded']).toContain(json.data.status);
    expect(json.data).toHaveProperty('supabase');
  });
});
