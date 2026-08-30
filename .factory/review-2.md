# Adversarial first-read review 2 — Caption Lanes

**Verdict: FAIL**

Reviewed 2026-08-30 UTC at commit `3e6f802203fd7ebf289abc6525037a13ded0e129`
and at <https://speaker-lane-captions.sociobot.in/>. A pass requires zero
findings. This round has five findings, including three blocking findings.

## Findings

### Blocking

#### F-2-1 — A paid user's real license state leaks into the demo

- **Exact location:** Open the live home page with a valid cached Plus license,
  then select “Try it with sample data.” The demo banner says “Demo — sample
  data, nothing is saved,” but the room contains Left, Centre, Right, and the
  paid Across lane. “Reset demo” still leaves all four lanes.
- **Observed:** A fresh browser context with a recorded valid real license
  showed four lanes after the one-click in-page transition to `/demo`. A direct
  cold `/demo` load showed the documented three. In `src/main.ts`, `plus` is set
  from real license storage, but the demo branch of `applyRoute()` and the Reset
  handler never set `plus = false`. Evidence:
  `.factory/evidence/review-2/demo-license-leak-desktop.png`.
- **Why this blocks:** Demo mode is not deterministic or isolated from real user
  state. It exposes a real entitlement inside the sandbox and contradicts
  `.factory/demo.md`, which says the demo never reads a stored purchase license.
  The listed `demo-isolation` test seeds captions and preferences, but not a
  license, so it misses this path.
- **Concrete fix:** Set `plus = false` and `activeLane = 'center'` whenever demo
  mode starts or resets. Extend `@claim:demo-isolation` to seed a valid real
  license, enter through the landing action, assert exactly three demo lanes
  before and after Reset, then confirm Start for real preserves and restores the
  real entitlement.

#### F-2-2 — The Android live-caption job is still unverified (reopens F-1-2)

- **Exact quote/location:** `.factory/brief.json` requires an “Android app for
  tabletop conversations.” The live headline says “Place live captions by
  speaker direction.” README says, “This work order prepares the Android project
  but does not publish an APK. A later Android work order must verify typed and
  microphone captions on a device.”
- **Observed:** `MainActivity.java` is only an empty Capacitor `BridgeActivity`.
  No native speech bridge or Android device test exists. All speech tests replace
  `SpeechRecognition`, media devices, and audio analysis with browser fixtures.
  `npm run cap:sync` and `npx cap doctor android` pass, but this container has no
  Java runtime, so no APK or device test can run. The current handoff records the
  same open gap.
- **Why this blocks:** The declared artifact is Android and live captions are the
  core job, not an optional edge. Removing the earlier Android compatibility
  sentence avoids an unsupported claim but does not complete or verify the
  required product.
- **Concrete fix:** Build a signed-equivalent debug APK in a pinned Android
  toolchain and add an emulator or physical-device test that starts local speech,
  renders a caption in a directional lane, handles permission denial, stops the
  microphone on every exit path, survives offline restart, and verifies Android
  Back behavior. If WebView lacks local speech support, add a local native speech
  bridge before release.

#### F-2-3 — Refund behavior remains an unlisted and partly untested public claim (reopens F-1-8)

- **Exact quote/location:** Plus dialog: “Sociobot/Dodo handles checkout and
  refunds.” README: “Every public product claim is listed in the claim
  inventory.” The `revoked-license` inventory entry separately says, “A revoked
  or refunded license stops Caption Lanes Plus features.”
- **Observed:** `hosted-checkout` proves a 303 redirect to Dodo and absence of
  card fields. It does not test refund handling. `revoked-license` supplies only
  `{ reason: "revoked" }`; it never exercises a refunded verdict. No inventory
  entry states or tests who handles refunds. The exact commands pass, but their
  assertions do not cover this wording.
- **Why this blocks:** Payment and refund wording is information a buyer relies
  on. The claim inventory is therefore not exhaustive, and one listed two-part
  claim is only half tested.
- **Concrete fix:** Remove the unprovable handler statement from the dialog, for
  example: “Sociobot/Dodo hosts checkout.” Separately extend
  `@claim:revoked-license` with a `reason: "refunded"` fixture and assert that the
  fourth lane closes. Keep the README completeness sentence only after a
  copy-to-inventory coverage check passes.

### Minor

#### F-2-4 — README uses an implementation term for a user action

- **Exact quote/location:** README, demo section: “Use **Start for real** to
  clear the demo namespace and return to setup.”
- **Why this matters:** “Namespace” is storage jargon and does not tell a user
  what is deleted. It is the same class of copy issue repaired after review 1.
- **Concrete rewrite:** “Use **Start for real** to delete the sample changes and
  return to setup.”

#### F-2-5 — The phone header hides Privacy

