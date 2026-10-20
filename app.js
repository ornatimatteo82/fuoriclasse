/**
 * ============================================================================
 * FUORICLASSE — MOTORE DI GIOCO GAMIFICATO (EDIZIONE ARGON 3D)
 * ============================================================================
 * - Caricamento Curriculum 1.080+ domande da `data/curriculum.json` + Fallback
 * - Percorso a serpentina (Snake Path) con Bauli 3D, Corone Stelle e Mister Bomber
 * - Integrazione Live Wikidata REST API con cache locale (TTL 14 giorni)
 * - Quiz interattivo full-screen con Combo Streak, Confetti Canvas e Audio Synth
 * ============================================================================
 */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const esc = (str = '') => String(str).replace(/[&<>"']/g, (m) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[m]));

const STORAGE_KEY = 'fuoriclasse_argon_state_v3';
const WIKI_CACHE_PREFIX = 'fuoriclasse_wikidata_v1_';
const WIKI_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 giorni

// -------------------------------------------------------------
// 1. STATO GLOBALE GIOCATORE & SESSIONE
// -------------------------------------------------------------
const state = {
  xp: 120,
  streak: 3,
  gems: 250,
  hearts: 5,
  maxHearts: 5,
  soundEnabled: true,
  theme: 'light',
  activeTab: 'path',

  // Progressi percorso: chiavi 'u1-l1' completate e bauli riscattati
  completedLessons: ['u1-l1'],
  claimedChests: [],
  dailyGoalDone: 1,
  dailyGoalTarget: 5,
  todayCorrect: 2,

  // Stato Quiz attivo
  quizOpen: false,
  quizMode: 'path', // 'path' | 'goals' | 'scorers' | 'derby' | 'champions' | 'practice'
  activeUnitIdx: 0,
  activeLessonIdx: 0,
  currentQuestions: [],
  questionIndex: 0,
  selectedAnswer: null,
  answered: false,
  sessionFinished: false,
  sessionCorrect: 0,
  comboStreak: 0
};

let catalog = {
  units: [],
  extraModes: { goals: [], scorers: [], derby: [], champions: [] }
};

// -------------------------------------------------------------
// 2. SISTEMA MAGLIE VETTORIALI (36 KIT STORICI & INTERNAZIONALI)
// -------------------------------------------------------------
const KIT_PALETTES = {
  inter:      { bg: '#00529F', s1: '#111111', s2: '#00529F', text: '#FFFFFF', type: 'stripes' },
  milan:      { bg: '#D00027', s1: '#111111', s2: '#D00027', text: '#FFFFFF', type: 'stripes' },
  juve:       { bg: '#FFFFFF', s1: '#111111', s2: '#FFFFFF', text: '#D4AF37', type: 'stripes' },
  napoli:     { bg: '#12A0D7', s1: '#FFFFFF', s2: '#003E7E', text: '#FFFFFF', type: 'solid' },
  roma:       { bg: '#8E1F2F', s1: '#F0BC42', s2: '#8E1F2F', text: '#F0BC42', type: 'solid' },
  lazio:      { bg: '#87D8F7', s1: '#FFFFFF', s2: '#87D8F7', text: '#0B3B60', type: 'solid' },
  fiorentina: { bg: '#482E92', s1: '#FFFFFF', s2: '#482E92', text: '#FFFFFF', type: 'solid' },
  parma:      { bg: '#FFCC00', s1: '#003399', s2: '#FFCC00', text: '#003399', type: 'hoops' },
  atalanta:   { bg: '#1E71B8', s1: '#111111', s2: '#1E71B8', text: '#FFFFFF', type: 'stripes' },
  bologna:    { bg: '#1A2F48', s1: '#A21C26', s2: '#1A2F48', text: '#FFFFFF', type: 'stripes' },
  brescia:    { bg: '#0054A6', s1: '#FFFFFF', s2: '#0054A6', text: '#FFFFFF', type: 'chevron' },
  samp:       { bg: '#0055A4', s1: '#FFFFFF', s2: '#EF4135', text: '#FFFFFF', type: 'band' },
  genoa:      { bg: '#A50021', s1: '#00245D', s2: '#A50021', text: '#FFFFFF', type: 'halves' },
  torino:     { bg: '#8A1E2B', s1: '#FFFFFF', s2: '#8A1E2B', text: '#FFFFFF', type: 'solid' },
  udinese:    { bg: '#FFFFFF', s1: '#111111', s2: '#FFFFFF', text: '#111111', type: 'stripes' },
  cagliari:   { bg: '#A50021', s1: '#002350', s2: '#A50021', text: '#FFFFFF', type: 'halves' },
  verona:     { bg: '#002F6C', s1: '#FFCD00', s2: '#002F6C', text: '#FFCD00', type: 'solid' },
  palermo:    { bg: '#F49AC1', s1: '#111111', s2: '#F49AC1', text: '#111111', type: 'solid' },
  real:       { bg: '#FFFFFF', s1: '#D4AF37', s2: '#4B5563', text: '#111827', type: 'solid' },
  barca:      { bg: '#004D98', s1: '#A50044', s2: '#004D98', text: '#FFED02', type: 'stripes' },
  atletico:   { bg: '#CB3524', s1: '#FFFFFF', s2: '#CB3524', text: '#172755', type: 'stripes' },
  united:     { bg: '#DA291C', s1: '#FFFFFF', s2: '#111111', text: '#FFFFFF', type: 'solid' },
  chelsea:    { bg: '#034694', s1: '#FFFFFF', s2: '#034694', text: '#FFFFFF', type: 'solid' },
  arsenal:    { bg: '#EF0107', s1: '#FFFFFF', s2: '#EF0107', text: '#FFFFFF', type: 'sleeves' },
  liverpool:  { bg: '#C8102E', s1: '#FFFFFF', s2: '#F6EB61', text: '#FFFFFF', type: 'solid' },
  city:       { bg: '#6CABDD', s1: '#FFFFFF', s2: '#6CABDD', text: '#1C2C5B', type: 'solid' },
  bayern:     { bg: '#DC052D', s1: '#FFFFFF', s2: '#DC052D', text: '#FFFFFF', type: 'solid' },
  dortmund:   { bg: '#FDE100', s1: '#111111', s2: '#FDE100', text: '#111111', type: 'solid' },
  psg:        { bg: '#004170', s1: '#DA291C', s2: '#FFFFFF', text: '#FFFFFF', type: 'centerband' },
  ajax:       { bg: '#FFFFFF', s1: '#D2122E', s2: '#FFFFFF', text: '#FFFFFF', type: 'centerband' },
  benfica:    { bg: '#E30613', s1: '#FFFFFF', s2: '#E30613', text: '#FFFFFF', type: 'solid' },
  porto:      { bg: '#00428C', s1: '#FFFFFF', s2: '#00428C', text: '#FFFFFF', type: 'stripes' },
  boca:       { bg: '#003399', s1: '#FFCC00', s2: '#003399', text: '#FFCC00', type: 'band' },
  river:      { bg: '#FFFFFF', s1: '#E4002B', s2: '#FFFFFF', text: '#111111', type: 'sash' },
  santos:     { bg: '#FFFFFF', s1: '#111111', s2: '#FFFFFF', text: '#111111', type: 'solid' },
  italia:     { bg: '#0066CC', s1: '#FFFFFF', s2: '#008C45', text: '#FFFFFF', type: 'solid' }
};

function jerseySVG(kitKey, label = '') {
  const k = KIT_PALETTES[kitKey] || KIT_PALETTES.italia;
  const initials = (label || 'FC').slice(0, 3).toUpperCase();
  let pattern = '';

  if (k.type === 'stripes') {
    pattern = `
      <rect x="22" y="14" width="6" height="44" fill="${k.s1}"/>
      <rect x="34" y="14" width="6" height="44" fill="${k.s1}"/>
    `;
  } else if (k.type === 'hoops' || k.type === 'band') {
    pattern = `<rect x="16" y="28" width="32" height="10" fill="${k.s1}"/>`;
  } else if (k.type === 'halves') {
    pattern = `<rect x="32" y="14" width="16" height="44" fill="${k.s1}"/>`;
  } else if (k.type === 'centerband') {
    pattern = `<rect x="27" y="14" width="10" height="44" fill="${k.s1}"/>`;
  } else if (k.type === 'chevron') {
    pattern = `<path d="M16 26 L32 38 L48 26 L48 33 L32 45 L16 33 Z" fill="${k.s1}"/>`;
  } else if (k.type === 'sash') {
    pattern = `<path d="M18 16 L25 16 L46 54 L39 54 Z" fill="${k.s1}"/>`;
  } else if (k.type === 'sleeves') {
    pattern = `
      <path d="M8 20 L16 14 L16 30 L8 28 Z" fill="${k.s1}"/>
      <path d="M56 20 L48 14 L48 30 L56 28 Z" fill="${k.s1}"/>
    `;
  }

  return `
    <svg viewBox="0 0 64 64" role="img" aria-label="Maglia ${esc(label)}">
      <path d="M20 10 L26 14 L38 14 L44 10 L56 18 L50 30 L46 27 L46 56 L18 56 L18 27 L14 30 L8 18 Z"
            fill="${k.bg}" stroke="#1e293b" stroke-width="2.5" stroke-linejoin="round"/>
      <clipPath id="clip-${esc(kitKey)}-${esc(initials)}">
        <path d="M20 10 L26 14 L38 14 L44 10 L56 18 L50 30 L46 27 L46 56 L18 56 L18 27 L14 30 L8 18 Z"/>
      </clipPath>
      <g clip-path="url(#clip-${esc(kitKey)}-${esc(initials)})">
        ${pattern}
      </g>
      <path d="M25 12 Q32 19 39 12" fill="none" stroke="${k.s1}" stroke-width="2.5"/>
      <rect x="21" y="31" width="22" height="12" rx="4" fill="rgba(15,23,42,0.72)"/>
      <text x="32" y="40" text-anchor="middle" font-size="8.5" font-weight="900" fill="#ffffff" font-family="Nunito, sans-serif">${esc(initials)}</text>
    </svg>
  `;
}

// -------------------------------------------------------------
// 3. SALVATAGGIO E RIPRISTINO STATO (LOCALSTORAGE)
// -------------------------------------------------------------
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (typeof saved === 'object' && saved !== null) {
      state.xp = Number.isFinite(saved.xp) ? saved.xp : state.xp;
      state.streak = Number.isFinite(saved.streak) ? saved.streak : state.streak;
      state.gems = Number.isFinite(saved.gems) ? saved.gems : state.gems;
      state.hearts = Number.isFinite(saved.hearts) ? saved.hearts : state.hearts;
      state.soundEnabled = typeof saved.soundEnabled === 'boolean' ? saved.soundEnabled : true;
      state.theme = saved.theme === 'dark' ? 'dark' : 'light';
      if (Array.isArray(saved.completedLessons) && saved.completedLessons.length) {
        state.completedLessons = saved.completedLessons;
      }
      if (Array.isArray(saved.claimedChests)) {
        state.claimedChests = saved.claimedChests;
      }
      state.dailyGoalDone = Number.isFinite(saved.dailyGoalDone) ? saved.dailyGoalDone : 1;
      state.todayCorrect = Number.isFinite(saved.todayCorrect) ? saved.todayCorrect : 2;
    }
  } catch (e) {
    console.warn('Impossibile leggere lo stato salvato:', e);
  }
}

