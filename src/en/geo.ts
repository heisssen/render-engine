// Геодані зі статті-артефакту: кордони 1914 (historical-basemaps) і лінії сценарію. Координати [lon, lat].
import eu from './geo/world1914.json';
import land from './geo/land.json'; // Natural Earth 10m land (public domain), clipped + simplified
import rivers from './geo/rivers.json'; // Natural Earth 50m rivers (public domain)
import lakes from './geo/lakes.json'; // Natural Earth 50m lakes (public domain)
export {default as RELIEF} from './geo/relief.json'; // Natural Earth SR_50M shaded relief, reprojected to Mercator (public/relief_merc.png) // historical-basemaps world_1914 (GPL-3.0), clipped to the Atlantic-Europe-Middle East window

export type P = [number, number];
export type Bounds = [P, P]; // [[захід, південь], [схід, північ]]

// d3-geo хоче зовнішні кільця за годинниковою стрілкою, а GeoJSON дає навпаки: перевертаємо
const signed = (r: number[][]) => r.reduce((a, p, i) => a + (r[(i + 1) % r.length][0] - p[0]) * (r[(i + 1) % r.length][1] + p[1]), 0);
const orient = (rings: number[][][]) => rings.map((r, i) => ((i === 0) === signed(r) > 0 ? r : r.slice().reverse()));
const orientFC = (raw: GeoJSON.FeatureCollection): GeoJSON.FeatureCollection => ({
	...raw,
	features: raw.features.map((f) => {
		const g = f.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon;
		const geometry =
			g.type === 'Polygon'
				? {...g, coordinates: orient(g.coordinates as number[][][])}
				: {...g, coordinates: (g.coordinates as number[][][][]).map((p) => orient(p))};
		return {...f, geometry} as GeoJSON.Feature;
	}),
});
export const LAND = orientFC(land as unknown as GeoJSON.FeatureCollection);
export const LAKES = orientFC(lakes as unknown as GeoJSON.FeatureCollection);
export const RIVERS = rivers as unknown as GeoJSON.FeatureCollection;
const raw = eu as unknown as GeoJSON.FeatureCollection;
export const EU: GeoJSON.FeatureCollection = {
	...raw,
	features: raw.features.map((f) => {
		const g = f.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon;
		const geometry =
			g.type === 'Polygon'
				? {...g, coordinates: orient(g.coordinates as number[][][])}
				: {...g, coordinates: (g.coordinates as number[][][][]).map((p) => orient(p))};
		return {...f, geometry} as GeoJSON.Feature;
	}),
};

