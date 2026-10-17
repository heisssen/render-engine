// The cut: transitions between beats and archival inserts inside them (planned by en/timings.mjs from the edit bible,
// docs/bibles/edit-bible.md). Mostly plain cuts; dissolve = map to map while the camera travels;
// match = the map pushes into the place and cuts to its film;
// silence = the story's switch points: the music drops out for a second, then a hard cut (the keyword on screen names
// what changed); one white flash and one whip-pan per episode. No light leaks, no grain, no rail graphics.
import React from 'react';
import {AbsoluteFill, Img, Loop, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {LowerThird, SourceLine} from './Media';
import {C, FONT, clamp, ease, easeOut} from './theme';
import aspects from './photo_aspects.json';
import {PageView} from './Page';

export type TransitionType = 'cut' | 'dissolve' | 'match' | 'silence' | 'whip' | 'flash';
export type Insert = {beat: number; from: number; frames: number; clip?: string; photo?: string; from_s?: number; rate?: number; credit?: string; move?: 'in' | 'out' | 'left' | 'right'; focus?: [number, number]; look?: 'full' | 'window' | 'print' | 'page'; page?: string; label?: string; labelSub?: string; p?: [number, number]; onKind?: string};

export const OV = 10; // frames the incoming beat overlaps the outgoing one
const W = 1920;

// cheap per-frame noise, the same on every render
const noise = (n: number) => {
	const x = Math.sin(n * 12.9898) * 43758.5453;
	return x - Math.floor(x);
};

// horizontal motion blur for the whip: a few fixed strengths (an SVG filter per strength, referenced from CSS)
export const BlurDefs: React.FC = () => (
	<svg width={0} height={0} style={{position: 'absolute'}}>
		<defs>
			{[14, 34, 70].map((s, i) => (
				<filter key={s} id={`hblur${i + 1}`} x="-10%" y="0" width="120%" height="100%">
					<feGaussianBlur stdDeviation={`${s} 0`} />
				</filter>
			))}
		</defs>
	</svg>
);
const hblur = (p: number) => {
	const lvl = Math.round(3 * Math.sin(Math.PI * Math.min(1, Math.max(0, p))));
	return lvl ? `url(#hblur${lvl})` : undefined;
};

// style of a beat while it comes in (f = frames since its sequence start) and while it goes out
export const transitionStyle = (f: number, len: number, enter: TransitionType | null, exit: TransitionType | null, isMap: boolean): React.CSSProperties => {
	let opacity = 1, tx = 0, scale = 1;
	let filter: string | undefined;
	if (enter) {
		const p = Math.min(1, f / OV);
		if (enter === 'dissolve') {
			opacity = ease(p);
			if (!isMap) scale = interpolate(f, [0, OV + 6], [1.035, 1], {...clamp, easing: easeOut});
		} else if (enter === 'whip') {
			tx = (1 - ease(p)) * W;
			filter = hblur(p);
		} else opacity = f >= OV ? 1 : 0; // cut, match, switch, flash: the picture changes on the frame
	}
	if (exit === 'whip' && f >= len - OV) {
		const p = Math.min(1, (f - (len - OV)) / OV);
		tx -= ease(p) * W;
		filter = hblur(p);
	} else if (exit === 'match' && f >= len - 24) {
		// the map pushes into the place, then the film of it takes over on the cut
		const p = (f - (len - 24)) / 24;
		scale *= 1 + 0.75 * p * p * p;
	}
	return {opacity, transform: `translateX(${tx}px) scale(${scale})`, filter};
};

export const FlashFrame: React.FC = () => {
	const f = useCurrentFrame();
	const a = interpolate(f, [0, 8], [0.9, 0], {...clamp, easing: easeOut});
	return a > 0 ? <AbsoluteFill style={{background: '#FFF6E6', opacity: a, pointerEvents: 'none'}} /> : null;
};

const GRADE = 'sepia(0.35) contrast(1.1) saturate(0.85)';

// footage or a photo under a card (telegram, document, quote, chart): slow, graded, the card's paper wash on top
export type Backdrop = {clip?: string; photo?: string; from_s?: number; credit?: string};
export const BackdropView: React.FC<{s: Backdrop; dur: number; clipFrames?: number}> = ({s, dur, clipFrames}) => {
	const f = useCurrentFrame();
	const t = f / Math.max(1, dur);
	let body: React.ReactNode;
	if (s.clip) {
		const start = Math.round((s.from_s ?? 0) * 30);
		const rate = 0.85; // a touch slower: it is a backdrop, not the story
		const avail = clipFrames ? Math.max(30, Math.floor((clipFrames - start) / rate) - 2) : dur;
		const v = <OffthreadVideo src={staticFile(`clips/${s.clip}.mp4`)} startFrom={start} playbackRate={rate} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />;
		body = avail < dur ? <Loop durationInFrames={avail}>{v}</Loop> : v;
	} else body = <Img src={staticFile(s.photo!)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: isPrint(s.photo!) ? '50% 18%' : '50% 35%'}} />;
	return (
		<AbsoluteFill style={{background: C.night}}>
			<AbsoluteFill style={{transform: `scale(${1.06 + 0.08 * t})`, filter: `${GRADE} brightness(0.85)`}}>{body}</AbsoluteFill>
			<SourceLine text={s.credit ?? 'archival film · public domain'} />
		</AbsoluteFill>
	);
};

