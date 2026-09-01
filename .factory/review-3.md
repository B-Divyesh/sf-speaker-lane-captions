# Caption Lanes — QA review 3

**Verdict: FAIL**

Reviewed 2026-09-01 UTC at source `45d0fa944732a326a54b25cc8560d3c1d43a889c` and at <https://speaker-lane-captions.sociobot.in/>. A pass requires zero findings. This review has one minor finding.

## Finding

### Minor

#### F-3-1 — Two README sentences exceed the product copy limit

- **Exact copy/location:** Android project section: “While captions run, the app samples a two-channel microphone locally to place captions in a coarse Left, Centre, or Right lane and shows direction confidence.” (25 words). The `npm run test:android` paragraph: “On a clean web-only worker, it verifies the successful Android package GitHub Actions run and retained APK artifact for the checked-out Android source instead.” (24 words).
- **Check result:** The attached plain-words rules set a 22-word maximum and ask for one idea per sentence. Both sentences join several technical facts, so a reader has to unpack the condition, action, output, and verification path together.
- **Concrete fix:** Replace the first with: “While captions run, the app measures a two-channel microphone locally. It uses that measurement for a coarse Left, Centre, or Right lane. It shows direction confidence.” Replace the second with: “`npm run test:android` builds locally when a JDK and Android SDK are available. On web-only workers, it checks the matching Android package run and retained APK artifact.”

## 1. Cold first screen

Check performed in fresh Chromium contexts before scrolling at 390 × 844 and 1440 × 900.

- **What it does:** It places captions in left, centre, and right lanes so people can follow the direction of speech.
- **Who it is for:** Deaf and hard-of-hearing people following small, in-person groups.
- **What to click first:** **Try it with sample data**.

The first screen states “Place live captions by speaker direction.”, “For Deaf and hard-of-hearing people who need to follow small, in-person conversations.”, and “Try it with sample data.” At 390 px, the action ends at 643 px and the three facts end at 816 px, within the 844 px viewport. This check passes. The load made only same-origin requests and recorded no browser-console or page errors.

## 2. Copy audit

Counts use whitespace-delimited words; hyphenated terms, prices, URLs, and code tokens each count as one word. Every landing-page prose sentence is listed below. The only over-limit sentences are F-3-1 in the README.

### Landing prose

| Words | Copy | Result |
| ---: | --- | --- |
| 6 | Place live captions by speaker direction. | Pass |
| 12 | For Deaf and hard-of-hearing people who need to follow small, in-person conversations. | Pass |
| 7 | The demo opens a saved sample conversation. | Pass |
| 4 | No microphone is used. | Pass; `local-privacy` |
| 6 | Private: Raw audio is never saved. | Pass; `raw-audio-storage` |
| 9 | Offline: The installed app opens after one online visit. | Pass; `offline-reload` |
| 5 | Price: Three lanes are free. | Pass; `plus-license` |
| 5 | A fourth costs $24 once. | Pass; `plus-license` |
| 3 | Ask everyone first. | Pass |
| 11 | Caption Lanes uses your microphone only while this screen is open. | Pass; `microphone-lifecycle` |
| 6 | Raw audio is never saved. | Pass; `raw-audio-storage` |
| 5 | On-device speech support is required. | Pass; `local-speech` |
| 6 | Everyone here agrees to live captions. | Pass |
| 10 | A supported browser may ask to install its on-device language pack. | Pass; `language-pack-flow` |
| 8 | Tap a direction whenever the estimate is uncertain. | Pass |
| 9 | Caption Lanes requests microphone access only after everyone agrees. | Pass; `consent-before-microphone` |
| 5 | Set it near the middle. | Pass |
| 7 | Stereo microphones estimate left, centre, or right. | Pass; `stereo-direction` |
| 8 | Tap a direction when the estimate is uncertain. | Pass |
| 7 | Export or import caption text in Settings. | Pass; `transcript-portability` |
| 7 | Direction is coarse and can be wrong. | Pass; useful limitation |
| 6 | Caption Lanes does not identify people. | Pass; `no-identity-inference` |
| 9 | Do not use it for emergencies or official records. | Pass; useful limitation |
| 10 | Caption text stays in this browser until you clear it. | Pass; `caption-persistence` |
| 9 | The app uses no account, analytics, or cloud archive. | Pass; `no-accounts-analytics-archive` |
| 7 | Typed captions remain available without microphone access. | Pass; `local-speech` |
| 4 | Plus costs $24 once. | Pass; `plus-license` |
| 5 | It adds an “Across” lane. | Pass; `plus-license` |
| 10 | Typed captions, display controls, confidence filtering, and transcript export stay free. | Pass; `free-core-controls` (two locations) |
| 8 | Caption Lanes Plus adds a fourth “Across” lane. | Pass; `plus-license` |
| 4 | Sociobot/Dodo hosts checkout. | Pass; `hosted-checkout` |
| 10 | If checkout is unavailable, keep this dialog open and try again. | Pass |
| 7 | Ready · audio stays on this device. | Pass; `local-speech` and `raw-audio-storage` |
| 5 | Typed-caption mode is active. | Pass |
| 8 | Choose a direction, then type each utterance below. | Pass |
| 8 | Tap when the phone cannot place a voice. | Pass; `mono-input` |
| 5 | Number keys 1–4 also work. | Pass; `directional-lanes` |
| 7 | Speech from your left will gather here. | Pass |
| 6 | Speech from ahead will gather here. | Pass |
| 7 | Speech from your right will gather here. | Pass |
| 8 | A fourth manually selected voice will gather here. | Pass; `plus-license` |
| 6 | Hides results below 60% recognition confidence. | Pass; `confidence-filter` |
| 2 | Transcript exported. | Pass; `transcript-portability` |
| 9 | Across closed because Plus is inactive. Centre is now selected. | Pass; `revoked-license` |
| 6 | Plus is active on this device. | Pass; `plus-license` |
| 7 | Offline. Using the last verified license state. | Pass; `license-reconnect` |
| 6 | This license is no longer active. | Pass; `revoked-license` |
| 3 | Sample conversation reset. | Pass |
| 7 | An update is ready. Reopen Caption Lanes to use it. | Pass |
| 7 | Environmental artwork was generated for this product. | Pass; provenance disclosure |

