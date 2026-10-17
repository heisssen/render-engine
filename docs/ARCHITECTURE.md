# Architecture

Three ideas hold the engine together:

1. **One beat per spoken paragraph.** The script, the voice manifest, `STORY` in `story.ts` and every per-beat JSON
   file are indexed the same way. Beat 37 is paragraph 37 is take `037_NARRATOR_xxxxxxxx.mp3`. Nothing else links them,
   so the count is checked at every step (`timings.mjs`, `Main.tsx`, `dub.py`) and a mismatch stops the build.
2. **The audio decides the time.** Picture lengths are never typed in. They come from the voice takes, and every cut
   inside a beat comes from where whisper heard a sentence begin.
3. **One planner, two consumers.** `en/timings.mjs` resolves everything into frames once and writes it twice:
   `src/en/timings.json` for the picture, `en/voice/placement.json` for the sound. The mix and the film cannot drift
   apart, because neither of them decides anything.

## Modules

| module | job |
|---|---|
| `en/voice.py` | script parser (`parse`), ElevenLabs client (`tts`), take cache by hash, `manifest.json` |
| `en/timings.mjs` | the planner: beat placement, inserts, pages, looks, labels, transitions, backdrops, overlays, pace report |
| `en/subs.py` | whisper (faster-whisper, CPU, int8, cached by audio hash), forced alignment of the known text, cue segmentation |
| `en/sentences.py` | sentence starts per beat, from the same aligned words |
| `en/mix.py` | voice placement, breaths, voice chain, beds, ducking, synthesized and sampled SFX, loudness |
| `en/dub.py`, `en/dub_subs.py` | dubbing into the English slots, subtitles timed on the dub |
| `en/translate_subs.py`, `en/subs_years.py` | translation through the Claude CLI, years back to digits |
| `tools/provenance.py` | per-asset SHA-256 ledger, licence gate, credits, `ledger_root` |
| `en/terrain.py`, `en/bake_relief.py` | map relief from elevation tiles, baked into one overlay |
| `src/en/index.tsx` | registers the compositions: `MainEN`, `IdentPreview`, `MapStills`, `MapSamples`, stills |
| `src/en/Main.tsx` | the film: resolves beats, lays sequences, overlays, sting, act breaks, end screen |
| `src/en/Edit.tsx` | transitions, archival inserts (`InsertView`), backdrops, tease, keywords |
| `src/en/Map.tsx` | the staff map: projection, camera, borders, relief, rivers, railways, layers, label collision |
| `src/en/Cards.tsx`, `Media.tsx`, `Page.tsx` | text cards, photos and film, quoted pages |
| `src/en/brand.tsx`, `Ident.tsx`, `theme.ts`, `motion.ts` | the example preset: brand kit, ident, palette, fonts, motion tokens |
| `src/en/geo.ts`, `rail1914.ts` | geodata loaders and the hand-curated 1914 railway network |

## How a frame is composed

```
Main
 ├─ for each beat r:  Sequence(from = r.from - OV, length = r.frames + OV)       OV = 10 frames of overlap
 │    └─ BeatView
 │         ├─ transitionStyle(enter = transitions[r.i], exit = transitions[r.i + 1])
 │         ├─ content, held back while an opening insert plays:
 │         │    map   → MapView (camera from `from` to `view`, layers by `at`) + caption, stat box, title
 │         │    photo → Photo (move, focus, mount, red-pencil circle)
 │         │    film  → Film (period grade, loops to clipFrames)
 │         │    card  → bg film or backdrop, film inserts *under* paper props, then the Card
 │         ├─ inserts of this beat, each in its own Sequence: full | window (pinned to the map) | print | page
 │         └─ ModeBadge (REAL HISTORY / OUR TIMELINE + year)
 ├─ flash frames, tease (flash-forward), keywords, chapter tag
 ├─ sting (the ident) after the cold open
 ├─ act breaks (60 frames, 20 before each later act)
 └─ end screen, seal
```

**Kinds.** A beat's kind (`k`) picks its renderer. `timings.mjs` reads the kinds straight out of `story.ts` with a
regex (so do `mix.py` and the telegram/stamp effects), which is why a beat must start a line with `{k: '...'`,
`ph(`, `film(` or `map(`. Crude, effective, and a good reason to keep `story.ts` formatted.

