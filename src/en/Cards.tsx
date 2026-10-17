import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, FONT, Side, clamp, ease, easeOut} from './theme';
import {EndScreen} from './brand';

export type CardSpec =
	| {k: 'quote'; text: string; who: string; pre?: string}
	| {k: 'telegram'; head: string; text: string; stamp?: string; reply?: string}
	| {k: 'bars'; title: string; groups: {label?: string; rows: {l: string; v: number; txt: string; c?: Side}[]}[]; max: number; note?: string}
	| {k: 'versus'; a: {t: string; s: string; dir: string}; b: {t: string; s: string; dir: string}}
	| {k: 'doc'; title: string; lines: string[]; stamp: string; head?: string}
	| {k: 'big'; lines: string[]; sub?: string; light?: boolean}
	| {k: 'options'; title: string; items: {t: string; p: number; s?: string; c?: Side}[]}
	| {k: 'people'; items: {n: string; real: string; alt: string}[]; title?: string}
	| {k: 'headline'; paper: string; head: string; sub: string}
	| {k: 'blocs'; items: {t: string; who: string; want: string; c: Side}[]}
	| {k: 'stats'; items: {big: string; small: string; c?: Side}[]; title?: string}
	| {k: 'end'};

const up = (f: number, at: number, len = 16) => interpolate(f, [at, at + len], [0, 1], {...clamp, easing: easeOut});

// якщо під карткою йде хроніка, фон стає напівпрозорим
export const OverFootage = React.createContext(false);
// paper props over archival film (motion system): the film plays full frame; a telegram / document / front page sits
// on the right at two thirds size with its shadow, the film darkened only on that side; quotes and big lines are set
// straight onto the film over a dark gradient from the left
export type PropMode = 'paper' | 'text' | null;
export const PropContext = React.createContext<PropMode>(null);

const Paper: React.FC<{children: React.ReactNode; dark?: boolean}> = ({children, dark}) => {
	const over = React.useContext(OverFootage);
	const prop = React.useContext(PropContext);
	if (over && prop === 'paper')
		return (
			<AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(14,18,20,0) 25%, rgba(14,18,20,0.45) 60%, rgba(14,18,20,0.7) 100%)'}}>
				<AbsoluteFill style={{transform: 'translateX(22%) scale(0.64)'}}>{children}</AbsoluteFill>
			</AbsoluteFill>
		);
	if (over && prop === 'text')
		return <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(14,18,20,0.86) 0%, rgba(14,18,20,0.62) 50%, rgba(14,18,20,0.12) 100%)'}}>{children}</AbsoluteFill>;
	const bg = over
		? dark
			? 'radial-gradient(ellipse at 50% 45%, rgba(20,26,28,0.3), rgba(14,18,20,0.78) 82%)'
			: 'radial-gradient(ellipse at 50% 45%, rgba(230,222,203,0.5), rgba(214,204,180,0.82) 88%)'
		: dark
			? `radial-gradient(ellipse at 50% 40%, ${C.night2}, ${C.night} 70%)`
			: `radial-gradient(ellipse at 50% 40%, ${C.paper}, ${C.paperDark} 85%)`;
	return <AbsoluteFill style={{background: bg}}>{children}</AbsoluteFill>;
};

const Quote: React.FC<{s: Extract<CardSpec, {k: 'quote'}>; dur: number}> = ({s, dur}) => {
	const f = useCurrentFrame();
	const words = s.text.split(' ');
	const n = interpolate(f, [8, Math.max(20, dur * 0.55)], [0, words.length], clamp);
	return (
		<Paper dark>
			<AbsoluteFill style={{padding: '0 200px', justifyContent: 'center'}}>
				{s.pre && <div style={{fontFamily: FONT.mono, fontSize: 30, color: C.gold, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 30, opacity: up(f, 0)}}>{s.pre}</div>}
				<div style={{fontFamily: FONT.display, fontStyle: 'italic', fontSize: s.text.length > 70 ? 74 : 92, lineHeight: 1.22, color: C.paper}}>
					<span style={{color: C.gold}}>“</span>
					{words.map((w, i) => (
						<span key={i} style={{opacity: interpolate(n - i, [0, 1], [0.08, 1], clamp)}}>
							{w}{' '}
						</span>
					))}
					<span style={{color: C.gold, opacity: n >= words.length ? 1 : 0}}>”</span>
				</div>
				<div style={{marginTop: 46, display: 'flex', alignItems: 'center', gap: 24, opacity: up(f, dur * 0.4)}}>
					<div style={{width: 90, height: 3, background: C.gold}} />
					<div style={{fontFamily: FONT.mono, fontSize: 34, color: C.paper, letterSpacing: '0.06em'}}>{s.who}</div>
				</div>
			</AbsoluteFill>
		</Paper>
	);
};

