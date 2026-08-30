# Independent verification 8 — PASS

Date: 2026-08-30 UTC
Work order: `speaker-lane-captions-verify-8`
Candidate commit: `200e3c1114fed4457fa19fb6501ff96006052a38`
Live URL: <https://speaker-lane-captions.sociobot.in/>

## Verdict

**PASS.** Fresh, independent verification found that the live deployment is
the tested candidate and that it meets the researched brief's useful offline,
directional-caption workflow. No release-blocking product defect was found.
Only the native debug-APK build could not be run in this `deploy: none`
container because it has no Java runtime; the Capacitor Android project itself
syncs and passes Capacitor Doctor.

No product source was modified. This report, the handoff update, and
screenshots are the verifier's only changes.

## Required entry checks

### Claims gate — PASS

The required `.factory/claims.json` exists and contains 23 claims. After a
fresh `npm ci` (255 packages; `npm audit --audit-level=high` found 0
vulnerabilities), I executed every exact `test` command in that file from the
demo entry point. All 23 commands passed in both configured Chromium projects:
**46/46 claim browser runs passed**.

| Claims | Result |
| --- | --- |
| `demo-isolation`, `directional-lanes`, `stereo-direction`, `local-privacy`, `raw-audio-storage`, `offline-reload` | PASS |
| `caption-persistence`, `transcript-portability`, `typed-limit`, `confidence-filter`, `local-speech`, `plus-license` | PASS |
| `consent-before-microphone`, `microphone-lifecycle`, `no-accounts-analytics-archive`, `no-identity-inference` | PASS |
| `mono-input`, `language-pack-flow`, `free-core-controls`, `license-portability`, `license-reconnect` | PASS |
| `hosted-checkout`, `revoked-license` | PASS |

### Cold first read — PASS

A new browser context opened the live root at 1440 × 900. The first screen
states, in plain words:

- **What it does:** “Place live captions by speaker direction.”
- **Who it is for:** “For Deaf and hard-of-hearing people who need to follow
  small, in-person conversations.”
- **First action:** “Try it with sample data,” with the immediate explanation
  “The demo opens a saved sample conversation. No microphone is used.”

The one-click action opened `/demo`, immediately displayed three directional
lanes and six realistic sample captions, and kept the “Demo — sample data,
nothing is saved” banner with Reset demo and Start for real. Screenshot:
`evidence/verification-8/first-read-live-desktop.png`.

## Clean checkout, build, and deployment identity

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 255 packages installed; audit reports 0 vulnerabilities. |
| `npm test` | PASS — 5/5 Vitest tests; 84/84 Playwright tests. `test-results/.last-run.json` reports `passed`, no failures. |
| `npm run lint` / `npm run typecheck` | PASS. |
| `npm run build` | PASS — produces `dist/`. |
| `npm run test:live` | PASS — live checkout, favicon, response policy, and every deployable artifact identity check. |
| `npm run cap:sync` / `npx cap doctor android` | PASS — Android web assets synchronize; Doctor: “Android looking great.” |
| Debug APK | ENVIRONMENT BLOCKED — `java` is not installed, so Gradle cannot start in this deploy-none worker. |

The build is 201,231 bytes total. Its initial JavaScript is 20,421 bytes raw
(7,465 bytes gzip) and CSS 17,540 bytes raw (4,766 bytes gzip), comfortably
below the static-product budgets. No font payload is present. The live artifact
identity check means the live deployment is this candidate, rather than an
older or deployment-only build.

## Independent live exercise

- Desktop and exact 390 × 844 mobile `/demo` both showed 3 lanes and 6 sample
  captions with no console or page errors and no horizontal overflow.
- A typed caption was added to the selected lane, then Reset demo restored the
  original six-row sample. This was repeated in ten fresh contexts to test the
  reset boundary; all ten ended with six rows and no typed row.
- Keyboard-only use reached the visible Skip to captions link on the first Tab;
  Enter moved focus to `main`. The product test suite also verifies dialog
  Escape/focus restoration and number-key lane selection.
- The production service worker controlled the live page. After an online
  `/demo` visit, an offline reload retained the demo banner and all six
  captions with no errors (`caption-lanes-911c13d4e12b`).
- The complete test suite independently covers blank and 240-character typed
  boundaries, invalid-import recovery, typed-caption persistence, confidence
  0.59/0.60 filtering, consent before microphone, mono/stereo limits,
  language-pack ordering, microphone lifecycle, paid-lane revocation,
  checkout, and license recovery.

## Accessibility, privacy, and policy

- `verify-url.sh` against the live root passed: HTTP 200, 624 ms, no console
  errors, title, `lang="en"`, one `h1`, `main`, no missing image alt text, and
  no unlabelled buttons. Evidence:
  `evidence/verification-8/verify-url/verify.json`.
- Independent axe-core scans on `/`, `/demo`, `/privacy/`, `/terms/`, and
  `/404.html`, at both desktop and 390 px, found **zero serious or critical
  violations**. There was no mobile horizontal overflow and no browser errors.
- The fresh root-to-demo request log contained only the product origin. During
  demo typing/export paths it made no microphone request and no external
  request; therefore the demo privacy promise holds in browser evidence.
- HTTPS redirects from HTTP with 301. Live HTML sends HSTS, `nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`,
  a restrictive CSP with `frame-ancestors 'none'`, and a microphone-only
  Permissions-Policy. HTML revalidates after 30 seconds, `sw.js` is `no-cache`,
  and hashed assets are one-year immutable.
- The only intentional product cross-origin route is the documented Sociobot
  license/checkout API. There is no account provider, analytics, cloud archive,
  CDN font/script, or third-party asset in the demo flow.

## Server allowance

The documented product-scoped license verification endpoint was tested with
one invalid-token client and the live product origin. Requests 1–30 returned
`200` (`Cache-Control: no-store`, exact CORS origin). Request **31** returned
**429** with **`Retry-After: 4`**. The observed allowance is therefore 30
requests per client before limiting.

## Performance note

An independent Lighthouse invocation was attempted with Lighthouse 12.8.2,
but this container has Playwright's Chromium headless shell rather than a
compatible installed Chrome binary; its first run reported missing
`CHROME_PATH` and the supplied shell crashed under Lighthouse. This is a
verifier-environment limitation, not a product console/page failure. The
artifact budgets above pass, and the prior recorded live Chrome Lighthouse
evidence remains in `evidence/repair-6/` (100/100/100/100).

## Defects

None found. The following is a verification-environment gap, not a candidate
defect:

| Severity | Item | Follow-up |
| --- | --- | --- |
| Info | No Java/JDK, therefore no debug APK or device lifecycle test in this deploy-none worker. | Run `./gradlew assembleDebug` and microphone/back-gesture/offline checks on an Android SDK/JDK worker or physical device. |
