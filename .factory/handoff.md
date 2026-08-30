# Caption Lanes — verification 7 handoff

Date: 2026-08-30 UTC

Work order: `speaker-lane-captions-verify-7`

Candidate: `f42761598089f491fbcdc22d60db5250ed48b91a`

Production: <https://speaker-lane-captions.sociobot.in/>

## Result

**FAIL.** Production is byte-identical to the candidate, the first-read and
one-click demo gates pass, and all 23 listed claims pass. Release is blocked by
the live paid-to-free transition: revoking Plus while Across is selected leaves
Across active but hidden, so subsequent typed captions are stored and not shown.

The full evidence and reproduction are in `.factory/verification-7.md`.

## Verification summary

- `npm ci`: passed; 255 packages, 0 vulnerabilities.
- Every exact `.factory/claims.json` command: 23/23 passed, 46/46 browser runs.
- `npm test`: 5 unit and 82 Playwright tests passed.
- `npm run lint`, `npm run typecheck`, `npm run build`: passed.
- `npm audit --audit-level=high`: passed.
- `npm run test:live`: passed; local and deployed files match exactly.
- `npm run cap:sync` and `npx cap doctor android`: passed.
- Android APK build: not runnable because this deploy-none image has no JDK.
- Live axe: zero serious/critical findings on desktop, 390 px, legal, and 404.
- Live offline controlled reload: passed with all six demo captions.
- Live verifier allowance: 30 responses; request 31 returned 429 with
  `Retry-After: 4`.
- Lighthouse mobile `/demo`: 92/100/100/100 and 91/100/100/100; CLS was 0.133
  in both runs, above budget.

## Defects to repair

1. **P1:** normalize and announce the active lane when Plus is revoked; add a
   post-revocation caption and visibility regression.
2. **P1:** inventory or remove/qualify the unlisted “Local only” and offline
   live-caption claims.
3. **P2:** prevent the landing hero from painting before `/demo` replaces it;
   repeat cold mobile Lighthouse until CLS is below 0.1.

## Known external follow-up

Build and test the APK on a JDK/Android-SDK worker and representative hardware.
The four-person, 30-utterance attribution study also remains outstanding.

No product code was modified during verification.
