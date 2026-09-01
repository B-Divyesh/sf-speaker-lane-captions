# Independent verification 10 — PASS

Date: 2026-09-01 UTC

Candidate commit: `33d874754d54f0655c918dfff06dc038bc95b35f`

Live URL: <https://speaker-lane-captions.sociobot.in/>

## Verdict

**PASS.** The candidate satisfies the supplied acceptance contract for the
published Caption Lanes product.

## First-read and demo checks

- Check that a cold desktop and 390 px mobile visit explain the product,
  audience, and first action in plain words — **PASS**. The first viewport says
  “Place live captions by speaker direction,” names Deaf and hard-of-hearing
  people following small in-person conversations, and presents one visible
  “Try it with sample data” action.
- Check that the first action opens a one-click sample — **PASS**. It opens
  `/demo` with three direction lanes, six realistic sample captions, and the
  persistent “Demo — sample data, nothing is saved” banner.

## Required claims gate

- Check that `.factory/claims.json` exists and every listed command succeeds
  from the clean checkout — **PASS**. All 24 commands passed. The 23 browser
  commands each passed in desktop and 390 px Chromium (46 browser results).
- Check that the Android native-caption command succeeds — **PASS**. This
  worker has no complete local JDK/Android SDK, and the exact documented
  fallback verified the successful Android package workflow for this exact
  source: [run 33560017787](https://github.com/B-Divyesh/sf-speaker-lane-captions/actions/runs/33560017787), retained artifact
  `android-apks-33d874754d54f0655c918dfff06dc038bc95b35f` (ID `9820904631`).

The passed claims cover demo separation, manual directional lanes, coarse
stereo direction and mono fallback, consent and microphone stop paths, local
speech/language-pack behavior, privacy/storage boundaries, offline reload,
caption persistence, JSON transfer, input limits, confidence filtering,
license restore/recheck/inactive states, the hosted checkout, free controls,
and the Android native path.

## Local build and product-flow checks

- Check that a clean dependency install succeeds — **PASS**: `npm ci` added
  255 packages and reported zero vulnerabilities.
- Check that the complete local suite succeeds — **PASS**: `npm test` passed
  6 Vitest tests and 84 Playwright tests in 3.0 minutes.
- Check that static analysis and the production build succeed — **PASS**:
  `npm run lint`, `npm run typecheck`, and `npm run build` all passed; `dist/`
  was produced.
- Check that representative normal, boundary, invalid-input, and recovery
  flows work — **PASS**. The claim and full-suite checks covered typed caption
  placement, blank input, the 240-character limit, 59%/60% confidence
  behavior, valid and invalid transcript import, reset, persistence, settings
  dialogs, keyboard shortcuts, consent before microphone use, pause/end/
  navigation/background/close microphone handling, and license state changes.
- Check that installed-app offline reload and service-worker update handling
  work — **PASS** in the full suite and the required offline claim.

## Live deployment, privacy, and response checks

- Check that the live deployment is the candidate build — **PASS**: after the
  fresh production build, `npm run test:live` confirmed the hash of every
  deployable file, direct routes, favicon, checkout behavior, response policy,
  and the designed 404 response.
- Check that the live demo sends data only to its own origin — **PASS**. A
  fresh 390 px Playwright visit to `/demo`, typed caption, and JSON export made
  requests only to `https://speaker-lane-captions.sociobot.in`; it made zero
  microphone calls, had zero failed requests, and created
  `caption-lanes-2026-09-01.json`.
- Check that response policy and caching are suitable — **PASS**. The root
  sent HSTS, `nosniff`, `strict-origin-when-cross-origin`, `X-Frame-Options:
  DENY`, restrictive CSP, and microphone-only Permissions-Policy. HTML uses a
  30-second revalidation policy; hashed JS and CSS use one-year immutable
  caching.
- Check that the documented product license verification allowance is enforced
  — **PASS**. Thirty sequential invalid-token verification requests returned
  200; request 31 returned `429` with `Retry-After: 3`. The observed allowance
  is 30 requests per client window.
- Check that sign-in configuration applies — **NOT APPLICABLE**. The product
  has no account or sign-in flow.

## Accessibility, mobile, and performance checks

- Check that baseline document and console requirements are met — **PASS**.
  `/opt/fleet/lib/verify-url.sh` confirmed HTTP 200, title, `lang="en"`, one
  `h1`, a main landmark, image alternatives, labelled buttons, and zero console
  errors. Evidence: `evidence/verification-10/verify-url/verify.json`.
- Check that serious and critical accessibility results are absent — **PASS**.
  Independent axe scans of landing and demo on desktop and 390 px, plus
  Privacy, Terms, and not-found views at 390 px, returned zero serious or
  critical results.
- Check that keyboard, focus, reduced-motion, 320 px reflow, 390 px touch
  targets, dialogs, and browser history work — **PASS** in the complete
  Playwright suite.
- Check that bundle budgets are met — **PASS**. The production build contains
  29.61 kB raw / 10.70 kB gzip JS and 17.50 kB raw / 4.74 kB gzip CSS; no font
  payload is shipped.
- Check that live mobile Lighthouse results meet the release bar — **PASS**.
  The clean retry measured Performance 100, Accessibility 100, Best Practices
  100, SEO 100, FCP 1.0 s, LCP 1.2 s, TBT 0 ms, and CLS 0. Evidence:
  `evidence/verification-10/lighthouse-mobile-retry.json`.

## Defects by severity

No critical, high, medium, or low severity defects were found in this
verification.

## Evidence

- `evidence/verification-10/verify-url/` — page response, desktop/mobile
  screenshots, and document/console report.
- `evidence/verification-10/lighthouse-mobile-retry.json` — fresh live mobile
  Lighthouse result.
- `/tmp/caption-lanes-verify-10/` in the verification worker — individual
  required-claim and full-suite command logs.
