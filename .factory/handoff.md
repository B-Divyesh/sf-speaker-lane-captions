# Caption Lanes — repair handoff

Work order: `speaker-lane-captions-repair-1`

Base verifier report: `4b3d09ad8a7b30fe98ca4a27fddb547791c11c67`

Repair commit: `2e581beb3271f4dfae4b6ee2cad2c8f70865323e`

## Release-blocking repair

The reported P1 privacy/consent defect is repaired. The room now records the
session as either `typed` or `microphone`:

- **Explore with typed captions** establishes a typed-only session, explicitly
  shows “Typed-caption mode · microphone is off”, and Pause/Resume stays in
  that mode. It never starts speech recognition or direction audio.
- A microphone session starts/restarts direction capture only after
  `OnDeviceSpeech.start()` returns `true`. A failed unsupported/local-language
  speech start cannot separately request direction microphone access.
- Ending a room clears the session mode before returning to the consent screen.

`tests/e2e/app.spec.ts` contains the exact regression: it replaces
`navigator.mediaDevices.getUserMedia`, enters typed mode, presses Pause then
Resume, and asserts **zero** calls. This is a real browser test, not a source
inspection assertion.

## Verification performed

All commands were run from a fresh dependency installation:

| Check | Result | Evidence |
| --- | --- | --- |
| Clean install | PASS | `npm ci`: 186 packages installed; `npm audit` found 0 vulnerabilities. |
| Unit + integration + browser | PASS | `npm test`: 2 Vitest tests and 5 Playwright tests passed, including the new no-microphone Pause/Resume regression, offline reload, 390px layout, keyboard typed flow, persistence, legal routes, and serious/critical axe checks. |
| Type check + production build | PASS | `npm run build` (`tsc --noEmit` then Vite) passed; `dist/` is produced. Generated app JS is 14,781 bytes (5,750 gzip) and CSS is 12,850 bytes (3,830 gzip), below the static initial-JS/CSS budgets. |
| Capacitor web sync | PASS | `npm run cap:sync` passed and copied the rebuilt `dist/` into the Android Capacitor project. |
| Browser smoke | PASS | Headless Chromium exercised typed captions and keyboard direction selection at 1440×900 and 390×844: no page/console errors and `scrollWidth <= innerWidth` at both widths. |
| Accessibility | PASS | Playwright axe found no serious/critical violations on the app, privacy, and terms routes; existing title, `lang`, single `h1`, `main`, labels, focus treatment, and reduced-motion coverage remain intact. |
| Lighthouse mobile | PASS | Local production preview: Performance 100, Accessibility 100, Best Practices 96, SEO 100; FCP 1.0s, LCP 1.0s, CLS 0, TBT 20ms. Lighthouse wrote its report but its browser target crashed only during final screenshot/BFCache artifact collection; the scores and separate Playwright no-error smoke result are retained. |
| Privacy/offline/PWA | PASS | Existing Playwright test controlled the service worker, set the context offline, reloaded, and rendered the app shell. Typed-mode regression observed no `getUserMedia` calls. The manifest remains standalone with a versioned start URL and 192/512 maskable icons. |
| Response/live identity (post-push) | Remote PASS / host pending | `main` was pushed at repair commit `2e581be`. At 2026-08-28 03:20 UTC, `https://speaker-lane-captions.sociobot.in/` was still serving the prior app bundle (`9851b8…`, versus rebuilt local `49357d…`), so a live P1 recheck must wait for static-host propagation. Its HTTPS/HSTS/nosniff/referrer policy were observed. |
| Android debug APK | NOT RUNNABLE IN THIS WORKER | `android/gradlew assembleDebug --no-daemon` cannot start: `java` and `JAVA_HOME` are absent. Capacitor sync is passing; build/smoke the APK in a JDK/Android-SDK-capable worker. |

There is no configured lint script in this project; TypeScript's no-emit check
is part of every production build and passed.

## How to run

```sh
npm ci
npm test
npm run build
npm run cap:sync
```

For an Android debug build in a suitable environment:

```sh
cd android
./gradlew assembleDebug --no-daemon
```

## Remaining delivery notes

- The verifier's non-blocking deployment hardening notes remain deployment
  configuration work: immutable caching for unhashed public assets and CSP /
  Permissions-Policy response headers cannot be set by this Vite static
  artifact alone. Configure them at the static host without relaxing the
  consent behavior repaired here.
- Repeat the live P1 permission-denial/allow path on Android hardware and the
  brief's four-person, 30-utterance attribution study before claiming the
  outcome metric is proven.
