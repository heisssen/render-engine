# Switchyard Dossier: Writing Bible

Rules for the illustrated English long-reads (2,500-4,000 words) that go with each Switchyard episode on Buy Me a Coffee: a free teaser, then the rest for members. EP01, "What if Germany attacked Russia first in 1914?", comes first.

Where the rules come from: (1) eleven history long-reads and newsletters we read (list at the end), (2) an audit of our own EP01 narration (`en/script.md`), (3) five Jev tests on the channel's six viewer personas (`tools/writing_bible_jev.py`, raw data in `runs/writing-bible-jev.json`).

The owner's standing rules apply here too: plain language with dry jokes; no "not X but Y" constructions; no staccato triplets; no percentage filler.

---

## 1. The twelve rules

1. **Open on a dated, sourced moment or one hard fact, and put the hinge fact in the first 60 words.** No question openers, no "In this article we will".
2. **Name the source when you state something we know.** Write "Moltke wrote in his memoir", never "historians say".
3. **Say when you start guessing, and give the reason in the same paragraph.** After that, write the guess plainly. One confidence word per claim, no hedge stacks.
4. **Quote only what someone really said or wrote, with the source in the notes.** Nobody in our timeline gets dialogue.
5. **End each paragraph on information.** Never on a moral, an aphorism or a punchline that repeats the paragraph.
6. **No "not X but Y" in any form.** That includes "X isn't just A, it's B", "not only... but also", "A is one thing, B is another" and "On paper... In practice...".
7. **No lists of three negatives** ("no Gallipoli, no Anzac Cove, no Lawrence"). Pick the strongest item and give it a sentence with a number in it.
8. **Never more than two sentences of five words or fewer in a row.** Use at most one one-line paragraph per section.
9. **Every image is a real archival or public-domain image with a credit line.** Every caption adds one fact the body text does not give.
10. **Numbers carry their source and their spread.** Write "about 27,000", or "reports range from 6 to 30 generals". Never "a staggering number".
11. **One dry joke per section at most, made from a real detail.** No memes, no exclamation marks.
12. **The free teaser ends on a concrete cliffhanger taken from the record.** Never a summary of what is coming, and never hype.

---

## 2. Voice

The writer is a historian who has read the memoirs and the railway tables and talks to a smart friend over a drink. That means first person when it helps ("I think Staabs was too optimistic about the Vistula bridges"), "we" for the Switchyard scenario ("our timeline"), and plain words. Lapham's, History Today and Smithsonian keep this voice through precision: a time of day, a street, a number. Adjectives do almost none of the work.

- Use plain verbs: *said, wrote, ordered, refused, took, lost*. Do not write *unleashed, shattered, reshaped, forged*.
- Keep the irony in the facts. Smithsonian's taxi piece spends a paragraph on the legend, then gives a five-word paragraph: "At least, that's the story." Use that move once per article, not once per section.
- Devereaux and Howes say "I think" when they argue and give a figure when they know. Copy the split.
- Write for a reader who did not watch the video. The Dossier must work on its own.

---

## 3. The Dossier template

