// EP01 storyboard: one visual per voice paragraph (index = en/voice/manifest.json). 91 beats.
// mode drives the REAL HISTORY / OUR TIMELINE badge; year is shown next to it.
import type {Mode} from './brand';
import type {CardSpec} from './Cards';
import type {Layer, MapSpec} from './Map';
import type {FilmSpec, PhotoSpec} from './Media';
import {BLOCK, F14, F15, F16, FHOLD, GAL, LIT, POL, REAL_WEST, RHINE, UKR, VIEW, WB, behind} from './geo';

export type Bg = {src: string; from?: number; credit: string};
export type Beat = (MapSpec | CardSpec | PhotoSpec | FilmSpec) & {mode?: Mode; year?: string; bg?: Bg};

// ---------- credits ----------
const BARCH = 'Bundesarchiv via Europeana · public domain';
const CINE = 'Cinematek (Royal Film Archive of Belgium) via Europeana · public domain';
const DFF = 'DFF via Europeana · public domain';
const COMMONS = 'Wikimedia Commons · public domain';
const NARA = 'US National Archives · public domain';
const LOC = 'Library of Congress · public domain';
const BNF = 'Agence Rol / BnF · public domain';
const MEURISSE = 'Agence Meurisse / BnF Gallica · public domain';
const OLD_FILM = 'German War Film 1914–18 / Battle of the Somme (1916) · public domain';

type Extra = {mode?: Mode; year?: string; bg?: Bg};
const ph = (src: string, credit: string, o: Partial<PhotoSpec> & Extra = {}): Beat => ({k: 'photo', src: `photos/en/${src}`, credit, ...o});
const film = (src: string, credit: string, o: Partial<FilmSpec> & Extra = {}): Beat => ({k: 'film', src, credit, ...o});
const map = (m: Omit<MapSpec, 'k'> & Extra): Beat & MapSpec => ({k: 'map', ...m});
const bgf = (src: string, credit = OLD_FILM, from = 0): {bg: Bg} => ({bg: {src, from, credit}});

// ---------- reusable map layers ----------
const westAtk: Layer[] = [
	{t: 'arrow', a: [5.5, 48.6], b: [6.5, 48.95], c: 'ent'},
	{t: 'arrow', a: [6.2, 47.8], b: [7.3, 47.85], c: 'ent', at: 0.1},
];
const schlieffen: Layer[] = [
	{t: 'arrow', a: [6.7, 51.0], b: [3.4, 50.5], c: 'ger', bend: -0.15, w: 1.3},
	{t: 'arrow', a: [6.3, 50.3], b: [2.8, 49.3], c: 'ger', bend: -0.12, at: 0.08, w: 1.3},
	{t: 'arrow', a: [6.6, 49.6], b: [4.2, 48.9], c: 'ger', bend: -0.1, at: 0.16},
];
const eastPlan: Layer[] = [
	{t: 'arrow', a: [20.8, 54.1], b: [21.4, 52.9], c: 'ger'},
	{t: 'arrow', a: [18.0, 51.4], b: [20.2, 52.0], c: 'ger', at: 0.1},
	{t: 'arrow', a: [22.4, 50.2], b: [22.7, 51.3], c: 'ah', at: 0.2},
];
// troop trains along real 1914 lines (station keys from rail1914.ts)
const railsEast: Layer[] = [
	{t: 'route', via: ['cologne', 'berlin', 'konigsberg'], dur: 0.5},
	{t: 'route', via: ['frankfurt', 'berlin', 'posen', 'thorn', 'allenstein'], at: 0.1, dur: 0.5},
	{t: 'route', via: ['berlin', 'breslau'], at: 0.2, dur: 0.4, label: false},
];
const railsWest: Layer[] = [
	{t: 'route', via: ['berlin', 'cologne', 'liege'], dur: 0.5},
	{t: 'route', via: ['berlin', 'frankfurt', 'mainz', 'bingen', 'saarbrucken', 'metz'], at: 0.1, dur: 0.5},
];
const ME_NOTES: Layer[] = [
	{t: 'country', names: ['Ottoman Empire'], c: 'ott'},
	{t: 'city', keys: ['const', 'damascus', 'baghdad', 'jerusalem', 'cairo']},
];

export const EPISODE = {
	title: 'What if Germany attacked Russia first?',
	ident: {year: '1914', station: 'BERLIN', real: 'WEST', alt: 'EAST'},
	stingMap: map({view: VIEW.europe, layers: [{t: 'front', pts: WB}, {t: 'front', pts: F14}]}),
	actDates: ['AUG 1914', '1917'], // act II, act III
	actModes: ['alt', 'alt'] as Mode[],
};

