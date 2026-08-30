# Independent verification 5 — FAIL

Date: 2026-08-30 UTC

Work order: `speaker-lane-captions-verify-5`

Candidate: `f4b46fd2a1f4e772939a0e2c14aeb9ab3d053bb9`

Live URL: <https://speaker-lane-captions.sociobot.in/>

Browser: Google Chrome for Testing 145.0.7632.6 / Playwright 1.58.2

## Verdict

**FAIL.** Production is an exact match for the candidate and the implemented
caption flows are generally healthy. However, both mandatory entry gates in
this work order fail:

1. `.factory/claims.json` is absent. There are therefore no declared claim
   commands to run, and none of the product's observable privacy, offline,
   export, persistence, or paid-feature claims are inventoried as required.
2. The cold first screen neither names Deaf and hard-of-hearing people nor
   presents any action inside the initial viewport. It has no one-click **Try
   it with sample data** demo. The similarly named **Explore with typed
   captions** action is below the fold, opens an empty room, writes to the
   ordinary `caption-lanes` storage, and has none of the required demo banner,
   reset, or start-for-real controls.

These are explicit release-blocking conditions in the acceptance contract.
No product source was modified during verification.

## Mandatory first checks

### Claims gate — FAIL

The checkout was clean at the exact candidate SHA. The very first repository
check returned `__CLAIMS_MISSING__` for `.factory/claims.json`. This is not
repaired by the one Playwright test whose name happens to include
`@claim:offline-installed-start-url`: without the required manifest, there is
no complete claim inventory and no set of listed commands to execute.

Representative unlisted statements include:

- “Local only,” “Raw audio is never saved,” and “No accounts or cloud archive.”
- “The installed app's files are cached for offline use.”
- Local caption persistence, transcript export/import, and the 240-character
  input behavior.
- The $24 one-time license, fourth lane, once-daily verification cache, and
  future compatible accessory-input statement.

### Cold first-read and demo gate — FAIL

What the first screen communicates: live speech is separated into directional
caption lanes instead of one transcript. That part is understandable.

Who it names: nobody. The visible landing copy does not say Deaf or
hard-of-hearing people, its researched audience. “A clearer seat at the table”
is also metaphorical rather than useful first-read information.

What to click first: neither action is in the first viewport. At 1440×900,
**Start captions** begins at y=906.59 and **Explore with typed captions** at
y=962.59. At 390×844, they begin at y=1050.77 and y=1106.77. A cold visitor
must scroll before discovering an action.

There is no button named **Try it with sample data**. Direct requests to both
`/demo` and `/?demo=1` returned the ordinary empty setup page with zero sample
captions and no demo controls. Clicking **Explore with typed captions** produced
three empty lanes, stored preferences under `caption-lanes:preferences`, and
opened IndexedDB database `caption-lanes`. There is no separate `demo:`
namespace. `.factory/demo.md` is also absent.

## Clean-checkout gates

| Check | Result | Evidence |
| --- | --- | --- |
| Candidate identity | PASS | `git rev-parse HEAD` returned the full candidate SHA; the tree began clean. |
| Locked install | PASS | `npm ci` installed 255 packages. |
| Dependency audit | PASS | `npm audit --audit-level=high`: 0 vulnerabilities. |
| Lint | PASS | `npm run lint` completed without findings. |
| Types | PASS | `npm run typecheck` completed without errors. |
| Unit/integration/browser suite | PASS | `npm test`: 3/3 Vitest tests and 22/22 Playwright runs passed across desktop Chromium and exact 390×844 mobile Chromium. |
| Exact production build | PASS | `npm run build` ran TypeScript, Vite 7.3.6, and the service-worker builder and produced `dist/`. |
| Capacitor sync | PASS | `npm run cap:sync`; generated Android web assets matched `dist/`, apart from Capacitor's generated `cordova.js` files. |
| Capacitor project | PASS | `npx cap doctor android`: “Android looking great.” App id is `in.sociobot.speakerlanecaptions`; cleartext and backup are disabled; record-audio permission is declared. |
| Debug APK | ENVIRONMENT BLOCKED | `java` is absent. Gradle stopped with “JAVA_HOME is not set and no 'java' command could be found.” No APK result is claimed. |
| Live candidate identity | PASS | `npm run test:live` compared every deployable file and passed checkout, favicon, headers, and artifact identity. Independent count: 16/16 deployable files. |

