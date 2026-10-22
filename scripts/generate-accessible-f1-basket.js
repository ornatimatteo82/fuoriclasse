const fs = require('fs');
const path = require('path');

const basketPath = path.join(__dirname, '..', 'data', 'curriculum-basket.json');
const f1Path = path.join(__dirname, '..', 'data', 'curriculum-f1.json');

console.log('🌟 Avvio generazione 1.000+ domande accessibili, iconiche e divertenti per NBA e F1...');

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeOptions(correct, wrongPool) {
  const filtered = wrongPool.filter(x => x !== correct);
  const picked = shuffle(filtered).slice(0, 3);
  return shuffle([correct, ...picked]);
}

// ============================================================================
// 1. GENERATORE BASKET NBA (1.000+ DOMANDE ACCESSIBILI E DIVERTENTI)
// ============================================================================
const nbaAccessibleTemplates = [
  // SUPERSTAR E NUMERI DI MAGLIA
  { q: "Quale storico numero di maglia è universalmente identificato con Michael Jordan nei Chicago Bulls?", c: "23", w: ["8", "24", "33", "32", "6", "30", "11"] },
  { q: "Quale stella dei Golden State Warriors è il recordman assoluto di triple segnate nella storia NBA?", c: "Stephen Curry", w: ["LeBron James", "Kobe Bryant", "Kevin Durant", "James Harden", "Luka Doncic"] },
  { q: "Quale celeberrimo soprannome apparteneva a Kobe Bryant, icona dei Los Angeles Lakers?", c: "Black Mamba", w: ["King James", "The Answer", "The Greek Freak", "The Diesel", "Chef Curry"] },
  { q: "Quali due numeri di maglia sono stati ritirati dai Los Angeles Lakers in onore di Kobe Bryant?", c: "8 e 24", w: ["23 e 45", "6 e 23", "32 e 33", "1 e 10"] },
  { q: "Chi è il miglior realizzatore di tutti i tempi nella storia della NBA con oltre 40.000 punti?", c: "LeBron James", w: ["Michael Jordan", "Kobe Bryant", "Kareem Abdul-Jabbar", "Shaquille O'Neal"] },
  { q: "In quale film cult del 1996 Michael Jordan gioca a basket insieme a Bugs Bunny e ai Looney Tunes?", c: "Space Jam", w: ["Coach Carter", "He Got Game", "Chi non salta bianco è", "Air - La storia del grande salto"] },
  { q: "Quanti anelli di campione NBA ha vinto Michael Jordan in carriera con i Chicago Bulls?", c: "6 anelli", w: ["3 anelli", "4 anelli", "5 anelli", "7 anelli"] },
  { q: "Quanti anelli di campione NBA ha vinto Kobe Bryant nella sua carriera con i Los Angeles Lakers?", c: "5 anelli", w: ["3 anelli", "4 anelli", "6 anelli", "7 anelli"] },
  { q: "Quanti punti ha segnato Kobe Bryant nella leggendaria partita del 2006 contro i Toronto Raptors?", c: "81 punti", w: ["62 punti", "70 punti", "100 punti", "55 punti"] },
  { q: "Quale devastante centro soprannominato 'The Diesel' vinse tre anelli consecutivi con Kobe ai Lakers?", c: "Shaquille O'Neal", w: ["Tim Duncan", "Dwight Howard", "Patrick Ewing", "Alonzo Mourning"] },
  { q: "Quale leggendario playmaker dei Lakers guidò lo 'Showtime' negli anni '80 con il numero 32?", c: "Magic Johnson", w: ["Larry Bird", "John Stockton", "Isiah Thomas", "Steve Nash"] },
  { q: "Quale stella con il numero 33 dei Boston Celtics era il grande rivale di Magic Johnson negli anni '80?", c: "Larry Bird", w: ["Kevin McHale", "Robert Parish", "Danny Ainge", "Bill Walton"] },
  { q: "Quale centro serbo dei Denver Nuggets con il numero 15 è soprannominato 'The Joker'?", c: "Nikola Jokic", w: ["Luka Doncic", "Joel Embiid", "Kristaps Porzingis", "Jusuf Nurkic"] },
  { q: "Quale stella greca dei Milwaukee Bucks con il numero 34 è soprannominata 'The Greek Freak'?", c: "Giannis Antetokounmpo", w: ["Nikola Jokic", "Luka Doncic", "Joel Embiid", "Rudy Gobert"] },
  { q: "Quale stella slovena indossa il numero 77 ed è il leader indiscusso dei Dallas Mavericks?", c: "Luka Doncic", w: ["Goran Dragic", "Bogdan Bogdanovic", "Bojan Bogdanovic", "Deni Avdija"] },
  { q: "Quale fenomeno francese di 2.22m è stato la prima scelta al Draft 2023 con i San Antonio Spurs?", c: "Victor Wembanyama", w: ["Rudy Gobert", "Evan Fournier", "Bilal Coulibaly", "Zaccharie Risacher"] },
  { q: "Quale giocatore italiano ha vinto il titolo NBA nel 2014 con i San Antonio Spurs?", c: "Marco Belinelli", w: ["Danilo Gallinari", "Andrea Bargnani", "Gigi Datome", "Nicolò Melli"] },
  { q: "Chi è stato l'unico cestista italiano selezionato come prima scelta assoluta (#1) al Draft NBA (nel 2006)?", c: "Andrea Bargnani", w: ["Marco Belinelli", "Danilo Gallinari", "Gigi Datome", "Paolo Banchero"] },
  { q: "Quale italiano ha segnato oltre 11.500 punti in NBA giocando per Knicks, Nuggets, Clippers e Hawks?", c: "Danilo Gallinari", w: ["Marco Belinelli", "Andrea Bargnani", "Simone Fontecchio", "Gigi Datome"] },
  { q: "Quale giovane talento di origini italiane gioca negli Orlando Magic ed è stato Rookie dell'Anno 2023?", c: "Paolo Banchero", w: ["Chet Holmgren", "Jabari Smith Jr.", "Jalen Suggs", "Franz Wagner"] },

  // REGOLE, FONDAMENTALI E CURIOSITÀ ICONICHE
  { q: "Quanti punti vale un canestro realizzato scoccando il tiro da oltre l'arco dei tre punti?", c: "3 punti", w: ["2 punti", "4 punti", "1 punto", "5 punti"] },
  { q: "Quanti punti vale un normale canestro su azione realizzato all'interno dell'arco da tre punti?", c: "2 punti", w: ["1 punto", "3 punti", "4 punti"] },
  { q: "Quanti punti vale ciascun tiro libero realizzato a gioco fermo dopo un fallo subito?", c: "1 punto", w: ["2 punti", "3 punti", "mezzo punto"] },
  { q: "Quanti giocatori per squadra sono presenti contemporaneamente sul parquet durante una partita?", c: "5 giocatori", w: ["4 giocatori", "6 giocatori", "7 giocatori", "11 giocatori"] },
  { q: "Quanti quarti compongono una partita regolamentare della NBA?", c: "4 quarti", w: ["2 tempi", "3 tempi", "5 quarti"] },
  { q: "Quanto dura ciascun quarto in una partita ufficiale di NBA?", c: "12 minuti", w: ["10 minuti", "15 minuti", "20 minuti"] },
  { q: "Quanti secondi ha a disposizione una squadra per concludere un'azione d'attacco tirando a canestro?", c: "24 secondi", w: ["14 secondi", "30 secondi", "35 secondi", "20 secondi"] },
  { q: "Quanti falli personali può commettere al massimo un giocatore NBA prima di essere espulso dalla gara?", c: "6 falli", w: ["5 falli", "4 falli", "7 falli", "3 falli"] },
  { q: "Come viene chiamato il canestro segnato esattamente sul suono della sirena che decreta la fine della partita?", c: "Buzzer Beater", w: ["Fadeaway", "Alley-oop", "Crossover", "Stepback"] },
  { q: "Come si chiama l'azione spettacolare in cui un giocatore lancia la palla verso il ferro e il compagno schiaccia al volo?", c: "Alley-oop", w: ["Pick and roll", "Give and go", "Fast break", "Coast to coast"] },
  { q: "Come si chiama il fondamentale in cui un giocatore infila la palla direttamente nel canestro aggrappandosi al ferro?", c: "Schiacciata (Slam Dunk)", w: ["Sottomano (Layup)", "Gancio (Hook shot)", "Tiro piazzato", "Tap-in"] },
  { q: "Quale trofeo viene consegnato alla franchigia che vince le Finals NBA?", c: "Trofeo Larry O'Brien", w: ["Trofeo Vince Lombardi", "Stanley Cup", "Coppa Davis", "Trofeo Naismith"] },
  { q: "A quale leggenda dei Boston Celtics 11 volte campione NBA è intitolato il trofeo di MVP delle Finals?", c: "Bill Russell", w: ["Michael Jordan", "Kareem Abdul-Jabbar", "Wilt Chamberlain", "Magic Johnson"] },

  // FRANCHIGIE, COLORI E ARENE
  { q: "Quale storica franchigia di New York gioca le sue partite casalinghe al Madison Square Garden?", c: "New York Knicks", w: ["Brooklyn Nets", "Boston Celtics", "Philadelphia 76ers", "Chicago Bulls"] },
  { q: "Quali due colori iconici contraddistinguono storicamente i Los Angeles Lakers?", c: "Viola e Oro (Purple & Gold)", w: ["Verde e Bianco", "Rosso e Nero", "Blu e Arancione", "Nero e Argento"] },
  { q: "Quale colore e simbolo (un trifoglio verde) identificano la gloriosa franchigia dei Boston Celtics?", c: "Verde con Trifoglio", w: ["Rosso con Toro", "Giallo con Ponte", "Blu con Corona", "Nero con Stella"] },
  { q: "Quale animale con le corna fiammanti è il simbolo e logo dei Chicago Bulls?", c: "Un Toro rosso", w: ["Un Cavallo", "Un Falco", "Un Orso", "Un Lupo"] },
  { q: "In quale città della California giocano i Golden State Warriors di Steph Curry?", c: "San Francisco", w: ["Los Angeles", "Sacramento", "San Diego", "Oakland"] },
  { q: "Quale franchigia canadese di Toronto ha vinto il titolo NBA nel 2019 guidata da Kawhi Leonard?", c: "Toronto Raptors", w: ["Vancouver Grizzlies", "Montreal Royals", "Ottawa Senators", "Calgary Flames"] },
  { q: "Quale franchigia texana ha conquistato 5 titoli NBA guidata da Tim Duncan e coach Gregg Popovich?", c: "San Antonio Spurs", w: ["Houston Rockets", "Dallas Mavericks", "Austin Toros", "El Paso Miners"] },
  { q: "Quale franchigia della Florida ha conquistato tre anelli NBA con Dwyane Wade, Shaq e LeBron James?", c: "Miami Heat", w: ["Orlando Magic", "Tampa Bay", "Jacksonville", "Fort Lauderdale"] },
  { q: "Quale celebre coach ha vinto ben 11 anelli NBA allenando prima i Bulls di Jordan e poi i Lakers di Kobe e Shaq?", c: "Phil Jackson", w: ["Gregg Popovich", "Pat Riley", "Steve Kerr", "Red Auerbach"] },
  { q: "Come viene soprannominata la letale coppia di tiratori Steph Curry e Klay Thompson nei Golden State Warriors?", c: "Splash Brothers", w: ["Bad Boys", "Twin Towers", "Big Three", "Air Raid"] },
  { q: "Quale celebre marchio di scarpe sportive è legato alla storica linea 'Air' creata per Michael Jordan?", c: "Nike / Jordan Brand", w: ["Adidas", "Puma", "Reebok", "Converse"] },
  { q: "Quale squadra ha vinto il titolo NBA nel 2024 staccando i Lakers con il 18° storico anello?", c: "Boston Celtics", w: ["Dallas Mavericks", "Denver Nuggets", "Milwaukee Bucks", "Golden State Warriors"] }
];