**Inserts.** Archival film or photos cut into a beat. The planner gives each a `look`:
`page` for a quoted page; `print` for a photo narrower than about 3:2 (shown whole as a print, never cropped);
`window` for film cut into the middle of a map (a framed window pinned to the latest arrow, city or note, projected
with that frame's map camera); `full` for everything else. An insert at the very start of a beat holds the beat's
own picture back, so a map's camera move and arrows start on the reveal. On paper props (telegram, document,
headline) and text cards (quote, big line), film inserts play *under* the card and the paper stays put.
A person's name label appears on their first film appearance only.

**Transitions.** One per cut, chosen in `timings.mjs` from what the cut joins: a plain cut by default; `match` when a
map cuts to an opening film insert (3 to 6 per film); `dissolve` map to map while the camera travels (at most 12);
`silence` at the story's switch points (the music drops out for a second, then a hard cut); one `flash`, one `whip`.
After the sting or an act break it is always a cut, since they already did the job.

**Overlays.** The tease (three flash-forward shots under the first 9 seconds), keywords timed to the word the
narrator says (moved off any insert they would land on), a chapter tag in the corner.

## Timing model

Times are seconds in the planner and frames (30 fps) in the output.

```
LEAD    0.6 s + TEASE (9 s)   before the first word
BREATH  1.0 s                 between paragraphs of the same speaker
SWAP    0.25 s                into and out of a character quote
SECTION +2.4 s                when the ## section changes
STING   195 frames            after the cold open, plus 0.2 s
ACT_GAP 0.9 s                 extra silence before each later act
TAIL    1.0 s, END 20 s, SEAL 4 s
TEMPO   x1.07                 applied to every take before measuring it (atempo, cached in en/voice/tempo/)
```

A beat runs from its voice start to the next beat's voice start, so the pause after a paragraph belongs to it, and
the sting and act gaps belong to the beat after them. The beat before the sting ends where the sting starts.

**Insert snapping.** An insert asks for a start (`at` seconds or `atf` fraction) and a length (`len`, default 5 s).
The start moves to the nearest sentence start within 2.5 s. The end moves to a sentence start between
`start + 3 s` and `want + 2.5 s`; failing that, to the nearest music beat within 20 frames, downbeats first. Every
beat keeps at least 2 s of its own picture at the end; an insert that cannot fit 3 s (1.5 s for a `burst`) is dropped.
`burst` inserts skip snapping entirely, for montage.

**Pages trim inserts.** A quoted page runs from sentence `sent` for `n` sentences. Film inserts of that beat that
overlap it are cut back to end at the page, or start after it (with `from_s` advanced to keep the footage in sync),
or are dropped if under 3 s would be left. The page always lies on top.

**Pace check.** For every beat the planner finds the longest stretch without a cut and compares it with the bible's
limit: 25 s on a map, 20 s on a photo, 12 s on film and cards, 6 s anywhere in the cold open. It prints the beats
over the limit, the average shot length, and a count of each transition type. It reports and never fixes anything
on its own: the fix is an insert, and choosing one is the editor's job.

## Audio model

```
voice  = takes at voiceAt (+ breaths)  →  VOICE_CHAIN (EQ, de-ess, compressor, a little room, soft clip)
music  = one bed per section, looped with 3 s crossfades, levelled to BED_DB = -15 dB under the voice's typical level
         × duck_gain(voice)            10 ms blocks, speech = within 22 dB of the voice level, 350 ms gaps held,
                                       120 ms look-ahead, 60 ms attack, 700 ms release, DUCK_DB = -10 dB
         × silence at `silence` cuts   out over 0.25 s, 1 s of nothing, back over 3 s
fx     = ident (hum, lever clunk, relays, bell, a click per sign letter, fly-in whoosh), act-break whoosh + clack,
         sparse accents on whip / match / flash / silence cuts, tease hits, typewriter keys on telegrams,
         a stamp on documents
mix    = voice + music + fx  →  loudnorm I=-14 LUFS, TP=-1.5, LRA=11, 48 kHz stereo
```

"Typical level" is the 70th percentile of 400 ms block RMS over the non-silent blocks: a loudness estimate that
ignores both the pauses and the shouting. The breaths exist because TTS never needs air and listeners notice.

**Dubs** reuse all of it. `dub.py` writes a placement with the same beats and frames and only the files, durations
and tempos changed, then calls `mix.py --placement` on it. Same music, same effects, same frame for every cut.

**Subtitles** never transcribe the words: the script is the truth, whisper only says when each word was spoken.
Cues are plain phrases, at most 42 characters by 2 lines, 1 to 6 s, broken at punctuation and clauses, names kept
together. Translations keep the English cue count and timings exactly.
