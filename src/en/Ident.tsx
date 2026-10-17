// Ident of the example preset (BRAND in theme.ts), picked by an audience-panel vote over 7 other concepts:
// inside a signal box. The track diagram on the wall shows the line out of Berlin with the WEST route lit; in front,
// a row of levers. The red lever tagged 1914 is thrown (anticipation, clunk), relays click, the WEST route goes dark,
// the switch blade on the diagram flips and the EAST route lights up in red, lamp by lamp. the BRAND name lights up on
// the panel's sign, the episode title comes in on its own plate under the diagram (nothing overlaps it), a held
// beat, then we fly into the last red lamp.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {arrive, ruleThenText} from './motion';
import {BRAND, C, FONT, clamp} from './theme';

// 5.5 s, no held beat (the panel preferred the tight cut). Same length as the old train ident, so the
// episode timings don't move.
export const IDENT_FRAMES = 195; // 6.5 s: the 5.5 s cut felt rushed to the owner

// One ident for the whole channel; each episode only swaps its data (story.ts EPISODE.ident).
export type IdentData = {year: string; station: string; real: string; alt: string};
const DEFAULT_IDENT: IdentData = {year: '1914', station: 'BERLIN', real: 'WEST', alt: 'EAST'};

// the story beats, in frames (mix.py places its sounds on the same numbers)
export const IDENT_T = {
	lampsOn: [8, 34],
	grip: [40, 54], // lever leans back a touch before the throw
	pull: [54, 70],
	clunk: 68,
	relays: [70, 75, 80],
	westOff: [71, 82],
	blade: [72, 80],
	eastDraw: [78, 106],
	flare: 106,
	sign: [110, 134],
	plate: [130, 144],
	fly: [168, 195],
};
const T = IDENT_T;

const sm = (a: number, b: number, x: number) => {
	const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
	return t * t * (3 - 2 * t);
};
// the lever is thrown like everything in the motion system: fast start, firm stop, no overshoot
const back = (a: number, b: number, x: number) => arrive(x, a, b - a);

const BRASS = C.rail; // motion system: no extra hues, the box is ink and rail grey, the switch is signal red
const UNLIT = '#2C3437';
const PANEL = {x: 150, y: 80, w: 1620, h: 580};
const JX = 860, JY = 445; // junction on the diagram
const WEST_Y = 330, EAST_Y = 545, END_X = 1600;

// route geometry: straight out of Berlin, a curve at the junction, then straight to the end
const route = (toY: number) => `M 420 ${JY} L ${JX} ${JY} C ${JX + 120} ${JY}, ${JX + 120} ${toY}, ${JX + 240} ${toY} L ${END_X} ${toY}`;
const ROUTE_LEN = 440 + 300 + (END_X - JX - 240); // close enough for dash drawing
const stationW = (name: string) => Math.max(170, 40 + name.length * 24);
const lampsOn = (toY: number) => Array.from({length: 7}, (_, i) => [JX + 300 + i * ((END_X - JX - 300) / 6), toY] as const);

