# Independent verification 4 — FAIL

Date: 2026-08-28 UTC

Work order: `speaker-lane-captions-verify-4`

Candidate: `4ea46036e54991cbbe5ea6687d0940094ef487d0`

Live URL: <https://speaker-lane-captions.sociobot.in/>

Browser: Google Chrome for Testing 145.0.7632.6 / Playwright 1.58.2

## Verdict

**FAIL.** Fresh evidence confirms that production is the candidate's exact
artifact and that the previously reported destructive-import defect is fixed.
The normal caption, privacy, license, update, accessibility-severity, and
performance checks are otherwise healthy.

Two independently reproduced P2 defects still violate the supplied mobile/PWA
contract:

1. The consent checkbox's complete labelled hit area is only 24 CSS px high at
   390 px, and the upgrade dialog's Terms link is 43.56 px wide. Both are below
   the mandatory 44×44 target.
2. The exact installed-app `start_url` is not in the service-worker shell. A
   first offline launch at that URL renders the fallback instead of Caption
   Lanes, so the advertised offline caption UI cannot be opened.

The active conversation view also produces one moderate axe finding because
its only h1 is inside the now-hidden setup view. There were zero serious or
critical axe findings.

No product source was modified. Only this report and `.factory/handoff.md` were
changed.

## Clean-checkout quality gates

Testing ran in a new detached Git worktree created at the exact candidate SHA.
It began and ended clean.

| Check | Result | Evidence |
| --- | --- | --- |
| Identity | PASS | `git rev-parse HEAD` returned the full candidate SHA; `git status` remained clean after verification. |
| Locked install | PASS | Node 22.23.2 / npm 10.9.8; `npm ci` installed 255 packages; `npm audit --audit-level=high` found 0 vulnerabilities. |
| Lint | PASS | `npm run lint` completed with no findings. |
| Types | PASS | `npm run typecheck` completed with no errors. |
| Repository suite | PASS | `npm test`: 3/3 Vitest tests and 18/18 Playwright tests passed across desktop Chromium and exact 390×844 Chromium. |
| Exact production build | PASS | `npm run build` ran `tsc --noEmit`, Vite 7.3.6, and the service-worker builder; it produced `dist/`. |
| Capacitor sync | PASS | `npm run cap:sync` rebuilt and copied the exact web artifact into Android; packaged core-file hashes equal `dist/`. |
| Capacitor project check | PASS | `npx cap doctor android` reported “Android looking great.” |
| Debug APK | ENVIRONMENT BLOCKED | `android/gradlew -p android assembleDebug --no-daemon` stopped before Gradle because this deploy-none worker has no Java, `JAVA_HOME`, or Android SDK. No APK result is claimed. |

The production build is 220 KiB total. Main JS is 15,482 B (5.99 KiB gzip),
CSS is 13,523 B (3.92 KiB gzip), there are no font files, and responsive hero
images are 8,074 B and 26,114 B. These are comfortably below the supplied
200 KiB JS, 50 KiB CSS, 120 KiB font, and 300 KiB mobile-hero budgets.

## Deployment identity and response policy

`npm run test:live` passed. An independent fetch-and-`cmp` pass compared every
deployable file in `dist/` except host-only `staticwebapp.config.json`; all
**16/16 files matched production byte-for-byte**. Core SHA-256 values are:

| Artifact | Local and live SHA-256 |
| --- | --- |
| `index.html` | `abb1568cd1afa2895ffad914ef8c43544a47a802d0a052ece292ceb89046f8cb` |
| `sw.js` | `67c7ccdad62c9d173a4e164083bf8df7c4fc95bbf77a8af2a67524a390fb6a3f` |
| `assets/app-CzAQ_6Db.js` | `75ff437e283256af0c8584630b65660cf987d2e7c07ddd2a4ef819e4f8a5069c` |

