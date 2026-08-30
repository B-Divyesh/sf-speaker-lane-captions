import { readFile } from 'node:fs/promises';
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const origin = 'http://127.0.0.1:4173';

async function databaseEntries(page: Page, name: string): Promise<Record<string, unknown>[]> {
  return page.evaluate(async (databaseName) => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(databaseName, 1);
      request.onupgradeneeded = () => request.result.createObjectStore('captions', { keyPath: 'id' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const entries = await new Promise<Record<string, unknown>[]>((resolve, reject) => {
      const request = database.transaction('captions').objectStore('captions').getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    database.close();
    return entries;
  }, name);
}

async function startForReal(page: Page): Promise<void> {
  await Promise.all([
    page.waitForURL(/\/#consent-panel$/),
    page.getByRole('button', { name: 'Start for real' }).click()
  ]);
}

test.beforeEach(async ({ page }) => {
  await page.route('https://api.sociobot.in/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"valid":false,"reason":"invalid"}' }));
});

test('keeps a seeded demo separate from real data and a real Plus license @claim:demo-isolation', async ({ page }) => {
  await page.unroute('https://api.sociobot.in/**');
  await page.route('https://api.sociobot.in/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"valid":true,"reason":"ok"}' }));
  await page.goto('/');
  await page.evaluate(async () => {
    localStorage.setItem('sb_license:speaker-lane-captions', 'real-plus-license');
    localStorage.setItem('sb_license:speaker-lane-captions:verdict', JSON.stringify({ valid: true, checkedAt: Date.now() }));
    localStorage.setItem('caption-lanes:preferences', JSON.stringify({ captionSize: 36, lanes: { left: { label: 'Real label', color: '#73c8c3', locked: true } } }));
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('caption-lanes', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('captions', { keyPath: 'id' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction('captions', 'readwrite');
      transaction.objectStore('captions').put({ id: 'real-only', lane: 'center', text: 'Real transcript stays private', confidence: null, createdAt: '2026-08-30T10:00:00.000Z', source: 'typed' });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    database.close();
  });

  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page).toHaveTitle('Demo — Caption Lanes');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('.utterance')).toHaveCount(6);
  await expect(page.locator('.lane')).toHaveCount(3);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.locator('.utterances').first().focus();
  expect(await page.locator('.utterances').first().evaluate((element) => getComputedStyle(element).outlineWidth)).toBe('3px');
  await expect(page.getByText('Real transcript stays private')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /← Left shortcut 1/ })).toBeVisible();

  await page.getByLabel(/Type a caption/).fill('Temporary demo note');
  await page.getByRole('button', { name: 'Add to lane' }).click();
  await expect(page.getByText('Temporary demo note')).toBeVisible();
  expect((await databaseEntries(page, 'demo:caption-lanes')).length).toBe(7);

  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByText('Temporary demo note')).toHaveCount(0);
  await expect(page.locator('.utterance')).toHaveCount(6);
  await expect(page.locator('.lane')).toHaveCount(3);

  await startForReal(page);
  expect(await page.evaluate(async () => (await indexedDB.databases()).some(({ name }) => name === 'demo:caption-lanes'))).toBe(false);
  expect(await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('demo:')))).toEqual([]);
  await page.getByRole('button', { name: 'Explore with typed captions' }).click();
  await expect(page.getByText('Real transcript stays private')).toBeVisible();
  await expect(page.locator('.lane')).toHaveCount(4);
});

test('shows the three directional lanes and places captions manually @claim:directional-lanes', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('.lane')).toHaveCount(3);
  await expect(page.locator('.lane[data-id="left"]')).toContainText('Should we move the chairs closer?');
  await expect(page.locator('.lane[data-id="center"]')).toContainText('This distance works well for me.');
  await expect(page.locator('.lane[data-id="right"]')).toContainText('Please choose somewhere quiet.');
  await page.keyboard.press('1');
  await page.getByLabel(/Type a caption/).fill('Placed with the keyboard');
  await page.keyboard.press('Enter');
  await expect(page.locator('.lane[data-id="left"]')).toContainText('Placed with the keyboard');
});

