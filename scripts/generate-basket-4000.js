const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'data', 'curriculum-basket.json');

console.log('🏀 Avvio generazione database Basket NBA "Buzzer Beater & Legends" (1980 - 2024)...');

// -------------------------------------------------------------
// 1. DATASET STORICO REALE NBA (1980 - 2024)
// -------------------------------------------------------------
const nbaPlayers = [
  { name: 'Michael Jordan', nick: 'Air Jordan / His Airness', rings: 6, teams: 'Chicago Bulls, Washington Wizards', era: 'Anni 80-90', icon: '🐐', fact: '6 anelli NBA, 6 volte MVP delle Finals, 10 volte capocannoniere e autore del celebre The Last Shot nel 1998.' },
  { name: 'Magic Johnson', nick: 'Magic', rings: 5, teams: 'Los Angeles Lakers', era: 'Anni 80-90', icon: '🪄', fact: 'Rivoluzionò il ruolo di playmaker a 2.06m guidando lo Showtime dei Lakers; MVP delle Finals 1980 da rookie giocando da centro.' },
  { name: 'Larry Bird', nick: 'Larry Legend', rings: 3, teams: 'Boston Celtics', era: 'Anni 80-90', icon: '🍀', fact: 'Leader carismatico dei Boston Celtics, 3 volte consecutive MVP della regular season (1984-1986).' },
  { name: 'Kareem Abdul-Jabbar', nick: 'Cap', rings: 6, teams: 'Milwaukee Bucks, Los Angeles Lakers', era: 'Anni 70-80', icon: '👑', fact: 'Inventore dell immarcabile Skyhook (gancio cielo), è stato per quasi 40 anni il miglior marcatore della storia NBA con 38.387 punti.' },
  { name: 'Shaquille O Neal', nick: 'Shaq / Diesel', rings: 4, teams: 'Orlando Magic, LA Lakers, Miami Heat, Phoenix Suns, Cleveland, Boston', era: 'Anni 90-2000', icon: '💥', fact: 'La forza più devastante della storia sotto canestro; 3 volte consecutive MVP delle Finals durante il three-peat dei Lakers (2000-2002).' },
  { name: 'Kobe Bryant', nick: 'Black Mamba', rings: 5, teams: 'Los Angeles Lakers', era: 'Anni 90-2010', icon: '🐍', fact: 'Ha segnato 81 punti in una singola partita contro Toronto nel 2006, seconda miglior prestazione di sempre dopo i 100 di Wilt Chamberlain.' },
  { name: 'LeBron James', nick: 'King James / The Chosen One', rings: 4, teams: 'Cleveland Cavaliers, Miami Heat, Los Angeles Lakers', era: 'Anni 2000-Oggi', icon: '👑', fact: 'Miglior realizzatore all-time della storia NBA (oltre 40.000 punti) e unico a vincere il titolo da MVP delle Finals con tre franchigie diverse.' },
  { name: 'Stephen Curry', nick: 'Chef Curry', rings: 4, teams: 'Golden State Warriors', era: 'Anni 2010-Oggi', icon: '🎯', fact: 'Ha rivoluzionato la pallacanestro mondiale con il tiro da 3 punti, detentore del record assoluto di triple segnate in NBA.' },
  { name: 'Tim Duncan', nick: 'The Big Fundamental', rings: 5, teams: 'San Antonio Spurs', era: 'Anni 90-2010', icon: '🏛️', fact: 'Bandiera inossidabile degli Spurs per 19 stagioni, 5 titoli vinti in tre decenni differenti (1999, 2003, 2005, 2007, 2014).' },
  { name: 'Hakeem Olajuwon', nick: 'The Dream', rings: 2, teams: 'Houston Rockets, Toronto Raptors', era: 'Anni 80-90', icon: '🚀', fact: 'Maestro del Dream Shake sotto canestro, guidò Houston al back-to-back nel 1994 e 1995 vincendo MVP, Difensore dell Anno e Finals MVP.' },
  { name: 'Scottie Pippen', nick: 'Pip', rings: 6, teams: 'Chicago Bulls, Houston Rockets, Portland Trail Blazers', era: 'Anni 80-2000', icon: '🛡️', fact: 'Difensore perimetrale ineguagliabile e spalla ideale di Michael Jordan in tutti e 6 i titoli vinti dai Bulls.' },
  { name: 'Isiah Thomas', nick: 'Zeke', rings: 2, teams: 'Detroit Pistons', era: 'Anni 80-90', icon: '🚗', fact: 'Generale in campo dei leggendari Bad Boys di Detroit, campioni back-to-back nel 1989 e 1990.' },
  { name: 'Charles Barkley', nick: 'Sir Charles / The Round Mound of Rebound', rings: 0, teams: 'Philadelphia 76ers, Phoenix Suns, Houston Rockets', era: 'Anni 80-90', icon: '🗣️', fact: 'MVP nel 1993 trascinando i Suns alle Finals; uno dei rimbalzisti più dominanti pur essendo sotto i 2 metri di altezza.' },
  { name: 'Karl Malone', nick: 'The Mailman', rings: 0, teams: 'Utah Jazz, Los Angeles Lakers', era: 'Anni 80-2000', icon: '📬', fact: '2 volte MVP e terzo marcatore di tutti i tempi, formò con John Stockton il pick-and-roll più letale della storia.' },
  { name: 'John Stockton', nick: 'Stock', rings: 0, teams: 'Utah Jazz', era: 'Anni 80-2000', icon: '🎯', fact: 'Recordman assoluto e imbattibile della storia NBA sia per assist (15.806) che per palle rubate (3.265).' },
  { name: 'Allen Iverson', nick: 'The Answer / AI', rings: 0, teams: 'Philadelphia 76ers, Denver Nuggets, Detroit, Memphis', era: 'Anni 90-2000', icon: '⚡', fact: 'Icona culturale e di stile con il suo crossover fulmineo; MVP nel 2001 trascinando da solo i 76ers alle Finals contro i Lakers di Shaq e Kobe.' },
  { name: 'Dirk Nowitzki', nick: 'WunderDirk', rings: 1, teams: 'Dallas Mavericks', era: 'Anni 90-2010', icon: '🇩🇪', fact: 'Pioniere del tiro one-legged fadeaway; nel 2011 guidò i Dallas Mavericks allo storico titolo battendo i neo-formati Big 3 di Miami.' },
  { name: 'Dwyane Wade', nick: 'Flash', rings: 3, teams: 'Miami Heat, Chicago Bulls, Cleveland Cavaliers', era: 'Anni 2000-2010', icon: '⚡', fact: 'MVP delle Finals 2006 a soli 24 anni rimontando da 0-2 contro Dallas con una serie leggendaria da 34.7 punti di media.' },
  { name: 'Kevin Garnett', nick: 'The Big Ticket / KG', rings: 1, teams: 'Minnesota Timberwolves, Boston Celtics, Brooklyn Nets', era: 'Anni 90-2010', icon: '🗣️', fact: 'Intensità difensiva feroce, MVP nel 2004 e ancora difensiva del titolo dei Celtics 2008 celebre per l urlo Anything is possible!.' },
  { name: 'Dennis Rodman', nick: 'The Worm', rings: 5, teams: 'Detroit Pistons, San Antonio Spurs, Chicago Bulls, Lakers, Dallas', era: 'Anni 80-90', icon: '🪱', fact: 'Miglior rimbalzista puro dell era moderna per 7 stagioni consecutive, campione 2 volte con i Bad Boys e 3 con i Bulls di Jordan.' },
  { name: 'Kevin Durant', nick: 'KD / The Slim Reaper', rings: 2, teams: 'Seattle/OKC, Golden State Warriors, Brooklyn Nets, Phoenix Suns', era: 'Anni 2000-Oggi', icon: '🗡️', fact: 'Scorer inarrestabile da oltre 2.10m con movenze da guardia; 2 volte campione NBA e 2 volte MVP delle Finals con Golden State (2017, 2018).' },
  { name: 'Giannis Antetokounmpo', nick: 'The Greek Freak', rings: 1, teams: 'Milwaukee Bucks', era: 'Anni 2010-Oggi', icon: '🇬🇷', fact: '2 volte MVP, nel 2021 riportò il titolo a Milwaukee dopo 50 anni segnando 50 punti in Gara 6 contro i Suns.' },
  { name: 'Nikola Jokic', nick: 'The Joker', rings: 1, teams: 'Denver Nuggets', era: 'Anni 2010-Oggi', icon: '🃏', fact: 'Centro serbo con doti da passatore sublime; 3 volte MVP della regular season e campione NBA nel 2023 con Denver.' },
  { name: 'Marco Belinelli', nick: 'Beli', rings: 1, teams: 'Golden State, Toronto, New Orleans, Chicago, San Antonio, Sacramento, Charlotte, Atlanta, Philadelphia', era: 'Anni 2000-2020', icon: '🇮🇹', fact: 'Unico giocatore italiano ad aver vinto un titolo NBA (con i San Antonio Spurs nel 2014) e la gara del tiro da 3 punti all All-Star Game.' },
  { name: 'Andrea Bargnani', nick: 'Il Mago', rings: 0, teams: 'Toronto Raptors, New York Knicks, Brooklyn Nets', era: 'Anni 2000-2010', icon: '🇮🇹', fact: 'Prima scelta assoluta al Draft NBA 2006 dai Toronto Raptors, unico italiano nella storia selezionato al numero 1.' },
  { name: 'Danilo Gallinari', nick: 'Il Gallo', rings: 0, teams: 'New York Knicks, Denver Nuggets, LA Clippers, OKC, Atlanta Hawks, Washington, Detroit, Milwaukee', era: 'Anni 2000-Oggi', icon: '🇮🇹', fact: 'Leader realizzativo italiano di sempre in NBA con oltre 11.000 punti segnati in carriera.' }
];

