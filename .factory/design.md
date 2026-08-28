# Caption Lanes visual thesis

## Direction: cinematic environmental art

Caption Lanes treats a tabletop conversation like a quiet night scene: one shared listening surface, with warm pools of speech arriving from distinct directions. The interface should feel attentive rather than clinical. It borrows the clarity of film blocking—left, centre, right—and the soft depth of a practical lamp in a dark room. Decoration must explain spatial speech or consent; nothing is ornamental filler.

The product is intentionally **single-mode, dark**. A controlled dark adaptation reduces glare across a table and lets the active lane read like light entering the room. Every surface is explicitly painted; it does not inherit device black.

## Palette

| Token | Value | Use |
| --- | --- | --- |
| Night | `#0C1110` | App background, like a dark room |
| Pine | `#15201D` | Raised controls and sheets |
| Fog | `#E9F1EC` | Primary copy (15.2:1 on Night) |
| Mist | `#AEBBB4` | Secondary copy (9.1:1 on Night) |
| Lantern | `#F2B96B` | Focus, listening, centre direction |
| Tide | `#73C8C3` | Left lane |
| Rose | `#E58F8B` | Right lane |
| Moss | `#A8C97F` | Success/ready |
| Ember | `#F1A071` | Warning |
| Signal red | `#FF8E88` | Errors |

Lane identity is always reinforced by its written direction, arrow glyph, position, and border treatment; color never carries meaning alone. The palette is taken from a dim green room, an amber table lamp, and reflected dusk—appropriate for a shared, low-distraction caption surface.

## Type and spacing

- **Interface:** `Arial`, `Helvetica Neue`, system sans-serif. It is neutral and widely available offline, avoiding a font payload.
- **Caption voice:** `Georgia`, `Times New Roman`, serif. Its broad, differentiated letterforms make utterances feel human and separate them from settings chrome.
- Scale: 12 / 14 / 16 / 20 / 26 / clamp(32–52) px. Body and controls never fall below 16 px; small all-caps text is supplemental only.
- Rhythm: 4 px base with 8, 12, 16, 24, 32 and 48 px steps. Caption lanes use large 20–28 px text and 1.35 line height.
- Reading measure: 46–68 characters. Touch targets are at least 44 × 44 px with 8 px separation.

## Layout and interaction grammar

The live room is the product. A slim status rail names the privacy state, then directional lanes fan across the viewport like film blocking marks. On a phone they stack in physical order: left, centre, right. An active utterance raises its lane by light and border—not scale—so text never moves while it is being read. Direction badges show a word, an arrow, and a confidence phrase. Users can rename the visible lane label, lock its color, hide uncertain captions, change caption size, pause, and export the transcript.

The setup gate establishes consent and explains microphone limits before requesting permission. Settings and the upgrade are bottom sheets with native-feeling back/Escape behavior. Empty, permission-denied, unsupported, paused, and offline states each name the state and offer a next action.

## Motion policy

- UI transitions last 180–240 ms and use opacity/translate only. A caption enters from the lane’s physical direction by 8 px, then rests.
- The listening indicator breathes once when recording starts; it does not loop.
- Sheets rise from the control that invoked them, preserving spatial continuity.
- Under `prefers-reduced-motion: reduce`, transitions become immediate opacity changes and all decorative motion is removed.

## Asset plan and provenance

One original cinematic environmental illustration will be generated for the consent/setup screen and social preview, then exported as responsive WebP. It depicts an empty round table and three distinct pools of colored light, making directional separation visible without pretending that the app identifies people. App icons and interface symbols are authored as simple SVG geometry in the repository.

### Prompt sheet

- **Use case:** stylized-concept
- **Subject/world:** an empty intimate round table viewed at seated eye level in a quiet dark room; three soft, clearly separated pools of light arriving from left, centre, and right; no people
- **Materials:** matte dark wood, subtle linen acoustic curtains, faint dust in light, restrained film grain
- **Light:** teal from left, warm amber from centre, muted coral from right; deep green-black shadows; gentle practical bloom
- **Lens/composition:** cinematic 35 mm, wide 3:2 crop, table low in frame, calm negative space above, symmetrical enough for legibility but not sterile
- **Palette words:** night pine, fog white, lantern amber, tidal teal, faded rose
- **Negative list:** no text, no captions, no UI, no logo, no watermark, no people, no faces, no microphones, no phones, no neon cyberpunk, no generic gradient, no brand symbols

**Generation record:** Azure OpenAI factory image deployment via `/opt/fleet/lib/gen-image.sh`; generated 2026-08-28. Final prompt is stored beside the source image in `assets/src/room-table.json`. Generated imagery is original for Caption Lanes and disclosed in the footer.
