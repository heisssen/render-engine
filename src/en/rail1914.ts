// Main railway lines that existed in 1914, as chains of stations. Curated by hand: no open pan-European
// historical railway layer exists, and modern networks (high-speed lines, post-war links) would be anachronistic.
// Opening years are for the line as a whole, rounded; all are well before 1914. Coordinates [lon, lat].
export type Station = [number, number, string];
export type Line = {id: string; opened: number; stations: Station[]};

const S: Record<string, Station> = {
	berlin: [13.37, 52.53, 'Berlin'], stendal: [11.86, 52.6, 'Stendal'], hanover: [9.74, 52.38, 'Hanover'], minden: [8.92, 52.29, 'Minden'],
	hamm: [7.81, 51.68, 'Hamm'], dortmund: [7.46, 51.51, 'Dortmund'], duisburg: [6.76, 51.43, 'Duisburg'], dusseldorf: [6.79, 51.22, 'Düsseldorf'],
	cologne: [6.96, 50.94, 'Cologne'], aachen: [6.09, 50.77, 'Aachen'], herbesthal: [6.0, 50.66, 'Herbesthal'], liege: [5.57, 50.63, 'Liège'],
	brussels: [4.35, 50.85, 'Brussels'], antwerp: [4.42, 51.22, 'Antwerp'], bonn: [7.1, 50.73, 'Bonn'], koblenz: [7.59, 50.36, 'Koblenz'],
	bingen: [7.9, 49.97, 'Bingen'], mainz: [8.27, 50.0, 'Mainz'], frankfurt: [8.66, 50.11, 'Frankfurt'], halle: [11.97, 51.48, 'Halle'],
	erfurt: [11.03, 50.98, 'Erfurt'], bebra: [9.79, 50.97, 'Bebra'], darmstadt: [8.65, 49.87, 'Darmstadt'], mannheim: [8.47, 49.48, 'Mannheim'],
	karlsruhe: [8.4, 49.0, 'Karlsruhe'], strasbourg: [7.75, 48.58, 'Strasbourg'], kreuznach: [7.86, 49.84, 'Kreuznach'], saarbrucken: [7.0, 49.24, 'Saarbrücken'],
	metz: [6.18, 49.11, 'Metz'], euskirchen: [6.79, 50.66, 'Euskirchen'], gerolstein: [6.66, 50.22, 'Gerolstein'], trier: [6.64, 49.75, 'Trier'],
	luxembourg: [6.13, 49.6, 'Luxembourg'], kustrin: [14.65, 52.59, 'Küstrin'], landsberg: [15.24, 52.73, 'Landsberg'], kreuz: [16.08, 52.88, 'Kreuz'],
	schneidemuhl: [16.74, 53.15, 'Schneidemühl'], bromberg: [18.0, 53.12, 'Bromberg'], dirschau: [18.78, 54.09, 'Dirschau'], marienburg: [19.03, 54.03, 'Marienburg'],
	elbing: [19.4, 54.16, 'Elbing'], konigsberg: [20.51, 54.71, 'Königsberg'], insterburg: [21.8, 54.63, 'Insterburg'], eydtkuhnen: [22.74, 54.56, 'Eydtkuhnen'],
	kovno: [23.9, 54.9, 'Kovno'], vilna: [25.28, 54.68, 'Vilna'], frankfurtOder: [14.55, 52.35, 'Frankfurt (Oder)'], posen: [16.93, 52.41, 'Posen'],
	thorn: [18.6, 53.01, 'Thorn'], allenstein: [20.48, 53.78, 'Allenstein'], guben: [14.72, 51.95, 'Guben'], sagan: [15.32, 51.62, 'Sagan'],
	liegnitz: [16.16, 51.21, 'Liegnitz'], breslau: [17.04, 51.11, 'Breslau'], oppeln: [17.93, 50.67, 'Oppeln'], kattowitz: [19.02, 50.26, 'Kattowitz'],
	krakow: [19.94, 50.06, 'Kraków'], tarnow: [20.98, 50.01, 'Tarnów'], przemysl: [22.77, 49.78, 'Przemyśl'], lemberg: [24.03, 49.84, 'Lemberg'],
	vienna: [16.37, 48.2, 'Vienna'], lundenburg: [16.88, 48.76, 'Lundenburg'], prerau: [17.45, 49.45, 'Prerau'], oderberg: [18.27, 49.92, 'Oderberg'],
	budapest: [19.04, 47.5, 'Budapest'], subotica: [19.67, 46.1, 'Szabadka'], novisad: [19.84, 45.25, 'Újvidék'], belgrade: [20.46, 44.81, 'Belgrade'],
	nis: [21.9, 43.32, 'Niš'], sofia: [23.32, 42.7, 'Sofia'], plovdiv: [24.75, 42.15, 'Philippopolis'], edirne: [26.56, 41.68, 'Adrianople'],
	constantinople: [28.98, 41.01, 'Constantinople'], warsaw: [21.01, 52.23, 'Warsaw'], bialystok: [23.16, 53.13, 'Białystok'], grodno: [23.83, 53.68, 'Grodno'],
	dvinsk: [26.53, 55.88, 'Dvinsk'], pskov: [28.33, 57.82, 'Pskov'], petrograd: [30.3, 59.93, 'St Petersburg'], brest: [23.7, 52.1, 'Brest-Litovsk'],
	minsk: [27.56, 53.9, 'Minsk'], smolensk: [32.05, 54.78, 'Smolensk'], moscow: [37.6, 55.75, 'Moscow'], ivangorod: [21.83, 51.56, 'Ivangorod'],
	lublin: [22.57, 51.25, 'Lublin'], kovel: [24.72, 51.21, 'Kovel'], rovno: [26.25, 50.62, 'Rovno'], kiev: [30.52, 50.45, 'Kiev'], riga: [24.1, 56.95, 'Riga'],
	paris: [2.35, 48.85, 'Paris'], epernay: [3.95, 49.04, 'Épernay'], chalons: [4.36, 48.96, 'Châlons'], barleduc: [5.16, 48.77, 'Bar-le-Duc'],
	toul: [5.89, 48.68, 'Toul'], nancy: [6.18, 48.69, 'Nancy'], luneville: [6.5, 48.59, 'Lunéville'], avricourt: [6.81, 48.65, 'Avricourt'],
	troyes: [4.07, 48.3, 'Troyes'], chaumont: [5.14, 48.11, 'Chaumont'], vesoul: [6.15, 47.62, 'Vesoul'], belfort: [6.86, 47.64, 'Belfort'],
	reims: [4.03, 49.25, 'Reims'], verdun: [5.38, 49.16, 'Verdun'], namur: [4.87, 50.47, 'Namur'],
	// Russian Empire
	bologoye: [34.03, 57.88, 'Bologoye'], tver: [35.9, 56.86, 'Tver'], tula: [37.62, 54.19, 'Tula'], orel: [36.08, 52.97, 'Orel'],
	kursk: [36.19, 51.73, 'Kursk'], kharkov: [36.23, 49.99, 'Kharkov'], lozovaya: [36.32, 48.89, 'Lozovaya'], alexandrovsk: [35.14, 47.84, 'Alexandrovsk'],
	melitopol: [35.37, 46.85, 'Melitopol'], dzhankoy: [34.39, 45.71, 'Dzhankoy'], simferopol: [34.1, 44.95, 'Simferopol'], sevastopol: [33.52, 44.6, 'Sevastopol'],
	ryazan: [39.74, 54.63, 'Ryazan'], kozlov: [40.5, 52.9, 'Kozlov'], voronezh: [39.2, 51.66, 'Voronezh'], rostov: [39.72, 47.23, 'Rostov'],
	vladimir: [40.4, 56.13, 'Vladimir'], nizhny: [44.0, 56.33, 'Nizhny Novgorod'], sergiev: [38.13, 56.31, 'Sergiev Posad'], yaroslavl: [39.89, 57.63, 'Yaroslavl'],
	rzhev: [34.33, 56.26, 'Rzhev'], velikiyeluki: [30.53, 56.34, 'Velikiye Luki'], sebezh: [28.49, 56.29, 'Sebezh'], rezekne: [27.33, 56.51, 'Rezhitsa'],
	krustpils: [25.86, 56.51, 'Kreuzburg'], vitebsk: [30.2, 55.19, 'Vitebsk'], bryansk: [34.36, 53.24, 'Bryansk'], kaluga: [36.26, 54.51, 'Kaluga'],
	konotop: [33.2, 51.24, 'Konotop'], bakhmach: [32.82, 51.18, 'Bakhmach'], nezhin: [31.88, 51.05, 'Nezhin'], fastov: [29.92, 50.08, 'Fastov'],
	kazatin: [28.84, 49.72, 'Kazatin'], zhmerinka: [28.11, 49.04, 'Zhmerinka'], birzula: [29.59, 47.75, 'Birzula'], odessa: [30.73, 46.48, 'Odessa'],
	narva: [28.19, 59.38, 'Narva'], reval: [24.75, 59.44, 'Reval'], valga: [26.05, 57.78, 'Walk'], krivoyrog: [33.39, 47.91, 'Krivoy Rog'],
	ekaterinoslav: [35.05, 48.47, 'Ekaterinoslav'], yasinovataya: [37.85, 48.13, 'Yasinovataya'], slavyansk: [37.6, 48.85, 'Slavyansk'],
	nikitovka: [38.0, 48.36, 'Nikitovka'], taganrog: [38.9, 47.21, 'Taganrog'], tikhoretsk: [40.13, 45.85, 'Tikhoretsk'], armavir: [41.12, 44.99, 'Armavir'],
	mineralnye: [43.13, 44.21, 'Mineralnye Vody'], vladikavkaz: [44.67, 43.02, 'Vladikavkaz'], piotrkow: [19.7, 51.4, 'Piotrków'], czestochowa: [19.12, 50.81, 'Częstochowa'],
	lida: [25.3, 53.89, 'Lida'], baranovichi: [26.0, 53.13, 'Baranovichi'], luninets: [26.8, 52.24, 'Luninets'], sarny: [26.6, 51.34, 'Sarny'],
	bobruisk: [29.22, 53.14, 'Bobruisk'], gomel: [31.0, 52.43, 'Gomel'],
	// France, Low Countries
	creil: [2.47, 49.26, 'Creil'], amiens: [2.3, 49.89, 'Amiens'], arras: [2.78, 50.29, 'Arras'], douai: [3.08, 50.37, 'Douai'], lille: [3.06, 50.63, 'Lille'],
	rouen: [1.09, 49.44, 'Rouen'], havre: [0.11, 49.49, 'Le Havre'], dijon: [5.04, 47.32, 'Dijon'], lyon: [4.83, 45.76, 'Lyon'], avignon: [4.81, 43.95, 'Avignon'],
	marseille: [5.37, 43.3, 'Marseille'], orleans: [1.9, 47.9, 'Orléans'], tours: [0.69, 47.39, 'Tours'], poitiers: [0.34, 46.58, 'Poitiers'],
	angouleme: [0.16, 45.65, 'Angoulême'], bordeaux: [-0.58, 44.84, 'Bordeaux'], arlon: [5.82, 49.68, 'Arlon'], amsterdam: [4.9, 52.38, 'Amsterdam'],
	utrecht: [5.11, 52.09, 'Utrecht'], arnhem: [5.9, 51.98, 'Arnhem'], emmerich: [6.24, 51.83, 'Emmerich'],
	// Austria-Hungary, Balkans
	graz: [15.44, 47.07, 'Graz'], marburg: [15.65, 46.56, 'Marburg'], laibach: [14.51, 46.06, 'Laibach'], trieste: [13.77, 45.65, 'Trieste'],
	brno: [16.61, 49.2, 'Brünn'], ceskatrebova: [16.45, 49.9, 'Böhmisch Trübau'], pardubice: [15.78, 50.04, 'Pardubitz'], prague: [14.42, 50.08, 'Prague'],
	dresden: [13.74, 51.05, 'Dresden'], szekesfehervar: [18.41, 47.19, 'Székesfehérvár'], zagreb: [15.98, 45.81, 'Agram'], karlovac: [15.55, 45.49, 'Karlstadt'],
	fiume: [14.44, 45.33, 'Fiume'], zilina: [18.74, 49.22, 'Sillein'], poprad: [20.3, 49.06, 'Poprad'], kosice: [21.26, 48.72, 'Kaschau'],
	miskolc: [20.78, 48.1, 'Miskolc'], stanislau: [24.71, 48.92, 'Stanislau'], czernowitz: [25.94, 48.29, 'Czernowitz'], szolnok: [20.18, 47.17, 'Szolnok'],
	kolozsvar: [23.6, 46.77, 'Kolozsvár'], brasov: [25.59, 45.66, 'Kronstadt'], bucharest: [26.1, 44.43, 'Bucharest'], constanta: [28.65, 44.17, 'Constanța'],
	linz: [14.29, 48.31, 'Linz'], salzburg: [13.04, 47.8, 'Salzburg'], skopje: [21.43, 42.0, 'Üsküb'], salonika: [22.94, 40.64, 'Salonika'],
	// Germany extras
	hamburg: [9.99, 53.55, 'Hamburg'], munich: [11.58, 48.14, 'Munich'], augsburg: [10.9, 48.37, 'Augsburg'], ulm: [9.99, 48.4, 'Ulm'],
	stuttgart: [9.18, 48.78, 'Stuttgart'], nuremberg: [11.08, 49.45, 'Nuremberg'], leipzig: [12.38, 51.34, 'Leipzig'], hof: [11.92, 50.31, 'Hof'],
	// Italy
	turin: [7.69, 45.07, 'Turin'], milan: [9.19, 45.46, 'Milan'], venice: [12.33, 45.44, 'Venice'], bologna: [11.34, 44.49, 'Bologna'],
	florence: [11.25, 43.77, 'Florence'], rome: [12.5, 41.9, 'Rome'], naples: [14.27, 40.85, 'Naples'], ancona: [13.52, 43.62, 'Ancona'],
	foggia: [15.55, 41.46, 'Foggia'], bari: [16.87, 41.12, 'Bari'],
	// Britain
	london: [-0.12, 51.53, 'London'], bristol: [-2.58, 51.45, 'Bristol'], birmingham: [-1.9, 52.48, 'Birmingham'], crewe: [-2.44, 53.09, 'Crewe'],
	carlisle: [-2.93, 54.89, 'Carlisle'], glasgow: [-4.25, 55.86, 'Glasgow'], york: [-1.08, 53.96, 'York'], newcastle: [-1.61, 54.97, 'Newcastle'],
	edinburgh: [-3.19, 55.95, 'Edinburgh'], dover: [1.31, 51.13, 'Dover'],
	// Ottoman Empire
	haydarpasa: [29.02, 41.0, 'Haydarpaşa'], izmit: [29.92, 40.77, 'Izmit'], eskisehir: [30.52, 39.78, 'Eskişehir'], ankara: [32.85, 39.93, 'Angora'],
	afyon: [30.54, 38.76, 'Afyon'], konya: [32.49, 37.87, 'Konya'], eregli: [34.05, 37.51, 'Ereğli'], izmir: [27.14, 38.42, 'Smyrna'],
	manisa: [27.43, 38.61, 'Manisa'], damascus: [36.3, 33.5, 'Damascus'], deraa: [36.1, 32.62, 'Deraa'], amman: [35.93, 31.95, 'Amman'],
	maan: [35.73, 30.19, "Ma'an"], medina: [39.61, 24.47, 'Medina'],
	// Iberia, Scandinavia
	madrid: [-3.69, 40.42, 'Madrid'], valladolid: [-4.72, 41.65, 'Valladolid'], burgos: [-3.7, 42.34, 'Burgos'], irun: [-1.79, 43.34, 'Irún'],
	zaragoza: [-0.88, 41.65, 'Zaragoza'], barcelona: [2.17, 41.39, 'Barcelona'], cordoba: [-4.78, 37.88, 'Córdoba'], sevilla: [-5.98, 37.39, 'Seville'],
	stockholm: [18.06, 59.33, 'Stockholm'], gothenburg: [11.97, 57.71, 'Gothenburg'], linkoping: [15.62, 58.41, 'Linköping'], nassjo: [14.69, 57.65, 'Nässjö'],
	malmo: [13.0, 55.6, 'Malmö'], kristiania: [10.75, 59.91, 'Kristiania'],
};
export const STATIONS = S;