export const STORY: Beat[] = [
	// ================= COLD OPEN =================
	{k: 'big', lines: ['Berlin', '1 August 1914'], sub: '11 pm', mode: 'real', year: '1914', ...bgf('en/kaiser_portrait', BARCH)},
	ph('a_kaiser_and_moltke_1914.jpg', 'Wilhelm II and Moltke, 1914 · no known restrictions', {mount: true, cap: {t: 'Wilhelm II and Moltke'}, mode: 'real', year: '1914'}),
	{k: 'quote', text: 'Now you can do what you want.', who: 'Wilhelm II to Moltke, about 11 pm', mode: 'real', year: '1914'},
	map({view: VIEW.europe, from: VIEW.centralEurope, layers: [...schlieffen, {t: 'city', keys: ['berlin', 'paris', 'brussels']}], stat: {big: '≈10 million', small: 'soldiers dead by 1918', at: 0.45, c: 'ent'}, cap: {t: 'West, through Belgium'}}),
	{k: 'doc', head: 'MOLTKE · ERINNERUNGEN · 1922', title: 'Half an hour', lines: ['Lichnowsky’s dispatch', 'thirty minutes earlier', 'no mobilization order'], stamp: 'WHAT IF', mode: 'real', year: '1914'},
	map({view: VIEW.europe, layers: [...schlieffen.map((l) => ({...l, at: -1})), {t: 'cross', p: [4.0, 50.3], at: 0.15}, {t: 'arrow', a: [13.4, 52.5], b: [24.5, 53.2], c: 'ger', at: 0.3, w: 2.4}, {t: 'note', p: [21, 55.2], text: 'east first?', at: 0.4, big: true}], title: {t: 'East first', s: 'What if Germany attacked Russia first in 1914?', at: 0.62}, mode: 'alt', year: '1914'}),

	// ================= ACT I · THE TRACKS =================
	{k: 'versus', a: {dir: '← WEST', t: 'Schlieffen–Moltke plan', s: 'beat France first, then Russia'}, b: {dir: 'EAST →', t: 'Great Eastern Deployment', s: 'hold the west, strike Russia'}, mode: 'real', year: '1913'},
	map({view: VIEW.west, from: VIEW.europe, layers: [...schlieffen, {t: 'city', keys: ['paris', 'brussels', 'liege']}, {t: 'fort', keys: ['verdun', 'toul', 'belf'], at: 0.2}, {t: 'note', p: [1.6, 50.6], text: 'Paris in six weeks?', at: 0.45, big: true}], cap: {t: 'The famous plan', s: 'around the forts, through Belgium'}, mode: 'real', year: '1914'}),
	map({view: VIEW.centralEurope, from: VIEW.west, layers: [...eastPlan.map((l) => ({...l, at: (l.at ?? 0) + 0.3})), {t: 'front', pts: WB, at: 0.1, dur: 0.2}, {t: 'note', p: [3.5, 48.9], text: 'west: hold', at: 0.15}, {t: 'note', p: [20.5, 55.3], text: 'east: strike', at: 0.45}, {t: 'city', keys: ['berlin', 'warsaw', 'vienna']}], cap: {t: 'The other plan', s: 'the elder Moltke’s idea'}, mode: 'real', year: '1880s'}),
	{k: 'doc', head: 'GEHEIM · GROSSER GENERALSTAB', title: 'Großer Ostaufmarsch', lines: ['updated every year', 'trains, timetables, the lot', 'scrapped in 1913'], stamp: 'CANCELLED', mode: 'real', year: '1913'},
	{k: 'big', lines: ['No', 'Plan B'], sub: 'historian Holger Herwig', mode: 'real', year: '1913', ...bgf('g_officers')},
	ph('b_george_v_nicholas_ii_berlin_1913.jpg', 'Ernest Sandau, Berlin 1913 · public domain', {move: 'in', focus: [0.5, 0.35], cap: {t: 'Berlin, May 1913', s: 'George V and Nicholas II, both in German uniform'}, mode: 'real', year: '1913'}),
	{k: 'telegram', head: 'WILLY → NICKY · 1 AUG 1914', text: 'Immediate affirmative clear and unmistakable answer from your government is the only way to avoid endless misery.', mode: 'real', year: '1914'},
	ph('a_berlin_mobilmachung_aug1914_barch.jpg', 'Bundesarchiv, Bild 183-R22572 / CC-BY-SA 3.0', {move: 'left', cap: {t: 'Berlin, 1 August 1914', s: '5 pm: the order to mobilize'}, mode: 'real', year: '1914'}),
	{k: 'telegram', head: 'LICHNOWSKY · LONDON → BERLIN', text: 'If Germany does not attack France, England will remain neutral and guarantee France’s neutrality.', stamp: 'URGENT', mode: 'real', year: '1914'},
	{k: 'quote', text: 'So we simply deploy the whole army in the East!', who: 'Wilhelm II, 1 August 1914', mode: 'real', year: '1914', ...bgf('en/kaiser_portrait', COMMONS)},
	map({view: VIEW.centralEurope, layers: [...railsWest, {t: 'note', p: [9.5, 53.4], text: 'a year of timetables', at: 0.35}, {t: 'city', keys: ['berlin', 'cologne', 'trier']}], cap: {t: 'A million men', s: '“cannot be improvised”'}, mode: 'real', year: '1914'}),
	{k: 'quote', pre: 'Moltke’s answer', text: 'A wild heap of disorderly armed men without supplies.', who: 'Helmuth von Moltke, 1 August 1914', mode: 'real', year: '1914'},
	ph('a_moltke_1914_rol.jpg', BNF, {move: 'in', focus: [0.5, 0.3], cap: {t: 'Helmuth von Moltke', s: 'chief of the General Staff'}, mode: 'real', year: '1914'}),
	{k: 'quote', text: 'Your uncle would have given me a different answer.', who: 'Wilhelm II to Moltke, as Moltke recorded it', mode: 'real', year: '1914'},
	map({view: VIEW.belgium, layers: [{t: 'country', names: ['Luxembourg'], c: 'gold'}, {t: 'city', keys: ['trier', 'lux']}, {t: 'arrow', a: [6.64, 49.75], b: [6.2, 49.62], c: 'ger', at: 0.15}, {t: 'cross', p: [6.4, 49.68], at: 0.4}, {t: 'note', p: [7.6, 50.3], text: 'do not enter Luxembourg', at: 0.45}], cap: {t: 'Moltke refuses to sign', s: 'and goes home in tears'}, mode: 'real', year: '1914'}),
	ph('a_echternach_german_troops_2aug1914.jpg', 'J.M. Bellwald, 2 August 1914 · public domain', {move: 'right', cap: {t: 'German troops in Luxembourg', s: 'the war started, paused, and started again'}, mode: 'real', year: '1914'}),
	map({view: VIEW.northsea, layers: [{t: 'city', keys: ['london', 'berlin']}, {t: 'front', style: 'real', pts: [[-0.1, 51.5], [4.0, 52.3], [8.6, 52.6], [13.4, 52.5]], dur: 0.5}, {t: 'note', p: [5.5, 53.6], text: '~11 pm: the King’s reply', at: 0.45}], mode: 'real', year: '1914'}),
	{k: 'telegram', head: 'GEORGE V → WILHELM II', text: 'I think there must be some misunderstanding as to a suggestion that passed in friendly conversation between Prince Lichnowsky and Sir Edward Grey.', mode: 'real', year: '1914'},
	ph('a_troop_train_aug1914_tellgmann.jpg', 'Oscar Tellgmann, August 1914 · public domain', {move: 'left', cap: {t: 'The machine rolls west'}, mode: 'real', year: '1914'}),
	{k: 'doc', head: 'BERLIN · MITTLER & SOHN · 1925', title: 'Aufmarsch nach zwei Fronten', lines: ['General Hermann von Staabs', 'former head of the railway department', 'a whole book to answer Moltke'], stamp: '1925', mode: 'real', year: '1925'},
	map({view: VIEW.centralEurope, layers: [...railsEast, {t: 'arrow', a: [7.5, 50.5], b: [19.5, 53.4], c: 'ger', at: 0.35, bend: -0.05}, {t: 'note', p: [12.5, 54.4], text: 'Staabs’s railway men', at: 0.2}, {t: 'note', p: [15.5, 49.8], text: '4 armies east · 3 west', at: 0.5, big: true}], stat: {big: '15 Aug', small: 'four armies facing Russia, by Staabs’s maths', at: 0.6, c: 'ger'}, mode: 'real', year: '1925'}),
	map({view: VIEW.europe, layers: [...schlieffen.map((l) => ({...l, at: -1})), {t: 'cross', p: [4.0, 50.3], at: 0.1}, ...railsEast.map((l) => ({...l, at: 0.2})), {t: 'arrow', a: [13.4, 52.5], b: [24.5, 53.2], c: 'ger', at: 0.35, w: 2.4}], title: {t: 'The switch', s: 'the telegram arrives half an hour earlier', at: 0.55}, mode: 'alt', year: '1914'}),

	// ================= ACT II · THE OTHER TRACK =================
	map({view: VIEW.west, from: VIEW.europe, layers: [{t: 'front', pts: WB, dur: 0.3}, ...westAtk.map((l) => ({...l, at: (l.at ?? 0) + 0.3})), {t: 'city', keys: ['paris', 'metz', 'str']}], cap: {t: 'France attacks', s: 'the alliance with Russia leaves no choice'}, mode: 'alt', year: '1914'}),
	map({view: VIEW.west, keep: true, layers: [{t: 'front', style: 'real', pts: REAL_WEST}, {t: 'note', p: [1.2, 50.0], text: 'real front: 700 km', at: 0.1}, {t: 'note', p: [9.6, 47.6], text: 'ours: under 300 km', at: 0.45, big: true}, {t: 'fort', keys: ['metz', 'str', 'belf'], at: 0.55}], mode: 'alt', year: '1914'}),
	map({view: VIEW.lorraine, layers: [{t: 'front', pts: WB}, {t: 'fort', keys: ['metz', 'str', 'nancy', 'mor', 'sar']}, ...westAtk, {t: 'ring', p: [6.64, 48.92], c: 'ent', at: 0.2}], stat: {big: '≈27,000', small: 'French dead on 22 August 1914, mostly in the Ardennes', at: 0.45, c: 'ent'}, mode: 'real', year: '1914'}),
	{k: 'stats', title: 'Lost in the real 1914, kept in ours', items: [{big: 'most', small: 'of France’s iron ore', c: 'ent'}, {big: '≈⅔', small: 'of its pig iron', c: 'ent'}], mode: 'both', year: '1914', ...bgf('g_ruins')},
	map({view: VIEW.britain, from: VIEW.west, layers: [{t: 'note', p: [-2.5, 54.6], text: '?', big: true, at: 0.2}, {t: 'city', keys: ['london']}], cap: {t: 'The biggest question', s: 'what does Britain do?'}, mode: 'alt', year: '1914'}),
	map({view: VIEW.belgium, layers: [{t: 'country', names: ['Belgium'], c: 'gold', at: 0.2}, {t: 'note', p: [4.4, 50.3], text: 'neutral since 1839', at: 0.35}, {t: 'city', keys: ['brussels', 'london', 'antw']}], cap: {t: 'Belgium', s: 'what swung the British cabinet'}, mode: 'real', year: '1914'}),
	{k: 'headline', paper: 'THE DAILY CHRONICLE', head: 'POOR LITTLE BELGIUM', sub: 'Towns in flames. Britain must stand by her word.', mode: 'alt', year: '1914'},
	map({view: VIEW.ireland, from: VIEW.britain, layers: [{t: 'city', keys: ['dublin', 'belfast']}, {t: 'note', p: [-7.6, 52.6], text: 'Home Rule: now', at: 0.2, big: true}, {t: 'ring', p: [-5.93, 54.6], c: 'ent', at: 0.45}, {t: 'note', p: [-6.4, 55.2], text: 'Ulster: rifles', at: 0.5}], cap: {t: 'Ireland', s: 'trouble earlier, along other lines'}, mode: 'alt', year: '1914'}),
	map({view: VIEW.east, from: VIEW.europe, layers: [{t: 'city', keys: ['berlin', 'warsaw', 'petro', 'kyiv', 'vienna']}, {t: 'arrow', a: [24.2, 54.8], b: [22.4, 54.62], c: 'rus', at: 0.4}, {t: 'arrow', a: [21.4, 52.6], b: [20.6, 53.6], c: 'rus', at: 0.5}], cap: {t: 'The east', s: 'Russia keeps its promise to France'}, mode: 'alt', year: '1914'}),
	ph('d_tannenberg_1914.jpg', 'R. Minzloff, Berliner Illustrirte Zeitung, 1914 · public domain', {move: 'in', cap: {t: 'Russian prisoners, Tilsit station', s: 'East Prussia, 1914'}, mode: 'real', year: '1914'}),
	map({view: VIEW.poland, from: VIEW.prussia, layers: [{t: 'arrow', a: [19.3, 53.9], b: [20.3, 53.55], c: 'ger'}, {t: 'arrow', a: [21.6, 54.25], b: [20.9, 53.65], c: 'ger', at: 0.05}, {t: 'arrow', a: [20.9, 54.95], b: [22.1, 54.7], c: 'ger', at: 0.1}, {t: 'cross', p: [20.7, 53.6], at: 0.2}, {t: 'cross', p: [22.3, 54.6], at: 0.25}, {t: 'arrow', a: [21.6, 53.5], b: [22.2, 52.3], c: 'ger', at: 0.4}, {t: 'arrow', a: [22.6, 50.4], b: [22.6, 51.2], c: 'ah', at: 0.45}, {t: 'region', pts: behind(F14), c: 'ger', hatch: true, at: 0.6}, {t: 'front', pts: F14, at: 0.6}, {t: 'city', keys: ['warsaw', 'kon']}, {t: 'note', p: [21.0, 52.75], text: 'Warsaw falls', at: 0.75, c: 'ger'}], cap: {t: 'Four German armies', s: 'and a pincer with far more men'}, mode: 'alt', year: '1914'}),
	map({view: VIEW.galicia, layers: [{t: 'country', names: ['Austro-Hungarian Empire'], c: 'ah'}, {t: 'front', pts: F14.slice(4)}, {t: 'city', keys: ['lviv', 'prz', 'krakow']}, {t: 'ring', p: [24.03, 49.84], c: 'ah', at: 0.3}, {t: 'note', p: [24.0, 48.9], text: 'Lemberg stays Austrian', at: 0.5}], stat: {big: '400,000+', small: 'Austro-Hungarian losses in three weeks of the real 1914', at: 0.25, c: 'ah'}, mode: 'both', year: '1914'}),
	map({view: VIEW.europe, layers: [{t: 'front', pts: WB}, {t: 'front', pts: F14}, {t: 'country', names: ['Ottoman Empire'], c: 'ott', at: 0.1}, {t: 'arrow', a: [42, 40.5], b: [44, 41.7], c: 'ott', at: 0.3}, {t: 'note', p: [38, 42.2], text: 'war with Russia', at: 0.35, c: 'ott'}, {t: 'country', names: ['Kingdom of Italy'], c: 'neutral', at: 0.6}, {t: 'note', p: [12.6, 43.3], text: 'Italy: neutral', at: 0.65}], mode: 'alt', year: '1914'}),
	ph('g_anzac_landing_1915.jpg', 'State Library of New South Wales · public domain', {move: 'up', cap: {t: 'Anzac Cove, 25 April 1915', s: 'in our timeline, this never happens'}, mode: 'real', year: '1915'}),
	{k: 'people', title: 'Two careers rewritten', items: [{n: 'Mustafa Kemal', real: 'hero of Gallipoli, 1915 → founder of modern Turkey', alt: 'one more officer in the Caucasus snow'}, {n: 'Winston Churchill', real: 'loses the Admiralty over the Dardanelles, 1915', alt: 'keeps his desk: no Dardanelles to gamble on'}], mode: 'alt', year: '1915'},
	map({view: VIEW.middleEast, from: VIEW.europe, layers: [...ME_NOTES, {t: 'note', p: [40.5, 30.2], text: 'McMahon 1915', at: 0.15}, {t: 'note', p: [43.5, 36.5], text: 'Sykes–Picot 1916', at: 0.3}, {t: 'note', p: [33.2, 32.6], text: 'Balfour 1917', at: 0.45}, {t: 'note', p: [42, 39.8], text: 'three promises', at: 0.6, big: true}], cap: {t: 'The lines drawn after 1918', s: 'Iraq · Syria · Jordan · Lebanon'}, mode: 'real', year: '1916'}),
	{k: 'big', lines: ['Armenians, 1915'], sub: 'at least 664,000 killed, possibly over a million. Alternate history cannot tell us this would not have happened.', mode: 'real', year: '1915'},
	map({view: VIEW.belgium, layers: [{t: 'front', pts: WB}, {t: 'country', names: ['Belgium', 'Luxembourg'], c: 'gold'}, {t: 'arrow', a: [3.5, 49.6], b: [5.6, 50.4], c: 'ent', at: 0.25, w: 1.4}, {t: 'cross', p: [5.0, 50.1], at: 0.6}, {t: 'note', p: [1.6, 51.6], text: 'Paris: no (again)', at: 0.62, big: true, c: 'ent'}], cap: {t: 'Joffre asks to go around', s: 'through Belgium, like 1912'}, mode: 'alt', year: '1915', ...{}}),
	map({view: VIEW.east, layers: [{t: 'region', pts: behind(F14), c: 'ger', hatch: true, at: -1}, {t: 'front', pts: F14, style: 'blk'}, {t: 'fort', keys: ['kov', 'nov', 'brest'], at: 0.1}, {t: 'region', pts: behind(F15), c: 'ger', hatch: true, at: 0.4}, {t: 'front', pts: F15, at: 0.4}, {t: 'city', keys: ['riga', 'minsk', 'rivne']}], stat: {big: 'up to 90,000', small: 'men surrender at Novogeorgievsk, August 1915', at: 0.25, c: 'rus'}, cap: {t: 'Summer 1915', s: 'Riga · Minsk · Rovno'}, mode: 'alt', year: '1915'}),
	map({view: VIEW.balkans, layers: [{t: 'country', names: ['Bulgaria'], c: 'ger', at: 0.05}, {t: 'note', p: [27.4, 43.35], text: 'Bulgaria joins the Central Powers, Oct 1915', at: 0.12}, {t: 'arrow', a: [19.9, 45.6], b: [20.2, 44.0], c: 'ger', at: 0.15}, {t: 'arrow', a: [24.1, 42.85], b: [22.1, 43.3], c: 'ger', at: 0.18, w: 1.2}, {t: 'country', names: ['Serbia', 'Montenegro'], c: 'ah', at: 0.3}, {t: 'note', p: [19.6, 42.9], text: 'Serbia overrun, Nov 1915', at: 0.32}, {t: 'route', via: ['vienna', 'budapest', 'belgrade', 'constantinople'], at: 0.45, dur: 0.4}, {t: 'city', keys: ['vienna', 'belgrade', 'sofia', 'const']}, {t: 'note', p: [25.4, 40.2], text: 'Balkan Express, Jan 1916', at: 0.65, big: true}], mode: 'both', year: '1916'}),
	film('en/lusitania_departs', NARA, {cap: {t: 'Lusitania, 1 May 1915', s: 'leaving New York on her last voyage'}, mode: 'real', year: '1915'}),
	map({view: VIEW.atlantic, layers: [{t: 'city', keys: ['ny', 'liverpool']}, {t: 'arrow', a: [-72, 40.5], b: [-4, 53.2], c: 'usa', bend: -0.12, at: 0.15, w: 1.4}, {t: 'note', p: [-36, 49.5], text: 'docks on schedule', at: 0.5, big: true}, {t: 'note', p: [-60, 34], text: 'USA: somebody else’s feud', at: 0.65}], mode: 'alt', year: '1915'}),
	ph('c_verdun_nivelle_joffre_petain_1916.jpg', MEURISSE, {move: 'in', focus: [0.5, 0.4], cap: {t: 'Verdun, 1916', s: '≈300,000 dead in ten months'}, mode: 'real', year: '1916'}),
	film('en/british_volunteers', CINE, {cap: {t: 'Spring 1916', s: 'Britain comes in, late and divided'}, mode: 'alt', year: '1916'}),
	map({view: VIEW.lorraine, layers: [{t: 'front', pts: WB}, {t: 'arrow', a: [5.4, 48.6], b: [6.6, 48.95], c: 'ent', w: 1.5}, {t: 'arrow', a: [5.8, 48.2], b: [6.9, 48.45], c: 'ent', at: 0.1, w: 1.5}, {t: 'note', p: [6.0, 49.6], text: 'a Somme in Lorraine', at: 0.2}], stat: {big: '10–15 km', small: 'gained for hundreds of thousands of casualties', at: 0.45, c: 'ent'}, mode: 'alt', year: '1916'}),
	map({view: VIEW.east, layers: [{t: 'region', pts: behind(F15), c: 'ger', hatch: true, at: -1}, {t: 'front', pts: F15, style: 'blk'}, {t: 'region', pts: behind(F16), c: 'ger', hatch: true, at: 0.3}, {t: 'front', pts: F16, at: 0.3}, {t: 'city', keys: ['riga', 'kyiv', 'petro']}, {t: 'note', p: [29.0, 51.6], text: 'stop', at: 0.6, big: true, c: 'ger'}], cap: {t: 'End of 1916', s: 'Riga taken, the Germans outside Kyiv'}, mode: 'alt', year: '1916'}),
	{k: 'big', lines: ['Lost in kitchens', 'and in banks'], mode: 'both', year: '1916', ...bgf('k_people')},
	{k: 'bars', title: 'German daily ration, kcal (real history)', max: 3200, groups: [{rows: [{l: 'needed', v: 3000, txt: '≈3,000', c: 'food'}, {l: 'winter 1916–17', v: 1000, txt: '≈1,000', c: 'ent'}]}], note: 'the “turnip winter”, which was really the swede', mode: 'real', year: '1916'},
	ph('f_jp_morgan_jr_1919.jpg', LOC, {mount: true, cap: {t: 'J.P. Morgan & Co.', s: 'Britain’s shopper in America'}, mode: 'both', year: '1916'}),
	film('en/petrograd_crowds', NARA, {cap: {t: 'Petrograd, March 1917', s: 'bread queues, strikes, mutiny'}, mode: 'real', year: '1917'}),
	map({view: VIEW.petro, layers: [{t: 'city', keys: ['petro', 'moscow']}, {t: 'ring', p: [30.3, 59.93], at: 0.15}, {t: 'note', p: [30.3, 58.8], text: 'revolution', at: 0.25, big: true, c: 'ent'}], title: {t: 'The Tsar abdicates', s: 'and the new government asks for an armistice', at: 0.5}, mode: 'alt', year: '1917'}),

	// ================= ACT III · THE TRACK TAKEN =================
	map({view: VIEW.europe, layers: [{t: 'region', pts: POL, c: 'ger', at: -1}, {t: 'region', pts: LIT, c: 'ger', at: -1}, {t: 'front', pts: WB}, {t: 'arrow', a: [21, 52.6], b: [8.6, 50.0], c: 'ger', w: 2.4, bend: 0.08}, {t: 'note', p: [15, 53.8], text: '50 divisions west', at: 0.3, big: true}, {t: 'note', p: [-6, 43.5], text: 'America at home', at: 0.6}], mode: 'alt', year: '1917', ...{}}),
	map({view: VIEW.belgium, layers: [{t: 'front', pts: WB}, {t: 'city', keys: ['hague', 'paris', 'london']}, {t: 'ring', p: [4.3, 52.08], c: 'gold', at: 0.4}, {t: 'note', p: [4.3, 51.4], text: 'no annexations in the west', at: 0.3, big: true}], title: {t: 'The Hague, late 1917', s: 'a peace conference', at: 0.6}, mode: 'alt', year: '1917'}),
	map({view: VIEW.europe, layers: [{t: 'region', pts: POL, c: 'ger'}, {t: 'region', pts: LIT, c: 'ger', at: 0.05}, {t: 'region', pts: UKR, c: 'ger', dash: true, at: 0.1}, {t: 'note', p: [13.5, 53.9], text: 'MITTELEUROPA', at: 0.3, big: true, c: 'ger'}, {t: 'note', p: [2.5, 45.9], text: '1914 borders', at: 0.45}], cap: {t: 'Compromise peace', s: 'close to even odds'}, mode: 'alt', year: '1918'}),
	map({view: VIEW.ringOfCrowns, from: VIEW.europe, layers: [{t: 'region', pts: POL, c: 'ger', at: 0.1}, {t: 'region', pts: LIT, c: 'ger', at: 0.2}, {t: 'country', names: ['Finland'], c: 'ger', at: 0.3}, {t: 'region', pts: UKR, c: 'ger', dash: true, at: 0.4}, {t: 'city', keys: ['helsinki', 'riga', 'warsaw', 'kyiv']}], cap: {t: 'Germany built this map', s: 'for real, in 1917–18'}, mode: 'real', year: '1918'}),
	{k: 'people', title: 'Kings who never reigned', items: [{n: 'Poland', real: 'a kingdom with a regency and no king', alt: 'a king from Bavaria or Austria'}, {n: 'Lithuania', real: 'King Mindaugas II, Duke of Urach, never came', alt: 'crowned in Vilna'}, {n: 'Courland', real: 'crown offered to the Kaiser', alt: 'the Kaiser as duke'}, {n: 'Finland', real: 'the Kaiser’s brother-in-law, never arrived', alt: 'King of Finland'}, {n: 'Ukraine', real: 'a Hetman installed by Germany', alt: 'a German protectorate'}], mode: 'both', year: '1918'},
	map({view: VIEW.ringOfCrowns, layers: [{t: 'region', pts: POL, c: 'ger'}, {t: 'region', pts: LIT, c: 'ger'}, {t: 'country', names: ['Finland'], c: 'ger'}, {t: 'region', pts: UKR, c: 'ger', dash: true}, {t: 'note', p: [21, 52.3], text: '♛', at: 0.2, big: true}, {t: 'note', p: [24.2, 55.4], text: '♛', at: 0.3, big: true}, {t: 'note', p: [25.5, 62.2], text: '♛', at: 0.4, big: true}, {t: 'note', p: [23.6, 57.2], text: '♛', at: 0.5, big: true}, {t: 'note', p: [31, 49.6], text: '♛', at: 0.6, big: true}], cap: {t: 'Helsinki to Kyiv', s: 'every crown with a German army behind it'}, mode: 'alt', year: '1918'}),
	{k: 'bars', title: 'The Bread Peace, 1918 (real history)', max: 1000000, groups: [{rows: [{l: 'expected', v: 1000000, txt: '≈1,000,000 t', c: 'food'}, {l: 'crossed the border', v: 130000, txt: '≈130,000 t', c: 'gold'}, {l: 'Germany’s share', v: 49000, txt: '49,000 t', c: 'ent'}]}], mode: 'real', year: '1918'},
	{k: 'big', lines: ['Now', 'the people'], sub: 'Lenin · Hitler · Tolkien · Hemingway · Rommel', mode: 'alt', year: 'AFTER', ...bgf('k_people')},
	ph('h_lenin_tauride_apr1917.jpg', 'P. I. Volkov, April 1917 · public domain', {move: 'in', cap: {t: 'Lenin, April 1917', s: 'in our timeline: still in Zurich'}, mode: 'both', year: '1917'}),
	ph('i_hitler_list_regiment_1916.jpg', 'List Regiment runners, 1916, photographer unknown · Wikimedia Commons, public domain', {move: 'in', focus: [0.5, 0.45], cap: {t: 'Adolf Hitler, 1916', s: 'our timeline: back to Munich, painting postcards'}, mode: 'alt', year: 'AFTER'}),
	ph('i_tolkien_1916.jpg', 'J.R.R. Tolkien, 1916, photographer unknown · Wikimedia Commons, public domain', {mount: true, tilt: -2, cap: {t: 'J.R.R. Tolkien, 1916', s: 'a different war, a different book'}, mode: 'alt', year: 'AFTER'}),
	ph('i_hemingway_milan_1918.jpg', 'Ernest Hemingway, Milan 1918, photographer unknown · Wikimedia Commons, public domain', {move: 'in', focus: [0.5, 0.35], cap: {t: 'Ernest Hemingway, Milan 1918', s: 'Italy neutral: no A Farewell to Arms'}, mode: 'alt', year: 'AFTER'}),
	{k: 'quote', pre: 'Ypres, May 1915', text: 'In Flanders fields the poppies blow / Between the crosses, row on row', who: 'John McCrae, In Flanders Fields (1915)', mode: 'real', year: '1915'},
	map({view: VIEW.west, layers: [{t: 'country', names: ['France'], c: 'ent'}, {t: 'note', p: [2.4, 47.2], text: '1,000,000+ dead', at: 0.1}, {t: 'note', p: [2.4, 45.9], text: 'nothing gained', at: 0.3, big: true, c: 'ent'}, {t: 'note', p: [6.9, 46.4], text: 'the grievance moves here', at: 0.6}], cap: {t: 'Who loses this war?', s: 'France'}, mode: 'alt', year: 'AFTER'}),
	ph('j_paris_6feb1934_concorde.jpg', MEURISSE, {move: 'in', cap: {t: 'Place de la Concorde, 6 February 1934', s: 'the leagues bring down a government'}, mode: 'real', year: '1934'}),
	{k: 'people', items: [{n: 'Pétain', real: 'victor of Verdun → Vichy, 1940', alt: 'no Verdun, no legend'}, {n: 'de Gaulle', real: 'bayoneted and captured at Verdun, 1916', alt: 'never captured'}], mode: 'alt', year: 'AFTER'},
	{k: 'people', title: 'The next war’s heroes', items: [{n: 'Erwin Rommel', real: 'Pour le Mérite above Caporetto, 1917 → Infantry Attacks, read by Hitler', alt: 'Italy neutral: no Caporetto, no medal, no book'}], mode: 'alt', year: 'AFTER'},
	{k: 'blocs', items: [{t: 'Mitteleuropa', who: 'Germany, Austria-Hungary, Poland, Lithuania, Ukraine', want: 'keep the order of 1917', c: 'ger'}, {t: 'Revanchists', who: 'France, Russia', want: 'take back what they lost', c: 'ent'}, {t: 'The undecided', who: 'Britain, and later America', want: 'nobody may own both land and sea', c: 'usa'}], mode: 'alt', year: 'AFTER'},
	map({view: VIEW.east, from: VIEW.europe, layers: [{t: 'arrow', a: [22.5, 53], b: [28.5, 54], c: 'rus', bend: 0.05}, {t: 'arrow', a: [22.5, 51.5], b: [28.5, 51.2], c: 'rus', at: 0.1}, {t: 'note', p: [26.5, 55.7], text: 'retreat instead', at: 0.2, c: 'rus'}], cap: {t: 'Where it could break', s: 'Russia retreats · France waits · the trains fail'}, mode: 'alt', year: '1914'}),
	{k: 'quote', text: 'The deployment of a million-man army cannot be improvised.', who: 'Helmuth von Moltke, 1 August 1914', mode: 'real', year: '1914', ...bgf('trains')},
	{k: 'big', lines: ['The most expensive mistakes', 'look sensible at the time'], mode: 'both', year: '1914', ...bgf('column')},
	map({view: VIEW.europe, layers: [...railsWest, ...railsEast.map((l) => ({...l, at: 0.25})), {t: 'city', keys: ['berlin', 'paris', 'petro']}, {t: 'note', p: [13.4, 54.6], text: 'which way?', at: 0.5, big: true}], cap: {t: 'Would Germany have won?', s: 'tell us in the comments'}, mode: 'both', year: '1914'}),
];
