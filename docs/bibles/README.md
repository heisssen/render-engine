# The bibles

House rules written for the channel the first episode was made for, copied here because the engine enforces them.
They are prose on purpose: a rule a human can argue with, which `en/timings.mjs` then turns into numbers.

| file | what it governs | where the code reads it |
|---|---|---|
| [documentary-editing-bible.md](documentary-editing-bible.md) | shot lengths, cutting on sentences, archive use, pace limits | the pace check and insert snapping in `en/timings.mjs` |
| [edit-bible.md](edit-bible.md) | transitions and their quotas, sound accents, what not to do | `transitions` in `en/timings.mjs`, `transitionStyle` in `src/en/Edit.tsx`, accents in `en/mix.py` |
| [motion-system.md](motion-system.md) | motion tokens (frames, curves, distances), how things arrive and leave | `src/en/motion.ts` |
| [writing-bible.md](writing-bible.md) | the narration and the companion long-read | the script, before any code runs |

Paths like `tools/...`, `runs/...` or `research/...` inside them point into the writers' room repo, which is not
part of this one. The rules stand without it.

"Jev" in these texts is the audience-panel model used to compare options by which one viewers would keep watching.