Build output is 167,554 bytes total. Main JS is 15,782 bytes (6.10 KiB
gzip), CSS is 13,792 bytes (3.96 KiB gzip), there are no fonts, and the mobile
hero is 8,074 bytes. These are comfortably below the supplied budgets.

Core live hashes match local `dist/`:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `5703653a590798e120a013facfa1bc0c26cedac712871a87d3e29f0b0f648d0b` |
| `sw.js` | `fef8f218ab624339132daf06ccd4e9e2a7859df03c58f413ebd026d8f37cd5b5` |
| `assets/app-n0ZQK1_2.js` | `a45c022e541878154be6340939bedb687873538e47a26e8fcd1bbabc17b8c318` |
| `assets/styles-56zywAql.css` | `73e54f309423f0a5e93f16450941cde4d57d8e7e1da828844e5046a163d3cd80` |

## Independent end-to-end exercise

Fresh live-browser tests, separate from the repository suite, found:

- Typed captions could be assigned to directional lanes by controls, keyboard,
  and Enter. Blank input was ignored; input stopped at exactly 240 characters.
- Literal `<img onerror=…>` text stayed inert and created no element or script.
- Export downloaded parseable JSON with two captions and
  `rawAudioStored: false`.
- Captions persisted through reload. Malformed import showed the documented
  recovery message. Clear cancellation preserved captions, while explicit
  confirmation removed them.
- A mocked stereo input with stronger left-channel energy automatically selected
  Left. A 0.9-confidence speech result was then rendered in the Left lane with
  “Direction: strong.”
- A mocked mono input showed the one-channel limitation. Pause stopped its
  track; Resume created a second recognition/input session. Permission denial
  produced actionable Android-settings copy and kept typed input available.
- With “Hide uncertain captions” enabled, a 0.59 result was hidden while the
  exact 0.60 threshold remained visible.
- A mocked valid returned license was stored under
  `sb_license:speaker-lane-captions`, removed from the URL without removing the
  `source` parameter, verified once, cached across reload, and exposed four
  lanes.
- The checkout endpoint returned HTTP 303 to a hosted Dodo checkout. No payment
  was submitted.

## Accessibility, keyboard, mobile, and visual behavior

- Independent axe scans found zero serious/critical findings and zero findings
  of any impact on setup, a populated room, `/privacy/`, and `/terms/`.
- `/opt/fleet/lib/verify-url.sh` passed: HTTPS 200, 606 ms network-idle load,
  no console/page errors, a descriptive title, `lang=en`, one h1, a main
  landmark, complete image alt text, and no unnamed button.
- At 390×844, the room had no horizontal overflow and all visible buttons,
  links, inputs, and input labels measured at least 44×44 CSS px. At the 320 px
  reflow boundary, setup, settings, and upgrade remained within the viewport.
- Keyboard-only navigation exposed the skip link at 16×12 with a 144.95×44 px
  hit area and a 3 px Lantern outline. Tab reached the setup controls; Enter
  opened typed mode and submitted a caption; number shortcuts worked outside
  text inputs. Native dialogs trapped focus, Escape closed them, and focus
  returned to the opener.
- Reduced-motion mode computed caption animation and transitions to 0.01 ms.
- Desktop and 390 px room screenshots were inspected; no clipping, collisions,
  or unreadable fallback appeared in the active product.

The legal pages nevertheless omit the required skip link to `main`; this is a
contract defect even though axe does not flag it as serious or critical.

## Privacy, network, headers, and rate limit

- A fresh cold load contacted only the product origin. The complete available
  typed flow—captioning, export, invalid import, reload, and clear—made zero
  cross-origin requests and emitted zero console/page errors.
- Captions use IndexedDB `caption-lanes`; preferences use localStorage. Source
  and runtime inspection found no analytics, CDN scripts/fonts, `MediaRecorder`,
  or raw-audio persistence. The only designed cross-origin runtime request is
  license verification at `api.sociobot.in`.