const Telegram: React.FC<{s: Extract<CardSpec, {k: 'telegram'}>; dur: number}> = ({s, dur}) => {
	const f = useCurrentFrame();
	const chars = Math.floor(interpolate(f, [12, Math.max(30, dur * (s.reply ? 0.4 : 0.6))], [0, s.text.length], clamp));
	const rIn = s.reply ? up(f, dur * 0.5, 20) : 0;
	const tilt = interpolate(f, [0, 20], [-4, -1.5], {...clamp, easing: easeOut});
	return (
		<Paper dark>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
				<div
					style={{
						width: 1340,
						background: '#EFE3BE',
						padding: '54px 70px 64px',
						transform: `rotate(${tilt}deg) translateY(${(1 - up(f, 0, 18)) * 80}px)`,
						boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
						position: 'relative',
					}}
				>
					<div style={{display: 'flex', justifyContent: 'space-between', borderBottom: `3px double ${C.ink}`, paddingBottom: 16, marginBottom: 32, fontFamily: FONT.head, fontSize: 40, letterSpacing: '0.18em', color: C.ink}}>
						<span>TELEGRAM</span>
						<span style={{fontFamily: FONT.mono, fontSize: 28, letterSpacing: '0.05em', alignSelf: 'end'}}>{s.head}</span>
					</div>
					<div style={{fontFamily: FONT.mono, fontSize: 44, lineHeight: 1.45, color: C.ink, textTransform: 'uppercase', minHeight: 200}}>
						{s.text.slice(0, chars)}
						<span style={{opacity: f % 16 < 8 && chars < s.text.length ? 1 : 0}}>▌</span>
					</div>
					{s.reply && (
						<div style={{marginTop: 30, paddingTop: 22, borderTop: `2px dashed ${C.ink}`, opacity: rIn, fontFamily: FONT.mono, fontSize: 40, color: C.ent, textTransform: 'uppercase'}}>{s.reply}</div>
					)}
					{s.stamp && (
						<div
							style={{
								position: 'absolute',
								right: 60,
								bottom: 40,
								border: `6px solid ${C.ent}`,
								color: C.ent,
								fontFamily: FONT.head,
								fontSize: 54,
								padding: '6px 22px',
								letterSpacing: '0.1em',
								transform: `rotate(-12deg) scale(${interpolate(f, [dur * 0.62, dur * 0.62 + 6], [2.2, 1], clamp)})`,
								opacity: up(f, dur * 0.62, 4) * 0.9,
							}}
						>
							{s.stamp}
						</div>
					)}
				</div>
			</AbsoluteFill>
		</Paper>
	);
};

