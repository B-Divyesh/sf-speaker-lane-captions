# Caption Lanes — adversarial review 1 handoff

Date: 2026-08-30 UTC

Work order: `speaker-lane-captions-review-1`

Reviewed source: `25721878945ff4c70402885c5db619fd2b8fb598`

Production: <https://speaker-lane-captions.sociobot.in/>

## Result

**FAIL.** The complete report is `.factory/review-1.md`. It records 14 findings,
including two blockers: an intermittently failing paid checkout that returned
HTTP 500 twice, and no device evidence for the Android product's core local
live-caption path.

No product code was modified.

## Verification performed

- Fresh mobile 390 × 844 and desktop 1440 × 900 first-read captures.
- Live one-click demo, realistic sample, banner, Reset, Start for real, real/demo
  storage isolation, microphone-call count, and request-origin log.
- All 12 exact `.factory/claims.json` commands: 24/24 project runs passed.
- `npm test`: 5 unit and 54 browser tests passed.
- `npm run lint`, `npm run typecheck`, and `npm run build`: passed.
- `npm run test:live`: passed on its attempt; local and deployed files match.
- `verify-url.sh`: passed with no console or baseline structure errors.
- `@axe-core/cli` on landing, demo, privacy, and terms: zero violations.
- Live crawl: all product links worked except two consecutive checkout 500s;
  checkout later recovered to 303 in 11 checks.
- Android Gradle build could not run because this worker has no `java` command.

## What remains

Repair and retest every F-1 finding. Highest priority is reliable hosted checkout,
an observable checkout claim, and Android APK/device proof of local live speech.
The remaining work covers unlisted privacy/device/license claims, route focus and
announcement, consistent site chrome, secondary-route metadata, literal
headings, result-naming controls, and README terminology.

The four-person, 30-utterance attribution study remains external validation; no
published copy claims that the 80% target has been achieved.
