import React from 'react';
import {geoContains, geoGraticule10, geoMercator, geoPath, GeoProjection} from 'd3-geo';
import {AbsoluteFill, Img, continueRender, delayRender, getInputProps, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Bounds, EU, LAKES, LAND, P, PLACES, RELIEF, RIVERS, SIDE_OF} from './geo';
import {JUNCTIONS, RAIL1914, RAIL_CAPITALS, STATIONS, route} from './rail1914';
import {C, FONT, Side, clamp, ease, easeOut} from './theme';

export type Layer =
	| {t: 'front'; pts: P[]; style?: 'main' | 'real' | 'blk' | 'rail'; at?: number; dur?: number}
	| {t: 'arrow'; a: P; b: P; c: Side; at?: number; bend?: number; w?: number}
	| {t: 'region'; pts: P[]; c: Side; dash?: boolean; hatch?: boolean; at?: number}
	| {t: 'note'; p: P; text: string; at?: number; big?: boolean; c?: Side}
	| {t: 'city'; keys: string[]; at?: number}
	| {t: 'fort'; keys: string[]; at?: number}
	| {t: 'country'; names: string[]; c: Side | 'neutral'; at?: number}
	| {t: 'cross'; p: P; at?: number}
	| {t: 'ring'; p: P; at?: number; c?: Side}
	| {t: 'unit'; p: P; label: string; c: Side; at?: number} // stamped army block
	| {t: 'route'; via: string[]; at?: number; dur?: number; label?: boolean}; // a train route along 1914 lines (station keys from rail1914.ts)

export type MapSpec = {
	k: 'map';
	view: Bounds;
	from?: Bounds;
	layers: Layer[];
	keep?: boolean;
	cap?: {t: string; s?: string};
	stat?: {big: string; small: string; at?: number; c?: Side};
	title?: {t: string; s?: string; at: number};
	railnet?: boolean; // draw the 1914 railway network underneath (default: on)
};

const W = 1920;
const H = 1080;

// render-speed switches, all on by default; `--props='{"mapOff":"clip,coast"}'` turns some off to measure them
const OFF = new Set(String((getInputProps() as {mapOff?: string}).mapOff ?? '').split(','));
const OPT = {clip: !OFF.has('clip'), coast: !OFF.has('coast'), rough: !OFF.has('rough')};

export const proj = (b: Bounds): GeoProjection =>
	geoMercator().fitExtent(
		[
			[70, 70],
			[W - 70, H - 70],
		],
		{type: 'MultiPoint', coordinates: [b[0], b[1]]},
	);

// плавна камера: центр лінійно, масштаб геометрично
const lerpBounds = (a: Bounds, b: Bounds, t: number, zoom = 1): Bounds => {
	const ca = [(a[0][0] + a[1][0]) / 2, (a[0][1] + a[1][1]) / 2];
	const cb = [(b[0][0] + b[1][0]) / 2, (b[0][1] + b[1][1]) / 2];
	const sa = [a[1][0] - a[0][0], a[1][1] - a[0][1]];
	const sb = [b[1][0] - b[0][0], b[1][1] - b[0][1]];
	const c = [ca[0] + (cb[0] - ca[0]) * t, ca[1] + (cb[1] - ca[1]) * t];
	const s = [0, 1].map((i) => Math.exp(Math.log(sa[i]) + (Math.log(sb[i]) - Math.log(sa[i])) * t) * zoom);
	return [
		[c[0] - s[0] / 2, c[1] - s[1] / 2],
		[c[0] + s[0] / 2, c[1] + s[1] / 2],
	];
};

const COUNTRY_LABELS: [P, string][] = [
	[[2.4, 46.9], 'FRANCE'],
	[[10.3, 51.6], 'GERMANY'],
	[[18.2, 47.3], 'AUSTRIA-HUNGARY'],
	[[37, 57.6], 'RUSSIA'],
	[[-2.2, 53.0], 'BRITAIN'],
	[[12.4, 42.9], 'ITALY'],
	[[25, 45.6], 'ROMANIA'],
	[[4.6, 50.55], 'BELGIUM'],
	[[5.6, 52.4], 'NETHERLANDS'],
	[[32, 39.6], 'OTTOMAN EMPIRE'],
	[[-3.5, 40.2], 'SPAIN'],
	[[16, 62.5], 'SWEDEN'],
	[[8.2, 46.8], 'SWITZERLAND'],
	[[25.3, 42.7], 'BULGARIA'],
	[[20.8, 44.1], 'SERBIA'],
];

const LABEL_TO_FEATURE: Record<string, string> = {
	FRANCE: 'France', GERMANY: 'German Empire', 'AUSTRIA-HUNGARY': 'Austro-Hungarian Empire', RUSSIA: 'Russian Empire',
	BRITAIN: 'United Kingdom of Great Britain and Ireland', ITALY: 'Kingdom of Italy', ROMANIA: 'Romania', BELGIUM: 'Belgium',
	NETHERLANDS: 'Netherlands', 'OTTOMAN EMPIRE': 'Ottoman Empire', SPAIN: 'Spain', SWEDEN: 'Sweden', SWITZERLAND: 'Switzerland',
	BULGARIA: 'Bulgaria', SERBIA: 'Serbia',
};
const FEATURE_OF: Record<string, GeoJSON.Feature> = Object.fromEntries(
	Object.entries(LABEL_TO_FEATURE)
		.map(([label, name]) => [label, EU.features.find((f) => (f.properties as {NAME: string}).NAME === name)])
		.filter(([, f]) => f),
) as Record<string, GeoJSON.Feature>;