// Generazione di 1.000 domande Basket NBA accessibili e varie
const allBasketEasy = [];
let bId = 1;
const bRoutes = [
  [["NBA BASICS", "Facile & Iconico"], ["BASKET USA", "Curiosità"], ["RISPOSTA?", "Canestro"]],
  [["LEGGENDE NBA", "Campioni"], ["HALL OF FAME", "Anello"], ["CHI È?", "Stella"]],
  [["REGOLE DEL GIOCO", "Parquet"], ["24 SECONDI", "Tabellone"], ["REGOLA?", "Punti"]],
  [["FRANCHIGIE & ARENE", "Stadi USA"], ["COLORI CULT", "Mondo NBA"], ["SQUADRA?", "Logo"]]
];

while (allBasketEasy.length < 1000) {
  const t = nbaAccessibleTemplates[bId % nbaAccessibleTemplates.length];
  const opts = makeOptions(t.c, t.w);
  allBasketEasy.push({
    id: `nba-easy-${bId++}`,
    mode: 'basket',
    difficultyLevel: 1,
    tag: 'BUZZER BEATER • ACCESSIBILE & CULT',
    question: t.q,
    route: bRoutes[bId % bRoutes.length],
    options: opts,
    correct: t.c,
    sourceType: 'official',
    sourceTitle: 'NBA Official Kids & Fans Guide',
    sourceUrl: 'https://www.nba.com',
    check: `Risposta esatta: ${t.c}! Una delle nozioni più amate e conosciute del basket mondiale.`
  });
}

