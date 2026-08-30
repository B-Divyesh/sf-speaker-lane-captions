# Caption Lanes

Caption Lanes places live captions into left, centre, and right lanes. It is for Deaf and hard-of-hearing people in small groups.

The free app provides three lanes, local caption history, typed input, confidence filtering, and transcript import and export. Caption Lanes Plus costs $24 once and adds a fourth lane.

Live product: <https://speaker-lane-captions.sociobot.in>

## Try the isolated demo

Open <https://speaker-lane-captions.sociobot.in/demo> or select **Try it with sample data** on the landing page.

The demo opens a six-caption conversation without a microphone. It uses the demo:caption-lanes storage namespace and never reads real captions or settings.

Use **Reset demo** to restore the sample. Use **Start for real** to clear the demo namespace and return to setup.

See [the demo contract](.factory/demo.md) for the sample and storage details.

## Privacy and capability boundaries

- Everyone must agree before the app requests microphone access.
- Speech requires the browser’s processLocally mode. The app refuses speech tools that cannot confirm local processing.
- Caption Lanes never retains raw audio. Caption text and settings remain in the browser until the user clears them.
- Direction is coarse, never identity. Stereo input can estimate left, centre, or right.
- Mono devices show a limitation and keep the manual direction controls available.
- Number keys 1–4 select a direction outside text fields.
- Captions and direction can be wrong. Do not use this app for emergencies, medical decisions, legal records, or forensic work.

Supported Chromium and Android versions need the on-device Web Speech API. Live speech also needs a downloaded language pack.

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
swa deploy ./dist --app-name sf-speaker-lane-captions --resource-group sociobot --env production
npm run test:live
~~~

Azure Static Web Apps reads dist/staticwebapp.config.json. The factory owns DNS and infrastructure settings.

## Android project

The Capacitor wrapper is in android/. Its app ID is in.sociobot.speakerlanecaptions.

Refresh native web assets:

~~~sh
npm run cap:sync
~~~

Build a debug APK on a worker with the Android SDK and JDK:

~~~sh
cd android
./gradlew assembleDebug
~~~

Release signing and distribution belong to a later Android work order. No keystore or secret belongs in this repository.

## Paid license

Checkout uses the Sociobot billing API. The app never embeds a payment provider.

The returned license uses sb_license:speaker-lane-captions. A valid check is reused for one day and reconciled when the device reconnects.

Users can paste a license on another device. Core captions, export, privacy, and accessibility controls remain free.

## Project documentation

- [Researched brief](.factory/brief.json)
- [Visual thesis](.factory/design.md)
- [Claim inventory](.factory/claims.json)
- [Demo contract](.factory/demo.md)
- [Repair handoff](.factory/handoff.md)
- [Privacy policy](privacy/index.html)
- [Terms](terms/index.html)

Caption Lanes uses the MIT license. The original generated artwork and its provenance are in assets/src/.