test('uses stereo energy for a coarse direction and stops the audio track @claim:stereo-direction', async ({ page }) => {
  await page.addInitScript(() => {
    const state = { stopped: false };
    Object.defineProperty(window, '__stereoClaimState', { value: state });
    class Recognition extends EventTarget {
      continuous = false;
      interimResults = false;
      lang = '';
      processLocally = false;
      onresult = null;
      onerror = null;
      onend = null;
      static async available() { return 'available'; }
      start() {}
      stop() {}
      abort() {}
    }
    const track = { getSettings: () => ({ channelCount: 2 }), stop: () => { state.stopped = true; } };
    Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: Recognition });
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: async () => ({ getAudioTracks: () => [track], getTracks: () => [track] }) } });
    class TestAudioContext {
      analyserCount = 0;
      createMediaStreamSource() { return { connect() {} }; }
      createChannelSplitter() { return { connect() {} }; }
      createAnalyser() {
        const isLeft = this.analyserCount++ === 0;
        return {
          fftSize: 0,
          getByteTimeDomainData(data: Uint8Array) {
            for (let index = 0; index < data.length; index += 1) data[index] = isLeft ? (index % 2 ? 160 : 96) : (index % 2 ? 130 : 126);
          }
        };
      }
      async close() {}
    }
    Object.defineProperty(window, 'AudioContext', { configurable: true, value: TestAudioContext });
  });
  await page.goto('/demo');
  await startForReal(page);
  await page.getByLabel('Everyone here agrees to live captions.').check();
  await page.getByRole('button', { name: 'Start captions' }).click();
  await expect(page.getByRole('button', { name: /← Left shortcut 1/ })).toHaveAttribute('aria-pressed', 'true', { timeout: 2_000 });
  await expect(page.locator('.lane[data-id="left"] .confidence')).toHaveText('Direction: strong');
  await page.getByRole('button', { name: 'Pause' }).click();
  expect(await page.evaluate(() => (window as typeof window & { __stereoClaimState: { stopped: boolean } }).__stereoClaimState.stopped)).toBe(true);
});

test('sends the demo flow only to its origin without microphone access @claim:local-privacy', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.addInitScript(() => {
    let calls = 0;
    Object.defineProperty(window, '__microphoneCalls', { get: () => calls });
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: async () => { calls += 1; throw new Error('unexpected'); } } });
  });
  await page.goto('/demo');
  await page.getByLabel(/Type a caption/).fill('Nothing leaves this demo.');
  await page.getByRole('button', { name: 'Add to lane' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export transcript' }).click();
  const download = await downloadPromise;
  const downloadPath = await download.path();
  const exported = JSON.parse(await readFile(downloadPath!, 'utf8')) as { rawAudioStored: boolean; captions: Record<string, unknown>[] };
  expect(exported.rawAudioStored).toBe(false);
  expect(exported.captions.length).toBe(7);
  const stored = await databaseEntries(page, 'demo:caption-lanes');
  expect(stored.every((entry) => Object.keys(entry).sort().join(',') === 'confidence,createdAt,id,lane,source,text')).toBe(true);
  expect(await page.evaluate(() => (window as typeof window & { __microphoneCalls: number }).__microphoneCalls)).toBe(0);
  expect([...new Set(requests.map((url) => new URL(url).origin))]).toEqual([origin]);
});

