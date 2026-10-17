---
title: render-engine
---

# render-engine

A config-driven documentary render engine: **Remotion + ElevenLabs + whisper + ffmpeg**. It turns a written script
into a finished 25-minute documentary with animated maps, archival footage, quoted pages, a mixed soundtrack, dubs
and subtitles, and renders it in a way that survives the laptop running out of battery.

[Source on GitHub](https://github.com/heisssen/render-engine) · MIT licence · v0.2.0 · by Bohdan Oximets
(heisssen) · built for one channel, works on Windows, expect rough edges.

## The idea in one paragraph

Everything is indexed by paragraph. Each spoken paragraph of the script is one voice take and one visual beat. The
voice decides the time; whisper finds every sentence inside every take; a planner turns a prose editing bible into
frame numbers (cuts on sentence boundaries, rationed transitions, maximum shot lengths) and grades its own result.
The picture and the sound read the same plan, so they cannot drift apart, and a dub is just another soundtrack
fitted into the same slots.

## What is novel

1. **Sentence-snapped editing from a written bible, with an automatic pace check.** The rules are prose; the
   planner enforces them and reports every beat that breaks a limit.
2. **Quoted-page inserts verified against scans.** The real printed page appears with a highlighter over the exact
   lines, each quote checked word for word against the scan and boxed in image pixels.
3. **Dub fitting into the original timing slots.** Each translated take is sped up only as much as its English slot
   requires, so one picture carries five soundtracks.
4. **Resumable minute-part rendering with a power and battery guard.** A crash or a dead battery costs at most one
   minute of rendering; a supervisor restarts the job and a guard freezes it before the battery dies.

5. **A per-asset provenance ledger with a licence gate.** Every file gets a SHA-256, a source and a licence;
   unusable licences stop the render, and one `ledger_root` hash lets anyone check a published film against it.

## Read next

- [README](https://github.com/heisssen/render-engine#readme): pipeline diagram, quickstart, command reference, data formats
- [Architecture](ARCHITECTURE.md): how a frame is composed, the timing model, the audio model
- [Lessons](LESSONS.md): what went wrong in October 2026 and what the code does about it
- [Threat model](threat-model.md): assets, trust boundaries, threats and mitigations
- The bibles: [documentary editing](bibles/documentary-editing-bible.md), [edit](bibles/edit-bible.md),
  [motion](bibles/motion-system.md), [writing](bibles/writing-bible.md)
- [Changelog](https://github.com/heisssen/render-engine/blob/main/CHANGELOG.md)