| Part | Length | What it does |
|---|---|---|
| **Headline** | max 70 characters | Plain and specific. The episode question is fine ("What If Germany Had Attacked Russia First in 1914?"). Never use "Untold", "Shocking" or "Everything you need to know". |
| **Dek** | one sentence, max 30 words | States the question and the evidence hook, in History Today's standfirst style. EP01: *In August 1914 the Kaiser asked his army to turn east and was told it could not be done. A railway general later said it could, and showed his timetable.* |
| **Free teaser** | 450-700 words | Opening scene, the hinge stated plainly, then the cliffhanger cut (rule 12). Readers decide here whether to pay. |
| **Opening scene** | 150-250 words | A dated moment from a primary source (EP01: the Kaiser's bedroom, about 11 p.m. on 1 August 1914, from Moltke's *Erinnerungen*, 1922). Put the hard fact in sentence 3 or 4 (see the Jev results below). |
| **The record** | 500-900 words | The real history the reader needs, in order, with names, dates and sources. In EP01 that means the shelved eastern deployment plan, the Lichnowsky telegram, Troisvierges and Staabs. |
| **The hinge** | 150-300 words | One paragraph that says exactly what we change, when, and why it is plausible: "The telegram reaches the palace half an hour earlier; Moltke resigns; the railway section turns the trains." End the section by marking the switch. |
| **Our timeline** | 3-5 sections, 400-700 words each | One theatre or theme per section (EP01: the west; the east; Britain and America; money and food; the peace; the people). Each opens with one sentence saying how far we have left the record. |
| **Sidebars** | 3-5 per article, max 120 words each | **Real history / Our timeline** boxes: two short labelled paragraphs side by side. Example: *Real history:* Gallipoli, 1915-16, about 44,000 Allied soldiers and over 50,000 Ottoman soldiers dead. *Our timeline:* Britain and the Ottomans are at peace; Mustafa Kemal spends 1915 in the Caucasus. Cowley's *What If?* puts the smaller what-ifs in sidebars too, which keeps the main argument on one line. |
| **Limits** | 150-300 words | Where the scenario could break, in plain words: Russia could have stayed on the defensive, and Staabs may have been too optimistic. This section is required. |
| **Ending** | 1-2 paragraphs | End on a concrete fact or image from the record (Lapham's ends on the assassin's two revolvers, carved "J" and "C"), then one line pointing to the next episode, as Erik Sass does in every installment. No moral. |
| **Sources** | as needed | Numbered notes for specific claims, in Howes and Gudmundsson style, then 5-10 key works with one line each. Link public-domain books (archive.org, HathiTrust). Mark contested figures. Image credits can be collected here as well. |

Subheads should be short and concrete, and a dry pun is allowed (Howes: "Woolly Thinking"). Never use "X and Y: A Z" title-case headings.

---

## 4. Paragraphs and sentences

- Paragraphs run 40-130 words, with an article average around 80. Devereaux runs longer (100+), Sass and Gudmundsson shorter (2-4 sentences). For a phone reader, 3-5 sentences is the target.
- Sentences average 15-22 words with real variation. A long sentence carrying a chain of events, followed by a short one, is fine. Three short ones in a row is a tell.
- One idea per paragraph. The last sentence adds a fact, a consequence or a turn. If you can delete it and lose nothing, delete it.
- Transitions are made by content: a date, a place, a person ("In Petrograd, by February 1917..."). Spoken signposts from the narration do not belong in print: "Now, America", "This is where it gets interesting", "Which brings us to".
- Em dashes: at most one per 400 words. Use commas, brackets or a full stop.
- Convert the narration's TTS spellings: "nineteen fourteen" becomes 1914, "ninety-two thousand" becomes 92,000.

---

## 5. Marking speculation and fact

The Jev test (section 12) found that readers trust a guess that states its reasoning in two or three sentences. A bare "[OUR TIMELINE]" label did worse than no flag at all, and a hedge stack came last with every persona.

**How to do it:**
1. **At the hinge**, one sentence states the switch, and the header of that section carries a small kicker: *Our timeline*.
2. **In each our-timeline section**, sentence one says how far we have moved from the record: "From here we are guessing, so here is the reasoning."
3. **Tense:** past tense for the record ("Samsonov shot himself in the forest"). For our timeline use the conditional ("would") on first use in a section, then a plain present or past for readability once the frame is set.
4. **Anchor every guess to a real precedent with a date and a number.** "In August 1914 one German army in East Prussia destroyed Samsonov's army; with four, both Russian thrusts very probably fail."
5. **Confidence scale, one word per claim:** *certainly* (the record), *very probably*, *probably*, *possibly*, *our guess*. Never stack them ("it could perhaps be argued that it might").
6. **Credit other people's counterfactuals to them.** Gudmundsson writes that Staabs "contended" the eastern deployment could be improvised and captions the diagrams "as imagined by Hermann von Staabs". Do the same: "Staabs claimed four of seven armies could be facing Russia by 15 August."
7. **The Real history / Our timeline sidebars** carry the side-by-side contrast, so the body text does not have to repeat "in our timeline" at the start of every paragraph. (The EP01 narration opens 15 paragraphs that way.)