// photos are never cropped into faces: anything narrower than ~3:2 is shown whole, as a print
export const aspectOf = (src: string) => (aspects as Record<string, number>)[src] ?? 1.5;
export const isPrint = (src: string) => aspectOf(src) < 1.45;

// a photographic print laid over the scene: whole picture, white border, shadow, slight tilt, slow push
export const Print: React.FC<{src: string; t: number; f: number; tilt?: number; maxW?: number; maxH?: number}> = ({src, t, f, tilt = -1.2, maxW = 1500, maxH = 820}) => {
	const ar = aspectOf(src);
	const h = Math.min(maxH, maxW / ar);
	const w = h * ar;
	const rise = interpolate(f, [0, 9], [50, 0], {...clamp, easing: easeOut});
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
			<div style={{padding: 18, paddingBottom: 26, background: '#F1E9D5', boxShadow: '0 28px 70px rgba(0,0,0,0.55)', transform: `translateY(${rise}px) rotate(${tilt}deg) scale(${1 + 0.035 * t})`}}>
				<Img src={staticFile(src)} style={{width: w, height: h, display: 'block', filter: GRADE}} />
			</div>
		</AbsoluteFill>
	);
};

// name and year over footage of a person: the channel lower-third, smaller
export const Label: React.FC<{text: string; sub?: string}> = ({text, sub}) => <LowerThird t={text} s={sub} at={4} size={44} />;

const footage = (s: Insert, clipFrames: number | undefined) => {
	const rate = s.rate ?? 1;
	const start = Math.round((s.from_s ?? 0) * 30);
	const avail = clipFrames ? Math.max(30, Math.floor((clipFrames - start) / rate) - 2) : s.frames;
	const v = <OffthreadVideo src={staticFile(`clips/${s.clip}.mp4`)} startFrom={start} playbackRate={rate} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />;
	return avail < s.frames ? <Loop durationInFrames={avail}>{v}</Loop> : v;
};

