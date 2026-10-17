// A real printed page (memoir, document collection, newspaper) laid over the scene while the narrator quotes it:
// the scan pushes in on the quoted lines, a highlighter runs over them, and a German page gets its English line
// beside it. Pages and their highlight boxes come from public/docs/memoirs/quotes.json (verified against the scans).
import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {SourceLine} from './Media';
import {C, FONT, clamp, ease, easeOut} from './theme';
import quotes from '../../public/docs/memoirs/quotes.json';

type Quote = {id: string; file: string; author: string; work: string; edition_year: number; page: number | string; language: string; english_text: string; highlight_box: [number, number, number, number]; image_size: [number, number]; cite: string; who: string};
const BY_ID = Object.fromEntries((quotes as unknown as Quote[]).map((q) => [q.id, q]));
export const hasPage = (id: string) => !!BY_ID[id];

export const PageView: React.FC<{id: string; frames: number}> = ({id, frames}) => {
	const f = useCurrentFrame();
	const q = BY_ID[id];
	if (!q) return null;
	const [x0, y0, x1, y1] = q.highlight_box;
	const [iw, ih] = q.image_size;
	const translated = q.language !== 'en';
	// the sheet: a window onto the page, wide for an English page, leaving room for the translation otherwise
	const maxW = translated ? 1080 : 1440, maxH = 860;
	// scale so the quoted lines fill most of the sheet's width (never blown up past the scan's own pixels much)
	const bw = Math.max(200, x1 - x0), bh = Math.max(40, y1 - y0);
	const fit = Math.min((maxW * 0.86) / bw, (maxH * 0.55) / bh, 1.6);
	const t = f / Math.max(1, frames);
	const s = fit * (0.9 + 0.1 * interpolate(t, [0, 1], [0, 1], {...clamp, easing: ease}));
	// the sheet never shows more than the page itself (no empty paper beside a narrow scan)
	const SW = Math.min(maxW, iw * fit * 0.9), SH = Math.min(maxH, ih * fit * 0.9);
	const left = translated ? 90 + (maxW - SW) / 2 : (1920 - SW) / 2, top = 100 + (maxH - SH) / 2;
	const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
	// keep the page's own edges inside the sheet where possible: the camera stops at the paper's border
	const tx = Math.min(0, Math.max(SW - iw * s, SW / 2 - cx * s));
	const ty = Math.min(0, Math.max(SH - ih * s, SH / 2 - cy * s));
	const inP = interpolate(f, [0, 10], [0, 1], {...clamp, easing: easeOut});
	const outP = interpolate(f, [frames - 8, frames], [0, 1], {...clamp, easing: ease});
	const mark = interpolate(f, [12, 34], [0, 1], {...clamp, easing: ease}); // the highlighter runs left to right
	const textP = interpolate(f, [20, 34], [0, 1], {...clamp, easing: easeOut});
	const dim = interpolate(f, [0, 6], [0, 0.94], clamp) * (1 - outP); // map notes and captions must not show through
	const words = q.english_text.split(/\s+/).length;
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{background: `rgba(18,23,24,${dim})`}} />
			<div style={{position: 'absolute', left, top, width: SW, height: SH, overflow: 'hidden', background: '#EFE6CF', boxShadow: '0 30px 80px rgba(0,0,0,0.55)', opacity: Math.min(1, inP * 1.4) * (1 - outP), transform: `translateY(${(1 - inP) * 60}px) rotate(${translated ? -0.8 : 0.6}deg)`}}>
				<div style={{position: 'absolute', left: tx, top: ty, width: iw * s, height: ih * s}}>
					<Img src={staticFile(`docs/memoirs/${q.file}`)} style={{width: '100%', height: '100%', display: 'block', filter: 'sepia(0.25) contrast(1.08)'}} />
					<div style={{position: 'absolute', left: (x0 - 10) * s, top: (y0 - 6) * s, width: (bw + 20) * s * mark, height: (bh + 12) * s, background: 'rgba(224,64,47,0.30)', mixBlendMode: 'multiply'}} />
				</div>
				<div style={{position: 'absolute', inset: 0, boxShadow: 'inset 0 0 90px rgba(60,40,10,0.35)', pointerEvents: 'none'}} />
			</div>
			{translated && (
				<div style={{position: 'absolute', left: left + SW + 60, right: 80, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: textP * (1 - outP), transform: `translateX(${(1 - textP) * 30}px)`}}>
					<div style={{height: 6, width: 90, background: C.signal, marginBottom: 26}} />
					<div style={{fontFamily: FONT.display, fontStyle: 'italic', fontSize: words > 20 ? 40 : words > 12 ? 48 : 58, lineHeight: 1.22, color: C.paper, textShadow: '0 4px 18px rgba(0,0,0,0.6)'}}>“{q.english_text}”</div>
					<div style={{fontFamily: FONT.mono, fontSize: 20, color: C.paper, opacity: 0.75, marginTop: 26, letterSpacing: '0.04em', textTransform: 'uppercase'}}>{q.who}</div>
				</div>
			)}
			<SourceLine text={q.cite} />
		</AbsoluteFill>
	);
};