test('does not retain microphone audio with a live speech fixture @claim:raw-audio-storage', async ({ page }) => {
  await page.addInitScript(() => {
    const state = { recorderCalls: 0, trackStopped: false };
    Object.defineProperty(window, '__rawAudioClaimState', { value: state });
    class Recognition extends EventTarget {
      continuous = false;
      interimResults = false;
      lang = '';
      processLocally = false;
      onresult: ((event: unknown) => void) | null = null;
      onerror = null;
      onend = null;
      static async available() { return 'available'; }
      start() {
        window.setTimeout(() => this.onresult?.({ resultIndex: 0, results: [{ isFinal: true, 0: { transcript: 'Spoken fixture caption', confidence: .9 } }] }), 0);
      }
      stop() {}
      abort() {}
    }
    const track = { getSettings: () => ({ channelCount: 1 }), stop: () => { state.trackStopped = true; } };
    Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: Recognition });
    Object.defineProperty(window, 'MediaRecorder', { configurable: true, value: class { constructor() { state.recorderCalls += 1; } } });
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: async () => ({ getAudioTracks: () => [track], getTracks: () => [track] }) } });
  });
  await page.goto('/demo');
  await startForReal(page);
  await page.getByLabel('Everyone here agrees to live captions.').check();
  await page.getByRole('button', { name: 'Start captions' }).click();
  await expect(page.getByText('Spoken fixture caption')).toBeVisible();
  await page.getByRole('button', { name: 'Pause' }).click();
  const state = await page.evaluate(() => (window as typeof window & { __rawAudioClaimState: { recorderCalls: number; trackStopped: boolean } }).__rawAudioClaimState);
  expect(state).toEqual({ recorderCalls: 0, trackStopped: true });
  const entries = await databaseEntries(page, 'caption-lanes');
  expect(entries).toHaveLength(1);
  expect(Object.keys(entries[0]).sort().join(',')).toBe('confidence,createdAt,id,lane,source,text');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export transcript' }).click();
  const downloadPath = await (await downloadPromise).path();
  const exported = JSON.parse(await readFile(downloadPath!, 'utf8')) as { rawAudioStored: boolean };
  expect(exported.rawAudioStored).toBe(false);
});

test('opens the installed demo offline after one online visit @claim:offline-reload', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  try {
    await page.goto(`${origin}/demo`, { waitUntil: 'networkidle' });
    await page.evaluate(async () => { await navigator.serviceWorker.ready; });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
    await context.setOffline(true);
    await page.goto(`${origin}/demo`, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle('Demo — Caption Lanes');
    await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
    await expect(page.getByText('Please choose somewhere quiet.')).toBeVisible();
  } finally {
    await context.close();
  }
});

