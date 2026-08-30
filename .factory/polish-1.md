# Caption Lanes polish 1

Date: 2026-08-30 UTC

Base: `4d287d7dbb57623e80fea90fae79874bef326305`

Repair commit: `540b356b2abe98139de6c63be2ed65be0113dc64`

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept checkout on the approved Sociobot/Dodo endpoint, opened it in a new tab so the recovery dialog remains available, added plain retry guidance, and made release verification fail on any of ten consecutive 5xx responses. Added the `hosted-checkout` claim. | `@claim:hosted-checkout` passed 2/2 projects with five live 303 checks each; `npm run test:live` repeats ten live checks. Plus dialog is visible in `.factory/evidence/polish-1/verify-local/screenshot-desktop.png`. Live check: `https://speaker-lane-captions.sociobot.in/`. |
| F-1-2 | Removed the unverified Android/WebView live-speech promise. README now says the Capacitor project is prepared but no APK is published, and requires a later device certification work order. Browser live speech remains conditional on confirmed local recognition. | `@claim:local-speech`; `npm run cap:sync`; `npx cap doctor android` reported “Android looking great.” No APK or device result is claimed. |
| F-1-3 | Added explicit consent gating and audio cleanup on Pause, End captions, app navigation, background, and page close. | `@claim:consent-before-microphone`; `@claim:microphone-lifecycle`. |
| F-1-4 | Added separate inventories for no account/analytics/archive traffic and no identity/voiceprint fields. The privacy test covers demo, real typed, and licensed modes. | `@claim:no-accounts-analytics-archive`; `@claim:no-identity-inference`; `@claim:local-privacy`. |
| F-1-5 | Added a mono-input warning/manual-placement test. Replaced the Android language-pack promise with conditional browser wording and tested install-before-start behavior. | `@claim:mono-input`; `@claim:language-pack-flow`. |
| F-1-6 | Rewrote the free boundary to named controls and exercised typed captions, caption size, confidence filtering, lane color, and JSON export without a license. | `@claim:free-core-controls`. |
| F-1-7 | Added fresh-context license restoration and forced verification when the browser reconnects. | `@claim:license-portability`; `@claim:license-reconnect`; `@claim:revoked-license`. |
| F-1-8 | Expanded `.factory/claims.json` from 12 to 24 claims. The inventory test enforces one and only one tagged browser test for each entry. | `tests/unit/release.test.ts`; every exact claim command passed from `/tmp/caption-lanes-clean-x160B1`. |
| F-1-9 | Replaced full reloads between `/` and `/demo` with History API navigation. Each change updates title/canonical/social metadata, announces the route, and focuses its `<h1>`; Back and Forward restore both states. | `moves focus, announces titles, and restores routes with browser history`; `opens the isolated sample directly with ?demo=1`. |
| F-1-10 | Added the same wordmark, Demo/Privacy header navigation, one-line footer, Demo/Privacy/Terms links, factory credit, and build id to legal, offline, and 404 pages. | `serves complete route-specific metadata on direct routes`; `.factory/evidence/polish-1/local-privacy.png`; `.factory/evidence/polish-1/local-404.png`. |
| F-1-11 | Added canonical, Open Graph, Twitter, favicon, and apple-touch metadata to Privacy, Terms, and 404. | `serves complete route-specific metadata on direct routes`; `tests/unit/release.test.ts`. |
| F-1-12 | Replaced mood and pun headings with “How to use Caption Lanes,” “Add a fourth caption lane,” and “Page not found.” | `tests/unit/release.test.ts`; `.factory/evidence/polish-1/local-404.png`. |
| F-1-13 | Renamed actions to Export transcript, End captions, Restore license, View Caption Lanes Plus, Unlock lane color, and Lock lane color. | `all visible mobile controls have at least 44px touch targets`; `.factory/evidence/polish-1/local-mobile-demo.png`. |
| F-1-14 | Replaced “local caption history,” “storage namespace,” `processLocally`, and “reconciled” with transcript, separate store, browser-confirmed local speech, and recheck wording. | `.factory/copy-audit.md`; README banned-word and terminology audit. |

## Verification

- Clean clone: `npm ci` found 0 vulnerabilities.
- Every command in `.factory/claims.json`: 24/24 commands passed; 48/48 browser runs.
- Clean clone: `npm test` passed 5 unit and 82 browser tests.
- Clean clone: `npm run lint`, `npm run typecheck`, and `npm run build` passed.
- Build: JS 20.25 kB raw / 7.36 kB gzip; CSS 17.03 kB raw / 4.63 kB gzip.
- Offline coverage uses a dedicated browser context and passed at both project sizes.
- Playwright axe checks passed on app, demo, Privacy, Terms, and 404 routes.
- `/opt/fleet/lib/verify-url.sh` passed locally with no console errors; report: `.factory/evidence/polish-1/verify-local/verify.json`.
- Lighthouse local mobile: 100 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.1 s, CLS 0, TBT 0 ms. Report: `.factory/evidence/polish-1/lighthouse-local.json`.
- Mobile first screen: `.factory/evidence/polish-1/local-mobile-first-screen.png`.
- Isolated mobile demo: `.factory/evidence/polish-1/local-mobile-demo.png`.

## Live recheck

The deployment and cold live recheck are recorded in `.factory/handoff.md`.