// d3-geo чекає зовнішнє кільце за годинниковою стрілкою, інакше заливає всю планету
const clockwise = (pts: P[]): P[] => {
	let a = 0;
	for (let i = 0; i < pts.length; i++) {
		const [x1, y1] = pts[i];
		const [x2, y2] = pts[(i + 1) % pts.length];
		a += (x2 - x1) * (y2 + y1);
	}
	const ring = a > 0 ? pts.slice() : pts.slice().reverse();
	return [...ring, ring[0]];
};


// ---------- smooth lines ----------
type XY = [number, number];
// Catmull-Rom through the projected points, sampled densely, so fronts and railways curve instead of zig-zagging
const smooth = (pts: XY[], per = 14): XY[] => {
	if (pts.length < 3) return pts;
	const out: XY[] = [];
	for (let i = 0; i < pts.length - 1; i++) {
		const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
		for (let k = 0; k < per; k++) {
			const t = k / per, t2 = t * t, t3 = t2 * t;
			out.push([
				0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
				0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
			]);
		}
	}
	out.push(pts[pts.length - 1]);
	return out;
};
// cut a polyline at fraction p of its length; also returns the tip and the heading there
const partial = (pts: XY[], p: number): {pts: XY[]; tip: XY; ang: number; len: number} => {
	const seg: number[] = [];
	let len = 0;
	for (let i = 1; i < pts.length; i++) {
		const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
		seg.push(d);
		len += d;
	}
	let want = len * Math.max(0, Math.min(1, p));
	const out: XY[] = [pts[0]];
	for (let i = 1; i < pts.length; i++) {
		if (want <= seg[i - 1]) {
			const k = seg[i - 1] ? want / seg[i - 1] : 0;
			const tip: XY = [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k];
			out.push(tip);
			return {pts: out, tip, ang: Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]), len};
		}
		want -= seg[i - 1];
		out.push(pts[i]);
	}
	const n = pts.length;
	return {pts: out, tip: pts[n - 1], ang: n > 1 ? Math.atan2(pts[n - 1][1] - pts[n - 2][1], pts[n - 1][0] - pts[n - 2][0]) : 0, len};
};
const dOf = (pts: XY[]) => (pts.length ? 'M' + pts.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join('L') : '');
// front-line teeth on the left side of travel, every `gap` px
const teeth = (pts: XY[], gap = 30, size = 9): string => {
	let acc = gap / 2;
	let out = '';
	for (let i = 1; i < pts.length; i++) {
		const [x0, y0] = pts[i - 1];
		const [x1, y1] = pts[i];
		const d = Math.hypot(x1 - x0, y1 - y0);
		if (!d) continue;
		const ux = (x1 - x0) / d, uy = (y1 - y0) / d;
		while (acc <= d) {
			const cx = x0 + ux * acc, cy = y0 + uy * acc;
			const nx = uy, ny = -ux; // left normal
			out += `M${(cx - ux * size).toFixed(1)},${(cy - uy * size).toFixed(1)}L${(cx + nx * size * 1.25).toFixed(1)},${(cy + ny * size * 1.25).toFixed(1)}L${(cx + ux * size).toFixed(1)},${(cy + uy * size).toFixed(1)}Z`;
			acc += gap;
		}
		acc -= d;
	}
	return out;
};
// a tiny locomotive that drives the railway as it is drawn
const Loco: React.FC<{x: number; y: number; ang: number; o: number}> = ({x, y, ang, o}) => (
	<g transform={`translate(${x} ${y}) rotate(${(ang * 180) / Math.PI})`} opacity={o}>
		<rect x={-26} y={-9} width={30} height={18} rx={3} fill={C.ink} />
		<rect x={4} y={-12} width={14} height={24} rx={2} fill={C.ink} />
		<rect x={-20} y={-14} width={6} height={6} fill={C.ink} />
		<circle cx={-14} cy={0} r={3} fill={C.signal} />
	</g>
);

const RIVER_INK = '#2F6A86';
const RIVER_LABELS: Record<string, string> = {Rhine: 'Rhine', Rhein: 'Rhine', Maas: 'Meuse', Marne: 'Marne', Seine: 'Seine', Vistula: 'Vistula', Danube: 'Danube', Oder: 'Oder', Elbe: 'Elbe', Neman: 'Niemen', Bug: 'Bug', Dniester: 'Dniester', Narew: 'Narew', Daugava: 'Dvina', Dnepr: 'Dnieper', Dnieper: 'Dnieper', Tigris: 'Tigris', Euphrates: 'Euphrates', Nile: 'Nile'};
// pale wash for the state + the colour of its border ribbon
const wash = (s: Side | 'neutral' | undefined) =>
	s === 'neutral' ? '#ECE5D1' : s ? `color-mix(in srgb, ${C[s]} 20%, ${C.land})` : C.land;
const ribbonOf = (s: Side | 'neutral' | undefined) => (s && s !== 'neutral' ? C[s] : null);

const fill = (s: Side | 'neutral' | undefined) =>
	s === 'neutral' ? '#E9E1CC' : s ? `color-mix(in srgb, ${C[s]} ${s === 'ger' ? 44 : 34}%, ${C.land})` : C.land;

const SEA_LABELS: [P, string][] = [
	[[3.2, 55.8], 'North Sea'],
	[[19.4, 57.8], 'Baltic Sea'],
	[[34.5, 43.3], 'Black Sea'],
	[[18.5, 35.2], 'Mediterranean Sea'],
	[[-20, 47], 'Atlantic Ocean'],
	[[-4.6, 45.6], 'Bay of Biscay'],
	[[16.2, 42.6], 'Adriatic'],
	[[25.0, 38.6], 'Aegean'],
	[[50.6, 41.5], 'Caspian Sea'],
	[[-2.6, 50.1], 'The Channel'],
	[[-45, 40], 'North Atlantic'],
	[[50.5, 27.2], 'Persian Gulf'],
];

const appear = (f: number, dur: number, at: number | undefined, len = 14) => {
	const start = (at ?? 0) * dur;
	return interpolate(f, [start, start + len], [0, 1], clamp);
};

