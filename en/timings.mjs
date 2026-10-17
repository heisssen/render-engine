// Beat timings for the EN cut from the real voice takes (en/voice/manifest.json).
// Each paragraph is placed back to back with a breath between; section changes get a longer pause,
// the sting sits after the cold open, the act breaks get a beat of silence, then the end screen and seal.
// Writes src/en/timings.json (read by Remotion) and en/voice/placement.json (read by en/mix.py).
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const FPS = 30;
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'en/voice/manifest.json'), 'utf8'));

// Brian on v4 reads long paragraphs at ~160 wpm; a 7% lift lands the film at ~25 min and still sounds natural.
const TEMPO = 1.07;
const tempoDir = path.join(root, 'en/voice/tempo');
fs.mkdirSync(tempoDir, {recursive: true});
for (const b of manifest) {
	const wav = path.join(tempoDir, b.file.replace(/\.mp3$/, '.wav'));
	if (!fs.existsSync(wav)) execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(root, 'en/voice', b.file), '-filter:a', `atempo=${TEMPO}`, '-ar', '48000', '-ac', '1', wav]);
	b.file = 'tempo/' + path.basename(wav);
	b.dur = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', wav]).toString());
}

const TEASE = 9; // seconds: flash-forward before the first word (src/en/overlays.json tease)
const LEAD = 0.6 + TEASE; // silence (or the tease) before the first word
const BREATH = 1.0; // between paragraphs of one speaker: each paragraph is a scene, then a breath (documentary bible)
const SWAP = 0.25; // into / out of a character quote
const SECTION = 2.4; // extra pause when a section changes
const STING = 195; // frames: signal-box ident (src/en/Ident.tsx IDENT_FRAMES)
const ACT_GAP = 0.9; // seconds of silence for the act-break switch
const TAIL = 1.0; // after the last word
const END = 20 * FPS;
const SEAL = 4 * FPS;

let t = LEAD;
const beats = [];
const acts = [];
let sting = null;
let prevSec = null;
manifest.forEach((b, i) => {
	if (b.section !== prevSec) {
		if (prevSec !== null) t += SECTION;
		if (prevSec && prevSec.startsWith('COLD OPEN')) {
			sting = {from: Math.round(t * FPS), frames: STING};
			t += STING / FPS + 0.2;
		}
		if (b.section.startsWith('ACT')) {
			if (acts.length) t += ACT_GAP;
			acts.push({section: b.section, from: Math.round(t * FPS)});
		}
		prevSec = b.section;
	} else if (i) {
		t += manifest[i - 1].speaker !== b.speaker ? SWAP : BREATH;
	}
	beats.push({i, section: b.section, speaker: b.speaker, file: b.file, voiceAt: +t.toFixed(3), dur: b.dur});
	t += b.dur;
});
t += TAIL;

// visual beat = from its voice start to the next beat's voice start (the sting and act gaps belong to the next beat)
const out = beats.map((b, k) => {
	const from = Math.round(b.voiceAt * FPS);
	const next = k + 1 < beats.length ? Math.round(beats[k + 1].voiceAt * FPS) : Math.round(t * FPS);
	let frames = next - from;
	if (sting && from < sting.from && next > sting.from) frames = sting.from - from; // cold open ends where the sting starts
	return {i: b.i, from, frames, section: b.section};
});
// beats right after the sting / act break start a little earlier so there's never a black hole
out.forEach((b, k) => {
	if (k && out[k - 1].from + out[k - 1].frames < b.from) out[k - 1].frames = b.from - out[k - 1].from;
});
if (sting) {
	const k = out.findIndex((b) => b.from > sting.from);
	const before = out[k - 1];
	before.frames = sting.from - before.from;
}

const endFrom = Math.round(t * FPS);
const total = endFrom + END + SEAL;

// clip lengths for looping
const clipFrames = {};
for (const sub of ['', 'en', 'people', 'more', 'more2']) {
	const dir = path.join(root, 'public/clips', sub);
	if (!fs.existsSync(dir)) continue;
	for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.mp4'))) {
		let d = NaN;
		try {
			d = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(dir, f)], {stdio: ['ignore', 'pipe', 'ignore']}).toString());
		} catch {
			// still being written (no moov atom yet): skip it this time
		}
		if (d > 0) clipFrames[(sub ? sub + '/' : '') + f.replace(/\.mp4$/, '')] = Math.floor(d * FPS);
	}
}