---

## 6. Numbers, names, dates

- **Dates:** 1 August 1914 (day month year). Times of day as "about 11 p.m." Give a date at least once per section.
- **Numbers:** use digits from 10 up; spell out one to nine. Round honestly: "about 27,000 French soldiers killed on 22 August 1914" (the figure Smithsonian prints). Give a range when sources disagree. Novogeorgievsk, for example: a Berlin announcement in August 1915 claimed 6 generals and 85,000 men; later compilations give about 90,000 men and 30 generals. The script's "thirty generals" needs that range or a better source.
- **Percentages:** only when the share is the point and the source is named. Prefer counts and fractions ("almost two-thirds of France's pig iron").
- **Names:** full name and role on first mention (Prince Karl Max von Lichnowsky, German ambassador in London), surname after that. Watch the two Moltkes: "the elder Moltke" or "Moltke's uncle", never just "Moltke".
- **Places:** use the period name with the modern one in brackets on first use, Lemberg (Lviv), Rovno (Rivne), then stay consistent. Use Kyiv throughout.
- **Units:** metric first, miles in brackets on first use: 300 km (190 miles).
- **Sources for numbers** go in the notes. If the only source is a secondary compilation, say so in the note.

---

## 7. Quotes

- **Only real quotes**, each traced to a printed source in the notes, with page numbers where we have them. If a translation is ours, say so: "(our translation)".
- **Dialogue from memoirs is recollection.** Write "as Moltke remembered it" or "Moltke wrote that the Kaiser said". Tsouras's *Kaiser's Question* presents the Moltke-Kaiser exchange as transcript and calls Moltke "rigid and unimaginative" with no source. Avoid both.
- **Keep quotes short in the body.** Long primary documents go in block quotes, as Sass does with the ultimatums. Pre-1931 published documents are public domain in the US. Modern historians get one short quote each.
- **No invented quotes for our-timeline people.** Nobody in the alternate timeline says anything in quotation marks.
- **Check famous lines before using them.** EP01's Herwig line ("There was no fallback, no Plan B") is real: Herwig, *The Marne, 1914* (2009), as quoted by Smithsonian. Tolkien's "By 1918 all but one of my close friends were dead" comes from the foreword to the second edition of *The Lord of the Rings*.

---

## 8. Images and captions

