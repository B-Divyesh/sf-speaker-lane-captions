# Caption Lanes polish 2

Date: 2026-08-30 UTC

Base review: `fbbe2dd0ca8762859872765cdc3fe78b403baf6e`

Repair commit: `e400d29d5399c651dac9bf7d1f25d71040d44adc`

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Retained the hosted Sociobot/Dodo checkout route and retry guidance. | `@claim:hosted-checkout`; live `npm run test:live` made ten 303 checks. |
| F-1-2, F-2-2 | Replaced the empty Android wrapper with `NativeCaptionPlugin`: Android 12+ uses `createOnDeviceSpeechRecognizer`, checks local availability, requests permission only at start, emits captions, and stops on Pause/background/destroy. Added `NativeCaptionBridgeTest`. | `@claim:android-native-caption-path` / `npm run test:android` built debug and Android-test APKs; debug APK SHA-256 `ae3631132c585ade3a53ce6d5b20ae506d75a6839613f4fed45dd4be817104dc`. |
| F-1-3 | Consent and microphone exit paths remain explicitly tested. | `@claim:consent-before-microphone`, `@claim:microphone-lifecycle`. |
| F-1-4 | Account, analytics, archive, and identity behavior remains separately tested. | `@claim:no-accounts-analytics-archive`, `@claim:no-identity-inference`. |
| F-1-5 | Mono/manual placement and conditional language installation remain covered. | `@claim:mono-input`, `@claim:language-pack-flow`. |
| F-1-6 | Free typed captions, display controls, filtering, and export remain unlocked. | `@claim:free-core-controls`. |
| F-1-7 | License restore, reconnect verification, and inactive-license behavior remain covered. | `@claim:license-portability`, `@claim:license-reconnect`, `@claim:revoked-license`. |
| F-1-8, F-2-3 | Removed the unprovable statement about who handles refunds. The inactive-license claim now drives both recorded `revoked` and `refunded` verdicts. | `@claim:revoked-license`; `@claim:hosted-checkout`; live `npm run test:live`. |
| F-1-9 | Route history keeps title, focus, and polite announcement behavior. | `moves focus, announces titles, and restores routes with browser history`. |
| F-1-10, F-2-5 | Kept shared chrome and removed the mobile rule that hid Privacy. Direct legal/404 routes check Demo and Privacy at 390 px. | `works at 390px and restores local captions`; `legal and not-found pages are direct-loadable and accessible`; `.factory/evidence/polish-2/live-mobile-home.png`. |
| F-1-11 | Route metadata remains tested across legal and 404 documents. | `serves complete route-specific metadata on direct routes`. |
| F-1-12 | Literal headings remain in place. | `tests/unit/release.test.ts`. |
| F-1-13 | Result-naming control labels remain in place. | `all visible mobile controls have at least 44px touch targets`. |
| F-1-14, F-2-4 | Replaced “demo namespace” with “delete the sample changes.” | README and `.factory/copy-audit.md`. |
| F-2-1 | Demo entry, direct initialization, and Reset now force `plus = false`, `activeLane = 'center'`, and default demo preferences. The expanded claim seeds real Plus, checks three lanes before and after Reset, and confirms Plus returns after exit. | `@claim:demo-isolation`; `.factory/evidence/polish-2/live-demo-isolation.png`. |

## Verification

- Fresh clone `/tmp/caption-lanes-polish2-clean`: `npm ci` passed with 0 vulnerabilities.
- Every exact command in `.factory/claims.json` passed from that clone: 24/24 claim commands, including `npm run test:android`.
- Fresh clone: `npm test` passed (5 unit and 84 Playwright tests); `npm run lint`, `npm run typecheck`, `npm run build`, and `npm audit --audit-level=high` passed.
- Android: `npm run test:android` built both debug artifacts. `NativeCaptionBridgeTest` is compiled for Android 12+ connected-device execution and calls the packaged Capacitor bridge. The disposable worker has no viable Android runtime: its emulator requires a 7.3 GB userdata partition but has 2.9 GB free. No device result is represented as having run.
- Build output: JS 29.37 kB raw / 10.61 kB gzip; CSS 17.50 kB raw / 4.74 kB gzip.
- Production deployment completed at <https://speaker-lane-captions.sociobot.in/>. `npm run test:live` passed artifact hashes, headers, favicon, 404, and ten checkout redirects.
- `/opt/fleet/lib/verify-url.sh` passed on production. Report: `.factory/evidence/polish-2/verify-live/verify.json`.
- Live axe passed with zero violations on `/`, `/demo`, `/privacy/`, `/terms/`, and a 404 route at 390 px and 1366 px.

## Live evidence

- `.factory/evidence/polish-2/live-mobile-home.png`
- `.factory/evidence/polish-2/live-mobile-demo.png`
- `.factory/evidence/polish-2/live-demo-isolation.png` — cached real Plus still gives exactly three demo lanes before and after Reset.
- `.factory/evidence/polish-2/verify-live/screenshot-desktop.png`
- `.factory/evidence/polish-2/verify-live/screenshot-mobile.png`
