import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.route('https://api.sociobot.in/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"valid":false,"reason":"invalid"}' }));
});

test('runs the typed directional caption flow and passes axe', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.goto('/');
  const favicon = await page.request.get('/favicon.ico');
  expect(favicon.status()).toBe(200);
  expect(favicon.headers()['content-type']).toMatch(/^image\//);
  await expect(page).toHaveTitle(/Caption Lanes/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Place live captions by speaker direction.');
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
  expect(consoleErrors).toEqual([]);
});

test('typed Pause and Resume never request microphone access', async ({ page }) => {
  await page.addInitScript(() => {
    let calls = 0;
    Object.defineProperty(window, '__captionLanesGetUserMediaCalls', { get: () => calls });
    const mediaDevices = navigator.mediaDevices || ({} as MediaDevices);
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: mediaDevices });
    Object.defineProperty(mediaDevices, 'getUserMedia', {
      configurable: true,
      value: async () => {
        calls += 1;
        throw new DOMException('Unexpected microphone request', 'NotAllowedError');
      }
    });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore with typed captions' }).click();
  await page.getByRole('button', { name: 'Pause' }).click();
  await page.getByRole('button', { name: 'Resume' }).click();

  await expect(page.getByText('Typed-caption mode · microphone is off')).toBeVisible();
  expect(await page.evaluate(() => (window as typeof window & { __captionLanesGetUserMediaCalls: number }).__captionLanesGetUserMediaCalls)).toBe(0);
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

test('import asks before replacing local captions and persists only after confirmation', async ({ page }) => {
  const transcript = {
    product: 'Caption Lanes',
    captions: [{ id: 'replacement', lane: 'right', text: 'Replacement only', confidence: null, createdAt: '2026-08-28T10:00:00.000Z', source: 'typed' }]
  };
  const importFile = { name: 'caption-lanes.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(transcript)) };

  await page.goto('/');
  await page.getByRole('button', { name: 'Explore with typed captions' }).click();
  const input = page.getByLabel(/Type a caption/);
  await input.fill('Existing one');
  await page.getByRole('button', { name: 'Add to lane' }).click();
  await input.fill('Existing two');
  await page.getByRole('button', { name: 'Add to lane' }).click();
  await page.getByRole('button', { name: 'Open settings' }).click();

  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('confirm');
    expect(dialog.message()).toBe('Import 1 caption? This will replace 2 saved captions on this device.');
    await dialog.dismiss();
  });
  await page.locator('#importFile').setInputFiles(importFile);
  await expect(page.locator('.lane[data-id="center"]')).toContainText('Existing one');
  await expect(page.locator('.lane[data-id="center"]')).toContainText('Existing two');

  page.once('dialog', async (dialog) => await dialog.accept());
  await page.locator('#importFile').setInputFiles(importFile);
  await expect(page.locator('.lane[data-id="right"]')).toContainText('Replacement only');
  await expect(page.locator('.lanes')).not.toContainText('Existing one');
  await page.reload();
  await page.getByRole('button', { name: 'Explore with typed captions' }).click();
  await expect(page.locator('.lane[data-id="right"]')).toContainText('Replacement only');
  await expect(page.locator('.lanes')).not.toContainText('Existing two');
});

test('a lane label can be renamed and is retained in the directional controls', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open settings' }).click();
  await page.getByLabel('← Left lane label').fill('Window');
  await page.getByLabel('← Left lane label').press('Tab');
  await page.getByRole('button', { name: 'Close settings' }).click();
  await page.getByRole('button', { name: 'Explore with typed captions' }).click();
  await expect(page.getByRole('button', { name: /← Window shortcut 1/ })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Explore with typed captions' }).click();
  await expect(page.getByRole('button', { name: /← Window shortcut 1/ })).toBeVisible();
});

test('all visible mobile controls have at least 44px touch targets', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('.skip-link').focus();

  const expectTouchTargets = async () => {
    const selector = 'button:visible, a:visible, input:not([type="hidden"]):visible, label:has(input):visible';
    const targets = page.locator(selector);
    for (let index = 0; index < await targets.count(); index += 1) {
      const box = await targets.nth(index).boundingBox();
      expect(box, `${selector}[${index}] is not rendered`).not.toBeNull();
      const cssPixels = (value: number) => Math.round(value * 100) / 100;
      expect(cssPixels(box!.width), `${selector}[${index}] width`).toBeGreaterThanOrEqual(44);
      expect(cssPixels(box!.height), `${selector}[${index}] height`).toBeGreaterThanOrEqual(44);
    }
  };

  await expectTouchTargets();
  await page.getByRole('button', { name: 'Explore with typed captions' }).click();
  await expectTouchTargets();
  await page.getByRole('button', { name: 'Open settings' }).click();
  await expectTouchTargets();
  await page.getByRole('button', { name: 'Close settings' }).click();
  await page.getByRole('button', { name: 'View Caption Lanes Plus' }).click();
  await expectTouchTargets();
  expect(await page.locator('body').evaluate((body) => body.scrollWidth <= innerWidth)).toBe(true);
});

test('supports skip navigation and returns focus after a keyboard-closed dialog', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();

  const settings = page.getByRole('button', { name: 'Open settings' });
  await settings.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Caption settings' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Caption settings' })).toBeHidden();
  await expect(settings).toBeFocused();
});

