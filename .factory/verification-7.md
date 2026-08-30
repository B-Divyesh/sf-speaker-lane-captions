# Independent verification 7 — FAIL

Date: 2026-08-30 UTC

Work order: `speaker-lane-captions-verify-7`

Candidate: `f42761598089f491fbcdc22d60db5250ed48b91a`

Live URL: <https://speaker-lane-captions.sociobot.in/>

## Verdict

**FAIL.** The deployed files are byte-for-byte identical to the candidate, the
mandatory one-click first read passes, all 23 listed claims pass after the
locked install, and the broad local/live quality gates pass. Independent
adversarial testing nevertheless found a release-blocking paid-to-free state
transition: after license revocation while the fourth lane is selected, new
typed captions are saved to the now-hidden paid lane and disappear from the
conversation. The copy also contains claim-like statements absent from the
required claim inventory, and the live demo repeatedly exceeds the CLS budget.

No product source was modified. This report, the verifier handoff, and captured
QA evidence are the only intended changes.

## Mandatory entry checks

### Cold first read — PASS

A fresh 1440 x 900 load answered all three required questions in the first
screen:

- What it does: **“Place live captions by speaker direction.”**
- Who it is for: **“For Deaf and hard-of-hearing people who need to follow
  small, in-person conversations.”**
- What to do: **“Try it with sample data”**, followed by “The demo opens a
  saved sample conversation. No microphone is used.”

The primary action ended at 456 px and the three facts ended at 614 px in a
900 px viewport. At 390 x 844 they ended at 585 px and 816 px respectively.
One click opened `/demo`, which immediately showed three lanes, six realistic
captions, and the persistent “Demo — sample data, nothing is saved” banner with
Reset demo and Start for real. Evidence:
`evidence/verification-7/first-read-desktop.png`.

### Claims gate — PASS, with inventory defects noted below

`.factory/claims.json` exists and has 23 entries. Each exact command was run
independently after `npm ci`; every command passed in both configured Chromium
projects, for **46/46 passing browser runs**:

| Claim IDs | Result |
| --- | --- |
| `demo-isolation`, `directional-lanes`, `stereo-direction`, `local-privacy`, `raw-audio-storage`, `offline-reload` | PASS |
| `caption-persistence`, `transcript-portability`, `typed-limit`, `confidence-filter`, `local-speech`, `plus-license` | PASS |
| `consent-before-microphone`, `microphone-lifecycle`, `no-accounts-analytics-archive`, `no-identity-inference` | PASS |
| `mono-input`, `language-pack-flow`, `free-core-controls`, `license-portability`, `license-reconnect` | PASS |
| `hosted-checkout`, `revoked-license` | PASS |

The first literal invocation before dependencies were installed could not load
`@axe-core/playwright`; the dependency is correctly locked in `package.json`.
After the required clean `npm ci`, every claim command above passed. This was a
worker setup precondition, not a product or claim failure.

## Clean-checkout and build gates

The checkout began clean. `HEAD` and `origin/main` both resolved to the exact
candidate SHA.

| Check | Result | Evidence |
| --- | --- | --- |
| Locked install | PASS | Node 22.23.2, npm 10.9.8; 255 packages installed; 0 vulnerabilities. |
| Full suite | PASS | `npm test`: 5/5 Vitest tests and 82/82 Playwright tests passed. |
| Lint | PASS | `npm run lint`. |
| Types | PASS | `npm run typecheck`. |
| Production build | PASS | `npm run build`; Vite 7.3.6 produced `dist/`. |
| Dependency audit | PASS | `npm audit --audit-level=high`: 0 vulnerabilities. |
| Capacitor sync | PASS | `npm run cap:sync`; exact web output copied into Android. |
| Capacitor doctor | PASS | `npx cap doctor android`: “Android looking great.” |
| Debug APK | ENVIRONMENT BLOCKED | `android/gradlew assembleDebug --no-daemon` cannot start because this deploy-none image has no Java/JDK or `JAVA_HOME`. |

