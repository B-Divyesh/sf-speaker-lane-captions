# Independent verification 11 — PASS

Date: 2026-09-02 UTC

Work order: `speaker-lane-captions-verify-11`

Candidate commit: `f1f0391a0543cf2c9ebf88d49013e026f05cb0cc`

Live URL: <https://speaker-lane-captions.sociobot.in/>

## Verdict

**PASS.** The exact candidate satisfies the supplied acceptance contract. The
deployed files match the candidate byte for byte. No critical, high, medium, or
low severity defects remain open.

No product code was changed during this verification.

## First-read and demo gate

- **PASS — what it does:** the cold first screen says “Place live captions by
  speaker direction.”
- **PASS — who it serves:** it names Deaf and hard-of-hearing people following
  small, in-person conversations.
- **PASS — what to do first:** “Try it with sample data” is visible in the first
  viewport beside a plain explanation of the result.
- **PASS — one-click sample:** the action opens `/demo` with three directional
  lanes, six realistic captions, and the persistent “Demo — sample data,
  nothing is saved” banner.

The cold desktop response was HTTP 200 with one `h1`, no console or page
errors, and only same-origin requests. The same first-screen contract also
passed at 390 × 844 in the repository suite.

## Mandatory claims gate

`.factory/claims.json` exists and contains 24 entries. Every exact `test`
command was run from detached candidate `f1f0391…` after `npm ci`:

- All 23 Playwright claim commands passed in desktop Chromium and exact
  390 × 844 Chromium: 46 passing browser results.
- `npm run test:android` passed by verifying the exact successful Android
  package workflow [run 33569777621](https://github.com/B-Divyesh/sf-speaker-lane-captions/actions/runs/33569777621)
  and retained artifact
  `android-apks-f1f0391a0543cf2c9ebf88d49013e026f05cb0cc` (ID `9824515257`).

The claims cover demo deletion/isolation, directional placement, stereo and
mono behavior, microphone consent/lifecycle, local speech and language packs,
privacy/storage boundaries, offline reload, persistence, import/export, input
and confidence boundaries, free controls, and license/checkout states. A copy
cross-check of the landing page, legal pages, and README found no unlisted
claim-like promise.

## Clean candidate quality gates

| Check | Result | Evidence |
| --- | --- | --- |
| Install | PASS | `npm ci`: 255 packages; audit reported 0 vulnerabilities. |
| Lint | PASS | `npm run lint`. |
| Types | PASS | `npm run typecheck`. |
| Unit tests | PASS | 9 tests across 3 files. |
| Full browser suite | PASS | `npm test`: 86 Playwright runs passed in desktop and 390 px Chromium. |
| Production build | PASS | `npm run build`; `dist/` produced. |
| Android package evidence | PASS | Exact-source workflow and retained debug/test APKs above. |

The production output is 31.48 kB raw / 11.24 kB gzip JavaScript and 17.70 kB
raw / 4.78 kB gzip CSS. There is no font payload. The largest shipped image is
32.04 kB, so all supplied bundle budgets pass.

## Product and recovery flows

Independent live runs covered the normal typed-caption path, one-click demo,
manual lane selection, shortcut `1`, Enter submission, pause/resume, reset, and
demo exit. Boundary and recovery checks passed for blank input, the exact
240-character limit, 59%/60% confidence behavior, invalid JSON import, confirmed
replacement import, blocked demo database deletion, license revocation, mono
input, permission denial, offline state, and service-worker update notice.

The live invalid-import flow announced “That file is not a Caption Lanes
transcript.” and remained usable. Typed pause/resume made zero microphone calls.
The complete suite also proves audio tracks stop on pause, end, navigation,
backgrounding, and page close.

## Privacy, deployment, and endpoint policy

- `npm run test:live` compared every deployable file in the candidate `dist/`
  against production; every hash matched.
- A fresh live demo run made only same-origin requests and made zero microphone
  calls. No analytics, CDN, remote font, account, or archive request appeared.
- The only expected external runtime call is license verification at
  `api.sociobot.in`; no raw payment form is embedded. The buy link returned 303
  to hosted Dodo checkout.
- Live root, demo, Privacy, Terms, designed 404, assets, manifest, robots, and
  sitemap returned their expected statuses. A landing-page link crawl found no
  dead links.
- Response headers include HSTS, `nosniff`, `strict-origin-when-cross-origin`,
  `X-Frame-Options: DENY`, a restrictive CSP, and a microphone-only
  Permissions-Policy. HTML revalidates after 30 seconds; hashed JS/CSS cache for
  one year as immutable; `sw.js` is `no-cache`.
- License verification allows 30 requests per client window. Attempts 1–30
  returned 200 for an invalid token; attempt 31 returned 429 with
  `Retry-After: 4`.
- Sign-in is not applicable. Caption Lanes has no account flow.

## Accessibility, PWA, and performance

- `/opt/fleet/lib/verify-url.sh` passed title, `lang="en"`, one `h1`, `main`,
  image alternatives, labelled buttons, and zero console errors. Evidence:
  `verification-evidence-11/verify-url/verify.json`.
- Independent axe runs on `/`, `/demo`, `/privacy/`, `/terms/`, and `/404.html`
  found zero serious or critical issues at 390 px. The full suite also covers
  the active room, desktop, touch targets, dialogs, history focus, and 320 px
  reflow.
- Keyboard-only checks passed skip navigation, Enter/Space controls, direction
  shortcuts outside text fields, Escape dialog close, and focus return. The
  visible focus ring is 3 px Lantern amber. Reduced motion changes caption
  animation duration to `0.01ms`.
- The live service worker uses cache `caption-lanes-9f56e6e16bc3`, precaches
  hashed JS/CSS, and reloads the exact installed start URL offline. Chromium
  reported no manifest or installability errors.
- Fresh mobile Lighthouse retry: Performance 99, Accessibility 100, Best
  Practices 100, SEO 100; FCP 1.0 s, LCP 1.2 s, TBT 150 ms, CLS 0. The first
  run scored 88 performance because of a non-reproduced 480 ms TBT; its other
  scores were 100 and LCP was 1.1 s. Both reports are retained.
- Five fresh mobile demo-entry interactions measured 79.8–124.1 ms, with a
  93.8 ms median.

## Android-specific review

The native implementation uses Android 12+ on-device speech, requests
`RECORD_AUDIO` in context, computes coarse direction from transient stereo PCM,
does not write audio, and provides a clear manual fallback when two usable
channels are unavailable. The exact workflow compiled debug and test APKs, ran
native direction tests, and exercised the packaged Capacitor bridge on an
Android 12 emulator.

Release signing/distribution and the brief's physical four-person,
30-utterance, 80% attribution study are not part of this candidate's evidence.
That study remains a next validation step; the product makes no quantitative
accuracy claim.

## Defects by severity

No critical, high, medium, or low severity defects were found.

## Evidence

- `verification-evidence-11/live-first-read-desktop.png`
- `verification-evidence-11/live-demo-desktop.png`
- `verification-evidence-11/live-mobile-recovery.png`
- `verification-evidence-11/verify-url/`
- `verification-evidence-11/lighthouse-mobile.json`
- `verification-evidence-11/lighthouse-mobile-retry.json`

