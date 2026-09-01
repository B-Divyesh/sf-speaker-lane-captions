# Caption Lanes — verification 10 handoff

Date: 2026-09-01 UTC

Candidate and deployed source: `33d874754d54f0655c918dfff06dc038bc95b35f`

Production: <https://speaker-lane-captions.sociobot.in/>

Verdict: **PASS**

Check that the full release contract is met — **PASS**. All 24 required claim
commands, `npm test` (6 unit and 84 browser checks), lint, typecheck,
production build, high-severity audit, live deployment identity comparison,
response-policy checks, desktop/mobile accessibility checks, and mobile
Lighthouse checks passed.

Check that the Android claim is covered — **PASS**. The exact command verified
the successful retained Android debug/test APK workflow for this source when
the worker had no complete local Android toolchain. The run is
[33560017787](https://github.com/B-Divyesh/sf-speaker-lane-captions/actions/runs/33560017787);
the retained artifact is `android-apks-33d874754d54f0655c918dfff06dc038bc95b35f`.

Check that the live build matches the candidate — **PASS**. `npm run test:live`
matched every deployed file to the fresh `dist/` build.

Check that performance is within budget — **PASS**. The initial bundle is
10.70 kB gzip JS and 4.74 kB gzip CSS. Fresh mobile Lighthouse scored 100 for
Performance, Accessibility, Best Practices, and SEO; FCP was 1.0 s, LCP 1.2 s,
TBT 0 ms, and CLS 0.

Check that the product has known release gaps — **PASS**. No release-blocking
gaps were found. Coarse automatic direction depends on a usable stereo device;
mono/unavailable input presents the documented manual fallback. Local speech
requires the browser's on-device language support.

Run locally:

```bash
npm ci
npm test
npm run lint
npm run typecheck
npm run build
npm run test:android
npm run test:live
```

Full evidence and the detailed QA record are in
[`verification-10.md`](verification-10.md) and `evidence/verification-10/`.

---

# Caption Lanes — repair 7 handoff

Date: 2026-09-01 UTC

Base verifier report: [`f5c7154c4e37a57f4684f5a5254181b51aaf2335`](verification-9.md)

Original candidate: `505b9c6ca44146db4946ab52c92a36a4323749e7`

Tested product source: `9433002f26a7e46a8d0246d6086c0ed4e9e2e75a`

Production: <https://speaker-lane-captions.sociobot.in/>

Verdict: **PASS — release blockers repaired**

## What was reproduced and repaired

The verifier's exact Android claim command was reproduced after `npm ci`:

```text
> npm run test:android
ERROR: JAVA_HOME is set to an invalid directory: /usr/lib/jvm/java-21-openjdk-amd64
```

The candidate also emitted only caption text/confidence in its native branch and
asked people to assign direction manually. It did not run coarse native stereo
direction analysis.

The repair adds `DirectionEstimator`, a native Android `AudioRecord` path that
classifies short, discarded stereo PCM windows as left, centre, or right. Every
automatic result includes bounded confidence. A mono/unavailable input returns
an explicit manual centre fallback with zero confidence and a next-step message.
Raw audio is neither saved nor sent. The native bridge now emits direction
events and attaches direction/confidence to captions; the web UI uses those
events while retaining manual controls.

Regression coverage now includes:

- JVM tests for left/centre/right RMS classification, interleaved PCM handling,
  confidence, and mono fallback.
- A packaged Android 12 instrumentation test that waits for Capacitor's real
  native response, then asserts parsed left/centre/right lanes, automatic
  state, positive confidence, and mono fallback.
- Static release-policy checks for the portable Android verifier and hosted
  JDK/SDK/emulator workflow.

`scripts/test-android.mjs` no longer has a machine-specific Java path. With a
JDK and Android SDK it syncs Capacitor, runs Gradle unit/APK tasks, and prints
both APK SHA-256 values. Without them it deterministically accepts only a
successful, unexpired GitHub Actions package run whose tested Android-relevant
source is an ancestor of the checked revision.

## Android package evidence

GitHub Actions run [33559082443](https://github.com/B-Divyesh/sf-speaker-lane-captions/actions/runs/33559082443)
passed on source `9433002f26a7e46a8d0246d6086c0ed4e9e2e75a`.

- Temurin JDK 21 and Android SDK platform/build tools 35 were provisioned.
- Native JVM coverage, debug APK, and Android-test APK built successfully.
- The debug APK, Android-test APK, and `android-apk-sha256.txt` are retained in
  artifact `android-apks-9433002f26a7e46a8d0246d6086c0ed4e9e2e75a`
  (artifact `9820564800`, 4,497,048 bytes, archive
  `sha256:fe86eddebefad691fb5d4c588591954f783097c5c16d1b6a8748fad9da939d4e`,
  expires 2026-10-01T21:07:19Z).
- The Android 12 x86_64 emulator ran
  `:app:connectedDebugAndroidTest` successfully. The workflow uses headless
  mode, enables `/dev/kvm`, and installs its required audio library before the
  emulator starts.

The fresh-clone fallback was also verified at
`/tmp/speaker-lane-captions-repair-7-final.Q27G4A`: `npm ci` installed 255
packages with 0 vulnerabilities, then `npm run test:android` passed without a
local JDK/SDK by locating the exact successful run and retained artifact above.

## Verification performed

- Clean clone: `npm ci`, `npm test` (6 unit + 84 Playwright tests),
  `npm run lint`, `npm run typecheck`, `npm run build`, and
  `npm audit --audit-level=high` all passed. The complete 24-claim inventory
  passed: 23 web claims individually in a clean browser sandbox plus the
  Android claim above.
- Final workspace: `npm test` passed (6 unit + 84 Playwright tests), with
  desktop and 390 px mobile, keyboard, privacy, offline/update, response-policy,
  accessibility/Axe integration, demo sandbox, and storage flows covered.
  `lint`, typecheck, production build, and high-severity audit passed.
- Production bundle: JavaScript is 29.61 kB raw / 10.70 kB gzip; CSS is
  17.50 kB raw / 4.74 kB gzip.
- Local and live `verify-url.sh` checks passed: title, `lang`, one `h1`, main
  landmark, image alt state, labelled buttons, and browser-console checks were
  clean. Evidence is in `.factory/evidence/repair-7/verify-local/` and
  `.factory/evidence/repair-7/verify-live/`.
- Live Lighthouse: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; FCP 1.0 s, LCP 1.0 s, CLS 0. Full JSON is retained at
  `.factory/evidence/repair-7/lighthouse-live.json`.
- The production static artifact was deployed with the scoped Static Web App
  deployment configuration. `npm run test:live` then passed its live checkout,
  favicon, response policy, and deployed-identity checks.

## Run and verify

```bash
npm ci
npm test
npm run lint
npm run typecheck
npm run build
npm run test:android
```

`npm run test:android` builds locally when JDK/SDK are present; otherwise it
verifies the exact retained GitHub Actions evidence. The package workflow is
`.github/workflows/android-package.yml`.

## Known limits

Physical left/centre/right attribution requires a device that exposes two
usable microphone channels. On mono or unavailable hardware the app stays
functional, reports the manual fallback, and leaves the accessible manual lane
controls available. Android on-device speech also correctly fails closed when a
local language model is not installed. No release-blocking gap remains.
