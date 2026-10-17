// The main composition (EP01, EN). One continuous film: cold open -> sting -> three acts -> end screen -> seal.
// Rendered muted; voice, music and SFX are mixed by en/mix.py from the same timings.
import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {Backdrop, BackdropView, BlurDefs, FlashFrame, Insert, InsertView, KEYWORD_FRAMES, Keyword, OV, Tease, TeaseShot, TransitionType, transitionStyle} from './Edit';
import {ActBreak, ChapterTag, EndScreen, ModeBadge, Seal} from './brand';
import {Ident} from './Ident';
import {Card, CardSpec, OverFootage, PropContext, PropMode} from './Cards';
import {Layer, MapSpec, MapView, cameraAt, pinPoint} from './Map';
import {Cap, Film, FilmSpec, Photo, PhotoSpec} from './Media';
import {Beat, EPISODE, STORY} from './story';
import {C, FONT, clamp, easeOut} from './theme';
import timings from './timings.json';

export type Timings = {
	fps: number;
	total: number;
	beats: {i: number; from: number; frames: number; section: string}[];
	sting: {from: number; frames: number};
	acts: {from: number; section: string}[];
	end: {from: number; frames: number};
	seal: {from: number; frames: number};
	clipFrames: Record<string, number>;
	inserts: Insert[];
	backdrops: Record<string, Backdrop>;
	tease: {frames: number; shot: number; shots: TeaseShot[]};
	keywords: {beat: number; at: number; text: string}[];
	chapters: {n: number; title: string; from: number}[];
	kinds: string[];
	transitions: {beat: number; at: number; type: TransitionType}[];
};
const T = timings as Timings;

if (T.beats.length !== STORY.length) throw new Error(`voice has ${T.beats.length} beats, story.ts has ${STORY.length}`);

type Resolved = {beat: Beat; i: number; from: number; frames: number; done: Layer[]; modeChanged: boolean};

const resolve = (): Resolved[] => {
	const out: Resolved[] = [];
	let prevMap: MapSpec | null = null;
	let prevMode: string | undefined;
	STORY.forEach((b, i) => {
		const t = T.beats[i];
		let beat = b;
		let done: Layer[] = [];
		if (b.k === 'map') {
			const m = {...b} as MapSpec & Beat;
			if (!m.from) m.from = prevMap?.view ?? m.view;
			if (m.keep && prevMap) done = [...(out.length ? out[out.length - 1].done : []), ...prevMap.layers];
			beat = m;
			prevMap = m;
		}
		out.push({beat, i, from: t.from, frames: t.frames, done, modeChanged: b.mode !== prevMode});
		prevMode = b.mode;
	});
	return out;
};
export const BEATS = resolve();

// numbers count up when they land (edit bible: a number gets an animated counter): "≈27,000" rolls from 0
const countUp = (text: string, p: number) => {
	const m = text.match(/\d[\d,]*/);
	if (!m || p >= 1) return text;
	const n = Number(m[0].replace(/,/g, ''));
	if (!m[0].includes(',') && n >= 1000 && n <= 2100) return text; // a year, not a count
	const v = Math.round(n * p);
	const shown = m[0].includes(',') ? v.toLocaleString('en-US') : String(v);
	return text.slice(0, m.index) + shown + text.slice(m.index! + m[0].length);
};

const Stat: React.FC<{s: NonNullable<MapSpec['stat']>; dur: number}> = ({s, dur}) => {
	const f = useCurrentFrame();
	const at = (s.at ?? 0.4) * dur;
	const p = interpolate(f, [at, at + 16], [0, 1], {...clamp, easing: easeOut});
	return (
		<div style={{position: 'absolute', right: 70, bottom: 74, width: 640, background: C.night, color: C.paper, padding: '26px 34px', opacity: p, transform: `translateY(${(1 - p) * 40}px)`, borderLeft: `12px solid ${C[s.c ?? 'gold']}`, boxShadow: '0 16px 40px rgba(0,0,0,0.4)'}}>
			<div style={{fontFamily: FONT.head, fontWeight: 700, fontSize: 104, lineHeight: 1}}>{countUp(s.big, interpolate(f, [at + 4, at + 34], [0, 1], {...clamp, easing: easeOut}))}</div>
			<div style={{fontFamily: FONT.mono, fontSize: 28, marginTop: 12, lineHeight: 1.35, color: '#C3CBC9'}}>{s.small}</div>
		</div>
	);
};

