# Caption Lanes — adversarial review 2 handoff

Date: 2026-08-30 UTC

Candidate: `3e6f802203fd7ebf289abc6525037a13ded0e129`

Production: <https://speaker-lane-captions.sociobot.in/>

## Result: FAIL

The complete report is `.factory/review-2.md`. No product code was changed.

Three blocking findings remain:

- A cached real Plus license leaks a fourth lane into the one-click demo and
  survives Reset demo.
- The Android artifact's core live-caption path still has no APK or device
  verification.
- Refund wording is not fully represented or exercised by the claim inventory.

Two minor findings remain: README uses “demo namespace,” and the 390 px header
hides Privacy.

## Verification completed

- Clean clone: `npm ci`, `npm test` (5 unit and 84 Playwright), `npm run lint`,
  `npm run typecheck`, `npm run build`, and `npm audit --audit-level=high` passed.
- Every exact command in `.factory/claims.json` passed: 23/23 commands and 46/46
  configured browser runs. The review documents two semantic coverage gaps.
- `npm run test:live` passed deployed artifact identity, response policy,
  checkout, favicon, and 404 checks.
- Live desktop and 390 px cold reads, route metadata, focus/history, request
  logs, demo reset/exit, link crawl, and Playwright axe scans were checked.
- `/opt/fleet/lib/verify-url.sh` passed against production.
- `npm run cap:sync` and `npx cap doctor android` passed in the disposable clean
  clone. Java is unavailable, so an APK and device tests could not run.

## Evidence

- `.factory/evidence/review-2/cold-mobile.png`
- `.factory/evidence/review-2/cold-desktop.png`
- `.factory/evidence/review-2/demo-mobile.png`
- `.factory/evidence/review-2/demo-license-leak-mobile.png`
- `.factory/evidence/review-2/demo-license-leak-desktop.png`
- `.factory/evidence/review-2/verify-live/verify.json`

## Next steps

Fix F-2-1 through F-2-5, add the missing demo-license and refunded-license test
states, complete Android device verification, then rerun the full review from a
clean clone and fresh browser contexts.