const Bars: React.FC<{s: Extract<CardSpec, {k: 'bars'}>; dur: number}> = ({s, dur}) => {
	const f = useCurrentFrame();
	let idx = 0;
	const total = s.groups.reduce((a, g) => a + g.rows.length, 0);
	const step = Math.min(24, (dur * 0.5) / total);
	return (
		<Paper>
			<AbsoluteFill style={{padding: '110px 170px', gap: 30}}>
				<div style={{fontFamily: FONT.head, fontSize: 72, color: C.ink, lineHeight: 1.1, opacity: up(f, 0)}}>{s.title}</div>
				{s.groups.map((g, gi) => (
					<div key={gi} style={{display: 'flex', flexDirection: 'column', gap: 18, marginTop: 14}}>
						{g.label && <div style={{fontFamily: FONT.mono, fontSize: 30, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase'}}>{g.label}</div>}
						{g.rows.map((r) => {
							const at = 10 + idx++ * step;
							const p = interpolate(f, [at, at + 30], [0, 1], {...clamp, easing: ease});
							return (
								<div key={r.l} style={{display: 'grid', gridTemplateColumns: '380px 1fr', alignItems: 'center', gap: 26, opacity: up(f, at, 10)}}>
									<div style={{fontFamily: FONT.mono, fontSize: 34, color: C.ink}}>{r.l}</div>
									<div style={{display: 'flex', alignItems: 'center', gap: 22}}>
										<div style={{height: 54, width: `${(r.v / s.max) * 100 * p * 0.82}%`, minWidth: 6, background: C[r.c ?? 'ger'], border: `2.5px solid ${C.ink}`}} />
										<div style={{fontFamily: FONT.head, fontSize: 50, color: C.ink, opacity: p}}>{r.txt}</div>
									</div>
								</div>
							);
						})}
					</div>
				))}
				{s.note && <div style={{marginTop: 'auto', fontFamily: FONT.mono, fontSize: 28, color: C.muted, opacity: up(f, dur * 0.5)}}>{s.note}</div>}
			</AbsoluteFill>
		</Paper>
	);
};

const Versus: React.FC<{s: Extract<CardSpec, {k: 'versus'}>; dur: number}> = ({s, dur}) => {
	const f = useCurrentFrame();
	const side = (x: {t: string; s: string; dir: string}, i: number) => {
		const p = up(f, i * dur * 0.35, 22);
		return (
			<div style={{flex: 1, background: i ? C.ger : C.ent, color: C.paper, padding: '0 80px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 26, opacity: 0.25 + 0.75 * p, transform: `translateY(${(1 - p) * 60}px)`}}>
				<div style={{fontFamily: FONT.head, fontSize: 200, lineHeight: 1}}>{x.dir}</div>
				<div style={{fontFamily: FONT.head, fontSize: 74, lineHeight: 1.05}}>{x.t}</div>
				<div style={{fontFamily: FONT.mono, fontSize: 32, lineHeight: 1.4, maxWidth: 680}}>{x.s}</div>
			</div>
		);
	};
	return (
		<AbsoluteFill style={{flexDirection: 'row'}}>
			{side(s.a, 0)}
			<div style={{width: 10, background: C.night}} />
			{side(s.b, 1)}
		</AbsoluteFill>
	);
};

const Doc: React.FC<{s: Extract<CardSpec, {k: 'doc'}>; dur: number}> = ({s, dur}) => {
	const f = useCurrentFrame();
	return (
		<Paper dark>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
				<div style={{width: 1080, minHeight: 760, background: '#EDE6D2', padding: '70px 90px', boxShadow: '0 30px 90px rgba(0,0,0,0.6)', position: 'relative', transform: `rotate(1.5deg) translateY(${(1 - up(f, 0, 20)) * 100}px)`}}>
					<div style={{fontFamily: FONT.mono, fontSize: 26, color: C.muted, letterSpacing: '0.2em'}}>{s.head ?? 'GEHEIM · GROSSER GENERALSTAB'}</div>
					<div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 86, color: C.ink, marginTop: 24, lineHeight: 1.05}}>{s.title}</div>
					<div style={{marginTop: 40, display: 'flex', flexDirection: 'column', gap: 22}}>
						{s.lines.map((l, i) => (
							<div key={i} style={{fontFamily: FONT.mono, fontSize: 36, color: C.ink, opacity: up(f, 14 + i * 12)}}>
								— {l}
							</div>
						))}
					</div>
					<div
						style={{
							position: 'absolute',
							right: 70,
							bottom: 70,
							border: `7px solid ${C.ent}`,
							color: C.ent,
							fontFamily: FONT.head,
							fontSize: 64,
							padding: '8px 26px',
							letterSpacing: '0.08em',
							transform: `rotate(-14deg) scale(${interpolate(f, [dur * 0.55, dur * 0.55 + 6], [2.4, 1], clamp)})`,
							opacity: up(f, dur * 0.55, 4) * 0.88,
						}}
					>
						{s.stamp}
					</div>
				</div>
			</AbsoluteFill>
		</Paper>
	);
};

const Big: React.FC<{s: Extract<CardSpec, {k: 'big'}>; dur: number}> = ({s, dur}) => {
	const f = useCurrentFrame();
	const step = Math.min(40, (dur * 0.6) / s.lines.length);
	return (
		<Paper dark={!s.light}>
			<AbsoluteFill style={{padding: '0 170px', justifyContent: 'center', gap: 10}}>
				{s.lines.map((l, i) => {
					const p = up(f, 6 + i * step, 18);
					return (
						<div key={i} style={{fontFamily: FONT.head, fontWeight: 700, fontSize: s.lines.length > 3 ? 104 : 132, lineHeight: 1.08, textTransform: 'uppercase', color: s.light ? C.ink : i === s.lines.length - 1 && s.lines.length > 1 ? C.gold : C.paper, opacity: p, transform: `translateX(${(1 - p) * -60}px)`}}>
							{l}
						</div>
					);
				})}
				{s.sub && <div style={{marginTop: 30, fontFamily: FONT.mono, fontSize: 36, color: s.light ? C.muted : '#A9B3B2', opacity: up(f, 6 + s.lines.length * step)}}>{s.sub}</div>}
			</AbsoluteFill>
		</Paper>
	);
};

const Options: React.FC<{s: Extract<CardSpec, {k: 'options'}>; dur: number}> = ({s, dur}) => {
	const f = useCurrentFrame();
	const step = (dur * 0.7) / s.items.length;
	return (
		<Paper>
			<AbsoluteFill style={{padding: '100px 170px', gap: 34}}>
				<div style={{fontFamily: FONT.head, fontSize: 76, color: C.ink, opacity: up(f, 0)}}>{s.title}</div>
				{s.items.map((it, i) => {
					const at = 8 + i * step;
					const p = interpolate(f, [at, at + 30], [0, 1], {...clamp, easing: ease});
					return (
						<div key={i} style={{display: 'grid', gridTemplateColumns: '200px 1fr', gap: 34, alignItems: 'center', opacity: up(f, at, 10)}}>
							<div style={{fontFamily: FONT.head, fontSize: 108, color: C[it.c ?? 'gold'], textAlign: 'right'}}>{Math.round(it.p * p)}%</div>
							<div>
								<div style={{fontFamily: FONT.head, fontSize: 52, color: C.ink, lineHeight: 1.1}}>{it.t}</div>
								{it.s && <div style={{fontFamily: FONT.mono, fontSize: 28, color: C.muted, marginTop: 6}}>{it.s}</div>}
								<div style={{height: 12, background: C.paperDark, marginTop: 12}}>
									<div style={{height: '100%', width: `${it.p * p}%`, background: C[it.c ?? 'gold']}} />
								</div>
							</div>
						</div>
					);
				})}
			</AbsoluteFill>
		</Paper>
	);
};

const People: React.FC<{s: Extract<CardSpec, {k: 'people'}>; dur: number}> = ({s, dur}) => {
	const f = useCurrentFrame();
	const n = s.items.length;
	const step = (dur * 0.6) / n;
	return (
		<Paper>
			<AbsoluteFill style={{padding: '90px 120px', gap: 40, justifyContent: 'center'}}>
				{s.title && <div style={{fontFamily: FONT.head, fontSize: 72, color: C.ink, opacity: up(f, 0)}}>{s.title}</div>}
				<div style={{display: 'grid', gridTemplateColumns: `repeat(${Math.min(n, 3)}, 1fr)`, gap: 40, width: n === 1 ? 1100 : n === 2 ? 1500 : undefined, alignSelf: 'center'}}>
					{s.items.map((it, i) => {
						const p = up(f, 6 + i * step, 18);
						const flip = up(f, 6 + i * step + Math.max(18, step * 0.55), 16);
						return (
							<div key={i} style={{background: '#EFE8D6', border: `3px solid ${C.ink}`, padding: '34px 36px', opacity: p, transform: `translateY(${(1 - p) * 50}px)`, boxShadow: '8px 8px 0 rgba(30,39,42,0.25)', minHeight: n > 3 ? 0 : 520}}>
								<div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: n > 3 ? 54 : 70, color: C.ink, lineHeight: 1}}>{it.n}</div>
								<div style={{fontFamily: FONT.mono, fontSize: 24, color: C.muted, marginTop: 22, letterSpacing: '0.08em'}}>REAL HISTORY</div>
								<div style={{fontFamily: FONT.mono, fontSize: n > 3 ? 27 : 31, color: C.inkSoft, marginTop: 6, lineHeight: 1.35, textDecoration: flip > 0.5 ? 'line-through' : 'none', textDecorationColor: C.ent, textDecorationThickness: 4}}>{it.real}</div>
								<div style={{fontFamily: FONT.mono, fontSize: 24, color: C.ger, marginTop: 22, letterSpacing: '0.08em', opacity: flip}}>OUR TIMELINE</div>
								<div style={{fontFamily: FONT.head, fontSize: n > 3 ? 38 : 46, color: C.ger, marginTop: 6, lineHeight: 1.15, opacity: flip}}>{it.alt}</div>
							</div>
						);
					})}
				</div>
			</AbsoluteFill>
		</Paper>
	);
};

const Headline: React.FC<{s: Extract<CardSpec, {k: 'headline'}>; dur: number}> = ({s, dur}) => {
	const f = useCurrentFrame();
	const cross = interpolate(f, [dur * 0.45, dur * 0.45 + 14], [0, 1], {...clamp, easing: ease});
	return (
		<Paper dark>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
				<div style={{width: 1300, background: '#E9E2CC', padding: '40px 70px 60px', boxShadow: '0 30px 90px rgba(0,0,0,0.6)', transform: `rotate(-2deg) scale(${interpolate(f, [0, dur], [1, 1.06])})`, position: 'relative'}}>
					<div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 92, textAlign: 'center', color: C.ink, borderBottom: `5px double ${C.ink}`, paddingBottom: 10}}>{s.paper}</div>
					<div style={{fontFamily: FONT.mono, fontSize: 24, textAlign: 'center', color: C.muted, margin: '10px 0 30px'}}>AUGUST 1914 · ONE PENNY</div>
					<div style={{fontFamily: FONT.head, fontWeight: 700, fontSize: 132, textAlign: 'center', color: C.ink, lineHeight: 1, position: 'relative'}}>
						{s.head}
						<div style={{position: 'absolute', left: '-2%', top: '52%', height: 18, width: `${104 * cross}%`, background: C.ent, transform: 'rotate(-3deg)'}} />
					</div>
					<div style={{fontFamily: FONT.display, fontSize: 40, textAlign: 'center', color: C.inkSoft, marginTop: 26}}>{s.sub}</div>
					<div style={{position: 'absolute', right: 40, bottom: -30, background: C.ent, color: C.paper, fontFamily: FONT.head, fontSize: 52, padding: '10px 30px', opacity: up(f, dur * 0.5), transform: 'rotate(4deg)'}}>NOT IN THIS TIMELINE</div>
				</div>
			</AbsoluteFill>
		</Paper>
	);
};

