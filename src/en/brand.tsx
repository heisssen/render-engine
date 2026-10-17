// Brand kit of the example preset (BRAND in theme.ts):
// glyph, split-flap type, title sting, act-break switch throw, timeline badge, NEXT DEPARTURE end screen.
// Motif: one rail line that forks. Ink/paper = real history, signal red = our timeline.
import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {BRAND, C, FONT, clamp, ease, easeOut} from './theme';

const up = (f: number, at: number, len = 16) => interpolate(f, [at, at + len], [0, 1], {...clamp, easing: easeOut});

export type Mode = 'real' | 'alt' | 'both';

export const Glyph: React.FC<{size?: number; split?: number; lamp?: number; draw?: number; color?: string}> = ({size = 64, split = 1, lamp = 1, draw = 1, color = C.paper}) => (
	<svg width={size * 1.6} height={size} viewBox="0 0 160 100" style={{overflow: 'visible'}}>
		<line x1={4} y1={64} x2={4 + 152 * draw} y2={64} stroke={color} strokeWidth={9} strokeLinecap="round" />
		{split > 0 && <path d={`M 58 64 L ${58 + 98 * split} ${64 - 46 * split}`} stroke={C.signal} strokeWidth={9} strokeLinecap="round" fill="none" />}
		<circle cx={146} cy={16} r={11} fill={C.signal} opacity={0.15 + 0.85 * lamp} />
		<circle cx={146} cy={16} r={19} fill="none" stroke={C.signal} strokeWidth={2} opacity={0.6 * lamp} />
	</svg>
);

// departure-board letters: each cell flips through random glyphs, then lands, left to right
const FLAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
export const SplitFlap: React.FC<{text: string; at?: number; size?: number; color?: string; bg?: string; stagger?: number; flips?: number; seed?: string}> = ({text, at = 0, size = 90, color = C.paper, bg = 'rgba(0,0,0,0.55)', stagger = 2, flips = 8, seed = 'sf'}) => {
	const f = useCurrentFrame();
	return (
		<div style={{display: 'flex', gap: size * 0.06}}>
			{text.split('').map((ch, i) => {
				const start = at + i * stagger;
				const t = f - start;
				if (t < 0) return <span key={i} style={{width: size * 0.62, height: size * 1.1, background: bg, display: 'inline-block', opacity: 0.4}} />;
				const landed = t >= flips;
				const shown = ch === ' ' ? ' ' : landed ? ch : FLAP[Math.floor(random(`${seed}${i}${t}`) * FLAP.length)];
				const half = (t % 1 === 0 && !landed) ? 0.5 : 0;
				return (
					<span key={i} style={{width: size * 0.62, height: size * 1.1, background: ch === ' ' ? 'transparent' : bg, color, fontFamily: FONT.head, fontWeight: 700, fontSize: size, lineHeight: `${size * 1.1}px`, textAlign: 'center', display: 'inline-block', position: 'relative', borderRadius: 3, boxShadow: ch === ' ' ? 'none' : 'inset 0 -2px 0 rgba(0,0,0,0.5)'}}>
						{shown}
						{ch !== ' ' && <span style={{position: 'absolute', left: 0, right: 0, top: '50%', height: 2, background: 'rgba(0,0,0,0.55)', opacity: 1 - half}} />}
					</span>
				);
			})}
		</div>
	);
};

// 3-second title sting after the cold open, drawn over the episode's own map (passed in as children)
export const Sting: React.FC<{title: string; children?: React.ReactNode}> = ({title, children}) => {
	const f = useCurrentFrame();
	const dim = interpolate(f, [0, 8], [0, 0.72], clamp);
	const draw = interpolate(f, [0, 16], [0, 1], {...clamp, easing: ease});
	const split = interpolate(f, [14, 26], [0, 1], {...clamp, easing: easeOut});
	const lamp = interpolate(f, [24, 27, 30, 33], [0, 1, 0.35, 1], clamp);
	const out = interpolate(f, [80, 90], [1, 0], clamp);
	return (
		<AbsoluteFill style={{opacity: out}}>
			{children}
			<AbsoluteFill style={{background: `rgba(18,23,24,${dim})`}} />
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<line x1={0} y1={640} x2={1920 * draw} y2={640} stroke={C.paper} strokeWidth={7} opacity={0.85} />
				<line x1={0} y1={656} x2={1920 * draw} y2={656} stroke={C.paper} strokeWidth={7} opacity={0.85} />
				<path d={`M 880 640 L ${880 + 1040 * split} ${640 - 420 * split}`} stroke={C.signal} strokeWidth={7} fill="none" />
				<path d={`M 880 656 L ${880 + 1040 * split} ${656 - 420 * split}`} stroke={C.signal} strokeWidth={7} fill="none" />
				<circle cx={1760} cy={210} r={26} fill={C.signal} opacity={0.15 + 0.85 * lamp} />
				<circle cx={1760} cy={210} r={44} fill="none" stroke={C.signal} strokeWidth={3} opacity={0.5 * lamp} />
			</svg>
			<div style={{position: 'absolute', left: 150, top: 330, display: 'flex', flexDirection: 'column', gap: 26}}>
				<SplitFlap text={BRAND.name} at={28} size={118} stagger={2} seed="st" />
				<div style={{opacity: up(f, 48, 12), fontFamily: FONT.mono, fontSize: 34, letterSpacing: '0.2em', color: C.paper, textTransform: 'uppercase'}}>{title}</div>
			</div>
		</AbsoluteFill>
	);
};