test('respects reduced motion and reflows at 320px', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('/demo');
  await expect(page.locator('.utterance').first()).toBeVisible();
  expect(await page.locator('.utterance').first().evaluate((element) => getComputedStyle(element).animationDuration)).toBe('1e-05s');
  expect(await page.locator('body').evaluate((body) => body.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Open settings' }).click();
  expect(await page.locator('body').evaluate((body) => body.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Close settings' }).click();
  await page.getByRole('button', { name: 'View Caption Lanes Plus' }).click();
  expect(await page.locator('body').evaluate((body) => body.scrollWidth <= innerWidth)).toBe(true);
});

test('Plus uses the registered Sociobot hosted checkout', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'View Caption Lanes Plus' }).click();
  await expect(page.getByRole('link', { name: 'Buy Caption Lanes Plus' })).toHaveAttribute(
    'href',
    'https://api.sociobot.in/api/v1/products/speaker-lane-captions/checkout'
  );
});

test('reloads the app shell offline after installation', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  const cacheState = await page.evaluate(async () => {
    const names = await caches.keys();
    const urls = (await Promise.all(names.map(async (name) => (await caches.open(name)).keys()))).flat().map((request) => request.url);
    return { names, urls };
  });
  expect(cacheState.names.some((name) => /^caption-lanes-[a-f0-9]{12}$/.test(name))).toBe(true);
  expect(cacheState.urls.some((url) => /\/assets\/app-[A-Za-z0-9_-]+\.js$/.test(url))).toBe(true);
  expect(cacheState.urls.some((url) => /\/assets\/styles-[A-Za-z0-9_-]+\.css$/.test(url))).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new Event('offline')));
  await expect(page.getByText('You’re offline.')).toBeVisible();
});

test('announces an installed service-worker update', async ({ page }) => {
  await page.addInitScript(() => {
    class InstallWorker extends EventTarget { state = 'installing'; }
    class Registration extends EventTarget { installing = new InstallWorker(); }
    const registration = new Registration();
    Object.defineProperty(window, '__updateRegistration', { value: registration });
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { controller: {}, register: async () => registration }
    });
  });
  await page.goto('/');
  await page.evaluate(() => {
    const registration = (window as typeof window & { __updateRegistration: { installing: EventTarget & { state: string }; dispatchEvent(event: Event): boolean } }).__updateRegistration;
    registration.dispatchEvent(new Event('updatefound'));
    registration.installing.state = 'installed';
    registration.installing.dispatchEvent(new Event('statechange'));
  });
  await expect(page.getByText('An update is ready. Reopen Caption Lanes to use it.')).toBeVisible();
});

