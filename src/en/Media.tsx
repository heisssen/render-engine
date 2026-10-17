// Archival photos and film for the EN cut: paper-mounted photo on the map desk with slow drift and a red-pencil
// circle, or full-frame footage. Every item carries its source line. Gentle grade toward the palette, no grain.
import React from 'react';
import {AbsoluteFill, Img, Loop, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, FONT, clamp, ease, easeOut} from './theme';
import {DIST, DUR, arrive, ruleThenText} from './motion';
import aspects from './photo_aspects.json';

const aspectOf = (src: string) => (aspects as Record<string, number>)[src] ?? 1.5;
const isPrint = (src: string) => aspectOf(src) < 1.45;

export type PhotoSpec = {
	k: 'photo';
	src: string; // under public/, e.g. photos/en/a_kaiser_and_moltke_1914.jpg
	credit: string;
	cap?: {t: string; s?: string};
	move?: 'in' | 'out' | 'left' | 'right' | 'up';
	focus?: [number, number]; // zoom centre, 0..1
	mount?: boolean; // paper print on the desk instead of full frame
	tilt?: number;
	circle?: {x: number; y: number; r: number; at?: number}; // red pencil, in 0..1 of the image box
};

export type FilmSpec = {
	k: 'film';
	src: string; // under public/clips without extension: 'en/red_trousers' or an old UA clip like 'howitzer'
	from?: number; // seconds into the clip
	rate?: number;
	credit: string;
	cap?: {t: string; s?: string};
};

const GRADE = 'sepia(0.35) contrast(1.08) brightness(0.92) saturate(0.85)';

export const SourceLine: React.FC<{text: string}> = ({text}) => (
	<div style={{position: 'absolute', right: 56, bottom: 40, fontFamily: FONT.mono, fontSize: 18, letterSpacing: '0.06em', color: C.paper, background: 'rgba(18,23,24,0.6)', padding: '4px 10px', maxWidth: 900, textAlign: 'right'}}>{text}</div>
);

// the channel's lower-third (motion system: rule first, text second): a red rail rule draws, then the title plate
// slides in from the left and the subtitle follows a stagger later. Used for map captions, photo captions, and
// name/year labels on footage of people.
export const LowerThird: React.FC<{t: string; s?: string; at?: number; size?: number}> = ({t, s, at = 8, size = 54}) => {
	const f = useCurrentFrame();
	const {rule, text} = ruleThenText(f, at);
	const sub = arrive(f, at + DUR.micro + DUR.stagger * 2);
	return (
		<div style={{position: 'absolute', left: 70, bottom: 74, maxWidth: 1100, display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start'}}>
			{/* the rule spans the title plate, not the whole column */}
			<div style={{height: 6, width: `${rule * 100}%`, background: C.signal, marginBottom: 6}} />
			<div style={{opacity: text, transform: `translateX(${(1 - text) * -DIST.slide}px)`}}>
				<div style={{display: 'inline-block', background: C.ink, color: C.paper, fontFamily: FONT.head, fontSize: size, padding: '8px 26px', textTransform: 'uppercase', letterSpacing: '0.02em'}}>{t}</div>
			</div>
			{s && (
				<div style={{opacity: sub, transform: `translateX(${(1 - sub) * -DIST.slide}px)`}}>
					<div style={{marginTop: 8, display: 'inline-block', background: C.paper, color: C.ink, fontFamily: FONT.mono, fontSize: Math.round(size * 0.52), padding: '6px 18px', border: `2px solid ${C.ink}`}}>{s}</div>
				</div>
			)}
		</div>
	);
};
export const Cap: React.FC<{t: string; s?: string}> = ({t, s}) => <LowerThird t={t} s={s} />;

const Circle: React.FC<{c: NonNullable<PhotoSpec['circle']>; dur: number; w: number; h: number}> = ({c, dur, w, h}) => {
	const f = useCurrentFrame();
	const at = (c.at ?? 0.4) * dur;
	const p = interpolate(f, [at, at + 18], [0, 1], {...clamp, easing: ease});
	const L = 2 * Math.PI * c.r * Math.max(w, h) * 1.05;
	return (
		<svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
			<ellipse cx={c.x * w} cy={c.y * h} rx={c.r * w} ry={c.r * w * 0.8} fill="none" stroke={C.signal} strokeWidth={7} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - p)} transform={`rotate(-8 ${c.x * w} ${c.y * h})`} />
		</svg>
	);
};