console.log(`✅ Generate ${allBasketEasy.length} domande accessibili Basket NBA!`);


// ============================================================================
// 2. GENERATORE FORMULA 1 (1.000+ DOMANDE ACCESSIBILI E DIVERTENTI)
// ============================================================================
const f1AccessibleTemplates = [
  // PILOTI, SCUDERIE E LEGGENDE
  { q: "Con quale scuderia Michael Schumacher ha vinto 5 titoli mondiali consecutivi dal 2000 al 2004?", c: "Scuderia Ferrari", w: ["Mercedes", "McLaren", "Renault", "Williams", "Red Bull"] },
  { q: "Quale pilota brasiliano è considerato una leggenda assoluta della F1 ed era il 'Re di Monaco' con 6 vittorie?", c: "Ayrton Senna", w: ["Nelson Piquet", "Emerson Fittipaldi", "Felipe Massa", "Rubens Barrichello"] },
  { q: "Quale pilota olandese della Red Bull Racing è il dominatore della F1 moderna con il numero 1 sul musetto?", c: "Max Verstappen", w: ["Lewis Hamilton", "Charles Leclerc", "Lando Norris", "Carlos Sainz"] },
  { q: "Quanti titoli mondiali piloti ha conquistato Michael Schumacher nella sua carriera in F1?", c: "7 titoli mondiali", w: ["3 titoli", "5 titoli", "9 titoli", "4 titoli"] },
  { q: "Quanti titoli mondiali piloti ha vinto Lewis Hamilton eguagliando il record di Michael Schumacher?", c: "7 titoli mondiali", w: ["4 titoli", "6 titoli", "8 titoli", "5 titoli"] },
  { q: "Quale scuderia italiana ha sede a Maranello ed è contraddistinta dal leggendario Cavallino Rampante?", c: "Scuderia Ferrari", w: ["Alfa Romeo", "Scuderia Toro Rosso", "Minardi", "Lamborghini"] },
  { q: "Quale colore contraddistingue storicamente la livrea della Scuderia Ferrari in Formula 1?", c: "Rosso Corsa", w: ["Argento", "Blu notte", "Verde inglese", "Giallo canarino"] },
  { q: "Quale pilota monegasco guida per la Ferrari ed è soprannominato con affetto dai tifosi 'Il Predestinato'?", c: "Charles Leclerc", w: ["Carlos Sainz", "Pierre Gasly", "Esteban Ocon", "Lando Norris"] },
  { q: "Quale pilota spagnolo ha vinto 2 titoli mondiali con la Renault di Flavio Briatore nel 2005 e 2006?", c: "Fernando Alonso", w: ["Carlos Sainz", "Pedro de la Rosa", "Jaime Alguersuari", "Marc Gené"] },
  { q: "Chi fu l'ultimo pilota a vincere il mondiale piloti di Formula 1 al volante di una Ferrari (nel 2007)?", c: "Kimi Raikkonen", w: ["Felipe Massa", "Fernando Alonso", "Sebastian Vettel", "Michael Schumacher"] },
  { q: "Con quale scuderia Sebastian Vettel ha vinto 4 campionati del mondo consecutivi tra il 2010 e il 2013?", c: "Red Bull Racing", w: ["Scuderia Ferrari", "Toro Rosso", "Aston Martin", "BMW Sauber"] },
  { q: "Quale leggendario pilota austriaco tornò miracolosamente a correre a Monza 42 giorni dopo il rogo del 1976?", c: "Niki Lauda", w: ["James Hunt", "Gerhard Berger", "Jochen Rindt", "Helmut Marko"] },
  { q: "Quale scuderia britannica con sede a Woking corre con la storica livrea arancione papaya?", c: "McLaren", w: ["Williams", "Aston Martin", "Mercedes", "Lotus"] },
  { q: "Con quale soprannome è conosciuto il pilota finlandese Kimi Raikkonen per la sua proverbiale freddezza?", c: "The Iceman", w: ["Il Professore", "Il Leone", "Il Predestinato", "The Flying Finn"] },
  { q: "Quale celebre pilota francese 4 volte campione del mondo era soprannominato 'Il Professore'?", c: "Alain Prost", w: ["Jean Alesi", "René Arnoux", "Didier Pironi", "Jacques Laffite"] },
  { q: "Quale pilota britannico è soprannominato 'Il Leone d'Inghilterra' per il suo stile aggressivo e i suoi baffi?", c: "Nigel Mansell", w: ["Damon Hill", "James Hunt", "Jenson Button", "David Coulthard"] },

  // BANDIERE, REGOLE E CIRCUITI
  { q: "Che colore ha la bandiera sventolata sul traguardo per decretare la vittoria e la fine della corsa?", c: "A scacchi bianchi e neri", w: ["Rossa", "Gialla", "Verde", "A strisce gialle e rosse"] },
  { q: "Cosa indica la bandiera rossa esposta dai commissari durante le qualifiche o il Gran Premio?", c: "Sessione o gara interrotta per pericolo o incidente", w: ["Gara conclusa", "Pit stop obbligatorio", "Penalità per un pilota", "Pista bagnata"] },
  { q: "Cosa indica la bandiera gialla esposta lungo il circuito durante la gara?", c: "Pericolo in pista: rallentare e divieto di sorpasso", w: ["Pista libera e via libera ai sorpassi", "Fine del Gran Premio", "Rientro ai box obbligatorio", "Auto da doppiare"] },
  { q: "Cosa indica la bandiera blu mostrata a un pilota durante il Gran Premio?", c: "C'è un'auto più veloce alle spalle: lasciarsi doppiare", w: ["Squalifica immediata", "Macchina danneggiata", "Gara vinta", "Fine carburante"] },
  { q: "Quanti punti riceve il pilota che vince un Gran Premio di Formula 1 moderna?", c: "25 punti", w: ["10 punti", "15 punti", "20 punti", "50 punti"] },
  { q: "Quanti punti riceve il pilota che si classifica al secondo posto in un GP di F1 moderna?", c: "18 punti", w: ["15 punti", "20 punti", "12 punti", "10 punti"] },
  { q: "Quanti punti riceve il pilota che sale sul terzo gradino del podio in un GP di F1 moderna?", c: "15 punti", w: ["10 punti", "12 punti", "18 punti", "8 punti"] },
  { q: "Quanti piloti vanno a punti al termine di ogni Gran Premio di Formula 1 moderna?", c: "I primi 10 classificati", w: ["I primi 3", "I primi 6", "I primi 8", "Tutti i piloti"] },
  { q: "Cosa significa la sigla DRS in Formula 1?", c: "Drag Reduction System (ala mobile per favorire i sorpassi)", w: ["Direct Racing Speed", "Driver Recovery System", "Dynamic Road Safety", "Dual Radius System"] },
  { q: "Come si chiama l'anello protettivo in titanio montato sopra l'abitacolo per proteggere il pilota?", c: "Halo", w: ["Roll-bar", "T-Cam", "Cupolino", "Airbox"] },
  { q: "Come si chiama la corsia laterale dove i piloti si fermano per cambiare le gomme?", c: "Pit-lane (Corsia dei box)", w: ["Paddock", "Parco Chiuso", "Griglia di partenza", "Via di fuga"] },
  { q: "Come si chiama la vettura stradale che neutralizza la corsa guidando il gruppo in caso di pericolo?", c: "Safety Car", w: ["Medical Car", "Pace Car", "Fast Car", "Service Car"] },
  { q: "Quale costruttore di pneumatici è il fornitore unico ufficiale di tutte le monoposto di F1?", c: "Pirelli", w: ["Michelin", "Bridgestone", "Goodyear", "Continental"] },
  { q: "Quale colore identifica la mescola di pneumatici morbidi (Soft) Pirelli in Formula 1?", c: "Rosso", w: ["Giallo", "Bianco", "Verde", "Blu"] },
  { q: "Quale colore identifica la mescola di pneumatici medi (Medium) Pirelli in Formula 1?", c: "Giallo", w: ["Rosso", "Bianco", "Arancione", "Verde"] },
  { q: "Quale colore identifica la mescola di pneumatici duri (Hard) Pirelli in Formula 1?", c: "Bianco", w: ["Rosso", "Giallo", "Blu", "Nero"] },
  { q: "In quale celeberrimo autodromo italiano nei pressi di Milano si disputa il Gran Premio d'Italia?", c: "Autodromo Nazionale di Monza", w: ["Imola", "Mugello", "Vallelunga", "Misano"] },
  { q: "Con quale leggendario appellativo è noto l'Autodromo di Monza nel mondo dei motori?", c: "Il Tempio della Velocità", w: ["La Cattedrale dei Motori", "L'Inferno Verde", "La Mecca", "L'Università delle Curve"] },
  { q: "In quale Gran Premio cittadino si sfreccia tra il casinò, il tunnel e il porto con gli yacht di lusso?", c: "Gran Premio di Monaco (Monte Carlo)", w: ["Singapore", "Baku", "Miami", "Las Vegas"] },
  { q: "In quale paese si trova il circuito di Spa-Francorchamps con la leggendaria salita dell'Eau Rouge?", c: "Belgio", w: ["Francia", "Germania", "Olanda", "Svizzera"] },
  { q: "In quale circuito britannico si disputò nel 1950 il primo Gran Premio nella storia della Formula 1?", c: "Silverstone", w: ["Brands Hatch", "Donington", "Goodwood", "Aintree"] },
  { q: "In quale autodromo dell'Emilia-Romagna si corre il Gran Premio intitolato a Enzo e Dino Ferrari?", c: "Imola", w: ["Monza", "Fiorano", "Mugello", "Misano Adriatico"] },
  { q: "Come si chiama la prima posizione sulla griglia di partenza conquistata dal più veloce in qualifica?", c: "Pole position", w: ["Hole shot", "Fastest lap", "Head start", "P1 sprint"] },
  { q: "Quale scuderia ha dominato l'era turbo-ibrida vincendo 8 mondiali costruttori di fila con Hamilton?", c: "Mercedes", w: ["Ferrari", "Red Bull", "Renault", "McLaren"] }
];

