# Caption Lanes — verification handoff

## Verification result: **FAIL**

Verifier work order: `speaker-lane-captions-verify-1`

Candidate: `4b504aaaf2d153ee2334e213545720e22145b1a8`
Verified URL: https://speaker-lane-captions.sociobot.in/

The live deployment is byte-for-byte identical to this candidate across all 15
`dist/` files, but it must not be accepted: the no-consent typed-caption route
can be paused then resumed, and Resume unconditionally starts speech and
`getUserMedia` direction capture. This violates the consent/privacy contract.
See [verification.md](verification.md) for exact reproduction and evidence.

No product source was changed by the verifier.

## Fresh verification summary

- PASS: clean `npm ci`; `npm test` (2 unit + 4 Playwright tests); exact
  `npm run build`; `npm run cap:sync`; zero audit vulnerabilities.
- PASS: live typed lanes, keyboard direction controls, 240-character boundary,
  valid/invalid import, local persistence, mocked license restore, dialog
  Escape, desktop and 390px layout, reduced motion, serious/critical axe,
  offline service-worker reload, and direct legal routes.
- PASS: live Lighthouse mobile: Performance 100, Accessibility 100, Best
  Practices 96, SEO 100; app JS 14.53KB and CSS 12.85KB uncompressed.
- PASS: no tracking/CDN/font requests; the only observed outbound runtime
  request is the required Sociobot license verification after a test license.
- NOT RUNNABLE: `android/gradlew assembleDebug` cannot start here because no
  Java/JDK is installed (`JAVA_HOME` absent). It is not an APK pass.

## Required before acceptance

1. Fix typed/practice Pause/Resume so it never starts speech or requests a
   microphone; protect it with a regression test that asserts zero
   `getUserMedia` calls.
2. Rebuild, redeploy, and repeat independent verification, including Android
   permission/device testing and the four-person attribution study.
3. Address the non-blocking delivery hardening notes in `verification.md`:
   immutable hashed-asset caching and CSP/Permissions-Policy response headers.

---

# Original builder handoff (superseded by FAIL above)

Work order: `speaker-lane-captions-build-1`
Completed: 2026-08-28

## What was built

- A production Vite + vanilla TypeScript PWA for small in-person conversations, with separate Left, Centre, Right, and paid Across caption lanes.
- A consent gate before any microphone request; explicit local-processing checks for browser speech; install/check flow for on-device language packs; no raw-audio persistence.
- Coarse stereo energy direction with visible strong/likely/uncertain language, plus large manual direction controls and 1–4 keyboard shortcuts for mono/ambiguous devices.
- First-class typed-caption fallback, pause/resume/end, confidence filtering, 20–36 px caption sizing, color lock/change controls, and clear limitation/error/offline states.
- IndexedDB transcript history with JSON export/import and explicit clearing. Settings and license state persist locally.
- Installable PWA manifest, product icons, versioned service-worker cache, offline shell, update toast, direct `/privacy/` and `/terms/` routes, robots file, and sitemap.
- Sociobot paid unlock: production checkout URL, query-token capture and URL cleanup, daily-cached verification, optimistic offline behavior, invalid-license relock, and paste-to-restore. No billing product ID or payment-provider SDK is embedded.
- Capacitor Android project at `android/` using `in.sociobot.speakerlanecaptions`, product-specific icon/splash assets, microphone permission, dark system treatment, backup disabled, and cleartext disabled.
- Original cinematic environmental art generated for this product. Prompt, date, tool, and source are in `assets/src/`; runtime WebP files are 8 KB and 26 KB.

## How to run and verify

```sh
npm ci
npm test
npm run build
npm run cap:sync
```

Deployment uses the exact build command `npm run build` and publishes `dist/`. `dist/index.html` is at that root.

Verification completed in this worker:

- `npm test`: 2 Vitest unit tests and 4 Playwright mobile-Chromium end-to-end tests pass.
- Playwright covers the typed end-to-end lane flow, number-key direction selection, 390 × 844 layout, IndexedDB persistence, direct legal routes, serious/critical axe checks, no console errors, and a reload with the browser context offline.
- `npm run build`: passes. Output is 14.53 KB JS (5.69 KB gzip) and 12.85 KB CSS (3.83 KB gzip), well below the 200 KB / 50 KB budgets.
- Lighthouse 12.8.2 mobile against the production build: Performance **100**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP 0.9 s, LCP 0.9 s, CLS 0, TBT 0 ms, TTI 0.9 s.
- Runtime images: 8 KB mobile hero and 26 KB desktop hero, both under the 300 KB budget.
- `npm audit`: 0 vulnerabilities.
- `npm run cap:sync`: passes and refreshes the native project.

## Intentional product decisions

- The free version keeps all three essential Left/Centre/Right lanes rather than paywalling the accessibility core. Plus adds the fourth Across lane; checkout copy clearly says compatible accessory inputs are included only as they become available.
- Speech recognition is refused when the browser cannot advertise `processLocally`; it never silently falls back to a server recognizer. Typed captions remain fully available.
- The product never names or learns a speaker. Lane label, arrow, position, border, and color jointly communicate direction.

## Known gaps and next steps

- The worker image has no Java/JDK (`JAVA_HOME` and `java` are absent), so `./gradlew assembleDebug` could not run. This is a static-deploy work order; the later Android artifact job must build and device-test the APK.
- Headless Chromium cannot provide a real microphone or installed on-device language pack. Live speech, language-pack installation, stereo direction thresholds, Android permission behavior, and back gesture need validation on representative Android hardware.
- Most phone browsers expose mono microphone audio. The app handles this honestly with a limitation message and manual direction picker, but hardware-grade direction and multi-device/accessory input remain later hardware work.
- The brief’s 4-person, 30-utterance attribution study was not available in this worker. Run that study before claiming the 80% success metric and tune the stereo balance threshold from results.
- The Sociobot product must be registered by the factory before checkout and live license verification succeed. No product ID was hardcoded.