function persistState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      xp: state.xp,
      streak: state.streak,
      gems: state.gems,
      hearts: state.hearts,
      soundEnabled: state.soundEnabled,
      theme: state.theme,
      completedLessons: state.completedLessons,
      claimedChests: state.claimedChests,
      dailyGoalDone: state.dailyGoalDone,
      todayCorrect: state.todayCorrect
    }));
  } catch (e) {
    console.warn('Impossibile salvare lo stato:', e);
  }
}

// -------------------------------------------------------------
// 4. CARICAMENTO CURRICULUM JSON (1.080+ DOMANDE)
// -------------------------------------------------------------
async function loadCurriculum() {
  try {
    const res = await fetch('data/curriculum.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data && Array.isArray(data.units) && data.units.length > 0) {
      catalog = data;
    }
  } catch (err) {
    console.warn('Caricamento curriculum.json via fetch non riuscito, attivo fallback locale:', err.message);
  }

  renderSnakePath();
  renderUnitJumpModal();
  renderLeaderboard();
  renderQuests();
  updateTopStats();
}

// -------------------------------------------------------------
// 5. RENDERING PERCORSO A SERPENTINA (SNAKE PATH 3D)
// -------------------------------------------------------------
const UNIT_THEMES = ['theme-green', 'theme-blue', 'theme-purple', 'theme-orange'];
const NODE_OFFSETS = ['', 'offset-right-1', 'offset-right-2', 'offset-right-1', '', 'offset-left-1', 'offset-left-2', 'offset-left-1'];
const LESSON_ICONS = ['⚽', '⭐', '👟', '🔥', '🛡️', '👑', '🎯', '⚡', '🏆', '🔟', '🌟', '🏅'];