export const EB: P[] = [[21.1, 55.9], [22.8, 55.0], [22.8, 54.3], [22.0, 53.5], [19.5, 53.3], [18.8, 52.9], [17.8, 52.2], [18.1, 51.7], [18.7, 50.9], [19.2, 50.2], [20.3, 50.3], [21.8, 50.7], [22.6, 50.4], [23.6, 50.4], [24.1, 50.5], [25.0, 50.2], [26.2, 49.7], [26.2, 49.0], [26.4, 48.5]];
export const WB: P[] = [[6.4, 49.5], [5.9, 49.35], [6.0, 49.0], [6.6, 48.8], [7.1, 48.5], [7.1, 47.9], [7.0, 47.5]];
export const POL: P[] = [[18.1, 51.7], [17.8, 52.2], [18.8, 52.9], [19.5, 53.3], [22.0, 53.5], [22.8, 54.3], [23.5, 54.0], [23.9, 53.0], [23.6, 52.0], [24.1, 50.8], [23.6, 50.4], [22.6, 50.4], [21.8, 50.7], [20.3, 50.3], [19.2, 50.2], [18.7, 50.9]];
export const LIT: P[] = [[21.1, 55.9], [22.8, 55.0], [22.8, 54.3], [23.5, 54.0], [26.0, 54.2], [26.8, 55.5], [26.5, 56.0], [24.1, 57.0], [22.6, 57.7], [21.6, 57.6], [21.0, 56.8]];
export const UKR: P[] = [[24.1, 50.8], [23.6, 52.0], [25, 51.9], [30.5, 51.6], [34, 52.3], [38, 50], [40, 49.5], [39.5, 47.2], [38.3, 47.2], [36.8, 46.8], [35.3, 46.4], [33.6, 46.1], [31.9, 46.7], [30.7, 46.4], [30.2, 46.3], [28.5, 48.2], [26.6, 48.5], [26.2, 49.7], [25.0, 50.2], [24.1, 50.5]];
export const RIGHT: P[] = [[24.1, 50.8], [23.6, 52.0], [25, 51.9], [30.5, 51.6], [30.6, 50.4], [32.0, 49.2], [35.0, 48.4], [35.1, 47.8], [33.5, 46.8], [32.5, 46.5], [31.9, 46.7], [30.7, 46.4], [30.2, 46.3], [28.5, 48.2], [26.6, 48.5], [26.2, 49.7], [25, 50.2], [24.1, 50.5]];
export const GAL: P[] = [[22.9, 50.3], [24.1, 50.5], [25, 50.2], [26.2, 49.7], [26.2, 49.0], [26.4, 48.5], [25.0, 47.8], [24.5, 48.2], [22.9, 49.0]];
export const BLOCK: P[][] = [[[-3, 58.6], [5, 60.2]], [[1.4, 51.1], [1.7, 50.9]]];
export const F14: P[] = [[21.0, 56.0], [22.5, 55.6], [23.9, 54.9], [23.8, 53.7], [23.7, 52.1], [24.3, 50.9], [25.2, 50.1], [26.2, 49.4], [26.4, 48.5]];
export const F15: P[] = [[24.1, 57.0], [25.5, 56.4], [26.6, 55.8], [27.4, 54.3], [26.6, 52.6], [26.3, 51.0], [26.4, 49.8], [26.4, 48.5]];
export const F16: P[] = [[24.6, 58.4], [27.0, 57.6], [28.6, 56.3], [29.6, 55.0], [30.0, 53.4], [29.4, 51.8], [28.9, 50.4], [28.6, 49.0], [29.6, 47.2], [30.4, 46.3]];
export const FHOLD: P[] = [[24.1, 57.0], [25.8, 56.4], [27.6, 55.6], [28.6, 54.2], [27.8, 52.4], [26.8, 51.0], [26.5, 49.8], [26.4, 48.5]];
export const RHINE: P[] = [[6.3, 49.9], [6.9, 49.4], [7.7, 49.0], [8.1, 48.6], [7.6, 47.6]];
// реальний фронт грудня 1914 від Ла-Маншу до Швейцарії
export const REAL_WEST: P[] = [[2.75, 51.13], [2.9, 50.85], [2.8, 50.3], [3.0, 49.6], [4.0, 49.3], [5.4, 49.25], [5.5, 48.9], [6.05, 48.9], [7.0, 48.0], [7.1, 47.5]];
// окупована північ Франції в реальності: фронт + бельгійський кордон
export const REAL_OCC: P[] = [...REAL_WEST.slice(0, 7), [5.9, 49.5], [5.8, 50.0], [4.9, 50.2], [4.2, 50.0], [3.3, 50.5], [2.6, 51.05]];

// зона за фронтом на сході (територія під Центральними державами)
export const behind = (front: P[]): P[] => EB.concat(front.slice().reverse());

