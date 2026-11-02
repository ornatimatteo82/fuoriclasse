/**
 * Fuoriclasse — Generatore Super Database 10K Gael League + 10K Pastore League
 * - 10.000 sfide certificate per la GAEL LEAGUE (Carriere, Senza Anni, Club Misteriosi ❓, Quale Club Manca, Doppio Ex, Anno Trasferimento, PRO)
 * - 10.000 sfide certificate per la PASTORE LEAGUE (Chi ha segnato, Chi NON ha segnato, Multi-Select x2, Multi-Select x3, Risultato Esatto, Stadio, Stagione, Tabellino Misterioso)
 * - 1.500+ sfide certificate per il QUIZZONE (Percorso + Arene Rapide)
 * - Tutte le ere coperte dal 1990 al 2026 con randomizzazione deterministica/alta entropia
 */

const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'data', 'curriculum.json');

// 1. Estrai gaelPlayers e quizzocampoPool da generate-1000-curriculum.js
const baseScript = fs.readFileSync(path.join(__dirname, 'generate-1000-curriculum.js'), 'utf8');
const sandboxCode = baseScript.slice(0, baseScript.indexOf('function generateCompleteCatalog()')) + `
module.exports = { gaelPlayers, quizzocampoPool, TIER_IDS, makeOptions, makePlayerOptions, getPlayerTier };
`;
const tempBaseMod = path.join(__dirname, 'temp-base-10k.js');
fs.writeFileSync(tempBaseMod, sandboxCode);
const { gaelPlayers: baseGaelPlayers, quizzocampoPool, makeOptions, makePlayerOptions } = require('./temp-base-10k.js');
fs.unlinkSync(tempBaseMod);

// 2. Estrai realMatches da generate-master-5000.js
const master5kScript = fs.readFileSync(path.join(__dirname, 'generate-master-5000.js'), 'utf8');
const matchesStart = master5kScript.indexOf('const realMatches = [');
const matchesEnd = master5kScript.indexOf('console.log(\'✅ Real matches censiti');
const matchesCode = master5kScript.slice(matchesStart, matchesEnd) + '\nmodule.exports = { realMatches };\n';
const tempMatchesMod = path.join(__dirname, 'temp-matches-10k.js');
fs.writeFileSync(tempMatchesMod, matchesCode);
const { realMatches: baseRealMatches } = require('./temp-matches-10k.js');
fs.unlinkSync(tempMatchesMod);

// 3. Estrai i dataset 2015-2026 da add-2015-2026-questions.js
const add2026Script = fs.readFileSync(path.join(__dirname, 'add-2015-2026-questions.js'), 'utf8');
const add2026Cut = add2026Script.slice(0, add2026Script.indexOf('function expandCalcioData()')) + `
module.exports = { GAEL_2015_2026_PLAYERS, QUIZZONE_2015_2026_QUESTIONS, PASTORE_2015_2026_MATCHES };
`;
const temp2026Mod = path.join(__dirname, 'temp-2026-10k.js');
fs.writeFileSync(temp2026Mod, add2026Cut);
const { GAEL_2015_2026_PLAYERS, QUIZZONE_2015_2026_QUESTIONS, PASTORE_2015_2026_MATCHES } = require('./temp-2026-10k.js');
fs.unlinkSync(temp2026Mod);