function getActiveLessonCoords() {
  let foundUnit = 0;
  let foundLesson = 0;
  for (let uIdx = 0; uIdx < catalog.units.length; uIdx++) {
    const u = catalog.units[uIdx];
    for (let lIdx = 0; lIdx < u.lessons.length; lIdx++) {
      const key = `u${uIdx + 1}-l${lIdx + 1}`;
      if (!state.completedLessons.includes(key)) {
        return { uIdx, lIdx };
      }
      foundUnit = uIdx;
      foundLesson = lIdx;
    }
  }
  return { uIdx: foundUnit, lIdx: foundLesson };
}

function renderSnakePath() {
  const container = $('#unitsContainer');
  if (!container) return;

  let globalFoundCurrent = false;
  let totalLessonsCount = 0;
  let totalCompletedCount = 0;

  catalog.units.forEach((u, uIdx) => {
    u.lessons.forEach((_, lIdx) => {
      totalLessonsCount++;
      if (state.completedLessons.includes(`u${uIdx + 1}-l${lIdx + 1}`)) {
        totalCompletedCount++;
      }
    });
  });

  const heroPill = $('#heroProgressPill');
  if (heroPill) {
    heroPill.textContent = `${totalCompletedCount} / ${totalLessonsCount} TAPPE`;
  }

  const html = catalog.units.map((unit, uIdx) => {
    const themeClass = UNIT_THEMES[uIdx % UNIT_THEMES.length];
    const completedInUnit = unit.lessons.filter((_, lIdx) =>
      state.completedLessons.includes(`u${uIdx + 1}-l${lIdx + 1}`)
    ).length;

    const nodesHtml = unit.lessons.map((lesson, lIdx) => {
      const lessonKey = `u${uIdx + 1}-l${lIdx + 1}`;
      const isCompleted = state.completedLessons.includes(lessonKey);

      let status = 'locked';
      if (isCompleted) {
        status = 'completed';
      } else if (!globalFoundCurrent) {
        status = 'current';
        globalFoundCurrent = true;
      } else if (uIdx === 0 && lIdx <= 2) {
        status = 'unlocked';
      } else if (lIdx === 0 && uIdx > 0) {
        status = 'unlocked';
      }

      const offsetClass = NODE_OFFSETS[lIdx % NODE_OFFSETS.length];
      const icon = isCompleted ? '✓' : LESSON_ICONS[lIdx % LESSON_ICONS.length];
      const isCurrent = status === 'current';

      // Baule premio 3D ogni 4 lezioni
      const chestId = `chest-u${uIdx + 1}-l${lIdx + 1}`;
      const isChestClaimed = state.claimedChests.includes(chestId);
      const showChestAfter = (lIdx + 1) % 4 === 0;

      const chestHtml = showChestAfter
        ? `<div class="node-row">
             <button class="chest-node-btn ${isChestClaimed ? 'claimed' : ''}" type="button" title="Baule del Campione" onclick="claimChestBonus('${chestId}', this)">
               <img src="assets/chest-gold.jpg" alt="Baule Premio" class="chest-node-img" width="76" height="76" />
               <span class="chest-label-pill">${isChestClaimed ? '✓ BAULE APERTO' : '🎁 +25 GEMME'}</span>
             </button>
           </div>`
        : '';

      return `
        <div class="node-row ${offsetClass}">
          ${isCompleted ? '<div class="node-stars-crown" aria-label="3 stelle"><span>★</span><span>★</span><span>★</span></div>' : ''}
          ${isCurrent ? '<div class="start-bubble-tag">INIZIA ⚡</div>' : ''}
          <button
            class="path-node-btn ${status}"
            type="button"
            data-unit="${uIdx}"
            data-lesson="${lIdx}"
            aria-label="Unità ${uIdx + 1}, Tappa ${lIdx + 1}: ${esc(lesson.title)}"
            onclick="handleNodeClick(${uIdx}, ${lIdx}, '${status}')"
          >
            <span class="node-icon">${icon}</span>
          </button>
          <span class="node-caption">${esc(lesson.title)}</span>
          ${isCurrent ? `
            <div class="node-mascot-companion" aria-hidden="true">
              <img src="assets/mascot-coach.jpg" alt="" class="node-companion-img" width="52" height="52" />
              <div class="node-mascot-bubble">Tocca a te! ⚽</div>
            </div>
          ` : ''}
        </div>
        ${chestHtml}
      `;
    }).join('');

    return `
      <article class="unit-section" id="unit-sec-${uIdx}">
        <header class="unit-banner-card ${themeClass}">
          <div class="unit-banner-info">
            <div class="unit-banner-top-row">
              <small>${esc(unit.code || `UNITÀ ${uIdx + 1}`)}</small>
              <span class="unit-progress-pill">⭐ ${completedInUnit}/${unit.lessons.length}</span>
            </div>
            <h3>${esc(unit.name)}</h3>
            <p>${esc(unit.description)}</p>
          </div>
          <button class="guidebook-btn" type="button" onclick="openUnitGuide(${uIdx})">
            <span aria-hidden="true">📖</span>
            <span>GUIDA</span>
          </button>
        </header>

        <div class="snake-nodes-track">
          ${nodesHtml}
        </div>
      </article>
    `;
  }).join('');

  container.innerHTML = html;
}

// -------------------------------------------------------------
// 6. SELETTORE RAPIDO UNITÀ, BAULI E GUIDA WIKIDATA LIVE
// -------------------------------------------------------------
function renderUnitJumpModal() {
  const list = $('#unitJumpList');
  if (!list) return;

  list.innerHTML = catalog.units.map((unit, uIdx) => {
    const done = unit.lessons.filter((_, lIdx) =>
      state.completedLessons.includes(`u${uIdx + 1}-l${lIdx + 1}`)
    ).length;
    return `
      <button class="unit-jump-item" type="button" onclick="jumpToUnit(${uIdx})">
        <small>${esc(unit.code || `UNITÀ ${uIdx + 1}`)}</small>
        <b>${esc(unit.name)}</b>
        <span>Completate: ${done} / ${unit.lessons.length} tappe</span>
      </button>
    `;
  }).join('');
}