test('keeps real captions and display settings after reload @claim:caption-persistence', async ({ page }) => {
  await page.goto('/demo');
  await startForReal(page);
  await page.getByRole('button', { name: 'Explore with typed captions' }).click();
  await page.getByLabel(/Type a caption/).fill('This caption survives reload.');
  await page.getByRole('button', { name: 'Add to lane' }).click();
  await page.getByRole('button', { name: 'Open settings' }).click();
  await page.getByLabel('← Left lane label').fill('Window');
  await page.getByLabel('← Left lane label').press('Tab');
  await page.getByRole('button', { name: 'Close settings' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Explore with typed captions' }).click();
  await expect(page.getByText('This caption survives reload.')).toBeVisible();
  await expect(page.getByRole('button', { name: /← Window shortcut 1/ })).toBeVisible();
});

test('exports and imports caption JSON @claim:transcript-portability', async ({ page }) => {
  await page.goto('/demo');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export transcript' }).click();
  const download = await downloadPromise;
  const path = await download.path();
  const exported = JSON.parse(await readFile(path!, 'utf8')) as { product: string; captions: unknown[] };
  expect(exported.product).toBe('Caption Lanes');
  expect(exported.captions).toHaveLength(6);

  const replacement = { product: 'Caption Lanes', captions: [{ id: 'imported', lane: 'right', text: 'Imported caption', confidence: null, createdAt: '2026-08-30T11:00:00.000Z', source: 'typed' }] };
  await page.getByRole('button', { name: 'Open settings' }).click();
  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('#importFile').setInputFiles({ name: 'caption-lanes.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(replacement)) });
  await expect(page.getByText('Imported caption')).toBeVisible();
  await expect(page.locator('.utterance')).toHaveCount(1);
});

test('limits typed captions to 240 characters and ignores blanks @claim:typed-limit', async ({ page }) => {
  await page.goto('/demo');
  const input = page.getByLabel(/Type a caption/);
  const startingCount = await page.locator('.utterance').count();
  await input.fill('   ');
  await page.getByRole('button', { name: 'Add to lane' }).click();
  await expect(page.locator('.utterance')).toHaveCount(startingCount);
  await input.fill('x'.repeat(241));
  await expect(input).toHaveValue('x'.repeat(240));
  await page.getByRole('button', { name: 'Add to lane' }).click();
  await expect(page.locator('.utterance')).toHaveCount(startingCount + 1);
});

test('hides confidence below 60 percent and keeps the boundary @claim:confidence-filter', async ({ page }) => {
  const transcript = { captions: [
    { id: 'below', lane: 'left', text: 'Hidden below threshold', confidence: .59, createdAt: '2026-08-30T11:00:00.000Z', source: 'speech' },
    { id: 'boundary', lane: 'left', text: 'Visible at threshold', confidence: .6, createdAt: '2026-08-30T11:00:01.000Z', source: 'speech' }
  ] };
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Open settings' }).click();
  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('#importFile').setInputFiles({ name: 'confidence.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(transcript)) });
  await page.getByLabel('Hide uncertain captions').check();
  await expect(page.getByText('Hidden below threshold')).toHaveCount(0);
  await expect(page.getByText('Visible at threshold')).toBeVisible();
});

test('requires browser-confirmed local speech mode @claim:local-speech', async ({ page }) => {
  await page.addInitScript(() => {
    const state = { mode: 'unsupported', captured: false, microphoneCalls: 0 };
    Object.defineProperty(window, '__speechClaimState', { value: state });
    class Recognition extends EventTarget {
      continuous = false;
      interimResults = false;
      lang = '';
      onresult = null;
      onerror = null;
      onend = null;
      constructor() {
        super();
        if (state.mode === 'supported') Object.defineProperty(this, 'processLocally', { configurable: true, writable: true, value: false });
      }
      static async available() { return 'available'; }
      start() { state.captured = (this as Recognition & { processLocally?: boolean }).processLocally === true; throw new Error('stop after capture'); }
      stop() {}
      abort() {}
    }
    Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: Recognition });
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: async () => { state.microphoneCalls += 1; throw new Error('unexpected'); } } });
  });
  await page.goto('/demo');
  await startForReal(page);
  await page.getByLabel('Everyone here agrees to live captions.').check();
  await page.getByRole('button', { name: 'Start captions' }).click();
  await expect(page.getByText(/cannot guarantee on-device speech/)).toBeVisible();
  expect(await page.evaluate(() => (window as typeof window & { __speechClaimState: { microphoneCalls: number } }).__speechClaimState.microphoneCalls)).toBe(0);

  await page.evaluate(() => { (window as typeof window & { __speechClaimState: { mode: string; captured: boolean } }).__speechClaimState.mode = 'supported'; });
  await page.getByRole('button', { name: 'End captions' }).click();
  await page.getByRole('button', { name: 'Start captions' }).click();
  expect(await page.evaluate(() => (window as typeof window & { __speechClaimState: { captured: boolean } }).__speechClaimState.captured)).toBe(true);
});

test('shows the $24 one-time Plus offer and caches a four-lane license daily @claim:plus-license', async ({ page }) => {
  let verificationRequests = 0;
  await page.unroute('https://api.sociobot.in/**');
  await page.route('https://api.sociobot.in/**', (route) => {
    verificationRequests += 1;
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{"valid":true,"reason":"ok"}' });
  });
  await page.goto('/demo');
  await startForReal(page);
  await expect(page.locator('.plus-section')).toContainText('Plus costs $24 once.');
  await page.getByRole('button', { name: 'View Plus details' }).click();
  await expect(page.getByRole('link', { name: 'Buy Caption Lanes Plus' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/speaker-lane-captions/checkout');
  await page.getByLabel('Have a license? Paste it here.').fill('test-license');
  await page.getByRole('button', { name: 'Restore license' }).click();
  await expect(page.getByText('Plus is active on this device.')).toBeVisible();
  await page.getByRole('button', { name: 'Close upgrade' }).click();
  await page.getByRole('button', { name: 'Explore with typed captions' }).click();
  await expect(page.locator('.lane')).toHaveCount(4);
  expect(verificationRequests).toBe(1);
  await page.reload();
  await page.getByRole('button', { name: 'Explore with typed captions' }).click();
  await expect(page.locator('.lane')).toHaveCount(4);
  expect(verificationRequests).toBe(1);
});

test('keeps the audience, action, and three facts inside the first viewport', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Place live captions by speaker direction.');
  await expect(page.getByText('For Deaf and hard-of-hearing people who need to follow small, in-person conversations.')).toBeVisible();
  const action = page.getByRole('link', { name: 'Try it with sample data' });
  const facts = page.locator('.hero-facts');
  await expect(action).toBeVisible();
  await expect(facts.locator('li')).toHaveCount(3);
  const viewport = page.viewportSize()!;
  const actionBox = await action.boundingBox();
  const factsBox = await facts.boundingBox();
  expect(actionBox!.y + actionBox!.height).toBeLessThanOrEqual(viewport.height);
  expect(factsBox!.y + factsBox!.height).toBeLessThanOrEqual(viewport.height);
  await action.click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.locator('.utterance')).toHaveCount(6);
});

test('waits for recorded consent before starting speech or microphone access @claim:consent-before-microphone', async ({ page }) => {
  await page.addInitScript(() => {
    const state = { recognitionStarts: 0, microphoneCalls: 0 };
    Object.defineProperty(window, '__consentState', { value: state });
    class Recognition extends EventTarget {
      continuous = false; interimResults = false; lang = ''; processLocally = false;
      onresult = null; onerror = null; onend = null;
      static async available() { return 'available'; }
      start() { state.recognitionStarts += 1; }
      stop() {} abort() {}
    }
    const track = { getSettings: () => ({ channelCount: 1 }), stop() {} };
    Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: Recognition });
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: async () => {
      state.microphoneCalls += 1;
      return { getAudioTracks: () => [track], getTracks: () => [track] };
    } } });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Start captions' }).click();
  expect(await page.evaluate(() => (window as typeof window & { __consentState: object }).__consentState)).toEqual({ recognitionStarts: 0, microphoneCalls: 0 });
  await page.getByLabel('Everyone here agrees to live captions.').check();
  await page.getByRole('button', { name: 'Start captions' }).click();
  await expect.poll(() => page.evaluate(() => (window as typeof window & { __consentState: { microphoneCalls: number } }).__consentState.microphoneCalls)).toBe(1);
  expect(await page.evaluate(() => (window as typeof window & { __consentState: { recognitionStarts: number } }).__consentState.recognitionStarts)).toBe(1);
});

