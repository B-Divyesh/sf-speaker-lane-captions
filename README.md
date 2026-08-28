# Caption Lanes

Caption Lanes is a local-first live-caption utility for Deaf and hard-of-hearing people in small, in-person groups. Instead of mixing every voice into one transcript, it places utterances in coarse **Left**, **Centre**, **Right**, and optional **Across** lanes.

The free experience includes three directional lanes, on-device speech where the browser supports it, a typed backup input, confidence filtering, local transcript history, and export/import. Caption Lanes Plus is a $24 one-time license that adds a fourth lane and provides the paid-unlock path for future compatible microphone accessories.

Live product: <https://speaker-lane-captions.sociobot.in>

## Privacy and capability boundaries

- Everyone must consent before microphone access is requested.
- Caption Lanes requests the browser’s explicit `processLocally` speech mode and refuses speech recognition that cannot advertise local processing.
- Raw audio is never retained. Caption text and settings stay in IndexedDB/localStorage until the user clears them.
- Direction is coarse, never identity. A stereo microphone can provide an energy-based left/centre/right hint; mono devices show a limitation and provide large manual direction controls (keyboard shortcuts 1–4).
- Captions and direction can be wrong. This is not an emergency, forensic, medical, or legal transcription tool.

Supported Chromium/Android versions need the on-device Web Speech API and a downloaded language pack. Other browsers can use the fully local typed-caption path. The first speech start checks for and, when supported, requests installation of the current language pack.

## Develop and verify

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
npm test
npm run build
```

The exact production build command is `npm run build`. Static output is written to `dist/`, with `dist/index.html` at the deploy root. Playwright is pinned to 1.58.2; the factory image supplies its browser binaries.

Other useful commands:

```sh
npm run test:unit
npm run test:e2e
npm run preview
npm run cap:sync
```

The end-to-end suite exercises a 390 px phone viewport, keyboard and typed-caption paths, persistence, legal pages, axe checks, and an offline service-worker reload.

## Android project

The PWA is wrapped by Capacitor in `android/` using app ID `in.sociobot.speakerlanecaptions` (Android package names cannot contain the product slug’s hyphens). To refresh native web assets:

```sh
npm run cap:sync
```

With an Android SDK and JDK configured:

```sh
cd android
./gradlew assembleDebug
```

Release signing and distribution are handled in a later factory work order; no keystore or secret belongs in this repository.

## Paid unlock

Checkout is hosted by the Sociobot billing engine. The app stores a returned token under `sb_license:speaker-lane-captions`, removes it from the URL, verifies at most daily, works optimistically from a cached valid verdict when offline, and supports restoring a pasted license. No product ID or payment-provider SDK is embedded.

## Project documentation

- [Visual thesis](.factory/design.md)
- [Build handoff](.factory/handoff.md)
- [Privacy policy](privacy/index.html)
- [Terms](terms/index.html)

Caption Lanes is MIT licensed. The original generated environmental artwork and its prompt/provenance are under `assets/src/`.