- A real invalid-license request returned HTTP 200 with
  `{valid:false, reason:"invalid"}`, `Cache-Control: no-store`, and CORS scoped
  to the product origin.
- The license verification API enforced a 30-request burst allowance in this
  fresh run: requests 1–30 succeeded, request 31 returned HTTP 429 with
  `Retry-After: 4` and “Too Many Requests! Wait for 4s.”
- The app has no sign-in, backend tenant, or other server endpoint. Entra tenant
  validation is therefore not applicable.
- Root responses provide HSTS, `nosniff`, strict-origin referrer policy,
  restrictive CSP with `frame-ancestors 'none'`, microphone-only permissions,
  and `X-Frame-Options: DENY`. HTML uses 30-second revalidation, hashed assets
  use one-year immutable caching, and `sw.js` uses `no-cache`.

## PWA and performance

- Chromium parsed the manifest with zero errors. It declares standalone mode,
  versioned start URL, dark theme/background, and 192/512 maskable icons.
- A fresh live context installed a controlling service worker and cache
  `caption-lanes-3890e03a31fb`. Its 12 entries included the exact
  `/?v=2&source=installed` URL and hashed shell files. That exact start URL
  opened the Caption Lanes shell offline with no browser error.
- A local, byte-identical production harness forced a new worker revision. The
  app displayed “An update is ready,” the old cache was replaced by the new
  cache, and the updated shell reloaded offline with no console/page errors.
- Lighthouse 12.8.2 mobile scored 98 performance, 100 accessibility, 100 best
  practices, and 100 SEO. FCP and LCP were 1.1 s, TBT 160 ms, CLS 0, and total
  transfer 73,048 bytes. It recorded no third-party bytes or console errors.

## Defects

### P1 — required claims manifest is missing

`.factory/claims.json` does not exist. This independently fails the release by
the explicit claims acceptance rule. Add every user-reliant statement and one
observable demo-sandbox test per claim, then run each exact listed command from
a fresh checkout.

### P1 — required sample-data demo and isolation do not exist

There is no one-click sample-data action, no seeded realistic conversation, no
demo banner/reset/start-for-real controls, no `/demo` behavior, no separate
storage namespace, and no `.factory/demo.md`. The existing typed exploration is
an empty real-data session and is not a demo sandbox.

### P1 — cold first screen fails audience and action requirements

The first screen explains directional lanes but never names Deaf and
hard-of-hearing people. Both actions are below the first viewport at desktop and
mobile sizes, so it does not show what to click first. The first screen also
lacks the required three short privacy/offline/price facts.

### P2 — required site structure and metadata are incomplete

- `/does-not-exist-qa` returns HTTP 200 and the product home page; no designed
  404 route exists.
- The root has no canonical link, Open Graph metadata, Twitter card, or real
  1200×630 social image reference.
- The standard “How it works,” explicit limitations/privacy, and paid-tier
  sections are absent from the landing page. Price is available only after
  opening a footer dialog.
- Footers omit “Built by Param Factory” and version/build identity.
- Privacy and Terms pages omit the standard skip link.

### P3 — required supporting copy/docs audits are incomplete

`.factory/copy-audit.md` is absent. The privacy-policy sentence beginning “Raw
audio is held only in memory…” has 29 words, above the 22-word hard limit. The
README explains build/test but does not document a deployment procedure as the
repository definition of done requests.

## Required external validation

The repository contains a synchronized Capacitor Android project, but this
worker cannot build an APK. Before Android release, build and smoke-test the APK
on an Android/JDK/SDK worker and physical hardware: microphone allow/deny,
on-device language installation, mono/stereo direction, WebView speech support,
back gesture, lifecycle, safe areas, install/update, and offline restart.

The brief's four-person, 30-utterance study also remains unperformed. No current
evidence establishes the target of at least 80% correct speaker attribution.

## Re-verification order

1. Add `.factory/claims.json` and execute every listed test through the demo.
2. Build the isolated, seeded one-click demo and document it.
3. Put audience and primary demo action in the initial viewport.
4. Complete the required site structure, 404, metadata, and docs.
5. Repeat all clean gates and live identity checks, then complete APK/device and
   four-person attribution validation.