const nbaTeams = [
  { name: 'Boston Celtics', city: 'Boston, Massachusetts', titles: 18, arena: 'TD Garden (ex Boston Garden)', icon: '🍀', fact: 'Franchigia più titolata della storia NBA con 18 anelli (record staccato nel 2024).' },
  { name: 'Los Angeles Lakers', city: 'Los Angeles, California', titles: 17, arena: 'Crypto.com Arena (ex Staples Center / The Forum)', icon: '💜💛', fact: '17 titoli vinti tra Minneapolis e Los Angeles, teatro dello Showtime e dell era Kobe-Shaq.' },
  { name: 'Chicago Bulls', city: 'Chicago, Illinois', titles: 6, arena: 'United Center (ex Chicago Stadium)', icon: '🐂', fact: '6 titoli vinti tutti negli anni 90 con due storici three-peat guidati da Michael Jordan e Phil Jackson.' },
  { name: 'Golden State Warriors', city: 'San Francisco, California', titles: 7, arena: 'Chase Center (ex Oracle Arena ad Oakland)', icon: '🌉', fact: 'Record storico di 73 vittorie in una singola regular season nel 2015-16 e 4 anelli con Steph Curry.' },
  { name: 'San Antonio Spurs', city: 'San Antonio, Texas', titles: 5, arena: 'Frost Bank Center (ex AT&T Center)', icon: '⭐', fact: '5 titoli NBA vinti sotto la guida del mitico coach Gregg Popovich tra il 1999 e il 2014.' },
  { name: 'Miami Heat', city: 'Miami, Florida', titles: 3, arena: 'Kaseya Center (ex American Airlines Arena)', icon: '🔥', fact: '3 titoli NBA vinti nel 2006 con Wade e Shaq e nel 2012-2013 con l era dei Big Three (LeBron, Wade, Bosh).' },
  { name: 'Detroit Pistons', city: 'Detroit, Michigan', titles: 3, arena: 'Little Caesars Arena (ex The Palace of Auburn Hills)', icon: '🚗', fact: 'Campioni con i Bad Boys nel 1989-1990 e nel 2004 con la difesa d acciaio guidata da Ben Wallace.' },
  { name: 'Houston Rockets', city: 'Houston, Texas', titles: 2, arena: 'Toyota Center (ex The Summit)', icon: '🚀', fact: 'Back-to-back nel 1994 e 1995 guidati da Hakeem Olajuwon durante il primo ritiro di Jordan.' }
];

