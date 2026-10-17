// EP01 thumbnails, 1280x720, three variants for YouTube's Test & Compare.
// Real photos only (no generated images): period photos and a 1914 newspaper war map, all public domain, toned to the
// channel's two inks (night -> paper) so that only signal red is colour. Rules from the competitor sheet
// (out/thumbs/ref_sheet.jpg): one big real face with a white keyline, 1-3 huge words or one hand-written hook,
// nothing important bottom-right (timestamp), readable at 168 px wide.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, FONT} from './theme';

const marker = FONT.marker;

// duotone: luminance mapped from night ink to paper cream
const Duotone: React.FC = () => (
	<svg width={0} height={0} style={{position: 'absolute'}}>
		<filter id="duo" colorInterpolationFilters="sRGB">
			<feColorMatrix type="saturate" values="0" />
			<feComponentTransfer>
				<feFuncR type="table" tableValues="0.07 0.45 0.98" />
				<feFuncG type="table" tableValues="0.05 0.36 0.90" />
				<feFuncB type="table" tableValues="0.04 0.27 0.74" />
			</feComponentTransfer>
		</filter>
	</svg>
);

const Photo: React.FC<{src: string; left: number; top: number; width: number; contrast?: number}> = ({src, left, top, width, contrast = 1.25}) => (
	<Img src={staticFile(src)} style={{position: 'absolute', left, top, width, filter: `url(#duo) contrast(${contrast})`}} />
);

const Vignette: React.FC<{strength?: number}> = ({strength = 0.65}) => (
	<AbsoluteFill style={{background: `radial-gradient(ellipse at 55% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,${strength}) 100%)`}} />
);

const KEYLINE = 'drop-shadow(6px 0 0 #fff) drop-shadow(-6px 0 0 #fff) drop-shadow(0 6px 0 #fff) drop-shadow(0 -6px 0 #fff)';
const Hero: React.FC<{src: string; x: number; y: number; h: number; flip?: boolean}> = ({src, x, y, h, flip}) => (
	<Img src={staticFile(src)} style={{position: 'absolute', left: x, top: y, height: h, transform: flip ? 'scaleX(-1)' : undefined, filter: `grayscale(1) contrast(1.3) brightness(1.05) ${KEYLINE} drop-shadow(16px 14px 0 rgba(0,0,0,0.55))`}} />
);

const Caption: React.FC<{lines: React.ReactNode[]; x: number; y: number; size: number; rot?: number}> = ({lines, x, y, size, rot = -3}) => (
	<div style={{position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg)`, display: 'flex', flexDirection: 'column', gap: 4}}>
		{lines.map((l, i) => (
			<div key={i} style={{fontFamily: FONT.head, fontWeight: 700, fontSize: size, lineHeight: 0.95, color: C.paper, WebkitTextStroke: '13px #0B0F10', paintOrder: 'stroke fill', textShadow: '12px 12px 0 rgba(0,0,0,0.6)', whiteSpace: 'nowrap'}}>
				{l}
			</div>
		))}
	</div>
);

// hand-written red marker on top of the photo
const Scrawl: React.FC<{text: string; x: number; y: number; size: number; rot?: number}> = ({text, x, y, size, rot = -6}) => (
	<div style={{position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg)`, fontFamily: marker, fontSize: size, color: C.signal, lineHeight: 1, whiteSpace: 'nowrap', WebkitTextStroke: '8px #fff', paintOrder: 'stroke fill', textShadow: '8px 8px 0 rgba(0,0,0,0.55)'}}>
		{text}
	</div>
);

// a marker strike: a slightly wobbly thick red stroke with a white edge
const Strike: React.FC<{x1: number; y1: number; x2: number; y2: number; w?: number}> = ({x1, y1, x2, y2, w = 18}) => {
	const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - 6;
	const d = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
	return (
		<svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0}}>
			<path d={d} stroke="#fff" strokeWidth={w + 10} strokeLinecap="round" fill="none" />
			<path d={d} stroke={C.signal} strokeWidth={w} strokeLinecap="round" fill="none" />
		</svg>
	);
};