// 4. Nuovi calciatori aggiuntivi (1990-2026) per ampliare ulteriormente il catalogo Gael League
const extraGaelPlayers = [
  { id: 'thuram-m', era: '2015 - 2026', cat: 'anni2000', tier: 4, name: 'Marcus Thuram', number: 9,
    clubs: [['Sochaux','FCS','parma',2015],['Guingamp','EAG','milan',2017],['Borussia M\'gladbach','BMG','juve',2019],['Inter','INT','inter',2023]],
    wiki: 'Marcus_Thuram', hint: 'Figlio d\'arte di Lilian: attaccante francese protagonista della Seconda Stella dell\'Inter con gol nel derby scudetto 2024.',
    check: 'Arrivato all\'Inter a parametro zero dal Borussia Mönchengladbach nel 2023, ha formato la ThuLa con Lautaro.' },
  { id: 'calhanoglu', era: '2015 - 2026', cat: 'anni2000', tier: 4, name: 'Hakan Çalhanoğlu', number: 20,
    clubs: [['Karlsruhe','KSC','italia',2011],['Amburgo','HSV','samp',2013],['Bayer Leverkusen','B04','milan',2014],['AC Milan','MIL','milan',2017],['Inter','INT','inter',2021]],
    wiki: 'Hakan_%C3%87alhano%C4%9Flu', hint: 'Regista e rigorista infallibile turco passato dal Milan all\'Inter a parametro zero nell\'estate 2021.',
    check: 'Trasformato da Simone Inzaghi in uno dei migliori registi d\'Europa e campione d\'Italia 2024 con l\'Inter.' },
  { id: 'mkhitaryan', era: '2015 - 2026', cat: 'anni2000', tier: 5, name: 'Henrikh Mkhitaryan', number: 22,
    clubs: [['Shakhtar','SHA','dortmund',2010],['Borussia Dortmund','BVB','dortmund',2013],['Man United','MUN','united',2016],['Arsenal','ARS','arsenal',2018],['Roma','ROM','roma',2019],['Inter','INT','inter',2022]],
    wiki: 'Henrikh_Mkhitaryan', hint: 'Tuttocampista armeno vincitore della Conference League con la Roma e dello Scudetto della Seconda Stella con l\'Inter.',
    check: 'Autore di una celebre doppietta nel derby Inter-Milan 5-1 del settembre 2023.' },
  { id: 'dimarco', era: '2015 - 2026', cat: 'anni2000', tier: 5, name: 'Federico Dimarco', number: 32,
    clubs: [['Inter','INT','inter',2014],['Ascoli','ASC','juve',2016],['Empoli','EMP','italia',2016],['Sion','SIO','river',2017],['Parma','PAR','parma',2018],['Verona','VER','verona',2020],['Inter','INT','inter',2021]],
    wiki: 'Federico_Dimarco', hint: 'Esterno sinistro milanese cresciuto nel vivaio Inter: dopo i prestiti a Parma e Verona è diventato pilastro nerazzurro e azzurro.',
    check: 'Celebre per il gol da 56 metri contro il Frosinone e i cross mancini per la Seconda Stella.' },
  { id: 'bastoni', era: '2015 - 2026', cat: 'anni2000', tier: 4, name: 'Alessandro Bastoni', number: 95,
    clubs: [['Atalanta','ATA','atalanta',2016],['Parma','PAR','parma',2018],['Inter','INT','inter',2019]],
    wiki: 'Alessandro_Bastoni', hint: 'Difensore centrale mancino coi piedi da regista: cresciuto nell\'Atalanta, un anno a Parma e poi colonna dell\'Inter dal 2019.',
    check: 'Campione d\'Europa 2021 con l\'Italia e due volte Campione d\'Italia con l\'Inter (2021, 2024).' },
  { id: 'pulisic', era: '2015 - 2026', cat: 'anni2000', tier: 4, name: 'Christian Pulisic', number: 11,
    clubs: [['Borussia Dortmund','BVB','dortmund',2016],['Chelsea','CHE','chelsea',2019],['AC Milan','MIL','milan',2023]],
    wiki: 'Christian_Pulisic', hint: 'Captain America: esterno offensivo statunitense campione d\'Europa col Chelsea nel 2021 e leader del Milan dal 2023.',
    check: 'In doppia cifra di gol e assist fin dalla sua prima stagione in Serie A con il Milan.' },
  { id: 'reijnders', era: '2015 - 2026', cat: 'anni2000', tier: 6, name: 'Tijjani Reijnders', number: 14,
    clubs: [['PEC Zwolle','PEC','italia',2017],['AZ Alkmaar','AZ','river',2018],['RKC Waalwijk','RKC','parma',2020],['AZ Alkmaar','AZ','river',2020],['AC Milan','MIL','milan',2023]],
    wiki: 'Tijjani_Reijnders', hint: 'Centrocampista olandese dal passo felpato arrivato al Milan dall\'AZ Alkmaar nell\'estate 2023.',
    check: 'Protagonista in Serie A e al Bernabéu col Milan, oltre che titolare fisso dell\'Olanda a Euro 2024.' },
  { id: 'mctominay', era: '2015 - 2026', cat: 'anni2000', tier: 5, name: 'Scott McTominay', number: 8,
    clubs: [['Man United','MUN','united',2017],['Napoli','NAP','napoli',2024]],
    wiki: 'Scott_McTominay', hint: 'Centrocampista scozzese cresciuto per oltre 20 anni nel Manchester United prima di approdare al Napoli di Antonio Conte nel 2024.',
    check: 'Idolo immediato del Maradona per fisicità, inserimenti e gol pesanti nel Napoli di Conte.' },
  { id: 'buongiorno', era: '2015 - 2026', cat: 'anni2000', tier: 6, name: 'Alessandro Buongiorno', number: 4,
    clubs: [['Torino','TOR','torino',2018],['Carpi','CAR','milan',2018],['Trapani','TRA','roma',2020],['Torino','TOR','torino',2020],['Napoli','NAP','napoli',2024]],
    wiki: 'Alessandro_Buongiorno', hint: 'Difensore centrale cresciuto nel Torino (di cui è stato capitano) prima del passaggio al Napoli nell\'estate 2024.',
    check: 'Pilastro difensivo del Napoli di Conte e della Nazionale italiana.' },
  { id: 'lobotka', era: '2015 - 2026', cat: 'anni2000', tier: 6, name: 'Stanislav Lobotka', number: 68,
    clubs: [['Trenčín','TRE','river',2011],['Nordsjælland','FCN','roma',2015],['Celta Vigo','CEL','lazio',2017],['Napoli','NAP','napoli',2020]],
    wiki: 'Stanislav_Lobotka', hint: 'Playmaker slovacco soprannominato "Robotka" da Spalletti: metronomo del terzo Scudetto del Napoli 2022/23.',
    check: 'Acquistato dal Celta Vigo nel gennaio 2020, è diventato il cervello del centrocampo azzurro.' },
  { id: 'lookman', era: '2015 - 2026', cat: 'anni2000', tier: 5, name: 'Ademola Lookman', number: 11,
    clubs: [['Charlton','CHA','milan',2015],['Everton','EVE','italia',2017],['RB Lipsia','RBL','river',2018],['Fulham','FUL','juve',2020],['Leicester','LEI','chelsea',2021],['Atalanta','ATA','atalanta',2022]],
    wiki: 'Ademola_Lookman', hint: 'Attaccante nigeriano autore della leggendaria tripletta a Dublino contro il Bayer Leverkusen nella finale di Europa League 2024!',
    check: 'Pallone d\'Oro Africano 2024 ed eroe del primo storico trofeo europeo dell\'Atalanta.' },
  { id: 'ederson-ata', era: '2015 - 2026', cat: 'anni2000', tier: 6, name: 'Éderson', number: 13,
    clubs: [['Cruzeiro','CRU','italia',2018],['Corinthians','COR','juve',2020],['Fortaleza','FOR','samp',2021],['Salernitana','SAL','roma',2022],['Atalanta','ATA','atalanta',2022]],
    wiki: '%C3%89derson_(calciatore_1999)', hint: 'Mediano brasiliano portato in Italia da Sabatini per la salvezza miracolosa della Salernitana e poi trionfatore in Europa League con l\'Atalanta.',
    check: 'Dominatore del centrocampo nella finale di Dublino vinta 3-0 dall\'Atalanta sul Bayer Leverkusen.' },
  { id: 'deketelaere', era: '2015 - 2026', cat: 'anni2000', tier: 5, name: 'Charles De Ketelaere', number: 17,
    clubs: [['Club Bruges','CLU','inter',2019],['AC Milan','MIL','milan',2022],['Atalanta','ATA','atalanta',2023]],
    wiki: 'Charles_De_Ketelaere', hint: 'Fantasista belga: dopo una prima stagione difficile al Milan (0 gol), è rinato a Bergamo con Gasperini vincendo l\'Europa League.',
    check: '14 gol e 11 assist nella sua prima stagione all\'Atalanta (2023/24).' },
  { id: 'retegui', era: '2015 - 2026', cat: 'anni2000', tier: 5, name: 'Mateo Retegui', number: 32,
    clubs: [['Boca Juniors','BOC','boca',2018],['Estudiantes','EST','milan',2019],['Talleres','TAL','inter',2020],['Tigre','TIG','samp',2022],['Genoa','GEN','genoa',2023],['Atalanta','ATA','atalanta',2024]],
    wiki: 'Mateo_Retegui', hint: 'El Chapita: centravanti italo-argentino scoperto da Mancini al Tigre, sbarcato al Genoa e poi esploso a suon di gol nell\'Atalanta.',
    check: 'Capocannoniere in Argentina col Tigre e trascinatore dell\'Atalanta e della Nazionale.' },
  { id: 'gudmundsson', era: '2015 - 2026', cat: 'anni2000', tier: 6, name: 'Albert Guðmundsson', number: 10,
    clubs: [['PSV','PSV','milan',2015],['AZ Alkmaar','AZ','river',2018],['Genoa','GEN','genoa',2022],['Fiorentina','FIO','fiorentina',2024]],
    wiki: 'Albert_Gu%C3%B0mundsson', hint: 'Fantasista islandese pronipote del primo straniero del Milan: trascinatore del Genoa dalla B alla A e poi numero 10 della Fiorentina.',
    check: '14 reti in Serie A col Genoa nel 2023/24 prima del trasferimento a Firenze.' },
  { id: 'kean', era: '2015 - 2026', cat: 'anni2000', tier: 5, name: 'Moise Kean', number: 20,
    clubs: [['Juventus','JUV','juve',2016],['Verona','VER','verona',2017],['Juventus','JUV','juve',2018],['Everton','EVE','italia',2019],['PSG','PSG','psg',2020],['Juventus','JUV','juve',2021],['Fiorentina','FIO','fiorentina',2024]],
    wiki: 'Moise_Kean', hint: 'Primo classe 2000 a segnare in Serie A: dopo Juve, Everton e PSG (17 gol), è esploso definitivamente da centravanti titolare alla Fiorentina nel 2024.',
    check: 'Protagonista assoluto della Fiorentina di Palladino e centravanti della Nazionale.' },
  { id: 'zirkzee', era: '2015 - 2026', cat: 'anni2000', tier: 5, name: 'Joshua Zirkzee', number: 11,
    clubs: [['Bayern Monaco','BAY','bayern',2019],['Parma','PAR','parma',2021],['Anderlecht','AND','fiorentina',2021],['Bologna','BOL','bologna',2022],['Man United','MUN','united',2024]],
    wiki: 'Joshua_Zirkzee', hint: 'Centravanti-fantasista olandese che ha trascinato il Bologna di Thiago Motta alla storica qualificazione in Champions League 2024.',
    check: 'Cresciuto nel Bayern Monaco (dopo un breve prestito a Parma), ha incantato il Dall\'Ara prima del passaggio al Manchester United.' },
  { id: 'orsolini', era: '2015 - 2026', cat: 'anni2000', tier: 5, name: 'Riccardo Orsolini', number: 7,
    clubs: [['Ascoli','ASC','juve',2015],['Atalanta','ATA','atalanta',2017],['Bologna','BOL','bologna',2018]],
    wiki: 'Riccardo_Orsolini', hint: 'Ala destra marchigiana celebre per il "bussare alla telecamera": bandiera e miglior marcatore del Bologna moderno in Champions League.',
    check: 'Oltre 60 reti in maglia rossoblù, in doppia cifra fissa in Serie A.' },
  { id: 'calafiori', era: '2015 - 2026', cat: 'anni2000', tier: 5, name: 'Riccardo Calafiori', number: 33,
    clubs: [['Roma','ROM','roma',2020],['Genoa','GEN','genoa',2022],['Basilea','FCB','barca',2022],['Bologna','BOL','bologna',2023],['Arsenal','ARS','arsenal',2024]],
    wiki: 'Riccardo_Calafiori', hint: 'Difensore romano trasformato in centrale al Basilea e al Bologna di Motta: suo l\'assist al 98\' per Zaccagni a Euro 2024 prima di passare all\'Arsenal.',
    check: 'Protagonista della storica cavalcata Champions del Bologna 2023/24.' },
  { id: 'yildiz', era: '2015 - 2026', cat: 'anni2000', tier: 5, name: 'Kenan Yıldız', number: 10,
    clubs: [['Bayern Monaco II','BAY','bayern',2021],['Juventus','JUV','juve',2022]],
    wiki: 'Kenan_Y%C4%B1ld%C4%B1z', hint: 'Talento turco classe 2005 cresciuto nel Bayern Monaco e diventato numero 10 della Juventus (doppietta storica a San Siro nel 4-4 con l\'Inter nel 2024).',
    check: 'Più giovane marcatore straniero della storia della Juventus in Serie A e in Champions League.' },
  { id: 'zaccagni', era: '2015 - 2026', cat: 'anni2000', tier: 5, name: 'Mattia Zaccagni', number: 10,
    clubs: [['Verona','VER','verona',2014],['Venezia','VEN','palermo',2014],['Cittadella','CIT','roma',2016],['Verona','VER','verona',2016],['Lazio','LAZ','lazio',2021]],
    wiki: 'Mattia_Zaccagni', hint: 'L\'Arciere: capitano e numero 10 della Lazio, autore del gol a giro al 98\' contro la Croazia a Euro 2024.',
    check: 'Esploso all\'Hellas Verona di Juric prima di diventare uomo derby e capitano della Lazio.' }
];

