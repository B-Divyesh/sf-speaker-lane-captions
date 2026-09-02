# Adversarial first-read review 4 — Caption Lanes

**Verdict: PASS**

Reviewed 2026-09-02 UTC at commit `3fb9b8f6e61fa551f240b922e086c29f440f5f1a`
and at <https://speaker-lane-captions.sociobot.in/>. This round has zero
findings, zero untested claims, and no reopened earlier finding. No `F-4-*`
identifier was issued.

## 1. Cold first screen

Fresh Chromium contexts were opened before scrolling at 390 × 844 and
1440 × 900.

- **What it does:** It places live captions into separate lanes based on the
  direction of the speaker.
- **Who it is for:** Deaf and hard-of-hearing people following small, in-person
  conversations.
- **What to click first:** **Try it with sample data**.

The exact visible text that supports those answers is “Place live captions by
speaker direction.”, “For Deaf and hard-of-hearing people who need to follow
small, in-person conversations.”, and “Try it with sample data”. The primary
action and all three privacy/offline/price facts fit inside the 844 px mobile
viewport. The cold loads made only same-origin requests and produced no console
or page errors.

## 2. Copy audit

Counts use whitespace-delimited words. Hyphenated terms, prices, URLs, and code
tokens count as one word. Visible copy, product states, dialogs, and README
prose are included. No sentence exceeds 22 words. No banned marketing word,
unexplained provider claim, inconsistent product term, mood heading, metaphor
heading, or non-result-naming action remains.

### Landing and product sentences

| Words | Exact copy | Result |
| ---: | --- | --- |
| 6 | Place live captions by speaker direction. | Pass |
| 12 | For Deaf and hard-of-hearing people who need to follow small, in-person conversations. | Pass |
| 7 | The demo opens a saved sample conversation. | Pass |
| 4 | No microphone is used. | Pass |
| 6 | Private: Raw audio is never saved. | Pass |
| 9 | Offline: The installed app opens after one online visit. | Pass |
| 5 | Price: Three lanes are free. | Pass |
| 5 | A fourth costs $24 once. | Pass |
| 3 | Ask everyone first. | Pass |
| 11 | Caption Lanes uses your microphone only while this screen is open. | Pass |
| 5 | Raw audio is never saved. | Pass |
| 5 | On-device speech support is required. | Pass |
| 6 | Everyone here agrees to live captions. | Pass |
| 11 | A supported browser may ask to install its on-device language pack. | Pass |
| 8 | Tap a direction whenever the estimate is uncertain. | Pass |
| 9 | Caption Lanes requests microphone access only after everyone agrees. | Pass |
| 5 | Set it near the middle. | Pass |
| 7 | Stereo microphones estimate left, centre, or right. | Pass |
| 8 | Tap a direction when the estimate is uncertain. | Pass |
| 7 | Export or import caption text in Settings. | Pass |
| 7 | Direction is coarse and can be wrong. | Pass |
| 6 | Caption Lanes does not identify people. | Pass |
| 9 | Do not use it for emergencies or official records. | Pass |
| 10 | Caption text stays in this browser until you clear it. | Pass |
| 9 | The app uses no account, analytics, or cloud archive. | Pass |
| 7 | Typed captions remain available without microphone access. | Pass |
| 4 | Plus costs $24 once. | Pass |
| 5 | It adds an “Across” lane. | Pass |
| 11 | Typed captions, display controls, confidence filtering, and transcript export stay free. | Pass |
| 8 | Caption Lanes Plus adds a fourth “Across” lane. | Pass |
| 3 | Sociobot/Dodo hosts checkout. | Pass |
| 11 | If checkout is unavailable, keep this dialog open and try again. | Pass |
| 4 | Typed-caption mode is active. | Pass |
| 8 | Choose a direction, then type each utterance below. | Pass |
| 8 | Tap when the phone cannot place a voice. | Pass |
| 5 | Number keys 1–4 also work. | Pass |
| 7 | Speech from your left will gather here. | Pass |
| 6 | Speech from ahead will gather here. | Pass |
| 7 | Speech from your right will gather here. | Pass |
| 8 | A fourth manually selected voice will gather here. | Pass |
| 6 | Hides results below 60% recognition confidence. | Pass |
| 2 | Transcript exported. | Pass |
| 6 | Across closed because Plus is inactive. | Pass |
| 4 | Centre is now selected. | Pass |
| 6 | Plus is active on this device. | Pass |
| 1 | Offline. | Pass |
| 6 | Using the last verified license state. | Pass |
| 6 | This license is no longer active. | Pass |
| 3 | Sample conversation reset. | Pass |
| 4 | An update is ready. | Pass |
| 6 | Reopen Caption Lanes to use it. | Pass |
| 7 | Environmental artwork was generated for this product. | Pass |

