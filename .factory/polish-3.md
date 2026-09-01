# Caption Lanes polish 3

Date: 2026-09-01 UTC

Base review: `f0e10408d8fcbe0847dae64b36887bc0dcc7d5a0`

Repair commit: `1c11f7093abbdeb9f24e05705d172006905e700d`

## Finding map

The live URL in every row is <https://speaker-lane-captions.sociobot.in/>.
Cold-live screenshots are [home](evidence/polish-3/live-mobile-home.png),
[demo](evidence/polish-3/live-mobile-demo.png), and
[verify-url mobile](evidence/polish-3/verify-live/screenshot-mobile.png).

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the hosted Sociobot/Dodo checkout link and retry guidance. | `@claim:hosted-checkout`, `npm run test:live`; live checkout checks passed ten 303 redirects. |
| F-1-2 | Added the Android native on-device caption bridge, direction estimator, and packaged bridge test. | `@claim:android-native-caption-path` / `npm run test:android`; live URL cold check passed. |
| F-1-3 | Gated microphone access behind consent and stop tracks on every exit path. | `@claim:consent-before-microphone`, `@claim:microphone-lifecycle`; demo screenshot above. |
| F-1-4 | Kept account, analytics, archive, identity, and voiceprint behavior separate and testable. | `@claim:no-accounts-analytics-archive`, `@claim:no-identity-inference`; cold live request log had only the site origin. |
| F-1-5 | Kept mono warning/manual placement and conditional language-pack installation covered. | `@claim:mono-input`, `@claim:language-pack-flow`; live demo screenshot above. |
| F-1-6 | Kept typed input, display controls, filtering, and export free. | `@claim:free-core-controls`; live demo screenshot above. |
| F-1-7 | Kept fresh-browser license restore and reconnect recheck behavior covered. | `@claim:license-portability`, `@claim:license-reconnect`; live URL checked after deployment. |
| F-1-8 | Expanded the claim inventory and retained one tagged sandbox test for every public product claim. | `tests/unit/release.test.ts` “lists each public claim”; all 24 listed commands passed from a clean clone. |
| F-1-9 | Kept History API routing, focused route headings, and polite route announcements. | `moves focus, announces titles, and restores routes with browser history`; cold live Back/Forward check passed. |
| F-1-10 | Kept shared Demo and Privacy header links plus the full footer on every route. | `legal and not-found pages are direct-loadable and accessible`; live mobile routes checked. |
| F-1-11 | Kept complete route metadata, canonical URLs, and icons on legal and not-found pages. | `serves complete route-specific metadata on direct routes`; cold live direct-route check passed. |
| F-1-12 | Kept literal, out-of-context headings. | `tests/unit/release.test.ts` route policy; live 404 title and heading checked. |
| F-1-13 | Kept controls named for their actions and results. | `all visible mobile controls have at least 44px touch targets`; live mobile screenshots above. |
| F-1-14 | Kept user terms such as transcript, separate store, and recheck wording. | `.factory/copy-audit.md`; `tests/unit/release.test.ts` passed. |
| F-2-1 | Demo entry and reset force a three-lane sample with default settings, independent of a real Plus license. | `@claim:demo-isolation`; cold live one-click demo/reset check passed. |
| F-2-2 | Kept the native Android bridge and emulator/package evidence required for the Android artifact. | `@claim:android-native-caption-path` / `npm run test:android`; retained APK evidence verified. |
| F-2-3 | Removed the unprovable refund-handler promise from the dialog and test both revoked and refunded inactive licenses. | `@claim:revoked-license`, `@claim:hosted-checkout`; live checkout check passed. |
| F-2-4 | Replaced storage jargon with “delete the sample changes.” | `.factory/copy-audit.md`; README reviewed in the clean clone. |
| F-2-5 | Kept both Demo and Privacy links visible at 390 px on every route. | `works at 390px and restores local captions`; live mobile route checks passed. |
| F-3-1 | Split the two 24–25-word Android README sentences into five sentences of 4–13 words. Updated the copy audit and release marker to polish 3. | `keeps the repaired Android README sentences within the plain-language limit`; [verify-url desktop](evidence/polish-3/verify-live/screenshot-desktop.png); live URL cold check passed. |

## Verification

- Fresh clone at repair commit `1c11f70`: `npm ci` completed with zero audit vulnerabilities.
- Every exact command in `.factory/claims.json` passed from that clone: 23 browser claim commands in desktop and 390 px projects, plus `npm run test:android`.
- The Android command found no local complete toolchain and verified the matching successful Android package run at `f0e10408d8fcbe0847dae64b36887bc0dcc7d5a0` and retained `android-apks-f0e10408d8fcbe0847dae64b36887bc0dcc7d5a0` artifact.
- Fresh clone: `npm test` passed 6 unit tests and 84 Playwright tests. The final workspace adds the F-3-1 regression; its `npm test` passed 7 unit tests and 84 Playwright tests.
- `npm run lint`, `npm run typecheck`, `npm run build`, and `npm audit --audit-level=high` passed. Build output is 29.61 kB JavaScript (10.70 kB gzip) and 17.50 kB CSS (4.74 kB gzip).
- Production deploy: `swa deploy ./dist --app-name sf-speaker-lane-captions --env production` completed. `npm run test:live` then passed deployed artifact hashes, favicon, 404, policy headers, and ten checkout redirects.
- `/opt/fleet/lib/verify-url.sh` passed on production; report: [verify.json](evidence/polish-3/verify-live/verify.json).
- Cold live Playwright checks passed at 390 × 844 for first-screen fit, direct `?demo=1`, one-click demo, Reset demo, Back/Forward focus, legal metadata, mobile navigation, zero normal-route console errors, same-origin requests, serious/critical axe checks, and service-worker offline demo reload.
- Live mobile Lighthouse: performance 100, accessibility 100, best practices 100, SEO 100; LCP 214 ms and CLS 0. Report: [lighthouse-mobile.json](evidence/polish-3/lighthouse-mobile.json).