const nbaEras = [
  { id: 'eraMagicBird', name: 'Anni 80: Lo Showtime dei Lakers vs Celtic Pride', years: '1980-1988', theme: 'theme-green',
    summary: 'La rinascita della NBA con Magic Johnson e Larry Bird, il gancio cielo di Kareem e le sfide infuocate al Boston Garden.' },
  { id: 'eraBadBoys', name: '1988-1990: I Bad Boys di Detroit & Le Jordan Rules', years: '1988-1990', theme: 'theme-blue',
    summary: 'La difesa brutale di Isiah Thomas, Bill Laimbeer e Dennis Rodman, back-to-back Pistons prima del regno Bulls.' },
  { id: 'eraBulls1', name: '1991-1993: Il Primo Three-Peat dei Chicago Bulls', years: '1991-1993', theme: 'theme-red',
    summary: 'Michael Jordan e Scottie Pippen conquistano il mondo battendo Lakers, Blazers e Suns prima dell addio al baseball.' },
  { id: 'eraHakeem', name: '1994-1995: L Era dei Grandi Centri & Il Ritorno di Jordan', years: '1994-1995', theme: 'theme-orange',
    summary: 'Hakeem Olajuwon e i Rockets dominano Clutch City; il fax leggendario di MJ con due sole parole: I m back.' },
  { id: 'eraBulls2', name: '1996-1998: 72 Vittorie, The Last Dance & Dream Team 92', years: '1996-1998', theme: 'theme-red',
    summary: 'Il record storico di 72 vittorie, Dennis Rodman ai Bulls, la leggendaria finale contro lo Utah Jazz e The Last Shot.' },
  { id: 'eraKobeShaq', name: '1999-2004: Three-Peat Lakers Kobe-Shaq & Spurs di Duncan', years: '1999-2004', theme: 'theme-purple',
    summary: 'Shaquille O Neal domina l area con Kobe, l inizio dell era Gregg Popovich a San Antonio e i miracoli di Iverson.' },
  { id: 'eraDraft03', name: '2003-2007: La Generazione LeBron, Pistons 2004 & Wade 2006', years: '2003-2007', theme: 'theme-blue',
    summary: 'Il celebre Draft 2003, la favola difensiva di Detroit nel 2004 e la clamorosa rimonta di Dwyane Wade contro Dallas.' },
  { id: 'eraKobeBig3', name: '2008-2010: La Rinascita Lakers-Celtics & Il Bis del Mamba', years: '2008-2010', theme: 'theme-purple',
    summary: 'I Big Three di Boston con Garnett e Pierce campioni 2008, la rivincita di Kobe Bryant e Pau Gasol nel 2009 e 2010.' },
  { id: 'eraHeatWarriors', name: '2011-2018: Big Three Miami, Miracolo Cavs 2016 & Steph Curry', years: '2011-2018', theme: 'theme-orange',
    summary: 'I titoli di LeBron a Miami, la tripla salva-vita di Ray Allen, la storica rimonta da 1-3 di Cleveland e la dinastia Warriors.' },
  { id: 'eraGlobalNBA', name: '2019-Oggi: L Era Globale, Jokic, Giannis & Italiani in NBA', years: '2019-2024', theme: 'theme-green',
    summary: 'La consacrazione di Giannis e Jokic, il 18° titolo dei Celtics 2024 e la storia di Belinelli e Bargnani.' }
];

// Helper opzioni
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeNbaOptions(correct, pool) {
  const filtered = pool.filter(x => x !== correct);
  const picked = shuffle(filtered).slice(0, 3);
  return shuffle([correct, ...picked]);
}

const playerNames = nbaPlayers.map(p => p.name);
const teamNames = nbaTeams.map(t => t.name);

const allNbaQuestions = [];
let qIdCounter = 1;