### Runtime errors and recovery copy

| Words | Exact copy | Result |
| ---: | --- | --- |
| 6 | This browser cannot guarantee on-device speech. | Pass |
| 4 | Use typed captions instead. | Pass |
| 7 | The on-device language pack was not installed. | Pass |
| 10 | Connect once, then start captions and accept the language download. | Pass |
| 8 | The on-device language pack could not be checked. | Pass |
| 8 | Use typed captions and try again after reconnecting. | Pass |
| 4 | Microphone permission was denied. | Pass |
| 11 | Allow microphone access in your device settings, or use typed captions. | Pass |
| 10 | The on-device language pack is not installed for this language. | Pass |
| 4 | No microphone was found. | Pass |
| 7 | Check the device microphone and try again. | Pass |
| 5 | On-device speech could not start. | Pass |
| 8 | Install the language pack while online, then retry. | Pass |
| 3 | Captions stopped unexpectedly. | Pass |
| 3 | Try starting again. | Pass |
| 5 | On-device captions could not start. | Pass |
| 8 | Close other apps using the microphone and retry. | Pass |
| 9 | On-device captions are not available on this Android device. | Pass |
| 4 | Use typed captions instead. | Pass |
| 11 | This Android microphone has one channel, so choose a direction manually. | Pass |
| 5 | On-device captions could not start. | Pass |
| 6 | Allow microphone access, then try again. | Pass |
| 8 | On-device speech is not available in this browser. | Pass |
| 4 | Use typed captions instead. | Pass |
| 11 | This microphone exposes one audio channel, so automatic direction is limited. | Pass |
| 9 | Tap Left, Centre, or Right when the speaker changes. | Pass |
| 5 | The microphone could not start. | Pass |
| 8 | Check that another app is not using it. | Pass |
| 6 | Sample data could not be removed. | Pass |
| 8 | Close other Caption Lanes tabs, then try again. | Pass |
| 2 | Transcript cleared. | Pass |
| 8 | That file is not a Caption Lanes transcript. | Pass |
| 6 | The transcript could not be saved. | Pass |
| 5 | Your current captions are unchanged. | Pass |
| 7 | Start for real before restoring a license. | Pass |
| 8 | Start for real before buying Caption Lanes Plus. | Pass |

The six demo utterances are realistic sample data: “Should we move the chairs
closer?” (6), “This distance works well for me.” (6), “I can turn down the
music too.” (7), “Yes, then let’s plan Saturday lunch.” (6), “Noon works.” (2),
“I will book the table.” (5), and “Please choose somewhere quiet.” (4).

### Headings, actions, and terminology

The headings are literal and useful out of context: “Directional captions for
small groups” (5), “Before listening” (2), “How to use Caption Lanes” (5),
“Know what the app cannot do” (6), “Add a fourth lane” (4), “Conversation” (1),
“Caption settings” (2), and “Add a fourth caption lane” (5).

Visible actions name their result: “Try it with sample data”, “Start real
captions”, “Start captions”, “Explore with typed captions”, “Pause” / “Resume”,
“Export transcript”, “End captions”, “Add to lane”, “Import transcript”, “Clear
transcript”, “Reset demo”, “Start for real”, “View Plus details”, “Restore
license”, “Buy Caption Lanes Plus”, and the lane-color lock actions. Direction
buttons are state selectors with direction, arrow, pressed state, and shortcut
in their accessible names.

Terminology is consistent: **lane** for one direction’s caption stream,
**direction** for placement, **transcript** for stored caption text, **typed
caption** for manual entry, **confidence** for estimate strength, **demo** for
the isolated sample, and **Caption Lanes Plus** for the paid fourth lane.

### README sentences

