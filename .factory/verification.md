# Independent verification — FAIL

Date: 2026-08-28

Work order: `speaker-lane-captions-verify-1`

Candidate: `4b504aaaf2d153ee2334e213545720e22145b1a8`
Live URL: https://speaker-lane-captions.sociobot.in/

## Verdict

**FAIL.** The deployed site is an exact byte-for-byte match for the candidate,
and most functional, accessibility, offline, and performance checks pass. It
nevertheless has a release-blocking consent/privacy failure: a person can enter
the explicitly no-microphone typed-caption mode without confirming consent, then
press Pause and Resume; Resume unconditionally starts the speech and microphone
direction paths. This contradicts both the consent gate and the privacy policy.

No product source was modified during verification.

## Clean-checkout quality gates

The checkout began clean at the candidate SHA.

| Check | Result | Evidence |
| --- | --- | --- |
| Lockfile installation | PASS | `npm ci`: 186 packages installed; `npm audit`: 0 vulnerabilities. |
| Unit/integration suite | PASS | `npm test`: 2 Vitest tests and 4 Playwright tests passed. |
| Available type check | PASS | `npm run build` runs `tsc --noEmit`, then Vite; passed. No lint script is defined. |
| Exact production build | PASS | `npm run build` passed; `dist/` produced. |
| Capacitor sync | PASS | `npm run cap:sync` passed. |
| Android debug APK | NOT RUNNABLE HERE | `android/gradlew assembleDebug --no-daemon` stopped before Gradle because this worker has neither `java` nor `JAVA_HOME`. This is an environment limitation, not a passing APK test. |

Production sizes: `assets/app.js` 14,531 bytes (5,690 gzip),
`assets/styles.css` 12,850 bytes (3,830 gzip), 720px hero 8,074 bytes, and
1280px hero 26,114 bytes. These are below the stated static-product budgets.

## Deployment, browser, and product evidence

* Fetched all 15 files in local `dist/` from the live origin and compared their
  bytes: all were identical. The root `index.html` SHA-256 was
  `4a00ca36e2a598605cdb2cdaa0841461756738150ca3d58c95ac41827499cb75` both
  locally and live.
* Live Chromium exercised the normal typed flow: selected Left and Right lanes,
  added captions by button and keyboard Enter/`3`, retained local data, and
  rendered the paid Across lane after a mocked valid restore response. No
  console or page errors occurred in that normal flow.
* Boundary/recovery checks passed: the typed input enforced its 240-character
  limit; malformed JSON import announced “That file is not a Caption Lanes
  transcript.”; valid import announced its count; Escape closed the upgrade
  dialog; restore showed “Plus is active on this device.” with a mocked valid
  Sociobot response.
* At both 1440px desktop and 390px mobile `scrollWidth <= innerWidth`. Mobile
  reduced-motion media gave a `0.01ms` effective transition duration. Keyboard
  Tab exposed the skip link with a 3px Lantern focus outline; Escape closed
  dialogs; number direction shortcuts worked in the room.
* `@axe-core/playwright` found no serious or critical findings on the initial
  screen or typed-caption room. Title, `lang`, one `h1`, `main`, labelled
  controls, meaningful hero alt, and direct `/privacy/` and `/terms/` routes
  were also checked.
* Live service worker reached a controlled state. After a controlled reload,
  `context.setOffline(true)` and another reload still rendered the h1 with no
  console/page errors. Chromium DevTools parsed the manifest with no errors;
  it contains standalone display, versioned start URL, and 192/512 maskable
  icons.
* Live request capture found no analytics, CDNs, fonts, or other third parties.
  The only outbound runtime request in an exercised license path was the
  required `https://api.sociobot.in/api/v1/products/speaker-lane-captions/verify?...`.
  Captions/settings remained in IndexedDB/localStorage; raw audio is not
  written by the application code.
* Live response policy: HTTPS, `nosniff`, `strict-origin-when-cross-origin`,
  and HSTS are present. Root and static assets use `public, must-revalidate,
  max-age=30`.
* Lighthouse 12.8.2 mobile, against live: Performance 100, Accessibility 100,
  Best Practices 96, SEO 100; FCP 1.1s, LCP 1.1s, CLS 0, TBT 90ms, interactive
  1.3s. The Lighthouse run itself reported a browser-target crash late in
  artifact collection, so the individually captured console/page-error result
  above is the authoritative application-error check.

## Defects

### P1 — typed mode can request microphone after no consent (release blocker)

**Reproduction:** Open the live URL, choose **Explore with typed captions**
(which does not require the “Everyone here agrees” checkbox), choose **Pause**,
then **Resume**.

**Evidence:** The candidate’s resume handler calls
`speech.start().then(() => startDirectionAudio())` without retaining or checking
whether the room was entered as `practice`; `startDirectionAudio()` calls
`navigator.mediaDevices.getUserMedia(...)`. This is the exact live JS file
(`dist/assets/app.js`) verified against the candidate. A fresh headless
Chromium run of precisely this live sequence crashed the page target while
entering the microphone/speech stack, rather than remaining in typed mode.
The code path itself is deterministic even where browser permission UI cannot
be automated: it makes both microphone-start attempts after an explicitly
no-consent entry path.

**Impact:** A person who deliberately selected the privacy-preserving typed
fallback can trigger a microphone permission attempt without the required
consent affirmation. This violates the brief’s “obtain consent” constraint,
the UI promise, and the privacy policy.

**Required fix:** Track typed/practice mode separately and make Pause/Resume
resume typed mode without `speech.start()` or `getUserMedia()`. Only a session
that passed the explicit consent gate may restart microphone capture. Add an
automated regression test that stubs `getUserMedia` and proves the typed
Pause/Resume path makes zero calls.

### P3 — caching/policy hardening does not meet the supplied PWA performance guidance

Live `app.js`, CSS, images, manifest, and service worker have unhashed names and
only `max-age=30`; no long-lived immutable asset cache is delivered. The live
root response also has no Content-Security-Policy or Permissions-Policy header.
This did not break the current app and is not the FAIL trigger, but it falls
short of the supplied immutable-cache guidance and leaves useful browser policy
defence-in-depth absent. Use content-hashed assets with immutable caching and
add a CSP/Permissions-Policy appropriate for the microphone-only application.

## Remaining validation after a fix

* Re-run this report’s P1 regression in Chromium and on Android hardware,
  including real permission denial/allow, language-pack installation, and mono
  versus stereo direction behavior.
* Build and smoke-test the debug APK in a JDK/Android-SDK-capable worker.
* The brief’s four-person/30-utterance attribution study (80% target) has not
  been supplied, so the stated outcome remains unproven.