// a marker cross-out: a tight zigzag across a word
const Scribble: React.FC<{x1: number; x2: number; y: number; h: number}> = ({x1, x2, y, h}) => {
	const n = 7;
	const pts = Array.from({length: n + 1}, (_, i) => `${x1 + ((x2 - x1) * i) / n},${y + (i % 2 ? h / 2 : -h / 2) + (i - n / 2) * 1.5}`);
	const d = `M ${pts.join(' L ')}`;
	return (
		<svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0}}>
			<path d={d} stroke="#fff" strokeWidth={24} strokeLinecap="round" strokeLinejoin="round" fill="none" />
			<path d={d} stroke={C.signal} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" fill="none" />
		</svg>
	);
};

// marker arrow with a hand-drawn head
type XY = [number, number];
const MarkerArrow: React.FC<{a: XY; b: XY; bend?: number; w?: number}> = ({a, b, bend = 0.15, w = 26}) => {
	const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
	const c: XY = [(a[0] + b[0]) / 2 - dy * bend, (a[1] + b[1]) / 2 + dx * bend];
	const tx = b[0] - c[0], ty = b[1] - c[1];
	const tl = Math.hypot(tx, ty);
	const ux = tx / tl, uy = ty / tl;
	const L = w * 3.2;
	const h1: XY = [b[0] - ux * L - uy * L * 0.75, b[1] - uy * L + ux * L * 0.75];
	const h2: XY = [b[0] - ux * L + uy * L * 0.75, b[1] - uy * L - ux * L * 0.75];
	const d = `M ${a[0]} ${a[1]} Q ${c[0]} ${c[1]} ${b[0]} ${b[1]} M ${h1[0]} ${h1[1]} L ${b[0]} ${b[1]} L ${h2[0]} ${h2[1]}`;
	return (
		<svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0}}>
			<path d={d} transform="translate(9 9)" stroke="rgba(0,0,0,0.5)" strokeWidth={w + 10} strokeLinecap="round" strokeLinejoin="round" fill="none" />
			<path d={d} stroke="#fff" strokeWidth={w + 12} strokeLinecap="round" strokeLinejoin="round" fill="none" />
			<path d={d} stroke={C.signal} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none" />
		</svg>
	);
};

const MarkerX: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
	<>
		<Strike x1={x - s / 2} y1={y - s / 2} x2={x + s / 2} y2={y + s / 2} w={24} />
		<Strike x1={x + s / 2} y1={y - s / 2} x2={x - s / 2} y2={y + s / 2} w={24} />
	</>
);

const Mark: React.FC<{top?: boolean}> = ({top}) => (
	<div style={{position: 'absolute', left: 22, ...(top ? {top: 22} : {bottom: 22}), display: 'flex', alignItems: 'center', gap: 10, background: '#0B0F10', padding: '5px 14px 5px 6px', borderLeft: `6px solid ${C.signal}`}}>
		<Img src={staticFile('channel/avatar.png')} style={{width: 36, height: 36, borderRadius: '50%'}} />
		<span style={{fontFamily: FONT.head, fontWeight: 700, fontSize: 24, letterSpacing: '0.12em', color: C.paper}}>
			SWITCH<span style={{color: C.signal}}>YARD</span>
		</span>
	</div>
);

// A: the chalk on the troop train said "to Paris" (Aug 1914). Zoomed in so "Paris" reads in any language;
// crossed out, with the counterfactual written over it in English.
export const ThumbA: React.FC = () => (
	<AbsoluteFill style={{background: '#0B0F10'}}>
		<Duotone />
		<Photo src="thumbs/train.jpg" left={-675} top={-417} width={2000} contrast={1.55} />
		<Vignette strength={0.5} />
		<Strike x1={660} y1={556} x2={910} y2={526} w={28} />
		<Scrawl text="MOSCOW?" x={420} y={300} size={150} rot={-6} />
		<Mark top />
	</AbsoluteFill>
);

// B: the payoff question. The Kaiser (1902 portrait, mirrored so he faces east) over the 1914 atlas, arrow to Russia.
export const ThumbB: React.FC = () => (
	<AbsoluteFill style={{background: '#0B0F10'}}>
		<Img src={staticFile('thumbs/europe1914.jpg')} style={{position: 'absolute', left: -465, top: -197, width: 2004, filter: 'saturate(1.35) contrast(1.15) brightness(1.02)'}} />
		<Vignette strength={0.55} />
		<MarkerArrow a={[560, 470]} b={[1200, 400]} bend={0.12} w={34} />
		<Hero src="thumbs/kaiser1902_cut.png" x={-30} y={90} h={900} flip />
		<Caption lines={[<>GERMANY</>, <span style={{color: C.signal}}>WINS?</span>]} x={600} y={18} size={150} rot={-3} />
		<Mark top />
	</AbsoluteFill>
);

