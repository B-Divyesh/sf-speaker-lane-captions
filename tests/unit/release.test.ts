// @vitest-environment node
import { readFile, readdir } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('static release policy', () => {
  it('ships restrictive browser policy and immutable asset caching', async () => {
    const config = JSON.parse(await readFile('public/staticwebapp.config.json', 'utf8')) as {
      globalHeaders: Record<string, string>;
      navigationFallback?: unknown;
      responseOverrides: Record<string, { rewrite: string }>;
      routes: Array<{ route: string; rewrite?: string; headers?: Record<string, string> }>;
    };

    expect(config.globalHeaders['Content-Security-Policy']).toContain("default-src 'self'");
    expect(config.globalHeaders['Content-Security-Policy']).toContain("frame-ancestors 'none'");
    expect(config.globalHeaders['Permissions-Policy']).toContain('microphone=(self)');
    expect(config.globalHeaders['X-Frame-Options']).toBe('DENY');
    expect(config.routes.find(({ route }) => route === '/assets/*')?.headers?.['Cache-Control']).toBe('public, max-age=31536000, immutable');
    expect(config.routes.find(({ route }) => route === '/sw.js')?.headers?.['Cache-Control']).toBe('no-cache');
    expect(config.routes.find(({ route }) => route === '/demo')?.rewrite).toBe('/index.html');
    expect(config.navigationFallback).toBeUndefined();
    expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html' });
  });

  it('ships the required metadata, route structure, and legal skip links', async () => {
    const [home, privacy, terms, notFound, sitemap] = await Promise.all([
      readFile('index.html', 'utf8'),
      readFile('privacy/index.html', 'utf8'),
      readFile('terms/index.html', 'utf8'),
      readFile('404.html', 'utf8'),
      readFile('public/sitemap.xml', 'utf8')
    ]);
    expect(home).toContain('<link rel="canonical"');
    expect(home).toContain('property="og:image"');
    expect(home).toContain('name="twitter:card"');
    expect(home).toContain('social-1200x630.webp');
    expect(home).toContain('id="how-it-works"');
    expect(home).toContain('Privacy and limits');
    expect(home).toContain('Plus costs $24 once.');
    expect(home).toContain('Built by Param Factory · v1.0.0 · polish 2');
    for (const route of [privacy, terms, notFound]) {
      expect(route).toContain('class="skip-link" href="#main"');
      expect(route).toContain('property="og:type"');
      expect(route).toContain('property="og:url"');
      expect(route).toContain('name="twitter:title"');
      expect(route).toContain('name="twitter:description"');
      expect(route).toContain('name="twitter:image"');
      expect(route).toContain('rel="apple-touch-icon"');
      expect(route).toContain('aria-label="Main navigation"');
      expect(route).toContain('Built by Param Factory · v1.0.0 · polish 2');
    }
    expect(notFound).toContain('<title>Page not found — Caption Lanes</title>');
    expect(notFound).toContain('<main id="main"');
    expect(sitemap).toContain('/demo</loc>');
  });

  it('lists each public claim with exactly one tagged sandbox test', async () => {
    const claims = JSON.parse(await readFile('.factory/claims.json', 'utf8')) as Array<{ id: string; claim: string; where: string; test: string; sandbox: string }>;
    const testFiles = (await readdir('tests/e2e')).filter((name) => name.endsWith('.spec.ts'));
    const testSource = (await Promise.all(testFiles.map((name) => readFile(`tests/e2e/${name}`, 'utf8')))).join('\n')
      + '\n' + await readFile('android/app/src/androidTest/java/in/sociobot/speakerlanecaptions/NativeCaptionBridgeTest.java', 'utf8');
    expect(claims.length).toBeGreaterThan(0);
    expect(new Set(claims.map(({ id }) => id)).size).toBe(claims.length);
    for (const claim of claims) {
      expect(claim.claim.length).toBeGreaterThan(0);
      expect(claim.where.length).toBeGreaterThan(0);
      expect(claim.sandbox.length).toBeGreaterThan(0);
      const expectedCommand = claim.id === 'android-native-caption-path'
        ? 'npm run test:android'
        : `npm run test:e2e -- --grep @claim:${claim.id}`;
      expect(claim.test).toBe(expectedCommand);
      expect(testSource.match(new RegExp(`@claim:${claim.id}(?![\\w-])`, 'g'))).toHaveLength(1);
    }
    const copyAudit = await readFile('.factory/copy-audit.md', 'utf8');
    expect(copyAudit).toContain('No sentence exceeds 22 words. No flagged wording remains.');
    expect(copyAudit).not.toContain('| Flag |');
  });

  it('keeps the Android claim portable and packages its direction regression evidence', async () => {
    const [packageJson, androidRunner, workflow, plugin, directionTest] = await Promise.all([
      readFile('package.json', 'utf8'),
      readFile('scripts/test-android.mjs', 'utf8'),
      readFile('.github/workflows/android-package.yml', 'utf8'),
      readFile('android/app/src/main/java/in/sociobot/speakerlanecaptions/NativeCaptionPlugin.java', 'utf8'),
      readFile('android/app/src/test/java/in/sociobot/speakerlanecaptions/DirectionEstimatorTest.java', 'utf8')
    ]);
    expect(packageJson).toContain('"test:android": "node scripts/test-android.mjs"');
    expect(androidRunner).toContain('verifyHostedAndroidEvidence');
    expect(androidRunner).toContain(':app:testDebugUnitTest');
    expect(workflow).toContain('actions/setup-java@v4');
    expect(workflow).toContain('android-actions/setup-android@v3');
    expect(workflow).toContain(':app:connectedDebugAndroidTest');
    expect(workflow).toContain('android-apks-${{ github.sha }}');
    expect(plugin).toContain('startDirectionTracking()');
    expect(plugin).toContain('event.put("direction", direction.lane)');
    expect(plugin).toContain('event.put("directionConfidence", direction.confidence)');
    expect(directionTest).toContain('classifiesLeftCentreAndRightWithConfidence');
    expect(directionTest).toContain('exposesManualFallbackForMonoOrUnavailableInput');
  });
});
