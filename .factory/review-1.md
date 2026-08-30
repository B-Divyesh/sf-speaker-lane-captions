# Adversarial first-read review 1 — Caption Lanes

**Verdict: FAIL**

Reviewed 2026-08-30 UTC at commit `25721878945ff4c70402885c5db619fd2b8fb598` and at
<https://speaker-lane-captions.sociobot.in/>. A pass requires zero findings. This
round has 14 findings, including two blocking findings.

## Findings

### Blocking

#### F-1-1 — The paid checkout failed live, and its claim test does not exercise checkout

- **Exact copy/location:** Plus dialog: “Buy Caption Lanes Plus” and “Secure
  hosted checkout.” The dialog also says “Sociobot/Dodo is the merchant of
  record; refunds are handled there and revoke the license.” README: “Checkout
  uses the Sociobot billing API” and “The app never embeds a payment provider.”
- **Observed:** Two consecutive cold GETs to
  `https://api.sociobot.in/api/v1/products/speaker-lane-captions/checkout`
  returned HTTP 500 with `{"error":"Internal server error","status":500}` at
  04:42 UTC. The endpoint later recovered: `npm run test:live` and ten further
  requests returned the expected 303 Dodo redirect. This is an intermittent
  dead purchase link, not a reliable checkout.
- **Test gap:** `@claim:plus-license` asserts only the anchor `href`, a mocked
  license response, the fourth lane, and cache reuse. It never follows the buy
  link. “Secure hosted checkout” also has no entry in `claims.json`.
- **Why this blocks:** A first-time buyer can receive a server error at the only
  paid action. A later successful retry does not make the observed failure
  disappear.
- **Concrete fix:** Make checkout creation reliable and return a useful recovery
  page when the billing service is unavailable. Add a `hosted-checkout` claim
  whose test follows the live-safe checkout path and asserts a 303 to the
  approved hosted domain. Keep the live check in release monitoring and fail on
  intermittent 5xx responses, not only one successful request.

#### F-1-2 — The Android product's core live-caption path remains untested

- **Exact copy/location:** README: “Supported Chromium and Android versions need
  the on-device Web Speech API.” Landing page: “Place live captions by speaker
  direction.”
- **Observed:** Every speech claim test replaces `SpeechRecognition`,
  `mediaDevices`, and `AudioContext` with browser fixtures. The Android wrapper
  contains an empty `BridgeActivity` and no native speech bridge. The current
  worker has no Java runtime, so `./gradlew assembleDebug` cannot start. The
  earlier handoff also records APK and physical-device microphone testing as an
  external gap.
- **Why this blocks:** The product contract says artifact class `android`, and
  live speech is the real job-to-be-done. No evidence proves that the shipped
  Android WebView exposes the required local `SpeechRecognition.processLocally`
  path or that captions work on a device. This is an untested public claim.
- **Concrete fix:** Build the APK in CI with a pinned JDK/Android SDK and run an
  Android device or emulator test that starts local recognition, produces a
  caption, shows a directional lane, and stops the audio track. If WebView does
  not expose this API, add a local native speech bridge or narrow the Android
  claim before release. Add the device evidence and command to `claims.json`.

### Major

#### F-1-3 — Microphone lifecycle and consent claims are unlisted

- **Exact copy/locations:** “Caption Lanes uses your microphone only while this
  screen is open.” “Caption Lanes requests microphone access only after everyone
  agrees.” README: “Everyone must agree before the app requests microphone
  access.”
- **Why this matters:** These are privacy promises a user can rely on, but no
  `claims.json` entry names them. Existing tests enter through the consent form;
  they do not prove zero microphone calls before consent or cover every end and
  close path.
- **Concrete fix:** Add `consent-before-microphone` and `microphone-lifecycle`
  claims. Count microphone calls before and after consent, then assert tracks
  stop on Pause, End, navigation, and app background/close. Otherwise remove or
  narrow the copy.

#### F-1-4 — Account, analytics, archive, and identity promises are unlisted

- **Exact copy/locations:** “No accounts or cloud archive”; “No voiceprints or
  identity guesses”; “Caption Lanes does not identify people”; and “The app uses
  no account, analytics, or cloud archive.”
- **Why this matters:** `@claim:local-privacy` records requests only during the
  isolated demo. It does not establish these broader promises for real mode,
  licensed mode, or source behavior.
- **Concrete fix:** Add separately named claims with request-log coverage of
  demo, real typed mode, and licensed mode, plus source/storage assertions that
  no identity or voiceprint fields are produced. Remove any promise that cannot
  be tested.