// ---------- B variants: the owner's favourite style, fixing the panel's two notes ----------
// (the portrait was misread as Hitler -> name him; "GERMANY WINS?" read as clickbait -> try the plan's own words)
const NameTag: React.FC<{text: string; x: number; y: number}> = ({text, x, y}) => (
	<div style={{position: 'absolute', left: x, top: y, background: '#0B0F10', color: C.paper, fontFamily: FONT.head, fontWeight: 700, fontSize: 34, letterSpacing: '0.08em', padding: '6px 16px', borderLeft: `8px solid ${C.signal}`, transform: 'rotate(-2deg)', boxShadow: '6px 6px 0 rgba(0,0,0,0.5)'}}>{text}</div>
);
const BBase: React.FC<{children: React.ReactNode}> = ({children}) => (
	<AbsoluteFill style={{background: '#0B0F10'}}>
		<Img src={staticFile('thumbs/europe1914.jpg')} style={{position: 'absolute', left: -465, top: -197, width: 2004, filter: 'saturate(1.35) contrast(1.15) brightness(1.02)'}} />
		<Vignette strength={0.55} />
		<MarkerArrow a={[560, 470]} b={[1200, 400]} bend={0.12} w={34} />
		<Hero src="thumbs/kaiser1902_cut.png" x={-30} y={90} h={900} flip />
		{children}
		<Mark top />
	</AbsoluteFill>
);
// B2: B with the Kaiser named
export const ThumbB2: React.FC = () => (
	<BBase>
		<Caption lines={[<>GERMANY</>, <span style={{color: C.signal}}>WINS?</span>]} x={600} y={18} size={150} rot={-3} />
		<NameTag text="KAISER WILHELM II" x={70} y={600} />
	</BBase>
);
// B3: B with the plan's own words instead of the outcome
export const ThumbB3: React.FC = () => (
	<BBase>
		<Caption lines={[<>EAST</>, <span style={{color: C.signal}}>FIRST?</span>]} x={640} y={18} size={160} rot={-3} />
		<NameTag text="KAISER WILHELM II" x={70} y={600} />
	</BBase>
);
// B4: B with Moltke, the man who said no, beside the Kaiser
export const ThumbB4: React.FC = () => (
	<BBase>
		<Hero src="thumbs/moltke_cut.png" x={930} y={330} h={420} />
		<Caption lines={[<>GERMANY</>, <span style={{color: C.signal}}>WINS?</span>]} x={600} y={18} size={150} rot={-3} />
		<NameTag text="KAISER WILHELM II" x={70} y={600} />
	</BBase>
);

// ---------- minimal set (motion system: clarity over decoration) ----------
// One real subject, a flat ground, 1-3 words in the channel type, exactly one signal-red element. No marker scrawl,
// no stickers. Readable at 168 px; nothing important bottom-right.
const Word: React.FC<{children: React.ReactNode; x: number; y: number; size: number; color?: string; align?: 'left' | 'right'}> = ({children, x, y, size, color = C.ink, align = 'left'}) => (
	<div style={{position: 'absolute', [align]: x, top: y, fontFamily: FONT.head, fontWeight: 700, fontSize: size, lineHeight: 0.92, color, textTransform: 'uppercase', letterSpacing: '0.01em', whiteSpace: 'nowrap', textAlign: align}}>{children}</div>
);
const Cutout: React.FC<{src: string; x: number; y: number; h: number; flip?: boolean; dark?: boolean}> = ({src, x, y, h, flip, dark}) => (
	<Img src={staticFile(src)} style={{position: 'absolute', left: x, top: y, height: h, transform: flip ? 'scaleX(-1)' : undefined, filter: `grayscale(1) contrast(1.25) brightness(${dark ? 1.08 : 1.02}) drop-shadow(0 24px 40px rgba(0,0,0,${dark ? 0.6 : 0.35}))`}} />
);
const RedArrow: React.FC<{x: number; y: number; len: number; w?: number}> = ({x, y, len, w = 34}) => (
	<svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0}}>
		<path d={`M ${x} ${y} L ${x + len - w * 1.6} ${y}`} stroke={C.signal} strokeWidth={w} strokeLinecap="butt" />
		<path d={`M ${x + len - w * 2.2} ${y - w * 1.5} L ${x + len} ${y} L ${x + len - w * 2.2} ${y + w * 1.5} Z`} fill={C.signal} />
	</svg>
);