test('stops microphone tracks on pause, end, navigation, background, and close @claim:microphone-lifecycle', async ({ page }) => {
  await page.addInitScript(() => {
    const state = { calls: 0, stops: 0 };
    Object.defineProperty(window, '__lifecycleState', { value: state });
    class Recognition extends EventTarget {
      continuous = false; interimResults = false; lang = ''; processLocally = false;
      onresult = null; onerror = null; onend = null;
      static async available() { return 'available'; }
      start() {} stop() {} abort() {}
    }
    Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: Recognition });
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: async () => {
      state.calls += 1;
      const track = { getSettings: () => ({ channelCount: 1 }), stop: () => { state.stops += 1; } };
      return { getAudioTracks: () => [track], getTracks: () => [track] };
    } } });
  });
  await page.goto('/');
  const start = async () => {
    await page.getByLabel('Everyone here agrees to live captions.').check();
    await page.getByRole('button', { name: 'Start captions' }).click();
    await expect.poll(() => page.evaluate(() => (window as typeof window & { __lifecycleState: { calls: number } }).__lifecycleState.calls)).toBeGreaterThan(0);
  };
  await start();
  await page.getByRole('button', { name: 'Pause' }).click();
  await expect.poll(() => page.evaluate(() => (window as typeof window & { __lifecycleState: { stops: number } }).__lifecycleState.stops)).toBe(1);
  await page.getByRole('button', { name: 'Resume' }).click();
  await expect.poll(() => page.evaluate(() => (window as typeof window & { __lifecycleState: { calls: number } }).__lifecycleState.calls)).toBe(2);
  await page.getByRole('button', { name: 'End captions' }).click();
  await expect.poll(() => page.evaluate(() => (window as typeof window & { __lifecycleState: { stops: number } }).__lifecycleState.stops)).toBe(2);
  await start();
  await page.getByRole('link', { name: 'Demo' }).first().click();
  await expect.poll(() => page.evaluate(() => (window as typeof window & { __lifecycleState: { stops: number } }).__lifecycleState.stops)).toBe(3);
  await startForReal(page);
  await start();
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(() => page.evaluate(() => (window as typeof window & { __lifecycleState: { stops: number } }).__lifecycleState.stops)).toBe(4);
  await page.getByRole('button', { name: 'End captions' }).click();
  await start();
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide')));
  await expect.poll(() => page.evaluate(() => (window as typeof window & { __lifecycleState: { stops: number } }).__lifecycleState.stops)).toBe(5);
});