const TitleOverlay: React.FC<{t: string; s?: string; at: number}> = ({t, s, at}) => {
	const f = useCurrentFrame();
	const p = interpolate(f, [at, at + 20], [0, 1], {...clamp, easing: easeOut});
	if (p <= 0) return null;
	return (
		<AbsoluteFill style={{background: `rgba(18,23,24,${0.72 * p})`, justifyContent: 'center', padding: '0 170px'}}>
			<div style={{fontFamily: FONT.head, fontWeight: 700, fontSize: 150, color: C.paper, textTransform: 'uppercase', lineHeight: 1, opacity: p}}>{t}</div>
			{s && <div style={{fontFamily: FONT.display, fontStyle: 'italic', fontSize: 50, color: C.signal, marginTop: 26, opacity: p}}>{s}</div>}
		</AbsoluteFill>
	);
};

// placeholder while a clip hasn't been cut yet
const Missing: React.FC<{name: string}> = ({name}) => (
	<AbsoluteFill style={{background: C.night2, alignItems: 'center', justifyContent: 'center', fontFamily: FONT.mono, fontSize: 40, color: C.rail}}>clip: {name}</AbsoluteFill>
);

const TR = T.transitions;
const BeatView: React.FC<{r: Resolved; ov: number}> = ({r, ov}) => {
	const f = useCurrentFrame();
	const b = r.beat;
	const seqLen = r.frames + ov;
	const enter = ov ? TR[r.i].type : null;
	const exit = r.i + 1 < TR.length ? TR[r.i + 1].type : null;
	const style = transitionStyle(f, seqLen, enter, exit, b.k === 'map');
	// this beat's archival inserts, in frames of this sequence; an insert at the very start holds the beat's own
	// picture back until it ends, so a map's camera move and arrows start on the reveal
	const start = r.from - ov;
	const mine = T.inserts.filter((s) => s.beat === r.i);
	// paper props (telegram, document, front page, quote, big line) sit ON the film: their inserts change the film under
	// them instead of cutting the paper away, and nothing is held back at the start
	const prop: PropMode = b.k === 'telegram' || b.k === 'doc' || b.k === 'headline' ? 'paper' : b.k === 'quote' || b.k === 'big' ? 'text' : null;
	const under = prop ? mine.filter((s) => !s.page) : []; // a quoted page always lies on top, even over a paper prop
	const intro = prop ? undefined : mine.find((s) => s.from === r.from && !s.page);
	const delay = intro ? intro.from + intro.frames - start : 0;
	const dur = r.frames - Math.max(0, delay - ov); // what is left of the beat after an opening insert
	// a window of film over a live map is pinned to its place: the latest arrow target / city / note on screen,
	// projected with the map camera of this very frame
	const pinFor = (s: Insert): [number, number] | null => {
		if (b.k !== 'map' || s.look !== 'window') return null;
		const spec = b as MapSpec;
		const mapF = f - delay;
		const p = s.p ?? pinPoint(spec, (s.from - start - delay) / dur);
		return p ? (cameraAt(spec, dur, mapF)(p) as [number, number]) : null;
	};
	const content = (
		<>
			{b.k === 'map' ? (
				<MapView spec={b as MapSpec} dur={dur} done={r.done} />
			) : b.k === 'photo' ? (
				<Photo s={b as PhotoSpec} dur={dur} />
			) : b.k === 'film' ? (
				T.clipFrames[(b as FilmSpec).src] ? <Film s={b as FilmSpec} dur={dur} clipFrames={T.clipFrames[(b as FilmSpec).src]} /> : <Missing name={(b as FilmSpec).src} />
			) : (
				<>
					{b.bg && T.clipFrames[b.bg.src] && (
						<AbsoluteFill style={{opacity: 0.9}}>
							<Film s={{k: 'film', src: b.bg.src, from: b.bg.from, credit: b.bg.credit}} dur={dur} clipFrames={T.clipFrames[b.bg.src]} />
						</AbsoluteFill>
					)}
					{!b.bg && T.backdrops[r.i] && <BackdropView s={T.backdrops[r.i]} dur={dur} clipFrames={T.backdrops[r.i].clip ? T.clipFrames[T.backdrops[r.i].clip!] : undefined} />}
					{prop &&
						under.map((s) => (
							<Sequence key={`under${s.from}`} from={s.from - start} durationInFrames={s.frames} layout="none">
								<InsertView s={{...s, look: 'full', label: prop === 'paper' ? s.label : undefined}} clipFrames={s.clip ? T.clipFrames[s.clip] : undefined} />
							</Sequence>
						))}
					<OverFootage.Provider value={!!b.bg || !!T.backdrops[r.i] || under.length > 0}>
						<PropContext.Provider value={prop}>
							<Card spec={b as CardSpec} dur={dur} />
						</PropContext.Provider>
					</OverFootage.Provider>
				</>
			)}
			{b.k === 'map' && (b as MapSpec).cap && <Cap t={(b as MapSpec).cap!.t} s={(b as MapSpec).cap!.s || undefined} />}
			{b.k === 'map' && (b as MapSpec).stat && <Stat s={(b as MapSpec).stat!} dur={dur} />}
			{b.k === 'map' && (b as MapSpec).title && <TitleOverlay {...(b as MapSpec).title!} at={(b as MapSpec).title!.at * dur} />}
		</>
	);
	return (
		<AbsoluteFill style={style}>
			{delay > 0 ? (
				<Sequence from={delay} layout="none">
					{content}
				</Sequence>
			) : (
				content
			)}
			{mine.filter((s) => !prop || s.page).map((s) => (
				<Sequence key={s.from} from={s.from - start} durationInFrames={s.frames} layout="none">
					<InsertView s={s} clipFrames={s.clip ? T.clipFrames[s.clip] : undefined} pin={pinFor(s)} />
				</Sequence>
			))}
			{b.mode && <ModeBadge mode={b.mode} year={b.year} changed={r.modeChanged} />}
		</AbsoluteFill>
	);
};

