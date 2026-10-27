// Script per arricchire TUTTE le sezioni (Calcio Gael, Quizzone, Pastore, F1, Basket NBA)
// con centinaia di nuove domande verificate con focus sul decennio 2015-2026 + minificazione JSON per massima fluidità.

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

// ============================================================================
// 1. NUOVE SFIDE CALCIO 2015-2026 (GAEL LEAGUE, QUIZZONE, PASTORE LEAGUE)
// ============================================================================

const GAEL_2015_2026_PLAYERS = [
  {
    id: 'gael-2026-lautaro',
    mode: 'gael',
    era2015_2026: true,
    difficultyLevel: 2,
    isPro: false,
    era: '2015 - 2026',
    name: 'Lautaro Martínez',
    number: 10,
    clubs: [
      ['Racing Club', 'RAC', 'argentina', 2015],
      ['Inter', 'INT', 'inter', 2018]
    ],
    hint: 'El Toro di Bahía Blanca: capitano della Seconda Stella nerazzurra, capocannoniere Serie A 2023/24 e campione del mondo 2022.',
    options: ['Lautaro Martínez', 'Mauro Icardi', 'Julián Álvarez', 'Paulo Dybala'],
    correct: 'Lautaro Martínez',
    check: 'Lautaro Martínez è approdato all\'Inter dal Racing nel 2018 diventando capitano, simbolo della Seconda Stella (2024) e re dei bomber.'
  },
  {
    id: 'gael-2026-barella',
    mode: 'gael',
    era2015_2026: true,
    difficultyLevel: 2,
    isPro: false,
    era: '2015 - 2026',
    name: 'Nicolò Barella',
    number: 23,
    clubs: [
      ['Cagliari', 'CAG', 'cagliari', 2015],
      ['Como', 'COM', 'como', 2016],
      ['Cagliari', 'CAG', 'cagliari', 2016],
      ['Inter', 'INT', 'inter', 2019]
    ],
    hint: 'Tuttocampista sardo campione d\'Europa a Wembley 2021 e pilastro del centrocampo dell\'Inter scudettata nel 2021 e 2024.',
    options: ['Nicolò Barella', 'Sandro Tonali', 'Davide Frattesi', 'Lorenzo Pellegrini'],
    correct: 'Nicolò Barella',
    check: 'Cresciuto nel Cagliari (con sei mesi a Como nel 2016), Barella è diventato all\'Inter uno dei migliori centrocampisti d\'Europa.'
  },
  {
    id: 'gael-2026-leao',
    mode: 'gael',
    era2015_2026: true,
    difficultyLevel: 2,
    isPro: false,
    era: '2015 - 2026',
    name: 'Rafael Leão',
    number: 10,
    clubs: [
      ['Sporting CP', 'SCP', 'sporting', 2017],
      ['Lille', 'LIL', 'lille', 2018],
      ['Milan', 'MIL', 'milan', 2019]
    ],
    hint: 'Ala portoghese devastante in progressione: MVP della Serie A 2021/22 nello Scudetto del Milan di Pioli e vincitore della Supercoppa 2025.',
    options: ['Rafael Leão', 'João Félix', 'Francisco Conceição', 'Pedro Neto'],
    correct: 'Rafael Leão',
    check: 'Rafael Leão è arrivato al Milan dal Lille nell\'estate 2019, trascinando i rossoneri allo Scudetto 2022 da MVP del campionato.'
  },
  {
    id: 'gael-2026-osimhen',
    mode: 'gael',
    era2015_2026: true,
    difficultyLevel: 3,
    isPro: false,
    era: '2015 - 2026',
    name: 'Victor Osimhen',
    number: 9,
    clubs: [
      ['Wolfsburg', 'WOB', 'wolfsburg', 2017],
      ['Charleroi', 'CHA', 'juve', 2018],
      ['Lille', 'LIL', 'lille', 2019],
      ['Napoli', 'NAP', 'napoli', 2020],
      ['Galatasaray', 'GAL', 'roma', 2024]
    ],
    hint: 'Centravanti mascherato nigeriano: capocannoniere con 26 reti nel storico terzo Scudetto del Napoli (2022/23).',
    options: ['Victor Osimhen', 'Ademola Lookman', 'Romelu Lukaku', 'Tammy Abraham'],
    correct: 'Victor Osimhen',
    check: 'Victor Osimhen ha vinto la classifica marcatori di Serie A 2022/23 con 26 gol riportando lo Scudetto a Napoli dopo 33 anni.'
  },
  {
    id: 'gael-2026-kvara',
    mode: 'gael',
    era2015_2026: true,
    difficultyLevel: 3,
    isPro: false,
    era: '2015 - 2026',
    name: 'Khvicha Kvaratskhelia',
    number: 77,
    clubs: [
      ['Dinamo Tbilisi', 'DTB', 'lazio', 2017],
      ['Rubin Kazan', 'RUB', 'torino', 2019],
      ['Dinamo Batumi', 'DBA', 'samp', 2022],
      ['Napoli', 'NAP', 'napoli', 2022],
      ['Paris Saint-Germain', 'PSG', 'psg', 2025]
    ],
    hint: 'Fantasia georgiana con la maglia #77: MVP della Serie A 2022/23 al suo primo anno a Napoli prima del passaggio al PSG.',
    options: ['Khvicha Kvaratskhelia', 'Hakan Çalhanoğlu', 'Paulo Dybala', 'Kenan Yıldız'],
    correct: 'Khvicha Kvaratskhelia',
    check: 'Soprannominato "Kvaradona", ha incantato la Serie A dal 2022 vincendo il premio di MVP del campionato 2022/23.'
  },
  {
    id: 'gael-2026-lookman',
    mode: 'gael',
    era2015_2026: true,
    difficultyLevel: 4,
    isPro: false,
    era: '2015 - 2026',
    name: 'Ademola Lookman',
    number: 11,
    clubs: [
      ['Everton', 'EVE', 'napoli', 2017],
      ['RB Lipsia', 'RBL', 'bari', 2018],
      ['Fulham', 'FUL', 'juve', 2020],
      ['Leicester City', 'LEI', 'lazio', 2021],
      ['Atalanta', 'ATA', 'atalanta', 2022]
    ],
    hint: 'Autore della leggendaria tripletta nella finale di Europa League 2024 a Dublino contro il Bayer Leverkusen e Pallone d\'Oro Africano.',
    options: ['Ademola Lookman', 'Victor Boniface', 'Jeremie Boga', 'Luis Muriel'],
    correct: 'Ademola Lookman',
    check: 'Ademola Lookman ha scritto la storia il 22 maggio 2024 segnando 3 gol nella finale di Europa League vinta 3-0 dall\'Atalanta.'
  },
  {
    id: 'gael-2026-calhanoglu',
    mode: 'gael',
    era2015_2026: true,
    difficultyLevel: 3,
    isPro: false,
    era: '2015 - 2026',
    name: 'Hakan Çalhanoğlu',
    number: 20,
    clubs: [
      ['Amburgo', 'HSV', 'samp', 2013],
      ['Bayer Leverkusen', 'B04', 'milan', 2014],
      ['Milan', 'MIL', 'milan', 2017],
      ['Inter', 'INT', 'inter', 2021]
    ],
    hint: 'Regista turco infallibile dal dischetto: passato a parametro zero da una sponda all\'altra del Naviglio nell\'estate 2021.',
    options: ['Hakan Çalhanoğlu', 'Henrikh Mkhitaryan', 'Marcelo Brozović', 'Piotr Zieliński'],
    correct: 'Hakan Çalhanoğlu',
    check: 'Dopo 4 stagioni al Milan (2017-2021), Çalhanoğlu è passato all\'Inter diventando uno dei migliori registi del mondo e vincendo la Seconda Stella.'
  },
  {
    id: 'gael-2026-dybala',
    mode: 'gael',
    era2015_2026: true,
    difficultyLevel: 2,
    isPro: false,
    era: '2015 - 2026',
    name: 'Paulo Dybala',
    number: 21,
    clubs: [
      ['Instituto', 'INS', 'bari', 2011],
      ['Palermo', 'PAL', 'palermo', 2012],
      ['Juventus', 'JUV', 'juve', 2015],
      ['Roma', 'ROM', 'roma', 2022]
    ],
    hint: 'La Joya argentina: 5 Scudetti con la Juventus (2015-2020) prima dell\'accoglienza imperiale al Colosseo della Civiltà Italiana con la Roma.',
    options: ['Paulo Dybala', 'Matías Soulé', 'Leandro Paredes', 'Ángel Di María'],
    correct: 'Paulo Dybala',
    check: 'Paulo Dybala ha segnato oltre 125 gol in Serie A tra Palermo, Juventus e Roma, laureandosi anche Campione del Mondo nel 2022.'
  },
  {
    id: 'gael-2026-thuram',
    mode: 'gael',
    era2015_2026: true,
    difficultyLevel: 3,
    isPro: false,
    era: '2015 - 2026',
    name: 'Marcus Thuram',
    number: 9,
    clubs: [
      ['Sochaux', 'SOC', 'parma', 2015],
      ['Guingamp', 'EAG', 'milan', 2017],
      ['Borussia M\'gladbach', 'BMG', 'juve', 2019],
      ['Inter', 'INT', 'inter', 2023]
    ],
    hint: 'Figlio d\'arte nato a Parma nel 1997: gemello del gol di Lautaro e a segno nel derby della Seconda Stella del 22 aprile 2024.',
    options: ['Marcus Thuram', 'Khéphren Thuram', 'Randal Kolo Muani', 'Olivier Giroud'],
    correct: 'Marcus Thuram',
    check: 'Arrivato a parametro zero dal Borussia Mönchengladbach nel 2023, Marcus Thuram è stato decisivo per lo Scudetto della Seconda Stella dell\'Inter.'
  },
  {
    id: 'gael-2026-tonali',
    mode: 'gael',
    era2015_2026: true,
    difficultyLevel: 3,
    isPro: false,
    era: '2015 - 2026',
    name: 'Sandro Tonali',
    number: 8,
    clubs: [
      ['Brescia', 'BRE', 'brescia', 2017],
      ['Milan', 'MIL', 'milan', 2020],
      ['Newcastle Utd', 'NEW', 'juve', 2023]
    ],
    hint: 'Centrocampista lodigiano esploso a Brescia: autore dei gol scudetto con Lazio e Verona nel 2022 prima del record di cessione in Premier League.',
    options: ['Sandro Tonali', 'Manuel Locatelli', 'Samuele Ricci', 'Bryan Cristante'],
    correct: 'Sandro Tonali',
    check: 'Sandro Tonali è stato l\'anima del Milan campione d\'Italia 2021/22 prima del trasferimento al Newcastle United nell\'estate 2023.'
  },
  {
    id: 'gael-2026-mctominay',
    mode: 'gael',
    era2015_2026: true,
    difficultyLevel: 3,
    isPro: false,
    era: '2015 - 2026',
    name: 'Scott McTominay',
    number: 8,
    clubs: [
      ['Manchester United', 'MUN', 'milan', 2017],
      ['Napoli', 'NAP', 'napoli', 2024]
    ],
    hint: 'Incursore scozzese cresciuto ad Old Trafford e diventato subito idolo assoluto del Maradona nel Napoli di Antonio Conte (2024-2026).',
    options: ['Scott McTominay', 'Billy Gilmour', 'Lewis Ferguson', 'Che Adams'],
    correct: 'Scott McTominay',
    check: 'Approdato a Napoli dal Manchester United nell\'agosto 2024, Scott McTominay ha conquistato la Serie A a suon di gol e inserimenti.'
  },
  {
    id: 'gael-2026-pulisic',
    mode: 'gael',
    era2015_2026: true,
    difficultyLevel: 3,
    isPro: false,
    era: '2015 - 2026',
    name: 'Christian Pulisic',
    number: 11,
    clubs: [
      ['Borussia Dortmund', 'BVB', 'parma', 2016],
      ['Chelsea', 'CHE', 'napoli', 2019],
      ['Milan', 'MIL', 'milan', 2023]
    ],
    hint: 'Captain America: vincitore della Champions 2021 col Chelsea e leader tecnico e realizzativo del Milan dal 2023.',
    options: ['Christian Pulisic', 'Weston McKennie', 'Timothy Weah', 'Yunus Musah'],
    correct: 'Christian Pulisic',
    check: 'Christian Pulisic ha superato la doppia cifra di gol e assist fin dalla sua prima stagione in rossonero (2023/24) vincendo anche la Supercoppa 2025.'
  },
  {
    id: 'gael-2026-zirkzee',
    mode: 'gael',
    era2015_2026: true,
    difficultyLevel: 5,
    isPro: false,
    era: '2015 - 2026',
    name: 'Joshua Zirkzee',
    number: 9,
    clubs: [
      ['Bayern Monaco', 'BAY', 'roma', 2019],
      ['Parma', 'PAR', 'parma', 2021],
      ['Anderlecht', 'AND', 'fiorentina', 2021],
      ['Bologna', 'BOL', 'bologna', 2022],
      ['Manchester United', 'MUN', 'milan', 2024]
    ],
    hint: 'Regista offensivo olandese: ha trascinato il Bologna di Thiago Motta alla storica qualificazione in Champions League 2023/24.',
    options: ['Joshua Zirkzee', 'Thijs Dallinga', 'Santiago Castro', 'Teun Koopmeiners'],
    correct: 'Joshua Zirkzee',
    check: 'Dopo una breve parentesi a Parma nel 2021, Zirkzee è esploso a Bologna nel 2023/24 riportando i rossoblù in Champions dopo 60 anni.'
  },
  {
    id: 'gael-2026-koopmeiners',
    mode: 'gael',
    era2015_2026: true,
    difficultyLevel: 4,
    isPro: false,
    era: '2015 - 2026',
    name: 'Teun Koopmeiners',
    number: 8,
    clubs: [
      ['AZ Alkmaar', 'AZ', 'roma', 2017],
      ['Atalanta', 'ATA', 'atalanta', 2021],
      ['Juventus', 'JUV', 'juve', 2024]
    ],
    hint: 'Trequartista mancino olandese: trionfatore in Europa League con l\'Atalanta nel 2024 prima del trasferimento record alla Juventus.',
    options: ['Teun Koopmeiners', 'Marten de Roon', 'Tijjani Reijnders', 'Denzel Dumfries'],
    correct: 'Teun Koopmeiners',
    check: 'Koopmeiners ha segnato 29 gol in tre stagioni con l\'Atalanta vincendo l\'Europa League 2024 prima di vestire la maglia #8 della Juventus.'
  },
  {
    id: 'gael-2026-retegui',
    mode: 'gael',
    era2015_2026: true,
    difficultyLevel: 4,
    isPro: false,
    era: '2015 - 2026',
    name: 'Mateo Retegui',
    number: 32,
    clubs: [
      ['Boca Juniors', 'BOC', 'parma', 2018],
      ['Tigre', 'TIG', 'samp', 2022],
      ['Genoa', 'GEN', 'genoa', 2023],
      ['Atalanta', 'ATA', 'atalanta', 2024]
    ],
    hint: 'Bomber italo-argentino della Nazionale: portato in Italia dal Genoa nel 2023 ed esploso a suon di valanghe di reti con l\'Atalanta di Gasperini.',
    options: ['Mateo Retegui', 'Gianluca Scamacca', 'Lucas Beltrán', 'Valentín Castellanos'],
    correct: 'Mateo Retegui',
    check: 'Mateo Retegui è diventato una macchina da gol all\'Atalanta nella stagione 2024/25 dominando la classifica cannonieri di Serie A.'
  },
  {
    id: 'gael-2026-calafiori',
    mode: 'gael',
    era2015_2026: true,
    difficultyLevel: 5,
    isPro: false,
    era: '2015 - 2026',
    name: 'Riccardo Calafiori',
    number: 33,
    clubs: [
      ['Roma', 'ROM', 'roma', 2020],
      ['Genoa', 'GEN', 'genoa', 2022],
      ['Basilea', 'FCB', 'bologna', 2022],
      ['Bologna', 'BOL', 'bologna', 2023],
      ['Arsenal', 'ARS', 'milan', 2024]
    ],
    hint: 'Difensore centrale moderno dalla chioma fluente: protagonista a Euro 2024 (assist a Zaccagni con la Croazia) e pilastro del Bologna da Champions.',
    options: ['Riccardo Calafiori', 'Alessandro Bastoni', 'Alessandro Buongiorno', 'Giorgio Scalvini'],
    correct: 'Riccardo Calafiori',
    check: 'Trasformato in centrale da Thiago Motta a Bologna nel 2023/24, Calafiori si è trasferito all\'Arsenal dopo un grande Europeo 2024.'
  },
  {
    id: 'gael-2026-kean',
    mode: 'gael',
    era2015_2026: true,
    difficultyLevel: 4,
    isPro: false,
    era: '2015 - 2026',
    name: 'Moise Kean',
    number: 20,
    clubs: [
      ['Juventus', 'JUV', 'juve', 2016],
      ['Hellas Verona', 'VER', 'parma', 2017],
      ['Everton', 'EVE', 'napoli', 2019],
      ['Paris Saint-Germain', 'PSG', 'psg', 2020],
      ['Juventus', 'JUV', 'juve', 2021],
      ['Fiorentina', 'FIO', 'fiorentina', 2024]
    ],
    hint: 'Primo classe 2000 a segnare in Serie A: dopo Parigi e Torino ha trovato la definitiva consacrazione da bomber alla Fiorentina (2024-2026).',
    options: ['Moise Kean', 'Nicolò Zaniolo', 'Giacomo Raspadori', 'Lorenzo Lucca'],
    correct: 'Moise Kean',
    check: 'Passato alla Fiorentina nell\'estate 2024, Moise Kean ha vissuto stagioni straordinarie trascinando la Viola e la Nazionale italiana.'
  },
  {
    id: 'gael-2026-nicopaz',
    mode: 'gael',
    era2015_2026: true,
    difficultyLevel: 5,
    isPro: false,
    era: '2015 - 2026',
    name: 'Nico Paz',
    number: 79,
    clubs: [
      ['Real Madrid', 'RMA', 'juve', 2023],
      ['Como', 'COM', 'como', 2024]
    ],
    hint: 'Talento cristallino argentino classe 2004 scuola Real Madrid: faro tecnico del Como di Cesc Fàbregas in Serie A dal 2024 al 2026.',
    options: ['Nico Paz', 'Matías Soulé', 'Kenan Yıldız', 'Assane Diao'],
    correct: 'Nico Paz',
    check: 'Arrivato dalla cantera del Real Madrid nell\'estate 2024, Nico Paz ha incantato la Serie A con la maglia del Como di Fàbregas.'
  },
  {
    id: 'gael-2026-dimarco',
    mode: 'gael',
    era2015_2026: true,
    difficultyLevel: 5,
    isPro: false,
    era: '2015 - 2026',
    name: 'Federico Dimarco',
    number: 32,
    clubs: [
      ['Inter', 'INT', 'inter', 2014],
      ['Empoli', 'EMP', 'napoli', 2016],
      ['Sion', 'SIO', 'bari', 2017],
      ['Parma', 'PAR', 'parma', 2018],
      ['Hellas Verona', 'VER', 'parma', 2020],
      ['Inter', 'INT', 'inter', 2021]
    ],
    hint: 'Mancino fatato cresciuto nel vivaio nerazzurro: dopo la gavetta tra Parma e Verona è diventato uno dei migliori esterni sinistri del mondo.',
    options: ['Federico Dimarco', 'Robin Gosens', 'Theo Hernández', 'Andrea Cambiaso'],
    correct: 'Federico Dimarco',
    check: 'Tornato in pianta stabile all\'Inter nel 2021, Dimarco ha segnato gol iconici (incluso quello da 56 metri col Frosinone e in Supercoppa col Milan).'
  },
  {
    id: 'gael-2026-orsolini',
    mode: 'gael',
    era2015_2026: true,
    difficultyLevel: 4,
    isPro: false,
    era: '2015 - 2026',
    name: 'Riccardo Orsolini',
    number: 7,
    clubs: [
      ['Ascoli', 'ASC', 'juve', 2015],
      ['Atalanta', 'ATA', 'atalanta', 2017],
      ['Bologna', 'BOL', 'bologna', 2018]
    ],
    hint: 'Esterno destro mancino celebre per il "bussare" alla telecamera dopo i gol: bandiera del Bologna da Champions e vincitore della Coppa Italia.',
    options: ['Riccardo Orsolini', 'Domenico Berardi', 'Matteo Politano', 'Mattia Zaccagni'],
    correct: 'Riccardo Orsolini',
    check: 'Al Bologna dal gennaio 2018, Riccardo Orsolini è diventato il miglior marcatore rossoblù dell\'era moderna portando il club in Champions.'
  },
  {
    id: 'gael-2026-lukaku',
    mode: 'gael',
    era2015_2026: true,
    difficultyLevel: 2,
    isPro: false,
    era: '2015 - 2026',
    name: 'Romelu Lukaku',
    number: 9,
    clubs: [
      ['Everton', 'EVE', 'napoli', 2014],
      ['Manchester United', 'MUN', 'milan', 2017],
      ['Inter', 'INT', 'inter', 2019],
      ['Chelsea', 'CHE', 'napoli', 2021],
      ['Inter', 'INT', 'inter', 2022],
      ['Roma', 'ROM', 'roma', 2023],
      ['Napoli', 'NAP', 'napoli', 2024]
    ],
    hint: 'Big Rom: fedelissimo di Antonio Conte con cui ha vinto lo Scudetto sia all\'Inter (2021) sia al Napoli (2025).',
    options: ['Romelu Lukaku', 'Victor Osimhen', 'Duván Zapata', 'Edin Džeko'],
    correct: 'Romelu Lukaku',
    check: 'Romelu Lukaku ha vestito le maglie di Inter, Roma e Napoli in Serie A, vincendo due Scudetti con Antonio Conte in panchina.'
  },
  {
    id: 'gael-2026-chiesa-fed',
    mode: 'gael',
    era2015_2026: true,
    difficultyLevel: 2,
    isPro: false,
    era: '2015 - 2026',
    name: 'Federico Chiesa',
    number: 14,
    clubs: [
      ['Fiorentina', 'FIO', 'fiorentina', 2016],
      ['Juventus', 'JUV', 'juve', 2020],
      ['Liverpool', 'LIV', 'roma', 2024]
    ],
    hint: 'Ala elettrica protagonista assoluta di Euro 2020 (gol a Austria e Spagna a Wembley) prima dell\'approdo ad Anfield.',
    options: ['Federico Chiesa', 'Federico Bernardeschi', 'Domenico Berardi', 'Giacomo Raspadori'],
    correct: 'Federico Chiesa',
    check: 'Dopo l\'esplosione alla Fiorentina e 4 stagioni alla Juventus (con 2 Coppe Italia), Federico Chiesa è passato al Liverpool nel 2024 vincendo la Premier.'
  },
  {
    id: 'gael-2026-reijnders',
    mode: 'gael',
    era2015_2026: true,
    difficultyLevel: 4,
    isPro: false,
    era: '2015 - 2026',
    name: 'Tijjani Reijnders',
    number: 14,
    clubs: [
      ['PEC Zwolle', 'PEC', 'samp', 2017],
      ['AZ Alkmaar', 'AZ', 'roma', 2018],
      ['Milan', 'MIL', 'milan', 2023]
    ],
    hint: 'Centrocampista olandese elegante e goleador: arrivato dall\'AZ Alkmaar è diventato il faro del centrocampo rossonero tra il 2023 e il 2025.',
    options: ['Tijjani Reijnders', 'Teun Koopmeiners', 'Frenkie de Jong', 'Jerdy Schouten'],
    correct: 'Tijjani Reijnders',
    check: 'Tijjani Reijnders si è imposto nel Milan come uno dei centrocampisti più completi e prolifici della Serie A (premiato miglior centrocampista 2024/25).'
  },
  {
    id: 'gael-2026-bastoni',
    mode: 'gael',
    era2015_2026: true,
    difficultyLevel: 3,
    isPro: false,
    era: '2015 - 2026',
    name: 'Alessandro Bastoni',
    number: 95,
    clubs: [
      ['Atalanta', 'ATA', 'atalanta', 2016],
      ['Parma', 'PAR', 'parma', 2018],
      ['Inter', 'INT', 'inter', 2019]
    ],
    hint: 'Braccetto sinistro dai piedi da trequartista: cresciuto a Zingonia, maturato a Parma e colonna dell\'Inter e della Nazionale con il #95.',
    options: ['Alessandro Bastoni', 'Riccardo Calafiori', 'Alessandro Buongiorno', 'Francesco Acerbi'],
    correct: 'Alessandro Bastoni',
    check: 'Alessandro Bastoni è diventato all\'Inter l\'archetipo del difensore centrale moderno capace di impostare e servire assist decisivi.'
  },
  {
    id: 'gael-2026-buongiorno',
    mode: 'gael',
    era2015_2026: true,
    difficultyLevel: 4,
    isPro: false,
    era: '2015 - 2026',
    name: 'Alessandro Buongiorno',
    number: 4,
    clubs: [
      ['Torino', 'TOR', 'torino', 2018],
      ['Carpi', 'CAR', 'bari', 2018],
      ['Trapani', 'TRA', 'torino', 2020],
      ['Torino', 'TOR', 'torino', 2020],
      ['Napoli', 'NAP', 'napoli', 2024]
    ],
    hint: 'Centrale granitico cresciuto nel vivaio granata e passato al Napoli di Conte nell\'estate 2024 per blindare la difesa azzurra.',
    options: ['Alessandro Buongiorno', 'Gleison Bremer', 'Perr Schuurs', 'Matteo Gabbia'],
    correct: 'Alessandro Buongiorno',
    check: 'Dopo essere diventato capitano e simbolo del Torino, Alessandro Buongiorno si è trasferito al Napoli nel 2024 vincendo subito lo Scudetto.'
  },
  {
    id: 'gael-2026-yildiz',
    mode: 'gael',
    era2015_2026: true,
    difficultyLevel: 3,
    isPro: false,
    era: '2015 - 2026',
    name: 'Kenan Yıldız',
    number: 10,
    clubs: [
      ['Bayern Monaco Youth', 'BAY', 'roma', 2021],
      ['Juventus Next Gen', 'JNG', 'juve', 2022],
      ['Juventus', 'JUV', 'juve', 2023]
    ],
    hint: 'Gioiello turco classe 2005: ha ereditato la maglia numero 10 della Juventus esultando con la linguaccia come il suo idolo Del Piero.',
    options: ['Kenan Yıldız', 'Arda Güler', 'Hakan Çalhanoğlu', 'Matías Soulé'],
    correct: 'Kenan Yıldız',
    check: 'Kenan Yıldız ha preso la storica #10 bianconera nel 2024, diventando anche il più giovane marcatore della Juventus in Champions League.'
  },
  {
    id: 'gael-2026-gudmundsson',
    mode: 'gael',
    era2015_2026: true,
    difficultyLevel: 5,
    isPro: false,
    era: '2015 - 2026',
    name: 'Albert Guðmundsson',
    number: 10,
    clubs: [
      ['PSV Eindhoven', 'PSV', 'bari', 2017],
      ['AZ Alkmaar', 'AZ', 'roma', 2018],
      ['Genoa', 'GEN', 'genoa', 2022],
      ['Fiorentina', 'FIO', 'fiorentina', 2024]
    ],
    hint: 'Fantasista islandese nipote d\'arte: ha trascinato il Genoa dalla B alla A a suon di magie prima di vestire la #10 della Fiorentina.',
    options: ['Albert Guðmundsson', 'Ruslan Malinovskyi', 'Andrea Colpani', 'Lucas Beltrán'],
    correct: 'Albert Guðmundsson',
    check: 'Albert Guðmundsson ha segnato 14 reti nella Serie A 2023/24 col Genoa prima di passare alla Fiorentina nell\'estate 2024.'
  },
  {
    id: 'gael-2026-castro',
    mode: 'gael',
    era2015_2026: true,
    difficultyLevel: 5,
    isPro: false,
    era: '2015 - 2026',
    name: 'Santiago Castro',
    number: 9,
    clubs: [
      ['Vélez Sarsfield', 'VEL', 'samp', 2021],
      ['Bologna', 'BOL', 'bologna', 2024]
    ],
    hint: 'Soprannominato "El Toto": giovane centravanti argentino esploso al Bologna di Vincenzo Italiano raccogliendo l\'eredità di Zirkzee.',
    options: ['Santiago Castro', 'Valentín Castellanos', 'Mateo Retegui', 'Lucas Beltrán'],
    correct: 'Santiago Castro',
    check: 'Arrivato dal Vélez Sarsfield nel gennaio 2024, Santiago Castro è diventato il bomber titolare del Bologna vincitore della Coppa Italia 2025.'
  }
];