const Blocs: React.FC<{s: Extract<CardSpec, {k: 'blocs'}>; dur: number}> = ({s, dur}) => {
	const f = useCurrentFrame();
	return (
		<Paper>
			<AbsoluteFill style={{padding: '120px 110px', flexDirection: 'row', gap: 36}}>
				{s.items.map((it, i) => {
					const p = up(f, 8 + i * (dur * 0.2), 20);
					return (
						<div key={i} style={{flex: 1, borderTop: `14px solid ${C[it.c]}`, background: '#EFE8D6', padding: '40px 40px', opacity: p, transform: `translateY(${(1 - p) * 60}px)`, display: 'flex', flexDirection: 'column', gap: 26}}>
							<div style={{fontFamily: FONT.head, fontSize: 66, color: C[it.c]}}>{it.t}</div>
							<div style={{fontFamily: FONT.mono, fontSize: 31, color: C.ink, lineHeight: 1.4}}>{it.who}</div>
							<div style={{marginTop: 'auto', fontFamily: FONT.display, fontStyle: 'italic', fontSize: 40, color: C.inkSoft, lineHeight: 1.25}}>{it.want}</div>
						</div>
					);
				})}
			</AbsoluteFill>
		</Paper>
	);
};

const Stats: React.FC<{s: Extract<CardSpec, {k: 'stats'}>; dur: number}> = ({s, dur}) => {
	const f = useCurrentFrame();
	return (
		<Paper dark>
			<AbsoluteFill style={{padding: '0 150px', justifyContent: 'center', gap: 60}}>
				{s.title && <div style={{fontFamily: FONT.mono, fontSize: 34, color: C.gold, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: up(f, 0)}}>{s.title}</div>}
				<div style={{display: 'flex', gap: 80}}>
					{s.items.map((it, i) => {
						const p = up(f, 8 + i * (dur * 0.28), 18);
						return (
							<div key={i} style={{flex: 1, opacity: p, transform: `translateY(${(1 - p) * 40}px)`}}>
								<div style={{fontFamily: FONT.head, fontWeight: 700, fontSize: 150, color: it.c ? C[it.c] : C.paper, lineHeight: 1}}>{it.big}</div>
								<div style={{fontFamily: FONT.mono, fontSize: 34, color: '#B9C2C0', marginTop: 20, lineHeight: 1.35}}>{it.small}</div>
							</div>
						);
					})}
				</div>
			</AbsoluteFill>
		</Paper>
	);
};

const End: React.FC<{dur: number}> = ({dur}) => <EndScreen dur={dur} />;

export const Card: React.FC<{spec: CardSpec; dur: number}> = ({spec, dur}) => {
	switch (spec.k) {
		case 'quote':
			return <Quote s={spec} dur={dur} />;
		case 'telegram':
			return <Telegram s={spec} dur={dur} />;
		case 'bars':
			return <Bars s={spec} dur={dur} />;
		case 'versus':
			return <Versus s={spec} dur={dur} />;
		case 'doc':
			return <Doc s={spec} dur={dur} />;
		case 'big':
			return <Big s={spec} dur={dur} />;
		case 'options':
			return <Options s={spec} dur={dur} />;
		case 'people':
			return <People s={spec} dur={dur} />;
		case 'headline':
			return <Headline s={spec} dur={dur} />;
		case 'blocs':
			return <Blocs s={spec} dur={dur} />;
		case 'stats':
			return <Stats s={spec} dur={dur} />;
		case 'end':
			return <End dur={dur} />;
	}
};