test('opens the exact unvisited installed start URL offline after installation', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  try {
    await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
    await page.evaluate(async () => { await navigator.serviceWorker.ready; });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
    const cacheUrls = await page.evaluate(async () => (await Promise.all((await caches.keys()).map(async (name) => (await caches.open(name)).keys()))).flat().map((request) => request.url));
    expect(cacheUrls).toContain('http://127.0.0.1:4173/?v=2&source=installed');

    await context.setOffline(true);
    await page.goto('http://127.0.0.1:4173/?v=2&source=installed', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle('Caption Lanes — Place captions by speaker direction');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Place live captions by speaker direction.');
    await expect(page.getByRole('button', { name: 'Explore with typed captions' })).toBeVisible();
  } finally {
    await context.close();
  }
});

test('the active room has one visible level-one heading and no axe violations', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore with typed captions' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Conversation');
  expect(await page.locator('h1').count()).toBe(1);
  expect(await page.locator('h1:visible').count()).toBe(1);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  await page.getByRole('button', { name: 'End captions' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Place live captions by speaker direction.');
  expect(await page.locator('h1').count()).toBe(1);
});

test('legal and not-found pages are direct-loadable and accessible', async ({ page }) => {
  for (const route of ['/privacy/', '/terms/', '/404.html']) {
    await page.goto(route);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('.skip-link')).toHaveAttribute('href', '#main');
    expect(await page.locator('h1').count()).toBe(1);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
  }
});

test('moves focus, announces titles, and restores routes with browser history', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page).toHaveTitle('Demo — Caption Lanes');
  await expect(page.getByRole('heading', { level: 1, name: 'Conversation' })).toBeFocused();
  await expect(page.locator('#routeAnnouncement')).toContainText('Demo — Caption Lanes. Conversation');
  await page.goBack();
  await expect(page).toHaveURL('http://127.0.0.1:4173/');
  await expect(page).toHaveTitle('Caption Lanes — Place captions by speaker direction');
  await expect(page.getByRole('heading', { level: 1, name: 'Place live captions by speaker direction.' })).toBeFocused();
  await expect(page.locator('#routeAnnouncement')).toContainText('Caption Lanes — Place captions by speaker direction');
  await page.goForward();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Conversation' })).toBeFocused();
});

test('opens the isolated sample directly with ?demo=1', async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page).toHaveTitle('Demo — Caption Lanes');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('.utterance')).toHaveCount(6);
  await page.getByLabel(/Type a caption/).fill('Query demo change');
  await page.getByRole('button', { name: 'Add to lane' }).click();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByText('Query demo change')).toHaveCount(0);
});

test('serves complete route-specific metadata on direct routes', async ({ page }) => {
  const cases = [
    { route: '/privacy/', title: 'Privacy — Caption Lanes', canonical: '/privacy/' },
    { route: '/terms/', title: 'Terms — Caption Lanes', canonical: '/terms/' },
    { route: '/404.html', title: 'Page not found — Caption Lanes', canonical: '/404' }
  ];
  for (const item of cases) {
    await page.goto(item.route);
    await expect(page).toHaveTitle(item.title);
    expect((await page.locator('link[rel="canonical"]').getAttribute('href'))?.endsWith(item.canonical)).toBe(true);
    for (const selector of ['meta[property="og:type"]', 'meta[property="og:title"]', 'meta[property="og:description"]', 'meta[property="og:url"]', 'meta[property="og:image"]', 'meta[name="twitter:card"]', 'meta[name="twitter:title"]', 'meta[name="twitter:description"]', 'meta[name="twitter:image"]', 'link[rel="apple-touch-icon"]']) {
      await expect(page.locator(selector), `${item.route} ${selector}`).toHaveCount(1);
    }
    await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Demo' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Footer navigation' }).getByRole('link', { name: 'Terms' })).toBeVisible();
  }
});
