# Caption Lanes demo

## Entry point

Open <https://speaker-lane-captions.sociobot.in/demo>, add `?demo=1` to the home URL, or select **Try it with sample data**.

The first demo screen is the active caption room. It contains six captions from a realistic group planning a quiet Saturday lunch.

## Isolation

- Caption rows use the IndexedDB database `demo:caption-lanes`.
- Demo display settings use localStorage keys beginning with `demo:caption-lanes`.
- The demo never reads `caption-lanes`, `caption-lanes:preferences`, or a stored purchase license.
- The demo does not request microphone access or contact the billing API.
- Export and import operate only on the demo transcript while the banner is visible.

## Controls

**Reset demo** restores the six bundled captions and default display settings. **Start for real** waits for every `demo:caption-lanes*` database and browser-storage key to be deleted before setup opens.

If deletion is blocked, the demo stays open and names the recovery step. Closing the other Caption Lanes tab and selecting **Start for real** again completes deletion. Real transcripts, display settings, and `sb_license:speaker-lane-captions` are never cleared.

Opening Home, Privacy, or Terms from the demo also completes the same deletion before navigation. The demo blocks its checkout link until **Start for real** is selected.

Reloading `/demo` also restores the bundled sample. This keeps every verification run deterministic.

## Verification

Run:

```sh
npm run test:e2e -- --grep @claim:demo-isolation
```

The test seeds a real transcript, display setting, and Plus license first. Desktop and exact 390 × 844 runs prove that demo reads, writes, reset, blocked deletion, and each exit path do not change real data.