const Diagram: React.FC<{f: number; d: IdentData}> = ({f, d}) => {
	const westLit = sm(T.lampsOn[0], T.lampsOn[1], f) * (1 - sm(T.westOff[0], T.westOff[1], f));
	const east = sm(T.eastDraw[0], T.eastDraw[1], f);
	const blade = sm(T.blade[0], T.blade[1], f);
	const flare = interpolate(f, [T.flare, T.flare + 3, T.flare + 7, T.flare + 12], [0, 1, 0.45, 0.9], clamp);
	const westLamps = lampsOn(WEST_Y);
	const eastLamps = lampsOn(EAST_Y);
	return (
		<g>
			{/* base track, unlit */}
			<path d={route(WEST_Y)} fill="none" stroke={UNLIT} strokeWidth={14} strokeLinecap="round" />
			<path d={route(EAST_Y)} fill="none" stroke={UNLIT} strokeWidth={14} strokeLinecap="round" />
			{/* WEST route lit (cream), fades when the lever is thrown */}
			<path d={route(WEST_Y)} fill="none" stroke={C.paper} strokeWidth={10} strokeLinecap="round" opacity={westLit} />
			{/* EAST route draws in red */}
			<path d={route(EAST_Y)} fill="none" stroke={C.signal} strokeWidth={12} strokeLinecap="round" strokeDasharray={`${ROUTE_LEN * east} ${ROUTE_LEN * 2}`} style={{filter: east > 0 ? `drop-shadow(0 0 ${10 * east}px ${C.signal})` : undefined}} />
			{/* the switch blade on the diagram */}
			{/* the points: a short blade lying on the track, its tip nudging from the upper to the lower branch */}
			<line x1={JX - 36} y1={JY} x2={JX + 34} y2={JY - 7 + 14 * blade} stroke={blade > 0.5 ? C.signal : C.paper} strokeWidth={8} strokeLinecap="round" />
			<circle cx={JX - 36} cy={JY} r={8} fill={C.night} stroke={blade > 0.5 ? C.signal : C.paper} strokeWidth={3} />
			{/* the station the line leaves from (box grows to the left with the name) */}
			<rect x={420 - stationW(d.station)} y={JY - 34} width={stationW(d.station)} height={68} rx={8} fill={C.night} stroke={C.paper} strokeWidth={4} />
			<text x={420 - stationW(d.station) / 2} y={JY + 12} textAnchor="middle" fontFamily={FONT.head} fontWeight={700} fontSize={34} fill={C.paper} letterSpacing="3">{d.station}</text>
			{/* lamps along both routes */}
			{westLamps.map(([x, y], i) => {
				const on = sm(T.lampsOn[0] + i * 3, T.lampsOn[0] + i * 3 + 6, f) * (1 - sm(T.westOff[0] + i, T.westOff[0] + i + 5, f));
				return <circle key={`w${i}`} cx={x} cy={y} r={10} fill={on > 0.05 ? C.paper : UNLIT} opacity={0.35 + 0.65 * on} />;
			})}
			{eastLamps.map(([x, y], i) => {
				const at = T.eastDraw[0] + 6 + i * 4;
				const on = sm(at, at + 5, f);
				return (
					<g key={`e${i}`}>
						{on > 0 && <circle cx={x} cy={y} r={30} fill={C.signal} opacity={0.18 * on} />}
						<circle cx={x} cy={y} r={11} fill={on > 0.05 ? C.signal : UNLIT} />
					</g>
				);
			})}
			{/* terminals */}
			<text x={END_X + 30} y={WEST_Y + 12} fontFamily={FONT.head} fontWeight={700} fontSize={36} letterSpacing="4" fill={C.paper} opacity={0.25 + 0.75 * westLit}>{d.real}</text>
			<text x={END_X + 30} y={EAST_Y + 12} fontFamily={FONT.head} fontWeight={700} fontSize={36} letterSpacing="4" fill={east > 0.9 ? C.signal : UNLIT}>{d.alt}</text>
			{/* the last red lamp flares: the fly-in target */}
			<circle cx={END_X} cy={EAST_Y} r={90} fill={C.signal} opacity={0.22 * flare} />
			<circle cx={END_X} cy={EAST_Y} r={20} fill={C.signal} opacity={east > 0.95 ? 1 : 0} />
		</g>
	);
};

// one lever seen from the front: a rod from the frame, a handle on top, a number plate on the frame.
// `pull` 0..1 = thrown toward the camera: the rod foreshortens and the handle grows (no sideways tilt);
// `lean` is the small backward lean before the throw.
const LEN = 290;
const Lever: React.FC<{x: number; pull?: number; lean?: number; red?: boolean; n: number; tag?: string}> = ({x, pull = 0, lean = 0, red, n, tag}) => {
	const len = LEN * (1 - 0.5 * pull) + 14 * lean;
	const hs = 1 + 0.45 * pull; // handle scale
	const col = red ? C.signal : '#C9C2B0';
	return (
		<g>
			<g transform={`translate(${x} 1030)`}>
				<rect x={-11 * (1 + 0.2 * pull)} y={-len} width={22 * (1 + 0.2 * pull)} height={len} rx={6} fill={col} stroke="#0B0F10" strokeWidth={3} />
				<rect x={-16} y={-len * 0.72} width={32} height={40} rx={4} fill="#0B0F10" opacity={0.25} />
				<g transform={`translate(0 ${-len}) scale(${hs})`}>
					<rect x={-30} y={-34} width={60} height={42} rx={10} fill={col} stroke="#0B0F10" strokeWidth={3} />
				</g>
				{red && (
					<g transform={`translate(0 ${-len * 0.62}) scale(${1 + 0.25 * pull})`}>
						<rect x={-46} y={0} width={92} height={50} rx={6} fill={C.paper} stroke="#0B0F10" strokeWidth={3} />
						<text y={36} textAnchor="middle" fontFamily={FONT.head} fontWeight={700} fontSize={34} fill={C.night}>{tag}</text>
					</g>
				)}
			</g>
			<rect x={x - 22} y={1040} width={44} height={26} rx={4} fill="#1D2224" stroke={BRASS} strokeWidth={2} />
			<text x={x} y={1060} textAnchor="middle" fontFamily={FONT.mono} fontSize={16} fill={BRASS}>{n}</text>
		</g>
	);
};

