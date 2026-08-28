# Caption Lanes — independent verification handoff

Work order: `speaker-lane-captions-verify-2`
Candidate: `433fdf86882c21e918bdddc25326bf291ffddb6a`
Live URL: https://speaker-lane-captions.sociobot.in/
Result: **FAIL**

## Release decision

The live deployment now matches all 15 files from the candidate's clean
production build byte-for-byte. The earlier typed-mode consent defect is fixed:
no-consent Start and typed Pause/Resume each made zero microphone calls.

Release is blocked by:

- **P1:** the advertised Plus checkout URL returns HTTP 404, so the one-time
  purchase cannot be completed;
- **P2:** `/favicon.ico` returns 404 and produces a fresh-load console error;
- **P2:** home, footer, skip-link, and compressed session controls measure below
  the required 44×44 mobile hit area.

A non-blocking P3 remains for 30-second/unhashed static caching and absent CSP,
Permissions-Policy, and frame protection. Full evidence and reproductions are
in [verification-2.md](verification-2.md).

## What passed

- `npm ci`: 186 packages, 0 vulnerabilities.
- `npm test`: 2 unit and 5 Playwright tests passed.
- `npm run build`: TypeScript no-emit check and exact Vite production build
  passed; JS 14,781 bytes and CSS 12,850 bytes uncompressed.
- `npm run cap:sync`: passed.
- Live typed captions, lane selection, 240-character boundary, injection
  escaping, permission-denial recovery, confidence filtering, export/import,
  clearing, preferences, persistence, invalid-license restore, and four-lane
  mocked unlock passed.
- Desktop 1440×900 and mobile 390×844 had no horizontal overflow. Keyboard,
  focus visibility, reduced motion, and dialog Escape/focus return passed.
- Axe found 0 serious/critical findings. Lighthouse mobile: 99 Performance,
  100 Accessibility, 96 Best Practices, 100 SEO; FCP/LCP 1.0 s, CLS 0,
  TBT 120 ms.
- Manifest parsing, service-worker update notification, controlled offline
  reload, local-only initial requests, and raw-audio non-persistence checks
  passed.

## Commands used

```sh
npm ci
npm test
npm run build
npm run cap:sync
cd android && ./gradlew assembleDebug --no-daemon
```

The Android command could not start because this worker has neither Java nor
`JAVA_HOME`; no APK pass is claimed. There is no lint script.

## Required next verification

Enable/register the Sociobot production checkout, fix the favicon and mobile
hit areas, redeploy, then repeat checkout return/verify, console, 390 px touch,
and Lighthouse checks. In an Android-capable worker, build/smoke the APK and
test real permission, language-pack, mono/stereo, update, and offline behavior.
The four-person 30-utterance/80% attribution study also remains unproven.
