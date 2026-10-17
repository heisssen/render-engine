// Channel art of the example preset (BRAND in theme.ts): avatar (800x800 enamel railway badge), banner (2560x1440, safe area 1546x423),
// watermark (150x150). The banner is channel-wide: a film strip of turning points from every era.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {BRAND, C, FONT} from './theme';

const BRASS = ['#F3D995', '#B98E3A', '#F6E2A8', '#8A6726'];

// perspective turnout with sleepers, the red route peeling right toward a signal
const Turnout: React.FC<{lamp?: boolean}> = ({lamp = true}) => {
	const ties = Array.from({length: 11}, (_, i) => i);
	const y = (i: number) => 770 - Math.pow(i / 10, 0.8) * 420; // sleepers bunch up toward the horizon
	return (
		<g>
			{ties.map((i) => {
				const yy = y(i);
				const k = 1 - (i / 10) * 0.72;
				return <rect key={i} x={400 - 170 * k} y={yy} width={340 * k} height={16 * k + 3} rx={2} fill="#5B4A36" stroke="#2A2118" strokeWidth={2} />;
			})}
			{/* straight track to the horizon */}
			<path d="M 255 800 L 372 350" stroke={C.paper} strokeWidth={22} strokeLinecap="round" />
			<path d="M 545 800 L 428 350" stroke={C.paper} strokeWidth={22} strokeLinecap="round" />
			{/* the switch: our timeline */}
			<path d="M 520 700 C 500 560, 560 450, 690 390" stroke={C.signal} strokeWidth={22} strokeLinecap="round" fill="none" />
			<path d="M 330 760 C 380 560, 470 430, 640 355" stroke={C.signal} strokeWidth={22} strokeLinecap="round" fill="none" />
			{/* signal post and lamp */}
			<rect x={598} y={170} width={16} height={190} fill={C.paper} />
			<rect x={584} y={352} width={44} height={10} fill={C.paper} />
			{lamp && <circle cx={606} cy={170} r={150} fill="url(#glow)" />}
			<circle cx={606} cy={170} r={58} fill="#141A1C" stroke={C.paper} strokeWidth={10} />
			<circle cx={606} cy={170} r={36} fill={C.signal} />
			<circle cx={592} cy={154} r={10} fill="#FFE1DA" opacity={0.9} />
		</g>
	);
};

const Badge: React.FC<{size: number; text?: boolean}> = ({size, text = true}) => (
	<svg width={size} height={size} viewBox="0 0 800 800">
		<defs>
			<linearGradient id="brass" x1="0" y1="0" x2="1" y2="1">
				{BRASS.map((c, i) => (
					<stop key={i} offset={i / (BRASS.length - 1)} stopColor={c} />
				))}
			</linearGradient>
			<radialGradient id="enamel" cx="0.45" cy="0.35" r="0.75">
				<stop offset="0" stopColor="#24303A" />
				<stop offset="1" stopColor="#0E1316" />
			</radialGradient>
			<radialGradient id="sky" cx="0.72" cy="0.22" r="0.8">
				<stop offset="0" stopColor="#3A2420" />
				<stop offset="0.5" stopColor="#1A2226" />
				<stop offset="1" stopColor="#111719" />
			</radialGradient>
			<radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
				<stop offset="0" stopColor={C.signal} stopOpacity={0.8} />
				<stop offset="0.4" stopColor={C.signal} stopOpacity={0.25} />
				<stop offset="1" stopColor={C.signal} stopOpacity={0} />
			</radialGradient>
			<clipPath id="inner">
				<circle cx={400} cy={400} r={282} />
			</clipPath>
			<path id="arcTop" d="M 105 400 A 295 295 0 0 1 695 400" />
			<path id="arcBot" d="M 85 400 A 315 315 0 0 0 715 400" />
		</defs>
		{/* outer brass rim, enamel band, inner rim */}
		<circle cx={400} cy={400} r={392} fill="url(#brass)" />
		<circle cx={400} cy={400} r={372} fill="url(#enamel)" />
		<circle cx={400} cy={400} r={300} fill="url(#brass)" />
		<circle cx={400} cy={400} r={286} fill="url(#sky)" />
		<g clipPath="url(#inner)">
			{/* engraved graticule */}
			{[-3, -2, -1, 0, 1, 2, 3].map((k) => (
				<g key={k} stroke="#9FB1B6" strokeOpacity={0.12} strokeWidth={2} fill="none">
					<ellipse cx={400} cy={400} rx={Math.abs(k) * 90 || 1} ry={290} />
					<line x1={100} y1={400 + k * 80} x2={700} y2={400 + k * 80} />
				</g>
			))}
			<Turnout />
		</g>
		{text && (
			<g fontFamily={FONT.head} fontWeight={700} fill="url(#brass)" letterSpacing="10">
				<text fontSize={70}>
					<textPath href="#arcTop" startOffset="50%" textAnchor="middle">{BRAND.name}</textPath>
				</text>
				<text fontSize={40} letterSpacing="9">
					<textPath href="#arcBot" startOffset="50%" textAnchor="middle">· FIND THE SWITCH ·</textPath>
				</text>
			</g>
		)}
		{/* rivets */}
		{[0, 1, 2, 3].map((i) => {
			const a = (Math.PI / 2) * i + Math.PI / 4;
			return <circle key={i} cx={400 + Math.cos(a) * 382} cy={400 + Math.sin(a) * 382} r={6} fill="#6E5220" />;
		})}
	</svg>
);