// archival insert, in one of three looks (picked by en/timings.mjs):
//  full   - footage over the whole frame, projector weave and exposure flicker
//  window - footage in a mounted frame that slides in over the live map, which keeps animating underneath
//  print  - a photo laid over the scene whole (no faces cropped), the scene dimmed behind it
export const InsertView: React.FC<{s: Insert; clipFrames?: number; pin?: [number, number] | null}> = ({s, clipFrames, pin}) => {
	const f = useCurrentFrame(); // 0 = the insert's first frame
	const t = f / Math.max(1, s.frames);
	const wx = Math.sin(f * 1.7) * 1.3 + (noise(f) - 0.5) * 1.2;
	const wy = Math.cos(f * 2.3) * 1.1 + (noise(f + 77) - 0.5) * 1.6;
	const flick = 0.9 + 0.08 * noise(f * 3 + 5);
	const label = s.label ? <Label text={s.label} sub={s.labelSub} /> : null;
	const look = s.look ?? 'full';
	if (s.page) return <PageView id={s.page} frames={s.frames} />;
	if (s.photo && (look === 'print' || isPrint(s.photo))) {
		const dim = interpolate(f, [0, 6], [0, s.onKind === 'photo' ? 0.9 : 0.62], clamp); // over another print: hide it, no print-on-print
		return (
			<AbsoluteFill>
				<AbsoluteFill style={{background: `rgba(18,23,24,${dim})`}} />
				<Print src={s.photo} t={t} f={f} tilt={s.beat % 2 ? 1.2 : -1.4} />
				{label}
				<SourceLine text={s.credit ?? 'public domain'} />
			</AbsoluteFill>
		);
	}
	if (s.clip && look === 'window') {
		const inP = interpolate(f, [0, 10], [0, 1], {...clamp, easing: easeOut});
		const outP = interpolate(f, [s.frames - 8, s.frames], [0, 1], {...clamp, easing: ease});
		// the window sits on the side away from its place on the map and is pinned to it with a red thread
		const left = pin ? (pin[0] > 960 ? 90 : 1040) : s.beat % 2 ? 90 : 1040;
		const W = 760, H = 428; // small enough to leave the map's own notes and the caption/stat corners visible
		const corner: [number, number] = [left > 500 ? left + 14 : left + W + 14, pin && pin[1] < 450 ? 164 : 150 + H + 14];
		const thread = interpolate(f, [8, 18], [0, 1], {...clamp, easing: easeOut}) * (1 - outP);
		const pinOn = pin && pin[0] > -50 && pin[0] < 1970 && pin[1] > -50 && pin[1] < 1130;
		return (
			<AbsoluteFill>
				<div style={{position: 'absolute', left, top: 150, width: W + 28, padding: 14, background: '#F1E9D5', boxShadow: '0 30px 80px rgba(0,0,0,0.5)', opacity: Math.min(inP * 1.4, 1 - outP), transform: `translateX(${(1 - inP) * (left > 500 ? 260 : -260) + outP * (left > 500 ? 220 : -220)}px) rotate(${left > 500 ? -1.3 : 1.3}deg)`}}>
					<div style={{width: W, height: H, overflow: 'hidden', background: C.night}}>
						<div style={{width: '100%', height: '100%', transform: `scale(${1.04 + 0.03 * t})`, filter: `${GRADE} brightness(${flick})`}}>{footage(s, clipFrames)}</div>
					</div>
					<div style={{fontFamily: FONT.mono, fontSize: 17, color: C.inkSoft, marginTop: 8, whiteSpace: 'nowrap', overflow: 'hidden'}}>{s.credit ?? 'archival film · public domain'}</div>
				</div>
				{pinOn && thread > 0 && (
					<svg width={1920} height={1080} style={{position: 'absolute', pointerEvents: 'none'}}>
						<line x1={corner[0]} y1={corner[1]} x2={corner[0] + (pin![0] - corner[0]) * thread} y2={corner[1] + (pin![1] - corner[1]) * thread} stroke={C.signal} strokeWidth={4} strokeLinecap="round" />
						<circle cx={corner[0]} cy={corner[1]} r={11} fill={C.signal} stroke={C.ink} strokeWidth={3} />
						{thread > 0.95 && <circle cx={pin![0]} cy={pin![1]} r={9 + 5 * Math.sin(f / 4)} fill="none" stroke={C.signal} strokeWidth={4} />}
						{thread > 0.95 && <circle cx={pin![0]} cy={pin![1]} r={6} fill={C.signal} />}
					</svg>
				)}
				{label}
			</AbsoluteFill>
		);
	}
	let body: React.ReactNode;
	if (s.clip) body = footage(s, clipFrames);
	else {
		const mv = s.move ?? 'in';
		const sc = mv === 'out' ? 1.16 - 0.1 * t : 1.05 + 0.11 * t;
		const dx = mv === 'left' ? 50 - 100 * t : mv === 'right' ? -50 + 100 * t : 0;
		const [fx, fy] = s.focus ?? [0.5, 0.4];
		body = (
			<AbsoluteFill style={{transform: `translateX(${dx}px) scale(${sc})`, transformOrigin: `${fx * 100}% ${fy * 100}%`}}>
				<Img src={staticFile(s.photo!)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${fx * 100}% ${fy * 100}%`}} />
			</AbsoluteFill>
		);
	}
	return (
		<AbsoluteFill style={{background: C.night}}>
			<AbsoluteFill style={{transform: `translate(${wx}px, ${wy}px) scale(${1.04 + 0.02 * t})`, filter: `${GRADE} brightness(${flick})`}}>{body}</AbsoluteFill>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.6))'}} />
			{label}
			<SourceLine text={s.credit ?? 'archival film · public domain'} />
		</AbsoluteFill>
	);
};
// kinetic keyword: 2-4 words slam onto a dark band across the middle, a red rule draws under them, ~1.8 s
export const KEYWORD_FRAMES = 56;
// beside a paper prop (which sits on the right) the keyword takes the left half instead of the middle band
export const Keyword: React.FC<{text: string; side?: boolean}> = ({text, side}) => {
	const f = useCurrentFrame();
	const inP = interpolate(f, [0, 5], [0, 1], {...clamp, easing: easeOut});
	const out = interpolate(f, [KEYWORD_FRAMES - 7, KEYWORD_FRAMES], [1, 0], clamp);
	const shake = f < 7 ? (noise(f) - 0.5) * 10 * (1 - f / 7) : 0;
	const rule = interpolate(f, [5, 16], [0, 1], {...clamp, easing: easeOut});
	return (
		<AbsoluteFill style={{justifyContent: 'center', alignItems: side ? 'flex-start' : 'center', paddingLeft: side ? 90 : 0, pointerEvents: 'none', opacity: out}}>
			<div style={{position: 'absolute', left: 0, right: side ? '50%' : 0, top: 420, height: 240, background: side ? `linear-gradient(90deg, rgba(18,23,24,${0.8 * inP}), rgba(18,23,24,0))` : `rgba(18,23,24,${0.72 * inP})`}} />
			<div style={{position: 'relative', transform: `translate(${shake}px, ${shake * 0.6}px) scale(${1.35 - 0.35 * inP})`, transformOrigin: side ? 'left center' : 'center', opacity: inP}}>
				<div style={{fontFamily: FONT.head, fontWeight: 700, fontSize: side ? Math.min(150, 1500 / Math.max(6, text.length)) : 150, color: C.paper, textTransform: 'uppercase', letterSpacing: '0.01em', lineHeight: 1, whiteSpace: 'nowrap', textShadow: '0 8px 30px rgba(0,0,0,0.5)'}}>{text}</div>
				<div style={{height: 12, background: C.signal, marginTop: 14, width: `${rule * 100}%`}} />
			</div>
		</AbsoluteFill>
	);
};

// flash-forward before the story starts: three real shots from later in the film, one line each, hard cuts
export type TeaseShot = {clip?: string; photo?: string; from_s?: number; text: string; credit?: string};
const TeaseShotView: React.FC<{s: TeaseShot; len: number}> = ({s, len}) => {
	const f = useCurrentFrame();
	const t = f / len;
	const flick = 0.9 + 0.08 * noise(f * 3 + 5);
	const body = s.clip ? (
		<OffthreadVideo src={staticFile(`clips/${s.clip}.mp4`)} startFrom={Math.round((s.from_s ?? 0) * 30)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
	) : (
		<Img src={staticFile(s.photo!)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 40%'}} />
	);
	return (
		<AbsoluteFill style={{background: C.night}}>
			<AbsoluteFill style={{transform: `scale(${1.06 + 0.06 * t})`, filter: `${GRADE} brightness(${flick * 0.8})`}}>{body}</AbsoluteFill>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7))'}} />
			<div style={{position: 'absolute', left: 90, top: 80, fontFamily: FONT.mono, fontSize: 26, letterSpacing: '0.3em', color: C.signal}}>OUR TIMELINE</div>
			<AbsoluteFill style={{justifyContent: 'flex-end', padding: '0 90px 130px'}}>
				<div style={{fontFamily: FONT.head, fontWeight: 700, fontSize: 112, color: C.paper, textTransform: 'uppercase', lineHeight: 1, opacity: interpolate(f, [3, 8], [0, 1], clamp), transform: `translateY(${interpolate(f, [3, 10], [30, 0], {...clamp, easing: easeOut})}px)`}}>{s.text}</div>
				<div style={{height: 10, width: interpolate(f, [8, 20], [0, 420], {...clamp, easing: easeOut}), background: C.signal, marginTop: 18}} />
			</AbsoluteFill>
			<SourceLine text={s.credit ?? 'archival film · public domain'} />
		</AbsoluteFill>
	);
};
export const Tease: React.FC<{shots: TeaseShot[]; shot: number}> = ({shots, shot}) => (
	<AbsoluteFill style={{background: C.night}}>
		{shots.map((s, i) => (
			<Sequence key={i} from={i * shot} durationInFrames={shot} layout="none">
				<TeaseShotView s={s} len={shot} />
			</Sequence>
		))}
	</AbsoluteFill>
);