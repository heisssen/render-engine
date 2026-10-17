// Download the 1914 world borders the maps colour by country (src/en/geo/world1914.json).
// Source: historical-basemaps by André Ourednik (world_1914.geojson), licensed GPL-3.0. It is fetched here instead of
// being committed, so the engine's own MIT licence stays clean; the file you get is under GPL-3.0.
// Only the NAME property is kept and coordinates are rounded to 3 decimals (about 100 m, plenty for a staff map).
// Usage: node scripts/fetch_geo.mjs [--force]
//
// Known difference from the EP01 render: that file had a hand fix of the Bulgarian-Ottoman border in Thrace
// (back to the 1913 Treaty of Constantinople line). Redo it yourself if your episode zooms into the Balkans.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..');
const URL_1914 = 'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/world_1914.geojson';
const dest = path.join(root, 'src/en/geo/world1914.json');
if (fs.existsSync(dest) && !process.argv.includes('--force')) {
	console.log(`${path.relative(root, dest)} already exists (use --force to fetch again)`);
	process.exit(0);
}
const r = await fetch(URL_1914);
if (!r.ok) throw new Error(`${URL_1914}: ${r.status}`);
const src = await r.json();
const round = (c) => (typeof c[0] === 'number' ? [+c[0].toFixed(3), +c[1].toFixed(3)] : c.map(round));
const features = src.features
	.filter((f) => f.geometry && (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'))
	.map((f) => ({type: 'Feature', properties: {NAME: f.properties?.NAME ?? null}, geometry: {type: f.geometry.type, coordinates: round(f.geometry.coordinates)}}));
fs.mkdirSync(path.dirname(dest), {recursive: true});
fs.writeFileSync(dest, JSON.stringify({type: 'FeatureCollection', features}));
console.log(`${features.length} countries -> ${path.relative(root, dest)} (historical-basemaps, GPL-3.0)`);
