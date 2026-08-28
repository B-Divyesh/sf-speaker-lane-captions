# Independent verification 2 — FAIL

Date: 2026-08-28 UTC

Work order: `speaker-lane-captions-verify-2`
Candidate: `433fdf86882c21e918bdddc25326bf291ffddb6a`
Live URL: https://speaker-lane-captions.sociobot.in/
Browser: Google Chrome for Testing 145.0.7632.6 (Playwright 1.58.2)

## Verdict

**FAIL.** The deployed web artifact now matches the candidate byte-for-byte and
the previously reported consent/privacy defect is fixed. The free typed-caption
job, local persistence, privacy controls, accessibility automation, PWA offline
reload, and performance budgets otherwise work.

The release still fails its acceptance contract for three independently
reproduced reasons:

1. The advertised one-time purchase cannot be bought: the live Sociobot
   checkout endpoint returns HTTP 404.
2. A fresh load logs a browser console error because `/favicon.ico` returns
   HTTP 404, contrary to the explicit no-console-errors gate.
3. Several mobile interactive targets are below the contract's 44×44 CSS-pixel
   minimum.

No product source was modified during verification. Only this report and the
handoff were added/updated.

## Clean-checkout quality gates

Testing ran in a new detached Git worktree at the exact candidate SHA.

| Check | Result | Evidence |
| --- | --- | --- |
| Clean identity | PASS | Worktree began clean at `433fdf86882c21e918bdddc25326bf291ffddb6a`. |
| Locked install | PASS | Node 22.23.2 / npm 10.9.8; `npm ci` installed 186 packages; audit found 0 vulnerabilities. |
| Repository test command | PASS | `npm test`: 2/2 Vitest tests and 5/5 Playwright tests passed. The browser suite includes the repaired typed Pause/Resume privacy regression. |
| Type check | PASS | `npm run build` runs `tsc --noEmit`; passed. |
| Production build | PASS | Exact `npm run build` passed under Vite 7.3.6 and produced `dist/`. |
| Lint | NOT AVAILABLE | No lint script or separate lint configuration exists. |
| Capacitor sync | PASS | `npm run cap:sync` rebuilt and copied `dist/` into the Android project. |
| Android debug APK | ENVIRONMENT BLOCKED | `android/gradlew assembleDebug --no-daemon` exited 1 before Gradle: this worker has no `java` and no `JAVA_HOME`. No APK result is claimed. |

Production build sizes were 14,781 bytes JS (5,815 gzip), 12,850 bytes CSS
(3,838 gzip), 8,074 bytes for the 720 px hero, and 26,114 bytes for the 1280
px hero. The entire `dist/` occupied 180 KiB. These are well below the stated
JS, CSS, font, and hero-image budgets.

## Deployment identity and HTTP evidence

All 15 files in the clean local `dist/` were fetched from the live origin and
compared with `cmp`; every file matched. Key SHA-256 values:

| Artifact | Local | Live |
| --- | --- | --- |
| `index.html` | `4a00ca36e2a598605cdb2cdaa0841461756738150ca3d58c95ac41827499cb75` | same |
| `assets/app.js` | `49357dd106f9dbc452c51cc0253d15e3af8387c3a1a8b798df3238ac42e6e267` | same |

The candidate commit itself changes only repair-verification documentation;
its production output contains the repaired code from parent `2e581be` and is
the exact output served live. This closes the builder's earlier deployment-only
uncertainty.

HTTP redirects to HTTPS. Live root responses include HSTS
(`max-age=10886400; includeSubDomains; preload`), `nosniff`,
`strict-origin-when-cross-origin`, and `x-dns-prefetch-control: off`. Root and
static assets use `cache-control: public, must-revalidate, max-age=30`.

## Independent product exercise

Tests were run against the live URL at 1440×900 desktop and 390×844 mobile.

- The repaired consent boundary passed. Submitting without checking consent
  kept the setup screen open and made 0 mocked microphone calls. Entering typed
  mode, then Pause and Resume, also made 0 calls and retained “Typed-caption
  mode · microphone is off.”
- A consented microphone session made one expected microphone request. A mono
  mock displayed the limitation; Pause called the track's `stop()` and reported
  “Paused · microphone is off.” A denied request displayed actionable recovery
  copy, and typed captions remained usable.
- Typed captions were placed in Left/Right lanes using buttons, Enter, and
  number shortcuts. Empty lanes, End, Pause/Resume, three-lane free mode, and a
  mocked valid four-lane Plus mode rendered correctly.
- A 240-character input was truncated to 240; whitespace-only input was
  ignored. Literal `<img onerror=…>` text was escaped and created no element or
  script execution.
- Export downloaded parseable JSON with `rawAudioStored: false`. Invalid JSON
  import produced “That file is not a Caption Lanes transcript.” Valid import
  replaced and persisted the transcript. Clear cancellation preserved data;
  confirmation removed it.
- Caption size at the 36 px upper boundary persisted across reload. Unlocking a
  lane color enabled the swatch and changed/persisted its color.
- Low-confidence mocked speech disappeared when “Hide uncertain captions” was
  enabled while high-confidence speech remained.
- A returned license was stored under the documented key, removed from the
  URL, verified once, cached across reload within one day, and unlocked four
  lanes under a mocked valid response. A real invalid-token restore reached
  only the Sociobot API and rendered “This license is no longer active.”
- Desktop and mobile had no horizontal overflow. The 390 px room stacked lanes
  in Left/Centre/Right physical order. Visual screenshots were inspected.
- Apart from the favicon defect below, exercised flows produced no page
  exceptions.

## Accessibility, keyboard, motion, and performance

