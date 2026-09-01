# Independent verification 9 — FAIL

Date: 2026-09-01 UTC

Work order: `speaker-lane-captions-verify-9`

Candidate commit: `505b9c6ca44146db4946ab52c92a36a4323749e7`

Live URL: <https://speaker-lane-captions.sociobot.in/>

## Verdict

**FAIL.** The candidate is not releasable under the supplied acceptance
contract.

Two release blockers were confirmed:

1. One exact command in the required 24-item claims inventory fails in this
   clean verification worker. The contract states that any failing claim test
   blocks release.
2. The Android artifact's native live-caption path does not calculate speaker
   direction. It asks the user to place every caption manually, so it does not
   perform the brief's core Android job of supplying coarse left/centre/right
   direction from the phone microphones.

The deployed web artifact otherwise passed the tested demo, privacy,
accessibility, offline, performance, and response-policy checks. The live files
match the candidate's production build. No product source was changed during
verification.

## Required entry checks

### Claims gate — FAIL

`.factory/claims.json` exists and contains 24 entries. After `npm ci`, every
listed `test` command was executed separately from the clean candidate. Results:

- **23/24 claim commands passed.** Each web claim ran in the configured desktop
  and 390 px Chromium projects, for 46 passing browser runs.
- **1/24 failed:** `android-native-caption-path` runs `npm run test:android`.
  Its web build and Capacitor sync succeeded, then Gradle stopped with:
  `JAVA_HOME is set to an invalid directory:
  /usr/lib/jvm/java-21-openjdk-amd64`.
- Fresh environment confirmation found no `java` executable, no
  `/usr/lib/jvm`, and no `/opt/android-sdk`. No debug or Android-test APK was
  produced.

Passing claim IDs:

`demo-isolation`, `directional-lanes`, `stereo-direction`, `local-privacy`,
`raw-audio-storage`, `offline-reload`, `caption-persistence`,
`transcript-portability`, `typed-limit`, `confidence-filter`, `local-speech`,
`plus-license`, `consent-before-microphone`, `microphone-lifecycle`,
`no-accounts-analytics-archive`, `no-identity-inference`, `mono-input`,
`language-pack-flow`, `free-core-controls`, `license-portability`,
`license-reconnect`, `hosted-checkout`, and `revoked-license`.

The exact-test failure is release-blocking even though it is caused by missing
worker prerequisites. A separate `npx cap doctor android` check passed, but it
does not build either APK and cannot replace the listed claim command.

### Cold first read — PASS

A fresh live browser context at 1440 × 900 and another at 390 × 844 answered
all three required questions inside the first viewport:

- What it does: **“Place live captions by speaker direction.”**
- Who it is for: **“For Deaf and hard-of-hearing people who need to follow
  small, in-person conversations.”**
- What to do first: **“Try it with sample data.”** The adjacent note says the
  demo opens a saved sample and uses no microphone.

The action opened `/demo` in one click with 3 directional lanes, 6 realistic
captions, and the persistent “Demo — sample data, nothing is saved” banner.
The three privacy/offline/price facts were also inside the 390 × 844 first
viewport. Evidence:
`.factory/evidence/verification-9/first-read-desktop-1440x900.png` and
`.factory/evidence/verification-9/first-read-mobile-390x844.png`.

## Android contract finding

The researched brief requires the Android app to provide coarse
left/centre/right direction from the phone microphone array. The candidate's
native path does not do that:

- `src/main.ts:288-293` checks `speech.usesNativeBridge()`. When true, it tells
  the user to choose a direction manually; `startDirectionAudio()` is called
  only by the browser path.
- `src/speech.ts:33-38` defines native events containing caption text and
  confidence only. There is no direction event.
- `android/app/src/main/java/in/sociobot/speakerlanecaptions/NativeCaptionPlugin.java:139-146`
  emits only text and confidence.
- `NativeCaptionBridgeTest.java:23-32` only confirms that the availability
  bridge returns an object. It does not confirm live captions or direction.

The browser stereo fixture proves direction logic in a web path, but it does
not exercise the Android artifact path that deliberately skips that logic.
Manual number-key/button placement remains available; that is a useful
fallback, not the automatic directional product described in the brief.

## Clean checkout and build evidence

| Check | Result |
| --- | --- |
| Candidate identity | PASS — clean start at `505b9c6ca44146db4946ab52c92a36a4323749e7`. |
| `npm ci` | PASS — 255 packages installed; 0 vulnerabilities. |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities. |
| `npm test` | PASS — 5/5 Vitest tests and 84/84 Playwright tests. |
| `npm run lint` | PASS. |
| `npm run typecheck` | PASS. |
| `npm run build` | PASS — produced `dist/`. |
| `npm run test:live` | PASS — every deployable file hash matches live; direct routes, checkout redirects, favicon, CSP, and 404 passed. |
| `npm run test:android` | **FAIL** — required JDK path is absent; no Java or Android SDK is installed. |
| `npx cap doctor android` | PASS — Capacitor project structure is valid. |