- **Exact location:** At 390 px on `/`, `/demo`, `/privacy/`, `/terms/`, and the
  404 page, only the Demo navigation link is visible. The stylesheet hides
  `.header-nav a:last-child`, which is Privacy.
- **Why this matters:** The required shared header calls for a visible Privacy
  route. A phone visitor must scroll to the footer to find it, even though the
  wrapped header has room beside Demo.
- **Concrete fix:** Keep both Demo and Privacy visible at 390 px and add a mobile
  assertion for both header links on every route.

## 1. Cold first screen

Fresh Chromium contexts were opened at 390 × 844 and 1440 × 900 before
scrolling. Both returned 200, made only same-origin requests, and logged no
console or page errors.

- **What it does:** It places live captions into separate lanes based on whether
  speech comes from the left, centre, or right.
- **Who it is for:** Deaf and hard-of-hearing people following small in-person
  conversations.
- **What to click first:** **Try it with sample data**.

The exact supporting text is “Place live captions by speaker direction,” “For
Deaf and hard-of-hearing people who need to follow small, in-person
conversations,” and “Try it with sample data.” At 390 px, the action ends at 585
px and the final price fact ends at 816 px, inside the 844 px viewport. Evidence:
`.factory/evidence/review-2/cold-mobile.png` and `cold-desktop.png`. This check
passes.

## 2. Copy audit

Counts exclude punctuation-only separators and treat hyphenated terms, URLs,
prices, and version strings as one word. No sentence exceeds 22 words. No banned
marketing adjective appears. F-2-3 and F-2-4 are the only copy flags.

### Landing page, product room, and dialogs

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
| 6 | Raw audio is never saved. | Pass |
| 5 | On-device speech support is required. | Pass |
| 6 | Everyone here agrees to live captions. | Pass |
| 10 | A supported browser may ask to install its on-device language pack. | Pass |
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
| 10 | Typed captions, display controls, confidence filtering, and transcript export stay free. | Pass |
| 8 | Tap when the phone cannot place a voice. | Pass |
| 5 | Number keys 1–4 also work. | Pass |
| 7 | Speech from your left will gather here. | Pass |
| 6 | Speech from ahead will gather here. | Pass |
| 7 | Speech from your right will gather here. | Pass |
| 8 | A fourth manually selected voice will gather here. | Pass |
| 6 | Hides results below 60% recognition confidence. | Pass |
| 8 | Caption Lanes Plus adds a fourth “Across” lane. | Pass |
| 10 | Typed captions, display controls, confidence filtering, and transcript export stay free. | Pass |
| 5 | Sociobot/Dodo handles checkout and refunds. | **Flag F-2-3** |
| 10 | If checkout is unavailable, keep this dialog open and try again. | Pass |
| 3 | Have a license? | Pass |
| 3 | Paste it here. | Pass |
| 7 | Directional live captions for small, in-person groups. | Pass |
| 7 | Environmental artwork was generated for this product. | Pass |

The demo adds six sample sentences: “Should we move the chairs closer?” (6),
“This distance works well for me.” (6), “I can turn down the music too.” (7),
“Yes, then let’s plan Saturday lunch.” (6), “Noon works. I will book the table.”
(7), and “Please choose somewhere quiet.” (4). Each is concrete sample data.

### Landing headings, labels, and actions

| Words | Exact copy | Result |
| ---: | --- | --- |
| 5 | Directional captions for small groups | Pass |
| 2 | Before listening | Pass |
| 5 | No accounts or cloud archive | Pass |
| 5 | No voiceprints or identity guesses | Pass |
| 5 | Coarse direction, with confidence shown | Pass |
| 3 | How it works | Pass |
| 5 | How to use Caption Lanes | Pass |
| 3 | Ask the group | Pass |
| 3 | Place the phone | Pass |
| 3 | Read separate lanes | Pass |
| 3 | Privacy and limits | Pass |
| 6 | Know what the app cannot do | Pass |
| 3 | Caption Lanes Plus | Pass |
| 4 | Add a fourth lane | Pass |
| 1 | Conversation | Pass |
| 2 | Speaker direction | Pass |
| 2 | Your view | Pass |
| 2 | Caption settings | Pass |
| 2 | Lane appearance | Pass |
| 2 | One-time purchase | Pass |
| 5 | Add a fourth caption lane | Pass |
| 5 | Try it with sample data | Pass |
| 3 | Start real captions | Pass |
| 2 | Start captions | Pass |
| 4 | Explore with typed captions | Pass |
| 2 | Reset demo | Pass |
| 3 | Start for real | Pass |
| 1 | Pause / Resume | Pass |
| 2 | Export transcript | Pass |
| 2 | End captions | Pass |
| 3 | Add to lane | Pass |
| 2 | Import transcript | Pass |
| 2 | Clear transcript | Pass |
| 3 | Unlock lane color / Lock lane color | Pass |
| 3 | View Plus details | Pass |
| 4 | View Caption Lanes Plus | Pass |
| 4 | Buy Caption Lanes Plus | Pass |
| 2 | Restore license | Pass |