window.jumpToUnit = (uIdx) => {
  const modal = $('#unitJumpModal');
  if (modal) modal.hidden = true;
  switchTab('path');
  const badgeText = $('#currentUnitBadgeText');
  if (badgeText && catalog.units[uIdx]) {
    badgeText.textContent = `UNITÀ ${uIdx + 1} • ${catalog.units[uIdx].name.toUpperCase().slice(0, 16)}`;
  }
  const target = $(`#unit-sec-${uIdx}`);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

window.handleNodeClick = (uIdx, lIdx, status) => {
  if (status === 'locked') {
    playTone('wrong');
    const unit = catalog.units[uIdx];
    const lesson = unit?.lessons?.[lIdx];
    openModal('🔒 Tappa Bloccata', `
      <p>Completa prima la tappa precedente sul percorso oppure sblocca subito <b>"${esc(lesson?.title || 'Tappa')}"</b> per una sfida di allenamento!</p>
      <div style="margin-top:14px;">
        <button class="btn-primary w-full" type="button" onclick="document.getElementById('sourcesModal').hidden=true; forceStartNode(${uIdx}, ${lIdx});">
          ⚡ GIOCA QUESTA TAPPA ORA
        </button>
      </div>
    `);
    return;
  }

  forceStartNode(uIdx, lIdx);
};

window.forceStartNode = (uIdx, lIdx) => {
  if (state.hearts <= 0) {
    $('#heartsEmptyModal').hidden = false;
    return;
  }

  state.activeUnitIdx = uIdx;
  state.activeLessonIdx = lIdx;
  const lesson = catalog.units[uIdx].lessons[lIdx];
  startQuizSession('path', lesson.players || []);
};

window.claimChestBonus = (chestId, btnEl) => {
  if (state.claimedChests.includes(chestId)) {
    openModal('🎁 Baule Già Riscattato', '<p>Hai già ritirato il tesoro di questo baule! Continua a scalare il percorso per aprirne altri.</p>');
    return;
  }
  state.claimedChests.push(chestId);
  btnEl.classList.add('claimed');
  state.gems += 25;
  state.xp += 15;
  playTone('cheer');
  updateTopStats();
  persistState();
  renderSnakePath();
  openModal('🎉 Baule del Campione Aperto!', `
    <div class="text-center">
      <img src="assets/chest-gold.jpg" alt="Baule" style="width:96px;height:96px;border-radius:50%;border:3px solid #ffc800;margin-bottom:10px;" />
      <p>Hai trovato <b>+25 Calcio-Coins 💎</b> e <b>+15 XP ⚡</b>!</p>
    </div>
  `);
};

window.openUnitGuide = async (uIdx) => {
  const unit = catalog.units[uIdx];
  if (!unit) return;

  const modal = $('#guidebookModal');
  const title = $('#guidebookTitle');
  const body = $('#guidebookBody');

  title.textContent = `📖 ${unit.code}: ${unit.name}`;

  const samplePlayers = [];
  unit.lessons.forEach(l => {
    (l.players || []).forEach(p => {
      if (p.name && samplePlayers.length < 6) samplePlayers.push(p);
    });
  });

  body.innerHTML = `
    <p><strong>Obiettivo didattico:</strong> ${esc(unit.description)}</p>
    <div style="background:var(--bg-soft);padding:14px;border-radius:14px;border:1.5px solid var(--border-light);">
      <h4 style="margin-bottom:8px;">🌟 Protagonisti e Curiosità dell'Unità:</h4>
      <ul style="padding-left:18px;display:flex;flex-direction:column;gap:8px;">
        ${samplePlayers.map(p => `
          <li>
            <b>${esc(p.name)}</b> (${esc(p.era || 'Storico')}) — ${esc(p.check || p.hint || '')}
            ${p.wikidataId ? `<button class="btn-secondary btn-sm" style="margin-left:6px;padding:2px 8px;font-size:10px;" onclick="loadWikidataFact('${esc(p.wikidataId)}', '${esc(p.name)}')">🌐 Wikidata Live</button>` : ''}
          </li>
        `).join('')}
      </ul>
    </div>
    <div id="wikidataLiveBox" style="font-size:13px;color:var(--text-muted);"></div>
  `;

  modal.hidden = false;
};

window.loadWikidataFact = async (qid, playerName) => {
  const box = $('#wikidataLiveBox');
  if (!box) return;
  box.innerHTML = `⏳ Ricerca dati certificati Wikidata per <b>${esc(playerName)}</b> (${esc(qid)})...`;

  const cacheKey = `${WIKI_CACHE_PREFIX}${qid}`;
  try {
    const cachedRaw = localStorage.getItem(cacheKey);
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw);
      if (Date.now() - cached.ts < WIKI_TTL_MS) {
        box.innerHTML = `<div style="background:var(--duo-blue-tint);padding:10px 12px;border-radius:10px;color:#0b5384;">
          ✅ <b>Wikidata Cache (${esc(qid)}):</b> ${esc(cached.desc)}
        </div>`;
        return;
      }
    }

    const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${encodeURIComponent(qid)}&languages=it|en&props=descriptions|labels&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    const entity = data?.entities?.[qid];
    const desc = entity?.descriptions?.it?.value || entity?.descriptions?.en?.value || 'Calciatore professionista verificato su Wikidata.';

    localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), desc }));
    box.innerHTML = `<div style="background:var(--duo-green-tint);padding:10px 12px;border-radius:10px;color:#256b00;">
      🌐 <b>Wikidata Live (${esc(qid)}):</b> ${esc(desc)}
    </div>`;
  } catch (e) {
    box.innerHTML = `⚠️ Connessione offline: utilizzo i dati verificati nel database locale di Fuoriclasse.`;
  }
};

// -------------------------------------------------------------
// 7. MOTORE DEL QUIZ INTERATTIVO (CON CONFETTI & COMBO STREAK)
// -------------------------------------------------------------
function sampleQuestions(pool, count = 5) {
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

function parseCleanQuestionText(rawText = '') {
  // Estrae eventuali tag [Archivio Storico #12] o [Tabellino Storico #4] in un badge pulito
  const match = rawText.match(/\[([^\]]+)\]\s*$/);
  if (match) {
    return {
      cleanText: rawText.replace(/\s*\[[^\]]+\]\s*$/, '').trim(),
      archiveBadge: match[1]
    };
  }
  return { cleanText: rawText, archiveBadge: '' };
}

