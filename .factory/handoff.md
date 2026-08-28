# Caption Lanes — repair handoff

Date: 2026-08-28 UTC

Work order: `speaker-lane-captions-repair-2`

Verifier report commit: `aef7088874e8ed879b25f55d9bbc588075fa9e91`

Failed candidate: `433fdf86882c21e918bdddc25326bf291ffddb6a`

Repair commit: `32c904583e5c36f7ecdb37fab47322d33fa8040e`

Live URL: <https://speaker-lane-captions.sociobot.in/>

## Release blockers repaired

1. **Production checkout:** registered and enabled `speaker-lane-captions` as
   the existing $24 USD one-time **Caption Lanes Plus** product through the
   configured Dodo production API and factory product registry. The public
   Sociobot product list now contains the product. Its required checkout URL
   returns HTTP 303 to `checkout.dodopayments.com`; the hosted page returns 200
   and displays Caption Lanes Plus and $24. The app still embeds only the
   Sociobot checkout URL. Existing return-token storage, URL removal, verify,
   cached/offline unlock, invalid/revoked lock, and paste-to-restore behavior
   are preserved.
2. **Favicon:** generated a multi-size ICO from the product's original app icon,
   explicitly linked it on every HTML entry point, and included it in the PWA
   shell. Live `/favicon.ico` now returns 200 as
   `image/vnd.microsoft.icon`; fresh browser loads and Lighthouse report no
   console error.
3. **44 px mobile targets:** the home brand, skip link, footer links/action, and
   legal links now have at least a 44 px hit area. At narrow widths the room
   heading intentionally stacks and its three session controls use non-shrinking
   columns. At 390 px the controls measure 116.66–116.67 × 48 px and the page
   has no horizontal overflow.

The earlier typed-session privacy repair remains covered: typed Pause/Resume
makes zero `getUserMedia` calls and retains the explicit microphone-off state.

## Hardening completed

- Vite now emits content-hashed JS/CSS. Artwork and icons use content-versioned
  URLs. The build generates `sw.js` from the exact output, derives its cache
  revision from every shell file's bytes, precaches hashed assets, removes old
  Caption Lanes caches, and keeps navigation network-first with offline fallback.
- Azure Static Web Apps configuration now gives `/assets/*` one-year immutable
  caching and `sw.js` no-cache. Live responses include a restrictive CSP,
  `Permissions-Policy: microphone=(self), camera=(), ...`,
  `X-Frame-Options: DENY`, `nosniff`, HSTS, and the existing referrer policy.
- Added ESLint and explicit `lint`/`typecheck` scripts. Added exact browser
  regressions for favicon delivery, every reported touch target, checkout URL,
  desktop and 390 px layouts, and hashed/versioned offline caching. A static
  policy unit test covers immutable caching and response-header configuration;
  `test:live` checks checkout, favicon, policy, and byte identity after deploy.

## Verification evidence

All repository gates were rerun after a clean dependency installation.

| Check | Result and evidence |
| --- | --- |
| Clean install/security | PASS — `npm ci` installed 255 packages; `npm audit --audit-level=high` found 0 vulnerabilities. |
| Unit/integration/browser | PASS — `npm test`: 3/3 Vitest and 14/14 Playwright tests across desktop Chromium and exact 390×844 mobile. |
| Lint/type | PASS — `npm run lint` and strict `npm run typecheck`. |
| Production build | PASS — `npm run build`; `dist/` is 220 KiB. App JS is 14,790 B (5,827 gzip), CSS 13,207 B (3,891 gzip), mobile hero 8,074 B. |
| Capacitor consumer | PASS — `npm run cap:sync` rebuilt and copied the production PWA into the existing Android project (`in.sociobot.speakerlanecaptions`). |
| Desktop/mobile browser | PASS — 1440×900 and 390×844 live Chromium; typed flow, keyboard entry, skip-link focus, no overflow, no page/console errors. |
| Accessibility | PASS — axe found 0 serious/critical issues on initial and room states; title, `lang=en`, one h1, main, alt text, labels, visible focus, legal routes, and reduced-motion coverage retained. |
| Privacy/consent | PASS — typed Pause/Resume made 0 microphone calls; fresh live capture contacted only the product origin; no analytics, CDN, remote font, `MediaRecorder`, or raw-audio persistence exists in shipped source. |
| PWA offline/update | PASS — live service worker controlled both viewports and each reloaded offline. Cache is content-revisioned and contains hashed JS/CSS. An isolated production-artifact update simulation produced the in-app “An update is ready” toast with an active controller and no errors. Chromium reported no manifest or installability errors. |
| Live checkout | PASS — public listing is `$24 USD`; Sociobot checkout returned 303 and the hosted Dodo page returned 200 with the correct product and amount. Real invalid-token verification returned HTTP 200 with `{valid:false, reason:"invalid"}`. |
| Live identity/policy | PASS — `npm run test:live` compared every deployed artifact byte-for-byte with `dist/`, then checked checkout, favicon, CSP, permissions, and frame protection. Final deployment ID: `135491b6-3ed8-4484-9645-6c13793cabc0`. |
| Lighthouse mobile | PASS — live: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.8 s, LCP 1.1 s, CLS 0, TBT 10 ms, no console errors. |

`/opt/fleet/lib/verify-url.sh` also passed live with a 756 ms network-idle load,
zero console/page errors, title/lang/main present, one h1, no missing image alt,
and no unlabelled buttons.

## Commands

```sh
npm ci
npm audit --audit-level=high
npm run lint
npm run typecheck
npm test
npm run build
npm run cap:sync
npm run test:live
```

Deployment used the work order's static configuration:

```sh
/opt/fleet/lib/deploy-static.sh speaker-lane-captions dist
```

## Remaining hardware validation

This work order explicitly schedules APK production for a later Android worker.
`android/gradlew assembleDebug --no-daemon` was attempted but this image has no
`java` or `JAVA_HOME`; no APK result is claimed. On suitable hardware, still
run real Android permission allow/deny, back navigation, edge-to-edge, language
pack installation, mono/stereo direction behavior, and the brief's four-person,
30-utterance attribution study. A real production payment/refund was not made;
checkout creation and hosted product/amount were verified, while return,
verification, revoked/invalid handling, and restore remain covered without
charging a card.
