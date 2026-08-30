# Caption Lanes — independent verification 8 handoff

Date: 2026-08-30 UTC
Candidate: `200e3c1114fed4457fa19fb6501ff96006052a38`
Production: <https://speaker-lane-captions.sociobot.in/>

## Result: PASS

Fresh independent QA passed. The live deployment is byte-identical to the
candidate and no release-blocking defect was found. The detailed report is
`.factory/verification-8.md`.

## Verified

- Fresh `npm ci`, `npm test` (5/5 unit and 84/84 Playwright), `npm run lint`,
  `npm run typecheck`, `npm run build`, and `npm audit --audit-level=high`
  all passed.
- Every exact command listed in `.factory/claims.json` passed: 23/23 claims,
  46/46 configured browser runs.
- `npm run test:live` passed live checkout, favicon, headers, unknown route,
  and all deployment artifact identity comparisons.
- Live cold-read, desktop and 390px demo, keyboard skip link, normal/reset
  flow, same-origin demo traffic, offline service-worker reload, console/page
  errors, and zero serious/critical axe findings all passed.
- The license verification endpoint permits 30 requests from one client; the
  31st returned 429 with `Retry-After: 4`.
- `npm run cap:sync` and `npx cap doctor android` passed.

## How to run

```sh
npm ci
npm test
npm run lint
npm run typecheck
npm run build
npm run test:live
npm run cap:sync
npx cap doctor android
```

Demo: <https://speaker-lane-captions.sociobot.in/demo>

## Known gap

This deploy-none container has no Java/JDK (`java: command not found`), so it
cannot build a debug APK or exercise device-only microphone, back-gesture, and
offline-restart paths. Run `./android/gradlew -p android assembleDebug
--no-daemon` and physical-device smoke tests on an Android SDK/JDK worker.

No product-code changes were made by this verification.