export const Photo: React.FC<{s: PhotoSpec; dur: number}> = ({s, dur}) => {
	const f = useCurrentFrame();
	const t = interpolate(f, [0, dur], [0, 1], clamp);
	const mv = s.move ?? 'in';
	const scale = mv === 'in' ? 1.04 + 0.1 * t : mv === 'out' ? 1.14 - 0.1 * t : 1.1;
	const dx = mv === 'left' ? 40 - 80 * t : mv === 'right' ? -40 + 80 * t : 0;
	const dy = mv === 'up' ? 30 - 60 * t : 0;
	const [fx, fy] = s.focus ?? [0.5, 0.45];
	if (s.mount || isPrint(s.src)) {
		// a print on the desk, sized to the photo so nobody's head is cut off
		const ar = aspectOf(s.src);
		const H = Math.min(s.cap ? 690 : 820, 1400 / ar); // leave the caption's corner free
		const W = H * ar;
		return (
			<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, ${C.paper}, ${C.paperDark} 85%)`, alignItems: 'center', justifyContent: 'center'}}>
				<div style={{width: W + 48, padding: 24, background: '#F3EBD7', boxShadow: '0 30px 80px rgba(0,0,0,0.45)', transform: `rotate(${s.tilt ?? -1.5}deg) translateY(${(1 - interpolate(f, [0, 18], [0, 1], {...clamp, easing: easeOut})) * 60 - (s.cap ? 60 : 0)}px) scale(${1 + 0.04 * t})`}}>
					<div style={{width: W, height: H, overflow: 'hidden', position: 'relative', background: C.ink}}>
						<Img src={staticFile(s.src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${fx * 100}% ${fy * 100}%`, filter: GRADE}} />
						{s.circle && <Circle c={s.circle} dur={dur} w={W} h={H} />}
					</div>
					<div style={{fontFamily: FONT.mono, fontSize: 18, color: C.inkSoft, marginTop: 12}}>{s.credit}</div>
				</div>
				{s.cap && <Cap {...s.cap} />}
			</AbsoluteFill>
		);
	}
	return (
		<AbsoluteFill style={{background: C.night, overflow: 'hidden'}}>
			<AbsoluteFill style={{transform: `translate(${dx}px, ${dy}px) scale(${scale})`, transformOrigin: `${fx * 100}% ${fy * 100}%`}}>
				<Img src={staticFile(s.src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${fx * 100}% ${fy * 100}%`, filter: GRADE}} />
				{s.circle && <Circle c={s.circle} dur={dur} w={1920} h={1080} />}
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.5))'}} />
			{s.cap && <Cap {...s.cap} />}
			<SourceLine text={s.credit} />
		</AbsoluteFill>
	);
};

export const Film: React.FC<{s: FilmSpec; dur: number; clipFrames?: number}> = ({s, dur, clipFrames}) => {
	const f = useCurrentFrame();
	const rate = s.rate ?? 1;
	const start = Math.round((s.from ?? 0) * 30);
	const avail = clipFrames ? Math.max(30, Math.floor((clipFrames - start) / rate) - 2) : dur;
	const body = (
		<OffthreadVideo src={staticFile(`clips/${s.src}.mp4`)} startFrom={start} playbackRate={rate} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: GRADE, transform: `scale(${1.03 + f * 0.0002})`}} />
	);
	return (
		<AbsoluteFill style={{background: C.night}}>
			{avail < dur ? <Loop durationInFrames={avail}>{body}</Loop> : body}
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55))'}} />
			{s.cap && <Cap {...s.cap} />}
			<SourceLine text={s.credit} />
		</AbsoluteFill>
	);
};