This resolves the builder's earlier deployment-only uncertainty from fresh
evidence. HTTP redirects to HTTPS. Root responses include HSTS, `nosniff`,
`strict-origin-when-cross-origin`, restrictive CSP, microphone-only
Permissions-Policy, and `X-Frame-Options: DENY`. HTML uses
`public, must-revalidate, max-age=30`; hashed JS/CSS use one-year immutable
caching; `sw.js` uses `no-cache`.

The production checkout returned HTTP 303 to Dodo's hosted checkout. Following
the read-only redirect returned HTTP 200 and displayed **Caption Lanes Plus**,
**$24.00**, and **One-time**. The real invalid-license endpoint returned HTTP
200, `valid: false`, `cache-control: no-store`, and the correct origin-specific
CORS header.

## Independent end-to-end exercise

The following checks were performed directly against production in fresh
browser contexts, in addition to the repository suite:

- Submitting setup without consent kept setup open and made zero mocked
  microphone calls. Typed mode, Pause, and Resume also made zero calls.
- A consented microphone session started the on-device speech path and one
  direction stream. A mono stream displayed the documented limitation; Pause
  stopped its track; Resume acquired a new stream. A denied stream showed
  actionable recovery copy, and typed captions remained usable.
- Typed captions were placed in separate lanes with controls, Enter, and the
  number shortcut away from a text field. Whitespace-only input was ignored.
  The input stopped at 240 characters. Literal `<img onerror=…>` input stayed
  inert text and created no element or script execution.
- Export downloaded parseable JSON containing two captions and
  `rawAudioStored: false`. Invalid JSON showed the recovery toast.
- The prior P1 import regression is fixed: with two saved captions, importing
  one valid caption displayed the exact count-specific confirmation; cancelling
  retained both captions across reload. Clear likewise preserved data after
  cancellation and removed it only after confirmation.
- Caption size persisted at its 36 px upper bound. Empty lane names recovered
  to the default. Unlocking and changing a lane color worked and persisted.
- A returned license token was stored at the documented key and removed from
  the URL without removing another query parameter. A mocked valid license was
  verified once, cached across reload, and exposed four lanes.
- Desktop 1440×900 and mobile 390×844 screenshots were visually inspected.
  Mobile had no horizontal overflow and stacked Left/Centre/Right in physical
  order. No clipping, collision, or unreadable fallback was observed.

## Keyboard and accessibility

- Keyboard Tab exposed the skip link at top 12 px with a 44 px hit area and a
  3 px solid Lantern focus outline. Enter skipped to main; the next Tab reached
  consent. Typed input, Enter submission, number shortcuts, dialog Tab cycle,
  Escape, and focus return were exercised.
- Axe found zero violations of any impact on setup, settings, `/privacy/`, and
  `/terms/`. It found zero serious/critical violations in populated desktop and
  mobile rooms. Its one room finding is the moderate defect below.
- The document has `lang="en"`, a descriptive title, one DOM h1, `main`, bound
  form labels, alt text, and no unnamed buttons. Both legal routes returned 200.
- Under `prefers-reduced-motion: reduce`, caption animation computed to
  `0.01ms`, one iteration, and scrolling computed to `auto`.
- `/opt/fleet/lib/verify-url.sh` reported a 638 ms network-idle load, zero
  console/page errors, title/lang/main, one h1, complete image alt, and no
  unlabelled buttons.

## PWA, privacy, and network behavior

- Chromium accepted the manifest. It declares standalone display, dark theme
  and background, 192/512 icons with maskable support, and the versioned exact
  start URL `/?v=2&source=installed`.
- The live service worker controlled the page and created
  `caption-lanes-d2d87c39b898` with 11 shell entries. A controlled reload of
  the already-visited root worked offline, and a never-visited route rendered
  the explicit offline fallback.
- A fresh isolated update simulation changed the service-worker cache revision,
  observed the in-app “An update is ready” toast, activated and claimed the
  page, removed the prior cache, and reloaded successfully offline with no
  console/page errors.
- The exact manifest start URL failed the separate first-offline-launch test as
  documented below.
