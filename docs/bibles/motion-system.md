# Switchyard motion system

One motion language for every episode. The code that implements it lives in each episode's Remotion project
(`src/en/motion.ts`); this file is the source of truth. Read it together with `edit-bible.md` (what to cut and when);
this file says how things move.

## 1. Character

Switchyard is a signal box: firm, mechanical, precise, a little dry. Things **arrive like a lever thrown**: fast
start, firm stop, no bounce, no wobble, no elastic overshoot. Nothing floats, spins or glows. The narrator is calm,
so the motion is calm too: one idea moves at a time.

## 2. Motifs (the only decorative motion we own)

| Motif | Meaning | Where |
|---|---|---|
| **Rail rule**: a red line drawing left to right | "a new piece of information is arriving" | before every lower-third, keyword, stat, caption; under titles |
| **Signal red** | our timeline, the switch, the thing that changed | `OUR TIMELINE` badge, alt-history arrows, keyword rule. Never decorative |
| **Ink / paper** | real history, documents | `REAL HISTORY` badge, maps, cards |
| **Split-flap board** | dates and places changing | act-break dates, end screen, ident |
| **Rubber stamp** | an official fact or verdict | documents ("CANCELLED", "WHAT IF") |
| **Prints on the desk** | archival photos | photos narrower than 3:2 are always whole, as a bordered print, slight tilt |

Rails belong to the identity only (logo, ident, banner, end screen). Inside episodes the brand is clarity, not
decoration. Jev, 2026-10-15 (runs/brand-packages-jev.json): the minimal package (badge + clean labels + silence at
switch points) beat every decorated one (56.5/78, first choice in 10 of 12 votes); the rail overlay came last (21).
Red-pencil notes, stamps, redaction bars and timeline bars are out.

Nothing else: no light leaks, film burns, grain, glitch, lens flares, particles, 3D spins, AI imagery.

**Built for an AI editor.** Every device is data an agent fills (overlays.json, inserts.json, backdrops.json): a
date, a word, a clip id. No episode needs new animation code.

## 3. Tokens (30 fps)

| Token | Frames | Use |
|---|---|---|
| `micro` | 6 | flash fade, stamp impact, small UI ticks |
| `short` | 10 | exits, cuts' overlap, window slide |
| `base` | 16 | standard entrance (labels, cards, stats) |
| `long` | 24 | rail rule draw, print drop, camera settle |
| `camera` | 30-75 | map camera glide (35% of the beat, capped) |
| `stagger` | 3 | between items of a list |
| `hold` | >= 45 | minimum time any text stays fully readable |

| Curve | Bezier | Use |
|---|---|---|
| `in` (arrive) | 0.16, 1, 0.3, 1 | everything entering: fast start, firm landing |
| `out` (leave) | 0.7, 0, 0.84, 0 | everything leaving: holds, then goes |
| `move` | 0.65, 0, 0.35, 1 | anything travelling across the frame: camera, windows, whip |
| `draw` | 0.33, 0, 0.2, 1 | lines drawing: rail rule, arrows, routes, pencil |

Distances: rise 36 px, slide 40 px, print drop 50 px, window slide 260 px. Tilts: prints +/-1.2 to 1.5 degrees,
pencil notes -5 to +4 degrees. Scale changes on entrances are allowed only for keywords (1.35 -> 1).

## 4. Choreography rules

1. **Rule first, text second.** A text element's red rail rule draws during its first `base`, the text arrives
   `micro` later. Leaving is the reverse, in `short`.
2. **One mover.** Besides the map camera, at most two things move at once. Text never enters while an arrow draws.
3. **Direction means time.** Movement left -> right is forward in time / our timeline; right -> left is going back
   to real history. Windows enter from the side away from their pin.
4. **Real vs ours.** Real-history elements are ink on paper; our-timeline elements carry signal red. The mode badge
   flips (scaleY) whenever the branch changes.
5. **Numbers count, dates flap.** Counts roll up over `long` + 6 after their card lands; years and dates on boards
   use the split-flap. Years are never counted.
6. **Everything is anchored.** Footage windows pin to their place on the map with a red thread; pencil notes point
   at what they joke about; labels sit bottom-left, stats bottom-right, the badge top-right, sources bottom-right.
7. **Safe areas.** 70 px side margins, 74 px bottom margin for captions/stats, 46 px top for the badge. Nothing
   important in the bottom-right 300x80 px (YouTube timestamp).
8. **Hold to read.** Every line of text stays fully visible at least `hold` frames (1.5 s) plus 0.25 s per word.

## 5. Element catalogue

| Element | Enter | Hold | Exit |
|---|---|---|---|
| Lower-third label (name · year) | rail rule `base` `draw`, then text slides 40 px `in` | while footage plays | cut with the shot |
| Map caption (title + subtitle) | same as label | whole map | cut |
| Stat card | rail border, rise 36 px `in`, number counts | to beat end | cut |
| Keyword (2-4 words) | band fades `micro`, text slams 1.35 -> 1 in `micro`, rule draws `base` | 1.4 s | fade `micro` |
| Archival print (photo) | drops 50 px `in` `long` with tilt, scene dims to 62% | insert length | cut |
| Footage window over a map | slides 260 px `move` `short`, red thread draws `short` to its pin | insert length | slides out 8 frames |
| Full-frame footage | hard cut, projector weave +/-1.5 px, exposure flicker 0.9-0.98 | insert length | cut |
| Card (telegram, document, quote) | rises 60-100 px `in` `long`; text types or lines stagger | per bible (<= 6 s static) | cut |
| Map arrows / fronts / routes | draw `draw`, arrows over >= 24 frames | stay | stay |
| Mode badge | flips scaleY 0.25 -> 1 in `base` on branch change | always | - |
| Switch point | music drops out 1 s, hard cut on a low hit; the keyword names what changed (Jev: 'what changed' text beat date stamps) | ~1.8 s | cut |
| Act break | rail sweep, split-flap date, music drop | ~2 s | - |

## 8. Channel ident (the intro after the cold open)

The only place inside an episode where the rails appear. Jev, 2026-10-15 (runs/ident-minimal-jev.json), all options
at the same 6 s: the signal box won (60.5/90), the freeze-and-branch variant was level (60); a departures board came
last (19). At different lengths a 1.5 s logo won, so length alone is not the reason; keep the box, keep it ~6.5 s.

- **Signal box, first person:** the episode's lever (tag = the year) is gripped and thrown, the wall diagram re-routes
  from the real direction to ours in signal red, SWITCHYARD lights letter by letter, the camera flies into the last
  red lamp and the story starts.
- **Data only:** `EPISODE.ident = {year, station, real, alt}` and the episode title. Nothing else changes per episode
  (EP02 example: `{year: '1453', station: 'CONSTANTINOPLE', real: 'FALLS', alt: 'HOLDS'}`).
- **System rules apply:** palette ink / rail grey / paper / signal red only (no brass); the lever stops dead, no
  overshoot; the title arrives as the channel lower-third (red rail rule, then the paper plate); sound = room hum,
  lever clunk, relays, one bell, letter clicks, whoosh into the story.

## 6. Transitions (from the edit bible)

Plain cuts >= 85%. Dissolves <= 12 (map to map). Match cuts 3-6 (map pushes into a place, cut to its film).
Switch points: exactly the story's turning points (EP01: 3), as silence + hard cut. One white flash, one whip-pan at most.

## 7. Sound for motion

Only marked moments get sound: keyword slam (low hit), switch point (music drop + low hit), flash (hit),
tease shots (hit). Labels, cards, windows and prints enter silently. Never a whoosh on every cut.
