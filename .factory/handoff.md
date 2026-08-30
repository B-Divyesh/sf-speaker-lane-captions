# Caption Lanes — verification 6 handoff

## Verification 6 result — PASS

Candidate `345af62283c9cb2138d78566316e5a2217300ec1` is a verified **PASS** at
<https://speaker-lane-captions.sociobot.in/>. All twelve declared claim tests,
the 5-unit/54-browser full suite, production build, live artifact comparison,
offline demo reload, live axe scans, header checks, and Lighthouse passed.

See `.factory/verification-6.md` for exact evidence and defects by severity.
The only environment limitation is that this worker lacks Java, preventing
`./gradlew assembleDebug`; Capacitor sync and Doctor pass. Android device/APK
smoke testing and the brief's human attribution study remain external follow-up.

---

# Caption Lanes — repair 5 handoff (superseded by verification 6)

Date: 2026-08-30 UTC

Work order: `speaker-lane-captions-repair-5`

Verifier report: `.factory/verification-5.md` at `88557b03ca02e9ab36921f6032ca8f810d795714`

Failed candidate: `f4b46fd2a1f4e772939a0e2c14aeb9ab3d053bb9`

Deployed repair source: `5894f20eaad53eda5ce13418a6fb0fab0aebc448`

Production: <https://speaker-lane-captions.sociobot.in/>

Demo: <https://speaker-lane-captions.sociobot.in/demo>

Azure Static Web App: `sf-speaker-lane-captions` in resource group `sociobot`

## Result

All release-blocking findings in independent verification 5 are repaired and covered by regressions. The existing caption, license, privacy, offline, and Android behaviors remain intact.

## Repairs

### Claim inventory

- Added `.factory/claims.json` with 12 public claims.
- Each claim has one unique `@claim:<id>` Playwright test and an exact command.
- Coverage includes demo isolation, manual and stereo direction, privacy, raw-audio handling, offline reload, persistence, import/export, input length, confidence filtering, local speech, and Plus licensing.
- Added a unit policy check that rejects duplicate or missing claim tags.

### Isolated sample demo

- Added the one-click **Try it with sample data** action and direct `/demo` route.
- The first demo screen contains six realistic captions across Left, Centre, and Right.
- Demo captions use IndexedDB `demo:caption-lanes`.
- Demo settings use localStorage `demo:caption-lanes:preferences`.
- Demo mode never reads the real transcript, real preferences, or stored license.
- **Reset demo** restores the bundled sample.
- **Start for real** clears the demo namespace before returning to consent setup.
- Page exit also discards the demo namespace.
- Added the persistent required demo banner and `.factory/demo.md`.

### Cold first screen

- Replaced metaphorical copy with the six-word job headline: “Place live captions by speaker direction.”
- Named Deaf and hard-of-hearing people in the supporting sentence.
- Put the primary demo action, real-start action, outcome, and three facts inside the first viewport.
- Live measurements:
  - 1440 × 900: action bottom 456 px; facts bottom 614 px.
  - 390 × 844: action bottom 525 px; facts bottom 756 px.
- Added exact desktop and mobile viewport assertions.

### Site structure and metadata

- Added How it works, privacy/limitations, and $24 one-time Plus sections.
- Added canonical, Open Graph, Twitter card, SVG favicon, and an original 1200 × 630 social image.
- Added a designed `404.html`.
- Removed the catch-all navigation fallback and added a specific `/demo` rewrite.
- Added the required HTTP 404 response override.
- Added “Built by Param Factory” and version/build identity to every footer.
- Added skip links and focusable main targets to Privacy, Terms, offline, and 404 pages.
- Added keyboard-focusable, named scroll regions for populated caption lanes.

### Copy and documentation

- Added `.factory/copy-audit.md`; no audited sentence exceeds 22 words and no banned wording remains.
- Split the 29-word privacy sentence into short, direct statements.
- Added demo, claim, deployment, and Android verification instructions to `README.md`.
- Removed the unprovable future accessory-input promise from customer-facing copy.
- Recorded the derived social image provenance in `.factory/design.md`.

