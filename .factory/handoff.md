# Caption Lanes — repair 6 handoff

Date: 2026-08-30 UTC

Work order: `speaker-lane-captions-repair-6`

Verifier report: `8fa3f042fd75228d28ba80904ac3d30973d3d55b`

Repaired candidate: `f42761598089f491fbcdc22d60db5250ed48b91a`

Repair commit: `3aba4c757adc05ebbf1911871e2474993b990725`

Production: <https://speaker-lane-captions.sociobot.in/>

## Result

All three findings in `.factory/verification-7.md` are repaired and covered by
browser regressions. The tested `dist/` was deployed to the production
environment of `sf-speaker-lane-captions`. `npm run test:live` confirms every
deployable file is byte-identical to production.

## Repairs

1. A revoked or refunded Plus license now moves an active Across lane to
   Centre before rerendering. A live-region toast says that Across closed and
   Centre is selected. The `@claim:revoked-license` test now selects Across,
   revokes the recorded license, submits another caption, and proves that the
   caption is visible and stored in Centre.
2. The absolute header phrase “Local only” is now the narrower “Caption text
   stays here,” covered by `caption-persistence`. The offline notice now says
   to use typed captions when live speech is unavailable, covered by
   `local-speech`. Both phrases are present in `.factory/copy-audit.md`, and
   their locations are recorded in `.factory/claims.json`.
3. A 254-byte parser-blocking route-state script marks direct demo loads before
   first paint. CSS reserves the demo banner, notice, controls, and lane area,
   and initialization switches to the room before its first asynchronous
   storage write. The delayed-main-bundle regression measures cumulative
   layout shift and requires CLS below 0.1.

The researched brief, cinematic environmental design, original artwork,
three-lane free workflow, paid fourth lane, local storage, and Android
Capacitor project remain unchanged.

## Verification evidence

- Clean install: `npm ci` — 255 packages, 0 vulnerabilities.
- Full suite: `npm test` — 5/5 Vitest tests and 84/84 Playwright runs passed
  across desktop Chromium and exact 390 × 844 mobile Chromium.
- Claims: every command in `.factory/claims.json` ran independently — 23/23
  commands and 46/46 browser runs passed.
- Static checks: `npm run lint`, `npm run typecheck`, `npm run build`, and
  `npm audit --audit-level=high` passed.
- Production output: 201,231 bytes total. Main JavaScript is 20,421 bytes raw
  / 7.43 kB gzip; CSS is 17,540 bytes raw / 4.74 kB gzip; the mobile hero is
  8,074 bytes. There is no font payload.
- Capacitor: `npm run cap:sync` passed and `npx cap doctor android` reported
  “Android looking great.” App ID and native project remain the original
  Android artifact class.
- Local verifier: `/opt/fleet/lib/verify-url.sh` returned HTTP 200 with no
  console errors, `lang="en"`, one `h1`, `main`, complete image alt text, and
  labelled buttons. Desktop and 390px captures are under
  `.factory/evidence/repair-6/verify-local/`.
- Axe: Demo, Privacy, Terms, and 404 returned zero violations at both desktop
  and 390px, locally and live. Keyboard, focus restoration, touch targets,
  reduced motion, and 320px reflow also passed the Playwright suite.
- Local mobile Lighthouse 12.8.2: performance 100, accessibility 100, best
  practices 100, SEO 100; FCP 0.91 s, LCP 1.07 s, TBT 0 ms, CLS 0.0102, and
  76,802 bytes transferred. Evidence:
  `.factory/evidence/repair-6/lighthouse-local.json`.
- Two cold live mobile Lighthouse runs: 100/100/100/100 in both; LCP 0.96 s
  and 0.92 s; TBT 0 ms; CLS 0.0102 in both; transfers 76,518 and 76,531 bytes.
  Evidence: `.factory/evidence/repair-6/lighthouse-live-1.json` and
  `lighthouse-live-2.json`.
- Live verifier: HTTP 200 in 590 ms with no console errors and all structural
  checks passing. Evidence: `.factory/evidence/repair-6/verify-live/`.
- Live repair smoke: recorded license fixtures produced four lanes, selected
  Across, returned a revoked verdict, selected Centre, and kept the next typed
  caption visible in Centre.
- Live privacy/offline/mobile smoke: a fresh 390px demo loaded six captions,
  contacted only `speaker-lane-captions.sociobot.in`, made no console errors,
  had no horizontal overflow, and reloaded offline with the banner and all six
  captions.
- Live response policy: HTTP redirects to HTTPS with 301. HTTPS serves HSTS,
  restrictive CSP, microphone-only Permissions-Policy, `nosniff`,
  strict-origin referrer policy, and `X-Frame-Options: DENY`. HTML revalidates
  after 30 seconds, `sw.js` is `no-cache`, and hashed assets are one-year
  immutable.
- Live identity and checkout: `npm run test:live` passed the root, demo,
  designed 404, favicon, response headers, ten hosted checkout redirects, and
  every deployable-file hash comparison.

Key deployed hashes:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `8d12d2ae0aaf31837d7b6014f45796a7349e5e6964c562074e7ccde441e2be75` |
| `route-state.js` | `df5a6bf6b192de0edb3ed767e8a33d6cfc02b61400d601c0bc69ba2962f93c69` |
| `assets/app-BWRHoOqz.js` | `3b3c93a48a8f9e839b377425d4e1167230b4c19bf63a1eb5f8b2a47f7c342189` |
| `assets/styles-DctlYvFF.css` | `0c2530faf8082f8c7e643f21f49bd8a979ebb9b29520c26fb9709ab948ad6e0f` |
| `sw.js` | `732ce6a97287b9cf4b6715507b371dd273400e8b0832c3496cacdc6b2c41e4bc` |

## Run and verify

```sh
npm ci
npm test
npm run lint
npm run typecheck
npm run build
npm audit --audit-level=high
npm run cap:sync
npx cap doctor android
npm run test:live
```

Demo entry point: <https://speaker-lane-captions.sociobot.in/demo>

## Known external follow-up

- This static-deploy worker has no Java executable, so it cannot build or
  smoke-test the debug APK. Run `android/gradlew -p android assembleDebug
  --no-daemon` on the later Android JDK/SDK worker, then test permission
  denial/allow, language-pack support, mono/stereo direction, lifecycle, back
  gesture, install/update, and offline restart on representative hardware.
- The brief's four-person, 30-utterance attribution study still requires human
  participants. The product makes no untested 80% attribution claim.

No product defect remains open from independent verification 7. The deployment
CLI's generated local credential file was removed immediately after deployment
and was not committed.