- **Sources:** real archival photos, period maps, documents and paintings only. Never use AI images, reconstructions passed off as photos, or generated "photos" of our timeline. An our-timeline map is a real period map with our overlay in the brand red, captioned as ours.
- **The Dossier is paid content, so licences matter.** Use public domain (Library of Congress with "no known restrictions", pre-1931 material, Wikimedia Commons files with verified PD status) or CC BY / CC BY-SA with attribution (for example Bundesarchiv on Commons). Avoid non-commercial licences (David Rumsey CC BY-NC, IWM non-commercial, Gallica commercial reuse) unless we have a licence.
- **Caption formula** (History Today's format plus one fact; this format won the Jev caption test): *What and who, place, date. One fact the text does not give. Credit: creator/institution, ID, licence.*
  - Good: "Wilhelm II signed the mobilisation order at 5 p.m. on 1 August 1914, then spent the evening trying to send the army east. Library of Congress, Bain Collection. Public domain."
  - Bad: "A man at the crossroads of history" (poetic), or "Kaiser Wilhelm II, 1914" (label only).
- **Density:** about one image per 350-450 words, with the first image above the teaser. Maps whenever a front moves.
- **Alt text:** describe what is visible in plain words, separately from the caption.

---

## 9. Humour

Readers liked one dry line made from a real detail (Jev: the dry version won with 4 of 6 personas). Meme tone and the academic tone tied for second, well behind it. The cinematic "AI drama" version came last with most personas.

- Build the joke from the record: German soldiers took the station at Troisvierges, wrecked the station telegraph (the Luxembourg report in the Kautsky documents, 1924), then the stop order came and they marched out again. One closing clause is enough: "For a few hours the war had started, paused and been put back in its box."
- Brackets and understatement work. Sass writes that socialists voted for war "(usually to their lasting regret)".
- Never joke about mass death, the Armenian genocide, occupation regimes or named victims.
- No "lol", "plot twist", "jk", exclamation marks or ironic capitals.

---

## 10. Banned tells, with fixes from our own script

### 10.1 Words and phrases (delete on sight)

delve, tapestry, testament, pivotal, crucial, landscape (figurative), navigate (figurative), intricate, underscore, realm, showcase, vibrant, meticulous, garner, foster, bolster, enduring, profound, indelible, stands as, serves as, boasts, nestled, in the heart of, it's worth noting, notably, importantly, in conclusion, ultimately, in today's world, a reminder that, echo through history, reshape the world, set the stage for, shaped the twentieth century, unfold(s), decisive drama, mythic, colossal, massive (figurative), crushing force, culminating in, natural conclusion, dagger pointed at, game-changer, the untold story, what happened next, little-known, most people don't know, this is where it gets interesting, here's the strangest part, the biggest question, truly, incredibly, deeply.

Trailing *-ing* significance clauses ("..., highlighting the fragility of peace") get cut.

### 10.2 Structures

| Tell | Why it reads as AI | Fix |
|---|---|---|
| "not X but Y" family | It corrects a belief nobody held | State Y and give the evidence |
| Lists of three negatives / rule-of-three lists | Rhythm in place of content | One item, one number |
| Staccato fragment runs | Fake drama | Join into one sentence |
| Rhetorical question then its own answer | Padding | Make the statement |
| Paragraph ends on a moral or aphorism | Every paragraph sounds like a closer | End on the fact; cut the last line |
| Symmetrical sections of equal length with identical openers | Template feel | Let sections be as long as the evidence |
| Summary sentence restating the paragraph | Padding | Delete |
| Hedge stacks | Fake caution | One confidence word |
| "Historians say", "experts argue" | Vague attribution | Name the historian, the book and the year |
| Generic intensifiers and superlatives | Hype | A number or a name |
| Em dash in every paragraph | Machine cadence | Commas, brackets, full stops |

### 10.3 Content

- No vague claims without a name, number or date.
- No false balance ("some say the genocide was...").
- No invented quotes, invented sources, or page numbers you have not seen.
- No inflated consequences (Goodreads readers of *What If?* complained about essays claiming civilisation would have collapsed). Keep each knock-on effect one or two steps from the hinge, and say when it is further.

### 10.4 Before and after (EP01 lines)

| Line | Before (narration) | After (Dossier) |
|---|---|---|
| L127 | "Because this war wasn't only lost in trenches. It was also lost in kitchens and in banks." | "Food and credit decided as much as the fronts did, and in this version both run Germany's way for longer." |
| L159 | "But the war didn't just break empires and spare dictators. It wrote twentieth-century literature." | "Several of the century's best-known books came out of the trenches, and their authors' wars change too." |
| L101 | "...there is no Gallipoli. No landing at Anzac Cove, and no Lawrence of Arabia financing an Arab revolt." | "With Britain and the Ottomans at peace, nobody lands at Gallipoli, where in reality about 44,000 Allied soldiers died." |
| L165 | "Now the twist. Who loses this war? France." | "The country that comes out worst is France: more than a million dead and nothing gained." |
| L151 | "...Forty-nine thousand tonnes actually reached Germany. Occupying a breadbasket is one thing. Eating from it is another." | End at "...about 49,000 tonnes reached Germany." The number carries the point. |
| L143 | "...the war reaches its natural conclusion: a compromise peace... On paper, an honorable draw. In practice, a colossal German triumph." | "The likeliest ending by late 1917 is a negotiated peace: the 1914 border in the west, and German control of everything it holds from the Baltic to Ukraine." |
| L69 | "Historians have argued ever since, but nobody has proven he was wrong." | "The argument was never settled. In 2023 the military historian Bruce Gudmundsson redrew Staabs's allocation corps by corps: 21 against Russia, 19 in the west." |
| L105 | "...a permanent dagger pointed at the Suez Canal and the route to India." | "An Ottoman army can still cross Sinai to the Suez Canal, as a real one did in February 1915." |
| L91 | "Now the east. This is where it gets interesting." | Cut. Start with "Russia had promised France an early offensive, and it keeps the promise." |
| L163 | "...The poppy is just a flower." | Cut the last sentence. The fact before it already makes the point. |
| L155 | "Stalin and Trotsky remain forgotten party scribes in Siberian exile." | **Factual error.** Trotsky spent 1914-17 in Vienna, Zurich, Paris, Spain and New York. Only Stalin was in Siberia (Turukhansk region). Fix: "Stalin stays in his Siberian exile; Trotsky stays an émigré journalist." |
| L179 | "And sometimes the most expensive mistakes in history are the ones that look the most sensible at the time." | End on the record instead: Moltke's own late verdict, sourced, or the Staabs timetable. Then add the next-episode line. |

---

## 11. Audit of the EP01 narration (`en/script.md`)

81 spoken paragraphs (75 narrator, 6 character lines), checked by script and by hand. Narration earns some spoken signposts that print does not, but every line below has to change for the Dossier.

| Tell type | Count | Examples (line) |
|---|---|---|
| Paragraph ends on a moral or zinger | 11 | L79 "It's the same slaughter, only worse."; L151 "Eating from it is another."; L163 "The poppy is just a flower."; also L81, L97, L107, L117, L127, L143, L165, L179 |
| Inflated or cliché vocabulary | 11 (in 8 paras) | L89 "forces Britain to confront itself", "the decisive drama... unfolds"; L105 "permanent dagger"; L111 "crushing force... culminating"; L143 "natural conclusion", "colossal"; L97 "massive"; L103 "mythic"; L129 "infamous"; L153 "shaped the twentieth century" |
| "Not X but Y" family / contrast frames | 8 | L127, L159, L143 "On paper... In practice..."; L151 "is one thing... is another"; L81 "can't lose... It just can't win"; L35 "wasn't a doodle on a napkin"; L29 "isn't fantasy"; L173 |
| Spoken signposts ("Now...", "So here is", "Which brings us") | 8 | L39, L71, L83, L91, L101, L115, L153, L165 |
| Hype / "nobody knows this" teasers | 7 | L29 "trivia that most people never hear"; L97 "a consequence almost nobody thinks about"; L67 and L145 "Here is the strangest part" (twice); L83 "the biggest question"; L91; L23 |
| "No X, no Y, no Z" negative lists | 6 (4 full triplets) | L87, L101, L161, L171 (triplets); L23, L157 (pairs) |
| Rhetorical questions, mostly self-answered | 6 (+2 in the CTA) | L83, L119, L153, L165, L173 "Does Germany get a peaceful twentieth century? Probably not.", L175 "Could this whole scenario have broken down? Of course." |
| Other rule-of-three / anaphora lists | 5 | L87 "It sells, it lends, it watches." (staccato triplet); L37; L19; L157; L173 |
| Em dashes | 6 in 5 paras | L29, L33 (2), L39, L111, L123. Within limits |
| Fragment runs | 1 triplet + 4 pairs | L165 (triplet); L23, L43, L69, L143 |
| Vague attribution | 2 | L69 "Historians have argued ever since"; L107 "Historians trace those decisions" |
| "In our timeline" as a paragraph opener | 15 paras (21 markers) | Monotone in print; use sidebars and section kickers |
| Percent filler | 0 | Clean |
| Facts to fix or range | 2 | L155 Trotsky (error); L111 "thirty generals" (sources say 6-30) |

The strong parts of the script carry over: the cold open from Moltke's memoir, real quotes (the Kaiser's telegram to the Tsar, King George's reply, Moltke's "wild heap" line), the Troisvierges detail, Staabs, and an honest limits paragraph (L175).