const QUIZZONE_2015_2026_QUESTIONS = [
  {
    id: 'quiz-2026-inter-stella',
    mode: 'quizzocampo',
    era2015_2026: true,
    difficultyLevel: 1,
    tag: 'SERIE A 2015-2026 • SECONDA STELLA',
    question: '[SERIE A 2023/24] In quale partita storica del 22 aprile 2024 l\'Inter di Simone Inzaghi ha conquistato matematicamente lo Scudetto della Seconda Stella (20° titolo)?',
    options: ['Nel Derby vinto 2-1 contro il Milan', 'In casa contro la Juventus per 1-0', 'A Napoli vincendo 3-0', 'Contro la Roma a San Siro per 2-0'],
    correct: 'Nel Derby vinto 2-1 contro il Milan',
    check: 'Il 22 aprile 2024 l\'Inter ha battuto il Milan 2-1 nel derby (reti di Acerbi e Thuram) cucendosi sul petto la Seconda Stella con 5 turni d\'anticipo.'
  },
  {
    id: 'quiz-2026-napoli-3scudetto',
    mode: 'quizzocampo',
    era2015_2026: true,
    difficultyLevel: 1,
    tag: 'SERIE A 2015-2026 • TRIONFO AZZURRO',
    question: '[SERIE A 2022/23] Quale allenatore ha guidato il Napoli alla conquista del suo storico 3° Scudetto nel maggio 2023, 33 anni dopo l\'era Maradona?',
    options: ['Luciano Spalletti', 'Maurizio Sarri', 'Antonio Conte', 'Carlo Ancelotti'],
    correct: 'Luciano Spalletti',
    check: 'Luciano Spalletti ha guidato il Napoli di Osimhen e Kvaratskhelia al 3° Scudetto, festeggiato matematicamente il 4 maggio 2023 a Udine.'
  },
  {
    id: 'quiz-2026-atalanta-dublino',
    mode: 'quizzocampo',
    era2015_2026: true,
    difficultyLevel: 1,
    tag: 'COPPE EUROPEE 2015-2026 • DUBLINO 2024',
    question: '[EUROPA LEAGUE 2024] Chi ha segnato una storica tripletta nella finale di Dublino vinta 3-0 dall\'Atalanta contro l\'imbattuto Bayer Leverkusen?',
    options: ['Ademola Lookman', 'Gianluca Scamacca', 'Teun Koopmeiners', 'Charles De Ketelaere'],
    correct: 'Ademola Lookman',
    check: 'Ademola Lookman ha realizzato una clamorosa tripletta il 22 maggio 2024 regalando all\'Atalanta di Gasperini il primo trofeo europeo della sua storia.'
  },
  {
    id: 'quiz-2026-milan-scudetto-2022',
    mode: 'quizzocampo',
    era2015_2026: true,
    difficultyLevel: 1,
    tag: 'SERIE A 2015-2026 • SCUDETTO ROSSONERO',
    question: '[SERIE A 2021/22] Su quale campo il Milan di Stefano Pioli ha vinto 3-0 all\'ultima giornata (22 maggio 2022) conquistando il suo 19° Scudetto?',
    options: ['A Reggio Emilia contro il Sassuolo', 'A Verona contro l\'Hellas', 'A Bergamo contro l\'Atalanta', 'A San Siro contro la Fiorentina'],
    correct: 'A Reggio Emilia contro il Sassuolo',
    check: 'Il 22 maggio 2022 il Milan ha travolto il Sassuolo 3-0 al Mapei Stadium (doppietta di Giroud e gol di Kessié, con 3 assist di Leão) laureandosi campione.'
  },
  {
    id: 'quiz-2026-italia-wembley',
    mode: 'quizzocampo',
    era2015_2026: true,
    difficultyLevel: 1,
    tag: 'NAZIONALE 2015-2026 • WEMBLEY 2021',
    question: '[EURO 2020] Quale giocatore dell\'Inghilterra si è visto parare da Gianluigi Donnarumma il rigore decisivo che ha consegnato all\'Italia il titolo di Campione d\'Europa l\'11 luglio 2021?',
    options: ['Bukayo Saka', 'Marcus Rashford', 'Jadon Sancho', 'Harry Kane'],
    correct: 'Bukayo Saka',
    check: 'Dopo il palo di Rashford e le parate su Sancho e Bukayo Saka, Donnarumma ha blindato il trionfo azzurro a Wembley (e vinto il premio di MVP di Euro 2020).'
  },
  {
    id: 'quiz-2026-record-36gol',
    mode: 'quizzocampo',
    era2015_2026: true,
    difficultyLevel: 2,
    tag: 'RECORD SERIE A 2015-2026 • 36 RETI',
    question: '[BOMBER ALL-TIME] Quali due attaccanti detengono a pari merito il record assoluto di 36 gol in un singolo campionato di Serie A (stabilito nel 2015/16 e 2019/20)?',
    options: ['Gonzalo Higuaín e Ciro Immobile', 'Cristiano Ronaldo e Lautaro Martínez', 'Mauro Icardi e Victor Osimhen', 'Luca Toni e Fabio Quagliarella'],
    correct: 'Gonzalo Higuaín e Ciro Immobile',
    check: 'Gonzalo Higuaín segnò 36 reti col Napoli nel 2015/16 e Ciro Immobile lo eguagliò con la Lazio nel 2019/20 vincendo anche la Scarpa d\'Oro.'
  },
  {
    id: 'quiz-2026-roma-tirana',
    mode: 'quizzocampo',
    era2015_2026: true,
    difficultyLevel: 2,
    tag: 'COPPE EUROPEE 2015-2026 • TIRANA 2022',
    question: '[CONFERENCE LEAGUE 2022] Chi ha segnato il gol decisivo nella finale di Tirana vinta 1-0 dalla Roma di José Mourinho contro il Feyenoord?',
    options: ['Nicolò Zaniolo', 'Tammy Abraham', 'Lorenzo Pellegrini', 'Stephan El Shaarawy'],
    correct: 'Nicolò Zaniolo',
    check: 'Il 25 maggio 2022 Nicolò Zaniolo, su lancio di Gianluca Mancini, ha segnato l\'1-0 che ha regalato alla Roma la prima edizione della Conference League.'
  },
  {
    id: 'quiz-2026-juve-9scudetti',
    mode: 'quizzocampo',
    era2015_2026: true,
    difficultyLevel: 2,
    tag: 'SERIE A 2015-2026 • STRISCIA STORICA',
    question: '[RECORD SERIE A] Quale allenatore ha guidato la Juventus alla conquista del 9° Scudetto consecutivo nella stagione 2019/20, l\'ultimo della striscia record bianconera?',
    options: ['Maurizio Sarri', 'Massimiliano Allegri', 'Andrea Pirlo', 'Antonio Conte'],
    correct: 'Maurizio Sarri',
    check: 'Dopo i 3 titoli di Conte e i 5 di Allegri, Maurizio Sarri ha vinto lo Scudetto 2019/20 chiudendo il leggendario ciclo di 9 campionati consecutivi della Juventus.'
  },
  {
    id: 'quiz-2026-inter-2021',
    mode: 'quizzocampo',
    era2015_2026: true,
    difficultyLevel: 2,
    tag: 'SERIE A 2015-2026 • LULA',
    question: '[SERIE A 2020/21] Quale coppia d\'attacco (41 gol complessivi in campionato) ha trascinato l\'Inter di Antonio Conte al 19° Scudetto nel 2021?',
    options: ['Romelu Lukaku e Lautaro Martínez', 'Edin Džeko e Alexis Sánchez', 'Mauro Icardi e Ivan Perišić', 'Marcus Thuram e Marko Arnautović'],
    correct: 'Romelu Lukaku e Lautaro Martínez',
    check: 'La "LuLa" composta da Romelu Lukaku (24 gol) e Lautaro Martínez (17 gol) è stata il motore offensivo dell\'Inter campione d\'Italia 2020/21.'
  },
  {
    id: 'quiz-2026-bologna-champions',
    mode: 'quizzocampo',
    era2015_2026: true,
    difficultyLevel: 2,
    tag: 'FAVOLE SERIE A 2015-2026 • BOLOGNA',
    question: '[SERIE A 2023/24] Quale allenatore ha riportato il Bologna in Champions League nella stagione 2023/24 a 60 anni dall\'ultima partecipazione in Coppa dei Campioni?',
    options: ['Thiago Motta', 'Vincenzo Italiano', 'Siniša Mihajlović', 'Roberto Donadoni'],
    correct: 'Thiago Motta',
    check: 'Thiago Motta ha condotto il Bologna di Zirkzee, Calafiori e Orsolini al 5° posto in Serie A 2023/24, centrando lo storico ritorno in Champions League.'
  },
  {
    id: 'quiz-2026-napoli-4scudetto',
    mode: 'quizzocampo',
    era2015_2026: true,
    difficultyLevel: 1,
    tag: 'SERIE A 2024/25 • CONTE A NAPOLI',
    question: '[SERIE A 2024/25] Quale allenatore, vincendo lo Scudetto col Napoli nel 2025, è diventato il primo nella storia a conquistare il titolo di Serie A con 3 club diversi (Juventus, Inter e Napoli)?',
    options: ['Antonio Conte', 'Massimiliano Allegri', 'Luciano Spalletti', 'Fabio Capello'],
    correct: 'Antonio Conte',
    check: 'Antonio Conte ha scritto la storia del calcio italiano vincendo lo Scudetto alla guida di tre piazze diverse: Juventus, Inter e Napoli (con McTominay MVP).'
  },
  {
    id: 'quiz-2026-bologna-coppaitalia',
    mode: 'quizzocampo',
    era2015_2026: true,
    difficultyLevel: 2,
    tag: 'COPPA ITALIA 2025 • TRIONFO ROSSOBLÙ',
    question: '[COPPA ITALIA 2025] Quale club ha alzato la Coppa Italia nel maggio 2025 allo Stadio Olimpico battendo il Milan 1-0 in finale e tornando a vincere il trofeo dopo 51 anni?',
    options: ['Bologna (gol di Ndoye)', 'Atalanta (gol di Lookman)', 'Fiorentina (gol di Kean)', 'Lazio (gol di Zaccagni)'],
    correct: 'Bologna (gol di Ndoye)',
    check: 'Il Bologna di Vincenzo Italiano ha sconfitto il Milan 1-0 grazie alla rete di Dan Ndoye, riportando la Coppa Italia sotto le Due Torri dopo 51 anni (1974).'
  },
  {
    id: 'quiz-2026-supercoppa-riad-2025',
    mode: 'quizzocampo',
    era2015_2026: true,
    difficultyLevel: 2,
    tag: 'SUPERCOPPA 2025 • RIMONTA NEL DERBY',
    question: '[SUPERCOPPA ITALIANA 2025] Chi ha segnato al 93° minuto il gol del 3-2 che ha completato la rimonta da 0-2 del Milan di Sérgio Conceição contro l\'Inter a Riad?',
    options: ['Tammy Abraham', 'Christian Pulisic', 'Theo Hernández', 'Rafael Leão'],
    correct: 'Tammy Abraham',
    check: 'Il 6 gennaio 2025 a Riad il Milan ha ribaltato lo 0-2 dell\'Inter con i gol di Theo Hernández, Pulisic e Tammy Abraham al 93\' su assist di Leão.'
  },
  {
    id: 'quiz-2026-como-fabregas',
    mode: 'quizzocampo',
    era2015_2026: true,
    difficultyLevel: 2,
    tag: 'SERIE A 2024-2026 • LARIO IN A',
    question: '[SERIE A 2024-2026] Quale leggendario ex centrocampista spagnolo Campione del Mondo 2010 ha guidato il Como dal ritorno in Serie A (dopo 21 anni) fino alle zone nobili della classifica?',
    options: ['Cesc Fàbregas', 'Xabi Alonso', 'David Silva', 'Andrés Iniesta'],
    correct: 'Cesc Fàbregas',
    check: 'Cesc Fàbregas, dopo aver chiuso la carriera da giocatore sul Lario, è diventato l\'allenatore del Como valorizzando talenti come Nico Paz e Diao.'
  },
  {
    id: 'quiz-2026-var-introduzione',
    mode: 'quizzocampo',
    era2015_2026: true,
    difficultyLevel: 2,
    tag: 'REGOLAMENTO & VAR • SERIE A',
    question: '[STORIA DEL VAR] In quale stagione calcistica è stato introdotto ufficialmente il VAR (Video Assistant Referee) in Serie A, rendendo il campionato italiano il primo tra le big d\'Europa?',
    options: ['Stagione 2017/2018', 'Stagione 2015/2016', 'Stagione 2019/2020', 'Stagione 2021/2022'],
    correct: 'Stagione 2017/2018',
    check: 'La Serie A ha introdotto ufficialmente il VAR il 19 agosto 2017 (prima chiamata storica in Juventus-Cagliari 3-0 con rigore parato da Buffon a Farias).'
  },
  {
    id: 'quiz-2026-quagliarella-2019',
    mode: 'quizzocampo',
    era2015_2026: true,
    difficultyLevel: 2,
    tag: 'BOMBER SENZA TEMPO • 2018/19',
    question: '[SERIE A 2018/19] Chi ha vinto il titolo di capocannoniere della Serie A 2018/19 a 36 anni con 26 reti in maglia Sampdoria, segnando anche per 11 giornate consecutive?',
    options: ['Fabio Quagliarella', 'Duván Zapata', 'Krzysztof Piątek', 'Cristiano Ronaldo'],
    correct: 'Fabio Quagliarella',
    check: 'Fabio Quagliarella ha firmato un\'impresa memorabile nel 2018/19 laureandosi capocannoniere con 26 gol davanti a Zapata (23), Piątek (22) e CR7 (21).'
  },
  {
    id: 'quiz-2026-cr7-sampdoria-salto',
    mode: 'quizzocampo',
    era2015_2026: true,
    difficultyLevel: 2,
    tag: 'GOL ICONICI • 2019',
    question: '[SERIE A 2019/20] Contro quale squadra a Marassi nel dicembre 2019 Cristiano Ronaldo ha segnato un celebre colpo di testa staccando fino a 2,56 metri da terra?',
    options: ['Sampdoria', 'Genoa', 'Torino', 'Udinese'],
    correct: 'Sampdoria',
    check: 'Il 18 dicembre 2019 in Sampdoria-Juventus 1-2 Cristiano Ronaldo ha segnato di testa su cross di Alex Sandro raggiungendo l\'altezza record di 2,56 metri.'
  },
  {
    id: 'quiz-2026-psg-champions-2025',
    mode: 'quizzocampo',
    era2015_2026: true,
    difficultyLevel: 2,
    tag: 'CHAMPIONS LEAGUE • MONACO 2025',
    question: '[CHAMPIONS LEAGUE 2024/25] Quale squadra allenata da Luis Enrique ha conquistato la prima Champions League della sua storia nella finale di Monaco di Baviera del maggio 2025?',
    options: ['Paris Saint-Germain', 'Arsenal', 'Manchester City', 'Bayer Leverkusen'],
    correct: 'Paris Saint-Germain',
    check: 'Il Paris Saint-Germain di Luis Enrique, Donnarumma, Dembélé, Kvaratskhelia e Doué ha vinto la sua prima storica Champions League a Monaco nel 2025.'
  }
];

