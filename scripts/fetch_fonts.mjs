// Download the Google Fonts the EN cut uses into public/fonts/ so renders never depend on fonts.gstatic.com,
// and write src/en/fonts.json (family, style, weight, subset, file, unicodeRange) for src/en/theme.ts.
// Usage: node scripts/fetch_fonts.mjs
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..');
const WANT = [
	['OldStandardTT', 'normal', ['400', '700']],
	['OldStandardTT', 'italic', ['400']],
	['IBMPlexMono', 'normal', ['400', '500', '600']],
	['Oswald', 'normal', ['500', '700']],
	['PermanentMarker', 'normal', ['400']],
];
const SUBSETS = ['latin', 'latin-ext'];
const out = [];
for (const [mod, style, weights] of WANT) {
	const {getInfo} = await import(`@remotion/google-fonts/${mod}`);
	const info = getInfo();
	for (const w of weights)
		for (const sub of SUBSETS) {
			const url = info.fonts[style]?.[w]?.[sub];
			if (!url) continue;
			const file = `fonts/${mod}-${style}-${w}-${sub}.woff2`;
			const dest = path.join(root, 'public', file);
			if (!fs.existsSync(dest)) {
				const r = await fetch(url);
				if (!r.ok) throw new Error(`${url}: ${r.status}`);
				fs.mkdirSync(path.dirname(dest), {recursive: true});
				fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
			}
			out.push({family: info.fontFamily, style, weight: w, subset: sub, file, unicodeRange: info.unicodeRanges[sub]});
		}
}
fs.writeFileSync(path.join(root, 'src/en/fonts.json'), JSON.stringify(out, null, 1));
console.log(`${out.length} font files in public/fonts`);