const line = (id: string, opened: number, ...keys: string[]): Line => ({id, opened, stations: keys.map((k) => S[k])});

export const RAIL1914: Line[] = [
	// Germany
	line('berlin-cologne', 1847, 'berlin', 'stendal', 'hanover', 'minden', 'hamm', 'dortmund', 'duisburg', 'dusseldorf', 'cologne'),
	line('cologne-liege', 1843, 'cologne', 'aachen', 'herbesthal', 'liege', 'namur'),
	line('liege-brussels-antwerp', 1842, 'liege', 'brussels', 'antwerp'),
	line('rhine-left-bank', 1859, 'cologne', 'bonn', 'koblenz', 'bingen', 'mainz', 'frankfurt'),
	line('berlin-frankfurt', 1866, 'berlin', 'halle', 'erfurt', 'bebra', 'frankfurt'),
	line('frankfurt-strasbourg', 1846, 'frankfurt', 'darmstadt', 'mannheim', 'karlsruhe', 'strasbourg'),
	line('nahe-saar-metz', 1860, 'bingen', 'kreuznach', 'saarbrucken', 'metz'),
	line('eifel-trier-lux', 1871, 'cologne', 'euskirchen', 'gerolstein', 'trier', 'luxembourg'),
	line('ostbahn', 1857, 'berlin', 'kustrin', 'landsberg', 'kreuz', 'schneidemuhl', 'bromberg', 'dirschau', 'marienburg', 'elbing', 'konigsberg'),
	line('konigsberg-eydtkuhnen-vilna', 1862, 'konigsberg', 'insterburg', 'eydtkuhnen', 'kovno', 'vilna'),
	line('berlin-posen-thorn-insterburg', 1873, 'berlin', 'frankfurtOder', 'posen', 'thorn', 'allenstein', 'insterburg'),
	line('lower-silesian', 1846, 'berlin', 'frankfurtOder', 'guben', 'sagan', 'liegnitz', 'breslau'),
	line('upper-silesian', 1847, 'breslau', 'oppeln', 'kattowitz', 'krakow'),
	// Austria-Hungary and the Balkans
	line('galician', 1861, 'krakow', 'tarnow', 'przemysl', 'lemberg'),
	line('nordbahn', 1856, 'vienna', 'lundenburg', 'prerau', 'oderberg', 'krakow'),
	line('vienna-budapest', 1851, 'vienna', 'budapest'),
	line('budapest-belgrade', 1884, 'budapest', 'subotica', 'novisad', 'belgrade'),
	line('orient', 1888, 'belgrade', 'nis', 'sofia', 'plovdiv', 'edirne', 'constantinople'),
	// Russian Empire
	line('warsaw-petersburg', 1862, 'warsaw', 'bialystok', 'grodno', 'vilna', 'dvinsk', 'rezekne', 'pskov', 'petrograd'),
	line('warsaw-moscow', 1871, 'warsaw', 'brest', 'minsk', 'smolensk', 'moscow'),
	line('vistula-kiev', 1877, 'warsaw', 'ivangorod', 'lublin', 'kovel', 'rovno', 'kiev'),
	line('riga-dvinsk', 1861, 'riga', 'krustpils', 'dvinsk'),
	// Moscow as the hub of the Russian network
	line('nikolaev', 1851, 'petrograd', 'bologoye', 'tver', 'moscow'),
	line('moscow-kursk-sevastopol', 1875, 'moscow', 'tula', 'orel', 'kursk', 'kharkov', 'lozovaya', 'alexandrovsk', 'melitopol', 'dzhankoy', 'simferopol', 'sevastopol'),
	line('moscow-ryazan-rostov', 1871, 'moscow', 'ryazan', 'kozlov', 'voronezh', 'rostov'),
	line('moscow-nizhny', 1862, 'moscow', 'vladimir', 'nizhny'),
	line('moscow-yaroslavl', 1870, 'moscow', 'sergiev', 'yaroslavl'),
	line('moscow-windau', 1901, 'moscow', 'rzhev', 'velikiyeluki', 'sebezh', 'rezekne', 'krustpils'),
	line('moscow-kiev', 1899, 'moscow', 'kaluga', 'bryansk', 'konotop'),
	line('riga-orel', 1868, 'dvinsk', 'vitebsk', 'smolensk', 'bryansk', 'orel'),
	line('kursk-kiev', 1868, 'kursk', 'konotop', 'bakhmach', 'nezhin', 'kiev'),
	line('kursk-voronezh', 1868, 'kursk', 'voronezh'),
	line('kiev-odessa', 1870, 'kiev', 'fastov', 'kazatin', 'zhmerinka', 'birzula', 'odessa'),
	line('baltic', 1870, 'petrograd', 'narva', 'reval'),
	line('pskov-riga', 1889, 'pskov', 'valga', 'riga'),
	line('kharkov-azov', 1869, 'lozovaya', 'slavyansk', 'nikitovka', 'taganrog', 'rostov'),
	line('catherine', 1884, 'krivoyrog', 'ekaterinoslav', 'yasinovataya', 'nikitovka'),
	line('rostov-vladikavkaz', 1875, 'rostov', 'tikhoretsk', 'armavir', 'mineralnye', 'vladikavkaz'),
	line('warsaw-vienna', 1848, 'warsaw', 'piotrkow', 'czestochowa', 'krakow'),
	line('polesie', 1886, 'vilna', 'lida', 'baranovichi', 'luninets', 'sarny', 'rovno'),
	line('brest-kovel', 1873, 'brest', 'kovel'),
	line('libau-romny', 1874, 'minsk', 'bobruisk', 'gomel', 'bakhmach'),
	line('gomel-bryansk', 1887, 'gomel', 'bryansk'),
	// France, Low Countries
	line('paris-strasbourg', 1852, 'paris', 'epernay', 'chalons', 'barleduc', 'toul', 'nancy', 'luneville', 'avricourt', 'strasbourg'),
	line('paris-belfort', 1858, 'paris', 'troyes', 'chaumont', 'vesoul', 'belfort'),
	line('paris-reims-verdun-metz', 1873, 'paris', 'reims', 'verdun', 'metz'),
	line('nord', 1846, 'paris', 'creil', 'amiens', 'arras', 'douai', 'lille', 'brussels'),
	line('paris-havre', 1847, 'paris', 'rouen', 'havre'),
	line('plm', 1856, 'paris', 'dijon', 'lyon', 'avignon', 'marseille'),
	line('paris-bordeaux', 1853, 'paris', 'orleans', 'tours', 'poitiers', 'angouleme', 'bordeaux'),
	line('brussels-luxembourg', 1858, 'brussels', 'namur', 'arlon', 'luxembourg'),
	line('amsterdam-ruhr', 1856, 'amsterdam', 'utrecht', 'arnhem', 'emmerich', 'duisburg'),
	// Germany extras
	line('berlin-hamburg', 1846, 'berlin', 'hamburg'),
	line('hamburg-hanover', 1847, 'hamburg', 'hanover'),
	line('south-german', 1854, 'munich', 'augsburg', 'ulm', 'stuttgart', 'karlsruhe'),
	line('munich-berlin', 1851, 'munich', 'nuremberg', 'hof', 'leipzig', 'halle', 'berlin'),
	line('dresden-berlin', 1875, 'dresden', 'berlin'),
	// Austria-Hungary, Balkans
	line('sudbahn', 1857, 'vienna', 'graz', 'marburg', 'laibach', 'trieste'),
	line('vienna-prague', 1849, 'vienna', 'lundenburg', 'brno', 'ceskatrebova', 'pardubice', 'prague'),
	line('prague-dresden', 1851, 'prague', 'dresden'),
	line('vienna-munich', 1860, 'vienna', 'linz', 'salzburg', 'munich'),
	line('budapest-fiume', 1873, 'budapest', 'szekesfehervar', 'zagreb', 'karlovac', 'fiume'),
	line('kaschau-oderberg', 1872, 'oderberg', 'zilina', 'poprad', 'kosice'),
	line('budapest-kaschau', 1870, 'budapest', 'miskolc', 'kosice'),
	line('lemberg-czernowitz', 1866, 'lemberg', 'stanislau', 'czernowitz'),
	line('budapest-bucharest', 1879, 'budapest', 'szolnok', 'kolozsvar', 'brasov', 'bucharest'),
	line('bucharest-constanta', 1895, 'bucharest', 'constanta'),
	line('nis-salonika', 1888, 'nis', 'skopje', 'salonika'),
	// Italy
	line('turin-venice', 1857, 'turin', 'milan', 'venice'),
	line('milan-naples', 1866, 'milan', 'bologna', 'florence', 'rome', 'naples'),
	line('adriatic', 1865, 'bologna', 'ancona', 'foggia', 'bari'),
	// Britain
	line('gwr', 1841, 'london', 'bristol'),
	line('west-coast', 1848, 'london', 'birmingham', 'crewe', 'carlisle', 'glasgow'),
	line('east-coast', 1850, 'london', 'york', 'newcastle', 'edinburgh'),
	line('london-dover', 1844, 'london', 'dover'),
	// Ottoman Empire (the Baghdad railway was still broken at the Taurus in 1914)
	line('anatolian', 1892, 'haydarpasa', 'izmit', 'eskisehir', 'ankara'),
	line('anatolian-konya', 1896, 'eskisehir', 'afyon', 'konya', 'eregli'),
	line('smyrna-afyon', 1897, 'izmir', 'manisa', 'afyon'),
	line('hejaz', 1908, 'damascus', 'deraa', 'amman', 'maan', 'medina'),
	// Iberia, Scandinavia
	line('madrid-irun', 1864, 'madrid', 'valladolid', 'burgos', 'irun'),
	line('madrid-barcelona', 1863, 'madrid', 'zaragoza', 'barcelona'),
	line('madrid-seville', 1866, 'madrid', 'cordoba', 'sevilla'),
	line('swedish-west', 1862, 'stockholm', 'gothenburg'),
	line('swedish-south', 1864, 'stockholm', 'linkoping', 'nassjo', 'malmo'),
	line('kristiania-gothenburg', 1879, 'kristiania', 'gothenburg'),
];

