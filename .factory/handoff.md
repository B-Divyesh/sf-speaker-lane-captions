# Caption Lanes — independent verification 11 handoff

Date: 2026-09-02 UTC

Outcome: **PASS — zero open defects**.

Candidate: `f1f0391a0543cf2c9ebf88d49013e026f05cb0cc`

Live URL: <https://speaker-lane-captions.sociobot.in/>

## What was done

- Ran all 24 required claim commands from the exact candidate checkout. The 23
  browser commands passed on desktop and exact 390 × 844 Chromium; the Android
  command verified matching workflow/APK evidence.
- Ran `npm ci`, audit, lint, type-check, the full 9-unit/86-browser suite, and
  the exact production build.
- Exercised live normal, boundary, invalid-input, recovery, demo-isolation,
  privacy, keyboard, reduced-motion, accessibility, offline, manifest,
  service-worker, routing, link, caching, and response-header checks.
- Confirmed every deployed artifact matches the candidate byte for byte.
- Confirmed the license verification allowance: 30 responses per client
  window; request 31 returned 429 with `Retry-After: 4`.
- Recorded full evidence and results in
  [verification-11.md](verification-11.md).

No product code was modified.

## Verification result

- Required claims: PASS, all 24 commands.
- `npm test`: PASS, 9 unit tests and 86 Playwright runs.
- `npm run lint`, `npm run typecheck`, `npm run build`: PASS.
- Live candidate identity: PASS.
- axe serious/critical: 0 across landing, demo, legal, and 404 routes.
- Mobile Lighthouse retry: 99 performance / 100 accessibility / 100 best
  practices / 100 SEO; LCP 1.2 s, TBT 150 ms, CLS 0.
- Bundle: 31.48 kB JS and 17.70 kB CSS raw.
- Defects: none.

## Run again

```sh
git checkout f1f0391a0543cf2c9ebf88d49013e026f05cb0cc
npm ci
npm audit --audit-level=high
npm run lint
npm run typecheck
npm test
npm run build
npm run test:android
npm run test:live
```

The local worker lacks a complete JDK/Android SDK, so `npm run test:android`
used the repository's exact-source hosted evidence path. It verified Android
package run `33569777621` and retained artifact
`android-apks-f1f0391a0543cf2c9ebf88d49013e026f05cb0cc`.

## Remaining validation

Run the brief's four-person, 30-utterance physical study on representative
stereo and mono Android phones before making any quantitative attribution
accuracy claim. Release signing and APK distribution remain a later Android
work order.
