# Caption Lanes

Caption Lanes places live captions into left, centre, and right lanes. It is for Deaf and hard-of-hearing people in small groups.

The free app provides three lanes, a saved transcript, typed input, confidence filtering, and transcript import and export. Caption Lanes Plus costs $24 once and adds a fourth lane.

Live product: <https://speaker-lane-captions.sociobot.in>

## Try the isolated demo

Open <https://speaker-lane-captions.sociobot.in/demo>, add `?demo=1` to the home URL, or select **Try it with sample data**.

The demo opens a six-caption conversation without a microphone. It keeps temporary data in a separate store named `demo:caption-lanes` and never reads real captions or settings.

Use **Reset demo** to restore the sample. Use **Start for real** to delete the sample changes and return to setup.

See [the demo contract](.factory/demo.md) for the sample and storage details.

## Privacy and capability boundaries

- Everyone must agree before the app requests microphone access.
- Live speech starts only when the browser confirms recognition runs on the device.
- Caption Lanes never retains raw audio. Caption text and settings remain in the browser until the user clears them.
- Direction is coarse, never identity. Stereo input can estimate left, centre, or right.
- Mono devices show a limitation and keep the manual direction controls available.
- Number keys 1–4 select a direction outside text fields.
- Captions and direction can be wrong. Do not use this app for emergencies, medical decisions, legal records, or forensic work.

Supported Chromium browsers may offer an on-device language pack. The app asks to install that pack before live speech starts.

## Develop and verify

Use Node.js 20 or newer.

~~~sh
npm ci
npm audit --audit-level=high
npm run lint
npm run typecheck
npm test
npm run build
~~~

The production build command is npm run build. It writes the static site to dist/.

Useful focused commands:

~~~sh
npm run test:unit
npm run test:e2e
npm run preview
npm run cap:sync
npm run test:live
~~~

Playwright is pinned to 1.58.2. Tests cover desktop Chromium and an exact 390 × 844 mobile viewport.

Every public product claim is listed in [the claim inventory](.factory/claims.json). Each entry includes its exact browser command and sandbox.

## Deploy the static site

Build and verify before deployment:

~~~sh
npm ci
npm test
npm run build
swa deploy ./dist --app-name sf-speaker-lane-captions --env production
npm run test:live
~~~

Azure Static Web Apps reads dist/staticwebapp.config.json. The factory owns DNS and infrastructure settings.

## Android project

The Capacitor wrapper is in `android/`. Its app ID is `in.sociobot.speakerlanecaptions`.

Android 12 and newer use a native on-device speech bridge, not the WebView speech API. While captions run, the app samples a two-channel microphone locally to place captions in a coarse Left, Centre, or Right lane and shows direction confidence. It discards every audio sample after measuring it. A one-channel or unavailable input keeps captions running and asks for manual lane choice. The app never infers identity or saves raw audio.

Refresh native web assets:

~~~sh
npm run cap:sync
~~~

Build a debug APK on a worker with the Android SDK and JDK:

~~~sh
cd android
./gradlew assembleDebug
~~~

`NativeCaptionBridgeTest` checks the packaged WebView bridge. It reports unavailable without a local language model. Compile it with `./gradlew :app:assembleDebugAndroidTest`. Run it on Android 12+ with `./gradlew connectedDebugAndroidTest`.

`npm run test:android` finds a local JDK and Android SDK when they are available. On a clean web-only worker, it verifies the successful `Android package` GitHub Actions run and retained APK artifact for the checked-out Android source instead. The workflow uses Java 21, Android 35, native direction unit tests, and a packaged Android emulator bridge test.

Release signing and distribution belong to a later Android work order. No keystore or secret belongs in this repository.

## Paid license

The buy link opens checkout hosted by Sociobot/Dodo. The app does not collect card details.

The returned license uses `sb_license:speaker-lane-captions`. A valid check is reused for one day. The app checks the license again when the device reconnects.

Users can paste a license on another device. Typed captions, display controls, confidence filtering, and transcript export remain free.

## Project documentation

- [Researched brief](.factory/brief.json)
- [Visual thesis](.factory/design.md)
- [Claim inventory](.factory/claims.json)
- [Demo contract](.factory/demo.md)
- [Repair handoff](.factory/handoff.md)
- [Privacy policy](privacy/index.html)
- [Terms](terms/index.html)

Caption Lanes uses the MIT license. The original generated artwork and its provenance are in assets/src/.
