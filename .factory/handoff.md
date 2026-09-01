# Caption Lanes — independent verification 9 handoff

Date: 2026-09-01 UTC

Candidate: `505b9c6ca44146db4946ab52c92a36a4323749e7`

Production: <https://speaker-lane-captions.sociobot.in/>

Verdict: **FAIL**

## Release decision

Do not release this candidate as the accepted Android product.

- The mandatory claims gate is 23/24. The exact `npm run test:android` claim
  command exits 1 because this verification worker has neither the declared
  JDK path nor an Android SDK. The acceptance contract makes this blocking.
- More importantly, the candidate's Android native-caption branch skips the
  stereo direction analyser and asks the user to place every caption manually.
  The native plugin emits text and confidence only. This does not satisfy the
  brief's core automatic left/centre/right Android job.

The deployed web artifact matches the candidate build and passed all other
tested gates.

## Verification summary

- `npm ci`: pass; 255 packages, 0 vulnerabilities.
- All 24 exact claim commands: 23 pass, Android claim fails.
- `npm test`: pass; 5 unit and 84 browser tests.
- `npm run lint`, `npm run typecheck`, `npm run build`: pass.
- `npm run test:live`: pass; every deployed artifact matches `dist/`.
- Capacitor sync and `npx cap doctor android`: pass; no APK could be built in
  this worker.
- First-read and one-click sample demo: pass at 1440 × 900 and 390 × 844.
- Independent normal, boundary, invalid-input, reset, export, privacy,
  keyboard, focus, touch-target, reduced-motion, axe, offline/update, caching,
  and response-header checks: pass.
- License endpoint allowance: 30 successful requests; request 31 returned 429
  with `Retry-After: 2`.
- Lighthouse mobile: 96 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.0 s, CLS 0.

## Next steps

1. Add Android on-device coarse direction with confidence and mono fallback;
   verify it through the packaged app rather than only a browser fixture.
2. Run the complete claims inventory on a clean Android SDK/JDK worker and
   retain both debug and Android-test APK outputs plus the instrumented result.
3. Repeat live identity, offline, privacy, accessibility, and performance
   checks after deployment.

Full evidence and exact findings are in
[`.factory/verification-9.md`](verification-9.md) and
`.factory/evidence/verification-9/`.

No product source was modified by this verification work order.
