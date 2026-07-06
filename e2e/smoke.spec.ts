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

  test('login page loads', async ({ page }) => {
    await page.goto('/en/login');
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();
  });

  test('404 page renders', async ({ page }) => {
    await page.goto('/en/this-page-does-not-exist');
    await expect(page.getByText('404')).toBeVisible();
  });

  test('health API returns ok', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.data.status).toBe('ok');
  });
});