test('uses no account, analytics, or archive service in demo, real typed, or licensed mode @claim:no-accounts-analytics-archive', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/demo');
  await page.getByLabel(/Type a caption/).fill('Demo privacy check');
  await page.getByRole('button', { name: 'Add to lane' }).click();
  await startForReal(page);
  await page.getByRole('button', { name: 'Explore with typed captions' }).click();
  await page.getByLabel(/Type a caption/).fill('Real privacy check');
  await page.getByRole('button', { name: 'Add to lane' }).click();
  await page.getByRole('button', { name: 'View Caption Lanes Plus' }).click();
  await page.getByLabel('Have a license? Paste it here.').fill('privacy-fixture');
  await page.getByRole('button', { name: 'Restore license' }).click();
  await expect(page.getByText('This license is no longer active.')).toBeVisible();
  const external = requests.filter((url) => new URL(url).origin !== origin);
  expect(external).toHaveLength(1);
  expect(external[0]).toMatch(/^https:\/\/api\.sociobot\.in\/api\/v1\/products\/speaker-lane-captions\/verify\?license=/);
  await expect(page.locator('input[type="email"], input[name*="account" i]')).toHaveCount(0);
});

test('stores caption direction and text without identity or voiceprint fields @claim:no-identity-inference', async ({ page }) => {
  await page.goto('/demo');
  await page.getByLabel(/Type a caption/).fill('A direction is not a person');
  await page.getByRole('button', { name: 'Add to lane' }).click();
  const rows = await databaseEntries(page, 'demo:caption-lanes');
  expect(rows).toHaveLength(7);
  for (const row of rows) {
    expect(Object.keys(row).sort()).toEqual(['confidence', 'createdAt', 'id', 'lane', 'source', 'text']);
    expect(JSON.stringify(row)).not.toMatch(/identity|voiceprint|speakerId|personId/i);
  }
});

