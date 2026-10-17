// Cheap sanity check that needs no npm install: every relative import in src/ resolves to a file in the repo.
// Files that a fetch script writes (gitignored) are reported as "fetch first" instead of failing.
// Usage: node scripts/check_imports.mjs
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..');
const FETCHED = {'src/en/geo/world1914.json': 'node scripts/fetch_geo.mjs'};
const walk = (d) => fs.readdirSync(d, {withFileTypes: true}).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk(path.join(root, 'src')).filter((f) => /\.(ts|tsx)$/.test(f));
const rel = (f) => path.relative(root, f).split(path.sep).join('/');
let bad = 0, n = 0;
for (const f of files) {
	const src = fs.readFileSync(f, 'utf8');
	for (const m of src.matchAll(/(?:import|export)\s[^'"]*?from\s+['"](\.{1,2}\/[^'"]+)['"]/g)) {
		n++;
		const base = path.resolve(path.dirname(f), m[1]);
		const hit = ['', '.ts', '.tsx', '.json', '/index.ts', '/index.tsx'].map((x) => base + x).find((p) => fs.existsSync(p) && fs.statSync(p).isFile());
		if (hit) continue;
		const want = rel(base);
		if (FETCHED[want]) console.log(`fetch first: ${want} (${FETCHED[want]}), imported by ${rel(f)}`);
		else (bad++, console.log(`MISSING: ${m[1]} imported by ${rel(f)}`));
	}
}
console.log(`${files.length} files, ${n} relative imports, ${bad} missing`);
process.exit(bad ? 1 : 0);