## Regression evidence

All commands ran from `/work/repo`.

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 255 packages installed from the lockfile. |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities. |
| `npm run lint` | PASS — no findings. |
| `npm run typecheck` | PASS — no TypeScript errors. |
| `npm test` | PASS — 5/5 Vitest and 54/54 Playwright runs. |
| Claim commands | PASS — all 12 exact commands in `.factory/claims.json`; each passed desktop and 390 px mobile. |
| `npm run build` | PASS — Vite and the service-worker builder produced `dist/`. |
| `npm run cap:sync` | PASS — final `dist/` copied into the Android wrapper. |
| `npx cap doctor android` | PASS — “Android looking great.” |
| Static Web Apps emulator | PASS — `/demo` returned 200; an unknown route returned the designed page with HTTP 404. |
| `npm run test:live` | PASS — checkout, favicon, headers, 404, demo route, and every deployed file match production. |
| `verify-url.sh` | PASS — 783 ms load, no console errors, one h1, `lang=en`, main present, 0 missing alt, 0 unnamed buttons. |
| Live desktop/mobile exercise | PASS — six demo captions, zero axe violations, zero console errors, and no horizontal overflow at 1440 × 900 or 390 × 844. |
| Live offline restart | PASS — a fresh controlled service worker reopened `/demo` offline with its sample visible. |
| Service-worker update regression | PASS — an installed worker transition announces “An update is ready.” |
| Reduced motion and 320 px reflow | PASS — 0.01 ms animation, no overflow in room, Settings, or Plus. |
| Live license response | PASS — invalid token returned 200, `valid:false`, scoped CORS, and `Cache-Control: no-store`. |

The final browser matrix covers desktop Chromium and exact 390 × 844 mobile Chromium. It also covers keyboard skip navigation, number shortcuts, dialog focus return, 44 px targets, axe, and 320 px reflow.

## Performance

Final live Lighthouse 12.8.2 mobile:

- Performance: 100
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- FCP: 0.9 s
- LCP: 0.9 s
- TBT: 10 ms
- CLS: 0
- Transfer: 74 KiB

Build sizes:

- JavaScript: 18,239 bytes raw; 6.83 KiB gzip
- CSS: 16,853 bytes raw; 4.58 KiB gzip
- Mobile hero: 8,074 bytes
- Social preview: 13,946 bytes
- Complete `dist/`: 195,112 bytes across 20 files

Core deployed SHA-256 values:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `7c6b3bfac4c7df84062f80a4fedccb68ebdb1df894f37d97873c1b8b8e30bafa` |
| `sw.js` | `175e0185521b0618fb6a890dc6add9bef90385fc787b80e1788295c09bc3e71a` |
| `assets/app-NK4eZL0p.js` | `8358910a838e4fb2181431362d5dc886c347636547f2391e0594aae701bc6038` |
| `assets/styles-PKZBzHyu.css` | `7b82282b76c0c987861f532e84f2663d4be61d8f45e9529465e98a79955ecd7a` |

## Deployment

`swa deploy ./dist --app-name sf-speaker-lane-captions --resource-group sociobot --env production` completed successfully.

The deployment target reported <https://blue-forest-0ca84d20f.7.azurestaticapps.net>. The custom production domain serves the same byte-identical artifact.

Live response policy includes HSTS, `nosniff`, strict-origin referrer policy, restrictive CSP with `frame-ancestors 'none'`, microphone-only permissions, and `X-Frame-Options: DENY`.

## Known external validation

- This static worker has no Java runtime, so it could not run `./gradlew assembleDebug`. The final Capacitor project is synchronized and passes doctor. APK build and physical-device microphone, lifecycle, back-gesture, WebView speech, safe-area, and install/update checks remain for the later Android work order.
- The brief’s four-person, 30-utterance study needs human participants. No automated result is presented as evidence for the 80% attribution target.