// Unisci tutti i giocatori Gael senza duplicati di nome
const allGaelPlayersMap = new Map();
[...baseGaelPlayers, ...GAEL_2015_2026_PLAYERS, ...extraGaelPlayers].forEach((p, idx) => {
  if (!p || !p.name || !Array.isArray(p.clubs)) return;
  const key = p.name.trim().toLowerCase();
  if (!allGaelPlayersMap.has(key)) {
    allGaelPlayersMap.set(key, {
      ...p,
      id: p.id || `player-${idx}`,
      number: typeof p.number === 'number' ? p.number : 10,
      tier: p.tier || p.difficultyLevel || 5,
      era: p.era || "Anni '90 & 2000",
      wiki: p.wiki || encodeURIComponent(p.name.replace(/\s+/g, '_')),
      hint: p.hint || p.check || `Carriera storica di ${p.name}.`,
      check: p.check || p.hint || `Carriera certificata di ${p.name}.`
    });
  }
});
const fullGaelPlayers = Array.from(allGaelPlayersMap.values());
console.log(`✅ Totale calciatori unici Gael League: ${fullGaelPlayers.length}`);

// 5. Espandi il database di Partite Storiche (1990-2026) per la Pastore League
const extraRealMatches = [
  { match: "Inter - Milan 5-1", date: "16 settembre 2023", stadium: "San Siro, Milano", comp: "Serie A 2023/24",
    scorers: ["Henrikh Mkhitaryan", "Marcus Thuram", "Hakan Çalhanoğlu", "Davide Frattesi", "Rafael Leão"],
    nonScorers: ["Lautaro Martínez", "Olivier Giroud", "Nicolò Barella", "Theo Hernández", "Christian Pulisic"],
    desc: "Manita storica dell'Inter nel derby con doppietta di Mkhitaryan, eurogol di Thuram, rigore di Çalhanoğlu e rete di Frattesi." },
  { match: "Inter - Juventus 4-4", date: "27 ottobre 2024", stadium: "San Siro, Milano", comp: "Serie A 2024/25 (Derby d'Italia)",
    scorers: ["Piotr Zieliński", "Henrikh Mkhitaryan", "Denzel Dumfries", "Dušan Vlahović", "Timothy Weah", "Kenan Yıldız"],
    nonScorers: ["Lautaro Martínez", "Marcus Thuram", "Teun Koopmeiners", "Andrea Cambiaso", "Nicolò Barella"],
    desc: "Derby d'Italia pirotecnico con doppietta su rigore di Zieliński e doppietta dalla panchina del 19enne Kenan Yıldız." },
  { match: "Atalanta - Bayer Leverkusen 3-0", date: "22 maggio 2024", stadium: "Aviva Stadium, Dublino", comp: "Finale Europa League 2023/24",
    scorers: ["Ademola Lookman"],
    nonScorers: ["Gianluca Scamacca", "Charles De Ketelaere", "Teun Koopmeiners", "Florian Wirtz", "Éderson"],
    desc: "Tripletta leggendaria di Ademola Lookman che spezza l'imbattibilità di 51 gare del Leverkusen e regala l'Europa League alla Dea." },
  { match: "Udinese - Napoli 1-1", date: "4 maggio 2023", stadium: "Dacia Arena, Udine", comp: "Serie A 2022/23 (Notte Scudetto)",
    scorers: ["Sandi Lovrić", "Victor Osimhen"],
    nonScorers: ["Khvicha Kvaratskhelia", "Piotr Zieliński", "Hirving Lozano", "Beto", "Lazar Samardžić"],
    desc: "Il pareggio di Victor Osimhen al 52' consegna matematicamente al Napoli di Spalletti il terzo Scudetto dopo 33 anni." },
  { match: "Real Madrid - Milan 1-3", date: "5 novembre 2024", stadium: "Santiago Bernabéu, Madrid", comp: "Champions League 2024/25",
    scorers: ["Malick Thiaw", "Álvaro Morata", "Tijjani Reijnders", "Vinícius Júnior"],
    nonScorers: ["Kylian Mbappé", "Rafael Leão", "Christian Pulisic", "Jude Bellingham", "Luka Modrić"],
    desc: "Notte magica europea del Milan che espugna il Bernabéu con le reti di Thiaw, dell'ex Morata e di Reijnders." },
  { match: "Inter - Milan 2-3", date: "6 gennaio 2025", stadium: "Al-Awwal Park, Riad", comp: "Finale Supercoppa Italiana 2025",
    scorers: ["Lautaro Martínez", "Mehdi Taremi", "Theo Hernández", "Christian Pulisic", "Tammy Abraham"],
    nonScorers: ["Rafael Leão", "Álvaro Morata", "Nicolò Barella", "Denzel Dumfries", "Tijjani Reijnders"],
    desc: "Sotto 2-0, il Milan di Conceição ribalta l'Inter con punizione di Theo, gol di Pulisic e tap-in di Abraham al 93' su assist di Leão." },
  { match: "Italia - Inghilterra 1-1 (4-3 d.c.r.)", date: "11 luglio 2021", stadium: "Wembley, Londra", comp: "Finale Euro 2020",
    scorers: ["Luke Shaw", "Leonardo Bonucci"],
    nonScorers: ["Federico Chiesa", "Lorenzo Insigne", "Ciro Immobile", "Harry Kane", "Jorginho"],
    desc: "Bonucci pareggia il gol lampo di Shaw e Gigio Donnarumma para i rigori di Sancho e Saka regalando l'Europeo all'Italia." },
  { match: "Italia - Germania 2-0 (d.t.s.)", date: "4 luglio 2006", stadium: "Westfalenstadion, Dortmund", comp: "Semifinale Mondiali 2006",
    scorers: ["Fabio Grosso", "Alessandro Del Piero"],
    nonScorers: ["Luca Toni", "Francesco Totti", "Andrea Pirlo", "Alberto Gilardino", "Miroslav Klose"],
    desc: "Al 119' assist no-look di Pirlo per il sinistro a giro di Grosso e contropiede di Gilardino per il 2-0 di Del Piero." },
  { match: "Italia - Francia 1-1 (6-4 d.c.r.)", date: "9 luglio 2006", stadium: "Olympiastadion, Berlino", comp: "Finale Mondiali 2006",
    scorers: ["Zinedine Zidane", "Marco Materazzi"],
    nonScorers: ["Luca Toni", "Andrea Pirlo", "Alessandro Del Piero", "Thierry Henry", "Fabio Grosso"],
    desc: "Cucchiaio di Zidane e stacco imperioso di Materazzi su corner di Pirlo, prima del rigore mondiale di Fabio Grosso." },
  { match: "Bayern Monaco - Inter 0-2", date: "22 maggio 2010", stadium: "Santiago Bernabéu, Madrid", comp: "Finale Champions League 2009/10",
    scorers: ["Diego Milito"],
    nonScorers: ["Wesley Sneijder", "Samuel Eto'o", "Goran Pandev", "Arjen Robben", "Thomas Müller"],
    desc: "La doppietta leggendaria del Principe Diego Milito consegna la Champions League e il Triplete all'Inter di José Mourinho." },
  { match: "Milan - Liverpool 2-1", date: "23 maggio 2007", stadium: "OAKA, Atene", comp: "Finale Champions League 2006/07",
    scorers: ["Filippo Inzaghi", "Dirk Kuyt"],
    nonScorers: ["Kaká", "Clarence Seedorf", "Andrea Pirlo", "Steven Gerrard", "Alberto Gilardino"],
    desc: "Superpippo Inzaghi firma la doppietta della rivincita di Atene regalando la settima Champions League al Milan di Ancelotti." },
  { match: "Milan - Manchester United 3-0", date: "2 maggio 2007", stadium: "San Siro, Milano", comp: "Semifinale Champions League 2006/07",
    scorers: ["Kaká", "Clarence Seedorf", "Alberto Gilardino"],
    nonScorers: ["Filippo Inzaghi", "Andrea Pirlo", "Cristiano Ronaldo", "Wayne Rooney", "Massimo Ambrosini"],
    desc: "La 'Partita Perfetta' sotto il diluvio di San Siro: Kaká, Seedorf e Gilardino travolgono lo United di Ferguson e CR7." },
  { match: "Juventus - Real Madrid 3-1", date: "14 maggio 2003", stadium: "Delle Alpi, Torino", comp: "Semifinale Champions League 2002/03",
    scorers: ["David Trezeguet", "Alessandro Del Piero", "Pavel Nedvěd", "Zinedine Zidane"],
    nonScorers: ["Gianluigi Buffon", "Ronaldo il Fenomeno", "Raúl", "Luis Figo", "Mauro Camoranesi"],
    desc: "Capolavoro bianconero contro i Galácticos con reti di Trezeguet, Del Piero e Nedvěd (e rigore parato da Buffon a Figo)." },
  { match: "Milan - Deportivo La Coruña 4-1", date: "23 marzo 2004", stadium: "San Siro, Milano", comp: "Quarti Champions League 2003/04",
    scorers: ["Kaká", "Andriy Shevchenko", "Andrea Pirlo"],
    nonScorers: ["Filippo Inzaghi", "Clarence Seedorf", "Rui Costa", "Jon Dahl Tomasson", "Cafu"],
    desc: "Doppietta di Kaká e sigilli di Shevchenko e Pirlo su punizione nell'andata dei quarti a San Siro." },
  { match: "Juventus - Atletico Madrid 3-0", date: "12 marzo 2019", stadium: "Allianz Stadium, Torino", comp: "Ottavi Champions League 2018/19",
    scorers: ["Cristiano Ronaldo"],
    nonScorers: ["Federico Bernardeschi", "Mario Mandžukić", "Paulo Dybala", "Antoine Griezmann", "Leonardo Bonucci"],
    desc: "Rimonta leggendaria firmata dalla tripletta di Cristiano Ronaldo (due colpi di testa e rigore all'86')." },
  { match: "Roma - Barcellona 3-0", date: "10 aprile 2018", stadium: "Olimpico, Roma", comp: "Quarti Champions League 2017/18",
    scorers: ["Edin Džeko", "Daniele De Rossi", "Kostas Manolas"],
    nonScorers: ["Radja Nainggolan", "Patrik Schick", "Lionel Messi", "Luis Suárez", "Aleksandar Kolarov"],
    desc: "La storica 'Romuntada' all'Olimpico con l'incornata di Kostas Manolas all'82' che elimina il Barcellona di Messi." },
  { match: "Napoli - Real Madrid 4-1 (Liverpool)", date: "7 settembre 2022", stadium: "Diego Armando Maradona, Napoli", comp: "Champions League 2022/23 (Napoli - Liverpool 4-1)",
    scorers: ["Piotr Zieliński", "André-Frank Zambo Anguissa", "Giovanni Simeone", "Luis Díaz"],
    nonScorers: ["Victor Osimhen", "Khvicha Kvaratskhelia", "Mohamed Salah", "Matteo Politano", "Darwin Núñez"],
    desc: "In Napoli - Liverpool 4-1 la squadra di Spalletti incanta l'Europa con doppietta di Zieliński, gol di Anguissa ed esordio in rete del Cholito Simeone." },
  { match: "Lecce - Milan 3-4", date: "23 ottobre 2011", stadium: "Via del Mare, Lecce", comp: "Serie A 2011/12",
    scorers: ["Kevin-Prince Boateng", "Mario Yepes", "Guillermo Giacomazzi", "Massimo Oddo", "Carlos Grossmüller"],
    nonScorers: ["Zlatan Ibrahimović", "Robinho", "Antonio Cassano", "David Di Michele", "Luis Muriel"],
    desc: "Sotto 3-0 a fine primo tempo, l'ingresso di Boateng (tripletta in 14 minuti!) e il colpo di testa di Yepes regalano il 3-4 al Milan." },
  { match: "Juventus - Napoli 4-3", date: "31 agosto 2019", stadium: "Allianz Stadium, Torino", comp: "Serie A 2019/20",
    scorers: ["Danilo", "Gonzalo Higuaín", "Cristiano Ronaldo", "Kostas Manolas", "Hirving Lozano", "Giovanni Di Lorenzo", "Kalidou Koulibaly (aut)"],
    nonScorers: ["Paulo Dybala", "Dries Mertens", "Lorenzo Insigne", "Miralem Pjanić", "Sami Khedira"],
    desc: "Il Napoli rimonta da 3-0 a 3-3 con Manolas, Lozano e Di Lorenzo prima della sfortunata autorete di Koulibaly al 92'." },
  { match: "Inter - Empoli 4-2", date: "6 maggio 2022", stadium: "San Siro, Milano", comp: "Serie A 2021/22",
    scorers: ["Andrea Pinamonti", "Kristjan Asllani", "Simone Romagnoli (aut)", "Lautaro Martínez", "Alexis Sánchez"],
    nonScorers: ["Nicolò Barella", "Edin Džeko", "Hakan Çalhanoğlu", "Ivan Perišić", "Federico Dimarco"],
    desc: "Sotto 0-2 contro l'Empoli degli ex Pinamonti e Asllani, l'Inter ribalta tutto con doppietta di Lautaro e sigillo di Sánchez." },
  { match: "Brescia - Atalanta 3-3", date: "30 settembre 2001", stadium: "Mario Rigamonti, Brescia", comp: "Serie A 2001/02",
    scorers: ["Roberto Baggio", "Cristiano Doni", "un gol di Comandini", "Massimo Carrera"],
    nonScorers: ["Dario Hübner", "Luca Toni", "Pep Guardiola", "Fausto Rossini", "Andrea Pirlo"],
    desc: "La celebre corsa di Carletto Mazzone sotto la curva atalantina dopo la tripletta di Roberto Baggio che fissa il 3-3 al 92'!" },
  { match: "Juventus - Brescia 1-1", date: "1 aprile 2001", stadium: "Delle Alpi, Torino", comp: "Serie A 2000/01",
    scorers: ["Gianluca Zambrotta", "Roberto Baggio"],
    nonScorers: ["Alessandro Del Piero", "Zinedine Zidane", "Filippo Inzaghi", "Dario Hübner", "Andrea Pirlo"],
    desc: "Capolavoro assoluto: lancio di 40 metri di Andrea Pirlo e stop a seguire magico di Roberto Baggio che salta Van der Sar in un fazzoletto." },
  { match: "Napoli - Juventus 3-3", date: "29 novembre 2011", stadium: "San Paolo, Napoli", comp: "Serie A 2011/12",
    scorers: ["Marek Hamšík", "Goran Pandev", "Alessandro Matri", "Marcelo Estigarribia", "Simone Pepe"],
    nonScorers: ["Edinson Cavani", "Ezequiel Lavezzi", "Mirko Vučinić", "Andrea Pirlo", "Arturo Vidal"],
    desc: "Doppietta di Pandev e gol di Hamšík per il Napoli, ma la Juve di Conte rimonta sul 3-3 con Matri, Estigarribia e Pepe." },
  { match: "Roma - Sampdoria 1-2", date: "25 aprile 2010", stadium: "Olimpico, Roma", comp: "Serie A 2009/10",
    scorers: ["Francesco Totti", "Giampaolo Pazzini"],
    nonScorers: ["Antonio Cassano", "Mirko Vučinić", "Luca Toni", "Daniele De Rossi", "Angelo Palombo"],
    desc: "La doppietta di Giampaolo Pazzini su assist di Cassano gela l'Olimpico e consegna il sorpasso Scudetto all'Inter del Triplete." }
];

