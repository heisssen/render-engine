# Changelog

All dates are 2026. The history before v0.1.0 is reconstructed from the production notes and file dates of the
first episode; it happened in one folder on one laptop, so "release" is a generous word for most of it.

## [Unreleased]

### Fixed
- CI: the secret scan runs the gitleaks CLI over the full history (the action failed on the first push).

## [0.2.0] - 2026-10-17

Provenance and security: the part that answers "where did this frame come from, and are we allowed to use it".

### Added
- `tools/provenance.py`: per-asset SHA-256 ledger of every file a render uses (clips, photos, page scans, backdrops,
  music, effects, voice takes, map textures), a licence gate (PD, PDM, CC0 pass; CC BY and BY-SA pass with an
  attribution line; NC, ND, rights-managed, unknown and missing files are blocked), `ledger_root`, `credits.txt`,
  `ledger.md`. Reads lineage sidecars (`<file>.source.json`), `--sources` JSON/CSV, `people.json`, `quotes.json`.
- `render_en.ps1 -Gate`: runs the gate before rendering and stops on a blocked asset. No licence, no render.
- `tests/test_provenance.py`: unit tests on a tiny fake project.
- CI (`.github/workflows/ci.yml`): Python compile and unit tests, Node syntax and import checks, gitleaks over the full
  history; CodeQL for Python and JavaScript/TypeScript (`codeql.yml`).
- `docs/threat-model.md`, `SECURITY.md` (private vulnerability reporting), `ADOPTERS.md`, a roadmap (C2PA Content
  Credentials with `ledger_root`, lineage sidecars for cut clips).
- `scripts/evidence_snapshot.py`: dated snapshot of repository traffic, stars, forks and release downloads into
  `evidence/` (gitignored).

### Fixed
- The PowerShell scripts create `out/` before resolving it, so they run on a fresh clone.

## [0.1.0] - 2026-10-17

First public release: the engine extracted from the EP01 production as a standalone repo.

### Added
- Repository packaging: README (English and Ukrainian), architecture notes, lessons, the four house bibles in
  `docs/bibles/`, a GitHub Pages index in `docs/`, CONTRIBUTING, CITATION.cff, MIT licence.
- `scripts/fetch_geo.mjs`: downloads the 1914 borders (historical-basemaps, GPL-3.0) instead of committing them.
- `scripts/check_imports.mjs`: checks that every relative import in `src/` resolves, without `npm install`.
- `.env.example`; `en/voice.py` reads `ELEVENLABS_API_KEY` and `NARRATOR_VOICE_ID` from the environment or `.env`.
- `BRAND` in `src/en/theme.ts`: the channel name drawn by the ident, sting and channel art is now one constant.
- `public/README.md`: which media the engine expects and where.

### Changed
- `render_en.ps1` takes `-Bundle` and `-Out`; the supervisor and battery guard find the repo from their own path.
- Cache folders (elevation tiles, translation sandbox) default to `out/cache`, or `RE_CACHE`.
- Package renamed to `render-engine`; `npm run studio` no longer needs the voice takes.

### Removed from the published tree
- All media (film, photos, scans, voice, music, SFX, fonts), renders, bundles and caches.
- One-off map patch scripts, the shelved three.js map, the Ukrainian-language pilot.

## EP01 production history (pre-release)

### 2026-10-17
- Quoted-page inserts: real memoir and newspaper pages with a highlighter over the quoted lines, every quote verified
  against its scan (`public/docs/memoirs/quotes.json`, `src/en/pages.json`, `Page.tsx`); pages trim film inserts.
- Render in one-minute parts (was five), `render_supervisor.ps1` for automatic restarts, `power_guard.ps1` to
  suspend work on low battery.
- Final script polish across the English script and the four dub scripts.

### 2026-10-16
- Narrator switched to the author's own cloned voice (its ID stays out of the repo); characters keep stock voices.
- Dubs: `dub.py` voices `uk`, `es`, `fr`, `pt` and fits every take into its English slot; `dub_subs.py` times
  subtitles on the dubs.
- `sentences.py`: sentence starts from whisper, and inserts in `timings.mjs` snap to them (documentary bible:
  cut on sentences), written that day. The pace check against its limits joins the timings report.
- `reencode_clips.py`: every clip to 30 fps, `-g 30 -bf 0`, after "No frame found at position" killed renders.
- `subs_years.py`: spoken years back to digits in the subtitles.
- Backdrops under card beats, the flash-forward tease, chapter tags; keywords switched off per the bible.

### 2026-10-15
- Script cut from 91 to 81 paragraphs after an audience-panel review; 26 paragraphs re-voiced, the rest reused by
  hash; `story.ts` rebuilt to 81 beats.
- The edit bible written; transitions planned by quota in `timings.mjs`.
- Motion system (`motion.ts`) and a longer ident (6.5 s).
- Map render speed from about 4.8 to 0.9 s per frame (screen clipping, baked relief, lighter coastlines);
  `bench_map.ps1` to measure it.
- Fonts self-hosted (`fetch_fonts.mjs`) after Google Fonts timeouts mid-render.
- A three.js 3D map was tried and shelved (3.5 min per half-resolution frame).
- Subtitles: forced alignment of the known script on whisper word timings, translation into ten languages through
  the Claude CLI.
- Resumable part rendering with the mix muxed by `-c:v copy`.

### 2026-10-13
- English remake started: research pack, 91-paragraph script, ElevenLabs v4 voices, `timings.mjs`, `mix.py`
  (beds per act, ducking, synthesized ident effects, -14 LUFS).
- Staff maps: Natural Earth coast, rivers and lakes, relief from elevation tiles, 1914 borders, a hand-curated 1914
  railway network of about 95 lines with junctions and a running locomotive, smooth fronts with teeth.
- Footage manifest with rights for every clip (`en/footage.md`); channel art, thumbnails, the signal-box ident.

### 2026-10-05
- The Ukrainian-language pilot of the same episode: the first Remotion version, with maps, cards and a mix.
  It is not part of this repo.
