import {Easing, continueRender, delayRender, staticFile} from 'remotion';
import fonts from './fonts.json';

// fonts are served from public/fonts (scripts/fetch_fonts.mjs), so a render never waits on fonts.gstatic.com
if (typeof document !== 'undefined') {
	const handle = delayRender('local fonts');
	Promise.all(
		fonts.map((f) => {
			const face = new FontFace(f.family, `url(${staticFile(f.file)}) format('woff2')`, {style: f.style, weight: f.weight, unicodeRange: f.unicodeRange});
			document.fonts.add(face);
			return face.load();
		}),
	).then(
		() => continueRender(handle),
		(e) => {
			console.error('font load failed', e);
			continueRender(handle);
		},
	);
}

export const FONT = {
	display: "'Old Standard TT'",
	mono: "'IBM Plex Mono'",
	head: "'Oswald'",
	marker: "'Permanent Marker'",
};

// The example preset (the look EP01 was made with): staff map on old paper + railway signal red.
// Real history = ink/paper, our timeline = signal. Swap the name and the palette here to re-brand the engine.
export const BRAND = {
	name: 'SWITCHYARD', // drawn by the ident sign, the sting and the channel art; en/mix.py clicks once per letter (10)
	accentFrom: 6, // letters from this index light up in signal red on the ident sign (SWITCH + YARD)
};

export const C = {
	paper: '#E6DECB',
	paperDark: '#D6CCB4',
	sea: '#CCD8D5',
	seaDeep: '#9BB2B2',
	land: '#DED5BE',
	ink: '#1E272A',
	inkSoft: '#3A4448',
	muted: '#6F6B5D',
	night: '#121718',
	night2: '#1B2224',
	ger: '#2B5C8C',
	ah: '#5F86AE',
	rus: '#6E8338',
	ent: '#B2433A',
	ott: '#8A6E9E',
	gold: '#B08D3C',
	food: '#5E8C3A',
	usa: '#3A6E8F',
	signal: '#E0402F',
	rail: '#8E9998',
};

export type Side = 'ger' | 'ah' | 'rus' | 'ent' | 'ott' | 'gold' | 'food' | 'usa';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ease = Easing.bezier(0.33, 0, 0.2, 1);
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