| Words | Exact copy | Result |
| ---: | --- | --- |
| 11 | Caption Lanes places live captions into left, centre, and right lanes. | Pass |
| 10 | It is for Deaf and hard-of-hearing people in small groups. | Pass |
| 18 | The free app provides three lanes, a saved transcript, typed input, confidence filtering, and transcript import and export. | Pass |
| 11 | Caption Lanes Plus costs $24 once and adds a fourth lane. | Pass |
| 15 | Open <https://speaker-lane-captions.sociobot.in/demo>, add `?demo=1` to the home URL, or select **Try it with sample data**. | Pass |
| 9 | The demo opens a six-caption conversation without a microphone. | Pass |
| 17 | It keeps temporary data in a separate store named `demo:caption-lanes` and never reads real captions or settings. | Pass |
| 7 | Use **Reset demo** to restore the sample. | Pass |
| 16 | **Start for real** waits until every demo database and setting is deleted, then returns to setup. | Pass |
| 16 | If another tab blocks deletion, the demo stays open and tells you to close that tab. | Pass |
| 9 | Real captions, settings, and a Plus license remain unchanged. | Pass |
| 10 | See the demo contract for the sample and storage details. | Pass |
| 9 | Everyone must agree before the app requests microphone access. | Pass |
| 13 | Live speech starts only when the browser confirms recognition runs on the device. | Pass |
| 6 | Caption Lanes never retains raw audio. | Pass |
| 13 | Caption text and settings remain in the browser until the user clears them. | Pass |
| 5 | Direction is coarse, never identity. | Pass |
| 8 | Stereo input can estimate left, centre, or right. | Pass |
| 12 | Mono devices show a limitation and keep the manual direction controls available. | Pass |
| 9 | Number keys 1–4 select a direction outside text fields. | Pass |
| 6 | Captions and direction can be wrong. | Pass |
| 14 | Do not use this app for emergencies, medical decisions, legal records, or forensic work. | Pass |
| 9 | Supported Chromium browsers may offer an on-device language pack. | Pass |
| 11 | The app asks to install that pack before live speech starts. | Pass |
| 5 | Use Node.js 20 or newer. | Pass |
| 8 | The production build command is npm run build. | Pass |
| 7 | It writes the static site to dist/. | Pass |
| 5 | Playwright is pinned to 1.58.2. | Pass |
| 12 | Tests cover desktop Chromium and an exact 390 × 844 mobile viewport. | Pass |
| 10 | Every public product claim is listed in the claim inventory. | Pass |
| 9 | Each entry includes its exact browser command and sandbox. | Pass |
| 6 | Azure Static Web Apps reads dist/staticwebapp.config.json. | Pass |
| 7 | The factory owns DNS and infrastructure settings. | Pass |
| 6 | The Capacitor wrapper is in `android/`. | Pass |
| 5 | Its app ID is `in.sociobot.speakerlanecaptions`. | Pass |
| 15 | Android 12 and newer use a native on-device speech bridge, not the WebView speech API. | Pass |
| 10 | While captions run, the app measures a two-channel microphone locally. | Pass |
| 12 | It uses that measurement for a coarse Left, Centre, or Right lane. | Pass |
| 4 | It shows direction confidence. | Pass |
| 8 | It discards every audio sample after measuring it. | Pass |
| 14 | A one-channel or unavailable input keeps captions running and asks for manual lane choice. | Pass |
| 9 | The app never infers identity or saves raw audio. | Pass |
| 6 | `NativeCaptionBridgeTest` checks the packaged WebView bridge. | Pass |
| 8 | It reports unavailable without a local language model. | Pass |
| 5 | Compile it with `./gradlew :app:assembleDebugAndroidTest`. | Pass |
| 8 | Run it on Android 12+ with `./gradlew connectedDebugAndroidTest`. | Pass |
| 13 | `npm run test:android` builds locally when a JDK and Android SDK are available. | Pass |
| 14 | On web-only workers, it checks the matching Android package run and retained APK artifact. | Pass |
| 21 | The workflow uses Java 21, Android 35 build tools, native direction unit tests, and a packaged Android 12 emulator bridge test. | Pass |
| 11 | Release signing and distribution belong to a later Android work order. | Pass |
| 8 | No keystore or secret belongs in this repository. | Pass |
| 8 | The buy link opens checkout hosted by Sociobot/Dodo. | Pass |
| 7 | The app does not collect card details. | Pass |
| 5 | The returned license uses `sb_license:speaker-lane-captions`. | Pass |
| 8 | A valid check is reused for one day. | Pass |
| 10 | The app checks the license again when the device reconnects. | Pass |
| 8 | Users can paste a license on another device. | Pass |
| 11 | Typed captions, display controls, confidence filtering, and transcript export remain free. | Pass |
| 6 | Caption Lanes uses the MIT license. | Pass |
| 10 | The original generated artwork and its provenance are in assets/src/. | Pass |