export const Avatar: React.FC = () => (
	<AbsoluteFill style={{background: C.night, alignItems: 'center', justifyContent: 'center'}}>
		<Badge size={800} />
	</AbsoluteFill>
);

export const Watermark: React.FC = () => (
	<AbsoluteFill style={{background: 'transparent', alignItems: 'center', justifyContent: 'center'}}>
		<Badge size={150} text={false} />
	</AbsoluteFill>
);

// ---------- banner ----------
// ---- TV-only parts of the banner (desktop and phones crop them away) ----
// a station departures board with split-flap tiles: turning points as trains
const Flaps: React.FC<{text: string; n: number; size: number; color?: string}> = ({text, n, size, color = C.paper}) => (
	<div style={{display: 'flex', gap: size * 0.08}}>
		{text.padEnd(n).slice(0, n).split('').map((ch, i) => (
			<span key={i} style={{width: size * 0.66, height: size * 1.16, background: '#1D2224', color, fontFamily: FONT.head, fontWeight: 700, fontSize: size, lineHeight: `${size * 1.16}px`, textAlign: 'center', position: 'relative', borderRadius: 3, boxShadow: 'inset 0 -3px 0 rgba(0,0,0,0.6), inset 0 2px 0 rgba(255,255,255,0.04)'}}>
				{ch}
				<span style={{position: 'absolute', left: 0, right: 0, top: '50%', height: 2, background: 'rgba(0,0,0,0.7)'}} />
			</span>
		))}
	</div>
);
const DEPARTURES: [string, string, string, string, string, boolean][] = [
	['1066', 'HASTINGS', 'STAMFORD BRIDGE', '1', 'DELAYED', false],
	['1453', 'CONSTANTINOPLE', 'ADRIANOPLE', '2', 'BOARDING', false],
	['1812', 'MOSCOW', 'SMOLENSK', '3', 'TURNED BACK', false],
	['1962', 'HAVANA', 'THE BLOCKADE', '4', 'HELD AT SIGNAL', true],
];
const COLS = [4, 14, 15, 1, 14];
const Board: React.FC<{x: number; y: number}> = ({x, y}) => {
	const sz = 50;
	const head = ['TIME', 'DESTINATION', 'VIA', 'PL', 'REMARKS'];
	const colW = COLS.map((n) => n * sz * 0.74);
	const gap = 46;
	return (
		<div style={{position: 'absolute', left: x, top: y, transform: 'translateX(-50%)', padding: '22px 34px 28px', background: '#0E1213', border: `3px solid #2A3133`, boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 0 0 8px #151a1b'}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 16}}>
				<span style={{fontFamily: FONT.head, fontWeight: 700, fontSize: 40, letterSpacing: '0.18em', color: C.paper}}>DEPARTURES</span>
				<span style={{fontFamily: FONT.mono, fontSize: 22, letterSpacing: '0.2em', color: '#8C918C'}}>ABFAHRT · DÉPARTS · ВІДПРАВЛЕННЯ</span>
				<span style={{marginLeft: 'auto', width: 18, height: 18, borderRadius: 9, background: C.signal, boxShadow: `0 0 18px ${C.signal}`}} />
			</div>
			<div style={{display: 'flex', gap, marginBottom: 10}}>
				{head.map((h, i) => (
					<span key={h} style={{width: colW[i], fontFamily: FONT.mono, fontSize: 18, letterSpacing: '0.24em', color: '#8C918C'}}>{h}</span>
				))}
			</div>
			<div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
				{DEPARTURES.map((r) => (
					<div key={r[0] + r[1]} style={{display: 'flex', gap}}>
						{r.slice(0, 5).map((t, i) => (
							<div key={i} style={{width: colW[i]}}>
								<Flaps text={t as string} n={COLS[i]} size={sz * 0.92} color={i === 4 && r[5] ? C.signal : i === 0 ? '#E8C27A' : C.paper} />
							</div>
						))}
					</div>
				))}
			</div>
		</div>
	);
};

// a signal-box track diagram: the main line, a turnout for every era, one lever thrown
const SIGBOX_YEARS = ['476', '1066', '1258', '1453', '1521', '1588', '1644', '1776', '1812', '1914', '1962', '1989'];
const SignalBox: React.FC<{y: number}> = ({y}) => {
	const W = 2560;
	const x0 = 150, x1 = W - 150;
	const MY = y + 195;
	const step = (x1 - x0 - 200) / (SIGBOX_YEARS.length - 1);
	const thrown = SIGBOX_YEARS.indexOf('1962');
	return (
		<svg width={W} height={1440} style={{position: 'absolute', left: 0, top: 0}}>
			<defs>
				<filter id="lampglow" x="-100%" y="-100%" width="300%" height="300%">
					<feGaussianBlur stdDeviation={7} result="b" />
					<feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
				</filter>
			</defs>
			<rect x={90} y={y + 30} width={W - 180} height={440} rx={14} fill="#121718" stroke="#2A3133" strokeWidth={3} />
			<text x={130} y={y + 76} fontFamily={FONT.mono} fontSize={22} letterSpacing="5" fill="#8C918C">SIGNAL BOX · {BRAND.name} JUNCTION · ALL ERAS</text>
			{/* parallel loops above and below the main line */}
			<line x1={x0} y1={MY - 58} x2={x1} y2={MY - 58} stroke={C.paper} strokeOpacity={0.35} strokeWidth={5} />
			<line x1={x0} y1={MY + 58} x2={x1} y2={MY + 58} stroke={C.paper} strokeOpacity={0.35} strokeWidth={5} />
			<line x1={x0} y1={MY} x2={x1} y2={MY} stroke={C.paper} strokeWidth={7} />
			{SIGBOX_YEARS.map((yr, i) => {
				const x = x0 + 100 + i * step;
				const up = i % 2 === 0;
				const on = i === thrown;
				const ty = up ? MY - 58 : MY + 58;
				const col = on ? C.signal : C.paper;
				return (
					<g key={yr}>
						<path d={`M ${x - 60} ${MY} L ${x + 40} ${ty}`} stroke={col} strokeOpacity={on ? 1 : 0.55} strokeWidth={on ? 8 : 5} filter={on ? 'url(#lampglow)' : undefined} />
						<circle cx={x - 60} cy={MY} r={9} fill={on ? C.signal : '#121718'} stroke={col} strokeWidth={3} />
						<circle cx={x + 70} cy={up ? MY - 96 : MY + 96} r={13} fill={on ? C.signal : '#2E3436'} filter={on ? 'url(#lampglow)' : undefined} />
						<text x={x + 92} y={(up ? MY - 96 : MY + 96) + 9} fontFamily={FONT.head} fontWeight={700} fontSize={28} fill={on ? C.signal : '#B9B4A6'}>{yr}</text>
					</g>
				);
			})}
			{/* the lever frame */}
			{Array.from({length: 24}, (_, i) => {
				const lx = 300 + i * ((W - 600) / 23);
				const on = i === 20;
				return (
					<g key={`lv${i}`}>
						<rect x={lx - 12} y={y + 345 + (on ? -24 : 0)} width={24} height={86} rx={4} fill={on ? C.signal : '#C9C2B0'} opacity={on ? 1 : 0.55} />
						<text x={lx} y={y + 456} textAnchor="middle" fontFamily={FONT.mono} fontSize={16} fill="#6F7471">{i + 1}</text>
					</g>
				);
			})}
		</svg>
	);
};

// The banner shows in full only on TVs; desktop shows the centre strip (2560x423, y 508-931) and phones the middle
// 1546x423 of it. So everything that matters lives in that strip: a film strip of six turning points told through
// real period art and photographs (public domain, Wikimedia Commons; see public/banner/), toned to the channel's
// two inks, with the timeline track running under them and the wordmark across the middle.
const ERAS: {y: string; place: string; src: string; pos?: string}[] = [
	{y: '1066', place: 'Hastings', src: 'banner/1066.jpg', pos: '50% 40%'},
	{y: '1453', place: 'Constantinople', src: 'banner/1453.jpg', pos: '45% 50%'},
	{y: '1588', place: 'The Armada', src: 'banner/1588.jpg', pos: '50% 55%'},
	{y: '1776', place: 'Philadelphia', src: 'banner/1776.jpg', pos: '50% 45%'},
	{y: '1914', place: 'Berlin', src: 'banner/1914.jpg', pos: '30% 50%'},
	{y: '1962', place: 'Washington', src: 'banner/1962.jpg', pos: '55% 60%'},
];
export const Banner: React.FC = () => {
	const W = 2560, H = 1440;
	const S0 = 508, SH = 423; // the strip every device shows
	const PW = W / ERAS.length;
	const RY = S0 + SH - 46; // the track, near the bottom of the strip
	const ties = Array.from({length: Math.floor((W + 40) / 26)}, (_, i) => i * 26 - 10);
	return (
		<AbsoluteFill style={{background: C.night}}>
			<svg width={0} height={0} style={{position: 'absolute'}}>
				<filter id="bduo" colorInterpolationFilters="sRGB">
					<feColorMatrix type="saturate" values="0" />
					<feComponentTransfer>
						<feFuncR type="table" tableValues="0.05 0.42 0.95" />
						<feFuncG type="table" tableValues="0.06 0.36 0.89" />
						<feFuncB type="table" tableValues="0.06 0.30 0.78" />
					</feComponentTransfer>
				</filter>
			</svg>
			{/* TV-only surroundings: plain night with a paper grain, nothing competing with the strip */}
			<Img src={staticFile('paper_texture.jpg')} style={{position: 'absolute', inset: 0, width: W, height: H, objectFit: 'cover', mixBlendMode: 'overlay', opacity: 0.12}} />
			<div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(224,64,47,0.08), rgba(0,0,0,0) 70%)'}} />
			<Board x={1280} y={40} />
			<SignalBox y={950} />
			{/* the film strip of eras */}
			{ERAS.map((e, i) => (
				<div key={e.y} style={{position: 'absolute', left: i * PW + 3, top: S0, width: PW - 6, height: SH, overflow: 'hidden', background: '#000'}}>
					<Img src={staticFile(e.src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: e.pos, filter: 'url(#bduo) contrast(1.2) brightness(0.8)'}} />

				</div>
			))}
			{/* darken the middle for the wordmark, and the bottom for the track */}
			<div style={{position: 'absolute', left: 0, top: S0, width: W, height: SH, background: 'radial-gradient(ellipse 34% 52% at 50% 52%, rgba(11,15,16,0.94) 40%, rgba(11,15,16,0.55) 75%, rgba(11,15,16,0.25) 100%)'}} />
			<div style={{position: 'absolute', left: 0, top: S0 + SH - 120, width: W, height: 120, background: 'linear-gradient(180deg, rgba(11,15,16,0) 0%, rgba(11,15,16,0.85) 70%)'}} />
			<svg width={W} height={H} style={{position: 'absolute'}}>
				<defs>
					<filter id="redglow" x="-20%" y="-50%" width="140%" height="200%">
						<feGaussianBlur stdDeviation={5} result="b" />
						<feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
					</filter>
				</defs>
				<line x1={0} y1={S0} x2={W} y2={S0} stroke={C.signal} strokeWidth={6} />
				<line x1={0} y1={S0 + SH} x2={W} y2={S0 + SH} stroke={C.signal} strokeWidth={6} />
				{/* other tracks peel off at every era */}
				{ERAS.map((_, i) => {
					const x = i * PW + PW / 2;
					return (
						<g key={`o${i}`} filter="url(#redglow)">
							<path d={`M ${x - 50} ${RY - 7} C ${x + 10} ${RY - 7}, ${x + 40} ${RY - 22}, ${x + 92} ${RY - 38}`} fill="none" stroke={C.signal} strokeWidth={6} strokeLinecap="round" />
							<path d={`M ${x + 92} ${RY - 38} L ${x + 150} ${RY - 54}`} fill="none" stroke={C.signal} strokeWidth={6} strokeDasharray="10 9" strokeLinecap="round" opacity={0.8} />
						</g>
					);
				})}
				{ties.map((x) => (
					<rect key={x} x={x} y={RY - 15} width={11} height={30} rx={2} fill={C.paper} opacity={0.35} />
				))}
				<line x1={0} y1={RY - 7} x2={W} y2={RY - 7} stroke={C.paper} strokeWidth={5} />
				<line x1={0} y1={RY + 7} x2={W} y2={RY + 7} stroke={C.paper} strokeWidth={5} />
				{ERAS.map((_, i) => {
					const x = i * PW + PW / 2;
					return (
						<g key={`s${i}`}>
							<circle cx={x} cy={RY} r={15} fill={C.night} stroke={C.paper} strokeWidth={4} />
							<circle cx={x} cy={RY} r={7} fill={C.signal} />
						</g>
					);
				})}
			</svg>
			<AbsoluteFill>
				{ERAS.map((e, i) => (
					<div key={`l${e.y}`} style={{position: 'absolute', left: i * PW + PW / 2, top: S0 + 16, transform: 'translateX(-50%)', display: 'flex', alignItems: 'baseline', gap: 10, background: 'rgba(11,15,16,0.82)', padding: '2px 14px 4px', borderBottom: `3px solid ${C.signal}`, whiteSpace: 'nowrap'}}>
						<span style={{fontFamily: FONT.head, fontWeight: 700, fontSize: 34, color: C.paper}}>{e.y}</span>
						<span style={{fontFamily: FONT.display, fontStyle: 'italic', fontSize: 22, color: '#CFC7B4'}}>{e.place}</span>
					</div>
				))}
				<div style={{position: 'absolute', left: 0, right: 0, top: S0 + 78, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
					<div style={{fontFamily: FONT.head, fontWeight: 700, fontSize: 176, letterSpacing: '0.12em', color: C.paper, lineHeight: 1, marginRight: '-0.12em', textShadow: '0 6px 30px rgba(0,0,0,0.8)'}}>
						SWITCH<span style={{color: C.signal}}>YARD</span>
					</div>
					<div style={{display: 'flex', alignItems: 'center', gap: 30, marginTop: 4}}>
						<span style={{fontFamily: FONT.display, fontStyle: 'italic', fontSize: 50, color: C.paper}}>Find the switch.</span>
						<span style={{width: 10, height: 10, borderRadius: 5, background: C.signal}} />
						<span style={{fontFamily: FONT.mono, fontSize: 24, letterSpacing: '0.2em', color: '#C9C2B0', textTransform: 'uppercase'}}>History's turning points</span>
					</div>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