---

## 12. Jev results (audience model)

Setup: `tools/writing_bible_jev.py` calls `tools.improve_ideas_jev.rank` with the six `yt_personas` from `niches/_base.yaml`. Each test is run in forward and reversed order and the Borda points are summed. Both rounds came back from `jev` (no fallback). Context given to every persona: they are deciding whether to keep reading a members-only Switchyard Dossier.

| Test (same passage, different versions) | Ranking (points) | Takeaway |
|---|---|---|
| **Opening paragraph** (max 78) | 1. fact-first 54.5 · 2. scene-first 48.5 · 3. question opener 39 · 4. plain "this article looks at" summary 27 · 5. AI-tell version 17 | The analysts (engineer, skeptic, gamer) chose fact-first; the lunch viewer and the student chose the scene. Use **scene first, hard fact by sentence 3-4**. The AI-tell opener came last with 4 of 6 personas in both orders. |
| **Speculative paragraph** (max 66) | 1. flagged with reasoning 44 · 2. unflagged confident 41.5 · 3. "[OUR TIMELINE]" label only 31.5 · 4. hedge stack 12 | Reasoned flagging wins, and the skeptic and the engineer chose it in both orders. The bare label loses to plain prose. Hedging comes last with every persona. Flag once, briefly, with a reason, then write confidently. |
| **Photo caption** (max 66) | 1. fact + credit 49 · 2. joke 32 · 3. poetic 26.5 · 4. label only 20 | The caption that adds a fact and a credit wins 9 of 12 votes. A bare label comes last. |
| **Last lines of the free teaser** (max 66) | 1. concrete cliffhanger from the record (Staabs's timetable) 55.5 · 2. two questions 33 · 3. hype 20 · 4. "in the rest of this article we will" 19 | Unanimous: 12 of 12 first places. Cut the teaser on a real, specific claim that the paid part tests. |
| **Tone of a light paragraph** (Troisvierges, max 66) | 1. dry, one joke 46 · 2. neutral academic 29 · 2. meme jokes 29 · 4. cinematic AI drama 22 | One dry line from a real detail. The student liked the memes and the engineer the academic version; nobody chose the drama version first. |

Caveats: six simulated personas from a YouTube audience model, and the speculative test was order-sensitive (the unflagged version won the reversed round). Treat these results as direction, then check them against real member feedback.

---

## 13. Pre-publish checklist

An agent runs this on `dossier.md` before the owner sees it. Every item is pass/fail; a fail means rewrite and run again.

**Mechanical (grep, case-insensitive):**
1. Banned words (10.1): `delve|tapestry|testament|pivotal|crucial|intricate|underscore|realm|showcase|vibrant|meticulous|garner|foster|bolster|enduring|profound|indelible|stands as|serves as|worth noting|notably|in conclusion|ultimately|unfold|mythic|colossal|culminat|echo(es)? through|reshap|shaped the|set the stage|untold|little-known|most people (don't|never)|where it gets interesting|strangest part|biggest question` → 0 hits.
2. Contrast frames: `n't (just|only)|not only|isn't .{0,40}[.,] it's|is one thing|on paper.{0,60}in practice|rather than` → review every hit and rewrite all "not X but Y" forms.
3. Negative lists: `\bno [^.]{1,40}, no [^.]{1,40},? (and )?no\b` → 0.
4. Fragment runs: no three consecutive sentences of five words or fewer (tokenise and count).
5. Question marks in the body (outside quotes) ≤ 2. None as a section opener.
6. Em dashes ≤ word count / 400.
7. `percent|%` → each hit has a named source in the same sentence or its note.
8. `historians (say|argue|believe|agree|trace)|experts|some say|many believe` → 0 unless a name follows in the same sentence.
9. Spelled-out years or large numbers left over from the TTS script (`nineteen (hundred|ten|fourteen|...)`, `thousand`) → convert to digits.
10. `in our timeline` opens no more than one paragraph per section.

**Structure:**
11. Headline ≤ 70 characters; dek is one sentence ≤ 30 words.
12. The teaser is 450-700 words, contains the hinge, and ends on a concrete claim (no question, no summary).
13. Every our-timeline section opens with a sentence saying how far we are from the record.
14. A Limits section exists.
15. The last paragraph ends on a fact or image from the record plus the next-episode line, with no aphorism.
16. 3-5 Real history / Our timeline sidebars, each ≤ 120 words.
17. Paragraphs are 40-130 words (one-line paragraphs ≤ 1 per section); the last sentence of each paragraph carries information.

**Facts and sources:**
18. Every quote has a note with source and page (or URL), and translations are marked.
19. Every number over 1,000 and every date has a note or appears in a source listed in the notes. Contested figures show a range.
20. No quotation marks around anything said in our timeline.
21. Names: full name and role on first mention; the two Moltkes are disambiguated; place names are consistent.
22. Images: each has a licence that allows paid use and a credit line, and each caption adds a fact. No generated images.

**Last pass, by a person reading aloud:** read the teaser aloud. If any sentence sounds like a trailer voice, rewrite it.

---

## 14. What we read

Notes are paraphrased, and quotes are kept under 15 words.

| Piece | Opening | Structure, paragraphs | Sources | Images / captions | Voice; speculation vs fact |
|---|---|---|---|---|---|
| **Bret Devereaux, "Collections: Why Don't We Use Chemical Weapons Anymore?"**, *A Collection of Unmitigated Pedantry*, 2020 | States the question and warns about caveats, then a personal memory of what school taught | Six subheads (The Exceptions, The Modern System... Conclusions); long paragraphs of 100+ words, with one-line paragraphs ("Why?") as hinges | Inline links and parenthetical references, no footnotes | "Via Wikipedia" credit plus a short instructive caption | Chatty asides; "I think" for argument, figures for evidence; tests the thesis against counterexamples; ends on a sober reflection |
| **Erik Sass, "Britain Declares War on Germany"**, Mental Floss WWI Centennial no. 137, 4 Aug 2014 (also no. 117, "Moltke Calls for War Without Delay") | Italic series standfirst ("the 137th installment"), then a dated subhead and a fast recap | Dated or topical subheads; 3-6 sentence paragraphs; long block quotes of documents | Inline attribution, links to earlier installments | Credits only ("Wikimedia Commons", "UK National Archives"), no descriptive captions | Dry asides in brackets; strictly the record; ends by pointing to the next battle and the previous installment |
| **John Hanc, "A Fleet of Taxis Did Not Really Save Paris..."**, Smithsonian, 24 Jul 2014 | Tells the legend straight in the first paragraph, then a 5-word paragraph undercuts it | `***` breaks instead of subheads; 2-5 sentence paragraphs | Named historians with book and year (Herwig 2009, Hastings, MacDonald 1987) and a museum interview | Descriptive caption plus agency credit (Bettmann/Corbis) | Myth vs fact signalled by "At least, that's the story"; ends on what a symbol is |
| **Caroline Alexander, "The Shock of War"**, Smithsonian, Sep 2010 | A dated rumour from the Marne, Sept 1914 | Long feature; archive case notes as the spine | Named documents (Lancet 1915, War Office report 1922), case notes quoted | Caption gives a figure (9.7 million dead) and a credit | Restrained; lets case-note quotes carry the emotion |
| **Annika Mombauer, "The July Crisis"**, History Today, Jul 2014 (paywalled) and a History Today "History Matters" piece, Oct 2026 | Standfirst names the author and the question; body opens on a dated scene with a primary quote ("On the night of 15 July 1633...") | Teaser of 1-2 paragraphs, then the paywall: our model | Quotes period spellings with source titles | Caption = title, creator, date, institution, licence ("Wellcome Collection. Public Domain.") | Scholarly but readable; no hype |
| **Jack Beatty, "The Cleopatra's Nose of 1914"**, Lapham's Quarterly | Epigraph from Mme Caillaux's testimony, then the shooting as a scene | No subheads; pull-quotes; long, rich paragraphs | Named historians (Berenson, Martin) inline | Artworks with full museum credit lines | A counterfactual essay that never says "what if" loudly: chance as a theme, argued from detail; ends on the assassin's carved revolvers |
| **Bruce I. Gudmundsson, "Deployment Plan von Staabs"** (series "The Great 'What If' of 1914"), *The Tactical Notebook*, Substack, May 2023 | 1 Aug 1914, 5 p.m., the mobilisation order | No subheads; 2-4 sentence paragraphs; dialogue lines set apart | Superscript endnotes: Moltke's *Erinnerungen* (1922) with HathiTrust link; Staabs's *Aufmarsch nach zwei Fronten* (1925) | Portrait plus three deployment diagrams captioned "as imagined by Hermann von Staabs" | Attribution verbs ("contended") mark the counterfactual as Staabs's claim; ends on a caption, with no moral |
| **Peter Tsouras, "The Kaiser's Question, 1914"**, Armchair General 2013 / HistoryNet | Sweeping scene-setting about Europe tensing | No subheads; 60-120 word paragraphs | Almost none; dialogue unattributed | None in the body | Confident and dry, with good numbers (railcars, trains), but unsourced characterisation. Our negative example. |
| **Robert Cowley (ed.), *What If?*** (1999), via Wikipedia, Kirkus and *America* reviews; **Niall Ferguson, "The Kaiser's European Union"** in *Virtual History* (1997), via the Uchronia summary | Each essay: one premise at a turning point, real history first | 20 essays plus 14 sidebars of smaller what-ifs; Cowley's own "The What Ifs of 1914" | Military historians (McPherson, Keegan, Parker) | n/a | Reviewers praised "sober extrapolations"; readers punished essays that claimed civilisation would have collapsed. Ferguson's Britain-stays-out case was openly polemical, so we cite it as a position. |
| **Anton Howes, "Age of Invention: Tudor Trade War"**, Substack, Jan 2026 | Recap of the last installment, plus a personal aside (he became a father) | Pun subheads ("Woolly Thinking", "Juries Out"); medium paragraphs; mid-post Subscribe button | Numbered footnotes to statutes and books | Few images | First person; a back-of-envelope estimate flagged as his ("If my estimate is at all close"); corrects a popular myth by name (Ha-Joon Chang, Wikipedia) |
| **Heather Cox Richardson, *Letters from an American***, Substack, daily | Dateline title; straight into the event | Short paragraphs, no subheads | A "Notes:" list of bare links at the end | Rare | Historian's habit of backstory in the middle of the news. Notes block is a simple model for our sources list. |

**Also used for the tell list:** Wikipedia, "Wikipedia:Signs of AI writing" (vocabulary, negative parallelisms, rule of three, superficial *-ing* analyses, vague attribution, outline-like conclusions).

**Links:** acoup.blog/2020/03/20/collections-why-dont-we-use-chemical-weapons-anymore/ · mentalfloss.com/article/58200 · mentalfloss.com/article/56696 · smithsonianmag.com/history/fleet-taxis-did-not-really-save-paris-germans-during-world-war-i-180952140/ · smithsonianmag.com/history/the-shock-of-war-55376701/ · historytoday.com/archive/july-crisis · historytoday.com/archive/history-matters/omens-thirty-years-war · laphamsquarterly.org/scandal/cleopatras-nose-1914 · tacticalnotebook.substack.com/p/the-great-what-if-of-1914 · historynet.com/kaisers-question-1914/ · en.wikipedia.org/wiki/What_If%3F_(essays) · americamagazine.org/books/2000/05/13/rewriting-history/ · uchronia.com/label/fergkaiser.html · ageofinvention.xyz/p/age-of-invention-tudor-trade-war · heathercoxrichardson.substack.com · en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing · historyofwar.org/firstworldwar/daybyday/1915_08_20.html (Novogeorgievsk figures)