function startQuizSession(mode, questionsList) {
  if (!questionsList || questionsList.length === 0) return;

  state.quizMode = mode;
  state.currentQuestions = questionsList.map(q => ({
    ...q,
    options: [...(q.options || [])]
  }));
  state.questionIndex = 0;
  state.selectedAnswer = null;
  state.answered = false;
  state.sessionFinished = false;
  state.sessionCorrect = 0;
  state.comboStreak = 0;
  state.quizOpen = true;

  $('#quizQuestionView').hidden = false;
  $('#quizCompletionView').hidden = true;
  $('#quizComboPill').hidden = true;
  $('#quizOverlay').hidden = false;
  stopConfetti();
  renderQuizQuestion();
}

function closeQuizSession() {
  state.quizOpen = false;
  state.sessionFinished = false;
  stopConfetti();
  $('#quizOverlay').hidden = true;
  renderSnakePath();
  renderUnitJumpModal();
  renderQuests();
  renderLeaderboard();
  updateTopStats();
}

function renderQuizQuestion() {
  const q = state.currentQuestions[state.questionIndex];
  if (!q) {
    completeQuizSession();
    return;
  }

  state.selectedAnswer = null;
  state.answered = false;

  // Aggiorna progress bar
  const total = state.currentQuestions.length;
  const pct = Math.max(12, Math.round(((state.questionIndex) / total) * 100));
  const fill = $('#quizProgressFill');
  if (fill) fill.style.width = `${pct}%`;

  $('#quizHeartsNum').textContent = state.hearts;
  $('#quizMascotMood').textContent = state.comboStreak >= 2 ? '🔥' : '🎯';

  // Reset Bottom Drawer
  const drawer = $('#quizBottomDrawer');
  drawer.className = 'quiz-bottom-drawer';
  $('#feedback').innerHTML = '';
  const continueBtn = $('#continueBtn');
  continueBtn.disabled = true;
  continueBtn.textContent = 'VERIFICA';

  // Determina tipo domanda: Carriera Giocatore vs Modalità Tema
  const isPlayer = Boolean(q.name && Array.isArray(q.clubs));
  const tagEl = $('#quizTag');
  const archivePill = $('#quizArchivePill');
  const promptEl = $('#quizPrompt');
  const subEl = $('#quizSubprompt');

  if (isPlayer) {
    const parsedHint = parseCleanQuestionText(q.hint || '');
    tagEl.textContent = `⚽ CARRIERA • ${q.era || 'STORICO'}`;
    if (parsedHint.archiveBadge) {
      archivePill.textContent = parsedHint.archiveBadge;
      archivePill.hidden = false;
    } else {
      archivePill.hidden = true;
    }
    promptEl.textContent = 'Quale calciatore ha vestito queste maglie in carriera?';
    subEl.textContent = parsedHint.cleanText ? `💡 Indizio del Mister: ${parsedHint.cleanText}` : '';
  } else {
    const parsedQ = parseCleanQuestionText(q.question || '');
    tagEl.textContent = `⚡ ${q.tag || 'SFIDA STORICA'}`;
    if (parsedQ.archiveBadge) {
      archivePill.textContent = parsedQ.archiveBadge;
      archivePill.hidden = false;
    } else {
      archivePill.hidden = true;
    }
    promptEl.textContent = parsedQ.cleanText;
    subEl.textContent = q.subprompt || '';
  }

  // Tappe maglie / Timeline di gara
  const routeBox = $('#careerRoute');
  if (isPlayer) {
    routeBox.innerHTML = q.clubs.map((c, i) => `
      ${i > 0 ? '<span class="route-arrow-icon" aria-hidden="true">➔</span>' : ''}
      <div class="club-stop-item">
        <span class="club-stop-kit">${jerseySVG(c[2], c[0])}</span>
        <b class="club-stop-name">${esc(c[1] || c[0])}</b>
        <span class="club-stop-year">${esc(c[3] || '')}</span>
      </div>
    `).join('');
  } else if (q.route && q.route.length) {
    routeBox.innerHTML = q.route.map((r, i) => `
      ${i > 0 ? '<span class="route-arrow-icon" aria-hidden="true">➔</span>' : ''}
      <div class="club-stop-item">
        <div style="background:var(--duo-blue-tint);border:2px solid #93dbfc;border-radius:12px;padding:7px 12px;font-weight:900;font-size:13px;color:#0b699e;">
          ${esc(r[0])}
        </div>
        <span class="club-stop-name">${esc(r[1])}</span>
      </div>
    `).join('');
  } else {
    routeBox.innerHTML = '';
  }

  // 4 Opzioni di Risposta
  const answersBox = $('#answers');
  answersBox.innerHTML = q.options.map((opt, i) => `
    <button class="answer-card-btn" type="button" data-opt="${esc(opt)}" onclick="selectAnswer(this)">
      <span class="key-badge">${i + 1}</span>
      <span>${esc(opt)}</span>
    </button>
  `).join('');
}

window.selectAnswer = (btn) => {
  if (state.answered || state.sessionFinished) return;
  state.selectedAnswer = btn.dataset.opt;

  $$('.answer-card-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');

  const continueBtn = $('#continueBtn');
  continueBtn.disabled = false;
  continueBtn.textContent = 'VERIFICA';
  playTone('click');
};