- Fresh-load request capture contacted only
  `speaker-lane-captions.sociobot.in`. Source/runtime review found no analytics,
  trackers, remote scripts/fonts, `MediaRecorder`, or raw-audio persistence.
  Captions use IndexedDB; preferences/license state use localStorage. The only
  application cross-origin runtime request is the required Sociobot license
  verification call.

## Lighthouse mobile

Three Lighthouse 12.8.2 samples ran against production:

| Run | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 100 | 100 | 100 | 100 | 1.03 s | 1.03 s | 70.5 ms | 0 | 72,888 B |
| 2 | 100 | 100 | 100 | 100 | 0.90 s | 1.07 s | 0 ms | 0 | 72,849 B |
| 3 | 99 | 100 | 100 | 100 | 0.89 s | 0.90 s | 117.5 ms | 0 | 72,942 B |

All runs had zero logged console errors and zero third-party transfer. The lab
run did not emit field INP; TBT remained below the 200 ms interaction proxy.

## Defects

### P2 — installed app cannot open its caption UI on a first offline launch

**Reproduction:** In a fresh 390×844 context, load `/`, wait for the service
worker, reload until controlled, go offline, then navigate to the manifest's
exact `start_url`:

```text
https://speaker-lane-captions.sociobot.in/?v=2&source=installed
```

**Actual:** The page title is `Offline — Caption Lanes` and h1 is “You’re
offline.” The caption application is not present.

**Expected:** The installed start URL should resolve to the precached app shell
so the offline typed-caption experience can start.

**Cause:** `sw.js` precaches `/`, but not `/?v=2&source=installed` and its
navigation fallback does not serve cached `/` with search ignored. It therefore
falls through to `/offline.html` until that exact query URL has once been
visited online.

**Impact:** Offline use is part of the smallest useful product and privacy
promise. A user who installs online and first opens the installed Android/PWA
surface without a network receives an informational dead end instead of the
caption interface.

**Required fix:** Precache the exact manifest start URL, or make offline
navigations fall back to the cached app shell (while retaining the explicit
fallback for routes that genuinely cannot run). Automate an unvisited exact
`start_url` offline launch.

### P2 — mobile consent and upgrade targets are below 44 CSS px

At 390×844, independent bounding-box measurements are:

```text
#consent       24 × 24 px
.consent-check 328 × 24 px
upgrade Terms  43.56 × 44 px
```

The label is correctly associated and its full width is clickable, but neither
the control nor its complete labelled hit area reaches the mandatory 44 px
height. The upgrade Terms link misses the width threshold. All other actually
visible controls measured across setup, room, footer, settings, and upgrade
meet 44×44.

**Impact:** Consent is the required gateway to microphone captions and is harder
to acquire by touch, particularly for motor-impaired users on the Android-sized
target surface. This violates both attached design and accessibility contracts.

**Required fix:** Give `.consent-check` a minimum 44 px block size and align its
24 px visual checkbox inside that hit area. Extend the existing mobile-target
test to include consent and all visible interactive controls, not only the
previously reported selectors.

### P3 — active conversation has no visible h1

Once setup is hidden, its h1 leaves the accessibility tree and the active room
begins with `<h2>Conversation</h2>`. Axe reports `page-has-heading-one`
(moderate) on both desktop and mobile room states. There are still zero
serious/critical findings and exactly one h1 in the DOM.

**Required fix:** Preserve one meaningful level-one heading in the active view,
or update heading levels/state so the visible accessibility tree begins at h1
without creating two simultaneous page h1s.

## Validation still requiring external capability

- Build and smoke-test the debug APK in a worker with JDK/Android SDK, then test
  physical Android permission allow/deny, language-pack install, WebView speech
  support, mono/stereo direction behavior, lifecycle/back gesture, safe areas,
  install/update, and offline restart.
- Run the brief's four-person, 30-utterance attribution study. Repository and
  browser evidence cannot establish the stated ≥80% real-room outcome.
