# Independent verification 3 — FAIL

Date: 2026-08-28 UTC

Work order: `speaker-lane-captions-verify-3`

Candidate: `083bf21d4b00bcdfa8a3b9479a2d74518a193dff`

Live URL: <https://speaker-lane-captions.sociobot.in/>

Browser: Google Chrome for Testing 145.0.7632.6 / Playwright 1.58.2

## Verdict

**FAIL.** The live deployment is the candidate's exact web artifact, all
repository gates pass, the earlier consent, checkout, favicon, touch-target,
cache, and response-policy defects remain repaired, and the core typed-caption
and mocked on-device microphone paths work. However, valid transcript import
silently and irreversibly deletes the transcript already stored on the device.
That is a release-blocking data-loss path and violates the acceptance contract's
requirement that destructive actions be reversible or confirmed with specifics.

No product code was modified during verification. This report and the handoff
are the only intended repository changes.

## Clean checkout and quality gates

The supplied checkout was clean. A fresh `git fetch origin --prune` confirmed
that both `HEAD` and `origin/main` were
`083bf21d4b00bcdfa8a3b9479a2d74518a193dff` before testing.

| Check | Result | Evidence |
| --- | --- | --- |
| Locked install | PASS | Node 22.23.2 / npm 10.9.8; `npm ci` installed 255 packages and reported 0 vulnerabilities. |
| Dependency audit | PASS | `npm audit --audit-level=high`: 0 vulnerabilities. |
| Unit/integration tests | PASS | `npm test`: 3/3 Vitest tests and 14/14 Playwright cases passed across desktop Chromium and exact 390×844 mobile. |
| Lint | PASS | `npm run lint` completed cleanly with ESLint 10.9.1. |
| Type check | PASS | `npm run typecheck` completed cleanly with TypeScript 5.9.2. |
| Exact production build | PASS | `npm run build` ran `tsc --noEmit`, Vite 7.3.6, and the service-worker builder; `dist/` was produced. |
| Capacitor sync | PASS | `npm run cap:sync` rebuilt and copied the exact web output into `android/app/src/main/assets/public`; `npx cap doctor android` reported “Android looking great.” |
| Android debug APK | ENVIRONMENT BLOCKED | `android/gradlew assembleDebug --no-daemon` could not start because this deploy-none worker has no `java`, `JAVA_HOME`, Android SDK, or SDK environment variables. No APK pass is claimed. |

The production output is 220 KiB total. Its main JS is 14,790 bytes (5.76 KiB
gzip), CSS is 13,207 bytes (3.87 KiB gzip), the mobile hero is 8,074 bytes, the
desktop hero is 26,114 bytes, and no font is shipped. These are comfortably
inside the 200 KiB JS, 50 KiB CSS, 300 KiB hero, and 120 KiB font budgets.

Key local production hashes:

- `index.html`: `a7761f271578f3641ed4e875f29265ebfc42d08df30643de17826ce29fc12ada`
- `assets/app-v5UHxKyR.js`: `1f08d1309cf816d22e822cc9a40c994e6c293d863b04d514c2bf1f21b1b25d5e`
- `sw.js`: `cfe7b25cc2b07971c4404e572ecf6911be8133a4921b49c2eab55030e4a9f2af`

## End-to-end product exercise

Independent checks ran against the live origin at 1440×900 desktop and 390×844
mobile, in addition to the repository suite.

- Consent was enforced by native validation: submitting without the checkbox
  left the setup screen visible and made zero mocked `getUserMedia` calls.
- Typed mode focused the backup input. Pause then Resume kept
  “Typed-caption mode · microphone is off” and made zero microphone calls.
- Left/Centre/Right selection, keyboard Enter submission, and number-key lane
  selection worked. Whitespace-only input was ignored and interactive typing
  stopped at the 240-character boundary.
- Literal `<img onerror=…>` caption content rendered as text; it created no
  element and executed no script.
- A consented, mocked local-speech session requested audio once, disclosed a
  mono microphone limitation, stopped its track on Pause, requested again on
  Resume, and stopped on End. A denied request produced actionable Android
  settings/typed-mode guidance. A speech implementation without
  `processLocally` was refused rather than silently using cloud recognition.
- Mocked 40% recognition-confidence text disappeared when “Hide uncertain
  captions” was enabled, while mocked 90% text remained.
- Export downloaded valid JSON with all three test captions,
  `product: "Caption Lanes"`, and `rawAudioStored: false`.
- Malformed JSON import produced “That file is not a Caption Lanes transcript.”
  without changing the room. Valid import worked, but exposed the blocking data
  loss documented below.
- Clear cancellation retained the imported caption; accepting the explicit
  count-based confirmation removed it. Caption size at the 36 px upper boundary
  persisted through reload.
- A mocked valid returned license was saved under
  `sb_license:speaker-lane-captions`, removed from the visible URL, verified
  once, cached across reload for the daily interval, and exposed four lanes.
  A real invalid token returned HTTP 200 with `{valid:false, reason:"invalid"}`.
- The Sociobot checkout returned HTTP 303 to Dodo. Following the hosted URL
  returned HTTP 200 and showed **Caption Lanes Plus**, **$24.00**, USD, and a
  one-time price. No payment was submitted.

## Mobile, keyboard, accessibility, and visual checks

- At 390×844, the page had `scrollWidth === innerWidth === 390`, lanes stacked
  Left/Centre/Right in order, and settings/upgrade dialogs remained within the
  viewport. Screenshots of setup, room, settings, and upgrade were inspected;
  no clipping, collision, unreadable text, or visual fallback was found.
- All visible mobile controls had an effective labelled hit area of at least
  44×44 CSS pixels. Session controls measured about 116.66×48 px; the wrapped
  low-confidence checkbox label measured 306×98.31 px.