The headings name their sections. Buttons name the action or result. Direction
buttons are state selectors and include direction, arrow, pressed state, and
keyboard shortcut in their accessible names.

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
| 13 | Use **Start for real** to clear the demo namespace and return to setup. | **Flag F-2-4** |
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
| 11 | Tests cover desktop Chromium and an exact 390 × 844 mobile viewport. | Pass |
| 10 | Every public product claim is listed in the claim inventory. | **Flag F-2-3** |
| 9 | Each entry includes its exact browser command and sandbox. | Pass |
| 6 | Azure Static Web Apps reads dist/staticwebapp.config.json. | Pass |
| 7 | The factory owns DNS and infrastructure settings. | Pass |
| 6 | The Capacitor wrapper is in `android/`. | Pass in developer context |
| 5 | Its app ID is `in.sociobot.speakerlanecaptions`. | Pass in developer context |
| 13 | This work order prepares the Android project but does not publish an APK. | Evidence for F-2-2 |
| 14 | A later Android work order must verify typed and microphone captions on a device. | Evidence for F-2-2 |
| 11 | Release signing and distribution belong to a later Android work order. | Pass |
| 8 | No keystore or secret belongs in this repository. | Pass |
| 8 | The buy link opens checkout hosted by Sociobot/Dodo. | Pass |
| 7 | The app does not collect card details. | Pass |
| 6 | The returned license uses `sb_license:speaker-lane-captions`. | Pass in developer context |
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
(13), “Paid license” (2), and “Project documentation” (2).

Terminology is otherwise consistent: lane, direction, transcript, typed caption,
confidence, Caption Lanes Plus, demo, and real captions. The catalog description
is 10 words, starts with a verb, and stays below 120 characters.

## 3. Demo and sandbox

The normal unlicensed path passes. One click opens `/demo` with a `Conversation`
heading, three direction lanes, six realistic lunch-planning captions, the
persistent demo banner, Reset demo, and Start for real. Reset restores six rows.
The request log stays on the product origin and records no microphone access.
Seeded real caption and preference records remain unchanged after add, reset,
and exit; demo IndexedDB and localStorage are removed on exit.

The valid-license path fails isolation as F-2-1: the fourth paid lane crosses
into the demo and survives Reset. The listed test does not cover this state.

## 4. Claims

Every exact `test` command from `.factory/claims.json` ran from the clean clone.
Each command ran in desktop Chromium and the exact 390 × 844 project.

| Claim | Result |
| --- | --- |
| `demo-isolation` | PASS 2/2, but incomplete; see F-2-1 |
| `directional-lanes` | PASS 2/2 |
| `stereo-direction` | PASS 2/2 |
| `local-privacy` | PASS 2/2 |
| `raw-audio-storage` | PASS 2/2 |
| `offline-reload` | PASS 2/2 |
| `caption-persistence` | PASS 2/2 |
| `transcript-portability` | PASS 2/2 |
| `typed-limit` | PASS 2/2 |
| `confidence-filter` | PASS 2/2 |
| `local-speech` | PASS 2/2; browser fixtures only, see F-2-2 |
| `plus-license` | PASS 2/2 |
| `consent-before-microphone` | PASS 2/2 |
| `microphone-lifecycle` | PASS 2/2 |
| `no-accounts-analytics-archive` | PASS 2/2 |
| `no-identity-inference` | PASS 2/2 |
| `mono-input` | PASS 2/2 |
| `language-pack-flow` | PASS 2/2 |
| `free-core-controls` | PASS 2/2 |
| `license-portability` | PASS 2/2 |
| `license-reconnect` | PASS 2/2 |
| `hosted-checkout` | PASS 2/2; ten 303 checks to `checkout.dodopayments.com` |
| `revoked-license` | PASS 2/2 for revoked only; refunded is untested, see F-2-3 |

No exact command returned a failure. The semantic coverage gaps in F-2-1 and
F-2-3 still leave claims untested, so the claims gate does not pass.

## 5. Privacy and offline behavior

- The dedicated offline claim opened the installed `/demo` URL in its own
  context after the context went offline.
- The live demo request log contained only
  `https://speaker-lane-captions.sociobot.in`; no microphone call occurred.
- Demo caption/preferences storage remained separate and was deleted on exit.
  Real caption/preferences storage was byte-for-byte unchanged.
