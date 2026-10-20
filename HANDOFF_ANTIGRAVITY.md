# Handoff progetto Fuoriclasse

## Prompt da passare ad Antigravity / Gemini

Continua lo sviluppo della webapp **Fuoriclasse**, un gioco di apprendimento sul calcio italiano ispirato alla progressione di Duolingo. Lavora sui file esistenti in questa cartella e conserva le funzioni già implementate.

Prima di modificare il codice:

1. Leggi questo documento e ispeziona `index.html`, `app.js`, `style.css`, `mobile.css` e `dark-theme.css`.
2. Avvia la pagina con un server di sviluppo statico locale, invece di aprire direttamente l’HTML con `file://`: le verifiche live di Wikidata/Wikipedia e alcune API browser richiedono un origin HTTP/HTTPS.
3. Controlla il layout almeno a 390 px, 768 px e desktop. Prova anche quiz, fonti, audio, chiusura sessione e navigazione mobile.
4. Fai modifiche incrementali e mantieni il progetto utilizzabile senza installare framework, salvo una motivazione chiara.

## Obiettivo prodotto

Una webapp mobile-first in italiano, divertente e rapida da usare, che insegna curiosità e storia del calcio con sessioni brevi. Il focus iniziale è Serie A e Nazionale italiana.

Il loop principale è: aprire una lezione → rispondere a cinque domande → ricevere feedback e XP → vedere il progresso e scegliere un’altra modalità.

## Stato attuale

È un prototipo statico composto da HTML, CSS e JavaScript vanilla; non usa build system, backend o account.

- `index.html`: pagina del percorso, unità, pannelli laterali, navigazione mobile, modale quiz e modali informative.
- `app.js`: dati demo, rendering delle domande, controlli risposte, XP, sintesi vocale, brevi effetti audio, fonti e chiamate live a Wikidata/Wikipedia.
- `style.css`: layout desktop e stile base chiaro originale.
- `mobile.css`: responsive mobile, bottom navigation, quiz full-screen e animazioni; rispetta `prefers-reduced-motion`.
- `dark-theme.css`: tema scuro e stile arcade 8-bit applicati sopra gli stili base.

### Modalità già presenti

1. **Indovina il giocatore**: sequenza di club della carriera e scelta multipla.
2. **Quanti gol?**: quiz dimostrativi su marcatori e record di Serie A.
3. **Chi ha segnato?**: marcatori e ordine delle reti in partite storiche.

Il quiz ha cinque domande per sessione, feedback corretto/errato e XP. I dati e la progressione sono demo locali. Il progresso persistente salva principalmente gli XP in `localStorage`; sessioni, giorni consecutivi, classifica e sblocco livelli non sono ancora un sistema completo.

### Aspetto desiderato

- Mobile-first, navigazione inferiore con tre voci e risposte grandi, adatte al tocco.
- Fondo antracite, superfici scure e contrasto da app sportiva, usando Apple Sports soltanto come riferimento di leggibilità e gerarchia; non riprodurre schermate o componenti proprietari.
- Grafica 8-bit/arcade, pixel grid, nodi a spigoli netti, animazioni brevi.
- Maglie in miniatura create in SVG pixel-art per rappresentare le palette e le fasce tipiche dei club. Non aggiungere stemmi, sponsor o loghi ufficiali senza licenza.
- Mantenere riduzione o disattivazione delle animazioni quando il sistema lo richiede.
- Tono editoriale amichevole, italiano naturale, testi brevi.

## Dati e fonti

Wikidata è la sorgente strutturata candidata; Wikipedia è una fonte editoriale da controllare e collegare. Il quiz deve mostrare la fonte e distinguere chiaramente contenuti verificati, dati demo e risultati del controllo automatico.

Fonti per le domande demo attuali:

- Lega Serie A, marcatori e record: https://www.legaseriea.it/serie-a/news/top-scorers-i-re-del-gol-della-serie-a
- Lega Serie A, Ciro Immobile: https://en.legaseriea.it/news/ciro-immobile-announces-his-retirement
- UEFA, Germania–Italia 0-2 (2006): https://www.uefa.com/uefaeuro/history/news/0254-0d7e00b23c5e-22d4a92c4574-1000--germany-aim-to-end-italy-hoodoo/
- UEFA, eventi Italia–Inghilterra EURO 2020: https://www.uefa.com/uefaeuro/match/2024491--italy-vs-england/events/
- API REST Wikimedia: https://www.mediawiki.org/wiki/Wikimedia_REST_API/en
- Wikidata Query Service: https://query.wikidata.org/

Non trattare una risposta del query service come prova completa della carriera: qualifiche, prestiti, seconde squadre, intervalli temporali e dati mancanti possono produrre liste incomplete o ambigue. Conservare QID, URL fonte, data controllo e stato editoriale per ogni record. Wikipedia e le immagini hanno condizioni di licenza proprie; non copiare testo o immagini senza rispettare attribuzione e licenza.

## Stato di avanzamento delle attività

Tutte le 4 priorità cardine del piano di sviluppo sono state completate e verificate con test automatizzati:

### Priorità 1 — Affidabilità, progressione e stato (COMPLETATO ✓)
- **Persistenza XP e giorni**: Gli XP totali non si azzerano più con il refresh o il passaggio di giorno; lo streak e l'obiettivo giornaliero (5 sfide) si ricalcolano correttamente sul cambio di data del calendario.
- **Sblocco reale delle lezioni**: Ogni nodo sulla mappa apre la sua lezione specifica (0..4). Completare la Lezione $N$ sblocca la Lezione $N+1$.
- **Sincronizzazione coerente**: Aggiornati in tempo reale XP in topbar, banner del corso, badge nel menu laterale, progresso della carta (0/5 .. 5/5) e linea SVG attiva.
- **Trasparenza delle fonti**: Distinzione visiva e semantica tra fonti ufficiali (`FONTE UFFICIALE (LEGA/UEFA)`), revisione manuale (`REVISIONE EDITORIALE`) e controllo live (`VERIFICA LIVE WIKIMEDIA ✓`).

