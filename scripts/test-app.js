// Fuoriclasse — Suite di Test e Regressione E2E (Node.js)
// Verifica la coerenza di HTML, CSS, JavaScript, Asset 3D Generati, PWA Manifest e Curriculum 1080+

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let failures = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FALLITO: ${message}`);
    failures++;
  } else {
    console.log(`✓ ${message}`);
  }
}

console.log('⚽ Avvio Test Suite Fuoriclasse (Edizione Argon 3D + 1.080 Domande)...\n');

// 1. Test index.html
console.log('--- 1. Verifica index.html (Struttura Argon 3D Mobile-First) ---');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

assert(html.includes('viewport-fit=cover'), 'index.html supporta safe area mobile (viewport-fit=cover)');
assert(html.includes('rel="manifest"'), 'index.html include link al manifest PWA');
assert(html.includes('rel="icon"'), 'index.html include favicon SVG');
assert(html.includes('rel="apple-touch-icon"'), 'index.html include apple-touch-icon');
assert(html.includes('id="unitsContainer"'), 'index.html include container percorso unità');
assert(html.includes('id="quizOverlay"'), 'index.html include overlay quiz full-screen');
assert(html.includes('id="quizQuestionView"'), 'index.html separa #quizQuestionView per sessioni multiple');
assert(html.includes('id="quizCompletionView"'), 'index.html separa #quizCompletionView con trofeo 3D');
assert(html.includes('id="confettiCanvas"'), 'index.html include canvas per celebrazione confetti');
assert(html.includes('id="unitJumpModal"'), 'index.html include modale selettore rapido Unità');
assert(html.includes('id="heartsCount"'), 'index.html include contatore cuori/vite');
assert(html.includes('id="streakCount"'), 'index.html include contatore streak fiamma');
assert(html.includes('id="audioToggle"'), 'index.html include toggle effetti sonori');
assert(html.includes('id="themeToggle"'), 'index.html include toggle tema chiaro/scuro');
assert(html.includes('class="duo-mobile-nav"'), 'index.html include barra di navigazione mobile inferiore');

// 2. Test Asset 3D Generati con Gemini
console.log('\n--- 2. Verifica Illustrazioni 3D Generate (assets/) ---');
const requiredAssets = [
  'assets/mascot-coach.jpg',
  'assets/gael-mascot.jpg',
  'assets/pastore-mascot.jpg',
  'assets/trophy-quizzone.jpg',
  'assets/trophy-gael.jpg',
  'assets/trophy-pastore.jpg',
  'assets/f1-mascot.jpg',
  'assets/basket-mascot.jpg',
  'assets/trophy-f1.jpg',
  'assets/trophy-basket.jpg',
  'assets/stadium-hero.jpg',
  'assets/chest-gold.jpg',
  'assets/trophy-fuoriclasse.jpg'
];
for (const relPath of requiredAssets) {
  const fullPath = path.join(ROOT, relPath);
  const exists = fs.existsSync(fullPath) && fs.statSync(fullPath).size > 10000;
  assert(exists, `Asset grafico presente e valido: ${relPath}`);
}

// 3. Test manifest.webmanifest
console.log('\n--- 3. Verifica PWA manifest.webmanifest ---');
const manifestRaw = fs.readFileSync(path.join(ROOT, 'manifest.webmanifest'), 'utf8');
let manifest = null;
try {
  manifest = JSON.parse(manifestRaw);
  assert(true, 'manifest.webmanifest è un JSON valido');
} catch (e) {
  assert(false, `manifest.webmanifest parsing error: ${e.message}`);
}

if (manifest) {
  assert(manifest.name && manifest.name.includes('Fuoriclasse'), 'Manifest ha un nome app corretto');
  assert(manifest.display === 'standalone', 'Manifest è configurato per display standalone');
  assert(Array.isArray(manifest.icons) && manifest.icons.length >= 1, 'Manifest ha icone definite');
}

// 4. Test Service Worker sw.js
console.log('\n--- 4. Verifica Service Worker sw.js ---');
const swContent = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
assert(swContent.includes('SW_VERSION'), 'sw.js definisce una versione attiva');
assert(swContent.includes('caches.delete'), 'sw.js gestisce la pulizia della cache');
assert(swContent.includes('skipWaiting'), 'sw.js attiva immediatamente il nuovo worker');
assert(swContent.includes('clients.claim'), 'sw.js acquisisce il controllo dei client');

// 5. Test app.js
console.log('\n--- 5. Verifica app.js (Motore Argon 3D + 5.000 Domande) ---');
const appContent = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
assert(appContent.includes('loadCurriculum'), 'app.js include caricamento dinamico del curriculum');
assert(appContent.includes('renderSnakePath'), 'app.js include rendering dinamico delle unità a serpente 3D');
assert(appContent.includes('renderUnitJumpModal'), 'app.js include selettore rapido delle Unità');
assert(appContent.includes('launchConfetti'), 'app.js include motore celebrazione Confetti Canvas');
assert(appContent.includes('renderLeaderboard'), 'app.js include gestione della classifica leghe');
assert(appContent.includes('renderQuests'), 'app.js include gestione missioni e trofei');
assert(appContent.includes('serviceWorker.register'), 'app.js registra il Service Worker PWA');
assert(appContent.includes('playTone'), 'app.js implementa sintetizzatore audio Web Audio API');
assert(appContent.includes('checkMidnightHeartsReset'), 'app.js implementa il reset vite a mezzanotte');
assert(appContent.includes('updateHomeInstallBannerVisibility'), 'app.js gestisce la visibilità condizionale del banner PWA/Login');

// 6. Test Accessibilità e CSS
console.log('\n--- 6. Verifica CSS e Accessibilità (Stile 3D Argon/Duolingo) ---');
const styleCss = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');
const mobileCss = fs.readFileSync(path.join(ROOT, 'mobile.css'), 'utf8');
const darkCss = fs.readFileSync(path.join(ROOT, 'dark-theme.css'), 'utf8');
assert(styleCss.includes('.btn-primary'), 'style.css implementa i bottoni 3D tattili');
assert(styleCss.includes('.hero-stadium-backdrop'), 'style.css implementa il banner Stadio Hero 3D');
assert(styleCss.includes('.path-node-btn'), 'style.css definisce i nodi circolari 3D del percorso a serpente');
assert(styleCss.includes('.node-stars-crown'), 'style.css definisce le corone a 3 stelle sulle tappe completate');
assert(mobileCss.includes('prefers-reduced-motion'), 'mobile.css rispetta la preferenza utente prefers-reduced-motion');
assert(mobileCss.includes(':focus-visible'), 'mobile.css definisce focus-visible accessibile');
assert(mobileCss.includes('.duo-mobile-nav'), 'mobile.css gestisce la barra di navigazione fissa inferiore');
assert(darkCss.includes('body[data-theme="dark"]'), 'dark-theme.css implementa il tema scuro Stadio di Notte');

// 7. Test Dati Curriculum (Super Database 5.000 Domande)
console.log('\n--- 7. Verifica Curriculum JSON (Quizzone, Gael League & Pastore League) ---');
const curriculum = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/curriculum.json'), 'utf8'));
assert(curriculum.units && curriculum.units.length === 40, 'Curriculum contiene 40 unità didattiche (10 Gael Hard + 15 Quizzone + 15 Pastore)');
assert(curriculum.metadata && curriculum.metadata.totalQuestions >= 3000, `Curriculum ha ${curriculum.metadata.totalQuestions} domande (>= 3000)`);
assert(curriculum.gaelModes && curriculum.gaelModes.anni90.length >= 100, 'Gael League Anni 90 ha almeno 100 sfide carriera');
assert(curriculum.gaelModes && curriculum.gaelModes.anni2000.length >= 100, 'Gael League Primi 2000 ha almeno 100 sfide carriera');
assert(curriculum.extraModes && curriculum.extraModes.goals.length >= 100, 'Quizzocampo Record & Scudetti ha almeno 100 sfide');
assert(curriculum.extraModes && curriculum.extraModes.scorers.length >= 100, 'Quizzocampo Re dei Bomber ha almeno 100 sfide');
assert(Array.isArray(curriculum.pastoreMode) && curriculum.pastoreMode.length >= 2000, 'Modalità Pastore contiene almeno 2.000 sfide marcatori');

// 8. Test Multi-Sport F1 & Basket Curriculum
console.log('\n--- 8. Verifica Motori F1 & Basket NBA (4.000+ Domande per Categoria) ---');
const f1Raw = fs.readFileSync(path.join(ROOT, 'data', 'curriculum-f1.json'), 'utf8');
const f1Data = JSON.parse(f1Raw);
assert(f1Data && f1Data.metadata && f1Data.metadata.sport === 'f1', 'F1 curriculum metadata corretto');
assert(f1Data.units && f1Data.units.length === 10, `F1 contiene 10 unità storiche (1970-2024) (${f1Data.units.length})`);
assert(f1Data.f1Pool && f1Data.f1Pool.length >= 4000, `F1 contiene almeno 4.000 quiz verificati (${f1Data.f1Pool.length})`);

const basketRaw = fs.readFileSync(path.join(ROOT, 'data', 'curriculum-basket.json'), 'utf8');
const basketData = JSON.parse(basketRaw);
assert(basketData && basketData.metadata && basketData.metadata.sport === 'basket', 'Basket curriculum metadata corretto');
assert(basketData.units && basketData.units.length === 10, `Basket contiene 10 unità storiche (1980-2024) (${basketData.units.length})`);
assert(basketData.basketPool && basketData.basketPool.length >= 4000, `Basket contiene almeno 4.000 quiz NBA verificati (${basketData.basketPool.length})`);

// 9. Test Retention & Category Streaks in app.js
console.log('\n--- 9. Verifica Retention Engine & Streaks Indipendenti ---');
assert(appContent.includes('categoryStreaks'), 'app.js definisce categoryStreaks per categoria indipendente');
assert(appContent.includes('recordCategoryDailyWin'), 'app.js implementa recordCategoryDailyWin');
assert(appContent.includes('switchSport'), 'app.js implementa switchSport');
assert(appContent.includes('renderStreakDetailModal'), 'app.js implementa visualizzazione calendario retention');

// 10. Test Analytics & Telemetria Leggera
console.log('\n--- 10. Verifica Analytics Leggero & Privacy-First ---');
assert(appContent.includes('trackEvent'), 'app.js implementa trackEvent non bloccante');
assert(appContent.includes('analytics_events'), 'app.js e Supabase supportano la tabella analytics_events');

// Riepilogo
console.log('\n========================================');
if (failures === 0) {
  console.log('🏆 TUTTI I TEST HANNO AVUTO ESITO POSITIVO (0 errori)!');
  process.exit(0);
} else {
  console.error(`💥 ERRORI RILEVATI: ${failures}`);
  process.exit(1);
}