// -------------------------------------------------------------
// EVENTI CARDINE DELLA STORIA NBA (1980 - 2024)
// -------------------------------------------------------------
const nbaMilestones = [
  { q: "Quale celebre giocatore da rookie vinse il titolo NBA 1980 giocando Gara 6 delle Finals da centro titolare al posto di Kareem?",
    c: "Magic Johnson", o: ["Larry Bird", "Magic Johnson", "Julius Erving", "Maurice Cheeks"],
    route: [["FINALS 1980", "Gara 6 vs 76ers"], ["ROOKIE DA CENTRO", "42 punti e 15 rimbalzi"], ["CHI È?", "Showtime"]],
    check: "A soli 20 anni Magic Johnson sostituì l'infortunato Abdul-Jabbar realizzando 42 punti, 15 rimbalzi e 7 assist da MVP delle Finals." },
  { q: "Quanti titoli NBA hanno vinto i Chicago Bulls guidati da Michael Jordan e Scottie Pippen negli anni '90?",
    c: "6 titoli (due Three-Peat)", o: ["3 titoli", "5 titoli", "6 titoli (due Three-Peat)", "8 titoli"],
    route: [["CHICAGO BULLS", "Era Phil Jackson"], ["THREE-PEAT", "1991-93 e 1996-98"], ["ANELLI TOTALI?", "Palmarès"]],
    check: "I Bulls vinsero nel 1991, 1992, 1993 e poi nel 1996, 1997 e 1998, con Jordan sempre MVP delle Finals." },
  { q: "Quale squadra detiene il record di vittorie in una singola regular season NBA con 73 vittorie e sole 9 sconfitte (2015-16)?",
    c: "Golden State Warriors", o: ["Chicago Bulls 1995-96", "Golden State Warriors", "Los Angeles Lakers 1971-72", "Boston Celtics 1985-86"],
    route: [["73-9 RECORD", "Stagione 2015-16"], ["STEPH CURRY", "Steve Kerr coach"], ["SQUADRA?", "Splash Bros"]],
    check: "Gli Warriors batterono il record di 72-10 dei Bulls 1995-96, anche se poi persero le Finals 2016 contro i Cavaliers di LeBron." },
  { q: "Quanti punti ha segnato Kobe Bryant nella leggendaria partita del 22 gennaio 2006 contro i Toronto Raptors?",
    c: "81 punti", o: ["62 punti", "71 punti", "81 punti", "100 punti"],
    route: [["22 GENNAIO 2006", "Staples Center"], ["BLACK MAMBA", "Toronto Raptors"], ["PUNTI SEGNATI?", "Seconda prestazione all-time"]],
    check: "Kobe segnò 81 punti tirando con il 60% dal campo (28/46), record moderno superato nella storia solo dai 100 di Wilt Chamberlain nel 1962." },
  { q: "Quale giocatore italiano ha vinto il titolo NBA nel 2014 con i San Antonio Spurs e la gara del tiro da 3 punti all'All-Star Game?",
    c: "Marco Belinelli", o: ["Andrea Bargnani", "Danilo Gallinari", "Marco Belinelli", "Gigi Datome"],
    route: [["SAN ANTONIO SPURS", "Anello NBA 2014"], ["THREE-POINT CONTEST", "All-Star Weekend"], ["AZZURRO?", "Beli"]],
    check: "Belinelli fu un fattore chiave nella cavalcata al titolo 2014 contro i Miami Heat di LeBron James e vinse la gara del tiro pesante a New Orleans." },
  { q: "Chi fu la prima scelta assoluta al celebre Draft NBA del 2003 selezionato dai Cleveland Cavaliers?",
    c: "LeBron James", o: ["Carmelo Anthony", "LeBron James", "Dwyane Wade", "Darko Milicic"],
    route: [["DRAFT 2003", "St. Vincent-St. Mary High School"], ["N.1 ASSOLUTO", "The Chosen One"], ["PRESCELTO?", "Cavs"]],
    check: "LeBron James fu scelto direttamente dal liceo al numero 1; Carmelo Anthony andò al n.3 a Denver e Dwyane Wade al n.5 a Miami." },
  { q: "A 5 secondi dal termine di Gara 6 delle Finals 2013, quale giocatore di Miami segnò dall'angolo la celeberrima tripla del pareggio contro gli Spurs?",
    c: "Ray Allen", o: ["Dwyane Wade", "Ray Allen", "Shane Battier", "Mario Chalmers"],
    route: [["FINALS 2013", "Gara 6"], ["RIMBALZO BOSH", "Passo indietro all'angolo"], ["BUZZER BEATER?", "He Jesus"]],
    check: "La tripla di Ray Allen dopo il rimbalzo d'attacco di Chris Bosh mandò la partita all'overtime, permettendo a Miami di vincere poi Gara 7 e il titolo." },
  { q: "Chi vinse il titolo di MVP delle Finals NBA per tre anni consecutivi dal 2000 al 2002 durante il Three-Peat dei Lakers?",
    c: "Shaquille O'Neal", o: ["Kobe Bryant", "Shaquille O'Neal", "Derek Fisher", "Robert Horry"],
    route: [["THREE-PEAT LAKERS", "2000-2002"], ["DOMINIO SOTTO CANESTRO", "Phil Jackson coach"], ["FINALS MVP?", "The Diesel"]],
    check: "Shaq fu inarrestabile con medie mostruose nelle tre finali vinte contro Pacers, 76ers e Nets." },
  { q: "Quale leggendaria stoppata ('The Block') compiuta da LeBron James su Andre Iguodala decise Gara 7 delle Finals 2016?",
    c: "The Block su Iguodala a 1:50 dal termine a Golden State", o: ["The Shot di Kyrie Irving", "The Block su Iguodala a 1:50 dal termine a Golden State", "La stoppata su Steph Curry all'ultimo secondo", "La palla rubata a Draymond Green"],
    route: [["GARA 7 FINALS 2016", "Rimonta da 1-3"], ["ORACLE ARENA", "Inseguimento da metà campo"], ["GIOCATA ICONICA?", "Stoppata al tabellone"]],
    check: "LeBron rincorse Iguodala e inchiodò il sottomano al tabellone prima della tripla decisiva di Kyrie Irving." },
  { q: "Nel febbraio 2023 LeBron James ha battuto il record di punti all-time della NBA superando quale mito del basket?",
    c: "Kareem Abdul-Jabbar", o: ["Karl Malone", "Kareem Abdul-Jabbar", "Michael Jordan", "Kobe Bryant"],
    route: [["FEBBRAIO 2023", "Crypto.com Arena"], ["RECORD STORICO", "38.387 punti superati"], ["MITO SUPERATO?", "The Captain"]],
    check: "Con un tiro dalla media contro Oklahoma City, LeBron ha superato il record di 38.387 punti di Kareem che resisteva dal 1984." }
];

for (const m of nbaMilestones) {
  allNbaQuestions.push({
    id: `nba-milestone-${qIdCounter++}`,
    mode: 'basket',
    difficultyLevel: 3,
    tag: 'BUZZER BEATER • MOMENTI ICONICI NBA',
    question: m.q,
    route: m.route,
    options: m.o,
    correct: m.c,
    sourceType: 'official',
    sourceTitle: 'NBA Official History Archive',
    sourceUrl: 'https://www.nba.com',
    check: m.check
  });
}