The app ID is `in.sociobot.speakerlanecaptions`, Android requests only Internet
and record-audio permissions, backup is disabled, cleartext is disabled, and no
keystore or secret is present. A physical Android microphone, lifecycle, back
gesture, offline restart, and update test remains outside this worker.

## Deployment identity

`npm run test:live` passed checkout, favicon, response policy, unknown-route,
and every deployable-file identity check. Independent SHA-256 checks matched:

| Artifact | Local and live SHA-256 |
| --- | --- |
| `index.html` | `822d47ac94c4cf1a2ee39f751a7716f392a556a785bd4a7d975028fa755b11d0` |
| `assets/app-Cu6QA85G.js` | `3be5b7cd0d3e7424c767ebf0830f11e1c808ba990d981520f47bd60c287750d3` |
| `assets/styles-32xCiNL1.css` | `ac9576aaad3ea9a8bbbf35e7da67f700726cd19ea2b207c66228f221e4c4383f` |
| `sw.js` | `694442562ad8b5e8c501c2ab50bf54789023ff26ea8d896f895ba7b3aba20d67` |

This is fresh evidence that production is the candidate, not a deployment-only
failure or an older build.

## Independent end-to-end exercise

- Desktop and 390 px live demo loads had no console/page errors and no
  horizontal overflow. The six samples populated Left, Centre, and Right.
- Direction controls, keyboard submission, blank rejection, the exact
  240-character boundary, persistence, export, valid import, malformed import,
  import cancellation, clear cancellation, and confirmed clear all worked.
- Exported JSON contained caption rows and `rawAudioStored: false`.
- Text resembling `<img src=x onerror=alert(1)>` rendered literally; it created
  no image and executed no script.
- Demo reset returned to six bundled captions after an edit. Start for real
  removed demo changes and returned to consent setup.
- Start captions without the required checkbox made zero microphone calls.
  Typed Pause/Resume also made zero microphone calls.
- The claim fixtures separately covered accepted/rejected on-device speech,
  language-pack ordering, mono/stereo direction, confidence 0.59/0.60,
  permission recovery, and every microphone stop path.
- All discovered product links returned 200, except the deliberately designed
  unknown route (404); checkout returned 303 to
  `checkout.dodopayments.com`. Mail links were present and well formed.

## Accessibility, mobile, and motion

- Independent axe-core scans reported zero serious or critical findings on the
  live demo at desktop and 390 px, Privacy, Terms, and the 404 page.
- The root has `lang="en"`, a descriptive title, one visible `h1`, `main`,
  labelled controls, and alt text. Legal pages each have their own title,
  canonical metadata, one `h1`, and `main`.
- Keyboard Tab exposed the skip link with a 3 px Lantern focus outline; Enter
  focused `main`. Escape closed Settings and restored focus to its opener.
- Every visible interactive target measured at least 44 x 44 CSS px at 390 px.
- Under reduced motion, animation and transition durations computed to
  `0.01ms`, scroll behavior was `auto`, and no horizontal overflow appeared.
- `/opt/fleet/lib/verify-url.sh` passed after its output directory was created:
  HTTP 200, 626 ms load, no errors, title/lang/main, one `h1`, no missing alt,
  and no unlabelled buttons. Evidence:
  `evidence/verification-7/verify-url/verify.json`.

## Privacy, network, PWA, and server policy

- A fresh root-to-demo flow contacted only
  `https://speaker-lane-captions.sociobot.in`; demo interaction and export made
  no microphone or billing request.
- The only cross-origin application route is the documented Sociobot purchase
  and license verification API. There is no sign-in, analytics, cloud archive,
  CDN font, remote script, or Azure model call.
- HTTPS is enforced with HTTP 301. Live HTML includes HSTS, restrictive CSP
  with `frame-ancestors 'none'`, microphone-only Permissions-Policy,
  `nosniff`, strict-origin referrer policy, and `X-Frame-Options: DENY`.