### Priorità 2 — Qualità mobile e accessibilità (COMPLETATO ✓)
- **Tipografia e leggibilità**: Micro-font aumentati a minimo 8px con `letter-spacing: 0.4px` per il font 8-bit *Press Start 2P*.
- **Contrasto e focus da tastiera**: Aggiunto ring ad alto contrasto `:focus-visible` (`2px solid #69d5a0`). Modali con focus trap e ripristino dell'ultimo elemento attivo.
- **Target tattili mobile**: Ingranditi i target su touch screen (`.quiz-close` a 44x44px, pulsanti audio e profilo ad almeno 34x34px).
- **Safe Area**: Aggiunto `viewport-fit=cover` e gestione completa dei safe area insets di iOS (notch e home bar).
- **VoiceOver & TTS**: Aggiunte etichette descrittive (`jerseySVG(club, clubName)`) e fallback graceful se la sintesi vocale (`speechSynthesis`) non è disponibile.

### Priorità 3 — Dati e struttura (COMPLETATO ✓)
- **Curriculum JSON separato**: Creato [`data/curriculum.json`](./data/curriculum.json) contenente tutte le 35 sfide didattiche (25 di Unità 1 + 10 delle modalità extra), con metadati editoriali, QID Wikidata e URL di verifica.
- **JSON Schema formale**: Definito [`data/curriculum.schema.json`](./data/curriculum.schema.json) per validare l'integrità strutturale di giocatori, club, stagioni, opzioni e fonti.
- **Script di validazione**: Script automatizzato [`scripts/validate-curriculum.js`](./scripts/validate-curriculum.js) per testare la conformità dello schema prima di ogni rilascio.
- **Caricamento dinamico con fallback offline**: La funzione `loadCurriculumData()` in `app.js` scarica il curriculum aggiornato e ripiega automaticamente sul catalogo incorporato se offline.
- **Cache locale Wikidata**: Cache client di 7 giorni con prefisso `fuoriclasse-wiki-cache-` e pulsante di pulizia manuale nel footer.

### Priorità 4 — Prodotto e PWA (COMPLETATO ✓)
- **Progressione Unità 2 ("Cuore Azzurro")**: Gestione dello sblocco alla fine dell'Unità 1 con anteprima interattiva delle 5 sfide sulla Nazionale (1982, 2006, 2020) e pulsante di prova.
- **Classifica e missioni chiare**: Classifica settimanale della Divisione Dilettanti dinamica (10 concorrenti virtuali ordinati per XP in tempo reale), contrassegnata esplicitamente come simulazione locale.
- **PWA completa**: Creati [`manifest.webmanifest`](./manifest.webmanifest), icona vettoriale pixel-art [`icon.svg`](./icon.svg) e Service Worker [`sw.js`](./sw.js) per il funzionamento offline a zero latenza.
- **Suite di regressione E2E**: Test automatizzato [`scripts/test-app.js`](./scripts/test-app.js) che valida HTML, manifest, SW, app.js, CSS e dati JSON (0 errori).

## Architettura dei file

- `index.html`: Shell dell'applicazione, PWA metadata, mappa di apprendimento, modali quiz e fonti.
- `app.js`: Motore di gioco in Vanilla JS, gestione dello stato, Web Audio API, Web Speech API, caricamento dati e cache.
- `style.css`: Foglio di stile base desktop e layout generale.
- `mobile.css`: Responsive mobile, safe area insets, navigazione fissa, animazioni arcade e prefers-reduced-motion.
- `dark-theme.css`: Palette scura e contrasto ispirato ad Apple Sports con accenti pixel-art retro.
- `sw.js`: Service Worker PWA con strategia Cache-First per asset locali e pass-through resiliente per API esterne.
- `manifest.webmanifest`: Configurazione PWA installabile standalone su iOS e Android.
- `icon.svg`: Icona grafica pixel-art a 512x512 per home screen e favicon.
- `data/curriculum.json`: Catalogo strutturato di 35 domande didattiche verificate.
- `data/curriculum.schema.json`: Schema JSON per la convalida dei contenuti.
- `scripts/validate-curriculum.js`: Test di validazione schema del curriculum.
- `scripts/test-app.js`: Test suite di regressione per l'intera applicazione.

## Come eseguire i test e verificare il progetto

```bash
# Validazione formale dei dati del curriculum
node scripts/validate-curriculum.js

# Esecuzione della suite completa di test (HTML, CSS, JS, PWA, Schema)
node scripts/test-app.js

# Avvio del server di sviluppo statico locale (porta 8080)
python3 -m http.server 8080
# Aprire http://localhost:8080/index.html nel browser
```

## Prossimi sviluppi facoltativi

- **Unità 2 completa**: Aggiungere le 25 domande storiche della Nazionale ("Cuore Azzurro") direttamente in `data/curriculum.json`.
- **Sound Effects Pack**: Espandere gli oscillatori Web Audio API con suoni distinti per vittoria traguardo o cambio livello.
- **Deploy statico**: Collegamento a Cloudflare Pages o GitHub Pages per il rilascio continuo con zero costi di hosting.