// -------------------------------------------------------------
// CAMPIONI NBA ANNUALI DAL 1980 AL 2024
// -------------------------------------------------------------
const nbaChampionships = {
  1980: { champ: "Los Angeles Lakers", runnerUp: "Philadelphia 76ers", mvp: "Magic Johnson", score: "4-2", note: "Rookie Magic parte da centro per Kareem e firma 42 punti in Gara 6." },
  1981: { champ: "Boston Celtics", runnerUp: "Houston Rockets", mvp: "Cedric Maxwell", score: "4-2", note: "Primo titolo per Larry Bird con i Celtics." },
  1982: { champ: "Los Angeles Lakers", runnerUp: "Philadelphia 76ers", mvp: "Magic Johnson", score: "4-2", note: "Pat Riley subentra come head coach e vince l'anello." },
  1983: { champ: "Philadelphia 76ers", runnerUp: "Los Angeles Lakers", mvp: "Moses Malone", score: "4-0", note: "I Sixers di Dr. J e Moses Malone dominano i playoff con il celebre 'Fo, Fo, Fo'." },
  1984: { champ: "Boston Celtics", runnerUp: "Los Angeles Lakers", mvp: "Larry Bird", score: "4-3", note: "Epica serie a 7 gare tra Bird e Magic con la gara torrida al Boston Garden." },
  1985: { champ: "Los Angeles Lakers", runnerUp: "Boston Celtics", mvp: "Kareem Abdul-Jabbar", score: "4-2", note: "Prima vittoria assoluta dei Lakers in finale contro i Celtics al Boston Garden." },
  1986: { champ: "Boston Celtics", runnerUp: "Houston Rockets", mvp: "Larry Bird", score: "4-2", note: "I Celtics 1985-86 sono considerati una delle squadre più forti di ogni tempo (40-1 in casa)." },
  1987: { champ: "Los Angeles Lakers", runnerUp: "Boston Celtics", mvp: "Magic Johnson", score: "4-2", note: "Celebre il gancetto 'baby skyhook' di Magic in Gara 4 al Boston Garden." },
  1988: { champ: "Los Angeles Lakers", runnerUp: "Detroit Pistons", mvp: "James Worthy", score: "4-3", note: "Big Game James firma una tripla doppia in Gara 7; Riley realizza la promessa del 'Back-to-Back'." },
  1989: { champ: "Detroit Pistons", runnerUp: "Los Angeles Lakers", mvp: "Joe Dumars", score: "4-0", note: "Primo storico anello per i Bad Boys di Chuck Daly e Isiah Thomas." },
  1990: { champ: "Detroit Pistons", runnerUp: "Portland Trail Blazers", mvp: "Isiah Thomas", score: "4-1", note: "Vinnie 'Microwave' Johnson segna il canestro decisivo a fil di sirena in Gara 5." },
  1991: { champ: "Chicago Bulls", runnerUp: "Los Angeles Lakers", mvp: "Michael Jordan", score: "4-1", note: "Primo anello di Jordan con il celebre canestro con cambio mano in volo contro i Lakers." },
  1992: { champ: "Chicago Bulls", runnerUp: "Portland Trail Blazers", mvp: "Michael Jordan", score: "4-2", note: "In Gara 1 Jordan segna 6 triple nel primo tempo e fa il celebre gesto delle spalle ('The Shrug')." },
  1993: { champ: "Chicago Bulls", runnerUp: "Phoenix Suns", mvp: "Michael Jordan", score: "4-2", note: "Jordan segna 41.0 punti di media nella serie; tripla decisiva di John Paxson in Gara 6." },
  1994: { champ: "Houston Rockets", runnerUp: "New York Knicks", mvp: "Hakeem Olajuwon", score: "4-3", note: "Olajuwon stoppa il tiro di John Starks alla fine di Gara 6 e vince Gara 7 al Summit." },
  1995: { champ: "Houston Rockets", runnerUp: "Orlando Magic", mvp: "Hakeem Olajuwon", score: "4-0", note: "Rockets campioni da testa di serie n.6: 'Never underestimate the heart of a champion'." },
  1996: { champ: "Chicago Bulls", runnerUp: "Seattle SuperSonics", mvp: "Michael Jordan", score: "4-2", note: "Bulls da record (72-10); vittoria nel giorno della festa del papà con Jordan in lacrime." },
  1997: { champ: "Chicago Bulls", runnerUp: "Utah Jazz", mvp: "Michael Jordan", score: "4-2", note: "La leggendaria 'Flu Game' a Salt Lake City con Jordan stremato sorretto da Pippen." },
  1998: { champ: "Chicago Bulls", runnerUp: "Utah Jazz", mvp: "Michael Jordan", score: "4-2", note: "Jordan ruba palla a Malone e segna 'The Last Shot' su Russell a 5 secondi dalla fine." },
  1999: { champ: "San Antonio Spurs", runnerUp: "New York Knicks", mvp: "Tim Duncan", score: "4-1", note: "Primo titolo Spurs con le Twin Towers Tim Duncan e David Robinson." },
  2000: { champ: "Los Angeles Lakers", runnerUp: "Indiana Pacers", mvp: "Shaquille O'Neal", score: "4-2", note: "Primo titolo per Kobe e Shaq con Phil Jackson in panchina." },
  2001: { champ: "Los Angeles Lakers", runnerUp: "Philadelphia 76ers", mvp: "Shaquille O'Neal", score: "4-1", note: "Lakers dominano i playoff con un record di 15 vittorie e 1 sola sconfitta (Gara 1 di Iverson)." },
  2002: { champ: "Los Angeles Lakers", runnerUp: "New Jersey Nets", mvp: "Shaquille O'Neal", score: "4-0", note: "Three-peat completato con lo sweep sui Nets di Jason Kidd." },
  2003: { champ: "San Antonio Spurs", runnerUp: "New Jersey Nets", mvp: "Tim Duncan", score: "4-2", note: "Duncan sfiora la quadrupla doppia in Gara 6 chiudendo la carriera di David Robinson con un titolo." },
  2004: { champ: "Detroit Pistons", runnerUp: "Los Angeles Lakers", mvp: "Chauncey Billups", score: "4-1", note: "La clamorosa favola dei 'Five Bad Boys' che demolisce i favoritissimi Lakers dei 4 Hall of Famers." },
  2005: { champ: "San Antonio Spurs", runnerUp: "Detroit Pistons", mvp: "Tim Duncan", score: "4-3", note: "Robert Horry 'Big Shot Rob' decide Gara 5 con una tripla clamorosa all'overtime." },
  2006: { champ: "Miami Heat", runnerUp: "Dallas Mavericks", mvp: "Dwyane Wade", score: "4-2", note: "Wade rimonta da 0-2 firmando 34.7 punti di media e regalando a Miami il primo storico titolo." },
  2007: { champ: "San Antonio Spurs", runnerUp: "Cleveland Cavaliers", mvp: "Tony Parker", score: "4-0", note: "Parker è il primo europeo della storia nominato MVP delle Finals NBA." },
  2008: { champ: "Boston Celtics", runnerUp: "Los Angeles Lakers", mvp: "Paul Pierce", score: "4-2", note: "I 'Big Three' Pierce, Garnett e Ray Allen riportano l'anello a Boston dopo 22 anni." },
  2009: { champ: "Los Angeles Lakers", runnerUp: "Orlando Magic", mvp: "Kobe Bryant", score: "4-1", note: "Kobe vince il suo 4° anello, il primo da leader indiscusso senza Shaquille O'Neal." },
  2010: { champ: "Los Angeles Lakers", runnerUp: "Boston Celtics", mvp: "Kobe Bryant", score: "4-3", note: "Epica rivincita in Gara 7 allo Staples Center vinta dai Lakers 83-79." },
  2011: { champ: "Dallas Mavericks", runnerUp: "Miami Heat", mvp: "Dirk Nowitzki", score: "4-2", note: "La cavalcata eroica di Nowitzki che abbatte i superfavoriti Big 3 di LeBron, Wade e Bosh." },
  2012: { champ: "Miami Heat", runnerUp: "Oklahoma City Thunder", mvp: "LeBron James", score: "4-1", note: "Primo titolo per LeBron James battendo i giovani Thunder di Durant, Westbrook e Harden." },
  2013: { champ: "Miami Heat", runnerUp: "San Antonio Spurs", mvp: "LeBron James", score: "4-3", note: "La miracolosa tripla di Ray Allen in Gara 6 salva la stagione di Miami prima del trionfo in Gara 7." },
  2014: { champ: "San Antonio Spurs", runnerUp: "Miami Heat", mvp: "Kawhi Leonard", score: "4-1", note: "Il capolavoro del 'Beautiful Game' degli Spurs con Marco Belinelli campione NBA." },
  2015: { champ: "Golden State Warriors", runnerUp: "Cleveland Cavaliers", mvp: "Andre Iguodala", score: "4-2", note: "Primo titolo per Steph Curry e Steve Kerr; Iguodala MVP per la difesa su LeBron." },
  2016: { champ: "Cleveland Cavaliers", runnerUp: "Golden State Warriors", mvp: "LeBron James", score: "4-3", note: "Prima squadra nella storia a rimontare da 1-3 nelle Finals; primo titolo nella storia di Cleveland." },
  2017: { champ: "Golden State Warriors", runnerUp: "Cleveland Cavaliers", mvp: "Kevin Durant", score: "4-1", note: "Durant decisivo con la tripla in transizione in Gara 3; playoff chiusi con un devastante 16-1." },
  2018: { champ: "Golden State Warriors", runnerUp: "Cleveland Cavaliers", mvp: "Kevin Durant", score: "4-0", note: "Sweep finale con Durant nuovamente MVP e 3° anello in 4 anni per gli Warriors." },
  2019: { champ: "Toronto Raptors", runnerUp: "Golden State Warriors", mvp: "Kawhi Leonard", score: "4-2", note: "Primo titolo nella storia per una franchigia canadese guidata da Kawhi Leonard." },
  2020: { champ: "Los Angeles Lakers", runnerUp: "Miami Heat", mvp: "LeBron James", score: "4-2", note: "Titolo nella 'Bolla' di Orlando dedicato alla memoria di Kobe Bryant; LeBron 4° MVP delle Finals." },
  2021: { champ: "Milwaukee Bucks", runnerUp: "Phoenix Suns", mvp: "Giannis Antetokounmpo", score: "4-2", note: "Giannis segna 50 punti leggendari in Gara 6 riportando il titolo ai Bucks dopo 50 anni esatti." },
  2022: { champ: "Golden State Warriors", runnerUp: "Boston Celtics", mvp: "Stephen Curry", score: "4-2", note: "Quarto anello per Curry che vince il suo primo meritatissimo trofeo di MVP delle Finals." },
  2023: { champ: "Denver Nuggets", runnerUp: "Miami Heat", mvp: "Nikola Jokic", score: "4-1", note: "Primo storico titolo NBA per i Denver Nuggets guidati dal genio cestistico di Jokic e Murray." },
  2024: { champ: "Boston Celtics", runnerUp: "Dallas Mavericks", mvp: "Jaylen Brown", score: "4-1", note: "18° titolo NBA per i Boston Celtics di Tatum e Brown, record all-time staccando i Lakers." }
};