// act break: a rail sweeps across, the switch throws, the date lands on a split-flap board. No titles.
export const ActBreak: React.FC<{date: string; mode: Mode}> = ({date, mode}) => {
	const f = useCurrentFrame();
	const a = interpolate(f, [0, 6, 46, 56], [0, 0.82, 0.82, 0], clamp);
	if (a <= 0 && f > 10) return null;
	const sweep = interpolate(f, [0, 14], [0, 1], {...clamp, easing: ease});
	const split = interpolate(f, [12, 24], [0, 1], {...clamp, easing: easeOut});
	const col = mode === 'real' ? C.paper : C.signal;
	return (
		<AbsoluteFill style={{background: `rgba(18,23,24,${a})`}}>
			<svg width={1920} height={1080} style={{position: 'absolute', opacity: a / 0.82}}>
				<line x1={0} y1={560} x2={1920 * sweep} y2={560} stroke={C.rail} strokeWidth={6} />
				<path d={`M 760 560 L ${760 + 1160 * split} ${560 - 380 * split}`} stroke={col} strokeWidth={6} fill="none" />
			</svg>
			<div style={{position: 'absolute', left: 150, top: 610, opacity: a / 0.82}}>
				<SplitFlap text={date} at={14} size={84} stagger={2} seed={`ab${date}`} />
			</div>
		</AbsoluteFill>
	);
};

// chapter tag (documentary bible: a small persistent corner tag marks chapters, no full-screen cards): top-left,
// number + title; it arrives with the channel's red rail rule, sits bright for 4 s, then settles to a quieter level
export const ChapterTag: React.FC<{n: number; title: string}> = ({n, title}) => {
	const f = useCurrentFrame();
	const rule = interpolate(f, [0, 14], [0, 1], {...clamp, easing: easeOut});
	const p = interpolate(f, [5, 19], [0, 1], {...clamp, easing: easeOut});
	const calm = interpolate(f, [120, 150], [1, 0.62], clamp);
	return (
		<div style={{position: 'absolute', left: 56, top: 46, opacity: calm}}>
			<div style={{height: 4, width: `${rule * 100}%`, background: C.signal, marginBottom: 5}} />
			<div style={{display: 'flex', fontFamily: FONT.mono, fontSize: 22, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: p, transform: `translateX(${(1 - p) * -24}px)`}}>
				<span style={{background: C.paper, color: C.ink, padding: '6px 12px', fontWeight: 600}}>{String(n).padStart(2, '0')}</span>
				<span style={{background: 'rgba(18,23,24,0.86)', color: C.paper, padding: '6px 16px'}}>{title}</span>
			</div>
		</div>
	);
};

// which branch are we on? top-right, flips when the mode changes; carries the year
export const ModeBadge: React.FC<{mode: Mode; year?: string; changed: boolean}> = ({mode, year, changed}) => {
	const f = useCurrentFrame();
	const flip = changed ? up(f, 2, 12) : 1;
	const alt = mode === 'alt';
	const label = mode === 'real' ? 'REAL HISTORY' : mode === 'alt' ? 'OUR TIMELINE' : 'REAL vs OURS';
	return (
		<div style={{position: 'absolute', right: 56, top: 46, display: 'flex', alignItems: 'center', gap: 12, background: alt ? C.signal : C.night, color: C.paper, padding: '7px 16px 7px 10px', fontFamily: FONT.mono, fontSize: 22, letterSpacing: '0.14em', fontWeight: 600, opacity: 0.94, transform: `scaleY(${0.25 + 0.75 * flip})`, boxShadow: '0 6px 18px rgba(0,0,0,0.3)'}}>
			<Glyph size={22} split={alt ? 1 : mode === 'both' ? 0.5 : 0} lamp={alt ? 1 : 0.2} color={alt ? C.paper : C.rail} />
			{label}
			{year && <span style={{opacity: 0.75, marginLeft: 4}}>· {year}</span>}
		</div>
	);
};

export const EndScreen: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, ${C.night2}, ${C.night} 70%)`}}>
			<div style={{position: 'absolute', left: 120, top: 110, display: 'flex', flexDirection: 'column', gap: 18}}>
				<div style={{fontFamily: FONT.mono, fontSize: 26, letterSpacing: '0.3em', color: C.rail, opacity: up(f, 0)}}>COMING SOON</div>
				<SplitFlap text="THE TIMETABLE" at={4} size={72} stagger={1} seed="nd1" />
				<SplitFlap text="THAT STARTED A WAR" at={16} size={72} stagger={1} seed="nd2" />
			</div>
			{/* YouTube places the end-screen video element over this slot, and the subscribe element over the lamp */}
			<div style={{position: 'absolute', left: 120, top: 470, width: 900, height: 506, border: `3px solid ${C.rail}`, background: 'rgba(0,0,0,0.25)', opacity: up(f, 20)}} />
			<div style={{position: 'absolute', right: 190, top: 560, width: 300, height: 300, borderRadius: '50%', border: `4px solid ${C.signal}`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: up(f, 28)}}>
				<Glyph size={110} />
			</div>
			<div style={{position: 'absolute', right: 120, bottom: 56, fontFamily: FONT.mono, fontSize: 18, color: '#7E8988', opacity: up(f, dur * 0.3), textAlign: 'right', lineHeight: 1.5}}>
				Narration: AI voice (ElevenLabs). Research, script, maps and fact-check by humans.
				<br />
				Sources, archive credits and music licences in the description.
			</div>
		</AbsoluteFill>
	);
};

// 4-second seal after the end screen
export const Seal: React.FC = () => {
	const f = useCurrentFrame();
	const lamp = interpolate(f, [4, 8, 11, 14], [0, 1, 0.4, 1], clamp);
	return (
		<AbsoluteFill style={{background: C.night, alignItems: 'center', justifyContent: 'center', opacity: interpolate(f, [100, 120], [1, 0], clamp)}}>
			<Glyph size={160} lamp={lamp} />
		</AbsoluteFill>
	);
};