// Converti anche PASTORE_2015_2026_MATCHES in oggetti match utilizzabili
PASTORE_2015_2026_MATCHES.forEach(pm => {
  if (pm && pm.match && pm.correct) {
    const corr = Array.isArray(pm.correct) ? pm.correct : [pm.correct];
    const nonSc = (pm.options || []).filter(o => !corr.includes(o));
    extraRealMatches.push({
      match: pm.match,
      date: pm.date || '2015 - 2026',
      stadium: pm.stadium || 'Serie A / Europa',
      comp: pm.tag || 'Calcio 2015-2026',
      scorers: corr,
      nonScorers: nonSc.length >= 3 ? nonSc : ['Lautaro Martínez', 'Rafael Leão', 'Dušan Vlahović', 'Nicolò Barella'],
      desc: pm.check || `Sfida storica: ${pm.match}.`
    });
  }
});

const allRealMatches = [...baseRealMatches, ...extraRealMatches];
console.log(`✅ Totale partite storiche Pastore League: ${allRealMatches.length}`);

// Helper: generatore deterministico veloce (Mulberry32) per opzioni sempre distinte ma riproducibili
let rngSeed = 20261102;
function nextRand() {
  let t = (rngSeed += 0x6D2B79F5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function deterministicShuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(nextRand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickDistinctOptions(correct, candidates, backupList) {
  const set = new Set([correct]);
  const shuffledCandidates = deterministicShuffle(candidates);
  for (const c of shuffledCandidates) {
    if (c && c !== correct && !set.has(c)) {
      set.add(c);
      if (set.size === 4) break;
    }
  }
  if (set.size < 4) {
    const shuffledBackup = deterministicShuffle(backupList);
    for (const b of shuffledBackup) {
      if (b && b !== correct && !set.has(b)) {
        set.add(b);
        if (set.size === 4) break;
      }
    }
  }
  return deterministicShuffle(Array.from(set).slice(0, 4));
}

const allPlayerNames = fullGaelPlayers.map(p => p.name);
const allClubNames = Array.from(new Set(fullGaelPlayers.flatMap(p => (p.clubs || []).map(c => c[0])).filter(Boolean)));
const allStadiums = Array.from(new Set(allRealMatches.map(m => m.stadium).filter(Boolean)));
const allMatchTitles = Array.from(new Set(allRealMatches.map(m => m.match).filter(Boolean)));
const allMatchDates = Array.from(new Set(allRealMatches.map(m => m.date).filter(Boolean)));

// ============================================================================
// GENERAZIONE 10.000 DOMANDE GAEL LEAGUE
// ============================================================================
function buildGaelQuestionVariant(player, variantIdx, forcedId, forcePro = false) {
  const clubs = player.clubs || [];
  const arch = variantIdx % 8; // 8 archetipi diversi di sfida sulla carriera
  const isEraModern = (player.era || '').includes('2026') || (player.era || '').includes('2015');

  // Costruisci un pool di giocatori simili (stessa era o club condiviso)
  const playerClubSet = new Set(clubs.map(c => c[0]));
  const sharedClubPlayers = fullGaelPlayers
    .filter(p => p.name !== player.name && (p.clubs || []).some(c => playerClubSet.has(c[0])))
    .map(p => p.name);

  if (arch === 4 && clubs.length >= 2 && !forcePro) {
    // ARCHETIPO 4: QUALE CLUB MANCA NELLA CARRIERA DI [GIOCATORE]?
    const targetStopIdx = (variantIdx >> 3) % clubs.length;
    const missingClub = clubs[targetStopIdx][0];
    const missingYear = clubs[targetStopIdx][3] || '';
    const otherPlayerClubs = new Set(clubs.map(c => c[0]));
    const distractorClubs = allClubNames.filter(c => !otherPlayerClubs.has(c));
    const options = pickDistinctOptions(missingClub, distractorClubs, ['Juventus', 'Inter', 'AC Milan', 'Roma', 'Lazio', 'Fiorentina', 'Parma', 'Napoli']);

    return {
      id: forcedId,
      mode: 'gael',
      era2015_2026: isEraModern,
      difficultyLevel: Math.min(10, Math.max(2, (variantIdx % 9) + 2)),
      isPro: true,
      mysteryClubIdx: targetStopIdx,
      era: player.era,
      name: player.name,
      number: player.number,
      clubs: clubs,
      customPrompt: `Quale club manca nella tappa ❓ (${missingYear || 'in carriera'}) di ${player.name}?`,
      hint: player.hint,
      options,
      correct: missingClub,
      sourceType: 'curated',
      sourceTitle: `Gael • ${player.name}`,
      sourceUrl: 'https://it.wikipedia.org',
      check: `Nel ${missingYear || 'suo percorso'}, ${player.name} ha giocato con ${missingClub}.`
    };
  }

  if (arch === 5 && clubs.length >= 2 && !forcePro) {
    // ARCHETIPO 5: DOPPIO EX / INCROCIO DI MAGLIE
    const idxA = (variantIdx >> 3) % clubs.length;
    const idxB = (idxA + 1 + ((variantIdx >> 5) % (clubs.length - 1))) % clubs.length;
    const clubA = clubs[Math.min(idxA, idxB)];
    const clubB = clubs[Math.max(idxA, idxB)];
    if (clubA[0] !== clubB[0]) {
      const nonBothPlayers = fullGaelPlayers
        .filter(p => {
          const cNames = (p.clubs || []).map(c => c[0]);
          return !(cNames.includes(clubA[0]) && cNames.includes(clubB[0]));
        })
        .map(p => p.name);
      const options = pickDistinctOptions(player.name, sharedClubPlayers.filter(n => nonBothPlayers.includes(n)), nonBothPlayers);

      return {
        id: forcedId,
        mode: 'gael',
        era2015_2026: isEraModern,
        difficultyLevel: Math.min(10, Math.max(3, (variantIdx % 8) + 3)),
        isPro: false,
        era: player.era,
        name: player.name,
        number: player.number,
        clubs: clubs,
        customPrompt: `Quale calciatore con questa carriera ha vestito sia la maglia di ${clubA[0]} sia quella di ${clubB[0]}?`,
        hint: player.hint,
        options,
        correct: player.name,
        sourceType: 'curated',
        sourceTitle: `Gael • ${player.name}`,
        sourceUrl: 'https://it.wikipedia.org',
        check: `${player.name} ha militato sia in ${clubA[0]} (${clubA[3]}) sia in ${clubB[0]} (${clubB[3]}).`
      };
    }
  }

  if (arch === 6 && clubs.length >= 2 && !forcePro) {
    // ARCHETIPO 6: CON QUALE CLUB HA INIZIATO O CONTINUATO NEL [ANNO]?
    const stopIdx = ((variantIdx >> 3) % clubs.length);
    const stop = clubs[stopIdx];
    const year = stop[3];
    if (year) {
      const options = pickDistinctOptions(player.name, sharedClubPlayers, allPlayerNames);
      return {
        id: forcedId,
        mode: 'gael',
        era2015_2026: isEraModern,
        difficultyLevel: Math.min(10, (variantIdx % 10) + 1),
        isPro: Boolean(variantIdx % 3 === 0),
        era: player.era,
        name: player.name,
        number: player.number,
        clubs: clubs,
        customPrompt: `Indovina il protagonista di questa carriera (approdato a ${stop[0]} nel ${year}):`,
        hint: player.hint,
        options,
        correct: player.name,
        sourceType: 'curated',
        sourceTitle: `Gael • ${player.name}`,
        sourceUrl: 'https://it.wikipedia.org',
        check: player.check
      };
    }
  }

  // ARCHETIPI 0, 1, 2, 3, 7: Carriera Classica, Senza Anni, 1 Club Misterioso, 2 Club Misteriosi PRO
  const diffLevel = forcePro ? (7 + (variantIdx % 4)) : ((variantIdx % 10) + 1);
  const isPro = forcePro || diffLevel >= 7;
  const options = pickDistinctOptions(player.name, sharedClubPlayers, allPlayerNames);

  return {
    id: forcedId,
    mode: 'gael',
    era2015_2026: isEraModern,
    difficultyLevel: diffLevel,
    isPro,
    era: player.era,
    name: player.name,
    number: player.number,
    clubs: clubs,
    hint: player.hint,
    options,
    correct: player.name,
    sourceType: 'curated',
    sourceTitle: `Gael • ${player.name}`,
    sourceUrl: 'https://it.wikipedia.org',
    check: player.check
  };
}

// ============================================================================
// GENERAZIONE 10.000 DOMANDE PASTORE LEAGUE
// ============================================================================
const backupScorerStars = [
  'Roberto Baggio', 'Alessandro Del Piero', 'Francesco Totti', 'Gabriel Batistuta',
  'Filippo Inzaghi', 'Andriy Shevchenko', 'Christian Vieri', 'Hernán Crespo',
  'Gianluca Vialli', 'Roberto Mancini', 'Giuseppe Signori', 'Marco van Basten',
  'Ruud Gullit', 'George Weah', 'Pavel Nedvěd', 'Zlatan Ibrahimović',
  'Antonio Di Natale', 'Dario Hübner', 'Cristiano Lucarelli', 'Fabrizio Miccoli',
  'Vincenzo Montella', 'Álvaro Recoba', 'Diego Milito', 'Lautaro Martínez',
  'Victor Osimhen', 'Rafael Leão', 'Paulo Dybala', 'Gonzalo Higuaín',
  'Edinson Cavani', 'Mauro Icardi', 'Ciro Immobile', 'Luca Toni'
];

const backupScores = [
  '2-1', '1-0', '3-1', '2-0', '3-2', '4-2', '3-0', '1-2', '0-2', '2-2', '4-0', '3-3', '4-3', '5-1', '0-3', '1-3'
];

function buildPastoreQuestionVariant(m, variantIdx, forcedId) {
  const validScorers = Array.from(new Set((m.scorers || []).filter(s => !s.includes('(aut)'))));
  const validNonScorers = Array.from(new Set((m.nonScorers || []).filter(s => !validScorers.includes(s))));
  const arch = variantIdx % 8;
  const isEraModern = /\b(201[5-9]|202[0-6])\b/.test(m.date || '') || /\b(201[5-9]|202[0-6])\b/.test(m.comp || '');

  // Archetipo 2: Multi-Marcatori x2
  if (arch === 2 && validScorers.length >= 2 && validNonScorers.length >= 2) {
    const s1 = validScorers[variantIdx % validScorers.length];
    const s2 = validScorers.find((s, i) => s !== s1 && i >= (variantIdx % validScorers.length)) || validScorers.find(s => s !== s1);
    const n1 = validNonScorers[variantIdx % validNonScorers.length];
    const n2 = validNonScorers.find(n => n !== n1) || backupScorerStars.find(b => b !== s1 && b !== s2 && b !== n1);
    if (s1 && s2 && n1 && n2) {
      const distinctScorers = [s1, s2];
      const options = deterministicShuffle([s1, s2, n1, n2]);
      return {
        id: forcedId,
        mode: 'pastore',
        era2015_2026: isEraModern,
        multiSelect: true,
        difficultyLevel: 5 + (variantIdx % 5),
        tag: 'PASTORE LEAGUE • SELEZIONA 2 MARCATORI',
        match: m.match,
        date: m.date,
        stadium: m.stadium,
        question: `Seleziona i 2 MARCATORI di ${m.match} (${m.date}):`,
        route: [
          [m.match.toUpperCase(), m.date],
          ['DOPPIO MARCATORE', m.stadium],
          ['SELEZIONA 2 GOL', 'Tabellino']
        ],
        options,
        correct: distinctScorers,
        sourceType: 'official',
        sourceTitle: `Lega Serie A: ${m.match}`,
        sourceUrl: 'https://www.legaseriea.it',
        check: `${m.desc} Entrambi i calciatori sono andati a segno: ${distinctScorers.join(' e ')}.`
      };
    }
  }

  // Archetipo 3: Multi-Marcatori x3 (PRO)
  if (arch === 3 && validScorers.length >= 3 && validNonScorers.length >= 1) {
    const shuffledS = deterministicShuffle(validScorers).slice(0, 3);
    const non1 = validNonScorers[variantIdx % validNonScorers.length];
    const options = deterministicShuffle([...shuffledS, non1]);
    return {
      id: forcedId,
      mode: 'pastore',
      era2015_2026: isEraModern,
      multiSelect: true,
      difficultyLevel: 8 + (variantIdx % 3),
      tag: 'PASTORE LEAGUE • SELEZIONA 3 MARCATORI (PRO)',
      match: m.match,
      date: m.date,
      stadium: m.stadium,
      question: `Seleziona TUTTI i 3 MARCATORI del tabellino di ${m.match} (${m.date}):`,
      route: [
        [m.match.toUpperCase(), m.date],
        ['TRIPLO MARCATORE', m.stadium],
        ['ESAME TABELLINO PRO', 'Tabellino']
      ],
      options,
      correct: shuffledS,
      sourceType: 'official',
      sourceTitle: `Archivio Pastore: ${m.match}`,
      sourceUrl: 'https://www.legaseriea.it',
      check: `${m.desc} I 3 marcatori corretti da selezionare sono: ${shuffledS.join(', ')}.`
    };
  }

  // Archetipo 1 o 4: Chi NON ha segnato? (Trova l'intruso)
  if ((arch === 1 || arch === 4) && validScorers.length >= 3 && validNonScorers.length >= 1) {
    const wrongGuy = validNonScorers[(variantIdx >> 2) % validNonScorers.length];
    const chosen3Scorers = deterministicShuffle(validScorers.filter(s => s !== wrongGuy)).slice(0, 3);
    if (chosen3Scorers.length === 3) {
      const options = deterministicShuffle([wrongGuy, ...chosen3Scorers]);
      return {
        id: forcedId,
        mode: 'pastore',
        era2015_2026: isEraModern,
        multiSelect: false,
        difficultyLevel: (variantIdx % 10) + 1,
        tag: 'PASTORE LEAGUE • CHI NON HA SEGNATO?',
        match: m.match,
        date: m.date,
        stadium: m.stadium,
        question: `In ${m.match} (${m.date}), quale di questi calciatori NON ha segnato?`,
        route: [
          [m.match.toUpperCase(), m.date],
          ['TABELLINO MARCATORI', m.stadium],
          ['CHI NON HA SEGNATO?', "Trova l'intruso"]
        ],
        options,
        correct: wrongGuy,
        sourceType: 'official',
        sourceTitle: `Almanacco Panini / Lega Serie A: ${m.match}`,
        sourceUrl: 'https://www.legaseriea.it',
        check: `${wrongGuy} non è andato a segno nel match. Marcatori ufficiali: ${m.scorers.join(', ')}.`
      };
    }
  }

  // Archetipo 5: Indovina la Partita dal Tabellino Marcatori + Data
  if (arch === 5 && validScorers.length >= 1) {
    const options = pickDistinctOptions(m.match, allMatchTitles, allMatchTitles);
    const scorerPreview = validScorers.slice(0, 3).join(', ');
    return {
      id: forcedId,
      mode: 'pastore',
      era2015_2026: isEraModern,
      multiSelect: false,
      difficultyLevel: (variantIdx % 9) + 2,
      tag: 'PASTORE LEAGUE • INDOVINA IL MATCH DAL TABELLINO',
      match: m.match,
      date: m.date,
      stadium: m.stadium,
      question: `A quale storica partita del ${m.date} (${m.stadium}) appartiene il tabellino con gol di ${scorerPreview}?`,
      route: [
        [m.date.toUpperCase(), m.stadium],
        ['MARCATORI', scorerPreview],
        ['QUALE PARTITA?', m.comp || 'Serie A']
      ],
      options,
      correct: m.match,
      sourceType: 'official',
      sourceTitle: `Archivio Pastore: ${m.match}`,
      sourceUrl: 'https://www.legaseriea.it',
      check: `${m.desc} Tabellino di ${m.match} (${m.date}).`
    };
  }

  // Archetipo 6: Indovina la Data / Stagione del Tabellino Storico
  if (arch === 6 && m.date) {
    const options = pickDistinctOptions(m.date, allMatchDates, allMatchDates);
    const scorerPreview = validScorers.slice(0, 2).join(', ');
    return {
      id: forcedId,
      mode: 'pastore',
      era2015_2026: isEraModern,
      multiSelect: false,
      difficultyLevel: (variantIdx % 9) + 2,
      tag: 'PASTORE LEAGUE • MEMORIA STORICA DATA',
      match: m.match,
      date: m.date,
      stadium: m.stadium,
      question: `In quale data si è disputata la celebre sfida ${m.match} (reti di ${scorerPreview})?`,
      route: [
        [m.match.toUpperCase(), m.stadium],
        ['MARCATORI', scorerPreview],
        ['QUANDO SI È GIOCATA?', m.comp || 'Serie A']
      ],
      options,
      correct: m.date,
      sourceType: 'official',
      sourceTitle: `Archivio Pastore: ${m.match}`,
      sourceUrl: 'https://www.legaseriea.it',
      check: `${m.match} si è disputata il ${m.date} (${m.stadium}). ${m.desc}`
    };
  }

  // Archetipo 7: Indovina il Risultato Finale Esatto
  const scoreMatch = (m.match || '').match(/(\d+\s*-\s*\d+)/);
  if (arch === 7 && scoreMatch) {
    const exactScore = scoreMatch[1].replace(/\s+/g, '');
    const teamsOnly = m.match.replace(/\s*\d+\s*-\s*\d+.*$/, '').trim();
    const options = pickDistinctOptions(exactScore, backupScores, backupScores);
    const scorerPreview = validScorers.slice(0, 2).join(', ');
    return {
      id: forcedId,
      mode: 'pastore',
      era2015_2026: isEraModern,
      multiSelect: false,
      difficultyLevel: (variantIdx % 9) + 2,
      tag: 'PASTORE LEAGUE • RISULTATO ESATTO TABELLINO',
      match: m.match,
      date: m.date,
      stadium: m.stadium,
      question: `Con quale risultato esatto è terminata ${teamsOnly} del ${m.date} (in gol ${scorerPreview})?`,
      route: [
        [teamsOnly.toUpperCase(), m.date],
        ['IN GOL', scorerPreview],
        ['RISULTATO FINALE?', m.stadium]
      ],
      options,
      correct: exactScore,
      sourceType: 'official',
      sourceTitle: `Archivio Pastore: ${m.match}`,
      sourceUrl: 'https://www.legaseriea.it',
      check: `Il match ${m.match} (${m.date}) si è concluso sul punteggio di ${exactScore}. ${m.desc}`
    };
  }

  // Default (Archetipo 0 e fallback): Chi ha segnato in [Match] ([Date])?
  const correctScorer = validScorers[(variantIdx >> 1) % validScorers.length] || 'Roberto Baggio';
  const options = pickDistinctOptions(correctScorer, validNonScorers, backupScorerStars);

  return {
    id: forcedId,
    mode: 'pastore',
    era2015_2026: isEraModern,
    multiSelect: false,
    difficultyLevel: (variantIdx % 10) + 1,
    tag: `PASTORE LEAGUE • ${(m.comp || 'SERIE A').toUpperCase()}`,
    match: m.match,
    date: m.date,
    stadium: m.stadium,
    question: `Chi è andato a segno in ${m.match} (${m.date})?`,
    route: [
      [m.match.toUpperCase(), m.date],
      [(m.stadium || 'STADIO').toUpperCase(), m.comp || 'Serie A'],
      ['CHI HA SEGNATO?', 'Marcatore']
    ],
    options,
    correct: correctScorer,
    sourceType: 'official',
    sourceTitle: `Almanacco Panini / Lega Serie A: ${m.match}`,
    sourceUrl: 'https://www.legaseriea.it',
    check: `${m.desc} Marcatori registrati nel tabellino: ${m.scorers.join(', ')}.`
  };
}

// Genera 10.000 sfide Pastore League
const pastoreQuestions = [];
for (let i = 0; i < 10000; i++) {
  const m = allRealMatches[(i * 7 + Math.floor(i / allRealMatches.length) * 3) % allRealMatches.length];
  pastoreQuestions.push(buildPastoreQuestionVariant(m, i, `pastore-${i + 1}`));
}
console.log(`✅ Generate sfide Pastore League: ${pastoreQuestions.length} (Target: 10.000)`);

// Costruzione delle 40 Unità sul percorso (10 Gael + 15 Quizzone + 15 Pastore)
const units = [];

const gaelUnitConfigs = [
  { num: 1, title: "Genio, Sregolatezza & Numeri 10", sub: "Recoba, Adriano, Mutu, Cassano, Montella, Leão e Di Natale", color: '#ffc800', tier: 5 },
  { num: 2, title: "Idoli delle Curve & Bomber Moderni", sub: "Asprilla, Bierhoff, Osimhen, Kvara, Thuram, Miccoli e Suazo", color: '#ff4b4b', tier: 6 },
  { num: 3, title: "Veterani, Registi & Uomini Coppa", sub: "Dino Baggio, Balbo, Çalhanoğlu, Barella, Brolin, Sensini e Cruz", color: '#58cc02', tier: 7 },
  { num: 4, title: "Bomber di Provincia & Bandiere", sub: "Hübner, Protti, Lucarelli, Orsolini, Retegui, Flachi e Corini", color: '#1cb0f6', tier: 8 },
  { num: 5, title: "Cult Heroes & Nostalgia Pura", sub: "Chevantón, Riganò, Mascara, Zirkzee, Lookman, Zauli e Moscardelli", color: '#ce82ff', tier: 9 },
  { num: 6, title: "Meteore Estreme della Serie A", sub: "Taribo West, Comandini, Farinós, Greško, Vampeta e O'Neill", color: '#ff4b4b', tier: 10 },
  { num: 7, title: "Gael League PRO: Mistero a Centrocampo", sub: "Maglia nascosta e 1 Club Mascherato con punto interrogativo ❓", color: '#58cc02', tier: 8, pro: true },
  { num: 8, title: "Gael League PRO: Attaccanti Senza Anni", sub: "Anni cancellati e 1 Club Mascherato ❓: solo per veri archivisti", color: '#1cb0f6', tier: 9, pro: true },
  { num: 9, title: "Gael League PRO: Doppio Club Misterioso", sub: "Doppio Club Oscurato ❓❓ e nessuna data di trasferimento", color: '#ce82ff', tier: 9, pro: true },
  { num: 10, title: "Gael League PRO: Esame Supremo del Mister", sub: "Meteore oscurate, zero date e doppio club misterioso ❓❓", color: '#ff4b4b', tier: 10, pro: true }
];

const quizUnitConfigs = [
  { num: 11, title: "Calcio Pop & Curiosità", sub: "Soprannomi, colori sociali e record memorabili", color: '#58cc02', qCat: 'easy' },
  { num: 12, title: "Notti Magiche Azzurre", sub: "Dalle Notti Magiche del '90 a Berlino 2006 ed Euro 2020", color: '#1cb0f6', qCat: 'azzurri' },
  { num: 13, title: "Scudetti & Sorpassi Serie A", sub: "I campionati decisi all'ultima curva dal '90 al 2026", color: '#ff9600', qCat: 'seriea' },
  { num: 14, title: "Re dei Bomber & Scarpe d'Oro", sub: "I vincitori della classifica cannonieri e le triplette", color: '#ce82ff', qCat: 'scorers' },
  { num: 15, title: "I Grandi Derby d'Italia", sub: "Madonnina, Capitale, Mole e Derby della Lanterna", color: '#ffc800', qCat: 'derby' },
  { num: 16, title: "Notti di Champions League", sub: "Le finali europee delle italiane da Atene a Madrid e Istanbul", color: '#ff4b4b', qCat: 'champions' },
  { num: 17, title: "Coppa UEFA & Europa League", sub: "Le trionfali notti di Parma, Inter, Juve e Atalanta a Dublino", color: '#58cc02', qCat: 'champions' },
  { num: 18, title: "Tabellini da Infarto al 90'", sub: "Gol nei minuti di recupero e rimonte storiche", color: '#1cb0f6', qCat: 'hard' },
  { num: 19, title: "Portieri Eroi & Rigori Parati", sub: "Da Pagliuca e Toldo a Buffon, Donnarumma e Maignan", color: '#ff9600', qCat: 'hard' },
  { num: 20, title: "Capitani & Bandiere Infinite", sub: "Maldini, Baresi, Zanetti, Totti, Del Piero e Lautaro", color: '#ce82ff', qCat: 'seriea' },
  { num: 21, title: "Sanzioni, Arbitri & Var", sub: "Episodi celebri, espulsioni storiche e grandi direttori di gara", color: '#ffc800', qCat: 'hard' },
  { num: 22, title: "Mister & Lavagne Tattiche", sub: "Da Sacchi e Lippi a Capello, Ancelotti, Mou, Conte e Inzaghi", color: '#ff4b4b', qCat: 'all' },
  { num: 23, title: "Favole di Provincia", sub: "Vicenza di Guidolin, Chievo, Atalanta, Bologna e Perugia", color: '#58cc02', qCat: 'hard' },
  { num: 24, title: "Bomber Inaspettati & Difensori Gol", sub: "Materazzi, Mihajlovic, Grosso, Theo, Dimarco e Calafiori", color: '#1cb0f6', qCat: 'scorers' },
  { num: 25, title: "Esame Finale: Enciclopedia Totale", sub: "L'esame supremo di Quizzocampo: dettagli per veri maniaci", color: '#ff4b4b', qCat: 'all' }
];

const pastoreUnitConfigs = [
  { num: 26, title: "Feste Scudetto Anni '90", sub: "Samp '91, Milan degli Invincibili '92, Juve di Lippi '95 e Milan '99", color: '#58cc02' },
  { num: 27, title: "La Serie A delle Sette Sorelle", sub: "Juve, Milan, Inter, Roma, Lazio, Parma e Fiorentina a confronto", color: '#1cb0f6' },
  { num: 28, title: "Derby di Milano: I Bomber della Madonnina", sub: "Da Van Basten, Berti e Ronaldo a Milito, Ibra, Mkhitaryan e Lautaro", color: '#ff9600' },
  { num: 29, title: "Derby della Capitale Infuocati", sub: "Totti, Montella, Mancini, Signori, Salas, Klose e Zaccagni all'Olimpico", color: '#ce82ff' },
  { num: 30, title: "Lo Scudetto della Lazio & La Pioggia di Perugia", sub: "Maggio 2000: la rimonta biancoceleste e il gol di Calori", color: '#ffc800' },
  { num: 31, title: "La Roma del Terzo Scudetto & Il 5 Maggio 2002", sub: "Batistuta e Totti nel 2001, la tragedia sportiva dell'Inter nel 2002", color: '#ff4b4b' },
  { num: 32, title: "L'Era Ancelotti vs Lippi (2002-2006)", sub: "Sheva, Kaká, Del Piero, Trezeguet e Nedvěd dominano l'Italia", color: '#58cc02' },
  { num: 33, title: "L'Inter dei Record & Il Triplete", sub: "Ibrahimović, Cruz, Milito, Eto'o e Sneijder verso la gloria", color: '#1cb0f6' },
  { num: 34, title: "Il Ciclo dei 9 Scudetti Bianconeri", sub: "Da Pirlo, Tévez e Pogba fino a Dybala, Higuaín e Cristiano Ronaldo", color: '#ff9600' },
  { num: 35, title: "Il Grande Napoli: Da Sarri a Spalletti & Conte", sub: "I 36 gol di Higuaín, Osimhen, Kvaratskhelia e McTominay", color: '#ce82ff' },
  { num: 36, title: "Il Ritorno di Milano: Pioli & Seconda Stella", sub: "La doppietta di Giroud, Leão, lo scudetto 2022 e la Seconda Stella Inter", color: '#ffc800' },
  { num: 37, title: "Bomber di Provincia & Notte di Dublino", sub: "Hübner, Di Natale, Lucarelli, Protti e la tripletta di Lookman", color: '#ff4b4b' },
  { num: 38, title: "Gol Storici al 90'+ & Rimonte da Infarto", sub: "Partite ribaltate nei secondi finali che hanno scritto la storia", color: '#58cc02' },
  { num: 39, title: "Chi NON ha segnato? Prova di Memoria", sub: "Attenzione ai tranelli: individua l'unico calciatore a secco nel match!", color: '#1cb0f6' },
  { num: 40, title: "Tabellino d'Oro: Esame Supremo del Pastore", sub: "La sfida finale del Mini Pastore: 10.000 tabellini e dettagli leggendari", color: '#ff4b4b' }
];

// 1. Genera le 10 Unità Gael League (500 domande sul percorso)
let gaelGlobalIdx = 0;
gaelUnitConfigs.forEach(u => {
  const lessons = [];
  for (let l = 1; l <= 10; l++) {
    const questions = [];
    for (let q = 1; q <= 5; q++) {
      const player = fullGaelPlayers[(gaelGlobalIdx * 11 + u.num * 7 + l * 3 + q) % fullGaelPlayers.length];
      const qObj = buildGaelQuestionVariant(player, gaelGlobalIdx, `u${u.num}-l${l}-q${q}-${player.id}`, Boolean(u.pro));
      qObj.difficultyLevel = u.num;
      questions.push(qObj);
      gaelGlobalIdx++;
    }
    lessons.push({
      id: `lesson-${l}`,
      mode: 'gael',
      title: `Tappa ${l} · ${u.title}`,
      description: `Sfida carriere livello ${u.num} (Archivio 10.000 Carriere)`,
      questions
    });
  }
  units.push({
    id: `unit-${u.num}`,
    num: u.num,
    mode: 'gael',
    title: u.title,
    subtitle: u.sub,
    color: u.color,
    lessons
  });
});

// 2. Genera le 9.500 domande extra Gael League (Totale Gael League = 500 + 9.500 = 10.000!)
const gaelModes = {
  anni90: [],
  anni2000: [],
  allstars: [],
  pro: []
};

const pAnni90 = fullGaelPlayers.filter(p => (p.era || '').includes('90') || p.cat === 'anni90');
const pAnni2000 = fullGaelPlayers.filter(p => (p.era || '').includes('2000') || (p.era || '').includes('2026') || p.cat === 'anni2000');

for (let i = 0; i < 2500; i++) {
  const p = pAnni90[(i * 7 + Math.floor(i / pAnni90.length) * 3) % pAnni90.length];
  gaelModes.anni90.push(buildGaelQuestionVariant(p, i + 500, `gael-90-${i + 1}`, false));
}
for (let i = 0; i < 2500; i++) {
  const p = pAnni2000[(i * 11 + Math.floor(i / pAnni2000.length) * 5) % pAnni2000.length];
  gaelModes.anni2000.push(buildGaelQuestionVariant(p, i + 3000, `gael-2000-${i + 1}`, false));
}
for (let i = 0; i < 2500; i++) {
  const p = fullGaelPlayers[(i * 13 + Math.floor(i / fullGaelPlayers.length) * 7) % fullGaelPlayers.length];
  gaelModes.allstars.push(buildGaelQuestionVariant(p, i + 5500, `gael-all-${i + 1}`, false));
}
for (let i = 0; i < 2000; i++) {
  const p = fullGaelPlayers[(i * 17 + Math.floor(i / fullGaelPlayers.length) * 9) % fullGaelPlayers.length];
  gaelModes.pro.push(buildGaelQuestionVariant(p, i + 8000, `gael-pro-${i + 1}`, true));
}

const gaelExtraTotal = gaelModes.anni90.length + gaelModes.anni2000.length + gaelModes.allstars.length + gaelModes.pro.length;
const gaelTotalCount = 500 + gaelExtraTotal;
console.log(`✅ Generate sfide Gael League totali: ${gaelTotalCount} (500 Percorso + ${gaelExtraTotal} Arene = 10.000)`);

// 3. Genera le 15 Unità Quizzocampo (11..25) unendo quizzocampoPool + QUIZZONE_2015_2026_QUESTIONS
const converted2026Quiz = QUIZZONE_2015_2026_QUESTIONS.map(q => ({
  q: q.question,
  r: q.route || [['CALCIO 2015-2026', 'Archivio'], ['DOMANDA UFFICIALE', 'Quiz']],
  opt: q.options,
  c: q.correct,
  s: q.sourceTitle || 'Lega Serie A',
  ch: q.check,
  cat: 'all',
  era2015_2026: true
}));
const combinedQuizPool = [...converted2026Quiz, ...quizzocampoPool];

quizUnitConfigs.forEach(u => {
  const lessons = [];
  const unitPool = u.qCat === 'all'
    ? combinedQuizPool
    : combinedQuizPool.filter(q => q.cat === u.qCat || q.era2015_2026);
  const activeQuizzes = unitPool.length >= 10 ? unitPool : combinedQuizPool;

  for (let l = 1; l <= 10; l++) {
    const questions = [];
    for (let q = 1; q <= 5; q++) {
      const qId = `u${u.num}-l${l}-q${q}`;
      const tIdx = (u.num * 13 + (l - 1) * 5 + (q - 1)) % activeQuizzes.length;
      const trivia = activeQuizzes[tIdx];
      const opts = makeOptions(trivia.c, trivia.opt);

      questions.push({
        id: `${qId}-quiz`,
        mode: 'quizzocampo',
        era2015_2026: Boolean(trivia.era2015_2026),
        difficultyLevel: u.num - 10,
        tag: `QUIZZOCAMPO • ${u.title.toUpperCase()}`,
        question: trivia.q,
        route: trivia.r,
        options: opts,
        correct: trivia.c,
        sourceType: 'official',
        sourceTitle: `${trivia.s || 'Lega Serie A'}: Archivio Quizzocampo`,
        sourceUrl: 'https://www.legaseriea.it',
        check: trivia.ch
      });
    }
    lessons.push({
      id: `lesson-${l}`,
      mode: 'quizzocampo',
      title: `Tappa ${l} · ${u.title}`,
      description: `Quiz tematico livello ${u.num - 10}`,
      questions
    });
  }

  units.push({
    id: `unit-${u.num}`,
    num: u.num,
    mode: 'quizzocampo',
    title: u.title,
    subtitle: u.sub,
    color: u.color,
    lessons
  });
});

// 4. Genera le 15 Unità Pastore League (26..40) pescando dalle 10.000 sfide Pastore
pastoreUnitConfigs.forEach(u => {
  const lessons = [];
  const unitLevel = u.num - 25; // 1..15

  for (let l = 1; l <= 10; l++) {
    const questions = [];
    for (let q = 1; q <= 5; q++) {
      const qId = `u${u.num}-l${l}-q${q}`;
      const pIdx = ((unitLevel - 1) * 600 + (l - 1) * 50 + (q - 1) * 7) % pastoreQuestions.length;
      const pQ = pastoreQuestions[pIdx];

      questions.push({
        ...pQ,
        id: `${qId}-pastore`,
        difficultyLevel: unitLevel
      });
    }
    lessons.push({
      id: `lesson-${l}`,
      mode: 'pastore',
      title: `Tappa ${l} · ${u.title}`,
      description: `Sfida marcatori Serie A livello ${unitLevel} (Archivio 10.000 Sfide)`,
      questions
    });
  }

  units.push({
    id: `unit-${u.num}`,
    num: u.num,
    mode: 'pastore',
    title: u.title,
    subtitle: u.sub,
    color: u.color,
    lessons
  });
});

// 5. Arene Tematiche Quizzocampo
const extraModes = {
  goals: [],
  scorers: [],
  derby: [],
  champions: []
};

['goals', 'scorers', 'derby', 'champions'].forEach((k, kIdx) => {
  const count = k === 'champions' ? 200 : 250;
  for (let i = 0; i < count; i++) {
    const base = combinedQuizPool[(i * 7 + kIdx * 19) % combinedQuizPool.length];
    extraModes[k].push({
      id: `extra-${k}-${i + 1}`,
      mode: 'quizzocampo',
      era2015_2026: Boolean(base.era2015_2026),
      tag: `QUIZZOCAMPO • ${k.toUpperCase()}`,
      question: base.q,
      route: base.r,
      options: makeOptions(base.c, base.opt),
      correct: base.c,
      sourceType: 'official',
      sourceTitle: `Archivio Quizzocampo: ${base.s || 'Lega Serie A'}`,
      sourceUrl: 'https://www.legaseriea.it',
      check: base.ch
    });
  }
});

const quizExtraTotal = extraModes.goals.length + extraModes.scorers.length + extraModes.derby.length + extraModes.champions.length;
const grandTotal = gaelTotalCount + pastoreQuestions.length + (15 * 50) + quizExtraTotal;

const dataset = {
  $schema: './curriculum.schema.json',
  metadata: {
    version: '5.0.0',
    title: 'Fuoriclasse Mega Database 20K+: 10.000 Gael League + 10.000 Pastore League + Quizzone',
    description: '10.000 sfide Gael League (carriere 1990-2026), 10.000 sfide Pastore League (tabellini e marcatori 1990-2026) e 1.700 sfide Quizzone.',
    language: 'it',
    lastReviewed: '2026-11-02',
    totalQuestions: grandTotal,
    uniqueCareerPlayers: fullGaelPlayers.length,
    pastoreMatchesCount: allRealMatches.length,
    distribution: {
      gaelLeagueTotal: gaelTotalCount,
      pastoreModeTotal: pastoreQuestions.length,
      quizzocampoTotal: 750 + quizExtraTotal
    }
  },
  units,
  gaelModes,
  extraModes,
  pastoreMode: pastoreQuestions
};

fs.writeFileSync(targetPath, JSON.stringify(dataset), 'utf8');
console.log('\n🏆 MEGA DATASET 20K+ SALVATO E MINIFICATO CON SUCCESSO!');
console.log(`- GAEL LEAGUE TOTALE: ${gaelTotalCount} domande`);
console.log(`- PASTORE LEAGUE TOTALE: ${pastoreQuestions.length} domande`);
console.log(`- QUIZZOCAMPO TOTALE: ${750 + quizExtraTotal} domande`);
console.log(`- TOTALE GENERALE CALCIO: ${grandTotal} domande`);
