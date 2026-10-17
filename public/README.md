# public/: the media root

Remotion serves this folder through `staticFile()`. Git only carries the small JSON manifests; every picture and
sound is yours to bring (and to credit). What EP01 expected to find here:

| path | what | made by |
|---|---|---|
| `clips/`, `clips/en/`, `clips/more/`, `clips/people/` | archival film as H.264 `.mp4`, 30 fps, `-g 30 -bf 0` | you + `scripts/reencode_clips.py` |
| `clips/people/people.json` | who is in each people clip, year, source, licence (committed) | you |
| `photos/en/` | archival photos (`.jpg`) named in `story.ts`, `inserts.json`, `backdrops.json` | you |
| `docs/memoirs/` | page scans named in `quotes.json` (committed, with its README) | you, from Internet Archive etc. |
| `music/NAME.mp3` + `music/.NAME.beats.json` | one bed per act and its beat grid (the grids are committed) | you + a beat tracker |
| `sfx/key.wav`, `sfx/stamp.wav` | typewriter key and rubber stamp for telegram and document cards | you |
| `fonts/` | self-hosted Google Fonts | `node scripts/fetch_fonts.mjs` |
| `relief_hypso.png`, `relief_shadow.png`, `relief_light.png` | map relief layers | `py -3.12 en/terrain.py` |
| `relief_baked.webp` | the three layers baked into one | `py -3.12 en/bake_relief.py` |
| `paper_texture.jpg` | aged paper the maps are printed on (any scan of blank old paper) | you |
| `parallax/` | optional 2.5D moves on real photos | `en/parallax.py` |
| `thumbs/`, `channel/` | thumbnail backgrounds and channel art (only for the Thumb and channel stills) | you |

Rights rule for anything you put here: public domain, CC BY or CC BY-SA, with the attribution written down in
`en/footage.md` before you forget where it came from.