#### F-1-5 — Mono-device and language-pack behavior is unlisted

- **Exact copy/locations:** README: “Mono devices show a limitation and keep the
  manual direction controls available.” Landing page: “The first start may ask
  Android to install a language pack.” README: “Live speech also needs a
  downloaded language pack.”
- **Why this matters:** The raw-audio fixture supplies a mono track but does not
  assert the limitation message or manual controls. No test covers Android's
  language-pack prompt or required pack.
- **Concrete fix:** Add a mono-input claim that asserts the visible warning and
  working manual placement. Add a device-level language-pack test, or rewrite
  the copy to the narrower behavior that can be verified.

#### F-1-6 — The free-feature boundary is only partly tested

- **Exact copy/locations:** “Core captions, export, privacy, and accessibility
  controls stay free.” The Plus dialog repeats: “Core captions, privacy controls,
  accessibility, and export stay free.” README: “Core captions, export, privacy,
  and accessibility controls remain free.”
- **Why this matters:** `@claim:plus-license` proves the price and fourth lane.
  It does not prove that each named core control remains usable without a
  license.
- **Concrete fix:** Extend a listed free-tier claim to exercise captions,
  import/export, display/accessibility controls, and privacy controls with no
  license present.

#### F-1-7 — License portability and reconnect behavior are unlisted

- **Exact copy/locations:** README: “A valid check is reused for one day and
  reconciled when the device reconnects.” “Users can paste a license on another
  device.”
- **Why this matters:** `@claim:plus-license` proves one-day reuse in one browser.
  It does not simulate offline-to-online reconciliation or a second device.
- **Concrete fix:** Add claim tests for reconnect verification and a fresh
  browser/device restoring the same valid token, or remove those parts of the
  README.

#### F-1-8 — The README's completeness statement is false

- **Exact copy/location:** README: “Every public product claim is listed in the
  claim inventory.”
- **Why this matters:** F-1-1 and F-1-3 through F-1-7 identify public claims with
  no matching inventory entry and observable test.
- **Concrete fix:** Inventory and test every claim above, then keep this sentence;
  otherwise replace it with “Tested product claims are listed in the claim
  inventory.”

#### F-1-9 — Route changes do not restore or move focus and are not announced

- **Exact location:** Landing → `/demo` → browser Back.
- **Observed:** Navigation uses full document loads rather than `pushState`. After
  Back, `document.activeElement` is `BODY`, not the restored page `<h1>`, and no
  route announcement is made. Direct links and Back do return the correct URL.
- **Why this matters:** Keyboard and screen-reader users are returned without a
  meaningful focus position, contrary to the route-change contract.
- **Concrete fix:** Use route-aware history handling, restore scroll deliberately,
  focus the new `<h1>` on route changes, and announce its title in a polite live
  region. Add forward/back keyboard tests.

#### F-1-10 — Header and footer structure changes between routes

- **Exact location:** `/` and `/demo` headers contain Demo and Privacy links;
  `/privacy/`, `/terms/`, and the 404 header contain only the wordmark. The
  privacy footer omits Privacy; the terms footer omits Terms; the 404 footer
  omits Demo.
- **Why this matters:** The required shared skeleton is not consistent, so route
  navigation changes depending on where a visitor lands.
- **Concrete fix:** Render the same wordmark, Demo, and Privacy navigation in
  every header and the same one-line description, Privacy, Terms, factory credit,
  and build id in every footer. A current-route link may use `aria-current` rather
  than disappear.

#### F-1-11 — Secondary routes do not carry the full metadata set

- **Exact location:** `/privacy/` and `/terms/` omit the 180 px apple-touch icon,
  `og:type`, `og:url`, and route-specific Twitter title/description/image.
  The designed 404 omits canonical, all Open Graph/Twitter data, and the
  apple-touch icon.
- **Why this matters:** The site-structure contract requires canonical, Open
  Graph, Twitter card, SVG favicon, and apple-touch metadata per route.
- **Concrete fix:** Add the complete route-specific metadata set to all three
  documents and test it from direct loads.

### Minor

#### F-1-12 — Three headings rely on metaphor or mood copy

- **Exact copy/locations:** “Follow the room in three steps”; Plus dialog “Make
  room for four”; 404 `<h1>` “This caption lane ends here.”
- **Why this matters:** These headings do not name their sections when heard out
  of context. The Plus and 404 headings are puns.
