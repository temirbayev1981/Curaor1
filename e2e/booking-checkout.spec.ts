import { test, expect } from '@playwright/test';

test.describe('Booking checkout flow', () => {
  test('submits booking and shows success without Stripe', async ({ page }) => {
    await page.route('**/api/bookings/availability**', async (route) => {
      await route.fulfill({
        json: {
          data: {
            days: [{ date: '2026-12-01', status: 'open', bookingCount: 0 }],
          },
          error: null,
        },
      });
    });

    await page.route('**/api/bookings/quote**', async (route) => {
      await route.fulfill({
        json: {
          data: {
            subtotal: 1500,
            depositAmount: 375,
            balanceDue: 1125,
            depositPercent: 25,
            availability: { available: true, message: 'day_open' },
          },
          error: null,
        },
      });
    });

    await page.route('**/api/bookings', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          json: {
            data: {
              booking: { id: 'b1000000-0000-4000-8000-000000000099' },
              checkoutUrl: null,
            },
            error: null,
          },
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/en/book');
    await page.getByLabel(/Full Name/i).fill('E2E Tester');
    await page.getByLabel(/Email/i).fill('e2e@example.com');
    await page.getByLabel(/Phone/i).fill('7045550199');
    await page.getByLabel(/City/i).fill('Charlotte');
    await page.getByLabel(/Venue Address/i).fill('123 Test Street');

    await page.getByRole('button', { name: /Continue to Secure/i }).click();
    await expect(page.getByText(/submitted/i)).toBeVisible({ timeout: 10000 });
  });

  test('redirects to Stripe checkout when checkout URL returned', async ({ page }) => {
    const paidUrl = '/en/book?paid=1';

    await page.route('**/api/bookings/quote**', async (route) => {
      await route.fulfill({
        json: {
          data: {
            subtotal: 1500,
            depositAmount: 375,
            availability: { available: true, message: 'day_open' },
          },
          error: null,
        },
      });
    });

    await page.route('**/api/bookings', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          json: {
            data: {
              booking: { id: 'b1000000-0000-4000-8000-000000000099' },
              checkoutUrl: paidUrl,
            },
            error: null,
          },
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/en/book');
    await page.getByLabel(/Full Name/i).fill('Stripe Tester');
    await page.getByLabel(/Email/i).fill('stripe@example.com');
    await page.getByLabel(/City/i).fill('Charlotte');
    await page.getByLabel(/Venue Address/i).fill('123 Test Street');

    await page.getByRole('button', { name: /Continue to Secure/i }).click();
    await page.waitForURL('**/book?paid=1');
    await expect(page.getByText(/Payment received/i)).toBeVisible();
  });
});