- Keyboard Tab revealed the skip link at `top: 12px`, 44 px high, with a 3 px
  Lantern outline. Enter skipped to the main form; subsequent Tab reached the
  consent control. Typed mode focused the caption input, Enter submitted, and
  number shortcuts worked away from text fields.
- Native dialogs trapped focus; Escape closed them and restored focus to the
  invoking button.
- Independent axe-core scans reported zero serious or critical findings on the
  setup screen, populated room, settings dialog, `/privacy/`, and `/terms/`.
- The live document has `lang="en"`, a descriptive title, exactly one `h1`, a
  `main` landmark, no missing image alt, and no unlabeled button. Both legal
  routes returned HTTP 200.
- Under `prefers-reduced-motion: reduce`, caption animation and transitions
  computed to `0.01ms`, one iteration, and scrolling became `auto`.
- `/opt/fleet/lib/verify-url.sh` passed live: 607 ms network-idle load, zero
  console/page errors, title/lang/main present, one h1, no missing alt, and no
  unlabeled buttons.

## PWA, privacy, and network policy

- Chromium parsed `manifest.webmanifest` with zero manifest or installability
  errors. It declares standalone display, a versioned start URL, dark splash
  colors, 192/512 icons, and a maskable purpose.
- The live service worker controlled the page and created cache
  `caption-lanes-9e6921f63b97` with 11 shell entries, including hashed JS/CSS.
  A controlled offline reload rendered the app. A never-before-visited offline
  route rendered `Offline — Caption Lanes` with “You’re offline.”
- An isolated update simulation served the exact build with only a new service
  worker revision. It displayed “An update is ready,” activated and claimed the
  page, removed the old cache after activation, and reloaded successfully
  offline with no errors.
- Fresh-load browser capture contacted only the Caption Lanes origin. Source
  and runtime inspection found no analytics, remote scripts/fonts, trackers,
  `MediaRecorder`, or raw-audio persistence. Captions use IndexedDB; preferences
  and license state use localStorage. The only application cross-origin request
  is the required Sociobot license verification call.
- HTTPS is enforced with an HTTP 301. Live responses include HSTS,
  `nosniff`, `strict-origin-when-cross-origin`, a restrictive CSP with
  `frame-ancestors 'none'`, `Permissions-Policy: microphone=(self)` with camera,
  geolocation, payment, and USB disabled, and `X-Frame-Options: DENY`.
- Hashed JS/CSS and hero assets return
  `Cache-Control: public, max-age=31536000, immutable`; `sw.js` returns
  `no-cache`; HTML uses `public, must-revalidate, max-age=30`. The verification
  API returns `no-store` and origin-specific CORS.

## Deployment identity and performance

`npm run test:live` passed. An independent byte comparison also fetched every
deployable file in `dist/` (excluding host-only `staticwebapp.config.json`) and
found **16/16 exact matches** with no mismatches. Live `index.html`, app JS, and
service-worker SHA-256 values equal the local hashes above. This resolves the
prior deployment-only uncertainty with fresh evidence.

Three Lighthouse 12.8.2 mobile samples were captured against live:

| Sample | Performance | Accessibility | Best Practices | SEO | FCP | LCP | TBT | CLS | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 86 | 100 | 100 | 100 | 0.97 s | 1.01 s | 542 ms | 0 | 40,514 B |
| 2 | 96 | 100 | 100 | 100 | 1.07 s | 1.28 s | 228 ms | 0 | 40,514 B |
| 3 | 95 | 100 | 100 | 100 | 0.98 s | 0.98 s | 261 ms | 0 | 40,535 B |

The median Performance score is 95, LCP is below 1.3 s in every sample, CLS is
zero, and Lighthouse recorded no console errors or third-party transfer. The
first sample's CPU-only TBT outlier is retained here rather than hidden; two
fresh reruns cleared the ≥90 score threshold. Lighthouse did not emit field INP.

## Defects

### P1 — valid import silently and irreversibly deletes the current transcript

**Reproduction:** In typed mode, add “Existing one” and “Existing two.” Open
Settings and choose **Import transcript**. Select a valid Caption Lanes JSON file
containing one caption.

**Actual:** No confirmation or undo is offered. The two existing captions are
immediately replaced by “Replacement only”; after reload, only the imported
caption remains. An independent live run recorded `dialogs: 0`, two captions
before import, one after import, and the same single caption after reload.
`replaceCaptions()` clears the IndexedDB store before inserting the imported
entries.

**Expected:** Because import replaces saved user data, explicitly say how many
current captions will be replaced and require confirmation, or make the action
reversible. A merge/new-session option is also acceptable if its behavior is
clear.

**Impact:** A user can permanently lose an unexported conversation by using a
normal data-ownership feature. This directly violates the supplied product
principle that destructive actions are reversible or confirmed with specifics.

### P3 — the implemented settings omit lane renaming promised by the visual thesis

`.factory/design.md` says users can rename the visible lane label, and the data
model stores a label per lane. The shipped settings expose lock/color controls
but no label editor. This does not block directional captioning, but the
source-of-truth interaction contract and implementation disagree.

## Required re-verification

1. Add a confirmation/undo or non-destructive import behavior and automate the
   existing-transcript case, including persistence after reload.
2. Resolve the lane-renaming design/implementation mismatch, either by shipping
   the scoped control or explicitly correcting the approved visual thesis.
3. In an Android/JDK/SDK worker, build and smoke-test the debug APK. On physical
   Android hardware, verify permission allow/deny, local language-pack install,
   mono/stereo direction behavior, app background/return, back gesture, safe
   areas, install/update, and offline restart.
4. Run the brief's four-person, 30-utterance attribution study. No evidence in
   this repository proves the stated ≥80% outcome.