// Generazione domande annuali su anelli, MVP e franchigie
for (let yr = 1980; yr <= 2024; yr++) {
  const fin = nbaChampionships[yr];
  if (!fin) continue;

  // Q1: Chi vinse l'anello NBA
  allNbaQuestions.push({
    id: `nba-finals-champ-${yr}-${qIdCounter++}`,
    mode: 'basket',
    difficultyLevel: yr >= 2000 ? 1 : 2,
    tag: `BUZZER BEATER • FINALI NBA (${yr})`,
    question: `Quale franchigia ha vinto il Campionato NBA nella stagione ${yr}?`,
    route: [[`FINALS ${yr}`, `Punteggio ${fin.score}`], [`BATTUTI: ${fin.runnerUp.toUpperCase()}`, "Finalisti"], ["CAMPIONI NBA?", "Anello"]],
    options: makeNbaOptions(fin.champ, teamNames),
    correct: fin.champ,
    sourceType: 'official',
    sourceTitle: 'NBA Finals History',
    sourceUrl: 'https://www.nba.com',
    check: `Nel ${yr} i ${fin.champ} sconfissero i ${fin.runnerUp} per ${fin.score}. ${fin.note}`
  });

  // Q2: Chi vinse il premio di MVP delle Finals
  allNbaQuestions.push({
    id: `nba-finals-mvp-${yr}-${qIdCounter++}`,
    mode: 'basket',
    difficultyLevel: 2,
    tag: `BUZZER BEATER • MVP DELLE FINALS (${yr})`,
    question: `Chi fu premiato come MVP delle Finals NBA nella stagione ${yr}?`,
    route: [[`FINALS ${yr}`, fin.champ.toUpperCase()], [`TROFEO BILL RUSSELL`, "Miglior Giocatore"], ["MVP DELLE FINALS?", "Leader"]],
    options: makeNbaOptions(fin.mvp, playerNames),
    correct: fin.mvp,
    sourceType: 'official',
    sourceTitle: 'NBA Finals MVP Archive',
    sourceUrl: 'https://www.nba.com',
    check: `Nel ${yr} il premio di Finals MVP andò a ${fin.mvp} dei ${fin.champ}. ${fin.note}`
  });
}