function verifyAnswer() {
  const q = state.currentQuestions[state.questionIndex];
  const rightAnswer = q.correct || q.name;
  const drawer = $('#quizBottomDrawer');
  const continueBtn = $('#continueBtn');
  const feedback = $('#feedback');

  state.answered = true;
  $$('.answer-card-btn').forEach(b => {
    b.disabled = true;
    if (b.dataset.opt === rightAnswer) b.classList.add('correct');
    else if (b.dataset.opt === state.selectedAnswer) b.classList.add('wrong');
  });

  const isCorrect = state.selectedAnswer === rightAnswer;

  if (isCorrect) {
    state.sessionCorrect++;
    state.todayCorrect++;
    state.comboStreak++;
    state.xp += 10;
    playTone('correct');

    $('#quizMascotMood').textContent = '🥳';
    if (state.comboStreak >= 2) {
      $('#quizComboPill').hidden = false;
      $('#quizComboNum').textContent = `${state.comboStreak}x`;
    }

    drawer.className = 'quiz-bottom-drawer state-correct';
    feedback.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;font-size:17px;margin-bottom:3px;">
        <span>✅</span> <b>GOLAZO! RISPOSTA ESATTA!</b>
      </div>
      <p style="font-size:12.5px;font-weight:700;">${esc(q.check || '')}</p>
    `;
    continueBtn.textContent = 'CONTINUA';
  } else {
    state.comboStreak = 0;
    $('#quizComboPill').hidden = true;
    $('#quizMascotMood').textContent = '💪';

    // In modalità allenamento o sfide extra non togliamo cuori, solo sul percorso ufficiale
    if (state.quizMode === 'path') {
      state.hearts = Math.max(0, state.hearts - 1);
    }
    $('#quizHeartsNum').textContent = state.hearts;
    playTone('wrong');

    drawer.className = 'quiz-bottom-drawer state-wrong';
    feedback.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;font-size:16px;margin-bottom:3px;">
        <span>❌</span> <b>SOLUZIONE CORRETTA: ${esc(rightAnswer)}</b>
      </div>
      <p style="font-size:12.5px;font-weight:700;">${esc(q.check || '')}</p>
    `;
    continueBtn.textContent = 'HO CAPITO';
  }

  updateTopStats();
  persistState();
}

function handleContinueClick() {
  if (state.sessionFinished) {
    closeQuizSession();
    return;
  }

  if (!state.answered) {
    verifyAnswer();
    return;
  }

  // Se vite esaurite durante il percorso principale
  if (state.quizMode === 'path' && state.hearts <= 0) {
    closeQuizSession();
    $('#heartsEmptyModal').hidden = false;
    return;
  }

  state.questionIndex++;
  if (state.questionIndex >= state.currentQuestions.length) {
    completeQuizSession();
  } else {
    renderQuizQuestion();
  }
}

function completeQuizSession() {
  state.sessionFinished = true;
  state.dailyGoalDone++;
  const earnedXp = 40 + (state.sessionCorrect * 10);
  state.xp += 40;
  state.gems += 15;

  // Se era una sessione di recupero cuori, ricarica +1 cuore
  if (state.quizMode === 'practice' && state.hearts < state.maxHearts) {
    state.hearts = Math.min(state.maxHearts, state.hearts + 1);
  }

  playTone('cheer');

  // Se percorso principale: sblocca tappa
  if (state.quizMode === 'path') {
    const key = `u${state.activeUnitIdx + 1}-l${state.activeLessonIdx + 1}`;
    if (!state.completedLessons.includes(key)) {
      state.completedLessons.push(key);
    }
  }

  persistState();
  updateTopStats();

  const fill = $('#quizProgressFill');
  if (fill) fill.style.width = '100%';

  const pct = Math.round((state.sessionCorrect / state.currentQuestions.length) * 100);

  $('#compXpVal').textContent = `+${earnedXp} XP`;
  $('#compAccVal').textContent = `${pct}%`;
  $('#compGemsVal').textContent = '+15 💎';

  $('#quizQuestionView').hidden = true;
  $('#quizCompletionView').hidden = false;

  const drawer = $('#quizBottomDrawer');
  drawer.className = 'quiz-bottom-drawer state-correct';
  $('#feedback').innerHTML = '<b>🏆 Triplice fischio! Ottima prestazione in campo.</b>';
  const continueBtn = $('#continueBtn');
  continueBtn.disabled = false;
  continueBtn.textContent = 'TORNA AL CAMPO ➔';

  launchConfetti();
}

// -------------------------------------------------------------
// 8. MOTORE CONFETTI CANVAS (CELEBRAZIONE VITTORIA)
// -------------------------------------------------------------
let confettiAnimId = null;

function launchConfetti() {
  const canvas = $('#confettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#58cc02', '#ffc800', '#1cb0f6', '#ff9600', '#ce82ff'];
  const pieces = Array.from({ length: 70 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height * 0.5,
    w: 8 + Math.random() * 6,
    h: 10 + Math.random() * 8,
    color: colors[Math.floor(Math.random() * colors.length)],
    vy: 2.5 + Math.random() * 4,
    vx: (Math.random() - 0.5) * 3,
    rot: Math.random() * Math.PI * 2,
    vrot: (Math.random() - 0.5) * 0.14
  }));

  const start = performance.now();
  function frame(now) {
    if (now - start > 2800) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    confettiAnimId = requestAnimationFrame(frame);
  }
  confettiAnimId = requestAnimationFrame(frame);
}

