import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const baseUrl = process.argv[2] ?? 'https://speaker-lane-captions.sociobot.in';
const evidenceDir = process.argv[3] ?? '.factory/evidence/polish-3-retry1';
const expectedOrigin = new URL(baseUrl).origin;
const results = [];

function check(value, message) {
  if (!value) throw new Error(message);
}

async function readDatabase(page, name) {
  return page.evaluate(async (databaseName) => {
    const database = await new Promise((resolve, reject) => {
      const request = indexedDB.open(databaseName, 1);
      request.onupgradeneeded = () => request.result.createObjectStore('captions', { keyPath: 'id' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const entries = await new Promise((resolve, reject) => {
      const request = database.transaction('captions').objectStore('captions').getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    database.close();
    return entries;
  }, name);
}

await mkdir(evidenceDir, { recursive: true });
const browser = await chromium.launch();

try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript(() => {
    let microphoneCalls = 0;
    Object.defineProperty(window, '__microphoneCalls', { get: () => microphoneCalls });
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: async () => { microphoneCalls += 1; throw new Error('The demo requested a microphone.'); } }
    });
  });
  const page = await context.newPage();
  const errors = [];
  const requests = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('request', (request) => requests.push(request.url()));
  await page.route('https://api.sociobot.in/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"valid":true,"reason":"ok"}' }));

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  check(await page.title() === 'Caption Lanes — Place captions by speaker direction', 'Home title is wrong.');
  check(await page.locator('h1').count() === 1, 'Home must have one h1.');
  const actionBox = await page.getByRole('link', { name: 'Try it with sample data' }).boundingBox();
  const factsBox = await page.locator('.hero-facts').boundingBox();
  check(actionBox && actionBox.y + actionBox.height <= 844, 'The primary action is below the mobile first screen.');
  check(factsBox && factsBox.y + factsBox.height <= 844, 'The three facts are below the mobile first screen.');
  await page.screenshot({ path: `${evidenceDir}/live-mobile-home.png` });

  await page.evaluate(async () => {
    localStorage.setItem('sb_license:speaker-lane-captions', 'live-real-license');
    localStorage.setItem('sb_license:speaker-lane-captions:verdict', JSON.stringify({ valid: true, checkedAt: Date.now() }));
    localStorage.setItem('caption-lanes:preferences', JSON.stringify({ captionSize: 36 }));
    const database = await new Promise((resolve, reject) => {
      const request = indexedDB.open('caption-lanes', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('captions', { keyPath: 'id' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise((resolve, reject) => {
      const transaction = database.transaction('captions', 'readwrite');
      transaction.objectStore('captions').put({ id: 'live-real', lane: 'center', text: 'Live real transcript remains', confidence: null, createdAt: '2026-09-01T00:00:00.000Z', source: 'typed' });
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
    database.close();
  });

  const demoRequestStart = requests.length;
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await page.waitForURL(`${expectedOrigin}/demo`);
  await page.waitForFunction(() => document.querySelectorAll('.utterance').length === 6);
  check(await page.title() === 'Demo — Caption Lanes', 'Demo title is wrong.');
  check(await page.getByText('Demo — sample data, nothing is saved').isVisible(), 'Demo banner is missing.');
  check(await page.locator('.lane').count() === 3, 'Demo inherited a real Plus lane.');
  check(await page.locator('.utterance').count() === 6, 'Demo sample is incomplete.');
  check(await page.evaluate(() => window.__microphoneCalls) === 0, 'Demo requested microphone access.');
  const demoRequests = requests.slice(demoRequestStart).map((url) => new URL(url).origin);
  check(demoRequests.every((origin) => origin === expectedOrigin), 'Demo contacted another origin.');

  await page.evaluate(async () => {
    localStorage.setItem('demo:caption-lanes:legacy-setting', 'remove');
    sessionStorage.setItem('demo:caption-lanes:session', 'remove');
    const database = await new Promise((resolve, reject) => {
      const request = indexedDB.open('demo:caption-lanes:legacy', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('captions', { keyPath: 'id' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    database.close();
  });
  await page.getByLabel(/Type a caption/).fill('Temporary live demo caption');
  await page.getByRole('button', { name: 'Add to lane' }).click();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.waitForFunction(() => document.querySelectorAll('.utterance').length === 6);
  check(await page.locator('.utterance').count() === 6, 'Reset did not restore six sample captions.');
  check(await page.locator('.lane').count() === 3, 'Reset exposed a Plus lane.');
  await page.locator('#toast').waitFor({ state: 'hidden' });
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: `${evidenceDir}/live-mobile-demo.png`, fullPage: true });

  await page.getByRole('button', { name: 'Start for real' }).click();
  await page.waitForURL(`${expectedOrigin}/#consent-panel`);
  await page.getByRole('heading', { level: 1 }).waitFor({ state: 'visible' });
  await page.waitForFunction(() => document.activeElement === document.querySelector('h1'));
  check(await page.evaluate(async () => !(await indexedDB.databases()).some(({ name }) => name?.startsWith('demo:caption-lanes'))), 'A demo database remains after Start for real.');
  check(await page.evaluate(() => Object.keys(localStorage).every((key) => !key.startsWith('demo:caption-lanes'))), 'A demo localStorage key remains.');
  check(await page.evaluate(() => Object.keys(sessionStorage).every((key) => !key.startsWith('demo:caption-lanes'))), 'A demo sessionStorage key remains.');
  check(await page.evaluate(() => localStorage.getItem('sb_license:speaker-lane-captions')) === 'live-real-license', 'Real Plus data was changed.');
  check((await readDatabase(page, 'caption-lanes')).some(({ text }) => text === 'Live real transcript remains'), 'Real transcript data was changed.');
  await page.getByRole('button', { name: 'Explore with typed captions' }).click();
  check(await page.locator('.lane').count() === 4, 'Real Plus state did not return after demo exit.');
  check(await page.getByText('Live real transcript remains').isVisible(), 'Real transcript did not return after demo exit.');
  check(errors.length === 0, `Console errors: ${errors.join(' | ')}`);
  results.push({ check: 'mobile demo isolation and first screen', status: 'pass', demoRequests, errors });
  await context.close();

  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.route('https://api.sociobot.in/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"valid":true,"reason":"ok"}' }));
  await desktopPage.goto(baseUrl, { waitUntil: 'networkidle' });
  await desktopPage.evaluate(async () => {
    localStorage.setItem('sb_license:speaker-lane-captions', 'desktop-real-license');
    localStorage.setItem('sb_license:speaker-lane-captions:verdict', JSON.stringify({ valid: true, checkedAt: Date.now() }));
    const database = await new Promise((resolve, reject) => {
      const request = indexedDB.open('caption-lanes', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('captions', { keyPath: 'id' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise((resolve, reject) => {
      const transaction = database.transaction('captions', 'readwrite');
      transaction.objectStore('captions').put({ id: 'desktop-real', lane: 'left', text: 'Desktop real transcript remains', confidence: null, createdAt: '2026-09-01T00:00:00.000Z', source: 'typed' });
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
    database.close();
  });
  await desktopPage.getByRole('link', { name: 'Try it with sample data' }).click();
  await desktopPage.waitForURL(`${expectedOrigin}/demo`);
  await desktopPage.waitForFunction(() => document.activeElement === document.querySelector('h1') && document.title === 'Demo — Caption Lanes');
  await desktopPage.screenshot({ path: `${evidenceDir}/live-desktop-demo.png`, fullPage: true });
  await desktopPage.goBack();
  await desktopPage.waitForFunction(() => document.activeElement === document.querySelector('h1') && document.title.startsWith('Caption Lanes —'));
  await desktopPage.goForward();
  await desktopPage.waitForFunction(() => document.activeElement === document.querySelector('h1') && document.title === 'Demo — Caption Lanes');
  await desktopPage.evaluate(() => localStorage.setItem('demo:caption-lanes:desktop-extra', 'remove'));
  await desktopPage.getByRole('button', { name: 'Start for real' }).click();
  await desktopPage.waitForURL(`${expectedOrigin}/#consent-panel`);
  await desktopPage.waitForFunction(() => document.activeElement === document.querySelector('h1'));
  check(await desktopPage.evaluate(async () => !(await indexedDB.databases()).some(({ name }) => name?.startsWith('demo:caption-lanes'))), 'Desktop exit left a demo database.');
  check(await desktopPage.evaluate(() => Object.keys(localStorage).every((key) => !key.startsWith('demo:caption-lanes'))), 'Desktop exit left a demo storage key.');
  check(await desktopPage.evaluate(() => localStorage.getItem('sb_license:speaker-lane-captions')) === 'desktop-real-license', 'Desktop exit changed the real license.');
  check((await readDatabase(desktopPage, 'caption-lanes')).some(({ text }) => text === 'Desktop real transcript remains'), 'Desktop exit changed the real transcript.');
  results.push({ check: 'desktop demo isolation and route focus', status: 'pass' });
  await desktopContext.close();

  const blockedContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const blockedPage = await blockedContext.newPage();
  await blockedPage.goto(`${baseUrl}/?demo=1`, { waitUntil: 'networkidle' });
  check(await blockedPage.title() === 'Demo — Caption Lanes', '?demo=1 did not enter demo mode.');
  await blockedPage.evaluate(async () => {
    window.__blockingDatabase = await new Promise((resolve, reject) => {
      const request = indexedDB.open('demo:caption-lanes', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
  await blockedPage.getByRole('button', { name: 'Start for real' }).click();
  await blockedPage.getByText('Sample data could not be removed. Close other Caption Lanes tabs, then try again.').waitFor();
  check(new URL(blockedPage.url()).searchParams.get('demo') === '1', 'A blocked deletion still left the demo.');
  await blockedPage.screenshot({ path: `${evidenceDir}/live-mobile-delete-error.png`, fullPage: true });
  await blockedPage.evaluate(() => window.__blockingDatabase.close());
  await blockedPage.getByRole('button', { name: 'Start for real' }).click();
  await blockedPage.waitForURL(`${expectedOrigin}/#consent-panel`);
  results.push({ check: 'blocked demo deletion recovery', status: 'pass' });
  await blockedContext.close();

  const routeContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const routePage = await routeContext.newPage();
  for (const item of [
    { path: '/', title: 'Caption Lanes — Place captions by speaker direction', status: 200 },
    { path: '/demo', title: 'Demo — Caption Lanes', status: 200 },
    { path: '/privacy/', title: 'Privacy — Caption Lanes', status: 200 },
    { path: '/terms/', title: 'Terms — Caption Lanes', status: 200 },
    { path: '/not-a-caption-page', title: 'Page not found — Caption Lanes', status: 404 }
  ]) {
    const response = await routePage.goto(`${baseUrl}${item.path}`, { waitUntil: 'networkidle' });
    check(response?.status() === item.status, `${item.path} returned ${response?.status()}.`);
    check(await routePage.title() === item.title, `${item.path} has the wrong title.`);
    check(await routePage.locator('h1').count() === 1, `${item.path} must have one h1.`);
    check(await routePage.locator('main').count() === 1, `${item.path} is missing main.`);
    check(await routePage.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Demo' }).isVisible(), `${item.path} hides Demo navigation.`);
    check(await routePage.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Privacy' }).isVisible(), `${item.path} hides Privacy navigation.`);
    for (const selector of ['link[rel="canonical"]', 'meta[property="og:title"]', 'meta[property="og:image"]', 'meta[name="twitter:title"]', 'link[rel="apple-touch-icon"]']) {
      check(await routePage.locator(selector).count() === 1, `${item.path} is missing ${selector}.`);
    }
    const axe = await new AxeBuilder({ page: routePage }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const serious = axe.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
    check(serious.length === 0, `${item.path} has serious axe violations: ${serious.map(({ id }) => id).join(', ')}`);
  }
  results.push({ check: 'routes, metadata, mobile navigation, and axe', status: 'pass' });
  await routeContext.close();

  const offlineContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const offlinePage = await offlineContext.newPage();
  await offlinePage.goto(`${baseUrl}/demo`, { waitUntil: 'networkidle' });
  await offlinePage.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await offlineContext.setOffline(true);
  await offlinePage.reload({ waitUntil: 'domcontentloaded' });
  check(await offlinePage.locator('.utterance').count() === 6, 'The installed demo did not reopen offline.');
  results.push({ check: 'offline reload', status: 'pass' });
  await offlineContext.close();

  await writeFile(`${evidenceDir}/live-checks.json`, `${JSON.stringify({ baseUrl, checkedAt: new Date().toISOString(), results }, null, 2)}\n`);
  console.log(JSON.stringify({ baseUrl, results }, null, 2));
} finally {
  await browser.close();
}