export const PLACES: Record<string, [string, number, number]> = {
	paris: ['Paris', 2.35, 48.85], london: ['London', -0.1, 51.5], berlin: ['Berlin', 13.4, 52.5], vienna: ['Vienna', 16.4, 48.2],
	petro: ['Petrograd', 30.3, 59.93], moscow: ['Moscow', 37.6, 55.75], warsaw: ['Warsaw', 21.0, 52.23], kyiv: ['Kyiv', 30.52, 50.45],
	metz: ['Metz', 6.18, 49.12], thi: ['Thionville', 6.17, 49.36], str: ['Strasbourg', 7.75, 48.58], verdun: ['Verdun', 5.38, 49.16],
	toul: ['Toul', 5.89, 48.68], epi: ['Épinal', 6.45, 48.17], belf: ['Belfort', 6.86, 47.64], nancy: ['Nancy', 6.18, 48.69],
	mul: ['Mulhouse', 7.34, 47.75], sar: ['Sarrebourg', 7.05, 48.73], mor: ['Morhange', 6.64, 48.92], kon: ['Königsberg', 20.5, 54.7],
	gum: ['Gumbinnen', 22.2, 54.6], all: ['Allenstein', 20.1, 53.5], lub: ['Lublin', 22.57, 51.25], che: ['Chełm', 23.47, 51.13],
	lodz: ['Łódź', 19.46, 51.76], lviv: ['Lemberg', 24.03, 49.84], prz: ['Przemyśl', 22.77, 49.78], kov: ['Kovno', 23.9, 54.9],
	vil: ['Vilna', 25.28, 54.69], gro: ['Grodno', 23.83, 53.68], minsk: ['Minsk', 27.56, 53.9], riga: ['Riga', 24.1, 56.95],
	nov: ['Novogeorgievsk', 20.7, 52.43], brest: ['Brest-Litovsk', 23.7, 52.1], rivne: ['Rovno', 26.25, 50.62], odesa: ['Odessa', 30.7, 46.5],
	kharkiv: ['Kharkov', 36.25, 50.0], yuz: ['Yuzovka', 37.8, 48.0], sev: ['Sevastopol', 33.5, 44.6], chern: ['Czernowitz', 25.94, 48.29],
	dublin: ['Dublin', -6.26, 53.35], belfast: ['Belfast', -5.93, 54.6], ny: ['New York', -74.0, 40.7], liverpool: ['Liverpool', -2.98, 53.4],
	trier: ['Trier', 6.64, 49.75], lux: ['Luxembourg', 6.13, 49.61], helsinki: ['Helsinki', 24.94, 60.17], mitau: ['Mitau', 23.72, 56.65],
	baghdad: ['Baghdad', 44.4, 33.3], damascus: ['Damascus', 36.3, 33.5], jerusalem: ['Jerusalem', 35.2, 31.78], cairo: ['Cairo', 31.24, 30.04], gallipoli: ['Gallipoli', 26.4, 40.2],
	belgrade: ['Belgrade', 20.45, 44.8], sofia: ['Sofia', 23.32, 42.7], const: ['Constantinople', 28.97, 41.01], rome: ['Rome', 12.5, 41.9],
	brussels: ['Brussels', 4.35, 50.85], antw: ['Antwerp', 4.4, 51.22], rott: ['Rotterdam', 4.48, 51.92], hague: ['The Hague', 4.3, 52.08],
	liege: ['Liège', 5.57, 50.63], wil: ['Wilhelmshaven', 8.1, 53.53], scapa: ['Scapa Flow', -3.1, 58.9], hamburg: ['Hamburg', 9.99, 53.55],
	briey: ['Briey', 5.94, 49.25], cologne: ['Cologne', 6.96, 50.94], bern: ['Bern', 7.45, 46.95], dresden: ['Dresden', 13.74, 51.05],
	koln: ['Cologne', 6.96, 50.94], breslau: ['Breslau', 17.04, 51.11], krakow: ['Kraków', 19.94, 50.06], pskov: ['Pskov', 28.33, 57.82],
};

// головні учасники для заливки мапи
export const SIDE_OF: Record<string, 'ger' | 'ah' | 'rus' | 'ent' | 'usa'> = {
	'German Empire': 'ger',
	'Austro-Hungarian Empire': 'ah',
	'Russian Empire': 'rus',
	Finland: 'rus',
	Georgia: 'rus',
	Azerbaijan: 'rus',
	Armenia: 'rus',
	France: 'ent',
	'United Kingdom of Great Britain and Ireland': 'ent',
	'United States': 'usa',
};

export const VIEW: Record<string, Bounds> = {
	europe: [[-9, 40.5], [42, 61]],
	centralEurope: [[-2, 44], [32, 58.5]],
	west: [[-1.5, 46.2], [11, 52.6]],
	lorraine: [[4.3, 47.3], [8.7, 49.9]],
	belgium: [[0.5, 48.6], [9, 52.6]],
	britain: [[-11, 48.5], [12, 60.5]],
	east: [[12, 46], [36, 60]],
	prussia: [[17.5, 51.8], [25.5, 56]],
	poland: [[16.5, 48.6], [27.5, 55.8]],
	galicia: [[19, 47], [29, 52]],
	balkans: [[13, 39.5], [32, 47.5]],
	ukraine: [[21.5, 44.2], [41, 53.2]],
	petro: [[22, 54], [36, 61]],
	northsea: [[-14, 47], [16, 61.5]],
	baltic: [[18, 53.5], [34, 60.8]],
	middleEast: [[22, 26], [52, 43]],
	gallipoli: [[24.5, 38.8], [30, 41.6]],
	atlantic: [[-78, 30], [8, 58]],
	ireland: [[-11, 51.1], [-4.5, 55.6]],
	ringOfCrowns: [[14, 44], [42, 66]],
};