const PASTORE_2015_2026_MATCHES = [
  {
    id: 'pastore-2026-milan-inter-1-2-stella',
    mode: 'pastore',
    era2015_2026: true,
    difficultyLevel: 2,
    tag: 'PASTORE LEAGUE • DERBY SECONDA STELLA',
    date: '22 Aprile 2024',
    stadium: 'San Siro, Milano',
    match: 'Milan 1 - 2 Inter (Scudetto Seconda Stella)',
    question: 'Seleziona i 2 marcatori dell\'Inter nel Derby del 22 aprile 2024 che ha consegnato matematicamente la Seconda Stella ai nerazzurri:',
    multiSelect: true,
    options: ['Francesco Acerbi', 'Marcus Thuram', 'Lautaro Martínez', 'Hakan Çalhanoğlu'],
    correct: ['Francesco Acerbi', 'Marcus Thuram'],
    check: 'Francesco Acerbi di testa al 18\' e Marcus Thuram con un destro rasoterra al 49\' hanno firmato l\'1-2 (gol di Tomori per il Milan) della Seconda Stella.'
  },
  {
    id: 'pastore-2026-napoli-juve-5-1',
    mode: 'pastore',
    era2015_2026: true,
    difficultyLevel: 2,
    tag: 'PASTORE LEAGUE • NOTTE STORICA AL MARADONA',
    date: '13 Gennaio 2023',
    stadium: 'Stadio Diego Armando Maradona, Napoli',
    match: 'Napoli 5 - 1 Juventus (Serie A 2022/23)',
    question: 'Seleziona i 3 giocatori andati a segno per il Napoli (Osimhen fece doppietta) nel clamoroso 5-1 rifilato alla Juventus il 13 gennaio 2023:',
    multiSelect: true,
    options: ['Victor Osimhen', 'Khvicha Kvaratskhelia', 'Amir Rrahmani', 'Piotr Zieliński'],
    correct: ['Victor Osimhen', 'Khvicha Kvaratskhelia', 'Amir Rrahmani'],
    check: 'In Napoli-Juventus 5-1 segnarono Osimhen (doppietta), Kvaratskhelia, Rrahmani ed Elmas (per la Juve segnò Di María).'
  },
  {
    id: 'pastore-2026-juve-napoli-0-1-koulibaly',
    mode: 'pastore',
    era2015_2026: true,
    difficultyLevel: 1,
    tag: 'PASTORE LEAGUE • COLPO DI TESTA AL 90\'',
    date: '22 Aprile 2018',
    stadium: 'Allianz Stadium, Torino',
    match: 'Juventus 0 - 1 Napoli (Serie A 2017/18)',
    question: 'Chi ha segnato di testa al 90° minuto su calcio d\'angolo di Callejón lo storico 0-1 del Napoli di Sarri in casa della Juventus il 22 aprile 2018?',
    multiSelect: false,
    options: ['Kalidou Koulibaly', 'Dries Mertens', 'Raúl Albiol', 'Marek Hamšík'],
    correct: 'Kalidou Koulibaly',
    check: 'Lo stacco imperioso di Kalidou Koulibaly al 90\' portò il Napoli a -1 dalla Juventus a quattro giornate dal termine.'
  },
  {
    id: 'pastore-2026-roma-barca-3-0',
    mode: 'pastore',
    era2015_2026: true,
    difficultyLevel: 2,
    tag: 'PASTORE LEAGUE • RIMONTA LEGGENDARIA',
    date: '10 Aprile 2018',
    stadium: 'Stadio Olimpico, Roma',
    match: 'Roma 3 - 0 Barcellona (Quarti Champions 2018)',
    question: 'Seleziona i 3 marcatori della Roma nella leggendaria rimonta per 3-0 contro il Barcellona di Messi (dopo il 4-1 dell\'andata):',
    multiSelect: true,
    options: ['Edin Džeko', 'Daniele De Rossi', 'Kostas Manolas', 'Radja Nainggolan'],
    correct: ['Edin Džeko', 'Daniele De Rossi', 'Kostas Manolas'],
    check: 'Džeko al 6\', De Rossi su rigore al 58\' e il colpo di testa di Manolas all\'82\' su angolo di Ünder regalarono alla Roma la semifinale di Champions!'
  },
  {
    id: 'pastore-2026-sassuolo-milan-0-3',
    mode: 'pastore',
    era2015_2026: true,
    difficultyLevel: 1,
    tag: 'PASTORE LEAGUE • TRICOLORE 2022',
    date: '22 Maggio 2022',
    stadium: 'Mapei Stadium, Reggio Emilia',
    match: 'Sassuolo 0 - 3 Milan (Scudetto 2021/22)',
    question: 'Seleziona i 2 marcatori del Milan (uno autore di una doppietta) nello 0-3 contro il Sassuolo che ha consegnato il 19° Scudetto ai rossoneri:',
    multiSelect: true,
    options: ['Olivier Giroud', 'Franck Kessié', 'Rafael Leão', 'Zlatan Ibrahimović'],
    correct: ['Olivier Giroud', 'Franck Kessié'],
    check: 'Olivier Giroud (doppietta al 17\' e 32\') e Franck Kessié (36\'), tutti su assist di Rafael Leão, chiusero la pratica scudetto già nel primo tempo.'
  },
  {
    id: 'pastore-2026-inter-juve-4-4-2024',
    mode: 'pastore',
    era2015_2026: true,
    difficultyLevel: 3,
    tag: 'PASTORE LEAGUE • DERBY D\'ITALIA PIROTECNICO',
    date: '27 Ottobre 2024',
    stadium: 'San Siro, Milano',
    match: 'Inter 4 - 4 Juventus (Serie A 2024/25)',
    question: 'Quale numero 10 turco della Juventus, entrato nella ripresa sul 4-2 per l\'Inter, ha firmato la doppietta del definitivo 4-4 a San Siro nell\'ottobre 2024?',
    multiSelect: false,
    options: ['Kenan Yıldız', 'Dušan Vlahović', 'Timothy Weah', 'Francisco Conceição'],
    correct: 'Kenan Yıldız',
    check: 'Kenan Yıldız, entrato al 62\', ha realizzato una doppietta memorabile al 71\' e all\'82\' fissando il Derby d\'Italia sul pirotecnico 4-4.'
  },
  {
    id: 'pastore-2026-udinese-napoli-1-1-2023',
    mode: 'pastore',
    era2015_2026: true,
    difficultyLevel: 1,
    tag: 'PASTORE LEAGUE • GOL DEL 3° SCUDETTO',
    date: '4 Maggio 2023',
    stadium: 'Dacia Arena, Udine',
    match: 'Udinese 1 - 1 Napoli (Festa Scudetto 2023)',
    question: 'Chi ha segnato al 52° minuto il gol dell\'1-1 a Udine che ha fatto esplodere la festa per il 3° Scudetto matematico del Napoli?',
    multiSelect: false,
    options: ['Victor Osimhen', 'Khvicha Kvaratskhelia', 'Giovanni Simeone', 'Giacomo Raspadori'],
    correct: 'Victor Osimhen',
    check: 'Victor Osimhen ha ribadito in rete la respinta di Silvestri su tiro di Kvaratskhelia, sancendo l\'1-1 e il tricolore matematico degli azzurri.'
  },
  {
    id: 'pastore-2026-lazio-inter-2-3-2018',
    mode: 'pastore',
    era2015_2026: true,
    difficultyLevel: 2,
    tag: 'PASTORE LEAGUE • LA PRENDE VECINO!',
    date: '20 Maggio 2018',
    stadium: 'Stadio Olimpico, Roma',
    match: 'Lazio 2 - 3 Inter (Spareggio Champions 2018)',
    question: 'Chi ha segnato di testa all\'81° minuto il gol del definitivo 2-3 che ha riportato l\'Inter di Spalletti in Champions League dopo 6 anni all\'ultima giornata?',
    multiSelect: false,
    options: ['Matías Vecino', 'Mauro Icardi', 'Danilo D\'Ambrosio', 'Ivan Perišić'],
    correct: 'Matías Vecino',
    check: 'Dopo i gol di D\'Ambrosio e Icardi su rigore, il colpo di testa di Matías Vecino su angolo di Brozović regalò il 4° posto Champions all\'Inter.'
  },
  {
    id: 'pastore-2026-croazia-italia-1-1-zaccagni',
    mode: 'pastore',
    era2015_2026: true,
    difficultyLevel: 1,
    tag: 'PASTORE LEAGUE • AL 98° MINUTO!',
    date: '24 Giugno 2024',
    stadium: 'Red Bull Arena, Lipsia',
    match: 'Croazia 1 - 1 Italia (Euro 2024)',
    question: 'Chi ha segnato con un destro a giro sotto l\'incrocio al 98° minuto (su assist di Calafiori) il gol qualificazione dell\'Italia contro la Croazia a Euro 2024?',
    multiSelect: false,
    options: ['Mattia Zaccagni', 'Federico Chiesa', 'Nicolò Barella', 'Davide Frattesi'],
    correct: 'Mattia Zaccagni',
    check: 'Mattia Zaccagni, con un tiro a giro perfetto al 98\' ispirato dall\'uscita palla al piede di Calafiori, ha qualificato gli Azzurri agli ottavi.'
  },
  {
    id: 'pastore-2026-inter-milan-5-1-2023',
    mode: 'pastore',
    era2015_2026: true,
    difficultyLevel: 2,
    tag: 'PASTORE LEAGUE • MANITA NEL DERBY',
    date: '16 Settembre 2023',
    stadium: 'San Siro, Milano',
    match: 'Inter 5 - 1 Milan (Serie A 2023/24)',
    question: 'Quale centrocampista armeno dell\'Inter ha realizzato una doppietta (oltre a fornire un assist) nel 5-1 rifilato al Milan il 16 settembre 2023?',
    multiSelect: false,
    options: ['Henrikh Mkhitaryan', 'Hakan Çalhanoğlu', 'Davide Frattesi', 'Nicolò Barella'],
    correct: 'Henrikh Mkhitaryan',
    check: 'Henrikh Mkhitaryan ha aperto e indirizzato il derby con una doppietta, seguito dalla perla di Thuram, dal rigore di Çalhanoğlu e dal sigillo di Frattesi.'
  }
];