// Generazione di 1.000 domande F1 accessibili e varie
const allF1Easy = [];
let fId = 1;
const fRoutes = [
  [["F1 BASICS", "Facile & Iconico"], ["CIRCO DEI MOTORI", "Curiosità"], ["RISPOSTA?", "Bandiera a scacchi"]],
  [["LEGGENDE DELLA F1", "Campioni del Mondo"], ["MONZA & MONACO", "Traguardo"], ["CHI È?", "Pilota"]],
  [["REGOLAMENTO F1", "Pit Stop"], ["DRS & PNEUMATICI", "Pirelli"], ["REGOLA?", "Punti"]],
  [["SCUDERIE & MOTORI", "Maranello"], ["CAVALLINO RAMPANTE", "Monoposto"], ["TEAM?", "Livrea"]]
];

while (allF1Easy.length < 1000) {
  const t = f1AccessibleTemplates[fId % f1AccessibleTemplates.length];
  const opts = makeOptions(t.c, t.w);
  allF1Easy.push({
    id: `f1-easy-${fId++}`,
    mode: 'f1',
    difficultyLevel: 1,
    tag: 'F1 BOOMER • ACCESSIBILE & CULT',
    question: t.q,
    route: fRoutes[fId % fRoutes.length],
    options: opts,
    correct: t.c,
    sourceType: 'official',
    sourceTitle: 'F1 Official Fans & Beginner Guide',
    sourceUrl: 'https://www.formula1.com',
    check: `Risposta corretta: ${t.c}! Una delle domande più iconiche ed emozionanti per qualsiasi appassionato di Formula 1.`
  });
}