// hand-inked edge without an SVG noise filter (feTurbulence re-runs every frame): split the outline into
// ~9 px steps and nudge each point by a smooth screen-space wobble of a couple of pixels
const wobble = (x: number, y: number) => [
	1.3 * Math.sin(x * 0.13 + 2.1 * Math.sin(y * 0.071)) + 0.7 * Math.sin(y * 0.29 + x * 0.05),
	1.3 * Math.sin(y * 0.12 + 2.3 * Math.sin(x * 0.067)) + 0.7 * Math.sin(x * 0.31 - y * 0.04),
];
const roughen = (pts: number[][]) => {
	const out: number[][] = [];
	for (let i = 0; i < pts.length; i++) {
		const [ax, ay] = pts[i];
		const [bx, by] = pts[(i + 1) % pts.length];
		const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / 9));
		for (let k = 0; k < n; k++) {
			const x = ax + ((bx - ax) * k) / n;
			const y = ay + ((by - ay) * k) / n;
			const [dx, dy] = k ? wobble(x, y) : [0, 0]; // corners (the arrow head tip) stay sharp
			out.push([+(x + dx).toFixed(1), +(y + dy).toFixed(1)]);
		}
	}
	return out;
};

const Arrow: React.FC<{pr: GeoProjection; l: Extract<Layer, {t: 'arrow'}>; p: number}> = ({pr, l, p}) => {
	if (p <= 0) return null;
	const A = pr(l.a)!;
	const B = pr(l.b)!;
	const dx = B[0] - A[0];
	const dy = B[1] - A[1];
	const len = Math.hypot(dx, dy);
	const bend = l.bend ?? 0.12;
	const Cx = (A[0] + B[0]) / 2 - dy * bend;
	const Cy = (A[1] + B[1]) / 2 + dx * bend;
	const q = (t: number) => [
		(1 - t) * (1 - t) * A[0] + 2 * (1 - t) * t * Cx + t * t * B[0],
		(1 - t) * (1 - t) * A[1] + 2 * (1 - t) * t * Cy + t * t * B[1],
	];
	const w0 = (l.w ?? 1) * Math.max(16, Math.min(34, len * 0.075));
	const head = Math.min(w0 * 2.6, len * 0.42); // never more than ~half the arrow
	const tip = q(p);
	const pre = q(Math.max(0, p - Math.min(0.5, head / Math.max(len, 1))));
	const ang = Math.atan2(tip[1] - pre[1], tip[0] - pre[0]);
	const baseX = tip[0] - Math.cos(ang) * head;
	const baseY = tip[1] - Math.sin(ang) * head;
	const N = 22;
	const left: number[][] = [];
	const right: number[][] = [];
	for (let i = 0; i <= N; i++) {
		const t = (i / N) * p;
		const pt = q(t);
		const pt2 = q(Math.min(1, t + 0.01));
		const a = Math.atan2(pt2[1] - pt[1], pt2[0] - pt[0]);
		// не заходимо за основу наконечника
		const dist = Math.hypot(pt[0] - tip[0], pt[1] - tip[1]);
		if (dist < head * 0.9 && i > 0) break;
		const w = (w0 * (0.55 + 0.45 * (i / N))) / 2;
		left.push([pt[0] + Math.sin(a) * w, pt[1] - Math.cos(a) * w]);
		right.push([pt[0] - Math.sin(a) * w, pt[1] + Math.cos(a) * w]);
	}
	const wb = w0 / 2;
	const hw = head * 0.62;
	const pts = [
		...left,
		[baseX + Math.sin(ang) * wb, baseY - Math.cos(ang) * wb],
		[baseX + Math.sin(ang) * hw, baseY - Math.cos(ang) * hw],
		tip,
		[baseX - Math.sin(ang) * hw, baseY + Math.cos(ang) * hw],
		[baseX - Math.sin(ang) * wb, baseY + Math.cos(ang) * wb],
		...right.reverse(),
	];
	const poly = (OPT.rough ? roughen(pts) : pts).map((x) => x.join(',')).join(' ');
	return (
		<g filter={OPT.rough ? undefined : 'url(#rough)'}>
			<polygon points={poly} transform="translate(5 7)" fill={C.ink} opacity={0.22} />
			<polygon points={poly} fill={C[l.c]} stroke={C.ink} strokeWidth={3} strokeLinejoin="round" opacity={0.95} />
		</g>
	);
};

const Label: React.FC<{x: number; y: number; text: string; o: number; big?: boolean; c?: Side}> = ({x, y, text, o, big, c}) => (
	<div
		style={{
			position: 'absolute',
			left: x,
			top: y,
			transform: `translate(-50%,-50%) scale(${0.85 + 0.15 * o})`,
			opacity: o,
			fontFamily: FONT.mono,
			fontWeight: 600,
			fontSize: big ? 38 : 27,
			letterSpacing: '0.04em',
			textTransform: 'uppercase',
			color: c ? '#fff' : C.ink,
			background: c ? C[c] : C.paper,
			border: `2.5px solid ${C.ink}`,
			padding: big ? '6px 16px' : '3px 11px',
			whiteSpace: 'nowrap',
			boxShadow: '4px 4px 0 rgba(30,39,42,0.35)',
		}}
	>
		{text}
	</div>
);

