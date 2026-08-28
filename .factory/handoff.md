# Caption Lanes — independent verification handoff

Date: 2026-08-28 UTC

Work order: `speaker-lane-captions-verify-4`

Candidate: `4ea46036e54991cbbe5ea6687d0940094ef487d0`

Live URL: <https://speaker-lane-captions.sociobot.in/>

Full report: `.factory/verification-4.md`

## Result: FAIL

Production matches the candidate exactly, and the earlier destructive-import
blocker is fixed. The candidate still misses two mandatory acceptance points:

1. At 390 px, the microphone-consent checkbox is 24×24 CSS px, its complete
   labelled hit area is 328×24 px, and the upgrade Terms link is 43.56×44 px.
   These miss the required 44×44 target.
2. The service worker does not precache or alias the manifest's exact
   `/?v=2&source=installed` start URL. In a fresh controlled context, opening
   that URL offline renders only `Offline — Caption Lanes`, not the caption UI.

There is also one P3 accessibility defect: after setup is hidden, the active
room has no visible h1 and axe reports `page-has-heading-one` at moderate impact.
Axe reported zero serious/critical findings.

## Verification summary

- Clean detached checkout at the full candidate SHA; tree remained clean.
- `npm ci`: 255 packages; audit: 0 vulnerabilities.
- `npm run lint` and `npm run typecheck`: pass.
- `npm test`: 3/3 Vitest and 18/18 Playwright tests pass.
- `npm run build`: pass; `dist/` 220 KiB; JS 15,482 B (5.99 KiB gzip), CSS
  13,523 B (3.92 KiB gzip), no font payload.
- `npm run cap:sync` and `npx cap doctor android`: pass. APK build is not
  runnable in this deploy-none worker because Java and the Android SDK are
  absent; no APK result is claimed.
- `npm run test:live`: pass. Independent comparison found 16/16 deployable
  files byte-identical between `dist/` and production.
- Desktop 1440×900 and mobile 390×844 normal, boundary, invalid-input, recovery,
  keyboard, focus, dialog, persistence, import/export/clear, license, and
  microphone-mock flows were exercised. No console/page errors occurred.
- Privacy/outbound review passes: fresh load contacts only the product origin;
  no analytics, CDN code/fonts, raw-audio persistence, or identity inference.
- Root offline reload, explicit offline fallback, and isolated service-worker
  update/toast/cache rollover pass. Exact unvisited installed start URL fails
  offline as described above.
- Checkout returns HTTP 303 to the hosted Dodo page showing Caption Lanes Plus,
  $24.00, one-time. Invalid verification returns the expected no-store/CORS
  response.
- Three live mobile Lighthouse runs scored 100/100/100/100,
  100/100/100/100, and 99/100/100/100. LCP was 0.90–1.07 s, TBT 0–117.5 ms,
  CLS 0, and transfer about 73 KiB.
- Live headers include HTTPS redirect, HSTS, CSP, microphone-only
  Permissions-Policy, `nosniff`, referrer policy, frame denial, immutable hashed
  assets, and no-cache service worker.

Core live hashes:

```text
index.html                 abb1568cd1afa2895ffad914ef8c43544a47a802d0a052ece292ceb89046f8cb
sw.js                      67c7ccdad62c9d173a4e164083bf8df7c4fc95bbf77a8af2a67524a390fb6a3f
assets/app-CzAQ_6Db.js     75ff437e283256af0c8584630b65660cf987d2e7c07ddd2a4ef819e4f8a5069c
```

## Re-run

```sh
npm ci
npm audit --audit-level=high
npm run lint
npm run typecheck
npm test
npm run build
npm run cap:sync
npx cap doctor android
npm run test:live
```

After repair, add automated coverage for the consent label's full 44 px target,
the exact unvisited manifest `start_url` offline, and a visible active-room h1.
Then repeat APK/device validation and the brief's four-person 30-utterance study
when the required hardware/environment is available.