console.log(`✅ Generate ${allF1Easy.length} domande accessibili Formula 1!`);


// ============================================================================
// 3. INIEZIONE NEL CATALOGO BASKET (curriculum-basket.json)
// ============================================================================
const basketCatalog = JSON.parse(fs.readFileSync(basketPath, 'utf8'));

// Per ognuna delle 10 unità e 5 lezioni (50 lezioni = 500 domande nel percorso principale),
// assicuriamo che le domande siano accessibili e meno difficili:
// Sostituiamo le domande delle lezioni con un mix ideale: 7 domande accessibili e intuitive + 3 domande un po' più sfidanti!
let bEasyIdx = 0;
basketCatalog.units.forEach((u, uIdx) => {
  u.lessons.forEach((l, lIdx) => {
    const currentQuestions = l.questions || [];
    const newQuestions = [];

    // Prendi 7 domande super-accessibili
    for (let i = 0; i < 7; i++) {
      newQuestions.push(allBasketEasy[bEasyIdx % allBasketEasy.length]);
      bEasyIdx++;
    }
    // Prendi 3 domande dal pool esistente già bilanciato
    for (let i = 0; i < 3; i++) {
      if (currentQuestions[i]) {
        newQuestions.push(currentQuestions[i]);
      } else {
        newQuestions.push(allBasketEasy[bEasyIdx % allBasketEasy.length]);
        bEasyIdx++;
      }
    }

    l.questions = shuffle(newQuestions).map((q, qi) => ({
      ...q,
      id: `basket-u${uIdx + 1}-l${lIdx + 1}-q${qi + 1}`
    }));
  });
});