- **Concrete rewrite:** “How to use Caption Lanes”; “Add a fourth caption lane”;
  and “Page not found.”

#### F-1-13 — Several buttons do not name their result

- **Exact copy/locations:** Room buttons “Export” and “End”; license button
  “Restore”; footer button “Caption Lanes Plus”; lane-color toggle states
  “Locked” and “Unlocked.”
- **Why this matters:** The action or object must be inferred, especially in a
  screen-reader button list.
- **Concrete rewrite:** “Export transcript,” “End captions,” “Restore license,”
  “View Caption Lanes Plus,” and action labels “Unlock lane color” / “Lock lane
  color.”

#### F-1-14 — README terminology includes jargon and one inconsistent term

- **Exact copy/locations:** “local caption history” conflicts with the product's
  chosen term “transcript”; “storage namespace,” `processLocally mode`, and
  “reconciled” are unexplained implementation terms.
- **Why this matters:** A user should not need browser-storage or API vocabulary
  to understand privacy and requirements.
- **Concrete rewrite:** “saved transcript”; “The demo keeps temporary data in a
  separate store named `demo:caption-lanes`”; “Live speech starts only when the
  browser confirms recognition runs on the device”; and “The app checks the
  license again when the device reconnects.”

## 1. Cold first screen

Tested in fresh Chromium contexts at 390 × 844 and 1440 × 900 before scrolling.
There were no console errors or cross-origin requests.

- **What it does, in my words:** It puts live captions into left, centre, and
  right lanes so I can tell which direction speech came from.
- **Who it is for:** Deaf and hard-of-hearing people following small in-person
  conversations.
- **What I should click first:** **Try it with sample data**.

The exact first-screen copy supports all three answers: “Place live captions by
speaker direction”; “For Deaf and hard-of-hearing people who need to follow
small, in-person conversations”; and “Try it with sample data.” On mobile the
primary action ended at 525 px and the final price fact ended at 754 px, inside
the 844 px viewport. This check passes.

## 2. Copy audit

Counts use whitespace-delimited words; hyphenated terms, URLs, prices, and
version strings count as one word. No sentence exceeds 22 words. No banned
marketing word appears. Findings concern unlisted claims, metaphorical headings,
ambiguous actions, jargon, and inconsistent terminology.

### Landing-page sentences and meaningful prose

| Words | Exact copy | Result |
| ---: | --- | --- |
| 5 | Directional captions for small groups | Pass |
| 6 | Place live captions by speaker direction. | Pass |
| 12 | For Deaf and hard-of-hearing people who need to follow small, in-person conversations. | Pass |
| 7 | The demo opens a saved sample conversation. | Pass |
| 4 | No microphone is used. | Pass; covered by `local-privacy` |
| 6 | Private: Raw audio is never saved. | Pass; covered by `raw-audio-storage` |
| 9 | Offline: The installed app opens after one online visit. | Pass; covered by `offline-reload` |
| 5 | Price: Three lanes are free. | Pass; covered by `plus-license` |
| 5 | A fourth costs $24 once. | Pass; covered by `plus-license` |
| 3 | Ask everyone first. | Pass |
| 11 | Caption Lanes uses your microphone only while this screen is open. | **Flag F-1-3** |
| 6 | Raw audio is never saved. | Pass; covered by `raw-audio-storage` |
| 5 | On-device speech support is required. | **Flag F-1-2** |
| 5 | No accounts or cloud archive | **Flag F-1-4** |
| 5 | No voiceprints or identity guesses | **Flag F-1-4** |
| 5 | Coarse direction, with confidence shown | Pass; covered by `stereo-direction` |
| 6 | Everyone here agrees to live captions. | Pass as a consent label |
| 11 | The first start may ask Android to install a language pack. | **Flag F-1-5** |
| 13 | Direction depends on microphone layout; tap a direction whenever the estimate is uncertain. | Pass; covered by directional claims |
| 6 | Follow the room in three steps | **Flag F-1-12** |
| 9 | Caption Lanes requests microphone access only after everyone agrees. | **Flag F-1-3** |
| 5 | Set it near the middle. | Pass |
| 7 | Stereo microphones estimate left, centre, or right. | Pass; covered by `stereo-direction` |
| 8 | Tap a direction when the estimate is uncertain. | Pass; covered by `directional-lanes` |
| 7 | Export or import caption text in Settings. | Pass; covered by `transcript-portability` |
| 6 | Know what the app cannot do | Pass |
| 7 | Direction is coarse and can be wrong. | Pass; limitation stated plainly |
| 6 | Caption Lanes does not identify people. | **Flag F-1-4** |
| 9 | Do not use it for emergencies or official records. | Pass; safety limitation |
| 10 | Caption text stays in this browser until you clear it. | Pass; covered by `caption-persistence` |
| 9 | The app uses no account, analytics, or cloud archive. | **Flag F-1-4** |
| 7 | Typed captions remain available without microphone access. | Pass; covered by `local-speech` |
| 4 | Plus costs $24 once. | Pass; covered by `plus-license` |
| 5 | It adds an “Across” lane. | Pass; covered by `plus-license` |
| 9 | Core captions, export, privacy, and accessibility controls stay free. | **Flag F-1-6** |
| 4 | Typed-caption mode is active. | Pass |
| 8 | Choose a direction, then type each utterance below. | Pass |
| 8 | Tap when the phone cannot place a voice. | Pass |
| 5 | Number keys 1–4 also work. | Pass; covered by `directional-lanes` |
| 7 | Speech from your left will gather here. | Pass |
| 7 | Speech from ahead will gather here. | Pass |
| 7 | Speech from your right will gather here. | Pass |
| 9 | A fourth manually selected voice will gather here. | Pass |
| 6 | Hides results below 60% recognition confidence. | Pass; covered by `confidence-filter` |
| 8 | Caption Lanes Plus adds a fourth “Across” lane. | Pass; covered by `plus-license` |
| 9 | Core captions, privacy controls, accessibility, and export stay free. | **Flag F-1-6** |
| 3 | Secure hosted checkout. | **Flag F-1-1** |
| 14 | Sociobot/Dodo is the merchant of record; refunds are handled there and revoke the license. | **Flag F-1-1**; merchant/refund behavior is not inventoried |
| 3 | Have a license? | Pass |
| 3 | Paste it here. | Pass |
| 7 | Directional live captions for small, in-person groups. | Pass |
| 7 | Environmental artwork was generated for this product. | Pass; provenance exists in `design.md` |