Headings are literal and useful out of context: “Directional captions for small groups” (5), “Before listening” (2), “How to use Caption Lanes” (5), “Know what the app cannot do” (6), “Add a fourth lane” (4), “Conversation” (1), “Caption settings” (2), and “Add a fourth caption lane” (5). Visible actions name their result, including “Try it with sample data”, “Start real captions”, “Export transcript”, “End captions”, “Import transcript”, “Clear transcript”, “Reset demo”, “Start for real”, “Restore license”, and “Buy Caption Lanes Plus”. No jargon, banned marketing adjective, inconsistent product term, mood heading, or non-result-naming visible action was found on the landing page.

### README prose

| Words | Copy | Result |
| ---: | --- | --- |
| 12 | Caption Lanes places live captions into left, centre, and right lanes. | Pass |
| 10 | It is for Deaf and hard-of-hearing people in small groups. | Pass |
| 18 | The free app provides three lanes, a saved transcript, typed input, confidence filtering, and transcript import and export. | Pass |
| 11 | Caption Lanes Plus costs $24 once and adds a fourth lane. | Pass; `plus-license` |
| 15 | Open the demo URL, add `?demo=1` to the home URL, or select **Try it with sample data**. | Pass |
| 9 | The demo opens a six-caption conversation without a microphone. | Pass; `demo-isolation` |
| 17 | It keeps temporary data in a separate store named `demo:caption-lanes` and never reads real captions or settings. | Pass; `demo-isolation` |
| 7 | Use **Reset demo** to restore the sample. | Pass |
| 13 | Use **Start for real** to delete the sample changes and return to setup. | Pass |
| 10 | See the demo contract for the sample and storage details. | Pass |
| 9 | Everyone must agree before the app requests microphone access. | Pass; `consent-before-microphone` |
| 13 | Live speech starts only when the browser confirms recognition runs on the device. | Pass; `local-speech` |
| 6 | Caption Lanes never retains raw audio. | Pass; `raw-audio-storage` |
| 13 | Caption text and settings remain in the browser until the user clears them. | Pass; `caption-persistence` |
| 5 | Direction is coarse, never identity. | Pass; `no-identity-inference` |
| 8 | Stereo input can estimate left, centre, or right. | Pass; `stereo-direction` |
| 12 | Mono devices show a limitation and keep the manual direction controls available. | Pass; `mono-input` |
| 9 | Number keys 1–4 select a direction outside text fields. | Pass; `directional-lanes` |
| 6 | Captions and direction can be wrong. | Pass; useful limitation |
| 14 | Do not use this app for emergencies, medical decisions, legal records, or forensic work. | Pass; useful limitation |
| 9 | Supported Chromium browsers may offer an on-device language pack. | Pass; `language-pack-flow` |
| 11 | The app asks to install that pack before live speech starts. | Pass; `language-pack-flow` |
| 5 | Use Node.js 20 or newer. | Pass |
| 8 | The production build command is npm run build. | Pass |
| 7 | It writes the static site to dist/. | Pass |
| 5 | Playwright is pinned to 1.58.2. | Pass |
| 11 | Tests cover desktop Chromium and an exact 390 × 844 mobile viewport. | Pass |
| 10 | Every public product claim is listed in the claim inventory. | Pass; inventory check and all commands below |
| 9 | Each entry includes its exact browser command and sandbox. | Pass |
| 6 | Azure Static Web Apps reads dist/staticwebapp.config.json. | Pass |
| 7 | The factory owns DNS and infrastructure settings. | Pass |
| 6 | The Capacitor wrapper is in `android/`. | Pass |
| 5 | Its app ID is `in.sociobot.speakerlanecaptions`. | Pass |
| 16 | Android 12 and newer use a native on-device speech bridge, not the WebView speech API. | Pass; `android-native-caption-path` |
| 25 | While captions run, the app samples a two-channel microphone locally to place captions in a coarse Left, Centre, or Right lane and shows direction confidence. | **F-3-1** |
| 8 | It discards every audio sample after measuring it. | Pass; `android-native-caption-path` |
| 14 | A one-channel or unavailable input keeps captions running and asks for manual lane choice. | Pass; `android-native-caption-path` |
| 12 | The app never infers identity or saves raw audio. | Pass; `no-identity-inference`, `raw-audio-storage` |
| 5 | NativeCaptionBridgeTest checks the packaged WebView bridge. | Pass |
| 8 | It reports unavailable without a local language model. | Pass; `android-native-caption-path` |
| 10 | Compile it with `./gradlew :app:assembleDebugAndroidTest`. | Pass |
| 9 | Run it on Android 12+ with `./gradlew connectedDebugAndroidTest`. | Pass |
| 14 | `npm run test:android` finds a local JDK and Android SDK when they are available. | Pass |
| 24 | On a clean web-only worker, it verifies the successful Android package GitHub Actions run and retained APK artifact for the checked-out Android source instead. | **F-3-1** |
| 21 | The workflow uses Java 21, Android 35 build tools, native direction unit tests, and a packaged Android 12 emulator bridge test. | Pass |
| 10 | Release signing and distribution belong to a later Android work order. | Pass |
| 8 | No keystore or secret belongs in this repository. | Pass |
| 8 | The buy link opens checkout hosted by Sociobot/Dodo. | Pass; `hosted-checkout` |
| 7 | The app does not collect card details. | Pass; `hosted-checkout` |
| 6 | The returned license uses `sb_license:speaker-lane-captions`. | Pass |
| 8 | A valid check is reused for one day. | Pass; `plus-license` |
| 10 | The app checks the license again when the device reconnects. | Pass; `license-reconnect` |
| 8 | Users can paste a license on another device. | Pass; `license-portability` |
| 11 | Typed captions, display controls, confidence filtering, and transcript export remain free. | Pass; `free-core-controls` |
| 6 | Caption Lanes uses the MIT license. | Pass |
| 10 | The original generated artwork and its provenance are in assets/src/. | Pass |

