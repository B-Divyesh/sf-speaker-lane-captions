# Independent verification 6 — PASS

Date: 2026-08-30 UTC  
Work order: `speaker-lane-captions-verify-6`  
Candidate: `345af62283c9cb2138d78566316e5a2217300ec1`  
Live URL: <https://speaker-lane-captions.sociobot.in/>

## Verdict

**PASS.** Fresh evidence shows that production is byte-identical to the
candidate and that the repaired sample demo, local-first caption flow,
privacy boundaries, offline PWA flow, accessibility baseline, and licensing
flow work as specified. There are no P0, P1, or P2 product defects found in
this verification.

The only unfinished validation is an Android debug-APK/device smoke test. It
is blocked by this worker image having no Java/JDK (`JAVA_HOME` is unset and
`java` is absent), not by a build failure in the project. This is a known
external follow-up, not a release-blocking web deployment defect.

## Mandatory entry checks

### Cold first read — PASS

A fresh 1440 x 900 browser load said, in plain words:

- **What it does:** “Place live captions by speaker direction.”
- **For whom:** “For Deaf and hard-of-hearing people who need to follow small,
  in-person conversations.”
- **What to do first:** the visible **Try it with sample data** action says it
  opens a saved sample conversation without using a microphone.

The first screen also displays its three short privacy, offline, and price
facts. Clicking the action opens `/demo` in one step. The six realistic
captions are already distributed across Left, Centre, and Right; the persistent
banner says “Demo — sample data, nothing is saved” and offers Reset demo and
Start for real.

### Claims gate — PASS

`.factory/claims.json` is present and lists 12 exact demo-entry-point commands.
Each was run from the clean checkout and passed in both configured Chromium
projects (desktop and 390 x 844 mobile):

| Claim id | Result |
| --- | --- |
| `demo-isolation` | PASS |
| `directional-lanes` | PASS |
| `stereo-direction` | PASS |
| `local-privacy` | PASS |
| `raw-audio-storage` | PASS |
| `offline-reload` | PASS |
| `caption-persistence` | PASS |
| `transcript-portability` | PASS |
| `typed-limit` | PASS |
| `confidence-filter` | PASS |
| `local-speech` | PASS |
| `plus-license` | PASS |

The recorded claim run is in the worker temporary evidence log
`/tmp/caption-lanes-claims-final.*/results.log`; every command reports two
passing tests and exit 0.

## Clean-checkout quality gates

| Check | Result | Evidence |
| --- | --- | --- |
| Candidate identity and initial tree | PASS | `git rev-parse HEAD` = the candidate SHA; tree began clean. |
| Locked install | PASS | `npm ci` installed 255 packages; audit found 0 vulnerabilities. |
| Lint and types | PASS | `npm run lint`; `npm run typecheck`. |
| Full test suite | PASS | `npm test`: 5/5 Vitest tests and 54/54 Playwright tests passed. |
| Exact production build | PASS | `npm run build` completed and produced `dist/`. |
| Live identity | PASS | `npm run test:live` passed checkout, favicon, response policy, and every deployable artifact identity check. |
| Capacitor synchronization | PASS | `npm run cap:sync` copied the exact build; `npx cap doctor android` reports “Android looking great!” |
| Android debug APK | ENVIRONMENT BLOCKED | `./gradlew assembleDebug` cannot start because this worker has no Java/JDK. |

The built main JS is 18,239 bytes (6,882 bytes gzip) and CSS is 16,853 bytes
(4,604 bytes gzip): well within the static initial-JS/CSS budgets. The full
`dist/` build is 195,112 bytes.

## Independent live product exercise

- Demo mode showed all three directional lanes and six seeded captions at
  desktop and 390 px widths, without horizontal overflow.
- A typed caption could be placed with the lane controls and keyboard shortcut;
  the claim suite independently covered blank input, the exact 240-character
  limit, JSON export/import, persistence, confidence-boundary filtering, reset,
  and recovery from rejected local-speech support.
- Stereo and mono audio behavior, consent-before-microphone, paused-track
  cleanup, no `MediaRecorder`, and on-device speech enforcement were exercised
  using recorded browser fixtures in the claim suite. No identity or raw-audio
  storage path was found.
- A fresh controlled production service worker cached the demo shell. With the
  browser offline, `/demo` reloaded with its sample captions and banner visible
  and no console/page errors. The full suite also passes its update-toast
  regression.

## Privacy, accessibility, headers, and performance

- Fresh production demo request logs contained only
  `https://speaker-lane-captions.sociobot.in`; the demo neither requested a
  microphone nor contacted the billing origin. No console or page errors were
  observed on root or demo loads.
- Independent axe scans of live desktop and 390 px `/demo` had zero serious or
  critical violations. The repository suite additionally covers skip
  navigation, keyboard dialog return, visible 3 px lane focus, 44 px targets,
  reduced motion, and 320 px reflow.
- Root, demo, privacy, terms, asset, worker, and unknown-route responses were
  checked. HTML uses short revalidation; hashed assets are one-year immutable;
  `sw.js` is `no-cache`. The deployed 404 returns HTTP 404. HSTS, nosniff,
  strict-origin referrer policy, restrictive CSP with response-header
  `frame-ancestors 'none'`, microphone-only permissions policy, and
  `X-Frame-Options: DENY` are present.
- Live Lighthouse 12.8.2 mobile `/demo`: Performance **100**,
  Accessibility **100**, Best Practices **100**, SEO **100**; FCP/LCP 1.2 s,
  TBT 30 ms, CLS 0.008, total transfer 74 KiB.
- The product has no sign-in. The only server-side product endpoint used at
  runtime is Sociobot license verification. A fresh single-client burst of
  invalid-license checks succeeded 30 times; request 31 returned **429** with
  `Retry-After: 4`. Successful invalid responses are `200`, `valid:false`, and
  `Cache-Control: no-store`.

## Defects and follow-up

| Severity | Finding |
| --- | --- |
| P0/P1/P2 | None found. |
| Verification limitation | Build and smoke-test the debug APK on a JDK/Android worker, then test real Android microphone permission, Web Speech language-pack support, mono/stereo behavior, lifecycle/back gesture, install/update, and offline restart. |
| Product-validation follow-up | The brief’s four-person, 30-utterance study for 80% correct attribution still requires human participants. No unsupported success claim is made. |

No product source was modified during verification. Evidence documentation and
the handoff only were added after the checks.
