import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.route('https://api.sociobot.in/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"valid":false,"reason":"invalid"}' }));
});

test('runs the typed directional caption flow and passes axe', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Caption Lanes/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Know where every caption came from.');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);

  await page.getByRole('button', { name: 'Explore with typed captions' }).click();
  await page.getByRole('button', { name: /Left shortcut 1/ }).click();
  await page.getByLabel(/Type a caption/).fill('Coffee is ready.');
  await page.getByRole('button', { name: 'Add to lane' }).click();
  await expect(page.locator('.lane[data-id="left"]')).toContainText('Coffee is ready.');
  await page.keyboard.press('3');
  await page.getByLabel(/Type a caption/).fill('Thank you.');
  await page.keyboard.press('Enter');
  await expect(page.locator('.lane[data-id="right"]')).toContainText('Thank you.');
});

test('works at 390px and restores local captions', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore with typed captions' }).click();
  await page.getByLabel(/Type a caption/).fill('Saved locally.');
  await page.getByRole('button', { name: 'Add to lane' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Explore with typed captions' }).click();
  await expect(page.getByText('Saved locally.')).toBeVisible();
  expect(await page.locator('body').evaluate((body) => body.scrollWidth <= innerWidth)).toBe(true);
});

test('reloads the app shell offline after installation', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new Event('offline')));
  await expect(page.getByText('You’re offline.')).toBeVisible();
});

test('legal routes are direct-loadable and accessible', async ({ page }) => {
  for (const route of ['/privacy/', '/terms/']) {
    await page.goto(route);
    await expect(page.locator('main')).toBeVisible();
    expect(await page.locator('h1').count()).toBe(1);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
  }
});