README headings are literal (“Try the isolated demo”, “Privacy and capability boundaries”, “Develop and verify”, “Android project”, and “Paid license”). Aside from F-3-1, the terminology is consistent: lane, direction, transcript, typed caption, confidence, demo, real captions, and Caption Lanes Plus.

## 3. Demo and sandbox

Check that one click enters the demo: pass. Direct `/demo`, `?demo=1`, and the landing action open the active room, not an empty state. The first room screen shows three lanes and six realistic captions about planning a quiet Saturday lunch. The persistent banner reads “Demo — sample data, nothing is saved” and provides **Reset demo** and **Start for real**.

Check that reset restores the sample: pass. The live mobile run retained three lanes and the six visible sample captions before and after Reset. Check that the demo makes no microphone call and only same-origin requests: pass. Check that demo data is isolated from real captions, settings, and a cached Plus license: pass in the dedicated claim test. Demo has exactly three lanes before and after Reset; exiting restores the real state.

## 4. Claims

Check that every command in `.factory/claims.json` runs from a fresh GitHub clone at the reviewed revision: pass. The clone installed 255 packages with zero audit findings. The 23 browser claim commands each ran in the declared desktop and 390 px projects. `android-native-caption-path` ran through the declared clean-worker evidence path because this sandbox has no complete JDK/Android SDK; it verified the matching successful Android package run and retained debug/test APK artifact for `45d0fa944732a326a54b25cc8560d3c1d43a889c`.