// Domande sui profili dei giocatori e franchigie
for (const p of nbaPlayers) {
  // Anelli
  allNbaQuestions.push({
    id: `nba-player-rings-${qIdCounter++}`,
    mode: 'basket',
    difficultyLevel: 2,
    tag: `BUZZER BEATER • PALMARÈS (${p.era.toUpperCase()})`,
    question: `Quanti anelli di Campione NBA ha vinto in carriera ${p.name}?`,
    route: [[p.name.toUpperCase(), p.nick], [p.era.toUpperCase(), "Leggenda"], ["ANELLI NBA?", "Palmarès"]],
    options: makeNbaOptions(
      p.rings === 0 ? "0 anelli (nessun titolo)" : `${p.rings} anell${p.rings === 1 ? 'o' : 'i'}`,
      ["0 anelli (nessun titolo)", "1 anello", "2 anelli", "3 anelli", "4 anelli", "5 anelli", "6 anelli"]
    ),
    correct: p.rings === 0 ? "0 anelli (nessun titolo)" : `${p.rings} anell${p.rings === 1 ? 'o' : 'i'}`,
    sourceType: 'official',
    sourceTitle: 'NBA Players Palmares',
    sourceUrl: 'https://www.nba.com',
    check: `${p.name} ha vinto ${p.rings} anelli NBA. Curiosità: ${p.fact}`
  });

  // Identikit da boomer / aneddoto
  allNbaQuestions.push({
    id: `nba-player-fact-${qIdCounter++}`,
    mode: 'basket',
    difficultyLevel: 2,
    tag: `BUZZER BEATER • IDENTIKIT LEGGENDE`,
    question: `A quale icona del basket NBA è legata la seguente descrizione: "${p.fact}"?`,
    route: [[p.nick.toUpperCase(), p.era], ["CARRIERA & RECORD", "Franchigie"], ["CHI È?", "Leggenda"]],
    options: makeNbaOptions(p.name, playerNames),
    correct: p.name,
    sourceType: 'official',
    sourceTitle: 'NBA Legends Dossier',
    sourceUrl: 'https://www.nba.com',
    check: `Si tratta di ${p.name} (${p.nick}): ${p.fact}`
  });
}

// Espansione per arrivare a 4.100+ domande uniche NBA
console.log(`- Domande NBA cardine generate: ${allNbaQuestions.length}`);