- A paid entitlement can still influence the sandbox UI through in-memory
  state, which is the blocking exception in F-2-1.
- No analytics, third-party font, or third-party script request appeared.

## 6. Earlier finding verification

All earlier `.factory/review-*.md`, `.factory/polish-*.md`, and the current
handoff were read. Review 1 is the only earlier adversarial review.

| Earlier finding | Current result |
| --- | --- |
| F-1-1 checkout reliability/test | Fixed: hosted-checkout claim passed ten configured requests, `npm run test:live` passed ten more, and the crawl received 303. |
| F-1-2 Android live-caption path | **Not fixed: reopened as F-2-2.** The public claim was narrowed, but the Android job remains unbuilt and unverified. |
| F-1-3 consent/lifecycle inventory | Fixed: both dedicated claims pass. |
| F-1-4 accounts/analytics/archive/identity inventory | Fixed: both dedicated claims pass. |
| F-1-5 mono input/language pack | Fixed: both dedicated claims pass. |
| F-1-6 free-feature boundary | Fixed: the unlicensed control flow passes. |
| F-1-7 portability/reconnect | Fixed: fresh-context restore and reconnect checks pass. |
| F-1-8 inventory completeness | **Regressed: reopened as F-2-3.** Refund handling is public but not inventoried or tested. |
| F-1-9 route focus/announcement | Fixed live: Demo, Back, and Forward focus the correct h1 and update the polite announcement. |
| F-1-10 route chrome | Fixed across routes at desktop; F-2-5 records the separate mobile visibility defect. |
| F-1-11 route metadata | Fixed on Privacy, Terms, and the designed 404. |
| F-1-12 metaphor headings | Fixed with literal section names. |
| F-1-13 ambiguous actions | Fixed with result-naming actions. |
| F-1-14 README jargon/terms | The cited phrases were changed; F-2-4 records the remaining “demo namespace” wording. |

## 7. Structure, links, identity, and accessibility

- `/`, `/demo`, `/privacy/`, `/terms/`, and an unknown route have the expected
  route-specific title, one visible h1, `lang=en`, main landmark, description,
  canonical, Open Graph/Twitter image data, SVG/ICO favicon, and apple-touch
  icon. The unknown route returns HTTP 404 with the designed page.
- Demo/Back/Forward restore the correct URL and focus `room-title` or
  `page-title`; the polite live region announces each route.
- Every internal link returned 200 except the deliberately unknown 404 URL.
  Mail links were exempt. The buy URL returned 303 to the approved Dodo host.
- Live axe scans found no violations on all five checked routes at desktop and
  390 px. The worker URL verifier found one h1, `lang`, main, alt text, labeled
  buttons, and no console errors on the home page. The only logged 404 error was
  the intentional missing-document request.
- Touch-target, keyboard, dialog-focus, 320 px reflow, and reduced-motion tests
  pass. Caption text and controls meet the automated contrast checks in the
  product's intentional single dark theme.
- The dark cinematic table, three light colors, serif caption voice, lane
  geometry, and custom artwork are product-specific and match
  `.factory/design.md`; the site is not a generic SaaS template.
- F-2-5 is the remaining structure defect.

## 8. Missed leverage

No AI feature is justified. Sending a live accessibility conversation to a
model would conflict with the local-processing boundary, while typed captions
provide the non-AI fallback. JSON import/export already covers the obvious
portability need, and account-based sync would contradict the brief's local,
no-account direction. The missing leverage is verified Android speech support,
already covered by F-2-2.

## 9. Verification record

| Check | Result |
| --- | --- |
| Clean clone at `3e6f802` + `npm ci` | PASS — 255 packages, 0 vulnerabilities |
| 23 exact claim commands | PASS — 46/46 configured browser runs, with coverage gaps noted above |
| `npm test` | PASS — 5 unit and 84 Playwright tests |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS — `dist/`; JS 20.42 kB raw / 7.43 kB gzip |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities |
| `npm run test:live` | PASS — checkout, favicon, headers, 404, and artifact identity |
| `/opt/fleet/lib/verify-url.sh` | PASS — 752 ms, no home-page console errors |
| Live Playwright axe on five routes at two sizes | PASS — zero violations |
| Link crawl | PASS, excluding the intentional unknown-route 404 and mail links |
| `npm run cap:sync`; `npx cap doctor android` | PASS |
| Android APK/device test | NOT RUN — Java is unavailable and no device suite exists; F-2-2 |

## What would make this perfect

Remove real license state from demo mode and test that transition, complete and
verify the Android live-caption path, make every payment/refund sentence match an
observable claim test, replace “demo namespace,” and keep Privacy visible in the
390 px header. Then rerun this entire checklist from fresh browser contexts and
a clean clone. Zero findings means there is actually nothing left to do.