test('shows the mono limitation while manual placement remains usable @claim:mono-input', async ({ page }) => {
  await page.addInitScript(() => {
    class Recognition extends EventTarget {
      continuous = false; interimResults = false; lang = ''; processLocally = false;
      onresult = null; onerror = null; onend = null;
      static async available() { return 'available'; }
      start() {} stop() {} abort() {}
    }
    const track = { getSettings: () => ({ channelCount: 1 }), stop() {} };
    Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: Recognition });
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: async () => ({ getAudioTracks: () => [track], getTracks: () => [track] }) } });
  });
  await page.goto('/');
  await page.getByLabel('Everyone here agrees to live captions.').check();
  await page.getByRole('button', { name: 'Start captions' }).click();
  await expect(page.getByText(/one audio channel, so automatic direction is limited/)).toBeVisible();
  await page.getByRole('button', { name: /→ Right shortcut 3/ }).click();
  await page.getByLabel(/Type a caption/).fill('Placed on a mono device');
  await page.getByRole('button', { name: 'Add to lane' }).click();
  await expect(page.locator('.lane[data-id="right"]')).toContainText('Placed on a mono device');
});

test('installs a browser-offered on-device language pack before recognition @claim:language-pack-flow', async ({ page }) => {
  await page.addInitScript(() => {
    const state = { installed: false, started: false };
    Object.defineProperty(window, '__languagePackState', { value: state });
    class Recognition extends EventTarget {
      continuous = false; interimResults = false; lang = ''; processLocally = false;
      onresult = null; onerror = null; onend = null;
      static async available() { return 'downloadable'; }
      static async install() { state.installed = true; return true; }
      start() { state.started = state.installed; } stop() {} abort() {}
    }
    Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: Recognition });
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: async () => { throw new Error('stop after recognition'); } } });
  });
  await page.goto('/');
  await page.getByLabel('Everyone here agrees to live captions.').check();
  await page.getByRole('button', { name: 'Start captions' }).click();
  await expect.poll(() => page.evaluate(() => (window as typeof window & { __languagePackState: { started: boolean } }).__languagePackState.started)).toBe(true);
  expect(await page.evaluate(() => (window as typeof window & { __languagePackState: { installed: boolean } }).__languagePackState.installed)).toBe(true);
});

test('keeps typed captions, display controls, and transcript transfer free @claim:free-core-controls', async ({ page }) => {
  await page.goto('/');
  expect(await page.evaluate(() => localStorage.getItem('sb_license:speaker-lane-captions'))).toBeNull();
  await page.getByRole('button', { name: 'Explore with typed captions' }).click();
  await page.getByLabel(/Type a caption/).fill('Free caption');
  await page.getByRole('button', { name: 'Add to lane' }).click();
  await page.getByRole('button', { name: 'Open settings' }).click();
  await page.getByLabel('Caption size 24 px').fill('32');
  await page.getByLabel('Hide uncertain captions').check();
  await page.getByRole('button', { name: 'Unlock lane color' }).first().click();
  await expect(page.getByRole('button', { name: 'Lock lane color' }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Close settings' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export transcript' }).click();
  const download = await downloadPromise;
  const downloadPath = await download.path();
  expect(downloadPath).not.toBeNull();
  expect(JSON.parse(await readFile(downloadPath!, 'utf8'))).toBeTruthy();
  await expect(page.locator('.lane')).toHaveCount(3);
});

test('restores one valid license in a fresh browser context @claim:license-portability', async ({ browser }) => {
  for (let index = 0; index < 2; index += 1) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.route('https://api.sociobot.in/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"valid":true,"reason":"ok"}' }));
    await page.goto(origin);
    await page.getByRole('button', { name: 'View Caption Lanes Plus' }).click();
    await page.getByLabel('Have a license? Paste it here.').fill('portable-license');
    await page.getByRole('button', { name: 'Restore license' }).click();
    await expect(page.getByText('Plus is active on this device.')).toBeVisible();
    await page.getByRole('button', { name: 'Close upgrade' }).click();
    await page.getByRole('button', { name: 'Explore with typed captions' }).click();
    await expect(page.locator('.lane')).toHaveCount(4);
    await context.close();
  }
});

