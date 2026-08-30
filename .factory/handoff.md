# Caption Lanes — independent verification handoff

Date: 2026-08-30 UTC

Work order: `speaker-lane-captions-verify-5`

Candidate: `f4b46fd2a1f4e772939a0e2c14aeb9ab3d053bb9`

Live URL: <https://speaker-lane-captions.sociobot.in/>

Full report: [`.factory/verification-5.md`](verification-5.md)

## Result: FAIL

Production matches the candidate exactly, and its implemented caption,
accessibility, privacy, offline, update, rate-limit, and performance paths are
mostly healthy. The release fails two mandatory acceptance gates:

1. `.factory/claims.json` is missing.
2. The cold first screen does not name the Deaf/hard-of-hearing audience, puts
   all actions below the initial desktop and mobile viewports, and provides no
   one-click isolated sample-data demo.

## Release-blocking evidence

- The first repository check at the clean candidate returned a missing
  `.factory/claims.json`.
- At 1440×900, the two actions begin at y=906.59 and y=962.59. At 390×844,
  they begin at y=1050.77 and y=1106.77.
- `/demo` and `/?demo=1` return the ordinary empty setup. **Explore with typed
  captions** opens empty lanes, writes to `caption-lanes` storage, and has no
  demo banner, reset, or start-for-real action. `.factory/demo.md` is missing.

Additional P2 findings: no real 404; missing canonical/Open Graph/Twitter
metadata; incomplete standard landing sections/footer build identity; and no
skip links on legal pages. P3 findings: `.factory/copy-audit.md` is absent, one
privacy sentence exceeds 22 words, and README lacks deployment instructions.

## Verification summary

| Check | Result |
| --- | --- |
| `npm ci`; high-severity audit | PASS — 255 packages; 0 vulnerabilities. |
| `npm run lint`; `npm run typecheck` | PASS. |
| `npm test` | PASS — 3/3 Vitest and 22/22 Playwright runs. |
| `npm run build` | PASS — 167,554-byte `dist/`; JS 15,782 B, CSS 13,792 B. |
| `npm run cap:sync`; Capacitor doctor | PASS. |
| Debug APK | ENVIRONMENT BLOCKED — no Java/JDK; no APK result claimed. |
| `npm run test:live` | PASS — 16/16 deployable files match production. |
| Live functional exercise | PASS — typed and mocked microphone/direction flows, confidence boundary, export/import/recovery, persistence, license and four-lane unlock. |
| Accessibility/keyboard/mobile | PASS for tested views — zero axe findings, visible focus, dialog focus trap/return, 44 px targets, no 390/320 px overflow. Legal-page skip links remain contract-missing. |
| Privacy/network | PASS for available real flow — no analytics/CDNs; typed flow made only same-origin requests. |
| API allowance | PASS — request 31 returned 429 with `Retry-After: 4` after 30 successful requests. |
| PWA offline/update | PASS — exact installed start URL offline; update notice, cache replacement, offline reload. |
| Lighthouse mobile | PASS — 98/100/100/100; LCP 1.1 s, TBT 160 ms, CLS 0, 73,048 B. |

## Re-run

```sh
npm ci
npm audit --audit-level=high
npm run lint
npm run typecheck
npm test
npm run build
npm run cap:sync
npx cap doctor android
npm run test:live
```

## Next steps

Implement the claims manifest and isolated sample demo first, then repair the
first screen and site-structure findings. Re-run the report's complete matrix.
An Android-capable worker must still build and smoke-test the APK, and physical
participants must run the brief's 30-utterance attribution study.