// D: the Kaiser on paper, facing east, one word and one red arrow
export const ThumbD: React.FC = () => (
	<AbsoluteFill style={{background: `radial-gradient(ellipse at 40% 45%, ${C.paper}, ${C.paperDark} 90%)`}}>
		<Cutout src="thumbs/kaiser1902_cut.png" x={-20} y={60} h={760} flip />
		<Word x={600} y={170} size={260}>East</Word>
		<RedArrow x={612} y={500} len={560} />
		<Word x={612} y={590} size={40} color={C.inkSoft}>Wilhelm II · 1914</Word>
	</AbsoluteFill>
);

// E: the real 1914 atlas, drained to paper, one red line east out of Berlin, one word
export const ThumbE: React.FC = () => (
	<AbsoluteFill style={{background: C.paper}}>
		<Img src={staticFile('thumbs/europe1914.jpg')} style={{position: 'absolute', left: -700, top: -330, width: 2500, filter: 'grayscale(1) contrast(0.9) brightness(1.12) sepia(0.25)', opacity: 0.85}} />
		<RedArrow x={420} y={420} len={760} w={40} />
		<div style={{position: 'absolute', left: 404, top: 404, width: 32, height: 32, borderRadius: '50%', background: C.ink, border: `6px solid ${C.paper}`}} />
		<Word x={60} y={60} size={190}>East?</Word>
	</AbsoluteFill>
);

// F: Moltke in the dark, three words: the man who refused
export const ThumbF: React.FC = () => (
	<AbsoluteFill style={{background: `radial-gradient(ellipse at 70% 45%, ${C.night2}, #07090A 85%)`}}>
		<Cutout src="thumbs/moltke_cut.png" x={600} y={40} h={720} dark />
		<Word x={70} y={150} size={170} color={C.paper}>He said</Word>
		<Word x={70} y={320} size={250} color={C.signal}>No.</Word>
	</AbsoluteFill>
);

// G: the real chalk on the troop train ("nach Paris"), bright and tight, one clean strike and one word
export const ThumbG: React.FC = () => (
	<AbsoluteFill style={{background: C.paper}}>
		<Img src={staticFile('thumbs/train.jpg')} style={{position: 'absolute', left: -675, top: -417, width: 2000, filter: 'grayscale(1) contrast(1.35) brightness(1.25)'}} />
		<svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0}}>
			<path d="M 650 548 L 930 522" stroke={C.signal} strokeWidth={30} strokeLinecap="round" />
		</svg>
		<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 240, background: C.paper}} />
		<Word x={60} y={50} size={180}>Moscow?</Word>
	</AbsoluteFill>
);

// C: a real 1914 atlas map (Bartholomew), marked up: no to Paris, yes to Moscow
export const ThumbC: React.FC = () => (
	<AbsoluteFill style={{background: '#0B0F10'}}>
		<Img src={staticFile('thumbs/europe1914.jpg')} style={{position: 'absolute', left: 0, top: -11, width: 1280, filter: 'saturate(1.3) contrast(1.15) brightness(1.02)'}} />
		<Vignette strength={0.6} />
		<MarkerArrow a={[600, 440]} b={[330, 565]} bend={-0.1} w={20} />
		<MarkerX x={455} y={505} s={120} />
		<MarkerArrow a={[650, 405]} b={[1170, 175]} bend={0.14} w={32} />
		<Hero src="thumbs/moltke_cut.png" x={880} y={270} h={470} />
		<Caption lines={[<>EAST</>, <span style={{color: C.signal}}>FIRST?</span>]} x={34} y={14} size={135} rot={-4} />
		<Mark />
	</AbsoluteFill>
);
