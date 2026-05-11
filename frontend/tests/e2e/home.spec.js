import { test, expect } from '@playwright/test';

test('frontend serves index and returns 200', async ({ page }) => {
  const resp = await page.goto('/');
  expect(resp.status()).toBe(200);
  const title = await page.title();
  expect(title.length).toBeGreaterThanOrEqual(0);
});
