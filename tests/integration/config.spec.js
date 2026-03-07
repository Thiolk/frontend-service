const { test, expect } = require('@playwright/test');

test('runtime config loads from /env.js', async ({ page }) => {
  const envResponsePromise = page.waitForResponse((response) => {
    return response.url().includes('/env.js') && response.status() === 200;
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const envResponse = await envResponsePromise;
  expect(envResponse.ok()).toBeTruthy();

  const envObject = await page.evaluate(() => window.__ENV__);

  expect(envObject).toBeTruthy();
  expect(envObject.API_BASE_URL).toBe('http://mock-api.local');
  expect(envObject.APP_ENV).toBe('integration');
});