function stopConfetti() {
  if (confettiAnimId) {
    cancelAnimationFrame(confettiAnimId);
    confettiAnimId = null;
  }
  const canvas = $('#confettiCanvas');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// -------------------------------------------------------------
// 9. CLASSIFICA E LEGHE SETTIMANALI (DINAMICA CON ZONA PROMOZIONE)
// -------------------------------------------------------------
function renderLeaderboard() {
  const list = $('#leaderboardList');
  if (!list) return;

  const competitors = [
    { name: 'Campione82', xp: 620, av: 'C' },
    { name: 'BomberVieri', xp: 510, av: 'V' },
    { name: 'IlDivinCodino', xp: 440, av: 'B' },
    { name: 'GigiParate', xp: 380, av: 'G' },
    { name: 'DiavoloRossonero', xp: 350, av: 'D' },
    { name: 'Leo10', xp: 320, av: 'L' },
    { name: 'Azzurro2006', xp: 210, av: 'A' },
    { name: 'Scudetto90', xp: 170, av: 'S' },
    { name: 'TifosoDoc', xp: 110, av: 'T' }
  ];

  const full = [
    ...competitors,
    { name: 'Tu (Mister Fuoriclasse)', xp: state.xp, av: 'M', isUser: true }
  ].sort((a, b) => b.xp - a.xp);

  const rowsHtml = [];
  full.forEach((c, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`;
    rowsHtml.push(`
      <div class="rank-row ${c.isUser ? 'is-user' : ''}">
        <span class="rank-pos">${medal}</span>
        <span class="rank-av">${c.av}</span>
        <span class="rank-name">${esc(c.name)}</span>
        <span class="rank-xp">${c.xp} XP</span>
      </div>
    `);
    if (i === 4) {
      rowsHtml.push(`<div class="promotion-divider">▲ ZONA PROMOZIONE LEGA FUORICLASSE ▲</div>`);
    }
  });

  list.innerHTML = rowsHtml.join('');
}

// -------------------------------------------------------------
// 10. MISSIONI GIORNALIERE E BACHECA TROFEI DINAMICA
// -------------------------------------------------------------
function renderQuests() {
  const m1 = Math.min(5, state.todayCorrect);
  const m1Pct = Math.round((m1 / 5) * 100);
  if ($('#quest1Fill')) $('#quest1Fill').style.width = `${m1Pct}%`;
  if ($('#quest1Label')) $('#quest1Label').textContent = `${m1} / 5 campioni indovinati`;

  const m2 = Math.min(50, state.xp);
  const m2Pct = Math.round((m2 / 50) * 100);
  if ($('#quest2Fill')) $('#quest2Fill').style.width = `${m2Pct}%`;
  if ($('#quest2Label')) $('#quest2Label').textContent = `${m2} / 50 XP guadagnati`;

  const m3 = Math.min(3, state.completedLessons.length);
  const m3Pct = Math.round((m3 / 3) * 100);
  if ($('#quest3Fill')) $('#quest3Fill').style.width = `${m3Pct}%`;
  if ($('#quest3Label')) $('#quest3Label').textContent = `${m3} / 3 lezioni completate`;

  // Rail Goal
  if ($('#railGoalFill')) $('#railGoalFill').style.width = `${m1Pct}%`;
  if ($('#railGoalText')) $('#railGoalText').textContent = `${m1} / 5 sfide completate oggi`;
  if ($('#railGoalPct')) $('#railGoalPct').textContent = `${m1Pct}%`;

  // Aggiorna Bacheca Trofei
  let unlockedCount = 2;
  const u1Done = Array.from({ length: 12 }, (_, i) => `u1-l${i + 1}`).every(k => state.completedLessons.includes(k));
  if (u1Done) {
    $('#badge-bandiera')?.classList.add('unlocked');
    unlockedCount++;
  }
  if (state.xp >= 200) {
    $('#badge-capocannoniere')?.classList.add('unlocked');
    unlockedCount++;
  }
  if (state.completedLessons.length >= 5) {
    $('#badge-champions')?.classList.add('unlocked');
    unlockedCount++;
  }
  if (state.xp >= 500) {
    $('#badge-fuoriclasse')?.classList.add('unlocked');
    unlockedCount++;
  }
  if ($('#badgesUnlockedCount')) {
    $('#badgesUnlockedCount').textContent = `${unlockedCount} / 6 Sbloccati`;
  }
}

// -------------------------------------------------------------
// 11. AGGIORNAMENTO STATISTICHE TOPBAR E PROFILO
// -------------------------------------------------------------
function updateTopStats() {
  if ($('#streakCount')) $('#streakCount').textContent = state.streak;
  if ($('#gemsCount')) $('#gemsCount').textContent = state.gems;
  if ($('#heartsCount')) $('#heartsCount').textContent = state.hearts;
  if ($('#railStreakCount')) $('#railStreakCount').textContent = state.streak;
  if ($('#railHeartsCount')) $('#railHeartsCount').textContent = `${state.hearts}/${state.maxHearts}`;

  if ($('#profileTotalXp')) $('#profileTotalXp').textContent = state.xp;
  if ($('#profileStreak')) $('#profileStreak').textContent = state.streak;
  if ($('#profileGems')) $('#profileGems').textContent = state.gems;
  if ($('#profileHearts')) $('#profileHearts').textContent = `${state.hearts} / ${state.maxHearts}`;
  if ($('#profileCompletedTag')) $('#profileCompletedTag').textContent = `✅ ${state.completedLessons.length} Tappe`;

  const level = Math.max(1, Math.floor(state.xp / 100) + 1);
  if ($('#profileLevelBadge')) $('#profileLevelBadge').textContent = `LIV. ${level}`;

  const todayDay = new Date().getDay();
  $$('#railStreakDays .day-dot').forEach(el => {
    const d = Number(el.dataset.day);
    el.classList.toggle('today', d === todayDay);
  });
}

// -------------------------------------------------------------
// 12. CAMBIO SCHEDA / TAB SWITCHER
// -------------------------------------------------------------
function switchTab(tabId) {
  state.activeTab = tabId;

  $$('.view-panel').forEach(p => p.hidden = true);
  const target = $(`#view-${tabId}`);
  if (target) target.hidden = false;

  $$('.sidebar-nav .nav-item').forEach(link => {
    link.classList.toggle('active', link.dataset.tab === tabId);
  });

  $$('.duo-mobile-nav .mobile-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// -------------------------------------------------------------
// 13. EFFETTI AUDIO WEB AUDIO API (CHIME STILE DUOLINGO)
// -------------------------------------------------------------
let audioCtx = null;

function playTone(type) {
  if (!state.soundEnabled) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;

    if (type === 'correct') {
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(587.33, now);
      osc1.frequency.setValueAtTime(880, now + 0.11);

      osc2.frequency.setValueAtTime(293.66, now);
      osc2.frequency.setValueAtTime(440, now + 0.11);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.34);
      osc2.stop(now + 0.34);
    } else if (type === 'wrong') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.26);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.28);
    } else if (type === 'click') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } else if (type === 'cheer') {
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.15, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.3);
      });
    }
  } catch (e) {}
}

// -------------------------------------------------------------
// 14. SINTESI VOCALE DOMANDE
// -------------------------------------------------------------
function speakCurrentQuestion() {
  if (!('speechSynthesis' in window)) return;
  const q = state.currentQuestions[state.questionIndex];
  if (!q) return;

  window.speechSynthesis.cancel();
  const parsed = parseCleanQuestionText(q.question || '');
  const text = q.name
    ? `Quale calciatore ha vestito queste maglie? Opzioni: ${q.options.join(', ')}`
    : `${parsed.cleanText}. Opzioni: ${q.options.join(', ')}`;

  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'it-IT';
  u.rate = 1.0;
  window.speechSynthesis.speak(u);
}

// -------------------------------------------------------------
// 15. GESTIONE MODALI E EVENT LISTENERS
// -------------------------------------------------------------
function openModal(title, htmlContent) {
  const modal = $('#sourcesModal');
  if (!modal) return;
  modal.querySelector('h2').textContent = title;
  $('#sourcesModalBody').innerHTML = htmlContent;
  modal.hidden = false;
}

