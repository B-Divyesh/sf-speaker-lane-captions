# Caption Lanes — repair handoff

Date: 2026-08-30 UTC

Work order: `speaker-lane-captions-repair-4`

Verifier report: `.factory/verification-4.md` at
`d914c8b1dd1a6f2a7bdf67b2ec0ca407159eceaa`

Repaired candidate: `4ea46036e54991cbbe5ea6687d0940094ef487d0`

Repair commit: `32c0ba7ac10d7afa191c25c49b6f6cef0b22591f`

Live URL: <https://speaker-lane-captions.sociobot.in/>

## Result: PASS

All three findings in independent verification 4 are repaired and covered by
browser regression tests.

1. The service worker now precaches the manifest's exact
   `/?v=2&source=installed` start URL. A fresh, controlled 390×844 context
   opens that never-before-visited URL offline and receives the Caption Lanes
   shell, title, headline, and typed-caption action rather than `offline.html`.
2. The consent control has a real 44×44 CSS-pixel input target with a centred
   24 px visual check box, and its labelled hit area is at least 44 px tall.
   The upgrade dialog's Terms link is now 44×44 px. The test measures every
   visible button, link, input, and input label in setup, room, settings, and
   upgrade at 390 px.
3. The app changes heading levels as setup and the live room swap. There is
   exactly one DOM/visible h1 in either state: the setup headline before a
   session and “Conversation” while the room is active. Axe reports no
   violations in the active room.

The repair preserves the accepted import confirmation, typed-caption,
microphone, license, local storage, and offline-fallback behaviours.

## Exact verification evidence

The work began with a locked clean install: `npm ci` installed 255 packages and
`npm audit --audit-level=high` reported zero vulnerabilities. Before changing
source, the verifier's failure reproduced at 390×844: consent was 24×24 px,
its label was 328×24 px, Terms was 43.5625×44 px, room had no visible h1, and
the unvisited installed start URL displayed `Offline — Caption Lanes`.

| Check | Result |
| --- | --- |
| Lint and types | PASS — `npm run lint`; `npm run typecheck`. |
| Unit/integration and browser | PASS — `npm test`: 3/3 Vitest tests and 22/22 Playwright runs across Desktop Chrome and the exact 390×844 Chromium project. It includes keyboard direction/Enter flows, typed Pause/Resume with zero microphone calls, dialogs, persistence, import/export/clear, legal routes, reduced motion, axe, the repaired targets, offline installed start URL, and h1 state transitions. |
| Production build | PASS — `npm run build` creates `dist/` (167,554 B). Main JS is 15,780 B (6,166 B gzip); CSS is 13,790 B (3,973 B gzip). |
| Mobile Lighthouse | PASS — production 100 performance, 100 accessibility, 100 best practices, 100 SEO. FCP 874 ms, LCP 911 ms, TBT 0 ms, CLS 0, transfer 73,069 B. The same local sample scored 100/100/100/100. |
| Accessibility and keyboard | PASS — active-room Axe scan has zero violations; `/opt/fleet/lib/verify-url.sh` on production found title, `lang=en`, one h1, main, complete image alt text, no unnamed buttons, and no console/page errors. Keyboard flows remain covered by Playwright. |
| Privacy | PASS — fresh local typed-caption flow had zero cross-origin requests and zero console errors. Existing browser coverage confirms typed Pause/Resume makes zero microphone calls. The app remains local-first with no analytics, remote fonts, CDN code, raw-audio storage, or identity inference. |
| Offline and update | PASS — new isolated-context regression proves the exact manifest start URL works offline before it has been visited. A separate in-memory service-worker revision simulation observed the in-app update toast and, after activation, the new cache was the only `caption-lanes-*` cache. |
| Android consumer | PASS — `npm run cap:sync`; `npx cap doctor android` reported “Android looking great.” A `diff -qr` matched `dist/` to Capacitor's copied web assets, excluding Capacitor's generated `cordova.js` and `cordova_plugins.js`. |
| APK build | ENVIRONMENT BLOCKED — `java -version` reports no Java, and `./android/gradlew -p android assembleDebug --no-daemon` stops because `JAVA_HOME`/Java are absent. No APK is claimed. |
| Live identity and response policy | PASS — after deploy, `npm run test:live` verified every deployable `dist/` file against production and checked the registered hosted checkout, favicon, CSP, microphone-only Permissions-Policy, and `X-Frame-Options: DENY`. |
| Live repaired-path smoke | PASS — fresh mobile production context measured consent 44×44 px, label 328×47.59375 px, Terms 44×44 px; active room exposed only `Conversation` as h1; the exact installed start URL loaded the app offline with no console errors. |

## Deployment

Static deployment used the work-order command:

```sh
/opt/fleet/lib/deploy-static.sh speaker-lane-captions dist
```

Azure Static Web Apps deployment `efbb44e5-7c41-4d6f-a131-bc4c3274462c`
completed successfully. The custom domain returned HTTPS 200, and the live
identity test passed after deployment.

Live artifact hashes:

```text
index.html                 5703653a590798e120a013facfa1bc0c26cedac712871a87d3e29f0b0f648d0b
sw.js                      fef8f218ab624339132daf06ccd4e9e2a7859df03c58f413ebd026d8f37cd5b5
assets/app-n0ZQK1_2.js     a45c022e541878154be6340939bedb687873538e47a26e8fcd1bbabc17b8c318
assets/styles-56zywAql.css 73e54f309423f0a5e93f16450941cde4d57d8e7e1da828844e5046a163d3cd80
```

## Re-run

```sh
npm ci
npm audit --audit-level=high
npm run lint
npm run typecheck
npm test
npm run build
npm run cap:sync
npx cap doctor android
npm run test:live
```

## Known external validation

The PWA-first static deployment and Capacitor project are complete. Build and
smoke-test the debug APK in a worker with Java and the Android SDK, including
real-device permission allow/deny, WebView speech support, lifecycle/back
gesture, safe areas, install/update, and offline restart. The brief's
four-person, 30-utterance attribution study is also still a real-world study;
repository and browser tests cannot establish its ≥80% target.
