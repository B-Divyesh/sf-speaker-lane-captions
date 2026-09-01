# Caption Lanes polish 3 — retry 1

Date: 2026-09-01 UTC

Base candidate: `b74e4c1ec64b149fac8144d7ee8dd7fdd0b29afc`

Adversarial review: `f0e10408d8fcbe0847dae64b36887bc0dcc7d5a0`

Repair commit: `f1f0391a0543cf2c9ebf88d49013e026f05cb0cc`

Live URL for every row: <https://speaker-lane-captions.sociobot.in/>.

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the approved Sociobot/Dodo hosted checkout, removed untestable refund-processing wording, and kept retry guidance. | `@claim:hosted-checkout`; `npm run test:live`; [live checks](evidence/polish-3-retry1/live-checks.json); live checkout returned the required hosted redirect. |
| F-1-2 | Kept the Android 12 native on-device caption bridge, direction estimator, package build, and emulator bridge test. | `@claim:android-native-caption-path`; `npm run test:android`; [Android run 33569777621](https://github.com/B-Divyesh/sf-speaker-lane-captions/actions/runs/33569777621); retained artifact `android-apks-f1f0391a0543cf2c9ebf88d49013e026f05cb0cc`. |
| F-1-3 | Kept consent before microphone access and track cleanup on every exit path. | `@claim:consent-before-microphone`, `@claim:microphone-lifecycle`; live demo made zero microphone calls in [live checks](evidence/polish-3-retry1/live-checks.json). |
| F-1-4 | Kept account, analytics, archive, identity, and voiceprint behavior separately inventoried and tested. | `@claim:no-accounts-analytics-archive`, `@claim:no-identity-inference`; live demo request list was empty after entry. |
| F-1-5 | Kept mono fallback/manual placement and conditional language-pack installation. | `@claim:mono-input`, `@claim:language-pack-flow`; [desktop demo](evidence/polish-3-retry1/live-desktop-demo.png). |
| F-1-6 | Kept typed captions, display controls, filtering, lane appearance, and export free. | `@claim:free-core-controls`; [mobile demo](evidence/polish-3-retry1/live-mobile-demo.png). |
| F-1-7 | Kept fresh-browser license restore and reconnect verification. | `@claim:license-portability`, `@claim:license-reconnect`; live exit restored the seeded real Plus state. |
| F-1-8 | Kept every public claim in `.factory/claims.json` with exactly one tagged test; removed remaining unprovable purchase-processing copy. | `lists each public claim with exactly one tagged sandbox test`; all 24 exact claim commands passed from the clean clone. |
| F-1-9 | Kept History API navigation, route-specific titles, focused h1 elements, and polite announcements. | `moves focus, announces titles, and restores routes with browser history`; live desktop Back/Forward focus passed in [live checks](evidence/polish-3-retry1/live-checks.json). |
| F-1-10 | Kept the same Demo/Privacy header and complete footer on every route. | `legal and not-found pages are direct-loadable and accessible`; live 390 px route crawl passed. |
| F-1-11 | Kept canonical, Open Graph, Twitter, favicon, and Apple metadata on legal and not-found routes. | `serves complete route-specific metadata on direct routes`; live `/privacy/`, `/terms/`, and HTTP 404 metadata passed. |
| F-1-12 | Kept literal headings: “How to use Caption Lanes,” “Add a fourth caption lane,” and “Page not found.” | `ships the required metadata, route structure, and legal skip links`; live route crawl passed. |
| F-1-13 | Kept result-naming actions, including Export transcript, End captions, Restore license, and lane-color actions. | `all visible mobile controls have at least 44px touch targets`; [mobile demo](evidence/polish-3-retry1/live-mobile-demo.png). |
| F-1-14 | Kept transcript, separate store, browser-confirmed speech, and recheck wording. | `.factory/copy-audit.md`; `keeps the catalog and demo-exit copy concrete and within their limits`. |
| F-2-1 | Demo entry and Reset still force three default lanes. Demo exit now deletes all `demo:caption-lanes*` databases and browser keys before routing. | `@claim:demo-isolation` in desktop and exact 390 × 844 projects; [desktop](evidence/polish-3-retry1/live-desktop-demo.png) and [mobile](evidence/polish-3-retry1/live-mobile-demo.png) live checks. |
| F-2-2 | Kept the verified native Android caption path and current packaged web bundle. | `@claim:android-native-caption-path`; exact pushed-revision emulator/package run linked above. |
| F-2-3 | Removed unprovable refund-handler/processor wording. Revoked and refunded inactive verdicts still close Plus. | `@claim:revoked-license`, `@claim:hosted-checkout`; live legal artifact hash passed. |
| F-2-4 | Kept user-facing deletion wording and documented the exact recovery step without “namespace.” | `.factory/copy-audit.md`; README unit regression. |
| F-2-5 | Kept both Demo and Privacy visible in the 390 px header on home, demo, legal, and 404 routes. | `works at 390px and restores local captions`; [mobile home](evidence/polish-3-retry1/live-mobile-home.png); live route crawl. |
| F-3-1 | Kept the five short Android README sentences introduced by the first polish-3 pass. | `keeps the repaired Android README sentences within the plain-language limit`; clean unit suite passed. |
| Controller demo-exit evidence | Replaced success-on-error IndexedDB cleanup with one awaited deletion. `onerror` and `onblocked` now keep the demo open, announce recovery, and refocus Start for real. Cleanup covers every demo-prefixed database plus local/session keys while preserving `caption-lanes*` and `sb_license:*`. Internal legal/home exits use the same gate. | `@claim:demo-isolation` passed desktop and mobile from a clean clone; `keeps the demo open and explains how to recover when deletion is blocked`; [live error state](evidence/polish-3-retry1/live-mobile-delete-error.png); live desktop/mobile deletion checks passed. |

## Verification

- Fresh clone `/tmp/speaker-lane-polish3-clean.NxpKbf` at `f1f0391`: `npm ci` installed 255 packages with zero vulnerabilities.
- Every exact `.factory/claims.json` command passed: 23 browser commands × desktop and 390 × 844, plus `npm run test:android`.
- Clean clone `npm test`: 9 unit tests and 86 Playwright runs passed.
- Clean clone `npm run lint`, `npm run typecheck`, `npm run build`, and `npm audit --audit-level=high`: passed.
- Production build: JavaScript 31.48 kB raw / 11.24 kB gzip; CSS 17.70 kB raw / 4.78 kB gzip.
- Android: GitHub Actions built debug and Android-test APKs and passed unit plus packaged Android 12 emulator tests for the exact repair commit.
- Deployment: `swa deploy ./dist --app-name sf-speaker-lane-captions --env production` succeeded; `npm run test:live` passed deployed hashes, headers, favicon, HTTP 404, and checkout.
- Production baseline verifier: [verify.json](evidence/polish-3-retry1/verify-live/verify.json) reports HTTP 200, one h1, `lang=en`, main, complete alt/labels, and zero console errors.
- Production live suite: [live-checks.json](evidence/polish-3-retry1/live-checks.json) covers cold first screen, `?demo=1`, one-click demo, Reset, successful and blocked deletion, real-data preservation, focus/Back/Forward, titles, metadata, mobile navigation, HTTP 404, axe, privacy requests, and offline reload.
- Mobile Lighthouse: [lighthouse-mobile.json](evidence/polish-3-retry1/lighthouse-mobile.json) scored 100 performance, 100 accessibility, 100 best practices, and 100 SEO; LCP 1.1 s, CLS 0, TBT 0 ms.

No finding remains open.