document.addEventListener('DOMContentLoaded', () => {
  loadState();

  document.body.setAttribute('data-theme', state.theme);
  const themeIcon = $('#themeIcon');
  if (themeIcon) themeIcon.textContent = state.theme === 'dark' ? '☀️' : '🌙';

  loadCurriculum();

  // Tab switchers (Desktop e Mobile)
  $$('.sidebar-nav .nav-item, .duo-mobile-nav .mobile-nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(btn.dataset.tab);
    });
  });

  // Brand Home Link
  $('#brandHomeLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchTab('path');
  });

  // Hero Quick Play ("SCENDI IN CAMPO ⚡")
  $('#heroQuickPlayBtn')?.addEventListener('click', () => {
    const { uIdx, lIdx } = getActiveLessonCoords();
    forceStartNode(uIdx, lIdx);
  });

  // Selettore Rapido Unità (Topbar + Hero)
  $('#sectionDropdownBtn')?.addEventListener('click', () => {
    renderUnitJumpModal();
    $('#unitJumpModal').hidden = false;
  });
  $('#heroJumpUnitBtn')?.addEventListener('click', () => {
    renderUnitJumpModal();
    $('#unitJumpModal').hidden = false;
  });
  $('#unitJumpClose')?.addEventListener('click', () => {
    $('#unitJumpModal').hidden = true;
  });

  // Toggle Audio
  const audioBtn = $('#audioToggle');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      $('#audioIcon').textContent = state.soundEnabled ? '♫' : '🔇';
      audioBtn.setAttribute('aria-pressed', String(state.soundEnabled));
      persistState();
    });
  }

  // Toggle Tema Dark / Light
  const themeBtn = $('#themeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      document.body.setAttribute('data-theme', state.theme);
      $('#themeIcon').textContent = state.theme === 'dark' ? '☀️' : '🌙';
      persistState();
    });
  }

  // Quiz Continue & Close
  $('#continueBtn')?.addEventListener('click', handleContinueClick);
  $('#quizClose')?.addEventListener('click', closeQuizSession);
  $('#listenButton')?.addEventListener('click', speakCurrentQuestion);

  // Scorciatoie da tastiera (1, 2, 3, 4, Invio, Esc)
  document.addEventListener('keydown', (e) => {
    if (!state.quizOpen) return;
    if (['1', '2', '3', '4'].includes(e.key)) {
      const idx = Number(e.key) - 1;
      const btns = $$('.answer-card-btn');
      if (btns[idx] && !btns[idx].disabled) btns[idx].click();
    } else if (e.key === 'Enter') {
      const btn = $('#continueBtn');
      if (btn && !btn.disabled) btn.click();
    } else if (e.key === 'Escape') {
      closeQuizSession();
    }
  });

  // Modal Closers
  $('#guidebookClose')?.addEventListener('click', () => $('#guidebookModal').hidden = true);
  $('#guidebookOkBtn')?.addEventListener('click', () => $('#guidebookModal').hidden = true);
  $('#sourcesClose')?.addEventListener('click', () => $('#sourcesModal').hidden = true);
  $('#authClose')?.addEventListener('click', () => $('#authModal').hidden = true);
  $('#authOkBtn')?.addEventListener('click', () => $('#authModal').hidden = true);

  // Pulsanti Modale Auth / Deploy & Fonti
  $('#openAuthModalBtn')?.addEventListener('click', () => $('#authModal').hidden = false);
  $('#sidebarDeployBtn')?.addEventListener('click', () => $('#authModal').hidden = false);
  $('#sidebarSourcesBtn')?.addEventListener('click', () => $('#sourcesModal').hidden = false);

  // Modal Cuori Finiti: Allenati o Ricarica
  $('#practiceToRegainHeartBtn')?.addEventListener('click', () => {
    $('#heartsEmptyModal').hidden = true;
    const practiceQuestions = sampleQuestions(catalog.extraModes.goals || [], 5);
    startQuizSession('practice', practiceQuestions);
  });

  $('#refillHeartsCoinsBtn')?.addEventListener('click', () => {
    if (state.gems >= 50) {
      state.gems -= 50;
      state.hearts = state.maxHearts;
      $('#heartsEmptyModal').hidden = true;
      playTone('cheer');
      updateTopStats();
      persistState();
    } else {
      openModal('💎 Calcio-Coins Insufficienti', '<p>Ti servono almeno <b>50 Calcio-Coins 💎</b> per ricaricare tutti i cuori, oppure fai un allenamento gratuito!</p>');
    }
  });

  $('#practiceHeartsBtn')?.addEventListener('click', () => {
    const practiceQuestions = sampleQuestions(catalog.extraModes.goals || [], 5);
    startQuizSession('practice', practiceQuestions);
  });

  // Modalità Extra (Estrazione casuale di 5 sfide dal pool di 150/100/80 domande)
  $$('.extra-card').forEach(card => {
    card.addEventListener('click', () => {
      const mode = card.dataset.mode;
      const pool = catalog.extraModes[mode] || [];
      const questions = sampleQuestions(pool, 5);
      if (questions.length) {
        startQuizSession(mode, questions);
      }
    });
  });

  // Pulizia Cache Wikidata
  $('#clearLocalWikiCacheBtn')?.addEventListener('click', () => {
    let count = 0;
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith(WIKI_CACHE_PREFIX)) {
        localStorage.removeItem(k);
        count++;
      }
    });
    openModal('🔄 Cache Wikidata Ripulita', `<p>Sono state rimosse <b>${count}</b> voci dalla cache locale. Alla prossima apertura delle Guide Unità verranno scaricati i dati aggiornati.</p>`);
  });

  // Reset Progressi
  $('#resetProgressBtn')?.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    state.xp = 120;
    state.streak = 1;
    state.gems = 250;
    state.hearts = 5;
    state.completedLessons = ['u1-l1'];
    state.claimedChests = [];
    state.todayCorrect = 0;
    persistState();
    renderSnakePath();
    renderLeaderboard();
    renderQuests();
    updateTopStats();
    openModal('✅ Progressi Azzerati', '<p>Il tuo profilo locale è stato riportato all\'inizio della Stagione 1.</p>');
  });
});

// -------------------------------------------------------------
// 16. REGISTRAZIONE SERVICE WORKER (PWA OFFLINE COMPLETA)
// -------------------------------------------------------------
if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.info('Fuoriclasse Service Worker attivo (PWA Ready):', reg.scope))
      .catch(err => console.warn('Registrazione Service Worker:', err.message));
  });
}