### Landing-page headings, buttons, and labels

All were checked because headings must work out of context and buttons must name
their result. The flagged labels are “Follow the room in three steps,” “Make
room for four,” “Export,” “End,” “Restore,” “Caption Lanes Plus,” “Locked,” and
“Unlocked” (F-1-12 and F-1-13). The 404 heading is separately flagged in
F-1-12. These action labels pass: “Try it with sample data,” “Start real
captions,” “Start captions,” “Explore with typed captions,” “Pause,” “Add to
lane,” “Import transcript,” “Clear transcript,” “View Plus details,” “Buy
Caption Lanes Plus,” “Reset demo,” and the contract-required “Start for real.”

### README sentences

| Words | Exact copy | Result |
| ---: | --- | --- |
| 11 | Caption Lanes places live captions into left, centre, and right lanes. | Pass |
| 10 | It is for Deaf and hard-of-hearing people in small groups. | Pass |
| 18 | The free app provides three lanes, local caption history, typed input, confidence filtering, and transcript import and export. | **Flag F-1-14** |
| 11 | Caption Lanes Plus costs $24 once and adds a fourth lane. | Pass; covered by `plus-license` |
| 13 | Open https://speaker-lane-captions.sociobot.in/demo or select Try it with sample data on the landing page. | Pass |
| 9 | The demo opens a six-caption conversation without a microphone. | Pass; covered by demo claims |
| 13 | It uses the demo:caption-lanes storage namespace and never reads real captions or settings. | **Flag F-1-14**; isolation is tested |
| 7 | Use Reset demo to restore the sample. | Pass |
| 13 | Use Start for real to clear the demo namespace and return to setup. | Pass |
| 10 | See the demo contract for the sample and storage details. | Pass |
| 9 | Everyone must agree before the app requests microphone access. | **Flag F-1-3** |
| 6 | Speech requires the browser’s processLocally mode. | **Flag F-1-14** |
| 10 | The app refuses speech tools that cannot confirm local processing. | Pass; covered by `local-speech` |
| 6 | Caption Lanes never retains raw audio. | Pass; covered by `raw-audio-storage` |
| 13 | Caption text and settings remain in the browser until the user clears them. | Pass; covered by `caption-persistence` |
| 5 | Direction is coarse, never identity. | **Flag F-1-4** |
| 8 | Stereo input can estimate left, centre, or right. | Pass; covered by `stereo-direction` |
| 12 | Mono devices show a limitation and keep the manual direction controls available. | **Flag F-1-5** |
| 9 | Number keys 1–4 select a direction outside text fields. | Pass; covered by `directional-lanes` |
| 6 | Captions and direction can be wrong. | Pass; safety limitation |
| 14 | Do not use this app for emergencies, medical decisions, legal records, or forensic work. | Pass; safety limitation |
| 11 | Supported Chromium and Android versions need the on-device Web Speech API. | **Flag F-1-2** |
| 8 | Live speech also needs a downloaded language pack. | **Flag F-1-5** |
| 5 | Use Node.js 20 or newer. | Pass |
| 8 | The production build command is npm run build. | Pass; verified |
| 7 | It writes the static site to dist/. | Pass; verified |
| 5 | Playwright is pinned to 1.58.2. | Pass; verified in `package.json` |
| 12 | Tests cover desktop Chromium and an exact 390 × 844 mobile viewport. | Pass; verified in config and run |
| 10 | Every public product claim is listed in the claim inventory. | **Flag F-1-8** |
| 9 | Each entry includes its exact browser command and sandbox. | Pass |
| 6 | Azure Static Web Apps reads dist/staticwebapp.config.json. | Pass |
| 7 | The factory owns DNS and infrastructure settings. | Pass |
| 6 | The Capacitor wrapper is in android/. | Pass |
| 5 | Its app ID is in.sociobot.speakerlanecaptions. | Pass |
| 13 | Build a debug APK on a worker with the Android SDK and JDK. | Pass as an instruction; execution blocked by missing Java |
| 11 | Release signing and distribution belong to a later Android work order. | Pass |
| 8 | No keystore or secret belongs in this repository. | Pass |
| 6 | Checkout uses the Sociobot billing API. | **Flag F-1-1** |
| 7 | The app never embeds a payment provider. | **Flag F-1-1**; not inventoried |
| 5 | The returned license uses sb_license:speaker-lane-captions. | Pass |
| 14 | A valid check is reused for one day and reconciled when the device reconnects. | **Flag F-1-7 and F-1-14** |
| 8 | Users can paste a license on another device. | **Flag F-1-7** |
| 9 | Core captions, export, privacy, and accessibility controls remain free. | **Flag F-1-6** |
| 6 | Caption Lanes uses the MIT license. | Pass; verified |
| 10 | The original generated artwork and its provenance are in assets/src/. | Pass; verified |