// ---------- music grid: where the beats of each act's bed land on the film (same beds and starts as en/mix.py) ----------
const beds = [
	['despair', 0, sting.from],
	['longnote4', sting.from + sting.frames, acts[1].from],
	['heavy', acts[1].from, acts[2].from],
	['echoes', acts[2].from, endFrom + END],
];
const grid = []; // [frame, isDownbeat]
for (const [name, a, b] of beds) {
	const an = JSON.parse(fs.readFileSync(path.join(root, `public/music/.${name}.beats.json`), 'utf8'));
	const down = new Set(an.downbeats.map((x) => x.toFixed(3)));
	for (let rep = 0; a + rep * an.total_duration * FPS < b; rep++)
		for (const bt of an.beat_times) {
			const fr = Math.round(a + (rep * an.total_duration + bt) * FPS);
			if (fr < b) grid.push([fr, down.has(bt.toFixed(3))]);
		}
}
// nearest beat to a frame inside a window, downbeats first
const snap = (fr, lo, hi) => {
	const c = grid.filter(([g]) => g >= lo && g <= hi);
	const pick = (xs) => xs.reduce((best, x) => (!best || Math.abs(x[0] - fr) < Math.abs(best[0] - fr) ? x : best), null);
	const hit = pick(c.filter((x) => x[1])) ?? pick(c);
	return hit ? hit[0] : fr;
};

