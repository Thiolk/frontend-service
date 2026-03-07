const { test, expect } = require('@playwright/test');

test('app loads successfully', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await expect(page).toHaveURL(/127\.0\.0\.1:4173/);
  await expect(page).not.toHaveTitle('');

  const body = page.locator('body');
  await expect(body).toBeVisible();

  const bodyText = await body.innerText();
  expect(bodyText.trim().length).toBeGreaterThan(0);

  await expect(body).not.toContainText('Something went wrong');
  await expect(body).not.toContainText('Cannot read properties of undefined');
});