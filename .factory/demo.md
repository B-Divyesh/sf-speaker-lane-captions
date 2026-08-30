# Caption Lanes demo

## Entry point

Open <https://speaker-lane-captions.sociobot.in/demo>, add `?demo=1` to the home URL, or select **Try it with sample data**.

The first demo screen is the active caption room. It contains six captions from a realistic group planning a quiet Saturday lunch.

## Isolation

- Caption rows use the IndexedDB database `demo:caption-lanes`.
- Demo display settings use the localStorage key `demo:caption-lanes:preferences`.
- The demo never reads `caption-lanes`, `caption-lanes:preferences`, or a stored purchase license.
- The demo does not request microphone access or contact the billing API.
- Export and import operate only on the demo transcript while the banner is visible.

## Controls

**Reset demo** restores the six bundled captions and default display settings. **Start for real** clears the demo database and settings before returning to consent setup.

Reloading `/demo` also restores the bundled sample. This keeps every verification run deterministic.

## Verification

Run:

```sh
npm run test:e2e -- --grep @claim:demo-isolation
```

The test seeds real caption data first. It then proves that demo reads, writes, reset, and exit do not change that real data.
