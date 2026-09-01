# Caption Lanes — polish 3 retry 1 handoff

Date: 2026-09-01 UTC

Outcome: **PASS — zero open findings**.

Repair commit: `f1f0391a0543cf2c9ebf88d49013e026f05cb0cc` (`fix: guarantee isolated demo cleanup`).

## Delivered

- Demo exit now waits for confirmed deletion of every `demo:caption-lanes*` IndexedDB database and local/session storage key.
- IndexedDB errors and blocked connections no longer count as success. The demo stays open, explains how to recover, and returns focus to **Start for real**.
- Real transcript data, real preferences, and `sb_license:speaker-lane-captions` remain untouched and return after demo exit.
- Start for real, Home, Privacy, and Terms share the same awaited demo-exit gate. Demo checkout is blocked until real mode.
- The one-click sample, direct `/demo`, and `?demo=1` all show six sample captions, three lanes, the persistent banner, Reset, and Start for real.
- Removed the last untestable refund-processing copy. Kept the tested hosted-checkout fact and a purchase/refund support contact.
- Updated the claim inventory, demo contract, copy audit, README, and the 93-character verb-first catalog description.
- Preserved the cinematic dark-room visual system, Capacitor/Android artifact class, native speech bridge, PWA, legal pages, and real routing.

## Verification evidence

- Fresh clone at the repair commit: all 24 exact claim commands passed. Browser claims ran in desktop Chromium and exact 390 × 844 Chromium.
- Fresh clone `npm test`: 9 unit tests and 86 browser runs passed.
- `npm run lint`, `npm run typecheck`, `npm run build`, and `npm audit --audit-level=high`: passed.
- Build size: 31.48 kB JS / 11.24 kB gzip; 17.70 kB CSS / 4.78 kB gzip.
- `npm run test:android`: verified the exact successful [Android package run](https://github.com/B-Divyesh/sf-speaker-lane-captions/actions/runs/33569777621) and retained `android-apks-f1f0391a0543cf2c9ebf88d49013e026f05cb0cc` artifact.
- Production deploy completed for `sf-speaker-lane-captions`; `npm run test:live` passed artifact identity, headers, favicon, checkout, and designed HTTP 404.
- [Cold live checks](evidence/polish-3-retry1/live-checks.json) passed desktop/mobile deletion, blocked recovery, preserved real data, first-screen fit, route focus, metadata, legal links, 404, privacy, axe, and offline reload.
- [Baseline verifier](evidence/polish-3-retry1/verify-live/verify.json): no console errors; title, lang, one h1, main, alt text, and button labels passed.
- [Mobile Lighthouse](evidence/polish-3-retry1/lighthouse-mobile.json): 100 performance / 100 accessibility / 100 best practices / 100 SEO; LCP 1.1 s, CLS 0, TBT 0 ms.
- Screenshots: [home](evidence/polish-3-retry1/live-mobile-home.png), [mobile demo](evidence/polish-3-retry1/live-mobile-demo.png), [desktop demo](evidence/polish-3-retry1/live-desktop-demo.png), and [blocked deletion](evidence/polish-3-retry1/live-mobile-delete-error.png).

## Run locally

```sh
npm ci
npm test
npm run lint
npm run typecheck
npm run build
npm run test:android
```

Run the production cold-check suite with:

```sh
node scripts/verify-polish-live.mjs https://speaker-lane-captions.sociobot.in .factory/evidence/polish-3-retry1
```

Known gaps: none.