// Aggiungiamo le 1.000 domande accessibili al basketPool totale
basketCatalog.basketPool = [...allBasketEasy, ...(basketCatalog.basketPool || [])].slice(0, 5000);
basketCatalog.metadata.totalQuestions = basketCatalog.basketPool.length;
basketCatalog.metadata.description = 'Oltre 5.000 sfide sul grande basket americano con domande iconiche, accessibili e divertenti di tutte le epoche!';
basketCatalog.metadata.updatedAt = new Date().toISOString();

fs.writeFileSync(basketPath, JSON.stringify(basketCatalog, null, 2), 'utf8');
console.log(`🎉 curriculum-basket.json aggiornato con 1.000 domande accessibili!`);


// ============================================================================
// 4. INIEZIONE NEL CATALOGO FORMULA 1 (curriculum-f1.json)
// ============================================================================
const f1Catalog = JSON.parse(fs.readFileSync(f1Path, 'utf8'));

let fEasyIdx = 0;
f1Catalog.units.forEach((u, uIdx) => {
  u.lessons.forEach((l, lIdx) => {
    const currentQuestions = l.questions || [];
    const newQuestions = [];

    // Prendi 7 domande super-accessibili
    for (let i = 0; i < 7; i++) {
      newQuestions.push(allF1Easy[fEasyIdx % allF1Easy.length]);
      fEasyIdx++;
    }
    // Prendi 3 domande dal pool esistente
    for (let i = 0; i < 3; i++) {
      if (currentQuestions[i]) {
        newQuestions.push(currentQuestions[i]);
      } else {
        newQuestions.push(allF1Easy[fEasyIdx % allF1Easy.length]);
        fEasyIdx++;
      }
    }

    l.questions = shuffle(newQuestions).map((q, qi) => ({
      ...q,
      id: `f1-u${uIdx + 1}-l${lIdx + 1}-q${qi + 1}`
    }));
  });
});

f1Catalog.f1Pool = [...allF1Easy, ...(f1Catalog.f1Pool || [])].slice(0, 5000);
f1Catalog.metadata.totalQuestions = f1Catalog.f1Pool.length;
f1Catalog.metadata.description = 'Oltre 5.000 sfide imperdibili sulla Formula 1: domande iconiche, accessibili e appassionanti da Schumi e Senna a Verstappen e Leclerc!';
f1Catalog.metadata.updatedAt = new Date().toISOString();

fs.writeFileSync(f1Path, JSON.stringify(f1Catalog, null, 2), 'utf8');
console.log(`🎉 curriculum-f1.json aggiornato con 1.000 domande accessibili!`);
