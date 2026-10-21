---
description: Run this documentary editing workflow with scoped agents, model routing and incremental checks.
argument-hint: [desired edit, beat range, preview or final output]
---

Carry out this montage request: $ARGUMENTS

Use CLAUDE.md as the project contract. You are the Sonnet coordinator by project default.
If no outcome is specified, run the local preflight and summarize the current blockers first;
ask only for the missing creative goal. Do not invent a new film.

1. Inspect git status and run `py -3.12 scripts/montage_preflight.py`. It makes no model calls.
   Read its compact output; do not load all inputs to duplicate the checks.
   Record task scope, zero-based beat IDs, desired deliverable and inputs that actually exist.
2. Choose only necessary workers:
   - `project-scout` (Haiku): bounded discovery/log extraction when paths are unknown.
   - `edit-planner` (Sonnet): editorial/data/planner implementation.
   - `audio-pipeline` (Sonnet): audio/alignment/subtitles only if affected.
   - `asset-provenance` (Sonnet): source metadata and the licence gate.
   - `render-qa` (Sonnet): targeted preview, media verification, requested final render.
   - `edit-director` (Opus): only a difficult creative tradeoff, explicit deep review, or an
     unresolved cross-stage problem after two focused Sonnet attempts. One concise brief.
   For a tiny edit, work directly instead of paying agent startup overhead.
3. Give each worker an outcome, exact files/beat range, write ownership, relevant evidence,
   existing user authorization and acceptance check. Do not forward the full transcript.
   Invoke the named agent with its configured model; do not override everything to the parent
   model. Do not spawn a full team by default. At most two independent workers at once.
   Run shared-output writers serially; only the coordinator schedules other agents.
4. Follow the dependency graph. Visual-only changes reuse voice/alignment. Narration changes
   require voice -> timings -> subs -> sentences -> timings -> subs_years -> mix.
   Invalidate the affected downstream outputs; don't rerun unaffected stages or all languages.
   Never hand-edit generated timing files; preserve script/manifest/STORY beat correspondence.
5. Implement the edit, run relevant checks and inspect the pace report. If assets are missing,
   complete useful data/code work and report exact blockers; don't render placeholder success.
   For previews, specify the changed cuts and frame range. For a requested full render, verify
   the provenance gate, fresh bundle and safe parts reuse before invoking it with `-Gate`.
   A fresh bundle does not invalidate `out/en/parts`; archive incompatible parts only after
   verifying the resolved paths stay in this project and no render is active.
6. Verify outputs independently of DONE logs/file existence. Report command exit status,
   available ffprobe/visual/audio checks, output paths and unverified limitations.
   Keep ongoing state in `out/montage-state.md` when the task spans stages:
   scope, affected beats, changed inputs, completed commands/results, bundle/parts identity,
   next dependency and blockers (no script dump or credentials).
   On resume, recheck current inputs and outputs; a prior state note is not proof of freshness.

Do not use permission bypass flags. Perform paid generation or a long full render only when
that output is part of the user's task, honoring authorization already given.
Subagents do not reduce rendering compute; savings come from bounded context, appropriate
models, caches and skipped unchanged stages. Do not promise a percentage without measurement.