// ============================================================================
// 2. NUOVE SFIDE FORMULA 1 2015-2026
// ============================================================================

const F1_2015_2026_QUESTIONS = [
  {
    id: 'f1-2026-hamilton-ferrari',
    mode: 'f1',
    sport: 'f1',
    era2015_2026: true,
    difficultyLevel: 1,
    tag: 'F1 2015-2026 • IL COLPO DEL SECOLO',
    question: 'Quale 7 volte Campione del Mondo ha compiuto uno storico trasferimento dalla Mercedes alla Scuderia Ferrari a partire dalla stagione 2025?',
    route: [['MERCATO STORICO', 'Maranello'], ['7 TITOLI MONDIALI', '#44'], ['PILOTA?', 'Tuta Rossa']],
    options: ['Lewis Hamilton', 'Sebastian Vettel', 'Fernando Alonso', 'Max Verstappen'],
    correct: 'Lewis Hamilton',
    check: 'Lewis Hamilton ha lasciato la Mercedes dopo 12 stagioni e 6 titoli con le Frecce d\'Argento per vestire il rosso della Ferrari dal 2025 al fianco di Leclerc.'
  },
  {
    id: 'f1-2026-antonelli-mercedes',
    mode: 'f1',
    sport: 'f1',
    era2015_2026: true,
    difficultyLevel: 1,
    tag: 'F1 2015-2026 • ORGOGLIO ITALIANO',
    question: 'Quale giovane talento bolognese classe 2006 è stato scelto da Toto Wolff come pilota titolare della Mercedes dal 2025, riportando l\'Italia in griglia da titolare?',
    route: [['ITALIA IN F1', 'Bologna'], ['MERCEDES AMG', '#12'], ['PILOTA?', 'Talento Puro']],
    options: ['Andrea Kimi Antonelli', 'Antonio Giovinazzi', 'Gabriele Minì', 'Leonardo Fornaroli'],
    correct: 'Andrea Kimi Antonelli',
    check: 'Andrea Kimi Antonelli è stato promosso titolare in Mercedes al posto di Hamilton a soli 18 anni, diventando uno dei più giovani protagonisti nella storia della F1.'
  },
  {
    id: 'f1-2026-leclerc-monza-monaco-2024',
    mode: 'f1',
    sport: 'f1',
    era2015_2026: true,
    difficultyLevel: 1,
    tag: 'F1 2015-2026 • IMPRESA IN ROSSO',
    question: 'Quale pilota Ferrari ha compiuto nel 2024 la leggendaria doppietta vincendo nella stessa stagione sia il GP di casa a Montecarlo sia il GP d\'Italia a Monza?',
    route: [['FERRARI #16', '2024'], ['MONACO + MONZA', 'Strategia a 1 sosta'], ['PILOTA?', 'Il Predestinato']],
    options: ['Charles Leclerc', 'Carlos Sainz', 'Sebastian Vettel', 'Kimi Räikkönen'],
    correct: 'Charles Leclerc',
    check: 'Nel 2024 Charles Leclerc ha spezzato il tabù vincendo per la prima volta nella sua Montecarlo e trionfando a Monza con una magica strategia a una sola sosta.'
  },
  {
    id: 'f1-2026-verstappen-4titoli',
    mode: 'f1',
    sport: 'f1',
    era2015_2026: true,
    difficultyLevel: 1,
    tag: 'F1 2015-2026 • DOMINIO ORANGE',
    question: 'Quanti titoli Mondiali Piloti consecutivi ha vinto Max Verstappen con la Red Bull tra il 2021 e il 2024?',
    route: [['RED BULL RACING', '#1'], ['2021 - 2024', 'Las Vegas 2024'], ['TITOLI?', 'Super Max']],
    options: ['4 Mondiali consecutivi', '3 Mondiali consecutivi', '5 Mondiali consecutivi', '2 Mondiali consecutivi'],
    correct: '4 Mondiali consecutivi',
    check: 'Max Verstappen ha conquistato 4 titoli mondiali consecutivi dal 2021 al 2024, laureandosi poker-campione sotto le luci di Las Vegas nel novembre 2024.'
  },
  {
    id: 'f1-2026-mclaren-costruttori-2024',
    mode: 'f1',
    sport: 'f1',
    era2015_2026: true,
    difficultyLevel: 2,
    tag: 'F1 2015-2026 • RITORNO PAPAYA',
    question: 'Quale scuderia storica ha vinto il Mondiale Costruttori 2024 (e dominato nel 2025) con la coppia Lando Norris - Oscar Piastri, tornando al titolo dopo 26 anni (dal 1998)?',
    route: [['TEAM PAPAYA', 'Woking'], ['NORRIS & PIASTRI', 'Abu Dhabi 2024'], ['SCUDERIA?', 'Campioni']],
    options: ['McLaren', 'Williams', 'Ferrari', 'Aston Martin'],
    correct: 'McLaren',
    check: 'La McLaren guidata da Andrea Stella ha vinto il Mondiale Costruttori 2024 davanti alla Ferrari grazie alla vittoria di Lando Norris ad Abu Dhabi.'
  },
  {
    id: 'f1-2026-verstappen-interlagos-2024',
    mode: 'f1',
    sport: 'f1',
    era2015_2026: true,
    difficultyLevel: 2,
    tag: 'F1 2015-2026 • CAPOLAVORO SUL BAGNATO',
    question: 'Da quale casella in griglia è partito Max Verstappen nel GP del Brasile 2024 a Interlagos, vincendo sotto il diluvio con 10 giri veloci nel finale?',
    route: [['INTERLAGOS 2024', 'Pioggia battente'], ['RIMONTA EPICA', '+16 posizioni'], ['PARTENZA?', 'Vittoria']],
    options: ['17° posto (diciassettesimo)', '10° posto (decimo)', '20° posto (ultimo)', '6° posto (sesto)'],
    correct: '17° posto (diciassettesimo)',
    check: 'Partito 17° sotto la pioggia di San Paolo nel novembre 2024, Verstappen ha firmato una delle più grandi rimonte nella storia della F1 andando a vincere.'
  },
  {
    id: 'f1-2026-rosberg-2016',
    mode: 'f1',
    sport: 'f1',
    era2015_2026: true,
    difficultyLevel: 1,
    tag: 'F1 2015-2026 • RITIRO DA CAMPIONE',
    question: 'Quale pilota ha battuto il compagno di squadra Lewis Hamilton nel Mondiale 2016 per poi annunciare a sorpresa il ritiro immediato dalla F1 cinque giorni dopo?',
    route: [['MERCEDES 2016', 'Duello interno'], ['CAMPIONE DEL MONDO', 'Ritiro shock'], ['PILOTA?', '#6']],
    options: ['Nico Rosberg', 'Valtteri Bottas', 'Jenson Button', 'Sebastian Vettel'],
    correct: 'Nico Rosberg',
    check: 'Nico Rosberg ha vinto il Mondiale 2016 ad Abu Dhabi con 5 punti di vantaggio su Hamilton, annunciando il ritiro dalla F1 appena 5 giorni dopo a Vienna.'
  },
  {
    id: 'f1-2026-abudhabi-2021',
    mode: 'f1',
    sport: 'f1',
    era2015_2026: true,
    difficultyLevel: 1,
    tag: 'F1 2015-2026 • L\'ULTIMO GIRO',
    question: 'In quale Gran Premio del 12 dicembre 2021 Max Verstappen ha superato Lewis Hamilton all\'ultimo giro conquistando il suo primo titolo mondiale?',
    route: [['STAGIONE 2021', 'Pari punti (369.5)'], ['SAFETY CAR', 'Ultimo giro'], ['GRAN PREMIO?', 'Titolo']],
    options: ['GP di Abu Dhabi (Yas Marina)', 'GP dell\'Arabia Saudita (Jeddah)', 'GP del Brasile (Interlagos)', 'GP del Bahrain (Sakhir)'],
    correct: 'GP di Abu Dhabi (Yas Marina)',
    check: 'Ad Abu Dhabi 2021, dopo la Safety Car per l\'incidente di Latifi, Verstappen con gomme soft nuove ha sorpassato Hamilton in curva 5 all\'ultimo giro.'
  },
  {
    id: 'f1-2026-leclerc-monza-2019',
    mode: 'f1',
    sport: 'f1',
    era2015_2026: true,
    difficultyLevel: 1,
    tag: 'F1 2015-2026 • BOATO DI MONZA',
    question: 'In quale anno Charles Leclerc ha vinto il suo primo Gran Premio d\'Italia a Monza con la Ferrari, una settimana dopo il suo primo successo assoluto a Spa?',
    route: [['SPA + MONZA', 'Marea Rossa'], ['DUELLO CON HAMILTON', 'Ferrari SF90'], ['ANNO?', '#16']],
    options: ['2019', '2018', '2022', '2020'],
    correct: '2019',
    check: 'L\'8 settembre 2019 Charles Leclerc ha mandato in visibilio Monza resistendo per 53 giri agli attacchi delle Mercedes di Hamilton e Bottas.'
  },
  {
    id: 'f1-2026-sainz-singapore-2023',
    mode: 'f1',
    sport: 'f1',
    era2015_2026: true,
    difficultyLevel: 2,
    tag: 'F1 2015-2026 • L\'UNICO NON-RED BULL',
    question: 'Qual è stato l\'unico pilota non-Red Bull capace di vincere un Gran Premio nella stagione 2023 (trionfando a Singapore con una geniale gestione del DRS su Norris)?',
    route: [['STAGIONE 2023', '21 vittorie Red Bull su 22'], ['GP SINGAPORE', 'DRS tattico a Norris'], ['PILOTA?', 'Ferrari #55']],
    options: ['Carlos Sainz', 'Charles Leclerc', 'Lewis Hamilton', 'Fernando Alonso'],
    correct: 'Carlos Sainz',
    check: 'A Singapore 2023 Carlos Sainz su Ferrari ha tenuto intenzionalmente Lando Norris a meno di 1 secondo per dargli il DRS e difendersi insieme dalle Mercedes!'
  },
  {
    id: 'f1-2026-gasly-monza-2020',
    mode: 'f1',
    sport: 'f1',
    era2015_2026: true,
    difficultyLevel: 2,
    tag: 'F1 2015-2026 • VITTORIA A SORPRESA',
    question: 'Quale pilota francese ha vinto clamorosamente il GP d\'Italia 2020 a Monza al volante della scuderia italiana AlphaTauri (ex Toro Rosso)?',
    route: [['MONZA 2020', 'Bandiera Rossa'], ['SCUDERIA DI FAENZA', 'AlphaTauri'], ['VINCITORE?', '#10']],
    options: ['Pierre Gasly', 'Esteban Ocon', 'Romain Grosjean', 'Jean-Éric Vergne'],
    correct: 'Pierre Gasly',
    check: 'Il 6 settembre 2020 Pierre Gasly ha conquistato a Monza una storica vittoria per l\'AlphaTauri precedendo sul traguardo la McLaren di Carlos Sainz di 4 decimi.'
  },
  {
    id: 'f1-2026-newey-astonmartin',
    mode: 'f1',
    sport: 'f1',
    era2015_2026: true,
    difficultyLevel: 2,
    tag: 'F1 2015-2026 • IL GENIO DELL\'AERODINAMICA',
    question: 'In quale team si è trasferito nel 2025 il leggendario progettista Adrian Newey dopo aver lasciato la Red Bull per disegnare la monoposto del nuovo regolamento 2026?',
    route: [['ADRIAN NEWEY', 'Addio Red Bull'], ['SILVERSTONE', 'Lawrence Stroll & Alonso'], ['SCUDERIA?', '2025-2026']],
    options: ['Aston Martin', 'Ferrari', 'Williams', 'Audi'],
    correct: 'Aston Martin',
    check: 'Adrian Newey ha scelto l\'Aston Martin (diventando anche azionista e Managing Technical Partner) per progettare la vettura del regolamento 2026.'
  },
  {
    id: 'f1-2026-regolamento-2026',
    mode: 'f1',
    sport: 'f1',
    era2015_2026: true,
    difficultyLevel: 2,
    tag: 'F1 2026 • NUOVA ERA TECNICA',
    question: 'Quale grande costruttore tedesco ha fatto il suo debutto ufficiale in Formula 1 nel 2026 rilevando il team Sauber e sviluppando una propria Power Unit?',
    route: [['REGOLAMENTO 2026', 'Power Unit 50/50'], ['EX SAUBER HINWIL', 'Quattro Anelli'], ['COSTRUTTORE?', 'Esordio F1']],
    options: ['Audi', 'Porsche', 'BMW', 'Volkswagen'],
    correct: 'Audi',
    check: 'Audi è entrata ufficialmente in Formula 1 nel 2026 acquisendo il gruppo Sauber e realizzando la propria Power Unit nello stabilimento di Neuburg.'
  },
  {
    id: 'f1-2026-norris-mondiale-2025',
    mode: 'f1',
    sport: 'f1',
    era2015_2026: true,
    difficultyLevel: 1,
    tag: 'F1 2015-2026 • SFIDA IRIDATA PAPAYA',
    question: 'Con quale numero di gara corre Lando Norris sulla sua McLaren fin dal suo esordio in Formula 1 nel 2019?',
    route: [['MCLAREN RACING', 'Pilota Britannico'], ['PRIMA VITTORIA MIAMI 2024', 'Casco Giallo Fluo'], ['NUMERO?', 'LN4']],
    options: ['Numero 4', 'Numero 81', 'Numero 14', 'Numero 63'],
    correct: 'Numero 4',
    check: 'Lando Norris corre con l\'iconico numero 4 (spesso stilizzato nel suo logo LN4), mentre il compagno di squadra Oscar Piastri utilizza l\'81.'
  }
];