README headings are literal and understandable out of context. No README
sentence exceeds 18 words. Documentation-link labels and raw command blocks are
not sentences and are therefore not counted as prose.

For completeness, the non-sentence README headings and command introductions
are: “Caption Lanes” (2), “Try the isolated demo” (4), “Privacy and capability
boundaries” (4), “Develop and verify” (3), “Useful focused commands” (3),
“Deploy the static site” (4), “Build and verify before deployment” (5), “Android
project” (2), “Refresh native web assets” (4), “Paid license” (2), and “Project
documentation” (2). Each names its section or command result plainly.

## 3. Demo and sandbox

**Result: PASS.** From the landing page, one click opened `/demo` directly into
the active `Conversation` screen with six realistic lunch-planning captions in
Left, Centre, and Right lanes. The persistent banner said “Demo — sample data,
nothing is saved” and exposed Reset demo and Start for real.

Manual live verification seeded a real transcript and preferences first. Demo
mode did not display them, used `demo:caption-lanes` and
`demo:caption-lanes:preferences`, made zero microphone calls, and requested only
the product origin. Reset removed a temporary seventh caption and restored six.
Start for real removed the demo database and localStorage key while preserving
the real database and preferences. `@claim:demo-isolation` passed in both
browser projects.

## 4. Claims

Every command from `.factory/claims.json` was run exactly. Each command executed
once in desktop Chromium and once at 390 × 844.

| Claim id | Exact command suffix | Result |
| --- | --- | --- |
| `demo-isolation` | `--grep @claim:demo-isolation` | PASS — 2/2 |
| `directional-lanes` | `--grep @claim:directional-lanes` | PASS — 2/2 |
| `stereo-direction` | `--grep @claim:stereo-direction` | PASS — 2/2 |
| `local-privacy` | `--grep @claim:local-privacy` | PASS — 2/2 |
| `raw-audio-storage` | `--grep @claim:raw-audio-storage` | PASS — 2/2 |
| `offline-reload` | `--grep @claim:offline-reload` | PASS — 2/2 |
| `caption-persistence` | `--grep @claim:caption-persistence` | PASS — 2/2 |
| `transcript-portability` | `--grep @claim:transcript-portability` | PASS — 2/2 |
| `typed-limit` | `--grep @claim:typed-limit` | PASS — 2/2 |
| `confidence-filter` | `--grep @claim:confidence-filter` | PASS — 2/2 |
| `local-speech` | `--grep @claim:local-speech` | PASS — 2/2 |
| `plus-license` | `--grep @claim:plus-license` | PASS — 2/2, but see F-1-1 |

