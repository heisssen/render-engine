# Render engine: project instructions

Documentary pipeline: Python audio/alignment, Node timing planner, Remotion picture, PowerShell rendering.
Node 20+, Python 3.12, ffmpeg/ffprobe; Windows is the supported production workflow.
Start with the requested outcome, `git status --short`, and a narrow file search.
Do not load the whole repository to understand one task.

## Specialist routing

Project agents live in `.claude/agents/`; load only the specialist relevant to the task.
`.claude/settings.json` selects Sonnet for the main session; agent frontmatter selects each specialist's model.

| Agent | Model | Scope |
| --- | --- | --- |
| `project-scout` | Haiku | Read-only prerequisite inventory and narrow fact collection |
| `edit-planner` | Sonnet | Beat/story data, inserts/pages/overlays, pacing, `en/timings.mjs` |
| `audio-pipeline` | Sonnet | Voice, alignment, subtitles, sentence boundaries, mixing and dubbing |
| `asset-provenance` | Sonnet | Media availability, source/licence judgment, provenance gate |
| `render-qa` | Sonnet | Remotion components, bundling, preview, render and output inspection |
| `edit-director` | Opus | Read-only escalation for difficult creative/architectural decisions |

Use one specialist for a focused task. This project workflow permits at most two independent workers at once.
Give each explicit file ownership; dependent pipeline stages and shared-output writers stay sequential.
Delegate the objective, relevant paths/beat indices, allowed writes, acceptance checks, and authorization limits.
Return findings/changes, verification, blockers, and the next action in at most 12 bullets; no copied file dumps.
The coordinator owns integration and the final report. Agents do not start automatically on file creation.
Use `/montage <task>` for the project command in `.claude/commands/montage.md`.
Use Opus only when ambiguity/complexity warrants escalation; return implementation to the appropriate Sonnet agent.
See `docs/AGENT_WORKFLOW.md` only when coordinating a multi-stage edit.

## Context discipline

- Prefer `rg -n` scoped to files/symbols, bounded excerpts, and parsed JSON summaries.
- Read `docs/ARCHITECTURE.md` for cross-module changes, not for every small edit.
- Read only relevant bible sections: `docs/bibles/documentary-editing-bible.md` for cut rules,
  `edit-bible.md` for editing language, `motion-system.md` for motion, `writing-bible.md` for narration.
- Do not preload `package-lock.json`, geodata, all `src/en/*.json`, manuscripts, transcripts, media, or render logs.
  Select specific beats/keys and log tails. Never print `.env` or credentials.
- Reuse verified findings and cached takes/alignment. Do not rerun successful checks without a relevant change.

## Invariants

- One spoken paragraph = one manifest entry = one STORY beat, in the same order.
- Audio determines timing; `en/timings.mjs` writes both `src/en/timings.json` and `en/voice/placement.json`.
  Keep these outputs consistent; do not independently hand-adjust picture and audio timing.
- Story parsers depend on line-leading `{k: '...'`, `ph(`, `film(`, or `map(`; preserve their format.
- Timing rules and `docs/bibles/` must agree when planner enforcement changes.
- Use real, credited source media; no generated example/test images, film grain, Russian dubs or subtitle targets.
- Do not commit media, renders, credentials, private voice IDs, or machine-specific absolute paths.

## Pipeline and scope

After narration changes, the normal sequence is:
`voice.py` -> `timings.mjs` -> `subs.py` -> `sentences.py` -> `timings.mjs` -> `subs_years.py` -> `mix.py` -> provenance -> bundle/render.
All Python pipeline scripts above are under `en/`; provenance is `tools/provenance.py`.
The initial timing pass places voice; the second snaps cuts to aligned sentence boundaries.
For visual-only edits, reuse audio and alignment; rerun the planner only if its inputs changed.
For timing changes, refresh downstream mix/subtitle placement as needed before presenting a final output.
Media is not included in a fresh clone; distinguish missing inputs from software failures.

A general review authorizes local inspection, fixes, and cheap checks, not paid generation or a full film render.
Run paid TTS/translation or production rendering when the user's task explicitly includes that work.
Honor authorization already given; do not repeatedly ask for it.
`voice.py --only N` forces that take but also generates other missing takes and removes stale MP3s; inspect cache first.
Keep render concurrency bounded and do not launch supervisor/battery-guard helpers by default.
Use a fresh bundle after source/data changes. Inspect existing `out/en/parts` before rendering:
the renderer skips existing parts even with a different bundle; a new bundle alone cannot invalidate them.
Preserve existing outputs until their ownership and safe archive/reuse plan are clear.
Run production renders with the provenance gate; never substitute `--report-only` or `--no-hash` for a final gate.

## Verification

Start with the checks relevant to changed files:

- Compact read-only prerequisites: `py -3.12 scripts/montage_preflight.py`; use `--require-ready` for readiness gating.
- Imports, no dependency install: `node scripts/check_imports.mjs`.
- Node script syntax: `node --check en/timings.mjs` (substitute each changed `.mjs`).
- Python tests: `py -3.12 -m unittest discover tests -v`.
- Python syntax: `py -3.12 -m py_compile <changed-file.py>`; use explicit paths in PowerShell.
- Imports and TypeScript, after dependencies/fetched inputs exist: `npm.cmd run check`.
- Bundle when required: `npm.cmd run bundle`.
- Final provenance: `py -3.12 tools/provenance.py --project . --lang en`.
- Requested full render: `powershell -File scripts/render_en.ps1 -Gate -Bundle out/bundle`.

CI checks Python compilation/tests, Node script syntax/imports, and secrets; it currently does not run TypeScript.
Do not claim a render or perceptual review passed from static checks alone.