// ============================================================================
// 3. NUOVE SFIDE BASKET NBA 2015-2026
// ============================================================================

const BASKET_2015_2026_QUESTIONS = [
  {
    id: 'nba-2026-celtics-18-titolo',
    mode: 'basket',
    sport: 'basket',
    era2015_2026: true,
    difficultyLevel: 1,
    tag: 'NBA 2015-2026 • RECORD DI ANELLI',
    question: 'Quale franchigia ha vinto le NBA Finals 2024 battendo i Dallas Mavericks 4-1 e conquistando il suo 18° titolo (record assoluto nella storia NBA davanti ai Lakers)?',
    route: [['NBA FINALS 2024', 'TATUM & BROWN'], ['BANNER #18', 'TD Garden'], ['FRANCHIGIA?', 'Campioni']],
    options: ['Boston Celtics', 'Denver Nuggets', 'Golden State Warriors', 'Milwaukee Bucks'],
    correct: 'Boston Celtics',
    check: 'I Boston Celtics di Jayson Tatum e Jaylen Brown (Finals MVP) hanno vinto il titolo 2024 salendo a quota 18 anelli, staccando i Lakers (17).'
  },
  {
    id: 'nba-2026-jokic-nuggets-2023',
    mode: 'basket',
    sport: 'basket',
    era2015_2026: true,
    difficultyLevel: 1,
    tag: 'NBA 2015-2026 • IL JOKER SUL TRONO',
    question: 'Quale centro serbo (3 volte MVP tra il 2021 e il 2024) ha trascinato i Denver Nuggets al primo titolo NBA della loro storia nelle Finals 2023 contro Miami?',
    route: [['DENVER NUGGETS #15', 'Scelto alla #41 al Draft'], ['3X MVP + FINALS MVP 2023', 'Triple-Doppie'], ['GIOCATORE?', 'The Joker']],
    options: ['Nikola Jokić', 'Luka Dončić', 'Joel Embiid', 'Domantas Sabonis'],
    correct: 'Nikola Jokić',
    check: 'Nikola Jokić ha guidato i Denver Nuggets al primo anello nel 2023 ed è diventato uno dei pochissimi giocatori nella storia con almeno 3 premi di MVP.'
  },
  {
    id: 'nba-2026-lebron-40000-punti',
    mode: 'basket',
    sport: 'basket',
    era2015_2026: true,
    difficultyLevel: 1,
    tag: 'NBA 2015-2026 • RECORD IMMORTALE',
    question: 'Quale leggenda NBA ha superato nel febbraio 2023 lo storico record di punti di Kareem Abdul-Jabbar (38.387) diventando nel 2024 il primo nella storia a superare i 40.000 punti?',
    route: [['RECORD ALL-TIME', '38.388+ Punti'], ['40.000 PUNTI (2024)', 'Los Angeles Lakers #23'], ['LEGGENDA?', 'The King']],
    options: ['LeBron James', 'Kevin Durant', 'Stephen Curry', 'James Harden'],
    correct: 'LeBron James',
    check: 'LeBron James è diventato il miglior marcatore ogni epoca l\'8 febbraio 2023 contro OKC e il 2 marzo 2024 ha sfondato la barriera dei 40.000 punti in carriera.'
  },
  {
    id: 'nba-2026-cavs-2016-rimonta',
    mode: 'basket',
    sport: 'basket',
    era2015_2026: true,
    difficultyLevel: 1,
    tag: 'NBA 2015-2026 • RIMONTA DA 1-3',
    question: 'Quale squadra ha compiuto nelle NBA Finals 2016 l\'unica rimonta da 1-3 nella storia delle Finali, battendo in Gara 7 i Golden State Warriors da 73 vittorie?',
    route: [['NBA FINALS 2016', 'Da 1-3 a 4-3'], ['THE BLOCK + THE SHOT', 'LeBron & Kyrie'], ['SQUADRA?', 'Primo Anello']],
    options: ['Cleveland Cavaliers', 'Toronto Raptors', 'Miami Heat', 'Oklahoma City Thunder'],
    correct: 'Cleveland Cavaliers',
    check: 'I Cleveland Cavaliers di LeBron James e Kyrie Irving hanno espugnato la Oracle Arena in Gara 7 nel giugno 2016 vincendo il primo titolo della loro storia.'
  },
  {
    id: 'nba-2026-giannis-50punti-2021',
    mode: 'basket',
    sport: 'basket',
    era2015_2026: true,
    difficultyLevel: 1,
    tag: 'NBA 2015-2026 • GREEK FREAK',
    question: 'Quale superstar ha segnato ben 50 punti nella decisiva Gara 6 delle NBA Finals 2021 contro i Phoenix Suns, riportando il titolo ai Milwaukee Bucks dopo 50 anni?',
    route: [['NBA FINALS 2021', '50 Punti in Gara 6'], ['MILWAUKEE BUCKS #34', 'Finals MVP'], ['CAMPIONE?', 'Greek Freak']],
    options: ['Giannis Antetokounmpo', 'Khris Middleton', 'Jrue Holiday', 'Damian Lillard'],
    correct: 'Giannis Antetokounmpo',
    check: 'Giannis Antetokounmpo ha dominato Gara 6 delle Finals 2021 con 50 punti, 14 rimbalzi e 5 stoppate (tirando 17/19 ai liberi).'
  },
  {
    id: 'nba-2026-curry-record-triple',
    mode: 'basket',
    sport: 'basket',
    era2015_2026: true,
    difficultyLevel: 1,
    tag: 'NBA 2015-2026 • RE DELLE TRIPLE',
    question: 'Di chi ha battuto il record storico di triple segnate in carriera (2.973) Stephen Curry il 14 dicembre 2021 al Madison Square Garden di New York?',
    route: [['MADISON SQUARE GARDEN', '14 Dicembre 2021'], ['2.974+ TRIPLE', 'Chef Curry #30'], ['EX DETENTORE?', 'Record battuto']],
    options: ['Ray Allen', 'Reggie Miller', 'Klay Thompson', 'James Harden'],
    correct: 'Ray Allen',
    check: 'Stephen Curry ha superato le 2.973 triple di Ray Allen al Madison Square Garden, diventando poi il primo nella storia a superare quota 3.800 e 4.000 triple!'
  },
  {
    id: 'nba-2026-doncic-lakers-trade',
    mode: 'basket',
    sport: 'basket',
    era2015_2026: true,
    difficultyLevel: 1,
    tag: 'NBA 2025-2026 • LA TRADE DEL SECOLO',
    question: 'Quale fenomeno sloveno (autore di 73 punti in una gara nel 2024) è stato protagonista nel febbraio 2025 di una clamorosa trade dai Dallas Mavericks ai Los Angeles Lakers in cambio di Anthony Davis?',
    route: [['DALLAS ➔ LAKERS', 'Febbraio 2025'], ['MAGLIA #77', 'In coppia con LeBron'], ['FENOMENO?', 'Luka Magic']],
    options: ['Luka Dončić', 'Nikola Jokić', 'Kristaps Porziņģis', 'Goran Dragić'],
    correct: 'Luka Dončić',
    check: 'Nel febbraio 2025 Luka Dončić è passato dai Mavericks ai Los Angeles Lakers nello scambio con Anthony Davis, uno dei trasferimenti più scioccanti di sempre.'
  },
  {
    id: 'nba-2026-wembanyama-spurs',
    mode: 'basket',
    sport: 'basket',
    era2015_2026: true,
    difficultyLevel: 1,
    tag: 'NBA 2015-2026 • L\'ALIENO DI SAN ANTONIO',
    question: 'Con quale franchigia ha debuttato come 1ª scelta assoluta al Draft 2023 il fenomeno francese di 224 cm Victor Wembanyama (Rookie of the Year 2024)?',
    route: [['1ª SCELTA DRAFT 2023', '224 cm • #1'], ['ROOKIE OF THE YEAR 2024', 'Texas'], ['FRANCHIGIA?', 'Wemby']],
    options: ['San Antonio Spurs', 'Houston Rockets', 'Charlotte Hornets', 'Portland Trail Blazers'],
    correct: 'San Antonio Spurs',
    check: 'Victor Wembanyama è stato scelto con la #1 assoluta dai San Antonio Spurs, seguendo le orme di David Robinson e Tim Duncan.'
  },
  {
    id: 'nba-2026-sga-thunder',
    mode: 'basket',
    sport: 'basket',
    era2015_2026: true,
    difficultyLevel: 2,
    tag: 'NBA 2015-2026 • MVP & OKC THUNDER',
    question: 'Quale guardia canadese con la maglia #2 ha trascinato gli Oklahoma City Thunder al miglior record della lega e al titolo MVP / Finals tra il 2024 e il 2026?',
    route: [['OKC THUNDER #2', 'Canada'], ['30+ PUNTI DI MEDIA', 'Leader assoluto'], ['GIOCATORE?', 'SGA']],
    options: ['Shai Gilgeous-Alexander', 'Jamal Murray', 'Andrew Wiggins', 'RJ Barrett'],
    correct: 'Shai Gilgeous-Alexander',
    check: 'Shai Gilgeous-Alexander (SGA) è diventato il volto degli Oklahoma City Thunder dominando la NBA per punti segnati, efficienza e vittorie.'
  },
  {
    id: 'nba-2026-raptors-2019-kawhi',
    mode: 'basket',
    sport: 'basket',
    era2015_2026: true,
    difficultyLevel: 2,
    tag: 'NBA 2015-2026 • WE THE NORTH',
    question: 'Quale giocatore ha segnato il leggendario tiro sulla sirena di Gara 7 (4 rimbalzi sul ferro!) contro Philadelphia prima di portare i Toronto Raptors al titolo NBA 2019?',
    route: [['TORONTO RAPTORS 2019', 'Gara 7 vs Sixers'], ['4 RIMBALZI SUL FERRO', 'Finals MVP'], ['CAMPIONE?', 'The Claw']],
    options: ['Kawhi Leonard', 'Kyle Lowry', 'Pascal Siakam', 'DeMar DeRozan'],
    correct: 'Kawhi Leonard',
    check: 'Kawhi Leonard ha realizzato l\'iconico buzzer-beater in Gara 7 contro i 76ers e ha poi guidato Toronto alla vittoria nelle Finals 2019 contro Golden State.'
  },
  {
    id: 'nba-2026-lakers-bolla-2020',
    mode: 'basket',
    sport: 'basket',
    era2015_2026: true,
    difficultyLevel: 1,
    tag: 'NBA 2015-2026 • LA BOLLA DI ORLANDO',
    question: 'Quale squadra ha vinto il titolo NBA nell\'ottobre 2020 all\'interno della "Bolla" di Disney World a Orlando, superando i Miami Heat di Jimmy Butler per 4-2?',
    route: [['ORLANDO BUBBLE 2020', 'LeBron + Anthony Davis'], ['FINALS 4-2 VS MIAMI', 'Dedicato a Kobe'], ['CAMPIONI?', '17° Titolo']],
    options: ['Los Angeles Lakers', 'Boston Celtics', 'Los Angeles Clippers', 'Denver Nuggets'],
    correct: 'Los Angeles Lakers',
    check: 'I Los Angeles Lakers di LeBron James (Finals MVP) e Anthony Davis hanno conquistato l\'anello 2020 nella Bolla di Orlando.'
  },
  {
    id: 'nba-2026-lebron-bronny',
    mode: 'basket',
    sport: 'basket',
    era2015_2026: true,
    difficultyLevel: 1,
    tag: 'NBA 2015-2026 • PADRE E FIGLIO',
    question: 'Nell\'ottobre 2024 LeBron James e suo figlio Bronny hanno scritto la storia dei Los Angeles Lakers diventando:',
    route: [['22 OTTOBRE 2024', 'Lakers vs Timberwolves'], ['LEBRON & BRONNY', 'In campo insieme'], ['RECORD?', 'Storia NBA']],
    options: [
      'La prima coppia padre-figlio a giocare insieme in una partita NBA',
      'La prima coppia a segnare 50 punti a testa',
      'I primi a vincere il titolo da allenatore e giocatore',
      'I primi scelti entrambi alla #1 assoluta del Draft'
    ],
    correct: 'La prima coppia padre-figlio a giocare insieme in una partita NBA',
    check: 'Il 22 ottobre 2024 contro Minnesota, LeBron e Bronny James sono scesi sul parquet insieme, prima coppia padre-figlio nella storia della NBA.'
  },
  {
    id: 'nba-2026-banchero-magic',
    mode: 'basket',
    sport: 'basket',
    era2015_2026: true,
    difficultyLevel: 2,
    tag: 'NBA 2015-2026 • N.1 AL DRAFT 2022',
    question: 'Quale ala forte di origini italiane è stata selezionata con la 1ª scelta assoluta al Draft NBA 2022 dagli Orlando Magic (vincendo il Rookie of the Year 2023 e diventando All-Star)?',
    route: [['DRAFT NBA 2022 #1', 'Duke University'], ['ORLANDO MAGIC #5', 'Rookie of the Year 2023'], ['STELLA?', 'All-Star']],
    options: ['Paolo Banchero', 'Simone Fontecchio', 'Chet Holmgren', 'Jabari Smith Jr.'],
    correct: 'Paolo Banchero',
    check: 'Paolo Banchero, prima scelta assoluta 2022, ha vinto il Rookie of the Year 2023 ed è diventato la stella franchigia degli Orlando Magic.'
  },
  {
    id: 'nba-2026-lillard-71-embiid-70',
    mode: 'basket',
    sport: 'basket',
    era2015_2026: true,
    difficultyLevel: 2,
    tag: 'NBA 2015-2026 • ESPLOSIONI DA 70+ PUNTI',
    question: 'Quali due giocatori nel gennaio 2024 hanno segnato rispettivamente 70 punti (con Philadelphia) e 73 punti (con Dallas) a soli quattro giorni di distanza l\'uno dall\'altro?',
    route: [['GENNAIO 2024', 'Settimana dei Record'], ['70 PUNTI + 73 PUNTI', 'Sixers & Mavericks'], ['PROTAGONISTI?', 'Showtime']],
    options: [
      'Joel Embiid (70) e Luka Dončić (73)',
      'Devin Booker (70) e Donovan Mitchell (71)',
      'Stephen Curry (70) e Damian Lillard (71)',
      'Jayson Tatum (70) e Giannis Antetokounmpo (73)'
    ],
    correct: 'Joel Embiid (70) e Luka Dončić (73)',
    check: 'Il 22 gennaio 2024 Joel Embiid ha segnato 70 punti contro gli Spurs e il 26 gennaio 2024 Luka Dončić ne ha realizzati 73 contro gli Hawks!'
  }
];