// junctions: stations where three or more line arms meet, drawn as dots on the network
const degree = new Map<Station, number>();
for (const l of RAIL1914) l.stations.forEach((st, i) => degree.set(st, (degree.get(st) ?? 0) + (i === 0 || i === l.stations.length - 1 ? 1 : 2)));
export const JUNCTIONS: Station[] = [...degree.entries()].filter(([, d]) => d >= 3).map(([st]) => st);
// big rail capitals that get a small name on the network when nothing else names them
export const RAIL_CAPITALS: Station[] = ['moscow', 'petrograd', 'paris', 'berlin', 'vienna', 'warsaw', 'constantinople', 'rome', 'madrid', 'london', 'budapest', 'kiev'].map((k) => S[k]);

// a route along existing 1914 lines, given as station keys in order (each consecutive pair must be adjacent
// on some line; the route follows the stations of that line between them)
export const route = (...keys: string[]): Station[] => {
	const out: Station[] = [];
	for (let i = 0; i < keys.length - 1; i++) {
		const a = S[keys[i]], b = S[keys[i + 1]];
		let seg: Station[] = [a, b];
		for (const l of RAIL1914) {
			const ia = l.stations.indexOf(a), ib = l.stations.indexOf(b);
			if (ia >= 0 && ib >= 0) {
				seg = ia < ib ? l.stations.slice(ia, ib + 1) : l.stations.slice(ib, ia + 1).reverse();
				break;
			}
		}
		out.push(...(i ? seg.slice(1) : seg));
	}
	return out;
};