The production bundle is within budget: initial JavaScript is 29,368 bytes raw
(10.61 kB gzip), CSS is 17,502 bytes raw (4.74 kB gzip), there is no font
payload, and the 720 px hero image is 8,074 bytes.

## Independent end-to-end exercise

On live desktop and 390 px mobile:

- A representative caption was placed in the Left lane and exported. The JSON
  contained 7 rows and identified Caption Lanes as its product.
- IndexedDB rows contained only `id`, `lane`, `text`, `confidence`,
  `createdAt`, and `source`; no raw-audio or identity field was present.
- Blank input left the 6-row sample unchanged. A 241-character input was
  limited to 240 characters and added one row. Reset restored exactly 6 rows.
- Invalid JSON import showed “That file is not a Caption Lanes transcript” and
  preserved all 6 existing rows.
- Settings opened by keyboard, Escape closed it, and focus returned to the
  invoking button on both viewports.
- No horizontal overflow occurred. A 720 CSS px check, equivalent to a 200%
  zoomed 1440 px layout, retained the headline, sample action, all 3 lanes, and
  typed input without horizontal overflow.

The full local suite additionally passed the recorded consent, mono/stereo
limits, 0.59/0.60 confidence boundary, language-pack ordering, microphone stop
paths, persistence, license restore/revocation, and demo/real storage-isolation
cases.

## Accessibility and visual checks

- `/opt/fleet/lib/verify-url.sh` passed the live root in 741 ms: title,
  `lang="en"`, exactly one `h1`, `main`, image alt text, labelled buttons, and
  zero console errors. Evidence:
  `.factory/evidence/verification-9/verify-url/verify.json`.
- Independent axe-core scans of `/` and `/demo` at desktop and 390 px, plus
  `/privacy/`, `/terms/`, and `/404.html` at 390 px, found **0 serious or
  critical findings**.
- First Tab focused “Skip to captions” with a 3 px amber outline; Enter moved
  focus to `main`. All 19 visible demo controls checked at 390 px were at least
  44 × 44 CSS px.
- Reduced-motion mode changed sample-caption animation duration to `0.00001s`.
- Visual review found no clipping or overlap in fresh desktop and mobile demo
  viewports. Evidence:
  `.factory/evidence/verification-9/demo-desktop-fresh-viewport.png` and
  `.factory/evidence/verification-9/demo-mobile-fresh-viewport.png`.

## Privacy, network, response, and PWA checks

- The live root-to-demo flow, caption entry, and export contacted only
  `https://speaker-lane-captions.sociobot.in`; the microphone sentinel recorded
  0 calls in demo mode. There were no console errors, page errors, or failed
  requests.
- No third-party runtime script, font, account, analytics, or archive endpoint
  was found. The only product cross-origin path is the documented Sociobot
  checkout/license API.
- HTTP redirects to HTTPS. HTML sends HSTS, `nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`,
  a restrictive CSP, and a microphone-only Permissions-Policy.
- HTML revalidates after 30 seconds. Hashed JS/CSS use one-year immutable
  caching. `sw.js` is `no-cache` and its SHA-256 matches the candidate build.
- The service worker controlled `/demo`, `registration.update()` completed,
  the active cache was `caption-lanes-b6a445142a2a`, and an offline reload
  returned the 6-caption demo with its sandbox banner.
- The product-scoped license endpoint allowed 30 requests from one client.
  Request 31 returned **429** with **`Retry-After: 2`**. Successful responses
  used `Cache-Control: no-store` and the exact product CORS origin.
- Sign-in checks are not applicable; the product has no account flow.

## Performance

Fresh Lighthouse 12.8.2 mobile evidence at the live root:

| Category/metric | Result |
| --- | ---: |
| Performance | 96 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| FCP / LCP | 1.0 s / 1.0 s |
| Total blocking time | 220 ms |
| CLS | 0 |

Evidence: `.factory/evidence/verification-9/lighthouse-mobile.json`.

## Defects by severity

| Severity | Finding | Required release action |
| --- | --- | --- |
| Critical | Android native live captions skip automatic direction and require manual placement, so the Android artifact does not complete the brief's core job. | Provide and test an on-device Android direction signal from the microphone array, including confidence and mono fallback, without retaining audio. Exercise it through the packaged bridge on an Android 12+ device. |
| Release blocker | The exact `android-native-caption-path` claim command exits 1 in the required clean verification run because this worker has no JDK or Android SDK. The contract makes any failed claim command blocking. | Re-run all exact claim commands in a clean worker that contains the declared JDK/SDK paths; retain successful debug and Android-test APK evidence. |

No additional serious or critical web defect was found.