- HTML revalidates after 30 seconds, hashed JS/CSS/images are one-year
  immutable, and `sw.js` is `no-cache`.
- The live service worker controlled the page and populated the versioned cache
  `caption-lanes-669a08ff29c7`. A controlled offline `/demo` reload retained
  the banner and all six samples without errors. The full suite's update test
  also passed.
- The license verification endpoint allowed 30 invalid-token requests from one
  client. Request **31** returned **429** and `Retry-After: 4`. Successful
  invalid responses were HTTP 200 with `valid:false` and `Cache-Control:
  no-store`; an origin-bearing request returned the exact product origin in
  `Access-Control-Allow-Origin`.

## Performance

Production output is 200,240 bytes. Main JS is 20,249 bytes raw / 7,401 bytes
gzip; CSS is 17,033 bytes raw / 4,657 bytes gzip; the mobile hero is 8,074
bytes; there is no font payload. These pass the bundle budgets.

Two independent cold Lighthouse 12.8.2 mobile runs of live `/demo` produced:

| Run | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 92 | 100 | 100 | 100 | 1.02 s | 1.06 s | 192 ms | **0.133** | 74 KiB |
| 2 | 91 | 100 | 100 | 100 | 0.90 s | 1.05 s | 220 ms | **0.133** | 74 KiB |

Evidence: `evidence/verification-7/lighthouse-live.json` and
`evidence/verification-7/lighthouse-live-repeat.json`.

## Defects

### P1 — revocation leaves a hidden active paid lane and hides new captions

**Reproduction:** On the live candidate, restore a deterministically mocked
valid license, enter typed mode, select Across, then return a revoked verdict
on the documented reconnect check. The fourth lane disappears. Type and submit
a new caption.

**Observed:** visible lanes changed from four to three, but zero direction
buttons had `aria-pressed="true"`. The submitted caption had zero visible
matches while IndexedDB contained it with `lane: "across"`. No error or recovery
message explained the missing text. Screenshot:
`evidence/verification-7/live-revocation-hidden-caption.png`.

**Cause:** `updateLicense()` changes `plus` and rerenders, but does not move
`activeLane` away from `across`; `addCaption()` then keeps storing that hidden
lane (`src/main.ts` lines 338–346 and 242–249).

**Impact:** a normal refund/revocation path silently hides newly entered core
captions. The free caption workflow is broken until the user happens to select
another direction. This is not covered by the count-only revoked-license test.

**Required fix:** whenever Plus becomes invalid, move an active `across` lane
to a visible lane, announce the change, and add a regression that submits a
caption after revocation and proves it remains visible.

### P1 — public claims are absent from the mandatory claim inventory

The always-visible header says **“Local only”**, but a licensed real flow sends
the license token to `api.sociobot.in`; the claim is absolute and is not listed
in `.factory/claims.json`. The offline notice says **“Captions keep working if
the on-device language pack is installed”**, but `offline-reload` proves only
that the shell/demo reloads offline, not that live speech recognition produces
captions offline. Neither phrase appears in `.factory/copy-audit.md`.

The supplied claims contract states that any claim-like sentence missing from
the inventory fails review. Qualify/remove these statements or add exact claim
entries and observable sandbox tests for the narrower promises.

### P2 — live demo exceeds the CLS budget

Both fresh Lighthouse mobile runs measured CLS **0.13314061556496176**, above
the required `< 0.1`. Lighthouse attributed 0.126 of the shift to
`section#welcome > div.hero-art`: `/demo` first paints the landing hero, then
client initialization replaces it with the demo room. Reserve the route's
initial layout or render the demo state before first paint, then repeat cold
mobile runs.

## Remaining validation

- Build and smoke-test the debug APK on a JDK/Android-SDK worker, then test real
  Android permission denial/allow, language-pack support, mono/stereo direction,
  background/close lifecycle, back gesture, install/update, and offline restart.
- Run the brief's four-person, 30-utterance study. The 80% attribution target is
  not claimed by the product and still needs human participants.
