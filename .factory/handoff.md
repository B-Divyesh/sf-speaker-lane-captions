# Caption Lanes — polish 1 handoff

Date: 2026-08-30 UTC

Work order: `speaker-lane-captions-polish-1`

Base: `4d287d7dbb57623e80fea90fae79874bef326305`

Production: <https://speaker-lane-captions.sociobot.in/>

## Result

All 14 findings in `.factory/review-1.md` are resolved. The product keeps its cinematic dark-room identity and original environmental art.

The landing page now uses literal headings and result-naming controls. The isolated demo works through one click, `/demo`, and `?demo=1`, with a persistent banner, reset, real/demo storage separation, and Start for real.

History navigation now updates focus, announcements, titles, canonical URLs, and social metadata. Legal and 404 pages share the same navigation and footer structure. The 404 response remains a real HTTP 404.

The claim inventory now contains 23 claims. New coverage proves consent order, microphone cleanup, mono behavior, language-pack order, free controls, network privacy, no identity fields, license portability/reconnect/revocation, and hosted checkout.

The unverified Android live-speech promise was removed. This static work order ships the PWA and a synchronized Capacitor project, not an APK. A later Android work order must build and certify the device microphone path before making an Android live-speech claim.

## Verification

- Clean clone: `npm ci` — 255 packages, 0 vulnerabilities.
- Every exact command in `.factory/claims.json` — 23/23 passed, 46/46 browser runs.
- Clean clone: `npm test` — 5 unit and 82 Playwright tests passed.
- `npm run lint`, `npm run typecheck`, `npm run build` — passed.
- Bundle — JS 20.25 kB raw / 7.36 kB gzip; CSS 17.03 kB raw / 4.63 kB gzip.
- `npm run cap:sync` — passed; web artifact copied to the Capacitor project.
- `npx cap doctor android` — “Android looking great.”
- Playwright axe — zero violations on app, demo, Privacy, Terms, and 404 coverage.
- `/opt/fleet/lib/verify-url.sh` — live 200, 601 ms cold load, correct title/lang/h1/main/alt/button labels, no console errors.
- Live Lighthouse — 100 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 0.9 s, CLS 0, TBT 0 ms.
- `npm run test:live` — passed ten checkout redirects, response policy, HTTP 404, and byte-for-byte deployed artifact identity.
- Cold live 390 × 844 audit — first-screen facts fit; demo seed/reset, `?demo=1`, Back/Forward focus, legal metadata, and 404 all passed.

Evidence and the finding-by-finding map are in `.factory/polish-1.md` and `.factory/evidence/polish-1/`.

## Run locally

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run preview
```

Run one claim using the exact command stored in `.factory/claims.json`.

## Deployment

The production `dist/` artifact was deployed to the production environment for `sf-speaker-lane-captions`. The custom URL was opened in a fresh browser context after deployment and matched local artifact hashes.

## Known gaps and next work

No review finding remains open in the shipped static release.

APK building, signing, distribution, and physical Android microphone certification belong to a later Android work order. The product does not claim those are complete. The brief's four-person attribution study also remains future validation and is not presented as an achieved result.
