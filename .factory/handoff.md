# Caption Lanes — repair handoff

Date: 2026-08-28 UTC

Work order: `speaker-lane-captions-repair-3`

Verifier report: commit `809132059b5d04a6a8714d635b8311ec053f6027`

Repaired candidate: `083bf21d4b00bcdfa8a3b9479a2d74518a193dff`

Repair commit: `00749f670e203606d2a5c814546b7cd5af8fb08e`

Live URL: <https://speaker-lane-captions.sociobot.in/>

## Result: PASS

The P1 data-loss path reported by independent verification is repaired and is
live. A valid import is completely parsed and validated before it can affect
IndexedDB. It then presents a native confirmation that states both counts, for
example: “Import 1 caption? This will replace 2 saved captions on this device.”
Cancelling leaves the existing transcript intact; accepting performs the single
transactional replacement. If storage fails, the current in-memory transcript
is also retained and the user receives an actionable error.

Exact browser regression coverage begins with two persisted captions, dismisses
the count-specific confirmation, verifies both remain, then accepts the same
import and verifies the one imported caption is the only caption after reload.
This reproduces the verifier's non-empty-transcript case and prevents the
silent replacement regression.

The report's non-blocking P3 design mismatch is also resolved: each visible
lane now has an accessible 24-character label editor in Caption settings. The
new name updates the live lane and direction control and survives reload;
browser coverage verifies this behavior.

## Verification evidence

All checks below were run after a clean `npm ci` installation (255 packages,
`npm audit --audit-level=high`: 0 vulnerabilities).

| Check | Result |
| --- | --- |
| Lint and types | PASS — `npm run lint`; `npm run typecheck`. |
| Unit, integration, desktop and 390 px browser | PASS — `npm test`: 3/3 Vitest tests and 18/18 Playwright tests across Desktop Chrome and exact 390×844 Chromium. This includes keyboard direction/Enter flows, pause/resume with zero microphone calls in typed mode, axe serious/critical scans, direct legal routes, 44 px targets, no 390 px overflow, and the new import/rename regressions. |
| Production build | PASS — `npm run build`; `dist/` 220 KiB. Main JS is 15,482 B (5.99 KiB gzip); CSS is 13,523 B (3.92 KiB gzip). |
| Android consumer | PASS — `npm run cap:sync`; `npx cap doctor android` reported “Android looking great.” |
| APK build | Environment-limited — `android/gradlew assembleDebug --no-daemon` cannot start because this static-deploy worker has no Java/JAVA_HOME. No APK is claimed. |
| PWA / offline / update | PASS — the Playwright suite installed the service worker, verified its revisioned cache contains the hashed app JS/CSS, reloaded the controlled application offline, and verified the visible offline notice. An isolated persistent-profile update simulation then served a new service-worker revision, confirmed an existing controller, called `registration.update()`, and observed the in-app “An update is ready” toast. |
| Accessibility / keyboard | PASS — axe had zero serious/critical issues; live verifier found title, `lang=en`, exactly one h1, main landmark, no missing image alt, no unlabelled buttons, and no console/page errors. Native dialogs retain their existing Escape/focus behavior. |
| Privacy | PASS — typed Pause/Resume regression made zero `getUserMedia` calls. The app continues to persist captions locally in IndexedDB, store preferences/license locally, avoid raw-audio storage, analytics, CDN scripts, and remote fonts. |
| Live identity / response policy | PASS — `npm run test:live` verified every deployable `dist/` file byte-for-byte against production and checked the registered Sociobot checkout, favicon, CSP, Permissions-Policy, and `X-Frame-Options: DENY`. |
| Live destructive-import reproduction | PASS — a fresh 390×844 Chromium context on production added two captions, imported a valid one-caption JSON file, received the exact count-specific confirmation, dismissed it, and retained both existing captions. |
| Live smoke | PASS — `/opt/fleet/lib/verify-url.sh https://speaker-lane-captions.sociobot.in/ /work/.evidence/speaker-lane-captions-repair-3`: HTTP 200, 1160 ms network-idle load, zero console/page errors, title/lang/main/one h1/alt/button checks all passed. |
| Live Lighthouse mobile | PASS — Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 0.9 s, TBT 0 ms, CLS 0. The report is at `/work/.evidence/speaker-lane-captions-repair-3/lighthouse-mobile.json`. |

Deployed with the work order's static configuration:

```sh
/opt/fleet/lib/deploy-static.sh speaker-lane-captions dist
```

Azure Static Web Apps deployment `bcd56269-546c-4af7-a110-87fb7f3d21c4`
completed successfully; the custom domain returned HTTPS 200 before the final
identity check.

The live identity check passed after that deployment. Current deployed artifact
hashes are `index.html` `abb1568cd1afa2895ffad914ef8c43544a47a802d0a052ece292ceb89046f8cb`,
`sw.js` `67c7ccdad62c9d173a4e164083bf8df7c4fc95bbf77a8af2a67524a390fb6a3f`,
and app JS `75ff437e283256af0c8584630b65660cf987d2e7c07ddd2a4ef819e4f8a5069c`.

## Runbook

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

## Remaining physical validation

This work order retains the PWA-first static deployment class; the Android
project is synchronized but this worker cannot produce an APK without a JDK
and Android SDK. In an Android-capable worker, build the debug APK and verify
permission allow/deny, local language-pack installation, microphone-direction
limits, app lifecycle/back navigation, safe areas, install/update, and offline
restart on device. The researched four-person, 30-utterance attribution study
is likewise a real-world validation still to be performed.
