# Caption Lanes copy audit

Audited: 2026-08-30

Scope: every static sentence and meaningful interface phrase in `index.html`. Word counts treat hyphenated terms, prices, and version strings as one word.

## First-screen proof

Read aloud: “Place live captions by speaker direction. For Deaf and hard-of-hearing people who need to follow small, in-person conversations. Try it with sample data.”

This says what the product does, names its audience, and gives the first action in one breath. Desktop and 390 × 844 browser tests assert that the action and all three facts remain inside the initial viewport.

## First screen

| Copy | Words | Status |
| --- | ---: | --- |
| Directional captions for small groups | 5 | Pass |
| Place live captions by speaker direction. | 6 | Pass |
| For Deaf and hard-of-hearing people who need to follow small, in-person conversations. | 12 | Pass |
| Try it with sample data | 5 | Pass |
| Start real captions | 3 | Pass |
| The demo opens a saved sample conversation. | 7 | Pass |
| No microphone is used. | 4 | Pass |
| Private: Raw audio is never saved. | 6 | Pass |
| Offline: The installed app opens after one online visit. | 9 | Pass |
| Price: Three lanes are free. | 5 | Pass |
| A fourth costs $24 once. | 5 | Pass |
| Caption text stays here | 4 | Pass |
| You’re offline. | 2 | Pass |
| Use typed captions if live speech is unavailable. | 8 | Pass |

## Setup and explanation

| Copy | Words | Status |
| --- | ---: | --- |
| Ask everyone first. | 3 | Pass |
| Caption Lanes uses your microphone only while this screen is open. | 11 | Pass |
| Raw audio is never saved. | 6 | Pass |
| On-device speech support is required. | 5 | Pass |
| No accounts or cloud archive | 5 | Pass |
| No voiceprints or identity guesses | 5 | Pass |
| Coarse direction, with confidence shown | 5 | Pass |
| Everyone here agrees to live captions. | 6 | Pass |
| A supported browser may ask to install its on-device language pack. | 10 | Pass |
| Tap a direction whenever the estimate is uncertain. | 8 | Pass |
| How to use Caption Lanes | 5 | Pass |
| Caption Lanes requests microphone access only after everyone agrees. | 9 | Pass |
| Set it near the middle. | 5 | Pass |
| Stereo microphones estimate left, centre, or right. | 7 | Pass |
| Tap a direction when the estimate is uncertain. | 8 | Pass |
| Export or import caption text in Settings. | 7 | Pass |

## Privacy, limits, and price

| Copy | Words | Status |
| --- | ---: | --- |
| Know what the app cannot do | 6 | Pass |
| Direction is coarse and can be wrong. | 7 | Pass |
| Caption Lanes does not identify people. | 6 | Pass |
| Do not use it for emergencies or official records. | 9 | Pass |
| Caption text stays in this browser until you clear it. | 10 | Pass |
| The app uses no account, analytics, or cloud archive. | 9 | Pass |
| Typed captions remain available without microphone access. | 7 | Pass |
| Plus costs $24 once. | 4 | Pass |
| It adds an “Across” lane. | 5 | Pass |
| Typed captions, display controls, confidence filtering, and transcript export stay free. | 10 | Pass |
| Caption Lanes Plus adds a fourth “Across” lane. | 8 | Pass |
| Typed captions, display controls, confidence filtering, and transcript export stay free. | 10 | Pass |
| Sociobot/Dodo hosts checkout. | 4 | Pass |
| If checkout is unavailable, keep this dialog open and try again. | 10 | Pass |

## Product-room and footer phrases

All remaining labels are short interface phrases, not prose sentences. They are listed to keep terminology visible.

| Phrase | Words | Status |
| --- | ---: | --- |
| Demo — sample data, nothing is saved | 7 | Pass |
| Reset demo | 2 | Pass |
| Start for real | 3 | Pass |
| Deleting sample changes… | 3 | Pass |
| Sample data could not be removed. | 6 | Pass |
| Close other Caption Lanes tabs, then try again. | 8 | Pass |
| Start for real before buying Caption Lanes Plus. | 8 | Pass |
| Ready · audio stays on this device | 7 | Pass |
| Tap when the phone cannot place a voice. | 8 | Pass |
| Number keys 1–4 also work. | 5 | Pass |
| Hide uncertain captions | 3 | Pass |
| Hides results below 60% recognition confidence. | 6 | Pass |
| Export transcript | 2 | Pass |
| End captions | 2 | Pass |
| Unlock lane color | 3 | Pass |
| Lock lane color | 3 | Pass |
| View Caption Lanes Plus | 4 | Pass |
| Add a fourth caption lane | 5 | Pass |
| Have a license? | 3 | Pass |
| Paste it here. | 3 | Pass |
| Restore license | 2 | Pass |
| Directional live captions for small, in-person groups. | 7 | Pass |
| Environmental artwork was generated for this product. | 7 | Pass |

## Banned-word scan

No audited product copy uses: leverage, seamless, effortless, robust, powerful, intuitive, reimagine, supercharge, delightful, journey, ecosystem, or AI-powered. “Unlock” is not used in customer-facing copy.

## Terminology

| Concept | One term used |
| --- | --- |
| A stream of captions from one direction | lane |
| Horizontal source estimate | direction |
| Stored text bundle | transcript |
| Keyboard-only fallback entry | typed caption |
| Recognition reliability setting | confidence |
| Paid fourth-lane purchase | Caption Lanes Plus |
| Isolated sample workspace | demo |
| User’s ordinary local workspace | real captions |

No sentence exceeds 22 words. No flagged wording remains.

## README changes in polish 2 and 3

| Copy | Words | Status |
| --- | ---: | --- |
| Use Start for real to delete the sample changes and return to setup. | 13 | Pass |
| Android 12 and newer use a native on-device speech bridge, not the WebView speech API. | 16 | Pass |
| It fails closed when Android has no local speech language installed, while typed captions remain available. | 16 | Pass |
| NativeCaptionBridgeTest checks the packaged WebView bridge. | 5 | Pass |
| It reports unavailable without a local language model. | 8 | Pass |
| While captions run, the app measures a two-channel microphone locally. | 10 | Pass |
| It uses that measurement for a coarse Left, Centre, or Right lane. | 12 | Pass |
| It shows direction confidence. | 4 | Pass |
| `npm run test:android` builds locally when a JDK and Android SDK are available. | 13 | Pass |
| On web-only workers, it checks the matching Android package run and retained APK artifact. | 13 | Pass |
| Start for real waits until every demo database and setting is deleted, then returns to setup. | 15 | Pass; `demo-isolation` |
| If another tab blocks deletion, the demo stays open and tells you to close that tab. | 15 | Pass; blocked-deletion browser test |
| Real captions, settings, and a Plus license remain unchanged. | 9 | Pass; `demo-isolation` |

## Catalog description

| Copy | Characters | Status |
| --- | ---: | --- |
| Follow small-group conversations with live captions split into left, centre, and right lanes. | 93 | Pass; verb first and under 120 characters |