// Generatore di espansione varianti verificate 2015-2026 per coprire massicciamente ogni unità e pool
function expandCalcioData() {
  const file = path.join(dataDir, 'curriculum.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));

  // 1. Inietta giocatori Gael 2015-2026 in tutte le unità Gael (0..9) e in gaelModes
  for (let uIdx = 0; uIdx < 10; uIdx++) {
    const unit = data.units[uIdx];
    if (!unit || !unit.lessons) continue;
    unit.lessons.forEach((lesson, lIdx) => {
      if (!lesson.questions) lesson.questions = [];
      const p1 = GAEL_2015_2026_PLAYERS[(uIdx * 2 + lIdx) % GAEL_2015_2026_PLAYERS.length];
      const p2 = GAEL_2015_2026_PLAYERS[(uIdx * 3 + lIdx + 7) % GAEL_2015_2026_PLAYERS.length];
      const exists1 = lesson.questions.some(q => q.name === p1.name);
      if (!exists1) {
        lesson.questions.unshift({ ...p1, id: `${unit.id}-l${lIdx + 1}-2026-1`, difficultyLevel: uIdx + 1, isPro: uIdx >= 6 });
      }
      const exists2 = lesson.questions.some(q => q.name === p2.name);
      if (!exists2) {
        lesson.questions.push({ ...p2, id: `${unit.id}-l${lIdx + 1}-2026-2`, difficultyLevel: uIdx + 1, isPro: uIdx >= 6 });
      }
    });
  }

  if (data.gaelModes) {
    ['anni2000', 'allstars', 'pro'].forEach(k => {
      if (Array.isArray(data.gaelModes[k])) {
        GAEL_2015_2026_PLAYERS.forEach((p, idx) => {
          if (!data.gaelModes[k].some(x => x.name === p.name)) {
            data.gaelModes[k].unshift({ ...p, id: `gael-${k}-2026-${idx}`, isPro: k === 'pro' });
          }
        });
      }
    });
  }

  // 2. Inietta domande Quizzone 2015-2026 in tutte le unità Quizzocampo (10..24) e in extraModes
  for (let uIdx = 10; uIdx < 25; uIdx++) {
    const unit = data.units[uIdx];
    if (!unit || !unit.lessons) continue;
    unit.lessons.forEach((lesson, lIdx) => {
      if (!lesson.questions) lesson.questions = [];
      const q1 = QUIZZONE_2015_2026_QUESTIONS[((uIdx - 10) * 2 + lIdx) % QUIZZONE_2015_2026_QUESTIONS.length];
      const q2 = QUIZZONE_2015_2026_QUESTIONS[((uIdx - 10) * 3 + lIdx + 5) % QUIZZONE_2015_2026_QUESTIONS.length];
      if (!lesson.questions.some(x => x.question === q1.question)) {
        lesson.questions.unshift({ ...q1, id: `${unit.id}-l${lIdx + 1}-2026-q1` });
      }
      if (!lesson.questions.some(x => x.question === q2.question)) {
        lesson.questions.push({ ...q2, id: `${unit.id}-l${lIdx + 1}-2026-q2` });
      }
    });
  }

  if (data.extraModes) {
    ['goals', 'scorers', 'derby', 'champions'].forEach(k => {
      if (Array.isArray(data.extraModes[k])) {
        QUIZZONE_2015_2026_QUESTIONS.forEach((q, idx) => {
          if (!data.extraModes[k].some(x => x.question === q.question)) {
            data.extraModes[k].unshift({ ...q, id: `extra-${k}-2026-${idx}` });
          }
        });
      }
    });
  }

  // 3. Inietta domande Pastore 2015-2026 nelle unità Pastore (25..39) e in pastoreMode
  for (let uIdx = 25; uIdx < 40; uIdx++) {
    const unit = data.units[uIdx];
    if (!unit || !unit.lessons) continue;
    unit.lessons.forEach((lesson, lIdx) => {
      if (!lesson.questions) lesson.questions = [];
      const m1 = PASTORE_2015_2026_MATCHES[((uIdx - 25) + lIdx) % PASTORE_2015_2026_MATCHES.length];
      const m2 = PASTORE_2015_2026_MATCHES[((uIdx - 25) * 2 + lIdx + 3) % PASTORE_2015_2026_MATCHES.length];
      if (!lesson.questions.some(x => x.match === m1.match)) {
        lesson.questions.unshift({ ...m1, id: `${unit.id}-l${lIdx + 1}-2026-p1` });
      }
      if (!lesson.questions.some(x => x.match === m2.match)) {
        lesson.questions.push({ ...m2, id: `${unit.id}-l${lIdx + 1}-2026-p2` });
      }
    });
  }

  if (Array.isArray(data.pastoreMode)) {
    PASTORE_2015_2026_MATCHES.forEach((m, idx) => {
      if (!data.pastoreMode.some(x => x.match === m.match)) {
        data.pastoreMode.unshift({ ...m, id: `pastore-2026-pool-${idx}` });
      }
    });
  }

  // Salva minificato per massima velocità di download e JSON.parse
  fs.writeFileSync(file, JSON.stringify(data), 'utf8');
  console.log('✓ curriculum.json aggiornato con domande 2015-2026 e minificato!');
}

function expandF1Data() {
  const file = path.join(dataDir, 'curriculum-f1.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));

  if (data.metadata) {
    data.metadata.title = 'Quiz like a Boomer — Formula 1 1970-2026';
    data.metadata.updatedAt = new Date().toISOString();
  }

  data.units.forEach((unit, uIdx) => {
    if (uIdx === 8) {
      unit.title = '2021-2026: Verstappen, Leclerc, McLaren & Hamilton in Ferrari';
      unit.subtitle = '2021-2026 • I 4 titoli di Max, Leclerc re a Monaco e Monza, McLaren campione, Kimi Antonelli e Hamilton in Rosso.';
    }
    (unit.lessons || []).forEach((lesson, lIdx) => {
      if (!lesson.questions) lesson.questions = [];
      const q1 = F1_2015_2026_QUESTIONS[(uIdx * 2 + lIdx) % F1_2015_2026_QUESTIONS.length];
      const q2 = F1_2015_2026_QUESTIONS[(uIdx * 3 + lIdx + 4) % F1_2015_2026_QUESTIONS.length];
      if (!lesson.questions.some(x => x.question === q1.question)) {
        lesson.questions.unshift({ ...q1, id: `f1-u${uIdx + 1}-l${lIdx + 1}-2026-1` });
      }
      if (!lesson.questions.some(x => x.question === q2.question)) {
        lesson.questions.push({ ...q2, id: `f1-u${uIdx + 1}-l${lIdx + 1}-2026-2` });
      }
    });
  });

  if (Array.isArray(data.f1Pool)) {
    F1_2015_2026_QUESTIONS.forEach((q, idx) => {
      if (!data.f1Pool.some(x => x.question === q.question)) {
        data.f1Pool.unshift({ ...q, id: `f1-pool-2026-${idx}` });
      }
    });
  }

  fs.writeFileSync(file, JSON.stringify(data), 'utf8');
  console.log('✓ curriculum-f1.json aggiornato con domande 2015-2026 e minificato!');
}

function expandBasketData() {
  const file = path.join(dataDir, 'curriculum-basket.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));

  if (data.metadata) {
    data.metadata.title = 'Buzzer Beater — NBA Legends 1980-2026';
    data.metadata.updatedAt = new Date().toISOString();
  }

  data.units.forEach((unit, uIdx) => {
    (unit.lessons || []).forEach((lesson, lIdx) => {
      if (!lesson.questions) lesson.questions = [];
      const q1 = BASKET_2015_2026_QUESTIONS[(uIdx * 2 + lIdx) % BASKET_2015_2026_QUESTIONS.length];
      const q2 = BASKET_2015_2026_QUESTIONS[(uIdx * 3 + lIdx + 5) % BASKET_2015_2026_QUESTIONS.length];
      if (!lesson.questions.some(x => x.question === q1.question)) {
        lesson.questions.unshift({ ...q1, id: `nba-u${uIdx + 1}-l${lIdx + 1}-2026-1` });
      }
      if (!lesson.questions.some(x => x.question === q2.question)) {
        lesson.questions.push({ ...q2, id: `nba-u${uIdx + 1}-l${lIdx + 1}-2026-2` });
      }
    });
  });

  if (Array.isArray(data.basketPool)) {
    BASKET_2015_2026_QUESTIONS.forEach((q, idx) => {
      if (!data.basketPool.some(x => x.question === q.question)) {
        data.basketPool.unshift({ ...q, id: `nba-pool-2026-${idx}` });
      }
    });
  }

  fs.writeFileSync(file, JSON.stringify(data), 'utf8');
  console.log('✓ curriculum-basket.json aggiornato con domande 2015-2026 e minificato!');
}

expandCalcioData();
expandF1Data();
expandBasketData();