// beat kinds, read from story.ts the same way en/mix.py does
const story = fs.readFileSync(path.join(root, 'src/en/story.ts'), 'utf8');
const kinds = [...story.slice(story.indexOf('export const STORY')).matchAll(/^\t(\{k: '(\w+)'|ph\(|film\(|map\()/gm)].map(
	(m) => m[2] ?? {'ph(': 'photo', 'film(': 'film', 'map(': 'map'}[m[1]],
);
if (kinds.length !== out.length) throw new Error(`story.ts has ${kinds.length} beats, voice has ${out.length}`);
const kindsOf = (k) => kinds[k];

// ---------- archival inserts (src/en/inserts.json): footage cut into a beat, the cut out snapped to the music ----------
const insertsSpec = JSON.parse(fs.readFileSync(path.join(root, 'src/en/inserts.json'), 'utf8'));
const sentences = JSON.parse(fs.readFileSync(path.join(root, 'src/en/sentences.json'), 'utf8')); // en/sentences.py
const inserts = [];
const quoteIds = new Set(JSON.parse(fs.readFileSync(path.join(root, 'public/docs/memoirs/quotes.json'), 'utf8')).map((q) => q.id)); // quoted pages
for (const [key, list] of Object.entries(insertsSpec)) {
	if (key.startsWith('_')) continue;
	const k = +key;
	const b = out[k];
	if (!b) throw new Error(`inserts.json: no beat ${k}`);
	for (const ins of list) {
		// `at` in seconds from the beat start, or `atf` as a fraction of the beat
		let start = b.from + Math.round(ins.atf != null ? ins.atf * b.frames : (ins.at ?? 0) * FPS);
		const want0 = Math.round((ins.len ?? 5) * FPS);
		const latest = b.from + b.frames - 2 * FPS; // leave the beat's own picture at least 2 s
		const minLen = (ins.burst ? 1.5 : 3) * FPS;
		// documentary bible: cut on sentence boundaries, never mid-phrase (montage bursts excepted)
		const bounds = (sentences[k]?.starts ?? []).map((t) => b.from + Math.round(t * FPS));
		const nearest = (fr, lo, hi) => bounds.filter((x) => x >= lo && x <= hi).sort((x, y) => Math.abs(x - fr) - Math.abs(y - fr))[0];
		if (!ins.burst && start > b.from) start = nearest(start, start - 2.5 * FPS, start + 2.5 * FPS) ?? start;
		const want = start + want0;
		let end = ins.burst ? want : nearest(want, start + minLen, want + 2.5 * FPS) ?? snap(want, want - 20, want + 20);
		end = Math.min(end, latest);
		if (end - start < minLen) continue; // beat too short for it
		if (ins.clip && !clipFrames[ins.clip]) throw new Error(`inserts.json: clip ${ins.clip} not found in public/clips`);
		if (ins.page && !quoteIds.has(ins.page)) throw new Error(`inserts.json: no quote ${ins.page} in public/docs/memoirs/quotes.json`);
		inserts.push({...ins, beat: k, from: start, frames: end - start});
	}
}
inserts.sort((a, b) => a.from - b.from);
// quoted pages (src/en/pages.json): from a sentence start for n sentences (or to the beat's end); a page may cover a
// whole quote beat. Film inserts of the beat that overlap a page are cut back, or dropped if under 3 s are left.
for (const [key, list] of Object.entries(JSON.parse(fs.readFileSync(path.join(root, 'src/en/pages.json'), 'utf8')))) {
	if (key.startsWith('_')) continue;
	const k = +key, b = out[k], st = sentences[k]?.starts ?? [0];
	if (!b) throw new Error(`pages.json: no beat ${k}`);
	for (const pg of list) {
		if (!quoteIds.has(pg.page)) throw new Error(`pages.json: no quote ${pg.page}`);
		const from = b.from + Math.round((st[pg.sent ?? 0] ?? 0) * FPS);
		const nx = pg.n != null ? st[(pg.sent ?? 0) + pg.n] : undefined;
		const to = nx != null ? b.from + Math.round(nx * FPS) : b.from + b.frames;
		if (to - from < 1.5 * FPS) { console.warn(`pages.json: beat ${k} ${pg.page} too short, skipped`); continue; }
		for (let j = inserts.length - 1; j >= 0; j--) {
			const s = inserts[j];
			if (s.beat !== k || s.page || s.from + s.frames <= from || s.from >= to) continue;
			if (s.from < from && from - s.from >= 3 * FPS) s.frames = from - s.from;
			else if (s.from + s.frames > to && s.from + s.frames - to >= 3 * FPS) { const e = s.from + s.frames; s.from_s = (s.from_s ?? 0) + (to - s.from) / FPS * (s.rate ?? 1); s.from = to; s.frames = e - to; }
			else inserts.splice(j, 1);
		}
		inserts.push({page: pg.page, beat: k, from, frames: to - from});
	}
}
inserts.sort((a, b) => a.from - b.from);

// how each insert looks (src/en/Edit.tsx InsertView): photos narrower than ~3:2 go in whole as a print; film cut into
// the middle of a map plays in a window over the live map; the rest is full frame. Film of a famous person gets a
// name/year label (from public/clips/people/people.json).
const aspects = JSON.parse(fs.readFileSync(path.join(root, 'src/en/photo_aspects.json'), 'utf8'));
const people = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(root, 'public/clips/people/people.json'), 'utf8')).clips.map((c) => [c.id, c]));
const SHORT = {'Paul von Hindenburg': 'Hindenburg', 'Erich Ludendorff': 'Ludendorff', 'Joseph Joffre': 'Joffre', 'Raymond Poincaré': 'Poincaré', 'Ferdinand Foch': 'Foch', 'Georges Clemenceau': 'Clemenceau', 'Philippe Petain': 'Pétain', 'Woodrow Wilson': 'Woodrow Wilson', 'King Ferdinand of Bulgaria': 'Ferdinand of Bulgaria', 'Karl I of Austria': 'Emperor Karl'};
const named = new Set(); // a person's name label only on their first appearance (bible: no labels on every clip)
for (const s of inserts) {
	const midMap = kindsOf(s.beat) === 'map' && s.from !== out[s.beat].from;
	s.onKind = kinds[s.beat];
	if (s.page) s.look = 'page';
	s.look ??= s.photo ? ((aspects[s.photo] ?? 1.5) < 1.45 ? 'print' : 'full') : midMap ? 'window' : 'full';
	const p = s.clip && people[s.clip];
	if (p && !s.label && !/b-roll/i.test(p.person) && !named.has(p.person)) {
		named.add(p.person);
		s.label = p.person.split(';').map((n) => SHORT[n.trim()] ?? n.trim()).join(' & ');
		s.labelSub = String(p.year).replace(/^c\./, 'c. ');
	}
}

// ---------- transitions: one per cut, picked from what the cut joins ----------
// The edit bible (docs/bibles/edit-bible.md): plain cuts at least 85%, at most 12 dissolves (map to map,
// where the camera travels), 3-6 match cuts (the map pushes into the place, cut to its film), 2-3 "switch" marks at the
// story's switch points, one white flash, one whip. No light leaks.
const SPECIAL = {2: 'flash', 5: 'silence', 27: 'silence', 66: 'whip', 72: 'silence'};
const afterBreak = [...acts.slice(1).map((a) => a.from), sting.from + sting.frames];
let dissolves = 0, matches = 0;
const transitions = out.map((b, k) => {
	if (!k) return {beat: k, at: b.from, type: 'cut'};
	const prev = kinds[k - 1], cur = kinds[k];
	const intro = inserts.some((s) => s.beat === k && s.from === b.from && s.clip);
	let type = 'cut';
	if (afterBreak.some((f) => Math.abs(f - b.from) < 2 * FPS)) type = 'cut'; // the sting / act break already did the job
	else if (SPECIAL[k]) type = SPECIAL[k];
	else if (prev === 'map' && intro && matches < 6) (type = 'match'), matches++;
	else if (prev === 'map' && cur === 'map' && !intro && dissolves < 12) (type = 'dissolve'), dissolves++;
	return {beat: k, at: b.from, type};
});

// ---------- backdrops under card beats (src/en/backdrops.json) ----------
const backdrops = {};
for (const [key, bd] of Object.entries(JSON.parse(fs.readFileSync(path.join(root, 'src/en/backdrops.json'), 'utf8')))) {
	if (key.startsWith('_')) continue;
	if (bd.clip && !clipFrames[bd.clip]) throw new Error(`backdrops.json: clip ${bd.clip} not found in public/clips`);
	if (bd.photo && !fs.existsSync(path.join(root, 'public', bd.photo))) throw new Error(`backdrops.json: no ${bd.photo}`);
	backdrops[key] = bd;
}

// ---------- overlays (src/en/overlays.json): tease shots and kinetic keywords timed to the words ----------
const overlays = JSON.parse(fs.readFileSync(path.join(root, 'src/en/overlays.json'), 'utf8'));
const norm = (w) => w.toLowerCase().replace(/[^a-z0-9']/g, '');
// frame at which the narrator says `phrase` in beat k: by word position inside the take (speech is near-even)
const wordFrame = (k, phrase) => {
	const words = manifest[k].text.replace(/\[[^\]]*\]/g, ' ').split(/\s+/).filter(Boolean).map(norm);
	const want = phrase.split(/\s+/).map(norm);
	const idx = words.findIndex((_, i) => want.every((w, j) => words[i + j] === w));
	if (idx < 0) throw new Error(`overlays.json: "${phrase}" not found in beat ${k}`);
	return Math.round((beats[k].voiceAt + (idx / words.length) * beats[k].dur) * FPS);
};
const teaseShot = Math.floor((TEASE * FPS) / overlays.tease.length);
for (const s of overlays.tease) if (s.clip && !clipFrames[s.clip]) throw new Error(`overlays.json tease: no clip ${s.clip}`);
const tease = {frames: TEASE * FPS, shot: teaseShot, shots: overlays.tease};
// a keyword never lands on top of an archival insert: it waits for the insert to end (or comes just before it)
const KW = 56; // src/en/Edit.tsx KEYWORD_FRAMES
const keywords = overlays.keywords.map((w) => {
	let at = wordFrame(w.beat, w.word);
	const hit = inserts.find((s) => at + KW > s.from && at < s.from + s.frames);
	if (hit) {
		const b = out[w.beat];
		if (hit.from + hit.frames + 4 + KW <= b.from + b.frames) at = hit.from + hit.frames + 4;
		else if (hit.from - KW - 4 >= b.from) at = hit.from - KW - 4;
	}
	return {...w, at};
});

// chapters: a small persistent tag in the corner (documentary bible, Jev: corner tag only)
const chapters = (overlays.chapters ?? []).map((c, n) => ({n: n + 1, title: c.title, from: out[c.beat].from}));

const extra = {inserts, transitions, kinds, backdrops, tease, keywords, chapters};
fs.writeFileSync(
	path.join(root, 'src/en/timings.json'),
	JSON.stringify({fps: FPS, total, beats: out, sting, acts, end: {from: endFrom, frames: END}, seal: {from: endFrom + END, frames: SEAL}, clipFrames, ...extra}, null, 1),
);
fs.writeFileSync(path.join(root, 'en/voice/placement.json'), JSON.stringify({fps: FPS, total, sting, acts, beats, ...extra}, null, 1));
// ---------- pace check against the edit bible: longest unchanged stretch per beat ----------
const COLD = 6; // seconds: the cold open (before the sting) changes picture every 3-5 s
const LIMIT = {map: 25, photo: 20, film: 12, quote: 12, telegram: 12, doc: 12, headline: 12, big: 12, default: 12}; // documentary bible // seconds
const shots = [];
const slow = [];
out.forEach((b, k) => {
	const cuts = [b.from, b.from + b.frames];
	for (const s of inserts.filter((x) => x.beat === k)) cuts.push(s.from, s.from + s.frames);
	cuts.sort((x, y) => x - y);
	let worst = 0;
	for (let i = 1; i < cuts.length; i++) {
		const len = (cuts[i] - cuts[i - 1]) / FPS;
		if (len > 0.3) shots.push(len);
		worst = Math.max(worst, len);
	}
	const lim = b.from < sting.from ? COLD : LIMIT[kinds[k]] ?? LIMIT.default;
	if (worst > lim) slow.push(`${k}:${kinds[k]} ${worst.toFixed(0)}s`);
});
const avg = shots.reduce((a, b) => a + b, 0) / shots.length;
console.log(`pace: ${shots.length} shots, average ${avg.toFixed(1)} s; over the bible's limit: ${slow.length ? slow.join(', ') : 'none'}`);
console.log(`inserts ${inserts.length}, transitions ${Object.entries(transitions.reduce((m, t) => ((m[t.type] = (m[t.type] ?? 0) + 1), m), {})).map(([t, n]) => `${t} ${n}`).join(', ')}`);
console.log(`beats ${out.length}, voice ends ${(t / 60).toFixed(2)} min, total ${(total / FPS / 60).toFixed(2)} min, sting @${(sting.from / FPS).toFixed(1)}s, acts ${acts.map((a) => (a.from / FPS / 60).toFixed(2)).join(' / ')} min`);