| Claim ids checked | Result |
| --- | --- |
| `demo-isolation`, `directional-lanes`, `stereo-direction`, `local-privacy`, `raw-audio-storage`, `offline-reload`, `caption-persistence`, `transcript-portability` | Pass |
| `typed-limit`, `confidence-filter`, `local-speech`, `plus-license`, `consent-before-microphone`, `microphone-lifecycle`, `no-accounts-analytics-archive`, `no-identity-inference` | Pass |
| `mono-input`, `language-pack-flow`, `free-core-controls`, `license-portability`, `license-reconnect`, `hosted-checkout`, `revoked-license`, `android-native-caption-path` | Pass |

Check that claim-like public copy has an inventory entry: pass. The practical privacy, local processing, demo, offline, directional, transcript, license, paid feature, and Android statements map to the listed claims above. The only public-copy finding is the sentence length in F-3-1, not missing claim coverage.

## 5. Earlier finding verification

All earlier `review-*`, `polish-*`, and handoff files were read. The live checks and current source confirm the following.

| Earlier finding | Current result |
| --- | --- |
| F-1-1 | Fixed: the checkout link returned the expected 303 to hosted checkout and `hosted-checkout` covers five requests. |
| F-1-2 and F-2-2 | Fixed: `NativeCaptionPlugin`, `DirectionEstimator`, native unit coverage, packaged bridge coverage, and the matching retained Android workflow evidence are present. |
| F-1-3 | Fixed: consent-before-microphone and microphone-lifecycle tests pass. |
| F-1-4 | Fixed: no-account/analytics/archive and no-identity tests pass. |
| F-1-5 | Fixed: mono manual placement and language-pack flow tests pass. |
| F-1-6 | Fixed: free controls test passes. |
| F-1-7 | Fixed: restore and reconnect tests pass. |
| F-1-8 and F-2-3 | Fixed: checkout wording now names hosting only, and revoked plus refunded results are tested. |
| F-1-9 | Fixed: live Demo, Back, and Forward set the correct title, polite announcement, and focused h1. |
| F-1-10 and F-2-5 | Fixed: Demo and Privacy remain visible in the 390 px header on home, demo, legal, and not-found routes. |
| F-1-11 | Fixed: direct legal and not-found pages include route metadata and icons. |
| F-1-12 | Fixed: headings are literal. |
| F-1-13 | Fixed: controls name the action or result. |
| F-1-14 and F-2-4 | Fixed: the README says “delete the sample changes”, not storage terminology. |
| F-2-1 | Fixed: demo entry and Reset clear the in-memory Plus state; three demo lanes remained visible with a seeded real license. |

## 6. Structure, routing, links, and accessibility

Check that `/`, `/demo`, `/privacy/`, `/terms/`, and an unknown route have route-specific titles, descriptions, canonical URLs, Open Graph and Twitter values, favicon and Apple icon: pass. Each has one h1, `lang="en"`, and a main landmark. The unknown route returns the designed HTTP 404 page with a route back.

Check deep links, browser Back/Forward, focus, and announcements: pass. Landing → Demo focuses `room-title` and announces “Demo — Caption Lanes. Conversation”. Back focuses `page-title` and announces the home title; Forward restores the demo focus and title.

Check all discovered links: pass. Internal page links returned 200, the intentional not-found link returned 404, `mailto:` links were retained as mail links, and the buy link returned 303 to the approved hosted checkout. Headers and footers are consistent at 390 px and desktop.

Check browser-console output, baseline document checks, and axe: pass. `verify-url.sh` reported a 200 response, title, language, one h1, main landmark, image alt text, labelled buttons, and no console errors. Axe reported zero violations on home, demo, Privacy, Terms, and the not-found route at 390 px. The custom table art, dark room palette, serif caption treatment, directional lane geometry, and original artwork match the design record and are visually distinct from a generic template.

## 7. Missed leverage

Check for an obviously implied additional capability: no finding. JSON import and export cover transcript portability. Account sync would conflict with the stated local, no-account design. An optional model feature would send conversation content away from the local processing boundary and would not improve the core directional-caption task.

## What would make this perfect

Apply the two concise F-3-1 rewrites, rerun the copy audit and claim suite, and publish a review with zero findings.
