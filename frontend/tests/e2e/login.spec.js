import { test, expect } from '@playwright/test';

test('login flow redirects based on role (mocked backend)', async ({ page }) => {
  // Intercept token request and return fake token
  await page.route('**/api/auth/token/', async (route) => {
    const request = route.request();
    if (request.method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ access: 'fake-access-token' }),
      });
    } else {
      route.continue();
    }
  });

  // Intercept user details request and return a fake user
  await page.route('**/api/users/me/', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: 1, first_name: 'Test', last_name: 'User', email: 'test@local', role: 'admin' }),
    });
  });

  // Go to root and trigger client-side navigation to /login (static server may not fallback)
  await page.goto('/');
  await page.evaluate(() => {
    history.pushState({}, '', '/login');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });

  // Fill form
  await page.fill('input[name="email"]', 'test@local');
  await page.fill('input[name="password"]', 'password');

  // Submit
  await Promise.all([
    page.waitForNavigation({ url: /\/$/ }),
    page.click('button[type="submit"]'),
  ]);

  // Assert token and user in localStorage
  const token = await page.evaluate(() => localStorage.getItem('token'));
  expect(token).toBe('fake-access-token');

  const user = await page.evaluate(() => JSON.parse(localStorage.getItem('user')));
  expect(user).toMatchObject({ email: 'test@local', role: 'admin' });
});