// the baked relief is big: decode it once per tab and hold the frame until it is ready
// (an SVG <image> is not waited for by Remotion, so without this early map frames come out flat)
const RELIEF_SRC = staticFile('relief_baked.webp');
let reliefReady: Promise<void> | null = null;
// holds the frame until the relief is decoded AND this map's own <image> has loaded and painted twice; the <image>
// also asks for a synchronous decode, otherwise Chrome paints the map first and the mountains pop in frames later
const useRelief = () => {
	const [handle] = React.useState(() => delayRender('relief overlay', {timeoutInMilliseconds: 120000}));
	const st = React.useRef({loaded: false, decoded: false, done: false});
	const finish = React.useCallback(() => {
		const s = st.current;
		if (!s.loaded || !s.decoded || s.done) return;
		s.done = true;
		requestAnimationFrame(() => requestAnimationFrame(() => continueRender(handle)));
	}, [handle]);
	React.useEffect(() => {
		if (!reliefReady) {
			const img = new Image();
			img.src = RELIEF_SRC;
			reliefReady = img.decode().catch(() => undefined);
		}
		reliefReady.then(() => {
			st.current.decoded = true;
			finish();
		});
	}, [finish]);
	return () => {
		st.current.loaded = true;
		finish();
	};
};

// the map camera at frame f of a map beat: glides from the previous view, then drifts in slowly
const cameraBounds = (spec: MapSpec, dur: number, f: number): Bounds => {
	const from = spec.from ?? spec.view;
	const camLen = Math.max(30, Math.min(dur * 0.35, 75));
	const t = interpolate(f, [0, camLen], [0, 1], {...clamp, easing: ease});
	const drift = interpolate(f, [camLen, Math.max(camLen + 1, dur)], [1, 0.955], clamp);
	return lerpBounds(from, spec.view, t, drift);
};
export const cameraAt = (spec: MapSpec, dur: number, f: number): GeoProjection => proj(cameraBounds(spec, dur, f));

// where on the map a footage window should be pinned at a given moment of the beat: the latest arrow's target,
// ring, unit, note or city that has appeared by then
export const pinPoint = (spec: MapSpec, frac: number): P | null => {
	let best: P | null = null;
	let bestAt = -1;
	for (const l of spec.layers) {
		const at = (l as {at?: number}).at ?? 0;
		if (at > frac + 0.02 || at < bestAt) continue;
		const pt: P | null =
			l.t === 'arrow' ? l.b : l.t === 'ring' || l.t === 'unit' || l.t === 'note' ? l.p : (l.t === 'city' || l.t === 'fort') && PLACES[l.keys[0]] ? [PLACES[l.keys[0]][1], PLACES[l.keys[0]][2]] : null;
		if (pt) (best = pt), (bestAt = at);
	}
	return best;
};