README headings and command introductions are literal: “Caption Lanes” (2),
“Try the isolated demo” (4), “Privacy and capability boundaries” (4), “Develop
and verify” (3), “Useful focused commands” (3), “Deploy the static site” (4),
“Build and verify before deployment” (5), “Android project” (2), “Refresh native
web assets” (4), “Build a debug APK on a worker with the Android SDK and JDK”
(13), “Paid license” (2), and “Project documentation” (2). “Live product” (2)
and the seven documentation-link labels are useful labels, not prose sentences.
Command blocks are not prose sentences.

## 3. Demo and sandbox

**Result: pass.** The landing action opens `/demo` in one click. The first demo
screen is already the working caption room with three lanes and six realistic
captions. The persistent banner says “Demo — sample data, nothing is saved” and
shows **Reset demo** and **Start for real**.

The live check seeded a real transcript, preferences, and a Plus license before
entry. The demo showed three default lanes, never displayed the real transcript,
and used only `demo:caption-lanes*` storage. Adding a seventh demo caption and
selecting Reset restored the original six. Start for real removed every
demo-prefixed IndexedDB, localStorage, and sessionStorage value while preserving
the real transcript, settings, and Plus license. A deliberately blocked database
deletion kept the visitor in demo, announced the exact recovery step, focused
the retry action, and succeeded after the block closed.

The live demo request log contained no cross-origin request and recorded zero
microphone calls. A fresh service-worker context reopened the exact `/demo` URL
offline with all six captions.

## 4. Claims

All commands were run from a fresh clone of
`https://github.com/B-Divyesh/sf-speaker-lane-captions.git` at the reviewed
commit. The 23 browser commands each passed in desktop Chromium and exact
390 × 844 Chromium. The Android command passed by verifying the immutable
matching GitHub Actions run `33574158247` and retained debug/test APK artifact
`android-apks-3fb9b8f6e61fa551f240b922e086c29f440f5f1a`.

| Claim | Result |
| --- | --- |
| `demo-isolation` | Pass — 2/2 browser projects |
| `directional-lanes` | Pass — 2/2 browser projects |
| `stereo-direction` | Pass — 2/2 browser projects |
| `local-privacy` | Pass — 2/2 browser projects |
| `raw-audio-storage` | Pass — 2/2 browser projects |
| `offline-reload` | Pass — 2/2 browser projects |
| `caption-persistence` | Pass — 2/2 browser projects |
| `transcript-portability` | Pass — 2/2 browser projects |
| `typed-limit` | Pass — 2/2 browser projects |
| `confidence-filter` | Pass — 2/2 browser projects |
| `local-speech` | Pass — 2/2 browser projects |
| `android-native-caption-path` | Pass — exact-revision workflow and retained APK evidence |
| `plus-license` | Pass — 2/2 browser projects |
| `consent-before-microphone` | Pass — 2/2 browser projects |
| `microphone-lifecycle` | Pass — 2/2 browser projects |
| `no-accounts-analytics-archive` | Pass — 2/2 browser projects |
| `no-identity-inference` | Pass — 2/2 browser projects |
| `mono-input` | Pass — 2/2 browser projects |
| `language-pack-flow` | Pass — 2/2 browser projects |
| `free-core-controls` | Pass — 2/2 browser projects |
| `license-portability` | Pass — 2/2 browser projects |
| `license-reconnect` | Pass — 2/2 browser projects |
| `hosted-checkout` | Pass — 2/2 browser projects |
| `revoked-license` | Pass — 2/2 browser projects |

The landing page, product states, Privacy, Terms, and README were cross-checked
against the inventory. No unlisted claim-like sentence remains. The copy does
not claim the brief’s 80% attribution target as an achieved result.

## 5. Earlier finding verification

Every earlier review, polish record, and handoff was read. Each finding was
checked in current source and on the live product.