test('rechecks a cached license when the device reconnects @claim:license-reconnect', async ({ page }) => {
  let requests = 0;
  await page.unroute('https://api.sociobot.in/**');
  await page.route('https://api.sociobot.in/**', (route) => {
    requests += 1;
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{"valid":false,"reason":"revoked"}' });
  });
  await page.addInitScript(() => {
    localStorage.setItem('sb_license:speaker-lane-captions', 'cached-license');
    localStorage.setItem('sb_license:speaker-lane-captions:verdict', JSON.stringify({ valid: true, checkedAt: Date.now() }));
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore with typed captions' }).click();
  await expect(page.locator('.lane')).toHaveCount(4);
  expect(requests).toBe(0);
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  await expect.poll(() => requests).toBe(1);
  await expect(page.locator('.lane')).toHaveCount(3);
});

test('keeps card fields out of the app and redirects five buy requests to hosted checkout @claim:hosted-checkout', async ({ page, request }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'View Caption Lanes Plus' }).click();
  await expect(page.locator('input[autocomplete="cc-number"], input[name*="card" i]')).toHaveCount(0);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await request.get('https://api.sociobot.in/api/v1/products/speaker-lane-captions/checkout', { maxRedirects: 0 });
    expect(response.status(), `checkout attempt ${attempt + 1}`).toBe(303);
    expect(response.headers().location, `checkout attempt ${attempt + 1}`).toMatch(/^https:\/\/checkout\.dodopayments\.com\//);
  }
});

test('removes Plus features after recorded revoked and refunded verdicts @claim:revoked-license', async ({ page }) => {
  let valid = true;
  let inactiveReason = 'revoked';
  await page.unroute('https://api.sociobot.in/**');
  await page.route('https://api.sociobot.in/**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ valid, reason: valid ? 'ok' : inactiveReason })
  }));
  await page.goto('/');
  await page.getByRole('button', { name: 'View Caption Lanes Plus' }).click();
  await page.getByLabel('Have a license? Paste it here.').fill('later-revoked');
  await page.getByRole('button', { name: 'Restore license' }).click();
  await expect(page.getByText('Plus is active on this device.')).toBeVisible();
  await page.getByRole('button', { name: 'Close upgrade' }).click();
  await page.getByRole('button', { name: 'Explore with typed captions' }).click();
  await page.getByRole('button', { name: /↗ Across shortcut 4/ }).click();
  await expect(page.getByRole('button', { name: /↗ Across shortcut 4/ })).toHaveAttribute('aria-pressed', 'true');
  valid = false;
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  await expect(page.locator('.lane')).toHaveCount(3);
  await expect(page.getByRole('button', { name: /↑ Centre shortcut 2/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('Across closed because Plus is inactive. Centre is now selected.')).toBeVisible();
  await page.getByLabel(/Type a caption/).fill('Visible after revocation');
  await page.getByRole('button', { name: 'Add to lane' }).click();
  await expect(page.locator('.lane[data-id="center"]')).toContainText('Visible after revocation');
  const stored = await databaseEntries(page, 'caption-lanes');
  expect(stored.find((entry) => entry.text === 'Visible after revocation')?.lane).toBe('center');

  // A refund is represented by the same inactive capability state and must
  // close Plus without waiting for a new browser or a fresh purchase flow.
  valid = true;
  inactiveReason = 'ok';
  await page.getByRole('button', { name: 'View Caption Lanes Plus' }).click();
  await page.getByLabel('Have a license? Paste it here.').fill('later-refunded');
  await page.getByRole('button', { name: 'Restore license' }).click();
  await expect(page.getByText('Plus is active on this device.')).toBeVisible();
  await page.getByRole('button', { name: 'Close upgrade' }).click();
  await expect(page.locator('.lane')).toHaveCount(4);
  inactiveReason = 'refunded';
  valid = false;
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  await expect(page.locator('.lane')).toHaveCount(3);
  await expect(page.getByText('Across closed because Plus is inactive. Centre is now selected.')).toBeVisible();
});
