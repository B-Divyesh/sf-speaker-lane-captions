# Caption Lanes — polish 2 handoff

Date: 2026-08-30 UTC

Repair commit: `e400d29d5399c651dac9bf7d1f25d71040d44adc`

Production: <https://speaker-lane-captions.sociobot.in/>

## Done

- Fixed demo entitlement isolation, refund wording/testing, README language, and the 390 px Privacy link.
- Added a native Android 12+ on-device caption bridge and an instrumented bridge test; built debug and Android-test APKs.
- Updated the claims inventory, claim enforcement, catalog description, and repair evidence.
- Deployed the static artifact and cold-checked production.

## Verify

```sh
npm ci
npm test
npm run lint
npm run typecheck
npm run build
npm run test:android
npm run test:live
```

All 24 exact claim commands passed from a fresh clone. Production passed `verify-url.sh`, ten hosted-checkout redirects, direct route checks, live demo isolation, and axe scans at 390 px and 1366 px.

The debug APK is `android/app/build/outputs/apk/debug/app-debug.apk` after `npm run test:android`; SHA-256: `ae3631132c585ade3a53ce6d5b20ae506d75a6839613f4fed45dd4be817104dc`.

## Known environment limit

The Android instrumented test compiles and is ready for `connectedDebugAndroidTest` on Android 12+. This disposable worker cannot boot an emulator because the required 7.3 GB userdata partition exceeds its 2.9 GB free space. No unrun device test is described as completed.

See `.factory/polish-2.md` for the complete finding map and evidence paths.