- Independent `@axe-core/playwright` scans found 0 serious/critical violations
  on the initial screen and populated mobile room. The repository suite also
  scans both legal routes.
- The live document has a title, English `lang`, one `h1`, `main`, labelled
  forms, ordered headings, and meaningful hero alt text.
- Keyboard-only setup reached “Explore with typed captions” via Tab/Enter,
  focused the caption input, and submitted a caption. The skip link became
  visible at top 12 px with a 3 px solid focus ring. Modal controls did not
  allow focus onto an outside interactive control; Escape closed the dialog and
  returned focus to Settings.
- With `prefers-reduced-motion: reduce`, caption animation duration computed to
  `0.01ms`, one iteration, and document scrolling became `auto`.
- Lighthouse 12.8.2 mobile against live scored Performance 99,
  Accessibility 100, Best Practices 96, and SEO 100. FCP was 1.0 s, LCP 1.0 s,
  CLS 0, TBT 120 ms, and interactive 1.2 s. Initial transfer was about 41 KiB.
  Lighthouse's Best Practices loss is the favicon console error documented
  below. A lab INP value was not produced.

## PWA, privacy, and outbound requests

- Chromium parsed the live manifest with no manifest errors. It has standalone
  display, a versioned start URL, matching theme/background colors, and 192/512
  icons including maskable purpose. The only installability result was
  `in-incognito`, an automation-context limitation.
- The live service worker controlled the page and populated
  `caption-lanes-v1` with 11 shell entries. After going offline, a controlled
  reload still rendered the app h1 with no page/console exception.
- An isolated local update simulation served the exact candidate artifact,
  changed only the service-worker response revision, called `registration.update()`,
  and observed the in-app “An update is ready” toast, an active controller, and
  a successful subsequent offline reload.
- Fresh-load browser capture contacted only
  `speaker-lane-captions.sociobot.in`. Source/network review found no analytics,
  CDN, third-party script, remote font, `MediaRecorder`, or raw-audio persistence.
  Captions use IndexedDB; preferences/license use localStorage. The only
  application cross-origin runtime request is license verification to the
  required Sociobot API.
- The real verification API returned HTTP 200, `cache-control: no-store`, the
  expected invalid verdict, and an origin-specific CORS allow header for the
  product. The separate checkout failure is below.

## Defects

### P1 — advertised Plus purchase endpoint returns 404 (release blocker)

**Reproduction:** Activate **Caption Lanes Plus**, then follow **Buy Caption
Lanes Plus**, or request:

```text
GET https://api.sociobot.in/api/v1/products/speaker-lane-captions/checkout
```

**Actual:** HTTP 404 with
`{"error":"enabled factory product","status":404}`.

**Expected:** The hosted Sociobot checkout redirects the buyer into the stated
$24 one-time purchase flow.

**Impact:** The product advertises a purchasable fourth-lane unlock but no user
can buy it. This breaks the only monetized end-to-end path. The adjacent verify
endpoint is healthy, so this is specifically product registration/enablement or
checkout routing, not a general API outage.

**Required fix:** Register/enable the production product in the Sociobot
billing engine, then test the full hosted checkout return, token capture,
verification, refund/revocation behavior, and restore flow. Do not bypass the
Sociobot endpoint.

### P2 — fresh load logs a missing-favicon console error

**Evidence:** Lighthouse's `errors-in-console` audit reports
`https://speaker-lane-captions.sociobot.in/favicon.ico` as a failed resource.
An independent fresh Playwright context captured the same console error, and a
direct request returned HTTP 404 with a 2,400-byte HTML error body.

**Impact:** This fails the repository's explicit “no console errors on load”
quality gate and reduces Best Practices to 96.

**Required fix:** Ship a real favicon and reference it explicitly, or point a
favicon link to a compatible existing local icon; confirm `/favicon.ico` no
longer 404s and rerun console/Lighthouse checks.

### P2 — mobile targets do not meet the 44×44 contract

At 390 px, measured rendered targets below the supplied accessibility minimum
included the 149×22 home link; 46×16 Privacy, 38×16 Terms, and 121×16 Plus
footer actions; and session buttons compressed to about 43×48. The focused skip
link itself was 145×42. Axe and Lighthouse pass because their automated target
heuristics differ from the factory's stricter 44×44 requirement.

**Impact:** These controls are harder to acquire by touch, especially in the
core mobile/Android context.

**Required fix:** Give all interactive elements a minimum 44 px hit area and
prevent session controls from flex-shrinking below 44 px, then remeasure at
390 px without introducing overflow.

### P3 — cache and browser-policy hardening remain below guidance

All live HTML, JS, CSS, images, manifest, and service-worker responses use
unhashed public names and only `max-age=30`; no long-lived immutable asset
policy is present. Responses also lack Content-Security-Policy,
Permissions-Policy, and clickjacking protection (`frame-ancestors` or
`X-Frame-Options`).

**Impact:** This does not break the current free flow, but it misses the supplied
immutable-cache guidance and useful defense-in-depth around an app that handles
microphone access and locally stored conversation text.

**Required fix:** Fingerprint static assets with versioned service-worker
precache entries and configure immutable caching. Add a restrictive CSP,
microphone-focused Permissions-Policy, and frame protection at the host.

## Validation still requiring the proper environment

- Build and smoke-test the debug APK on an Android/JDK/SDK worker, including
  Android back navigation, edge-to-edge/safe areas, install/update, real
  permission denial/allow, and pause/end microphone indicators.
- Exercise actual on-device speech language-pack install and mono/stereo
  direction estimation on representative Android hardware.
- Run the brief's four-person, 30-utterance study. No evidence currently proves
  the stated 80% attribution success measure.