const Sign: React.FC<{f: number}> = ({f}) => {
	const word = BRAND.name.split('');
	return (
		<div style={{position: 'absolute', left: PANEL.x, width: PANEL.w, top: PANEL.y + 26, display: 'flex', justifyContent: 'center', gap: 10}}>
			{word.map((ch, i) => {
				const on = interpolate(f, [T.sign[0] + i * 2.6, T.sign[0] + i * 2.6 + 2, T.sign[0] + i * 2.6 + 4, T.sign[0] + i * 2.6 + 7], [0, 1, 0.4, 1], clamp);
				const col = i >= BRAND.accentFrom ? C.signal : C.paper;
				return (
					<span key={i} style={{fontFamily: FONT.head, fontWeight: 700, fontSize: 132, lineHeight: 1, letterSpacing: '0.06em', color: on > 0.05 ? col : UNLIT, opacity: 0.35 + 0.65 * on, textShadow: on > 0.05 ? `0 0 ${24 * on}px ${col}` : 'none'}}>
						{ch}
					</span>
				);
			})}
		</div>
	);
};

export const Ident: React.FC<{title: string; data?: IdentData}> = ({title, data = DEFAULT_IDENT}) => {
	const f = useCurrentFrame();
	const fadeIn = sm(0, 14, f);
	const push = 1 + 0.06 * sm(0, T.fly[0], f);
	const fly = sm(T.fly[0], T.fly[1], f);
	// lever: leans back during the grip, then thrown forward and stops dead (no overshoot)
	const grip = sm(T.grip[0], T.grip[1], f);
	const thrown = back(T.pull[0], T.pull[1], f);
	const lean = grip * (1 - thrown);
	const shake = f >= T.clunk && f < T.clunk + 8 ? Math.sin((f - T.clunk) * 2.4) * (8 - (f - T.clunk)) * 0.9 : 0;
	const {rule: titleRule, text: titleIn} = ruleThenText(f, T.plate[0]);
	const levers = Array.from({length: 13}, (_, i) => ({x: 200 + i * 127, n: i + 8}));
	return (
		<AbsoluteFill style={{background: C.night, opacity: fadeIn * (1 - sm(T.fly[1] - 6, T.fly[1], f))}}>
			<AbsoluteFill style={{transform: `scale(${push * (1 + fly * 7)}) translateY(${shake}px)`, transformOrigin: `${END_X}px ${EAST_Y}px`}}>
				{/* the box: dark planked wall */}
				<AbsoluteFill style={{background: 'linear-gradient(180deg, #161D1F 0%, #101516 70%, #0B0F10 100%)'}} />
				<svg width={1920} height={1080} style={{position: 'absolute'}}>
					{Array.from({length: 12}, (_, i) => (
						<line key={i} x1={0} y1={i * 92} x2={1920} y2={i * 92} stroke="#000" strokeOpacity={0.25} strokeWidth={2} />
					))}
					{/* the diagram panel */}
					<rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} rx={18} fill="#0E1413" stroke={BRASS} strokeWidth={6} />
					<rect x={PANEL.x + 14} y={PANEL.y + 14} width={PANEL.w - 28} height={160} rx={10} fill="#0A0E0E" stroke={BRASS} strokeOpacity={0.5} strokeWidth={2} />
					<text x={PANEL.x + 36} y={PANEL.y + 214} fontFamily={FONT.mono} fontSize={18} letterSpacing="5" fill={C.rail}>SIGNAL BOX · {BRAND.name} JUNCTION · {data.year}</text>
					<Diagram f={f} d={data} />
					<rect x={0} y={1024} width={1920} height={56} fill="#1D2224" />
					<rect x={0} y={1020} width={1920} height={8} fill={BRASS} opacity={0.7} />
					{levers.map((l, i) => (
						<Lever key={i} x={l.x} n={l.n} red={i === 6} tag={data.year} pull={i === 6 ? thrown : 0} lean={i === 6 ? lean : 0} />
					))}
				</svg>
				<Sign f={f} />
				{/* the episode title as the channel's lower-third under the diagram: red rail rule first, then the paper plate */}
				<div style={{position: 'absolute', left: PANEL.x + 40, width: PANEL.w - 80, top: PANEL.y + PANEL.h - 74, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
					<div style={{height: 5, width: `${titleRule * 60}%`, background: C.signal, marginBottom: 6}} />
					<div style={{opacity: titleIn, transform: `translateY(${(1 - titleIn) * 16}px)`, background: C.paper, padding: '6px 28px', fontFamily: FONT.mono, fontWeight: 600, fontSize: 30, letterSpacing: '0.14em', color: C.ink, textTransform: 'uppercase', whiteSpace: 'nowrap'}}>
						{title}
					</div>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