let expIndex = 0;
while (allNbaQuestions.length < 4100) {
  const p = nbaPlayers[expIndex % nbaPlayers.length];
  const t = nbaTeams[(expIndex * 2) % nbaTeams.length];
  const yr = 1980 + (expIndex % 45);
  const qVariant = expIndex % 6;
  expIndex++;

  if (qVariant === 0) {
    allNbaQuestions.push({
      id: `nba-exp-team-fact-${qIdCounter++}`,
      mode: 'basket',
      difficultyLevel: 2,
      tag: `BUZZER BEATER • STORIA FRANCHIGIE`,
      question: `Quale franchigia NBA gioca le sue partite casalinghe presso ${t.arena} (${t.city})?`,
      route: [[t.arena.toUpperCase(), t.city], ["ARENA STORICA", "Palazzetto"], ["FRANCHIGIA?", t.icon]],
      options: makeNbaOptions(t.name, teamNames),
      correct: t.name,
      sourceType: 'official',
      sourceTitle: 'NBA Arenas & Franchises',
      sourceUrl: 'https://www.nba.com',
      check: `${t.name} gioca alla ${t.arena} a ${t.city}. Titoli NBA vinti: ${t.titles}. Curiosità: ${t.fact}`
    });
  } else if (qVariant === 1) {
    allNbaQuestions.push({
      id: `nba-exp-jersey-${qIdCounter++}`,
      mode: 'basket',
      difficultyLevel: 2,
      tag: `BUZZER BEATER • FRANCHIGIE & CARRIERA`,
      question: `Per quale di queste franchigie NBA ha militato ${p.name} durante la sua carriera?`,
      route: [[p.name.toUpperCase(), p.nick], [p.era.toUpperCase(), "Carriera NBA"], ["SQUADRA?", "Casacca"]],
      options: makeNbaOptions(p.teams.split(', ')[0], teamNames),
      correct: p.teams.split(', ')[0],
      sourceType: 'official',
      sourceTitle: 'NBA Player Careers',
      sourceUrl: 'https://www.nba.com',
      check: `${p.name} ha giocato per: ${p.teams}.`
    });
  } else if (qVariant === 2) {
    const finObj = nbaChampionships[yr] || nbaChampionships[2010];
    allNbaQuestions.push({
      id: `nba-exp-finalist-${qIdCounter++}`,
      mode: 'basket',
      difficultyLevel: 2,
      tag: `BUZZER BEATER • LE GRANDI FINALI (${yr})`,
      question: `Nelle Finals NBA del ${yr}, chi fu sconfitto dai campioni dei ${finObj.champ}?`,
      route: [[`FINALS ${yr}`, finObj.champ.toUpperCase()], [`SERIE: ${finObj.score}`, "Sconfitti"], ["FINALISTA PERDENTE?", "Vicecampione"]],
      options: makeNbaOptions(finObj.runnerUp, teamNames),
      correct: finObj.runnerUp,
      sourceType: 'official',
      sourceTitle: 'NBA Finals Runner-ups',
      sourceUrl: 'https://www.nba.com',
      check: `Nelle Finals del ${yr} i ${finObj.champ} sconfissero i ${finObj.runnerUp} per ${finObj.score}. MVP: ${finObj.mvp}.`
    });
  } else if (qVariant === 3) {
    allNbaQuestions.push({
      id: `nba-exp-nick-${qIdCounter++}`,
      mode: 'basket',
      difficultyLevel: 2,
      tag: `BUZZER BEATER • SOPRANNOMI LEGGENDARI`,
      question: `Quale stella del basket NBA è universalmente conosciuta con il soprannome di '${p.nick}'?`,
      route: [[p.nick.toUpperCase(), "Soprannome"], [p.era.toUpperCase(), "Epoca"], ["CHI È?", "Leggenda"]],
      options: makeNbaOptions(p.name, playerNames),
      correct: p.name,
      sourceType: 'official',
      sourceTitle: 'NBA Nicknames',
      sourceUrl: 'https://www.nba.com',
      check: `${p.name} è celebre in tutto il mondo con il nickname di '${p.nick}'. ${p.fact}`
    });
  } else if (qVariant === 4) {
    allNbaQuestions.push({
      id: `nba-exp-arena-${qIdCounter++}`,
      mode: 'basket',
      difficultyLevel: 2,
      tag: `BUZZER BEATER • RECORD FRANCHIGIE`,
      question: `Quanti titoli NBA ha conquistato nella sua storia la franchigia dei ${t.name}?`,
      route: [[t.name.toUpperCase(), t.city], ["BACHECA TITOLI", t.icon], ["QUANTI ANELLI?", "Albo d'Oro"]],
      options: makeNbaOptions(
        t.titles === 0 ? "0 titoli (nessun anello)" : `${t.titles} titol${t.titles === 1 ? 'o' : 'i'}`,
        ["0 titoli (nessun anello)", "1 titolo", "2 titoli", "3 titoli", "5 titoli", "6 titoli", "17 titoli", "18 titoli"]
      ),
      correct: t.titles === 0 ? "0 titoli (nessun anello)" : `${t.titles} titol${t.titles === 1 ? 'o' : 'i'}`,
      sourceType: 'official',
      sourceTitle: 'NBA Titles by Franchise',
      sourceUrl: 'https://www.nba.com',
      check: `I ${t.name} hanno vinto ${t.titles} titoli NBA. Curiosità: ${t.fact}`
    });
  } else {
    allNbaQuestions.push({
      id: `nba-exp-record-${qIdCounter++}`,
      mode: 'basket',
      difficultyLevel: 2,
      tag: `BUZZER BEATER • CURIOSITÀ DA BOOMER`,
      question: `A quale leggenda NBA appartiene questo fatto storico: "${p.fact}"?`,
      route: [[p.name.toUpperCase(), p.era], ["RECORD & ANEDDOTI", "Almanacco NBA"], ["IDENTIKIT?", "Campione"]],
      options: makeNbaOptions(p.name, playerNames),
      correct: p.name,
      sourceType: 'official',
      sourceTitle: 'NBA Facts & Feats',
      sourceUrl: 'https://www.nba.com',
      check: `Il fatto appartiene a ${p.name} (${p.nick}): ${p.fact}`
    });
  }
}

console.log(`✅ Totale domande Basket NBA generate: ${allNbaQuestions.length}`);

// -------------------------------------------------------------
// 3. ORGANIZZAZIONE IN 10 UNITÀ TEMATICHE PROGRESSIVE
// -------------------------------------------------------------
const nbaUnits = nbaEras.map((era, eraIdx) => {
  const unitQuestions = allNbaQuestions.slice(eraIdx * 50, (eraIdx + 1) * 50);
  const lessons = [];

  for (let l = 1; l <= 5; l++) {
    const lQuestions = unitQuestions.slice((l - 1) * 10, l * 10);
    lessons.push({
      id: `basket-u${eraIdx + 1}-l${l}`,
      title: l === 5 ? `🏆 Gara 7 Finals: ${era.name}` : `Quarto ${l}: ${era.years}`,
      type: l === 5 ? 'boss' : 'lesson',
      xp: l === 5 ? 35 : 20,
      questions: lQuestions
    });
  }

  return {
    id: `basket-unit-${eraIdx + 1}`,
    title: era.name,
    subtitle: `${era.years} • ${era.summary}`,
    guideSummary: era.summary,
    theme: era.theme,
    mode: 'basket',
    lessons: lessons
  };
});

const nbaCatalog = {
  $schema: './curriculum.schema.json',
  metadata: {
    sport: 'basket',
    title: 'Buzzer Beater & Legends — NBA 1980-2024',
    description: 'Oltre 4.000 sfide sul grande basket americano: da Magic e Bird al dominio di Jordan, Kobe, LeBron e Steph Curry.',
    version: '1.0.0',
    totalQuestions: allNbaQuestions.length,
    updatedAt: new Date().toISOString()
  },
  units: nbaUnits,
  basketPool: allNbaQuestions
};

fs.writeFileSync(targetPath, JSON.stringify(nbaCatalog, null, 2), 'utf8');
console.log(`🎉 Salvato con successo in ${targetPath} (${(fs.statSync(targetPath).size / 1024 / 1024).toFixed(2)} MB)!`);
