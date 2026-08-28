# Caption Lanes — independent verification 3 handoff

Date: 2026-08-28 UTC

Work order: `speaker-lane-captions-verify-3`

Candidate: `083bf21d4b00bcdfa8a3b9479a2d74518a193dff`

Live URL: <https://speaker-lane-captions.sociobot.in/>

## Verdict: FAIL

The candidate and live deployment pass install, audit, lint, type checking,
unit/integration/browser tests, production build, Capacitor sync, deployed-byte
identity, desktop/390 px mobile, keyboard, axe, reduced-motion, privacy,
checkout, response-policy, caching, offline reload, update, and bundle checks.

Release is blocked because **Import transcript silently and permanently
replaces all captions already stored on the device without confirmation or
undo**. A live reproduction started with two saved captions, imported one valid
caption, observed zero dialogs, and retained only the imported caption after
reload. This is a P1 user-data-loss defect under the supplied destructive-action
contract.

A secondary P3 scope mismatch remains: `.factory/design.md` promises editable
lane labels, but settings expose no rename control.

Full commands, evidence, hashes, Lighthouse samples, and reproduction steps are
in [`.factory/verification-3.md`](verification-3.md).

## Verification summary

- `npm ci`: 255 packages, 0 vulnerabilities.
- `npm audit --audit-level=high`: pass.
- `npm run lint`: pass.
- `npm run typecheck`: pass.
- `npm test`: 3/3 Vitest and 14/14 Playwright tests pass.
- `npm run build`: pass; `dist/` 220 KiB, JS 14,790 B, CSS 13,207 B.
- `npm run cap:sync`: pass; `npx cap doctor android`: Android looking great.
- `npm run test:live`: pass; independent comparison: 16/16 deployable files
  match live byte-for-byte.
- Axe: zero serious/critical findings on setup, room, settings, privacy, terms.
- Lighthouse mobile, three runs: Performance 86/96/95 (median 95),
  Accessibility 100, Best Practices 100, SEO 100; LCP 0.98–1.28 s, CLS 0.
- Live service worker: controlled offline root and fallback reloads; isolated
  update showed the update toast, activated the new revision, retired the old
  cache, and reloaded offline.
- Live policies: HTTPS redirect, HSTS, CSP, microphone-scoped Permissions
  Policy, `DENY` framing, immutable hashed assets, no-cache service worker.
- Fresh load: no console/page errors, no third-party requests, analytics,
  remote fonts/scripts, or raw-audio persistence.

## Environment-limited checks

The debug APK could not be built because this deploy-none worker has no Java or
Android SDK. The Gradle command failed before Gradle with `java: command not
found`; no APK result is claimed. Physical-device microphone direction,
language-pack installation, Android lifecycle/navigation, and the brief's
four-person 30-utterance ≥80% attribution study remain unverified.

## Next step

Repair the destructive import path and add a regression test that begins with a
non-empty transcript. Then rerun the full verification matrix and Android
hardware checks in an SDK-equipped worker.