export const Main: React.FC = () => (
	<AbsoluteFill style={{background: C.night}}>
		{BEATS.map((r) => (
			// starts OV frames early unless it follows the sting or an act break (those already cover the cut)
			<Sequence key={r.i} from={r.from - (r.i ? OV : 0)} durationInFrames={r.frames + (r.i ? OV : 0)} name={`${r.i} ${r.beat.k}`}>
				<BeatView r={r} ov={r.i ? OV : 0} />
			</Sequence>
		))}
		{/* one white flash per episode */}
		{TR.filter((t) => t.type === 'flash').map((t) => (
			<Sequence key={`flash${t.beat}`} from={t.at} durationInFrames={8} name={`flash ${t.beat}`}>
				<FlashFrame />
			</Sequence>
		))}
		{/* flash-forward before the story, then the keywords over the picture */}
		<Sequence from={0} durationInFrames={T.tease.frames} name="tease">
			<Tease shots={T.tease.shots} shot={T.tease.shot} />
		</Sequence>
		{T.keywords.map((k) => (
			<Sequence key={`kw${k.at}`} from={k.at} durationInFrames={KEYWORD_FRAMES} name={`word ${k.text}`}>
				<Keyword text={k.text} side={['telegram', 'doc', 'headline'].includes(T.kinds[k.beat])} />
			</Sequence>
		))}
		{T.chapters.map((c, k) => {
			const to = k + 1 < T.chapters.length ? T.chapters[k + 1].from : T.end.from;
			return (
				<Sequence key={`ch${c.n}`} from={c.from} durationInFrames={to - c.from} name={`chapter ${c.n}`}>
					<ChapterTag n={c.n} title={c.title} />
				</Sequence>
			);
		})}
		<BlurDefs />
		<Sequence from={T.sting.from} durationInFrames={T.sting.frames} name="sting">
			<Ident title={EPISODE.title} data={EPISODE.ident} />
		</Sequence>
		{T.acts.slice(1).map((a, k) => (
			<Sequence key={a.section} from={Math.max(0, a.from - 20)} durationInFrames={60} name={`break ${a.section}`}>
				<ActBreak date={EPISODE.actDates[k] ?? ''} mode={EPISODE.actModes[k] ?? 'alt'} />
			</Sequence>
		))}
		<Sequence from={T.end.from} durationInFrames={T.end.frames} name="end screen">
			<EndScreen dur={T.end.frames} />
		</Sequence>
		<Sequence from={T.seal.from} durationInFrames={T.seal.frames} name="seal">
			<Seal />
		</Sequence>
	</AbsoluteFill>
);