There is no failing listed claim command. F-1-1 through F-1-8 identify an
inadequate test and unlisted or untested claim-like copy, so the claims gate is
not complete.

## 5. Offline and privacy request evidence

- The listed offline test passed in its own fresh browser context at both project
  sizes and reopened the exact `/demo` URL with the sample visible.
- The live demo request log contained only
  `https://speaker-lane-captions.sociobot.in` and recorded zero microphone calls.
- Seeded real and demo IndexedDB/localStorage namespaces stayed separate through
  add, reset, and exit.
- The live landing request log contained only same-origin HTML, JS, CSS, and
  responsive artwork.

## 6. History

No earlier `.factory/review-*.md` or `.factory/polish-*.md` exists. The previous
`.factory/handoff.md` was read in full.

The handoff's repaired demo, first-screen copy, claim inventory, direct `/demo`,
designed 404, metadata on the main app, keyboard-focusable lane regions, copy
length, and removed accessory promise were confirmed live and in code. Its test,
build, offline, axe, and artifact-identity results were reproduced. The handoff's
checkout pass regressed transiently as F-1-1. Its stated Android APK/device gap
remains open as F-1-2. The human four-person attribution study remains an honest
external validation gap; the product does not publish the 80% success target as
an achieved result.

## 7. Structure, links, identity, and accessibility

- **Pass:** Correct route titles, `lang=en`, one `<h1>`, `<main>`, meta
  descriptions, landing/demo canonicals, main social image, SVG/ICO favicons,
  HTTP 404 with a designed page, deep-link loads, valid hash targets, responsive
  layout, visible focus, reduced-motion test, and no console errors.
- **Pass:** The cinematic table, dark pine palette, colored speech lanes, serif
  caption voice, and environmental-light composition are recognizably specific
  to this product. It is not a generic centered SaaS hero or three-card template.
- **Pass:** `/opt/fleet/lib/verify-url.sh` reported a 864 ms load, one h1, title,
  `lang`, main, no missing alt, no unlabeled buttons, and no console errors.
- **Pass:** `@axe-core/cli` reported zero violations on `/`, `/demo`, `/privacy/`,
  and `/terms/`. Automated results do not replace manual focus findings.
- **Fail:** Checkout returned 500 twice (F-1-1). Every other crawled HTTP link
  returned 200; the checkout later returned its expected 303.
- **Fail:** Route focus/announcement, consistent chrome, and complete secondary
  metadata fail F-1-9 through F-1-11.

## 8. Missed leverage

No additional AI feature is justified. Caption placement and speech recognition
are latency-sensitive accessibility functions, and an optional cloud model
would weaken the stated local privacy boundary. Import/export already covers the
obvious portability need. A sync feature would create account and privacy costs
that the brief explicitly avoids. The missing leverage is reliable Android
speech support and verification, already captured in F-1-2, not decorative AI.

## 9. Verification record

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 255 packages, 0 vulnerabilities |
| Twelve exact claim commands | PASS — 24/24 project runs |
| `npm test` | PASS — 5 unit and 54 browser tests |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS — `dist/` produced; JS 18.24 kB raw / 6.83 kB gzip |
| `npm run test:live` | PASS on its single checkout attempt and artifact comparison |
| `verify-url.sh` | PASS |
| `@axe-core/cli` on four live routes | PASS — 0 violations |
| Live mobile/desktop cold read | PASS |
| Live demo reset/isolation/request log | PASS |
| Link crawl | FAIL — checkout returned HTTP 500 twice, later 303 |
| `./gradlew assembleDebug` | NOT RUN — `java` is unavailable |

## What would make this perfect

Resolve every finding above, then rerun the entire review from a fresh checkout
and fresh browser contexts. Per the owner's standard, perfection means a stable
end-to-end checkout, device evidence for the Android live-caption job, every
public claim inventoried and observably tested, literal copy and result-naming
actions, complete metadata, consistent route chrome, and tested focus/history
behavior—with zero remaining minor findings.
