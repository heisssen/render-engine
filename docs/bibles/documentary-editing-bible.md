# Switchyard Documentary Editing Bible

Version 1.0, 2026-10-16. Scope: every 20-25 min Switchyard episode. One calm narrator, real archival newsreel and photos (1900-1940), animated staff-style maps, a few text cards (telegrams, documents, quotes).

This document sits **above** `docs/edit-bible.md`. That file keeps its hard rules (no AI imagery, no grain, no Russian, real archive only, source lines) and its asset-level details. Where the two disagree on **rhythm**, this file wins. Section 12 lists the differences.

---

## 0. Why the last two cuts felt wrong

| Cut | What happened | Root cause |
|---|---|---|
| v1 "too static" | Maps held ~20 s | Nothing **changed** inside the hold. The cut rate was low, but so was the change rate. |
| v2 "choppy, cheap" | New picture every 4-5 s, inserts every ~10 s, kinetic words | The **cut** rate was raised to fix a **change**-rate problem. At 120-140 wpm, a 4-5 s picture lands mid-sentence, so the picture argues with the voice. Archival film was chopped before its action finished. |
| Ukrainian cut (owner's favourite) | One scene per narration paragraph (70 scenes in 15.4 min, mean 13.2 s, median 13.5 s, range 3.8-24.4 s), but each map scene revealed a new layer every few seconds and often opened with 2-7 s of real film | Low cut rate and a steady change rate. That is how documentaries are built. |

**The core rule of this bible: separate the two clocks.**
- **Cut clock:** how often the shot changes. Keep it slow, tied to the sentence and the paragraph.
- **Change clock:** how often something new reaches the eye (an arrow draws on, a photo move arrives at a face, a train pulls out inside the shot, a line gets highlighted). Keep it steady, every 3-6 s.

Retention needs the change clock. The documentary feel needs the cut clock. The v2 cut ran the cut clock at change-clock speed.

---

## 1. Principles (with sources)

1. **Emotion first, rhythm third.** Murch weights a cut as emotion 51%, story 23%, rhythm 10%, eye-trace 7%, 2D plane 5%, 3D space 4%. A cut that is "on the beat" but breaks a feeling is wrong. *(Murch, In the Blink of an Eye; UT wiki and No Film School summaries.)*
2. **Cut when a thought completes.** Murch compares the cut to a blink: it comes at the end of an idea. For us the idea is the narrator's **sentence**, sometimes the paragraph. It is never the phrase. *(Murch.)*
3. **Rhythm comes in three kinds.** Pearlman separates physical rhythm (movement in image and sound), emotional rhythm (the rise and fall of feeling) and event rhythm (story beats). Choppy cuts are what you get when physical rhythm is driven by a stopwatch instead of by events and emotion. *(Pearlman, Cutting Rhythms, ch. 5-8.)*
4. **Duration makes meaning.** Burns fought for a 33-second zoom into Roebling's portrait and concluded that meaning accrues over duration. Every photo is a master shot with a chosen first and last frame. *(Burns, CineD interview.)*
5. **Archive is evidence, not wallpaper.** Grubin warns against putting footage up and just talking over it. Lampson calls wallpaper B-roll the curse of archival films. Every shot should prove, contrast with or reframe the line it sits under. *(IDA Documentary magazine; Sundance "Contemplating the Cut".)*
6. **Let real footage run.** Todd Douglas Miller kept the 16 mm lunar-landing film as one unbroken shot and warned how easy it is to over-edit such material. He built Apollo 11 as nine modular sequences, each around one risky manoeuvre. *(ProVideo Coalition, Art of the Cut.)*
7. **Sound animates the past.** Burns layers effects, period music and voices under stills so the viewer feels present. Battle scenes in The American Revolution run up to ~150 audio tracks, and The War used 48-track effects sessions. Burns calls silence the most effective tool, especially after explosions. *(CineD; Mix magazine on The War.)* Jackson's They Shall Not Grow Old added foley, recorded period weapons and lip-read voices to silent film. The World at War recorded the actual armaments shown. *(Wikipedia; museum.tv.)*
8. **Save the big change.** They Shall Not Grow Old runs about 25 min in small-frame, silent black and white. Only when the men reach the front does the frame widen into colour and sound, and audiences gasped. A device used once, at the right moment, beats a device used every minute. *(Criterion; WBUR review.)*
9. **Music is structure, not sauce.** Burns records music early and gives it equal weight. Ashokan Farewell recurs ~25 times across 690 min. Miller cut Apollo 11 on top of long Moog cues, with a rhythm guide track at the bottom of the timeline. *(IDA; Wikipedia; ProVideo Coalition.)*
10. **Archive-only films still need a voice.** Kapadia (Senna, Amy, editor Chris King) never shows interviewees. Their audio runs over archive, because cutting to a talking head reminds viewers that a filmmaker exists. Our narrator plays the same role: the voice carries, the picture witnesses. *(RogerEbert.com; ayrton-senna.net archive masterclass.)*
11. **Teach the grammar early and keep it.** The opening sets the film's rules: what red means, how cards look. *(Sundance panel, Chyld King.)*

---

## 2. Retention levers: script or edit?

Most retention belongs to the **story**. The edit only delivers it.

| Lever | Owner | How we do it |
|---|---|---|
| Promise of the thumbnail proved in the first 30-60 s | Script | Central question by 0:20. Strongest real image and claim in the first 5 s. YouTube's Intro metric is the share still watching at 30 s, and ≥50% counts as above typical *(YouTube Help)*. |
| Open loops (a question asked now, answered later) | Script | At least one loop always open. Each act ends by opening the next loop. This is information-gap curiosity, not a cutting trick. |
| Re-hooks every ~2.5-4 min | Script | Reversal, new question, primary-source quote. The house research cites MrBeast's handbook: re-engagement at ~3 and ~6 min. |
| Stakes on people, not arrows | Script | A named person per sequence (Moltke, von Staabs, Lichnowsky). |
| Clarity (the viewer always knows where and when) | Script + edit | Map orientation shots, date stamps, lower-thirds. |
| Contrast of tempo (calm scenes vs montage bursts) | Edit | §4 and §5. Bursts are cut to music. |
| Steady change clock (something new every 3-6 s) | Edit | Map reveals, photo moves that arrive, in-shot action. Usually **not** new cuts. |
| Sound design (presence, silence, accents) | Edit | §9. |
| Act/chapter orientation | Edit | Corner chapter tag + act-break device (§7). |
| Kinetic words, whooshes, flashes, zoom punches | Neither | These are the "cheap" signals (§10). They raise the change clock artificially and spend authority. |

When a passage drags, **fix the script first** (cut a sentence, sharpen the question). Only then fix the picture.

---

## 3. Key numbers we found

Published average shot lengths (ASL) for Ken Burns, The World at War, They Shall Not Grow Old and Apollo 11 **could not be found** (Cinemetrics has no public entries for them that we could reach). Use these instead:

| Data point | Value | Source |
|---|---|---|
| Apocalypse (France 2 / CC&C) | ~700 colourised shots per ~52-min episode, so **ASL ≈ 4.5 s**. All-film, punchy narration, the fast end of archival TV. | France Télévisions press kit |
| Documentaries in Cinemetrics, 1997-2016 | Avg **491 shots per film**, the fewest of any genre. At a 90-100 min runtime that is **ASL ≈ 11-12 s** (our derivation; includes observational docs). | Stephen Follows, from Cinemetrics |
| Feature films 1990-2015 | ASL ≈ 4.3 s (action ≈ 4 s) | Stephen Follows |
| The Civil War (Burns) | 690 min, ~16,000 images in the film per Wikipedia (other sources say ~3,000 used of 16,000 shot) | Wikipedia; secondary sources |
| Burns longest move | 33 s zoom on one portrait | CineD |
| Documentary narration pace | 120-140 wpm, so a 15-20-word sentence takes **7-9 s** | voice-over planning guides |
| Our Ukrainian cut | 70 scenes in 924 s: mean 13.2 s, median 13.5 s, archival opener 2-7 s inside map scenes | the Ukrainian-language pilot (not in this repo) |
| They Shall Not Grow Old | 100 h of IWM film, 600 h of interviews (120 veterans used), footage re-timed per shot (some at ~13 fps) to 24 fps | Wikipedia; Inquirer |
| Apollo 11 | 9 modular sequences; ~11,000 h of Apollo 11 audio | ProVideo Coalition |

**Reading the numbers.** Archival television runs between the Apocalypse end (ASL ~4.5 s, film-heavy, high energy) and the Burns/feature-doc end (ASL ~10-15 s, stills and long holds). A narrated, map-heavy history film with calm authority sits at **ASL 6-10 s, with a change every 3-6 s**. Our v2 cut ran at ~4-5 s with stills and maps. That is Apocalypse speed without Apocalypse's all-motion footage, which is why it felt cheap.

---

## 4. Target rhythm by part of the film

"Cut" means a shot change. "Change" means any new visual information, a cut included. Ranges, not points.

| Part | Avg cut (ASL) | Change every | Notes |
|---|---|---|---|
| Cold open 0:00-0:30 | 3-5 s | 2-4 s | Real film with action in every shot. The strongest claim lands in the first 5 s. No kinetic type. |
| Cold open 0:30-1:15 | 4-7 s | 3-5 s | State the question by 0:20 and the "what we'll find" by ~0:45. End on a held image and the sting. |
| Act bodies (narrated sequences) | **6-10 s** | **3-6 s** | One shot per sentence is the default, two sentences for maps or a hero photo. |
| Map runs | one map stage 10-25 s | 3-5 s (one new element per sentence or clause) | Open with 3-5 s of real film of the subject. Never unchanged > 5 s. |
| Montage bursts (mobilisation, the night of 31 July, a battle opening) | 1.5-3 s for 15-40 s | each cut | 1-2 per act, cut to musical phrases, little or no narration. Then a breath. |
| Breaths (end of a paragraph) | hold 2-4 s past the narration | natural sound | Every 1-3 min. The footage keeps playing under music and effects. |
| Big breath (act turn, a death, the switch) | 6-15 s | a slow move or footage action | 1 per act. Silence or one sustained cue. |
| Hero photo | 12-20 s with one continuous move | the move arrives at a new subject every 4-6 s | ≤ 2 per act. Burns's 33 s is the outer limit. |
| Ending (last 60-90 s) | 8-12 s, slowing | 4-8 s | Answer the opening question. Final image held 6-10 s. |

**Episode totals (22 min):** about **150-220 cuts** and **300-450 change events**. Fewer than 130 cuts means it is probably sitting on maps. More than 260 cuts means it is cutting for its own sake.

---

## 5. The visual paragraph

A **visual paragraph** is the unit of the edit: one narration paragraph (3-6 sentences, 25-60 s) equals one scene of **3-6 shots that belong together** (same place, same subject, or same argument), then a breath. Pearlman calls this phrasing. Murch's index cards and Apollo 11's modules are the same idea at larger scale.

**Default shape:**
1. **Establish (3-8 s).** Real film or a wide photo of the subject, playing in real time. The narrator's first sentence starts over it. A J-cut of the scene's sound starts ~0.5-1 s before the picture.
2. **Develop (2-4 shots, 6-12 s each).** One shot per sentence: map stage, document, faces. Each shot carries one internal change (an arrow draws on, a push arrives at the eyes, a line highlights).
3. **Land (5-10 s).** The paragraph's last sentence sits on its strongest image: a face, a document line, the decisive map stage.
4. **Breathe (2-4 s).** Narration stops. Picture and natural sound continue, and the music phrase resolves. Then cut or slow dissolve into the next paragraph.

**Rules:**
- Do not mix places within a paragraph unless the sentence makes the jump ("Meanwhile in London…").
- One map per paragraph at most, and it may span 2-3 sentences.
- The cut lands on a sentence boundary (or a strong comma pause). Never mid-word, and never mid-phrase unless it is a burst.
- Montage bursts are a paragraph type of their own: the narration drops out or shrinks to a line, and music carries.
- The Ukrainian cut followed this model: one beat per paragraph, film first, then the map revealing its layers.

---

## 6. Rules by asset

### 6.1 Archival film
- **Real time, natural speed.** Conform hand-cranked footage (~13-18 fps) per shot to natural motion by frame duplication. Never AI interpolation (hard rule).
- **Minimum length 3 s; normal 4-8 s; let a complete action finish** (a train pulls out, a man turns to camera). The 1-2 s flash is allowed only inside a montage burst.
- **Enter in motion, leave after the action resolves or at its peak.** Do not cut the gesture in half.
- **No visible loops.** If a clip is shorter than its scene, cut to a second clip of the same subject or end on a freeze held < 1 s. Never `<Loop>` a clip the eye can recognise. The Ukrainian cut looped background film under cards, so fix that.
- **Grade gently and consistently.** Balance exposure, deflicker and stabilise. One mild warm-neutral tone per episode is fine. No heavy sepia, no grain, no scratches (hard rule).
- **No label overlays** like "ARCHIVAL FOOTAGE" on every clip. Put a small source line on first use only.
- Don't push the same footage twice in one episode unless it returns as a deliberate motif.

### 6.2 Photos
- Every photo moves, slowly. Push to emphasise, pull back to reveal context, pan along a line. Choose the first and last frame on purpose (Burns).
- **Holds:** 6-10 s normal, 12-20 s for a hero photo. Under 5 s only in bursts.
- Move speed: ≤ 10-15% scale change over 10 s. The move should **arrive** somewhere (a face, a sign) as the narration names it.
- Sound under every photo: the room tone of the scene (station, crowd, wind), very low.
- No 2.5D parallax as a default (Jev, edit-bible §3.3).

### 6.3 Maps
- **Maps orient. They are not wallpaper.** Use one when the viewer needs *where* or *what moved*. Target ≤ 30-35% of screen time across the episode. Everything else is real people and places.
- **Open each map scene with 3-5 s of real film** of the thing the map is about (Ukrainian cut; Jev Q1 tied this with intercutting).
- **One new element per sentence or clause**: rail line, arrow, label, date. Something changes every 3-5 s. Camera drift is slow, and a push or zoom-through happens only to change scale.
- A map stage lasts 10-25 s. If a map story runs longer, break it with one real film or photo shot (6-10 s) and return to the same map, advanced.
- Keep the colour grammar fixed for the whole episode (edit-bible §3.1).

### 6.4 Document, telegram and quote cards
- Treat a document as an **object**: a real scan or a period form, with a slow push of 6-12 s and **one** highlighted line, synced to the narrator reading it.
- The best treatment is the key line over real film of the place or person (Jev #1, edit-bible §3.5). Background film under a card must play **forward and unlooped**.
- Type-on is allowed for telegrams. Keep the key sound (a soft key click) sparse and mixed low.
- One card holds for 12 s at most. Never chain more than 2 cards in a row.

---

## 7. Transitions and chapter marking

- **Cuts ≥ 85%.** Use slow dissolves (0.5-1.5 s) between paragraphs for time passing, or place → map. The Ukrainian 9-frame fade-in per scene was soft and acceptable; prefer clean cuts inside a paragraph.
- **Match cuts on shape:** 3-6 per episode, planned.
- **What top docs avoid:** whip pans, light leaks, zoom punches on cuts, flashes, glitch, film burns. Burns, Isaacs and Kapadia use none of these. The edit-bible limits stay (flash ≤ 1, whip ≤ 1, leak 0).
- **Chapter tag:** a small persistent corner tag ("03 · The Point of Divergence"), fading in at a chapter start. Jev ranks it first: corner tag 33 > 2 s full card + tag 25.5 > no marker 19.5 (/54). The owner's favourite Ukrainian cut used it.
- **Full-screen chapter title:** only at the 2-3 act breaks, ≤ 2 s, over moving footage, plus a stinger. Never on every chapter.

---

## 8. Narration and picture sync

- **The picture changes at a sentence boundary**, ideally in the 0.2-0.5 s pause after the full stop. Within a sentence, change **inside** the shot (a reveal or a move), not with a cut.
- **J-cuts:** the next scene's sound arrives 0.5-1.5 s before its picture. **L-cuts:** the outgoing sound carries over the new picture.
- **Hold over pauses.** When the narrator pauses (ElevenLabs paragraph break, a dramatic beat), the picture holds. Never cut into silence.
- **Literal by default, associative at the end.** The picture shows what the sentence names (edit-bible §4). The paragraph's last line may sit on an associative image (an empty platform) to let it resonate.
- **Don't illustrate every noun.** One sentence gets one image, chosen for the sentence's main claim.
- **Leave space in the script:** 2-4 s gaps between paragraphs in the voice track. They are cheap to cut later and impossible to add.

---

## 9. Sound

1. **Natural sound under all archival film**, and room tone under photos. Mix it ~15-25 dB under the voice and let it rise in breaths. Keep it period-correct: steam, iron wheels, crowds, horses, boots. Never modern, never comic.
2. **Accents, not wallpaper:** 1-3 meaningful effects per map scene (a rail clank as lines draw on, a telegraph click on the date). No whoosh on every move. The Ukrainian cut did this at low volume (0.12), which is the most it should ever be.
3. **Music phrasing:** one cue per act or chapter group. Cue changes enter as J-cuts. Cuts in bursts land on downbeats and phrase ends (`tt sync --longform`). Narrated scenes don't cut to the beat; they cut to sentences, and the music phrase should *resolve* in the breath.
4. **Silence:** 0.5-2 s after a reveal or before an act turn, with natural sound alone. Burns calls silence his strongest tool. Never leave more than 2 s of total dead air with no picture motion.
5. **Recurring motif:** one short theme, or one sound such as the rail-switch clunk, returns at each "switch" moment. Burns brought Ashokan Farewell back ~25 times.
6. **Voice clarity wins every conflict.** Duck the music to −20 to −25 dB under narration.

---

## 10. The "cheap YouTube" signals (avoid)

- Cutting every 3-5 s through stills and maps in narrated passages.
- 1-2 s inserts dropped into the middle of a sentence or a map scene.
- Kinetic words slamming onto the screen, karaoke or word-pop captions.
- A whoosh, riser or boom on routine cuts. Zoom punches on beats.
- Overlays everywhere: labels on every clip, frames, borders, grain, light leaks, a "breaking news" look.
- Archival film chopped mid-action, sped up, or looped.
- The same push-in speed on every photo, with no destination.
- Music cut so the voice and the beat fight.
- Every chapter given a big title card.

---

## 11. What the Ukrainian cut did right (and what to fix)

**Keep:**
- One scene per narration paragraph (mean ~13 s), with layers revealed inside it.
- Real film opening each map scene (2-7 s, fading out by ~45% of the scene).
- Film running under quote and telegram cards.
- A small persistent chapter tag.
- One music bed per chapter, with ~1.5 s crossfades.
- Sparse low SFX: key clicks, stamp, map moves.

**Fix:**
- Background film looped under long cards (`<Loop>` in `Bg`).
- Heavy sepia filter.
- An "АРХІВНА ХРОНІКА" label on every clip.
- A boom at every chapter start (reserve it for act breaks).
- A whoosh on every map move. Make it optional and rarer.
- Grain added in post. That is banned (edit-bible §7).

---

## 12. How this differs from `docs/edit-bible.md`

| Topic | edit-bible.md | This bible |
|---|---|---|
| Pacing metric | One number: "visual change" 4-8 s, avg ~5.5 s, 230-330 events | **Two clocks.** Cuts: ASL 6-10 s, 150-220 per episode. Changes: every 3-6 s, 300-450 per episode. |
| Static limit | No static frame > 6 s | Unchanged frame ≤ 5 s, but a **moving** photo or animating map may hold 10-25 s. |
| Archival film length | 2-6 s, leave before the action resolves; 1-2 s flashes inside map runs | 3-8 s (min 3 s), let the action complete. Flashes only in bursts. |
| Inserts in map runs | Insert every ~12-15 s | Open with film. Break only maps over ~25 s, with a 6-10 s real shot, never a flash. |
| Breathing holds | Max 2 per act, 6-10 s | Small breaths (2-4 s) every 1-3 min, plus 1 big breath per act. |
| Bursts | Every 2.5-4 min | 1-2 per act, cut to music, followed by a breath. |
| Unit of edit | The shot | The **visual paragraph** (3-6 shots, then a breath). |
| Cut point | Phrase end or stressed word | **Sentence** boundary. Phrase cuts only in bursts. |
| Chapter marking | No chapter cards | Small corner chapter tag allowed and preferred (Jev). Full-screen title only at act breaks, ≤ 2 s. |
| Retention levers | Mixed into the edit | Explicitly split: script owns hooks, loops and re-hooks; the edit owns tempo contrast, change clock and sound. |
| Unchanged | Hard rules, B-roll table, transitions limits, lower-thirds, source lines, music levels | Same. |

---

## 13. Editor-agent checklist

**Script gate (before any cut)**
- [ ] Question by 0:20, promise proven by 0:60, one open loop at all times, re-hook every 2.5-4 min.
- [ ] Narration split into paragraphs of 25-60 s, with 2-4 s gaps in the voice track.

**Rhythm (compute from the timeline)**
- [ ] Body ASL 6-10 s, cold-open ASL 3-5 s (first 30 s), total cuts 150-220.
- [ ] Change events every 3-6 s; no unchanged frame > 5 s.
- [ ] ≥ 90% of narrated-passage cuts fall within 0.6 s after a sentence end.
- [ ] Every visual paragraph has 3-6 shots and ends with a 2-4 s breath.
- [ ] 1-2 bursts per act (1.5-3 s shots, 15-40 s, cut to music), each followed by a breath. 1 big breath per act.

**Assets**
- [ ] Archival film: every shot ≥ 3 s (outside bursts), at natural speed, no loops, action complete.
- [ ] Photos: every one moves to a chosen end frame; holds 6-10 s; ≤ 2 hero holds (12-20 s) per act.
- [ ] Maps: ≤ 35% of screen time; each map scene opens with 3-5 s of film; a new element per sentence; stage ≤ 25 s.
- [ ] Cards: ≤ 12 s, one highlighted line, background film unlooped, ≤ 2 cards in a row.

**Transitions and marking**
- [ ] Cuts ≥ 85%; dissolves 0.5-1.5 s only between paragraphs; match cuts 3-6.
- [ ] Corner chapter tag present; full-screen titles only at act breaks (≤ 2 s).

**Sound**
- [ ] Natural sound under every archival shot; room tone under photos.
- [ ] 1-3 accents per map scene; no SFX on routine cuts.
- [ ] Music cue entries are J-cuts; burst cuts on downbeats; phrases resolve in breaths.
- [ ] Silences 0.5-2 s after reveals; no > 2 s dead air.

**Cheap-signal scan (any hit = fix)**
- [ ] No kinetic words, no word-pop captions, no whoosh on routine cuts, no zoom punches, no clip labels on every shot, no grain or leaks, no 1-2 s inserts mid-sentence.

**Hard rules (edit-bible §7, §9): unchanged and blocking.**

---

## 14. Jev check run for this bible

Run on 2026-10-16 with a one-off script that wrote to the scratchpad and used the `tools/improve_ideas_jev.py` `rank` helper. Both rounds (forward and reversed) answered by **Jev (typesafe/jev-1.13)**; 6 YouTube personas.

| Question | Ranking (Borda points / max) | Reading |
|---|---|---|
| Rhythm of a 45 s narrated passage | retention cut (new picture every 4-5 s, pops, whoosh) 42 > scene paragraph (film → map revealing per sentence → photo held, then a pause) 37 > sentence intercut 36 > single map 14 (/66) | A split, not a verdict. The retention cut won the forward order. The scene paragraph won the reversed order. The retired-engineer persona ranked the scene paragraph 1st and the retention cut last; the second-screen gamer ranked them the other way round. The static map lost hard. **Synthesis:** scene-paragraph structure with the change clock at 3-6 s, plus bursts for the fast-pull moments. |
| Chapter marking | corner tag only 33 > 2 s full card + tag 25.5 > no marker 19.5 (/54) | Adopt the corner tag. |

Jev measures pull ("would you keep watching"), not taste. It settles open choices; it never overrides the hard rules or the owner's eye.

---

## 15. Sources

- Walter Murch, *In the Blink of an Eye* (rule of six, blink). Summaries: [UT RTF wiki](https://cloud.wikis.utexas.edu/wiki/spaces/rtf318/pages/80022510/Murch+s+Rule+of+Six), [No Film School](https://nofilmschool.com/2016/11/6-rules-good-cutting-according-oscar-winning-editor-walter-murch). Murch on *Coup 53* structure: [ProVideo Coalition](https://www.provideocoalition.com/aotc-walter-murch-coup53/).
- Karen Pearlman, *Cutting Rhythms*, 2nd ed. (physical, emotional, event rhythm): [O'Reilly](https://oreilly.com/library/view/cutting-rhythms-2nd/9781317516422), [Senses of Cinema review](https://www.sensesofcinema.com/2026/book-reviews/feeling-the-screen-storys-pulse-karen-peralmans-cutting-rhythms-creative-film-editing/).
- Ken Burns on stills, duration, sound: [CineD](https://www.cined.com/?p=406363). Sound of *The War* (48-track sessions, silence, authenticity): [Mix](https://www.mixonline.com/?p=78678). *The Civil War* facts: [Wikipedia](https://en.wikipedia.org/wiki/The_Civil_War_(miniseries)). Burns, Grubin, Nelson and Stekler on archive: [IDA Documentary](https://documentary.org/node/34982).
- Editors on archive as wallpaper and teaching the grammar: [Sundance, Contemplating the Cut](https://www.sundance.org/blogs/contemplating-the-cut-takeaways-and-tips-for-documentary-editors-3/).
- *They Shall Not Grow Old*: [Wikipedia](https://en.wikipedia.org/wiki/They_Shall_Not_Grow_Old), [Criterion](https://www.criterion.com/current/posts/5986-the-great-war-in-living-color-and-3d), [WBUR](https://www.wbur.org/news/2019/01/31/they-shall-not-grow-old-peter-jackson-review), [Inquirer](https://inquirer.com/entertainment/columnists/they-shall-not-grow-old-world-war-i-movie-peter-jackson-20190125.html).
- *Apollo 11* (Todd Douglas Miller): [ProVideo Coalition](https://www.provideocoalition.com/aotc-apollo-11/), [Wikipedia](https://en.wikipedia.org/wiki/Apollo_11_(2019_film)).
- *The World at War*: [museum.tv](https://www.museum.tv/tv-encyclopedia-19/world-at-war-the), [Prospect](https://prospectmagazine.co.uk/culture/57246/smallscreen).
- *Apocalypse* (Clarke, Costelle; ~700 shots per episode, sound design): [France Télévisions press kit](https://www.francetvpro.fr/contenu-de-presse/20858869).
- Asif Kapadia / Chris King: [RogerEbert.com](https://www.rogerebert.com/interviews/in-her-own-words-asif-kapadia-and-james-gay-rees-on-amy), [archive masterclass](https://www.ayrton-senna.net/archive-masterclass-the-making-of-senna/), [Senna, Wikipedia](https://en.wikipedia.org/wiki/Senna_(film)).
- Adam Curtis (calm voice over fast archival collage, music-led emotion): [Film Comment](https://filmcomment.com/article/adam-curtis-all-watched-over-by-machines-of-loving-grace), [i-D](https://i-d.co/article/goodbye-to-oh-dearism-a-guide-to-the-work-of-adam-curtis).
- Shot-count data: [Stephen Follows, shots per movie](https://stephenfollows.com/p/many-shots-average-movie); [Cinemetrics / Barry Salt method](https://cinemetrics.uchicago.edu/article/9890e39c-ead0-49ff-a800-37d83723836a).
- Narration pace (120-140 wpm documentary): [ProZ voice-over forum](https://www2.proz.com/forum/voiceover/194447-voiceover_output_per_hour.html), [IRPR calculator](https://sounddesign.irpr.agency/tools/voiceover-word-count-calculator/).
- YouTube Intro metric and house retention research: `research/history-youtube-market.md` §6.1-6.2, [YouTube Help](https://support.google.com/youtube/answer/1715160).
- Epic History TV format (maps + archive, BBC narrator): [Military History Now](https://militaryhistorynow.com/2016/01/11/back-to-the-future-how-epic-history-tv-is-re-inventing-the-war-documentary).
- Our own cut: `src/en/Main.tsx`, `src/en/story.ts`, `src/en/timings.json` in this repo.