export const MapView: React.FC<{spec: MapSpec; dur: number; done?: Layer[]}> = ({spec, dur, done = []}) => {
	const onRelief = useRelief();
	const f = useCurrentFrame();
	const b = cameraBounds(spec, dur, f);
	const pr = proj(b);
	// shapes are cut at the screen edge: otherwise a close-up of France still strokes every coast and river
	// of the whole map far off screen, every frame (points like cities keep the unclipped projection)
	const path = geoPath(OPT.clip ? proj(b).clipExtent([[-80, -80], [W + 80, H + 80]]) : pr);
	const scaleK = pr.scale();

	const all = [...done.map((l) => ({...l, at: -1})), ...spec.layers] as Layer[];
	const tint: Record<string, Side | 'neutral'> = {};
	const tintO: Record<string, number> = {};
	for (const l of all) {
		if (l.t !== 'country') continue;
		for (const n of l.names) {
			tint[n] = l.c;
			tintO[n] = l.at === -1 ? 1 : appear(f, dur, l.at, 20);
		}
	}

	const labels: React.ReactNode[] = [];
	// one place name, one label: cities claim their names first; train-route station labels skip a name already shown nearby
	const named: {t: string; x: number; y: number}[] = [];
	for (const l of all)
		if (l.t === 'city' || l.t === 'fort')
			l.keys.forEach((k) => {
				const pl = PLACES[k];
				if (pl) {
					const [x, y] = pr([pl[1], pl[2]])!;
					named.push({t: pl[0], x, y});
				}
			});
	// label placement: fixed things (places, stations, units) register boxes; notes are placed afterwards around them
	type Box = {x0: number; y0: number; x1: number; y1: number};
	const boxes: Box[] = [];
	const addBox = (x0: number, y0: number, x1: number, y1: number) => boxes.push({x0, y0, x1, y1});
	const pendingNotes: {key: string; x: number; y: number; text: string; o: number; big?: boolean; c?: Side}[] = [];
	// the frame furniture Main draws over the map: stat card bottom-right, caption bottom-left, mode badge top-right
	if (spec.stat) addBox(W - 70 - 660, H - 74 - 230, W - 50, H - 50);
	if (spec.cap) addBox(50, H - 74 - 130, 70 + 1120, H - 50);
	addBox(W - 600, 30, W - 40, 110);
	const shown = (t: string, x: number, y: number) => named.some((n) => n.t === t && Math.hypot(n.x - x, n.y - y) < 120);
	const svg: React.ReactNode[] = [];
	all.forEach((l, i) => {
		const o = l.at === -1 ? 1 : appear(f, dur, l.at, l.t === 'arrow' ? Math.max(24, dur * 0.18) : 14);
		const key = `${i}`;
		switch (l.t) {
			case 'region': {
				const d = path({type: 'Polygon', coordinates: [clockwise(l.pts)]} as GeoJSON.Polygon);
				svg.push(
					<path
						key={key}
						d={d ?? ''}
						fill={l.hatch ? `url(#hatch-${l.c})` : C[l.c]}
						fillOpacity={(l.hatch ? 0.9 : l.dash ? 0.18 : 0.42) * o}
						stroke={C.ink}
						strokeOpacity={o}
						strokeWidth={l.dash ? 3 : 2.5}
						strokeDasharray={l.dash ? '14 9' : undefined}
					/>,
				);
				break;
			}
			case 'front': {
				const start = (l.at ?? 0) * dur;
				const p = l.at === -1 ? 1 : interpolate(f, [start, start + (l.dur ?? 0.35) * dur], [0, 1], {...clamp, easing: ease});
				if (p <= 0) break;
				const raw = l.pts.map((q) => pr(q) as XY);
				const style = l.style ?? 'main';
				const sm = style === 'blk' ? raw : smooth(raw);
				const cut = partial(sm, p);
				const d = dOf(cut.pts);
				if (style === 'main')
					svg.push(
						<g key={key}>
							<path d={d} fill="none" stroke={C.paper} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
							<path d={teeth(cut.pts)} fill={C.ink} />
							<path d={d} fill="none" stroke={C.ink} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
						</g>,
					);
				else if (style === 'real')
					svg.push(<path key={key} d={d} fill="none" stroke={C.ent} strokeWidth={5} strokeDasharray="16 10" strokeLinecap="round" />);
				else if (style === 'rail')
					svg.push(
						<g key={key}>
							{/* staff-map railway: ink casing with paper dashes inside */}
							<path d={d} fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
							<path d={d} fill="none" stroke={C.paper} strokeWidth={3} strokeDasharray="12 12" strokeLinejoin="round" />
							{p < 1 && <Loco x={cut.tip[0]} y={cut.tip[1]} ang={cut.ang} o={Math.min(1, p * 6)} />}
						</g>,
					);
				else svg.push(<path key={key} d={d} fill="none" stroke={C.ink} strokeWidth={3.5} strokeDasharray="10 8" opacity={0.85} />);
				break;
			}
			case 'arrow': {
				const start = (l.at ?? 0) * dur;
				const p = l.at === -1 ? 1 : interpolate(f, [start, start + Math.max(24, dur * 0.2)], [0, 1], {...clamp, easing: easeOut});
				svg.push(<Arrow key={key} pr={pr} l={l} p={p} />);
				break;
			}
			case 'note': {
				const [x, y] = pr(l.p)!;
				pendingNotes.push({key, x, y, text: l.text, o, big: l.big, c: l.c});
				break;
			}
			case 'city':
			case 'fort':
				l.keys.forEach((k, j) => {
					const pl = PLACES[k];
					if (!pl) return;
					const [x, y] = pr([pl[1], pl[2]])!;
					const oo = l.at === -1 ? 1 : appear(f, dur, (l.at ?? 0) + j * 0.03, 10);
					if (l.t === 'fort')
						svg.push(<rect key={`${key}-${j}`} x={x - 11} y={y - 11} width={22} height={22} fill={C.paper} stroke={C.ink} strokeWidth={4} opacity={oo} transform={`rotate(45 ${x} ${y})`} />);
					else svg.push(<circle key={`${key}-${j}`} cx={x} cy={y} r={8} fill={C.ink} stroke={C.paper} strokeWidth={3} opacity={oo} />);
					addBox(x - 14, y - 14, x + 14, y + 14);
					addBox(x + 14, y - 36, x + 18 + pl[0].length * 16, y - 2);
					labels.push(
						<div
							key={`${key}-l${j}`}
							style={{position: 'absolute', left: x + 16, top: y - 34, opacity: oo, fontFamily: FONT.mono, fontWeight: 500, fontSize: 26, color: C.ink, whiteSpace: 'nowrap', textShadow: `0 0 6px ${C.paper}, 0 0 3px ${C.paper}`}}
						>
							{pl[0]}
						</div>,
					);
				});
				break;
			case 'cross': {
				const [x, y] = pr(l.p)!;
				const p = l.at === -1 ? 1 : appear(f, dur, l.at, 10);
				const s = 46;
				svg.push(
					<g key={key} stroke={C.ent} strokeWidth={13} strokeLinecap="round" opacity={0.95}>
						<line x1={x - s} y1={y - s} x2={x - s + 2 * s * Math.min(1, p * 2)} y2={y - s + 2 * s * Math.min(1, p * 2)} />
						{p > 0.5 && <line x1={x + s} y1={y - s} x2={x + s - 2 * s * Math.min(1, (p - 0.5) * 2)} y2={y - s + 2 * s * Math.min(1, (p - 0.5) * 2)} />}
					</g>,
				);
				break;
			}
			case 'route': {
				const start = (l.at ?? 0) * dur;
				const p = l.at === -1 ? 1 : interpolate(f, [start, start + (l.dur ?? 0.4) * dur], [0, 1], {...clamp, easing: ease});
				if (p <= 0) break;
				const st = route(...l.via);
				const sm = smooth(st.map((q) => pr([q[0], q[1]]) as XY), 12);
				const cut = partial(sm, p);
				const d = dOf(cut.pts);
				const ends = [st[0], st[st.length - 1]];
				svg.push(
					<g key={key}>
						<path d={d} fill="none" stroke="#F4EEDD" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" opacity={0.75} />
						<path d={d} fill="none" stroke={C.ink} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
						<path d={d} fill="none" stroke="#F4EEDD" strokeWidth={3.4} strokeDasharray="14 14" strokeLinejoin="round" />
						{st.map((q, j) => {
							const [x, y] = pr([q[0], q[1]])!;
							const reached = j / Math.max(1, st.length - 1) <= p + 0.001;
							return reached ? <circle key={j} cx={x} cy={y} r={j === 0 || j === st.length - 1 ? 9 : 5} fill="#F4EEDD" stroke={C.ink} strokeWidth={3} /> : null;
						})}
						{p < 1 && <Loco x={cut.tip[0]} y={cut.tip[1]} ang={cut.ang} o={Math.min(1, p * 6)} />}
					</g>,
				);
				if (l.label !== false)
					ends.forEach((q, j) => {
						if (j === 1 && p < 1) return;
						const [x, y] = pr([q[0], q[1]])!;
						if (shown(q[2], x, y)) return;
						named.push({t: q[2], x, y});
						addBox(x - 12, y - 12, x + 12, y + 12);
						addBox(x + 12, y - 38, x + 16 + q[2].length * 15.5, y - 6);
						labels.push(
							<div key={`${key}-st${j}`} style={{position: 'absolute', left: x + 14, top: y - 36, fontFamily: FONT.mono, fontWeight: 600, fontSize: 24, color: C.ink, whiteSpace: 'nowrap', textShadow: `0 0 6px ${C.paper}, 0 0 3px ${C.paper}`}}>
								{q[2]}
							</div>,
						);
					});
				break;
			}
			case 'ring': {
				const [x, y] = pr(l.p)!;
				const p = l.at === -1 ? 1 : appear(f, dur, l.at, 18);
				const pulse = 1 + 0.06 * Math.sin(f / 6);
				svg.push(<circle key={key} cx={x} cy={y} r={60 * p * pulse} fill="none" stroke={C[l.c ?? 'ent']} strokeWidth={7} opacity={p} />);
				break;
			}
				case 'unit': {
					const [x, y] = pr(l.p)!;
					const p = l.at === -1 ? 1 : appear(f, dur, l.at, 12);
					const sc = interpolate(p, [0, 0.6, 1], [1.6, 0.92, 1]);
					labels.push(
						<div key={key} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${sc}) rotate(-3deg)`, opacity: Math.min(1, p * 2), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
							<svg width={74} height={46} viewBox="0 0 74 46">
								<rect x={2} y={2} width={70} height={42} fill={fill(l.c)} stroke={C.ink} strokeWidth={4} />
								<line x1={2} y1={2} x2={72} y2={44} stroke={C.ink} strokeWidth={3} />
								<line x1={72} y1={2} x2={2} y2={44} stroke={C.ink} strokeWidth={3} />
							</svg>
							<div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 22, color: C.ink, background: C.paper, padding: '1px 7px', border: `2px solid ${C.ink}`, whiteSpace: 'nowrap'}}>{l.label}</div>
						</div>,
					);
					break;
				}
		}
	});
	// the rail capitals get a small name on the network when nothing else names them and the spot is free
	if (spec.railnet !== false)
		for (const st of RAIL_CAPITALS) {
			const [x, y] = pr([st[0], st[1]])!;
			if (x < 80 || x > W - 80 || y < 80 || y > H - 80 || shown(st[2], x, y)) continue;
			const w = st[2].length * 11.5 + 12;
			const b = {x0: x + 8, y0: y - 30, x1: x + 8 + w, y1: y - 6};
			if (b.x1 > W - 50 || boxes.some((o) => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0)) continue;
			addBox(b.x0, b.y0, b.x1, b.y1);
			named.push({t: st[2], x, y});
			labels.push(
				<div key={`rc-${st[2]}`} style={{position: 'absolute', left: b.x0, top: b.y0, fontFamily: FONT.mono, fontWeight: 600, fontSize: 19, letterSpacing: '0.04em', color: C.ink, opacity: 0.82, whiteSpace: 'nowrap', textShadow: '0 0 4px #F4EEDD, 0 0 4px #F4EEDD'}}>
					{st[2]}
				</div>,
			);
		}
	// notes go where they collide with nothing; far moves get a leader line back to the point
	for (const n of pendingNotes) {
		const fs = n.big ? 38 : 27;
		const w = n.text.length * fs * 0.64 + (n.big ? 36 : 26);
		const h = n.big ? 60 : 42;
		const cands: XY[] = [[0, 0], [0, -(h + 16)], [0, h + 16], [w / 2 + 34, 0], [-(w / 2 + 34), 0], [w / 2 + 24, -(h + 10)], [-(w / 2 + 24), -(h + 10)], [w / 2 + 24, h + 10], [-(w / 2 + 24), h + 10], [0, -2 * (h + 16)], [0, 2 * (h + 16)]];
		const free = ([dx, dy]: XY) => {
			const b = {x0: n.x + dx - w / 2 - 6, y0: n.y + dy - h / 2 - 6, x1: n.x + dx + w / 2 + 6, y1: n.y + dy + h / 2 + 6};
			if (b.x0 < 50 || b.x1 > W - 50 || b.y0 < 50 || b.y1 > H - 50) return false;
			return !boxes.some((o) => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
		};
		const [dx, dy] = cands.find(free) ?? [0, 0];
		const x = n.x + dx, y = n.y + dy;
		addBox(x - w / 2, y - h / 2, x + w / 2, y + h / 2);
		if (Math.hypot(dx, dy) > 40) {
			// leader from the point to the nearest edge of the moved note
			const ex = Math.max(x - w / 2, Math.min(n.x, x + w / 2));
			const ey = Math.max(y - h / 2, Math.min(n.y, y + h / 2));
			svg.push(
				<g key={`${n.key}-lead`} opacity={n.o}>
					<line x1={n.x} y1={n.y} x2={ex} y2={ey} stroke={C.ink} strokeWidth={2.5} />
					<circle cx={n.x} cy={n.y} r={5} fill={C.ink} />
				</g>,
			);
		}
		labels.push(<Label key={n.key} x={x} y={y} text={n.text} o={n.o} big={n.big} c={n.c} />);
	}

	const landD = path(LAND) ?? '';
	const railnet = spec.railnet !== false;
	const ribbonW = Math.max(6, Math.min(14, scaleK / 380));
	const countries = EU.features.map((ft, i) => {
		const n = (ft.properties as {NAME: string}).NAME;
		const base = SIDE_OF[n];
		const tn = tint[n];
		const k = Math.round((tintO[n] ?? 1) * 100);
		const w = tn ? `color-mix(in srgb, ${wash(tn)} ${k}%, ${wash(base)})` : wash(base);
		const rb = tn ? ribbonOf(tn) ?? ribbonOf(base) : ribbonOf(base);
		return {i, d: path(ft) ?? '', wash: w, ribbon: rb};
	});
	// rivers in three weights by Natural Earth rank, scaled with zoom
	const zw = Math.max(0.7, Math.min(2.2, scaleK / 2600));
	const riverGroups = [
		{max: 4, w: 3.4 * zw},
		{max: 7, w: 2.3 * zw},
		{max: 10, w: 1.3 * zw},
	].map((g, k, arr) => {
		const min = k ? arr[k - 1].max : -1;
		const fc = {type: 'FeatureCollection', features: RIVERS.features.filter((f) => {
			const r = (f.properties as {scalerank: number}).scalerank;
			return r > min && r <= g.max;
		})} as GeoJSON.FeatureCollection;
		return {d: path(fc) ?? '', w: g.w};
	});
	// one italic label per major river, at the middle of its longest on-screen piece
	const riverLabels: {x: number; y: number; a: number; t: string}[] = [];
	const seen = new Set<string>();
	for (const f of RIVERS.features) {
		const name = RIVER_LABELS[(f.properties as {name: string}).name];
		if (!name || seen.has(name) || (f.properties as {scalerank: number}).scalerank > 6) continue;
		const g = f.geometry as GeoJSON.LineString | GeoJSON.MultiLineString;
		const lines = g.type === 'LineString' ? [g.coordinates] : g.coordinates;
		let best: XY[] = [];
		for (const ln of lines) {
			const pts = ln.map((q) => pr(q as [number, number]) as XY).filter(([x, y]) => x > 120 && x < W - 120 && y > 120 && y < H - 120);
			if (pts.length > best.length) best = pts;
		}
		if (best.length < 6) continue;
		const m = Math.floor(best.length / 2);
		const [x0, y0] = best[Math.max(0, m - 2)];
		const [x1, y1] = best[Math.min(best.length - 1, m + 2)];
		let a = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
		if (a > 90) a -= 180;
		if (a < -90) a += 180;
		riverLabels.push({x: best[m][0], y: best[m][1], a, t: name});
		seen.add(name);
	}
	const tl = pr([RELIEF.lon0, RELIEF.lat1])!;
	const br = pr([RELIEF.lon1, RELIEF.lat0])!;
	const labelSize = Math.max(18, Math.min(36, scaleK / 85));
	// country names step aside for notes, cities and units placed by the story
	const busy: XY[] = [];
	for (const l of all) {
		if (l.t === 'note' || l.t === 'unit') busy.push(pr(l.p) as XY);
		if (l.t === 'city' || l.t === 'fort') l.keys.forEach((k) => PLACES[k] && busy.push(pr([PLACES[k][1], PLACES[k][2]]) as XY));
	}
	const placed: [number, number, number][] = [];
	const crowded = (x: number, y: number, text: string) => {
		const hw = (text.length * labelSize * 0.95) / 2 + 30;
		return busy.some(([bx, by]) => Math.abs(bx - x) < hw + 90 && Math.abs(by - y) < labelSize + 34);
	};
	const seaSize = Math.max(16, Math.min(30, scaleK / 110));
	const onScreen = (x: number, y: number) => x > -200 && x < W + 200 && y > -50 && y < H + 50;

	return (
		<AbsoluteFill style={{background: C.sea}}>
			<svg width={W} height={H} style={{position: 'absolute'}}>
				<defs>
					{(['ger', 'ent', 'rus', 'ah', 'gold', 'food', 'ott', 'usa'] as Side[]).map((s) => (
						<pattern key={s} id={`hatch-${s}`} width={18} height={18} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
							<rect width={18} height={18} fill={`color-mix(in srgb, ${C[s]} 26%, transparent)`} />
							<line x1={0} y1={0} x2={0} y2={18} stroke={C[s]} strokeWidth={6} />
						</pattern>
					))}
					<clipPath id="land">
						<path d={landD} />
					</clipPath>
					{/* hand-inked edges for arrows */}
					<filter id="rough" x="-5%" y="-5%" width="110%" height="110%">
						<feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves={2} seed={3} />
						<feDisplacementMap in="SourceGraphic" scale={4} />
					</filter>
				</defs>
				<path d={path(geoGraticule10()) ?? ''} fill="none" stroke={C.ink} strokeOpacity={0.08} strokeWidth={1.2} />
				{/* water lining along every coast, like an engraved atlas */}
				{(OPT.coast ? [[28, 0.2], [11, 0.34]] : [[30, 0.16], [21, 0.23], [13, 0.3], [6, 0.37]]).map(([w, o], i) => (
					<path key={`wl${i}`} d={landD} fill="none" stroke={C.seaDeep} strokeOpacity={o} strokeWidth={w} strokeLinejoin="round" />
				))}
				<path d={landD} fill={C.land} />
				<g clipPath="url(#land)">
					{/* old staff-map colouring: a pale wash for the state, a strong ribbon along the inside of its border */}
					{countries.map((c) => (
						<path key={`w${c.i}`} d={c.d} fill={c.wash} />
					))}
					{/* relief from real elevation: tint, shadows and lit slopes pre-baked into one plain overlay
					    (en/bake_relief.py) — blending and blurring three 6k images every frame made renders crawl */}
					<image href={RELIEF_SRC} x={tl[0]} y={tl[1]} width={br[0] - tl[0]} height={br[1] - tl[1]} preserveAspectRatio="none" {...({decoding: 'sync'} as object)} onLoad={onRelief} onError={onRelief} />

					{countries.map((c) =>
						c.ribbon ? (
							<g key={`r${c.i}`} clipPath={`url(#cc${c.i})`}>
								<path d={c.d} fill="none" stroke={c.ribbon} strokeWidth={ribbonW} strokeLinejoin="round" opacity={0.5} />
							</g>
						) : null,
					)}
					{countries.map((c) => (
						<path key={`b${c.i}`} d={c.d} fill="none" stroke={C.ink} strokeOpacity={0.6} strokeWidth={1.8} strokeDasharray="9 4 2 4" />
					))}
					{/* rivers: width by rank and zoom, a pale casing so they stay crisp on any wash */}
					{riverGroups.map((g, k) => (
						<path key={`rc${k}`} d={g.d} fill="none" stroke="#F4EEDD" strokeOpacity={0.7} strokeWidth={g.w + 2.4} strokeLinecap="round" strokeLinejoin="round" />
					))}
					{riverGroups.map((g, k) => (
						<path key={`rv${k}`} d={g.d} fill="none" stroke={RIVER_INK} strokeWidth={g.w} strokeLinecap="round" strokeLinejoin="round" />
					))}
					{/* 1914 railway network (curated, see rail1914.ts): a thin staff-map rail symbol */}
					{railnet && RAIL1914.map((l) => {
						const d = dOf(smooth(l.stations.map((s) => pr([s[0], s[1]]) as XY), 10));
						return (
							<g key={`rn${l.id}`} opacity={0.75}>
								<path d={d} fill="none" stroke={C.ink} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
								<path d={d} fill="none" stroke="#F4EEDD" strokeWidth={1.4} strokeDasharray="7 7" strokeLinejoin="round" />
							</g>
						);
					})}
					{/* junction dots, larger for the capitals */}
					{railnet &&
						JUNCTIONS.map((st) => {
							const [x, y] = pr([st[0], st[1]])!;
							if (!onScreen(x, y)) return null;
							const cap = RAIL_CAPITALS.includes(st);
							return <circle key={`rj${st[2]}`} cx={x} cy={y} r={cap ? 7 : 4.2} fill={C.ink} stroke="#F4EEDD" strokeWidth={cap ? 2.4 : 1.6} opacity={0.85} />;
						})}
				</g>
				<defs>
					{countries.map((c) => (c.ribbon ? <clipPath key={`cc${c.i}`} id={`cc${c.i}`}><path d={c.d} /></clipPath> : null))}
				</defs>
				<path d={path(LAKES) ?? ''} fill={C.sea} stroke={C.ink} strokeOpacity={0.5} strokeWidth={1} />
				<path d={landD} fill="none" stroke={C.ink} strokeOpacity={0.85} strokeWidth={2} strokeLinejoin="round" />
				{svg}
				{/* double neat-line frame of a staff map sheet */}
				<rect x={26} y={26} width={W - 52} height={H - 52} fill="none" stroke={C.ink} strokeWidth={4} opacity={0.75} />
				<rect x={36} y={36} width={W - 72} height={H - 72} fill="none" stroke={C.ink} strokeWidth={1.2} opacity={0.6} />
			</svg>
			<AbsoluteFill>
				{SEA_LABELS.map(([p, s]) => {
					const [x, y] = pr(p)!;
					if (!onScreen(x, y)) return null;
					return (
						<div key={s} style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', fontFamily: FONT.display, fontStyle: 'italic', fontSize: seaSize, letterSpacing: '0.18em', color: '#3F5E66', whiteSpace: 'nowrap'}}>
							{s}
						</div>
					);
				})}
				{riverLabels.map((r) => (
					<div key={`rl${r.t}`} style={{position: 'absolute', left: r.x, top: r.y, transform: `translate(-50%,-140%) rotate(${r.a}deg)`, fontFamily: FONT.display, fontStyle: 'italic', fontWeight: 700, fontSize: Math.max(17, Math.min(26, scaleK / 160)), letterSpacing: '0.12em', color: RIVER_INK, whiteSpace: 'nowrap', textShadow: '0 0 4px #F4EEDD, 0 0 2px #F4EEDD'}}>
						{r.t}
					</div>
				))}
				{COUNTRY_LABELS.map(([p, s]) => {
					// size the name to the country's visible width, centre it on the visible part
					const ft = FEATURE_OF[s];
					let x: number, y: number, size = labelSize;
					if (ft) {
						const [[bx0, by0], [bx1, by1]] = path.bounds(ft);
						const vx0 = Math.max(60, bx0), vx1 = Math.min(W - 60, bx1), vy0 = Math.max(60, by0), vy1 = Math.min(H - 60, by1);
						if (vx1 - vx0 < 40 || vy1 - vy0 < 30) return null;
						const [ax, ay] = pr(p)!;
						// keep the hand-placed anchor if it is visible, else the middle of the visible box,
						// but only if that point is really inside the country (a sliver of Britain must not label Belgium)
						x = ax > vx0 && ax < vx1 ? ax : (vx0 + vx1) / 2;
						y = ay > vy0 && ay < vy1 ? ay : (vy0 + vy1) / 2;
						const ll = pr.invert ? pr.invert([x, y]) : null;
						if (!ll || !geoContains(ft, ll)) return null;
						size = Math.min(labelSize, ((vx1 - vx0) * 0.7) / (s.length * 0.88));
					} else {
						[x, y] = pr(p)!;
					}
					if (size < 13 || !onScreen(x, y) || crowded(x, y, s)) return null;
					const hw = (s.length * size * 0.88) / 2;
					if (placed.some((b) => Math.abs(b[0] - x) < b[2] + hw && Math.abs(b[1] - y) < size * 1.4)) return null;
					placed.push([x, y, hw]);
					return (
						<div key={s} style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', fontFamily: FONT.display, fontWeight: 700, fontSize: size, letterSpacing: '0.25em', color: C.ink, opacity: size > 30 ? 0.38 : 0.5, whiteSpace: 'nowrap'}}>
							{s}
						</div>
					);
				})}
				{labels}
			</AbsoluteFill>
			{/* aged paper over everything: the map is printed on it */}
			<Img src={staticFile('paper_texture.jpg')} style={{position: 'absolute', inset: 0, width: W, height: H, mixBlendMode: 'multiply', opacity: 0.9}} />
		</AbsoluteFill>
	);
};