| Earlier finding | Current verification |
| --- | --- |
| `F-1-1` checkout reliability and coverage | Fixed: the hosted-checkout claim passed in both browser projects and ten live-release requests returned 303 to `checkout.dodopayments.com`; recovery copy is present. |
| `F-1-2`, `F-2-2` Android core path | Fixed: native speech bridge, direction estimator, native unit/bridge tests, exact-revision Android workflow, and retained APKs are present. |
| `F-1-3` consent and microphone lifecycle | Fixed: dedicated tests cover pre-consent denial and Pause, End, navigation, background, and close cleanup. |
| `F-1-4` account, analytics, archive, and identity claims | Fixed: dedicated request-log and stored-field tests pass. |
| `F-1-5` mono input and language pack | Fixed: limitation/manual placement and install-before-start tests pass. |
| `F-1-6` free feature boundary | Fixed: unlicensed typed captions, display controls, filtering, lane color, and export pass. |
| `F-1-7` license portability and reconnect | Fixed: fresh-context restore and reconnect recheck pass. |
| `F-1-8`, `F-2-3` claim completeness and refund wording | Fixed: unprovable handler wording is absent; revoked and refunded verdicts are tested. |
| `F-1-9` route focus and announcement | Fixed: Demo, Back, Forward, and exit update the title, announce the route, and focus the active h1. |
| `F-1-10`, `F-2-5` shared mobile chrome | Fixed: Demo and Privacy remain visible at 390 px on home, demo, legal, and 404 routes; footers are consistent. |
| `F-1-11` secondary-route metadata | Fixed: Privacy, Terms, and 404 have route titles, descriptions, canonicals, OG/Twitter data, favicons, and Apple icons. |
| `F-1-12` metaphor headings | Fixed: literal “How to use Caption Lanes”, “Add a fourth caption lane”, and “Page not found.” remain live. |
| `F-1-13` ambiguous actions | Fixed: Export transcript, End captions, Restore license, View Caption Lanes Plus, and lane-color actions remain explicit. |
| `F-1-14`, `F-2-4` jargon and inconsistent terms | Fixed: transcript, separate store, browser-confirmed speech, recheck, and sample-change deletion wording remain consistent. |
| `F-2-1` real Plus state in demo | Fixed: a seeded real entitlement still produces exactly three demo lanes before and after Reset, then returns only in real mode. |
| `F-3-1` long Android README sentences | Fixed: the replacement sentences are 10, 12, 4, 13, and 14 words. |

No earlier finding is half-fixed or regressed.

## 6. Structure, routing, links, identity, and accessibility

- `/`, `/demo`, `/privacy/`, `/terms/`, and the designed HTTP 404 each have the
  required route-specific title, one h1, `lang="en"`, main landmark, description,
  canonical URL, Open Graph/Twitter metadata, favicon, and Apple icon.
- Landing → Demo → Back → Forward restores the correct URL, title, view, focused
  h1, and polite route announcement. Direct deep links and reloads work.
- Every discovered HTTP link passed: internal links returned 200, hash targets
  exist, mail links are explicit, and checkout returned 303 to the approved
  hosted domain.
- The shared header and footer are present across routes with Demo, Privacy,
  Terms, the product one-liner, Param Factory credit, and build id.
- The baseline live verifier reported a 622 ms network-idle load, one h1,
  `lang=en`, a main landmark, no missing alt text, no unlabeled buttons, and zero
  console errors.
- Playwright axe found zero WCAG A/AA violations on home, demo, Privacy, Terms,
  and 404 at 390 px. Keyboard controls, 44 px targets, focus visibility, and
  reduced-motion behavior also pass the full browser suite.
- The build ships 31.48 kB JavaScript raw / 11.24 kB gzip and 17.70 kB CSS raw /
  4.78 kB gzip. The live files match the clean build byte for byte.
- The cinematic table artwork, night-pine palette, serif caption voice,
  directional lane geometry, and three colored light pools implement the design
  record. The result is product-specific and not a generic SaaS template.

## 7. Missed leverage

No finding. Transcript JSON import/export already provides the obvious portable
workflow. Account sync would conflict with the brief’s local, no-account design.
Sending conversations to a gateway model would weaken the explicit local speech
and privacy boundary without improving directional placement. No decorative AI
feature or embedded provider key exists.

## 8. Verification record

| Check | Result |
| --- | --- |
| Fresh GitHub clone at `3fb9b8f` + `npm ci` | Pass — 255 packages, 0 vulnerabilities |
| All 24 exact claim commands | Pass |
| `npm test` | Pass — 9 unit tests and 86 Playwright runs |
| `npm run lint` | Pass |
| `npm run typecheck` | Pass |
| `npm run build` | Pass — `dist/` produced |
| `npm run test:live` | Pass — checkout, policy, favicon, 404, and byte identity |
| Independent live demo/route/offline script | Pass |
| `/opt/fleet/lib/verify-url.sh` | Pass — no console errors |
| Link and hash crawl | Pass |

## What would make this perfect

Nothing remains to change within this review’s product scope. Preserve the
current local-first boundary and do not add cloud AI or account sync. Run the
brief’s physical four-person study before publishing any quantitative direction
accuracy claim; the current product makes no such claim.
