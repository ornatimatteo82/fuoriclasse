/**
 * ============================================================================
 * FUORICLASSE — MOTORE DI GIOCO DIVISO PER MODALITÀ (GAEL LEAGUE & QUIZZOCAMPO)
 * ============================================================================
 * - Modalità 1: GAEL LEAGUE (Indovina il calciatore dalle maglie / carriera: Anni '90 & 2000)
 * - Modalità 2: QUIZZOCAMPO (Il grande quiz del calcio: Serie A, Bomber, Derby, Coppe)
 * - Percorso a serpentina 3D separato per ciascuna modalità + Arene Rapide
 * ============================================================================
 */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const esc = (str = '') => String(str).replace(/[&<>"']/g, (m) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[m]));
const sanitizeUsername = (raw = '') => String(raw).replace(/[<>"'`&\x00-\x1F\x7F]/g, '').trim().slice(0, 24);

const STORAGE_KEY = 'fuoriclasse_argon_state_v4';
const SUPA_CONFIG_KEY = 'fuoriclasse_supabase_config_v1';
const ONBOARDING_DONE_KEY = 'fuoriclasse_onboarding_done_v1';
const WIKI_CACHE_PREFIX = 'fuoriclasse_wikidata_v1_';
const WIKI_TTL_MS = 14 * 24 * 60 * 60 * 1000;

// Configurazione Supabase Ufficiale Pre-collegata
const DEFAULT_SUPABASE_URL = 'https://zmasnwtbahotcdvqdhfd.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_HseKP-eaKFM6Ebpi1V2jSg_mYZnwWq3';
let supabaseClient = null;
let currentCloudUser = null;

// -------------------------------------------------------------
// 1. STATO GLOBALE GIOCATORE & MODALITÀ ATTIVA
// -------------------------------------------------------------
const state = {
  username: 'Mister Fuoriclasse',
  xp: 120,
  streak: 3,
  gems: 250,
  hearts: 5,
  maxHearts: 5,
  soundEnabled: true,
  theme: 'light',
  activeTab: 'path',
  activeSport: 'calcio', // 'calcio' | 'f1' | 'basket'
  categoryStreaks: {
    calcio: { streak: 3, lastDay: null, freezeCount: 1 },
    f1: { streak: 0, lastDay: null, freezeCount: 0 },
    basket: { streak: 0, lastDay: null, freezeCount: 0 }
  },
  activeGameMode: 'quizzocampo', // 'quizzocampo' | 'gael' | 'pastore' | 'f1-percorso' | 'basket-percorso'
  lastHeartsRefillDay: new Date().toLocaleDateString('en-CA'),

  // Progressi percorso: chiavi 'u1-l1' completate e bauli riscattati
  completedLessons: ['u1-l1', 'u11-l1'],
  claimedChests: [],
  dailyGoalDone: 1,
  dailyGoalTarget: 5,
  todayCorrect: 2,

  // Stato Partita attiva
  quizOpen: false,
  quizMode: 'path',
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
  gaelModes: { anni90: [], anni2000: [], allstars: [] },
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
    <svg viewBox="0 0 64 64" role="img" aria-label="Maglia ${esc(label)}" shape-rendering="crispEdges">
      <path d="M20 10 L26 14 L38 14 L44 10 L56 18 L50 30 L46 27 L46 56 L18 56 L18 27 L14 30 L8 18 Z"
            fill="${k.bg}" stroke="#0f172a" stroke-width="3" stroke-linejoin="miter"/>
      <clipPath id="clip-${esc(kitKey)}-${esc(initials)}">
        <path d="M20 10 L26 14 L38 14 L44 10 L56 18 L50 30 L46 27 L46 56 L18 56 L18 27 L14 30 L8 18 Z"/>
      </clipPath>
      <g clip-path="url(#clip-${esc(kitKey)}-${esc(initials)})">
        ${pattern}
      </g>
      <path d="M25 12 L32 18 L39 12" fill="none" stroke="${k.s1}" stroke-width="3"/>
      <rect x="20" y="30" width="24" height="13" fill="#0f172a"/>
      <rect x="21" y="31" width="22" height="11" fill="#1e293b"/>
      <text x="32" y="39.5" text-anchor="middle" font-size="7" font-weight="900" fill="#ffc800" font-family="'Press Start 2P', monospace">${esc(initials)}</text>
    </svg>
  `;
}

// -------------------------------------------------------------
// 2B. ICONE 8/16-BIT PIXEL-ART ANNI '80 (STILE ARCADE / TSUBASA)
// -------------------------------------------------------------
const PIXEL_ICONS = {
  ball: `<svg class="pixel-svg-icon" viewBox="0 0 16 16" shape-rendering="crispEdges"><rect x="5" y="1" width="6" height="14" fill="#ffffff"/><rect x="1" y="5" width="14" height="6" fill="#ffffff"/><rect x="3" y="3" width="10" height="10" fill="#ffffff"/><rect x="5" y="0" width="6" height="1" fill="#0f172a"/><rect x="5" y="15" width="6" height="1" fill="#0f172a"/><rect x="0" y="5" width="1" height="6" fill="#0f172a"/><rect x="15" y="5" width="1" height="6" fill="#0f172a"/><rect x="3" y="1" width="2" height="2" fill="#0f172a"/><rect x="11" y="1" width="2" height="2" fill="#0f172a"/><rect x="1" y="3" width="2" height="2" fill="#0f172a"/><rect x="13" y="3" width="2" height="2" fill="#0f172a"/><rect x="1" y="11" width="2" height="2" fill="#0f172a"/><rect x="13" y="11" width="2" height="2" fill="#0f172a"/><rect x="3" y="13" width="2" height="2" fill="#0f172a"/><rect x="11" y="13" width="2" height="2" fill="#0f172a"/><rect x="6" y="6" width="4" height="4" fill="#0f172a"/><rect x="7" y="2" width="2" height="2" fill="#0f172a"/><rect x="2" y="7" width="2" height="2" fill="#0f172a"/><rect x="12" y="7" width="2" height="2" fill="#0f172a"/><rect x="5" y="12" width="2" height="2" fill="#0f172a"/><rect x="9" y="12" width="2" height="2" fill="#0f172a"/></svg>`,
  jersey: `<svg class="pixel-svg-icon" viewBox="0 0 16 16" shape-rendering="crispEdges"><rect x="4" y="2" width="8" height="12" fill="#0066cc"/><rect x="1" y="4" width="3" height="5" fill="#0066cc"/><rect x="12" y="4" width="3" height="5" fill="#0066cc"/><rect x="6" y="2" width="4" height="2" fill="#ffc800"/><rect x="7" y="6" width="2" height="5" fill="#ffffff"/><rect x="4" y="1" width="8" height="1" fill="#0f172a"/><rect x="4" y="14" width="8" height="1" fill="#0f172a"/></svg>`,
  star: `<svg class="pixel-svg-icon" viewBox="0 0 16 16" shape-rendering="crispEdges"><rect x="7" y="1" width="2" height="14" fill="#ffc800"/><rect x="1" y="6" width="14" height="3" fill="#ffc800"/><rect x="4" y="4" width="8" height="7" fill="#ffc800"/><rect x="3" y="11" width="3" height="3" fill="#ffc800"/><rect x="10" y="11" width="3" height="3" fill="#ffc800"/><rect x="6" y="5" width="2" height="2" fill="#fffbeb"/></svg>`,
  flame: `<svg class="pixel-svg-icon" viewBox="0 0 16 16" shape-rendering="crispEdges"><rect x="7" y="1" width="2" height="3" fill="#ff4b4b"/><rect x="5" y="4" width="6" height="4" fill="#ff4b4b"/><rect x="3" y="7" width="10" height="6" fill="#ff9600"/><rect x="5" y="13" width="6" height="2" fill="#ff4b4b"/><rect x="6" y="8" width="4" height="5" fill="#ffc800"/><rect x="7" y="10" width="2" height="3" fill="#ffffff"/></svg>`,
  gem: `<svg class="pixel-svg-icon" viewBox="0 0 16 16" shape-rendering="crispEdges"><rect x="4" y="2" width="8" height="3" fill="#38bdf8"/><rect x="2" y="5" width="12" height="4" fill="#0284c7"/><rect x="4" y="9" width="8" height="3" fill="#0369a1"/><rect x="6" y="12" width="4" height="2" fill="#0284c7"/><rect x="7" y="14" width="2" height="1" fill="#0369a1"/><rect x="5" y="3" width="3" height="2" fill="#e0f2fe"/></svg>`,
  heart: `<svg class="pixel-svg-icon" viewBox="0 0 16 16" shape-rendering="crispEdges"><rect x="2" y="3" width="5" height="2" fill="#ff4b4b"/><rect x="9" y="3" width="5" height="2" fill="#ff4b4b"/><rect x="1" y="5" width="14" height="4" fill="#ff4b4b"/><rect x="3" y="9" width="10" height="2" fill="#ea2b2b"/><rect x="5" y="11" width="6" height="2" fill="#ea2b2b"/><rect x="7" y="13" width="2" height="2" fill="#b91c1c"/><rect x="3" y="4" width="2" height="2" fill="#fecaca"/></svg>`,
  trophy: `<svg class="pixel-svg-icon" viewBox="0 0 16 16" shape-rendering="crispEdges"><rect x="4" y="2" width="8" height="6" fill="#ffc800"/><rect x="2" y="3" width="2" height="3" fill="#e5a400"/><rect x="12" y="3" width="2" height="3" fill="#e5a400"/><rect x="6" y="8" width="4" height="3" fill="#e5a400"/><rect x="4" y="11" width="8" height="2" fill="#ffc800"/><rect x="3" y="13" width="10" height="2" fill="#78350f"/><rect x="5" y="3" width="2" height="3" fill="#fef08a"/></svg>`,
  bolt: `<svg class="pixel-svg-icon" viewBox="0 0 16 16" shape-rendering="crispEdges"><rect x="8" y="1" width="4" height="3" fill="#ffc800"/><rect x="6" y="4" width="5" height="3" fill="#ffc800"/><rect x="4" y="7" width="8" height="2" fill="#fef08a"/><rect x="6" y="9" width="5" height="3" fill="#ffc800"/><rect x="4" y="12" width="4" height="3" fill="#e5a400"/></svg>`,
  shield: `<svg class="pixel-svg-icon" viewBox="0 0 16 16" shape-rendering="crispEdges"><rect x="3" y="2" width="10" height="6" fill="#1cb0f6"/><rect x="4" y="8" width="8" height="3" fill="#0284c7"/><rect x="6" y="11" width="4" height="2" fill="#0369a1"/><rect x="7" y="13" width="2" height="1" fill="#0369a1"/><rect x="7" y="2" width="2" height="11" fill="#ffc800"/></svg>`,
  crown: `<svg class="pixel-svg-icon" viewBox="0 0 16 16" shape-rendering="crispEdges"><rect x="2" y="4" width="2" height="7" fill="#ffc800"/><rect x="7" y="3" width="2" height="8" fill="#ffc800"/><rect x="12" y="4" width="2" height="7" fill="#ffc800"/><rect x="2" y="7" width="12" height="5" fill="#ffc800"/><rect x="2" y="12" width="12" height="2" fill="#b45309"/><rect x="4" y="9" width="2" height="2" fill="#ef4444"/><rect x="10" y="9" width="2" height="2" fill="#3b82f6"/></svg>`,
  check: `<svg class="pixel-svg-icon" viewBox="0 0 16 16" shape-rendering="crispEdges"><rect x="11" y="3" width="3" height="3" fill="#ffffff"/><rect x="9" y="5" width="3" height="3" fill="#ffffff"/><rect x="7" y="7" width="3" height="3" fill="#ffffff"/><rect x="5" y="9" width="3" height="3" fill="#ffffff"/><rect x="3" y="7" width="3" height="3" fill="#ffffff"/></svg>`
};

// -------------------------------------------------------------
// 3. SALVATAGGIO E RIPRISTINO STATO (LOCALSTORAGE)
// -------------------------------------------------------------
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (typeof saved === 'object' && saved !== null) {
      if (typeof saved.username === 'string' && saved.username.trim()) {
        state.username = saved.username.trim();
      }
      state.xp = Number.isFinite(saved.xp) ? saved.xp : state.xp;
      state.streak = Number.isFinite(saved.streak) ? saved.streak : state.streak;
      state.gems = Number.isFinite(saved.gems) ? saved.gems : state.gems;
      state.hearts = Number.isFinite(saved.hearts) ? saved.hearts : state.hearts;
      state.soundEnabled = typeof saved.soundEnabled === 'boolean' ? saved.soundEnabled : true;
      state.theme = saved.theme === 'dark' ? 'dark' : 'light';
      if (saved.activeSport && ['calcio', 'f1', 'basket'].includes(saved.activeSport)) {
        state.activeSport = saved.activeSport;
      }
      if (saved.categoryStreaks && typeof saved.categoryStreaks === 'object') {
        state.categoryStreaks = {
          calcio: {
            streak: Number(saved.categoryStreaks.calcio?.streak) || 1,
            lastDay: saved.categoryStreaks.calcio?.lastDay || null,
            freezeCount: Number(saved.categoryStreaks.calcio?.freezeCount) || 1
          },
          f1: {
            streak: Number(saved.categoryStreaks.f1?.streak) || 0,
            lastDay: saved.categoryStreaks.f1?.lastDay || null,
            freezeCount: Number(saved.categoryStreaks.f1?.freezeCount) || 0
          },
          basket: {
            streak: Number(saved.categoryStreaks.basket?.streak) || 0,
            lastDay: saved.categoryStreaks.basket?.lastDay || null,
            freezeCount: Number(saved.categoryStreaks.basket?.freezeCount) || 0
          }
        };
      } else if (Number.isFinite(saved.streak)) {
        state.categoryStreaks.calcio.streak = saved.streak;
      }
      state.activeGameMode = saved.activeGameMode || (state.activeSport === 'f1' ? 'f1-percorso' : state.activeSport === 'basket' ? 'basket-percorso' : 'quizzocampo');
      if (typeof saved.lastHeartsRefillDay === 'string') {
        state.lastHeartsRefillDay = saved.lastHeartsRefillDay;
      }
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
    const activeStreak = state.categoryStreaks?.[state.activeSport]?.streak || 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      username: state.username,
      xp: state.xp,
      streak: activeStreak,
      activeSport: state.activeSport,
      categoryStreaks: state.categoryStreaks,
      gems: state.gems,
      hearts: state.hearts,
      lastHeartsRefillDay: state.lastHeartsRefillDay,
      soundEnabled: state.soundEnabled,
      theme: state.theme,
      activeGameMode: state.activeGameMode,
      completedLessons: state.completedLessons,
      claimedChests: state.claimedChests,
      dailyGoalDone: state.dailyGoalDone,
      todayCorrect: state.todayCorrect
    }));
  } catch (e) {
    console.warn('Impossibile salvare lo stato:', e);
  }
  syncProfileToSupabase();
}

// -------------------------------------------------------------
// 3B. INTEGRAZIONE CLOUD SUPABASE (AUTH + PROFILES + CLASSIFICA)
// -------------------------------------------------------------
function getSupabaseCreds() {
  try {
    const saved = JSON.parse(localStorage.getItem(SUPA_CONFIG_KEY) || '{}');
    return {
      url: (saved.url || DEFAULT_SUPABASE_URL || '').trim(),
      key: (saved.key || DEFAULT_SUPABASE_ANON_KEY || '').trim()
    };
  } catch (e) {
    return { url: DEFAULT_SUPABASE_URL, key: DEFAULT_SUPABASE_ANON_KEY };
  }
}

async function initSupabase() {
  const { url, key } = getSupabaseCreds();
  if ($('#supaUrlInput')) $('#supaUrlInput').value = url;
  if ($('#supaKeyInput')) $('#supaKeyInput').value = key;

  if (!url || !key || !window.supabase) {
    updateCloudStatusUI(null, false);
    return;
  }

  try {
    supabaseClient = window.supabase.createClient(url, key);
    const { data } = await supabaseClient.auth.getSession();
    currentCloudUser = data?.session?.user || null;
    updateCloudStatusUI(currentCloudUser, true);

    if (currentCloudUser) {
      await pullProfileFromSupabase();
    } else if (!localStorage.getItem(ONBOARDING_DONE_KEY)) {
      // Mostra da subito lo spogliatoio di Login Google + Scelta Username al primo ingresso
      const authModal = $('#authModal');
      if (authModal) authModal.hidden = false;
    }

    supabaseClient.auth.onAuthStateChange(async (event, session) => {
      currentCloudUser = session?.user || null;
      updateCloudStatusUI(currentCloudUser, true);
      updateHomeInstallBannerVisibility();

      if (currentCloudUser) {
        await pullProfileFromSupabase();
        renderLeaderboard();
        // Se l'utente entra con Google e ha ancora il nome di default, apri subito la scelta Nickname!
        if (event === 'SIGNED_IN' || (!state.username || state.username === 'Mister Fuoriclasse')) {
          const suggested = (currentCloudUser.user_metadata?.full_name || currentCloudUser.email?.split('@')[0] || '')
            .replace(/\s+/g, '')
            .slice(0, 18);
          if ($('#onboardingUsernameInput') && (!state.username || state.username === 'Mister Fuoriclasse')) {
            $('#onboardingUsernameInput').value = suggested || 'Bomber' + Math.floor(Math.random() * 90 + 10);
          }
          const authModal = $('#authModal');
          if (authModal && (!state.username || state.username === 'Mister Fuoriclasse')) {
            authModal.hidden = false;
            $('#onboardingUsernameInput')?.focus();
          }
        }
      }
    });
  } catch (err) {
    console.warn('Errore inizializzazione Supabase:', err.message);
    updateCloudStatusUI(null, false);
  }
}

function updateCloudStatusUI(user, isConfigured) {
  const badge = $('#cloudStatusBadge');
  const text = $('#cloudStatusText');
  const loggedOutView = $('#authLoggedOutView');
  const loggedInView = $('#authLoggedInView');
  const userEmailEl = $('#authCurrentUserEmail');

  if (!isConfigured) {
    if (badge) badge.textContent = 'Modalità Locale';
    if (text) text.textContent = 'Salvataggio automatico su dispositivo attivo.';
    if (loggedOutView) loggedOutView.hidden = false;
    if (loggedInView) loggedInView.hidden = true;
    return;
  }

  if (user) {
    if (badge) badge.textContent = '🟢 Account Connesso';
    if (text) text.textContent = `Profilo sincronizzato automaticamente nel cloud (${user.email}).`;
    if (loggedOutView) loggedOutView.hidden = true;
    if (loggedInView) loggedInView.hidden = false;
    if (userEmailEl) userEmailEl.textContent = user.email;
  } else {
    if (badge) badge.textContent = 'Ospite Locale';
    if (text) text.textContent = 'Accedi con Google o Email per sincronizzare i tuoi progressi e comparire nella Classifica Globale.';
    if (loggedOutView) loggedOutView.hidden = false;
    if (loggedInView) loggedInView.hidden = true;
  }
}

async function pullProfileFromSupabase() {
  if (!supabaseClient || !currentCloudUser) return;
  try {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', currentCloudUser.id)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      state.username = sanitizeUsername(data.username) || state.username;
      state.xp = Math.max(0, Math.min(1000000, Math.max(state.xp, Number(data.xp) || 0)));
      state.streak = Math.max(1, Math.min(3650, Math.max(state.streak, Number(data.streak) || 1)));
      state.gems = Math.max(0, Math.min(1000000, Math.max(state.gems, Number(data.gems) || 250)));
      if (Array.isArray(data.completed_lessons)) {
        state.completedLessons = Array.from(new Set([...state.completedLessons, ...data.completed_lessons]));
      }
      if (Array.isArray(data.claimed_chests)) {
        state.claimedChests = Array.from(new Set([...state.claimedChests, ...data.claimed_chests]));
      }
      updateTopStats();
      renderSnakePath();
    } else {
      await syncProfileToSupabase();
    }
  } catch (err) {
    console.warn('Pull profilo Supabase:', err.message);
  }
}

async function syncProfileToSupabase() {
  if (!supabaseClient || !currentCloudUser) return;
  try {
    const cleanName = sanitizeUsername(state.username) || 'Mister Fuoriclasse';
    const avatarLetter = cleanName.charAt(0).toUpperCase() || 'M';
    await supabaseClient.from('profiles').upsert({
      id: currentCloudUser.id,
      username: cleanName,
      avatar_letter: avatarLetter,
      xp: Math.max(0, Math.floor(Number(state.xp) || 0)),
      streak: Math.max(1, Math.floor(Number(state.streak) || 1)),
      gems: Math.max(0, Math.floor(Number(state.gems) || 0)),
      hearts: Math.max(0, Math.min(state.maxHearts, Math.floor(Number(state.hearts) || 0))),
      completed_lessons: state.completedLessons,
      claimed_chests: state.claimedChests,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Sync profilo Supabase:', err.message);
  }
}

// -------------------------------------------------------------
// 3C. TELEMETRIA & ANALYTICS LEGGERO (ZERO COOKIE, GDPR FRIENDLY)
// -------------------------------------------------------------
function trackEvent(eventName, metadata = {}) {
  try {
    const isPwa = window.matchMedia('(display-mode: standalone)').matches || Boolean(window.navigator.standalone);
    const payload = {
      event_name: eventName,
      sport: state.activeSport || 'calcio',
      is_pwa: isPwa,
      metadata: {
        path: window.location.pathname,
        mode: state.activeGameMode || 'default',
        ts: new Date().toISOString(),
        ...metadata
      }
    };

    // Telemetria first-party non bloccante via Supabase
    if (supabaseClient) {
      supabaseClient.from('analytics_events').insert(payload).then(() => {}).catch(() => {});
    }

    // Hook universale per eventuale analytics leggero esterno (GoatCounter, Umami, Plausible)
    if (window.goatcounter && typeof window.goatcounter.count === 'function') {
      window.goatcounter.count({ path: eventName, title: eventName, event: true });
    }
    if (typeof window.plausible === 'function') {
      window.plausible(eventName, { props: payload.metadata });
    }
  } catch (e) {
    // Non blocca mai l'esperienza utente
  }
}
window.trackEvent = trackEvent;


// -------------------------------------------------------------
// 4. CARICAMENTO MULTI-SPORT & CURRICULUM (CALCIO, F1 BOOMER, BASKET NBA)
// -------------------------------------------------------------
const loadedSportCatalogs = {
  calcio: null,
  f1: null,
  basket: null
};

async function loadSportCurriculum(sport = state.activeSport) {
  if (loadedSportCatalogs[sport]) {
    catalog = loadedSportCatalogs[sport];
    return catalog;
  }

  let jsonUrl = 'data/curriculum.json?v=32';
  if (sport === 'f1') jsonUrl = 'data/curriculum-f1.json?v=32';
  else if (sport === 'basket') jsonUrl = 'data/curriculum-basket.json?v=32';

  try {
    const res = await fetch(jsonUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data && Array.isArray(data.units) && data.units.length > 0) {
      loadedSportCatalogs[sport] = data;
      catalog = data;
    }
  } catch (err) {
    console.warn(`Caricamento curriculum ${sport} non riuscito:`, err.message);
  }
  return catalog;
}

function updateSportBadgeUI() {
  const sp = state.activeSport || 'calcio';
  const emojiEl = $('#currentSportEmoji');
  const textEl = $('#currentSportText');
  const btnEl = $('#sportSelectorBtn');

  if (sp === 'f1') {
    if (emojiEl) emojiEl.textContent = '🏎️';
    if (textEl) textEl.textContent = 'F1 BOOMER';
    if (btnEl) btnEl.className = 'sport-badge-btn sport-f1';
  } else if (sp === 'basket') {
    if (emojiEl) emojiEl.textContent = '🏀';
    if (textEl) textEl.textContent = 'BASKET NBA';
    if (btnEl) btnEl.className = 'sport-badge-btn sport-basket';
  } else {
    if (emojiEl) emojiEl.textContent = '⚽';
    if (textEl) textEl.textContent = 'CALCIO';
    if (btnEl) btnEl.className = 'sport-badge-btn';
  }

  $$('.sport-card-choice').forEach(card => {
    card.classList.toggle('active', card.dataset.sport === sp);
  });
}

function updateSportUITheme() {
  const sp = state.activeSport || 'calcio';
  const brandImg = document.querySelector('.brand-avatar-img');
  const mascotImg = document.querySelector('.hero-mascot-img');
  const roleTag = document.querySelector('.mascot-role-tag');
  const leagueTrophy = $('#leagueHeroTrophy');
  const modeSwitcher = document.querySelector('.game-mode-switcher');

  if (sp === 'f1') {
    if (brandImg) brandImg.src = 'assets/f1-mascot.jpg?v=32';
    if (mascotImg) {
      mascotImg.src = 'assets/f1-mascot.jpg?v=32';
      mascotImg.alt = 'Il Pilota Boomer 16-Bit';
    }
    if (roleTag) roleTag.textContent = 'IL PILOTA BOOMER';
    if ($('#mascotGreeting')) {
      $('#mascotGreeting').textContent = '"Senti il rombo dei V12 e l\'odore di gomma bruciata? Da Lauda e Senna a Schumi, qui conta la vera conoscenza dei motori!"';
    }
    if (leagueTrophy) {
      leagueTrophy.src = 'assets/trophy-f1.jpg?v=32';
      leagueTrophy.alt = 'Coppa dei Motori / Pistone d\'Oro';
    }
    if ($('#heroModeBadge')) $('#heroModeBadge').textContent = '🏎️ F1 • 1970 - 2024';
    if ($('#heroPoolBadge')) $('#heroPoolBadge').textContent = '4.100+ SFIDE STORICHE';
    if ($('#heroTitle')) $('#heroTitle').textContent = 'Quiz like a Boomer: Formula 1';
    if ($('#heroDescription')) $('#heroDescription').innerHTML = 'Ruggiti V10 e V12, Lauda vs Hunt, Senna a Donington, l\'era Schumi, curve mitiche e segreti dei box!';
    if ($('#heroQuickPlayText')) $('#heroQuickPlayText').textContent = 'SCENDI IN PISTA';
    if ($('#currentUnitBadgeText')) $('#currentUnitBadgeText').textContent = 'F1 BOOMER • 10 UNITÀ GP';
    if (modeSwitcher) modeSwitcher.style.display = 'none';
  } else if (sp === 'basket') {
    if (brandImg) brandImg.src = 'assets/basket-mascot.jpg?v=32';
    if (mascotImg) {
      mascotImg.src = 'assets/basket-mascot.jpg?v=32';
      mascotImg.alt = 'Il Campione NBA 16-Bit';
    }
    if (roleTag) roleTag.textContent = 'IL CAMPIONE NBA #23';
    if ($('#mascotGreeting')) {
      $('#mascotGreeting').textContent = '"Mancano 5 secondi sul cronometro dei 24: hai il sangue freddo per infilare il tiro sulla sirena come Jordan, Kobe o Curry?"';
    }
    if (leagueTrophy) {
      leagueTrophy.src = 'assets/trophy-basket.jpg?v=32';
      leagueTrophy.alt = 'Trofeo Larry O\'Brien / Anello NBA';
    }
    if ($('#heroModeBadge')) $('#heroModeBadge').textContent = '🏀 NBA • 1980 - 2024';
    if ($('#heroPoolBadge')) $('#heroPoolBadge').textContent = '4.100+ SFIDE STORICHE';
    if ($('#heroTitle')) $('#heroTitle').textContent = 'Buzzer Beater: NBA Legends';
    if ($('#heroDescription')) $('#heroDescription').innerHTML = 'Showtime Lakers vs Celtics, i Bulls di Jordan, Kobe & Shaq, LeBron, Steph Curry e i canestri a fil di sirena!';
    if ($('#heroQuickPlayText')) $('#heroQuickPlayText').textContent = 'PALLA A DUE';
    if ($('#currentUnitBadgeText')) $('#currentUnitBadgeText').textContent = 'BASKET NBA • 10 UNITÀ FINALS';
    if (modeSwitcher) modeSwitcher.style.display = 'none';
  } else {
    // CALCIO
    if (brandImg) brandImg.src = 'assets/mascot-coach.jpg?v=32';
    if (modeSwitcher) modeSwitcher.style.display = 'grid';
  }
}

window.switchSport = async (targetSport) => {
  if (!['calcio', 'f1', 'basket'].includes(targetSport)) return;
  const previousSport = state.activeSport;
  state.activeSport = targetSport;

  if (targetSport === 'calcio') {
    state.activeGameMode = 'quizzocampo';
  } else if (targetSport === 'f1') {
    state.activeGameMode = 'f1';
  } else if (targetSport === 'basket') {
    state.activeGameMode = 'basket';
  }

  const modal = $('#sportModal');
  if (modal) modal.hidden = true;

  updateSportBadgeUI();
  updateTopStats();

  await loadSportCurriculum(targetSport);

  updateSportUITheme();
  setGameMode(state.activeGameMode, false);
  renderUnitJumpModal();
  renderSnakePath();
  persistState();

  trackEvent('sport_switch', { from_sport: previousSport, to_sport: targetSport });
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

async function loadCurriculum() {
  await loadSportCurriculum(state.activeSport || 'calcio');

  checkMidnightHeartsReset();
  updateHomeInstallBannerVisibility();
  updateSportBadgeUI();
  updateSportUITheme();
  setGameMode(state.activeGameMode, false);
  renderUnitJumpModal();
  renderLeaderboard();
  renderQuests();
  updateTopStats();
  renderSnakePath();

  trackEvent('page_view', { sport: state.activeSport, is_logged_in: Boolean(currentCloudUser) });
}

// -------------------------------------------------------------
// 4B. RETENTION & STREAK PER CATEGORIA (DUOLINGO ENGINE)
// -------------------------------------------------------------
function recordCategoryDailyWin(sp = state.activeSport || 'calcio') {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  if (!state.categoryStreaks) {
    state.categoryStreaks = {
      calcio: { streak: 1, lastDay: null, freezeCount: 1 },
      f1: { streak: 0, lastDay: null, freezeCount: 0 },
      basket: { streak: 0, lastDay: null, freezeCount: 0 }
    };
  }
  const cat = state.categoryStreaks[sp] || { streak: 0, lastDay: null, freezeCount: 0 };

  if (cat.lastDay === todayStr) {
    return;
  }

  const yesterday = new Date(now.getTime() - 86400000);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  let savedByFreeze = false;

  if (!cat.lastDay) {
    cat.streak = 1;
    cat.lastDay = todayStr;
  } else if (cat.lastDay === yesterdayStr) {
    cat.streak += 1;
    cat.lastDay = todayStr;
  } else {
    // Saltato un giorno
    if (cat.freezeCount > 0) {
      cat.freezeCount--;
      cat.streak += 1;
      cat.lastDay = todayStr;
      savedByFreeze = true;
    } else {
      cat.streak = 1;
      cat.lastDay = todayStr;
    }
  }

  state.categoryStreaks[sp] = cat;
  const reward = checkStreakRewards(sp, cat.streak);

  persistState();
  updateTopStats();

  showStreakCelebration(sp, cat.streak, savedByFreeze, reward);
}

function checkStreakRewards(sp, streakCount) {
  const claimedKey = `streak_reward_${sp}_${streakCount}`;
  if (!state.claimedChests) state.claimedChests = [];
  if (state.claimedChests.includes(claimedKey)) return null;

  let reward = null;
  if (streakCount === 3) {
    reward = { gems: 50, title: '🥉 Traguardo Bronzo (3 Giorni di Fila!)' };
    state.gems += 50;
    state.hearts = state.maxHearts;
  } else if (streakCount === 7) {
    reward = { gems: 150, freeze: true, title: '🥈 Traguardo Argento (Settimana di Fuoco!)' };
    state.gems += 150;
    state.categoryStreaks[sp].freezeCount = (state.categoryStreaks[sp].freezeCount || 0) + 1;
  } else if (streakCount === 14) {
    reward = { gems: 300, title: '🥇 Traguardo Oro (14 Giorni di Fila!)' };
    state.gems += 300;
    state.hearts = state.maxHearts;
  } else if (streakCount === 30) {
    reward = { gems: 1000, title: '🏆 Leggenda Assoluta (30 Giorni di Fila!)' };
    state.gems += 1000;
  }

  if (reward) {
    state.claimedChests.push(claimedKey);
  }
  return reward;
}

function showStreakCelebration(sp, streakCount, savedByFreeze, reward) {
  const sportNames = { calcio: 'Calcio', f1: 'F1 Boomer', basket: 'Basket NBA' };
  const modal = $('#streakCelebrationModal');
  if (!modal) return;

  if ($('#streakCelebrationNum')) {
    $('#streakCelebrationNum').textContent = `${streakCount} GIORN${streakCount === 1 ? 'O' : 'I'}`;
  }
  if ($('#streakCelebrationMsg')) {
    $('#streakCelebrationMsg').textContent = savedByFreeze
      ? `🧊 Il tuo Gelo Fiamma ha salvato la tua sequenza in ${sportNames[sp] || 'questa categoria'}! Streak continuato a ${streakCount} giorni!`
      : `Hai completato la tua sfida quotidiana in ${sportNames[sp] || 'questa categoria'}! Mantieni vivo il ritmo anche domani.`;
  }

  const rBox = $('#streakCelebrationRewardBox');
  if (reward && rBox) {
    rBox.hidden = false;
    if ($('#streakRewardTitle')) $('#streakRewardTitle').textContent = `🎁 ${reward.title}`;
    if ($('#streakRewardDesc')) $('#streakRewardDesc').textContent = `+${reward.gems} Gemme 💎 ${reward.freeze ? '+ 1 Gelo Fiamma 🧊' : ''}`;
  } else if (rBox) {
    rBox.hidden = true;
  }

  modal.hidden = false;
  launchConfetti();
  playTone('cheer');
}

function renderStreakDetailModal() {
  const curSport = state.activeSport || 'calcio';
  const curStreak = state.categoryStreaks?.[curSport]?.streak || 0;

  if ($('#streakDetailCounterHero')) {
    $('#streakDetailCounterHero').textContent = `${curStreak} GIORN${curStreak === 1 ? 'O' : 'I'}`;
  }

  if ($('#catValCalcio')) $('#catValCalcio').textContent = state.categoryStreaks?.calcio?.streak || 0;
  if ($('#catValF1')) $('#catValF1').textContent = state.categoryStreaks?.f1?.streak || 0;
  if ($('#catValBasket')) $('#catValBasket').textContent = state.categoryStreaks?.basket?.streak || 0;

  if ($('#calcioModalStreakVal')) $('#calcioModalStreakVal').textContent = state.categoryStreaks?.calcio?.streak || 0;
  if ($('#f1ModalStreakVal')) $('#f1ModalStreakVal').textContent = state.categoryStreaks?.f1?.streak || 0;
  if ($('#basketModalStreakVal')) $('#basketModalStreakVal').textContent = state.categoryStreaks?.basket?.streak || 0;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const checkStatus = (sport) => {
    const s = state.categoryStreaks?.[sport];
    if (s?.lastDay === todayStr) return '✅ Fatto oggi';
    return '⏳ Da fare oggi';
  };

  if ($('#catSubCalcio')) $('#catSubCalcio').textContent = checkStatus('calcio');
  if ($('#catSubF1')) $('#catSubF1').textContent = checkStatus('f1');
  if ($('#catSubBasket')) $('#catSubBasket').textContent = checkStatus('basket');

  $('#catCardCalcio')?.classList.toggle('active-sport', curSport === 'calcio');
  $('#catCardF1')?.classList.toggle('active-sport', curSport === 'f1');
  $('#catCardBasket')?.classList.toggle('active-sport', curSport === 'basket');

  if ($('#freezeCountSpan')) {
    $('#freezeCountSpan').textContent = state.categoryStreaks?.[curSport]?.freezeCount || 0;
  }

  const currentWDay = now.getDay();
  $$('#modalWeeklyStreakStrip .weekday-dot').forEach(dot => {
    const wday = Number(dot.dataset.wday);
    const isToday = wday === currentWDay;
    const isDoneToday = state.categoryStreaks?.[curSport]?.lastDay === todayStr;

    dot.className = 'weekday-dot';
    if (isToday && isDoneToday) {
      dot.classList.add('done');
      dot.textContent = '🔥';
    } else if (isToday) {
      dot.classList.add('today-pending');
      dot.textContent = '•';
    } else if (wday < currentWDay && curStreak > 0) {
      dot.classList.add('done');
      dot.textContent = '✓';
    } else {
      dot.textContent = '';
    }
  });
}

// -------------------------------------------------------------
// RESET VITE A MEZZANOTTE & PWA INSTALL BANNER
// -------------------------------------------------------------
function getLocalDateString() {
  return new Date().toLocaleDateString('en-CA');
}

function checkMidnightHeartsReset() {
  const today = getLocalDateString();
  if (state.lastHeartsRefillDay && state.lastHeartsRefillDay !== today) {
    state.hearts = state.maxHearts;
    state.lastHeartsRefillDay = today;
    persistState();
    updateTopStats();
    if ($('#freemiumHeartsNow')) $('#freemiumHeartsNow').textContent = state.hearts;
    console.log('🌙 [Midnight Reset] Vite ricaricate al 100% (5/5 ❤️) per il nuovo giorno:', today);
  } else if (!state.lastHeartsRefillDay) {
    state.lastHeartsRefillDay = today;
    persistState();
  }
}

function isRunningStandalonePwa() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    Boolean(document.referrer && document.referrer.includes('android-app://'))
  );
}

function updateHomeInstallBannerVisibility() {
  const banner = $('#homeInstallLoginBanner');
  if (!banner) return;
  const isStandalone = isRunningStandalonePwa();
  const isLoggedIn = Boolean(currentCloudUser);

  // Scompare se uno ha la pwa o è loggato già
  if (isStandalone || isLoggedIn) {
    banner.hidden = true;
    banner.style.display = 'none';
  } else {
    banner.hidden = false;
    banner.style.display = '';
  }
}
window.updateHomeInstallBannerVisibility = updateHomeInstallBannerVisibility;

// -------------------------------------------------------------
// 5. SWITCHER 3 MODALITÀ DI GIOCO: QUIZZONE, GAEL LEAGUE, PASTORE LEAGUE
// -------------------------------------------------------------
window.setGameMode = (mode, scroll = true) => {
  if (mode === 'quizzone' || mode === 'quiz') mode = 'quizzocampo';
  if (mode !== 'gael' && mode !== 'pastore' && mode !== 'quizzocampo') {
    mode = 'quizzocampo';
  }
  state.activeGameMode = mode;
  persistState();

  // Se non siamo sul tab percorso, portiamoci lì quando si clicca una modalità
  if (state.activeTab !== 'path' && scroll) {
    switchTab('path', state.activeGameMode);
  }

  // Aggiorna switcher buttons
  $$('.mode-switch-btn').forEach(btn => {
    let btnMode = btn.dataset.mode;
    if (btnMode === 'quizzone' || btnMode === 'quiz') btnMode = 'quizzocampo';
    const isActive = btnMode === state.activeGameMode;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', String(isActive));
  });

  // Aggiorna navigazione laterale e mobile
  $$('.sidebar-nav .nav-item, .duo-mobile-nav .mobile-nav-btn').forEach(el => {
    if (el.dataset.tab === 'path' && el.dataset.gamemode) {
      let elMode = el.dataset.gamemode;
      if (elMode === 'quizzone' || elMode === 'quiz') elMode = 'quizzocampo';
      el.classList.toggle('active', state.activeTab === 'path' && elMode === state.activeGameMode);
    }
  });

  // Aggiorna Hero Banner e testi in base alla modalità
  const isGael = state.activeGameMode === 'gael';
  const isPastore = state.activeGameMode === 'pastore';
  const isQuiz = state.activeGameMode === 'quizzocampo';

  if ($('#heroModeBadge')) {
    $('#heroModeBadge').textContent = isPastore
      ? '🎯 PASTORE LEAGUE 16-BIT'
      : isGael
        ? '👕 GAEL LEAGUE 16-BIT'
        : '⚡ QUIZZONE 16-BIT';
  }
  if ($('#heroPoolBadge')) {
    $('#heroPoolBadge').textContent = isPastore
      ? '15 UNITÀ • 2.000 TABELLINI SERIE A'
      : isGael
        ? '10 UNITÀ • CULT HEROES & LIVELLI PRO'
        : '15 UNITÀ • DAI RECORD ALL\'ESAME FINALE';
  }
  if ($('#heroTitle')) {
    $('#heroTitle').textContent = isPastore
      ? 'Pastore League: Chi ha segnato?'
      : isGael
        ? 'Gael League: Indovina chi è!'
        : 'Quizzone: Il Grande Quiz!';
  }
  if ($('#heroDescription')) {
    $('#heroDescription').innerHTML = isPastore
      ? 'La modalità ufficiale sui <b>Marcatori di Serie A dal 1990 ad oggi</b> con <b>Giuseppe Pastore</b>! Ricordi le doppiette scudetto, i gol vittoria al 94\' e chi NON ha segnato in quel tabellino?'
      : isGael
        ? 'Percorso a <b>10 Unità ad alta difficoltà</b>: niente superstar scontate! Si parte dai Fantasisti ribelli e si sale fino a <b>bomber di provincia, meteore dimenticate e livelli PRO con Club Misteriosi ❓ e zero date</b>!'
        : 'Percorso a <b>15 Unità</b>: dal Calcio Pop fino alle <b>notti magiche azzurre, Champions League, sanzioni e l\'Esame Supremo del Mister</b>!';
  }
  if ($('#heroQuickPlayText')) {
    $('#heroQuickPlayText').textContent = isPastore
      ? 'GIOCA PASTORE LEAGUE'
      : isGael
        ? 'GIOCA GAEL LEAGUE'
        : 'GIOCA QUIZZONE';
  }
  if ($('#mascotGreeting')) {
    $('#mascotGreeting').textContent = isPastore
      ? '"Chi ha gonfiato la rete in quel pomeriggio di pioggia? Fai mente locale sui tabellini storici e non sbagliare marcatore!"'
      : isGael
        ? '"All\'inizio trovi Baggio e Ronaldo... ma nei livelli PRO ti oscurerò i club e le date: vediamo se sei un vero archivista!"'
        : '"Più avanzi nel Quizzone più le domande scottano: saprai rispondere anche sull\'Esame Finale del Mister?"';
  }

  // Mascot avatar e ruolo
  const mascotImg = document.querySelector('.hero-mascot-img');
  const roleTag = document.querySelector('.mascot-role-tag');
  if (mascotImg) {
    mascotImg.src = isPastore
      ? 'assets/pastore-mascot.jpg'
      : isGael
        ? 'assets/gael-mascot.jpg'
        : 'assets/mascot-coach.jpg';
    mascotImg.alt = isPastore
      ? 'Giuseppe Pastore 16-Bit — L\'Almanacco dei Marcatori'
      : isGael
        ? 'Gael — Maestro delle Carriere 16-Bit'
        : 'Il Mister #10 — Allenatore Giocatore';
  }
  if (roleTag) {
    roleTag.textContent = isPastore
      ? 'GIUSEPPE PASTORE'
      : isGael
        ? 'GAEL • MAESTRO DELLE CARRIERE'
        : 'IL MISTER #10';
  }

  if ($('#railActiveModeBadge')) {
    $('#railActiveModeBadge').textContent = isPastore ? 'PASTORE LEAGUE' : isGael ? 'GAEL LEAGUE' : 'QUIZZONE';
  }
  if ($('#currentUnitBadgeText')) {
    $('#currentUnitBadgeText').textContent = isPastore ? 'PASTORE LEAGUE • 15 UNITÀ' : isGael ? 'GAEL LEAGUE • 10 UNITÀ' : 'QUIZZONE • 15 UNITÀ';
  }

  const leagueTrophy = $('#leagueHeroTrophy');
  if (leagueTrophy) {
    leagueTrophy.src = isPastore
      ? 'assets/trophy-pastore.jpg'
      : isGael
        ? 'assets/trophy-gael.jpg'
        : 'assets/trophy-quizzone.jpg';
    leagueTrophy.alt = isPastore
      ? 'Coppa Pastore League'
      : isGael
        ? 'Coppa Gael League'
        : 'Coppa Quizzone';
  }

  renderSnakePath();
  if (scroll) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// -------------------------------------------------------------
// 6. RENDERING PERCORSO A SERPENTINA (FILTRATO PER MODALITÀ)
// -------------------------------------------------------------
const UNIT_THEMES = ['theme-green', 'theme-blue', 'theme-purple', 'theme-orange'];
const NODE_OFFSETS = ['', 'offset-right-1', 'offset-right-2', 'offset-right-1', '', 'offset-left-1', 'offset-left-2', 'offset-left-1'];
const LESSON_ICONS = [
  PIXEL_ICONS.jersey,
  PIXEL_ICONS.star,
  PIXEL_ICONS.ball,
  PIXEL_ICONS.flame,
  PIXEL_ICONS.shield,
  PIXEL_ICONS.crown,
  PIXEL_ICONS.bolt,
  PIXEL_ICONS.trophy,
  PIXEL_ICONS.jersey,
  PIXEL_ICONS.star
];

function getActiveLessonCoords(modeFilter = state.activeGameMode) {
  let fallbackUnit = 0;
  let fallbackLesson = 0;
  for (let uIdx = 0; uIdx < catalog.units.length; uIdx++) {
    const u = catalog.units[uIdx];
    const isVisible = state.activeSport !== 'calcio' || (u.mode || (uIdx < 10 ? 'gael' : uIdx < 25 ? 'quizzocampo' : 'pastore')) === modeFilter;
    if (!isVisible) continue;

    for (let lIdx = 0; lIdx < u.lessons.length; lIdx++) {
      const key = `${u.id || `u${uIdx + 1}`}-l${lIdx + 1}`;
      if (!state.completedLessons.includes(key) && !state.completedLessons.includes(`u${uIdx + 1}-l${lIdx + 1}`)) {
        return { uIdx, lIdx };
      }
      fallbackUnit = uIdx;
      fallbackLesson = lIdx;
    }
  }
  return { uIdx: fallbackUnit, lIdx: fallbackLesson };
}

function renderSnakePath() {
  const container = $('#unitsContainer');
  if (!container || !catalog || !Array.isArray(catalog.units)) return;

  let modeFoundCurrent = false;
  let modeLessonsCount = 0;
  let modeCompletedCount = 0;

  catalog.units.forEach((u, uIdx) => {
    const isVisible = state.activeSport !== 'calcio' || (u.mode || (uIdx < 10 ? 'gael' : uIdx < 25 ? 'quizzocampo' : 'pastore')) === state.activeGameMode;
    if (!isVisible) return;
    u.lessons.forEach((_, lIdx) => {
      modeLessonsCount++;
      const lessonKey = `${u.id || `u${uIdx + 1}`}-l${lIdx + 1}`;
      if (state.completedLessons.includes(lessonKey) || state.completedLessons.includes(`u${uIdx + 1}-l${lIdx + 1}`)) {
        modeCompletedCount++;
      }
    });
  });

  const heroPill = $('#heroProgressPill');
  if (heroPill) {
    heroPill.textContent = `${modeCompletedCount} / ${modeLessonsCount} TAPPE`;
  }

  let visibleUnitOrder = 0;
  const html = catalog.units.map((unit, uIdx) => {
    const uMode = unit.mode || (uIdx < 10 ? 'gael' : uIdx < 25 ? 'quizzocampo' : 'pastore');
    const isVisible = state.activeSport !== 'calcio' || uMode === state.activeGameMode;
    if (!isVisible) return '';

    const themeClass = UNIT_THEMES[visibleUnitOrder % UNIT_THEMES.length];
    visibleUnitOrder++;

    const unitTitle = unit.title || unit.name || `Unità ${uIdx + 1}`;
    const unitDesc = unit.subtitle || unit.description || '';
    const unitCode = unit.code || (state.activeSport === 'f1' ? `F1 BOOMER • GP UNITÀ ${visibleUnitOrder}` : state.activeSport === 'basket' ? `BASKET NBA • FINALS UNITÀ ${visibleUnitOrder}` : `${uMode === 'pastore' ? 'PASTORE LEAGUE' : uMode === 'gael' ? 'GAEL LEAGUE' : 'QUIZZONE'} • UNITÀ ${visibleUnitOrder}`);

    const completedInUnit = unit.lessons.filter((_, lIdx) => {
      const lessonKey = `${unit.id || `u${uIdx + 1}`}-l${lIdx + 1}`;
      return state.completedLessons.includes(lessonKey) || state.completedLessons.includes(`u${uIdx + 1}-l${lIdx + 1}`);
    }).length;

    const nodesHtml = unit.lessons.map((lesson, lIdx) => {
      const lessonKey = `${unit.id || `u${uIdx + 1}`}-l${lIdx + 1}`;
      const isCompleted = state.completedLessons.includes(lessonKey) || state.completedLessons.includes(`u${uIdx + 1}-l${lIdx + 1}`);

      let status = 'locked';
      if (isCompleted) {
        status = 'completed';
      } else if (!modeFoundCurrent) {
        status = 'current';
        modeFoundCurrent = true;
      } else if (lIdx <= 2) {
        status = 'unlocked';
      }

      const offsetClass = NODE_OFFSETS[lIdx % NODE_OFFSETS.length];
      const icon = isCompleted ? PIXEL_ICONS.check : LESSON_ICONS[lIdx % LESSON_ICONS.length];
      const isCurrent = status === 'current';

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
            aria-label="${esc(unitCode)}, ${esc(lesson.title)}"
            onclick="handleNodeClick(${uIdx}, ${lIdx}, '${status}')"
          >
            <span class="node-icon">${icon}</span>
          </button>
          <span class="node-caption">${esc(lesson.title)}</span>
          ${isCurrent ? `
            <div class="node-mascot-companion" aria-hidden="true">
              <img src="${uMode === 'pastore' ? 'assets/pastore-mascot.jpg' : uMode === 'gael' ? 'assets/gael-mascot.jpg' : 'assets/mascot-coach.jpg'}" alt="" class="node-companion-img" width="52" height="52" />
              <div class="node-mascot-bubble">${uMode === 'pastore' ? 'Chi ha segnato? 🎯' : uMode === 'gael' ? 'Chi è il bomber? 👕' : 'Pronto al quiz? ⚡'}</div>
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
              <small>${esc(unitCode)}</small>
              <span class="unit-progress-pill">⭐ ${completedInUnit}/${unit.lessons.length}</span>
            </div>
            <h3>${esc(unitTitle)}</h3>
            <p>${esc(unitDesc)}</p>
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
// 7. MAPPA VELOCE UNITÀ, BAULI E GUIDA WIKIDATA LIVE
// -------------------------------------------------------------
function renderUnitJumpModal() {
  const list = $('#unitJumpList');
  if (!list) return;

  list.innerHTML = catalog.units.map((unit, uIdx) => {
    const uMode = unit.mode || (uIdx < 10 ? 'gael' : uIdx < 25 ? 'quizzocampo' : 'pastore');
    const isCurrentMode = uMode === state.activeGameMode;
    const unitTitle = unit.title || unit.name || `Unità ${uIdx + 1}`;
    const modeLabel = uMode === 'pastore' ? 'PASTORE LEAGUE' : uMode === 'gael' ? 'GAEL LEAGUE' : 'QUIZZONE';
    const modeIcon = uMode === 'pastore' ? '🎯' : uMode === 'gael' ? '👕' : '⚡';
    const modeUnits = catalog.units.filter(u => (u.mode || (uIdx < 10 ? 'gael' : uIdx < 25 ? 'quizzocampo' : 'pastore')) === uMode);
    const unitOrder = modeUnits.indexOf(unit) + 1;
    const done = unit.lessons.filter((_, lIdx) =>
      state.completedLessons.includes(`u${uIdx + 1}-l${lIdx + 1}`)
    ).length;
    return `
      <button class="unit-jump-item ${isCurrentMode ? 'active-mode-item' : ''}" type="button" onclick="jumpToUnit(${uIdx})">
        <small>${modeIcon} ${esc(modeLabel)} • U${unitOrder}</small>
        <b>${esc(unitTitle)}</b>
        <span>Completate: ${done} / ${unit.lessons.length} tappe</span>
      </button>
    `;
  }).join('');
}

window.jumpToUnit = (uIdx) => {
  const modal = $('#unitJumpModal');
  if (modal) modal.hidden = true;
  const unit = catalog.units[uIdx];
  if (!unit) return;

  const uMode = unit.mode || (uIdx < 10 ? 'gael' : uIdx < 25 ? 'quizzocampo' : 'pastore');
  setGameMode(uMode, false);
  switchTab('path', uMode);

  const unitTitle = unit.title || unit.name || '';
  const badgeText = $('#currentUnitBadgeText');
  if (badgeText) {
    const shortMode = uMode === 'pastore' ? 'PASTORE' : uMode === 'gael' ? 'GAEL' : 'QUIZ';
    badgeText.textContent = `${shortMode} • ${unitTitle.toUpperCase().slice(0, 18)}`;
  }

  setTimeout(() => {
    const target = $(`#unit-sec-${uIdx}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 60);
};

window.handleNodeClick = (uIdx, lIdx, status) => {
  if (status === 'locked') {
    playTone('wrong');
    const unit = catalog.units[uIdx];
    const lesson = unit?.lessons?.[lIdx];
    openModal('🔒 Tappa Sbloccabile', `
      <p>Vuoi affrontare subito <b>"${esc(lesson?.title || 'Tappa')}"</b>?</p>
      <div style="margin-top:14px;">
        <button class="btn-primary w-full" type="button" onclick="document.getElementById('sourcesModal').hidden=true; forceStartNode(${uIdx}, ${lIdx});">
          ⚡ SCENDI IN CAMPO ORA
        </button>
      </div>
    `);
    return;
  }

  forceStartNode(uIdx, lIdx);
};

window.forceStartNode = (uIdx, lIdx) => {
  if (state.hearts <= 0) {
    openHeartsFreemiumModal();
    return;
  }

  state.activeUnitIdx = uIdx;
  state.activeLessonIdx = lIdx;
  const lesson = catalog.units[uIdx]?.lessons?.[lIdx];
  const questions = lesson?.questions || lesson?.players || [];
  startQuizSession('path', questions);
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
  const unitTitle = unit.title || unit.name || `Unità ${uIdx + 1}`;
  const unitDesc = unit.subtitle || unit.description || '';

  title.textContent = `📖 ${unit.code || 'Guida'}: ${unitTitle}`;

  const sampleItems = [];
  const seen = new Set();
  unit.lessons.forEach(l => {
    (l.questions || l.players || []).forEach(q => {
      const key = q.name || q.question;
      if (key && !seen.has(key) && sampleItems.length < 6) {
        seen.add(key);
        sampleItems.push(q);
      }
    });
  });

  body.innerHTML = `
    <p><strong>Tema dell'Unità:</strong> ${esc(unitDesc)}</p>
    <div style="background:var(--bg-soft);padding:14px;border-radius:14px;border:1.5px solid var(--border-light);">
      <h4 style="margin-bottom:8px;">🌟 Schede &amp; Curiosità in questa Unità:</h4>
      <ul style="padding-left:18px;display:flex;flex-direction:column;gap:8px;">
        ${sampleItems.map(item => {
          if (item.name) {
            const qid = item.qid || item.wikidataId || '';
            return `
              <li>
                <b>${esc(item.name)}</b> (${esc(item.era || 'Anni \'90/2000')}) — ${esc(item.check || item.hint || '')}
                ${qid ? `<button class="btn-secondary btn-sm" style="margin-left:6px;padding:2px 8px;font-size:10px;" onclick="loadWikidataFact('${esc(qid)}', '${esc(item.name)}')">🌐 Wikidata Live</button>` : ''}
              </li>
            `;
          }
          return `<li><b>${esc(item.correct)}</b> — ${esc(item.check || '')}</li>`;
        }).join('')}
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
    box.innerHTML = `⚠️ Connessione offline: utilizzo i dati verificati nel database locale.`;
  }
};

// -------------------------------------------------------------
// 8. MOTORE DI GIOCO INTERATTIVO (GAEL LEAGUE & QUIZZOCAMPO)
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
  const match = rawText.match(/^\[([^\]]+)\]\s*(.*)$/);
  if (match) {
    return {
      cleanText: match[2].trim(),
      archiveBadge: match[1]
    };
  }
  return { cleanText: rawText, archiveBadge: '' };
}

function getRoundMultiplier(round = 1) {
  const mults = [1, 1.5, 2, 2.5, 3, 4, 5];
  return mults[Math.min(mults.length - 1, Math.max(0, (round || 1) - 1))];
}

function getQuestionsForDifficulty(gameType, diffLevel, count = 5) {
  const targetDiff = Math.max(1, Number(diffLevel) || 1);
  const units = catalog?.units || [];
  let pool = [];

  const actualMode = (gameType === 'quiz' || gameType === 'quizzone') ? 'quizzocampo' : (gameType || 'gael');
  const modeUnits = units.filter(u => (u.mode || '') === actualMode);
  const targetUnit = modeUnits[Math.min(modeUnits.length - 1, targetDiff - 1)] || modeUnits[0];

  if (targetUnit && Array.isArray(targetUnit.lessons)) {
    targetUnit.lessons.forEach(l => {
      if (Array.isArray(l.questions)) pool.push(...l.questions);
    });
  }

  // Deduplica per nome/domanda
  const uniqueMap = new Map();
  pool.forEach(q => {
    const key = q.name || q.question || q.id;
    if (key && !uniqueMap.has(key)) {
      uniqueMap.set(key, { ...q, difficultyLevel: targetDiff });
    }
  });
  const uniquePool = Array.from(uniqueMap.values());

  // Escludi quelli già usciti nella run corrente
  const unseen = uniquePool.filter(q => !state.usedQuestionIds?.has(q.name || q.question || q.id));
  const chosenSource = unseen.length >= count ? unseen : uniquePool;
  const picked = sampleQuestions(chosenSource, count);

  picked.forEach(q => {
    const key = q.name || q.question || q.id;
    if (key && state.usedQuestionIds) state.usedQuestionIds.add(key);
  });

  return picked;
}

const AMAZON_AFFILIATE_TAG = 'matteornati0d-21';

const AMAZON_FOOTBALL_DEALS = [
  {
    emoji: '📚',
    title: "Libri & Biografie Calcio Serie A Anni '90",
    sub: "I capolavori nostalgici consigliati da Fuoriclasse",
    url: `https://www.amazon.it/s?k=libri+calcio+serie+a&tag=${AMAZON_AFFILIATE_TAG}&linkCode=ll2&ref_=as_li_ss_tl`
  },
  {
    emoji: '👕',
    title: "Maglie Vintage & Retro Serie A",
    sub: "Le divise leggendarie delle Sette Sorelle e club storici",
    url: `https://www.amazon.it/s?k=maglie+calcio+vintage+serie+a&tag=${AMAZON_AFFILIATE_TAG}&linkCode=ll2&ref_=as_li_ss_tl`
  },
  {
    emoji: '⚽',
    title: "Subbuteo Champions & Palloni Storici",
    sub: "Il mito del panno verde da tavolo e palloni Mondiali",
    url: `https://www.amazon.it/s?k=subbuteo+calcio&tag=${AMAZON_AFFILIATE_TAG}&linkCode=ll2&ref_=as_li_ss_tl`
  },
  {
    emoji: '🎮',
    title: "EA Sports FC & Videogiochi di Calcio",
    sub: "Le sfide console e card da collezione per veri bomber",
    url: `https://www.amazon.it/s?k=ea+sports+fc&tag=${AMAZON_AFFILIATE_TAG}&linkCode=ll2&ref_=as_li_ss_tl`
  }
];

function updateAmazonSponsorCard() {
  const deal = AMAZON_FOOTBALL_DEALS[Math.floor(Math.random() * AMAZON_FOOTBALL_DEALS.length)];
  const emojiEl = $('#amazonItemEmoji');
  const titleEl = $('#amazonItemTitle');
  const subEl = $('#amazonItemSub');
  const linkEl = $('#amazonShopLink');

  if (emojiEl) emojiEl.textContent = deal.emoji;
  if (titleEl) titleEl.textContent = deal.title;
  if (subEl) subEl.textContent = deal.sub;
  if (linkEl) {
    linkEl.href = deal.url;
    linkEl.title = `Scopri ${deal.title} su Amazon`;
  }
}

function openHeartsFreemiumModal() {
  if ($('#freemiumHeartsNow')) $('#freemiumHeartsNow').textContent = state.hearts;
  if ($('#freemiumGemsNow')) $('#freemiumGemsNow').textContent = state.gems;
  if ($('#heartsModalEmoji')) $('#heartsModalEmoji').textContent = state.hearts <= 0 ? '💔' : '❤️';
  if ($('#freemiumActionFeedback')) $('#freemiumActionFeedback').textContent = '';
  updateAmazonSponsorCard();
  const modal = $('#heartsEmptyModal');
  if (modal) modal.hidden = false;
}
window.openHeartsFreemiumModal = openHeartsFreemiumModal;

function startQuizSession(mode, questionsList) {
  if (!questionsList || questionsList.length === 0) return;

  // Sistema Freemium: se l'utente ha 0 vite e non sta facendo l'allenamento recupero vite, apri il modale Infermeria Freemium
  if (mode !== 'practice' && state.hearts <= 0) {
    openHeartsFreemiumModal();
    return;
  }

  const firstQ = questionsList[0] || {};
  const isGael = Boolean(firstQ.name && Array.isArray(firstQ.clubs));

  state.quizMode = mode;
  state.sessionGameType = isGael ? 'gael' : 'quizzocampo';
  state.survivalRound = 1;
  state.currentDiffLevel = Math.min(10, Math.max(1, Number(firstQ.difficultyLevel) || ((state.activeUnitIdx % 10) + 1) || 1));
  state.pendingXp = 0;
  state.pendingGems = 0;
  state.usedQuestionIds = new Set(questionsList.map(q => q.name || q.question || q.id));

  state.currentQuestions = questionsList.map(q => ({
    ...q,
    difficultyLevel: state.currentDiffLevel,
    options: [...(q.options || [])]
  }));
  state.questionIndex = 0;
  state.selectedAnswer = null;

  trackEvent('quiz_session_start', { mode, question_count: questionsList.length, sport: state.activeSport });
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
  // Se l'utente chiude mentre è nella schermata di fine round con bottino attivo e vite > 0, incassa automaticamente
  if (state.sessionFinished && state.hearts > 0 && (state.pendingXp > 0 || state.pendingGems > 0)) {
    state.xp += state.pendingXp;
    state.gems += state.pendingGems;
    state.pendingXp = 0;
    state.pendingGems = 0;
    persistState();
  }
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

  const total = state.currentQuestions.length;
  const pct = Math.max(12, Math.round(((state.questionIndex) / total) * 100));
  const fill = $('#quizProgressFill');
  if (fill) fill.style.width = `${pct}%`;

  $('#quizHeartsNum').textContent = state.hearts;
  $('#quizMascotMood').textContent = state.comboStreak >= 2 ? '🔥' : '🎯';

  const drawer = $('#quizBottomDrawer');
  drawer.className = 'quiz-bottom-drawer';
  $('#feedback').innerHTML = '';
  const continueBtn = $('#continueBtn');
  continueBtn.disabled = true;
  continueBtn.textContent = 'VERIFICA';

  // Distinzione tra domanda GAEL LEAGUE (carriera con maglie) e QUIZZOCAMPO (quiz)
  const isPlayer = Boolean(q.name && Array.isArray(q.clubs));
  const tagEl = $('#quizTag');
  const archivePill = $('#quizArchivePill');
  const promptEl = $('#quizPrompt');
  const subEl = $('#quizSubprompt');

  const diffLevel = Number(q.difficultyLevel) || (state.activeUnitIdx + 1) || 1;
  state.hintRevealed = false;

  if (isPlayer) {
    const isPro = Boolean(q.isPro) || diffLevel >= 7;
    const showJerseyNum = false; // Maglia #?? sempre nascosta per default in Gael League
    const hideYears = diffLevel >= 4 || isPro;
    const maskClubCount = (isPro && diffLevel >= 9) ? 2 : ((isPro || diffLevel >= 7) ? 1 : 0);

    // Determina quali club oscurare (Livelli PRO / Maestro)
    state.mysteryClubIdx = maskClubCount >= 1 && q.clubs.length >= 3 ? Math.floor(q.clubs.length / 2) : -1;
    state.mysteryClubIdx2 = maskClubCount >= 2 && q.clubs.length >= 4 ? Math.floor(q.clubs.length / 4) : -1;

    tagEl.textContent = isPro
      ? `🔥 GAEL LEAGUE PRO • CLUB MISTERIOSI ❓ (LIV. ${diffLevel})`
      : `👕 GAEL LEAGUE • MAGLIA #?? (LIV. ${diffLevel})`;

    const diffBadges = {
      1: '★★★☆☆ CULT & FANTASISTI #??',
      2: '★★★☆☆ IDOLI DELLE CURVE #??',
      3: '★★★★☆ UOMINI COPPA #??',
      4: '★★★★☆ BOMBER DI PROVINCIA (NO ANNI)',
      5: '★★★★★ CULT HEROES (NO ANNI)',
      6: '★★★★★ METEORE SERIE A (NO ANNI)',
      7: '🔥 PRO • 1 CLUB MISTERIOSO ❓',
      8: '🔥 PRO • ATTACCANTI SENZA ANNI ❓',
      9: '🔥 PRO • DOPPIO CLUB ❓❓',
      10: '👑 MAESTRO ESTREMO • ESAME SUPREMO ❓❓'
    };
    archivePill.textContent = `${diffBadges[diffLevel] || '★★★★☆'} • ${q.era || "ANNI '90 & 2000"}`;
    archivePill.hidden = false;

    promptEl.textContent = maskClubCount > 0
      ? `Indovina il calciatore dalla carriera (${maskClubCount === 2 ? '2 Club Misteriosi ❓❓' : '1 Club Misterioso ❓'}):`
      : hideYears
        ? 'Indovina il calciatore dalla sola sequenza dei club (senza date):'
        : 'Indovina il calciatore da dove ha giocato in carriera:';

    if (q.hint) {
      subEl.innerHTML = `
        <span class="diff-rule-pill">${maskClubCount > 0 ? `🔥 ${maskClubCount} Club Oscurati + Anni Nascosti` : hideYears ? '🔒 Anni & Numero Nascosti' : !showJerseyNum ? '🔒 Numero Maglia Nascosto' : '⚽ Carriera Completa'}</span>
        <button type="button" class="hint-toggle-btn" onclick="revealMisterHint()">💡 CHIEDI INDIZIO DEL MISTER</button>
      `;
    } else {
      subEl.textContent = '';
    }
  } else if (q.mode === 'pastore') {
    const isMulti = Boolean(q.multiSelect || Array.isArray(q.correct));
    const targetCount = Array.isArray(q.correct) ? q.correct.length : 1;
    tagEl.textContent = isMulti
      ? `🎯 PASTORE LEAGUE • SELEZIONA ${targetCount} MARCATORI`
      : `🎯 ${q.tag || 'PASTORE LEAGUE • MARCATORI SERIE A'}`;
    archivePill.textContent = q.date ? `📅 ${q.date} • ${q.stadium || 'SERIE A'}` : 'ARCHIVIO PASTORE SERIE A';
    archivePill.hidden = false;
    promptEl.textContent = q.question || `Chi ha segnato in ${q.match || 'questa partita'}?`;
    subEl.innerHTML = q.match
      ? `<span class="diff-rule-pill" style="background:#ffc800;color:#000;font-weight:900;">🏟️ ${esc(q.match)}${isMulti ? ` • Scegli ${targetCount} calciatori` : ''}</span>`
      : '';
  } else if (q.mode === 'f1' || state.activeSport === 'f1') {
    tagEl.textContent = `🏎️ ${q.tag || 'QUIZ LIKE A BOOMER • FORMULA 1'}`;
    archivePill.textContent = '🏁 F1 LEGENDS (1970 - 2024)';
    archivePill.hidden = false;
    promptEl.textContent = q.question;
    subEl.textContent = '';
  } else if (q.mode === 'basket' || state.activeSport === 'basket') {
    tagEl.textContent = `🏀 ${q.tag || 'BUZZER BEATER • NBA LEGENDS'}`;
    archivePill.textContent = '🏆 NBA FINALS & DRAFT (1980 - 2024)';
    archivePill.hidden = false;
    promptEl.textContent = q.question;
    subEl.textContent = '';
  } else {
    const parsedQ = parseCleanQuestionText(q.question || '');
    tagEl.textContent = `⚡ ${q.tag || 'QUIZZONE'}`;
    if (parsedQ.archiveBadge) {
      archivePill.textContent = parsedQ.archiveBadge;
      archivePill.hidden = false;
    } else {
      archivePill.textContent = 'QUIZZONE UFFICIALE';
      archivePill.hidden = false;
    }
    promptEl.textContent = parsedQ.cleanText;
    subEl.textContent = q.subprompt || '';
  }

  renderCareerRouteBoxes(q, false);

  state.selectedAnswers = new Set();
  const isMulti = Boolean(q.multiSelect || (Array.isArray(q.correct) && q.correct.length > 1));
  const answersBox = $('#answers');
  answersBox.innerHTML = q.options.map((opt, i) => `
    <button class="answer-card-btn ${isMulti ? 'multi-select-btn' : ''}" type="button" data-opt="${esc(opt)}" onclick="selectAnswer(this)">
      <span class="key-badge">${isMulti ? '☐' : (i + 1)}</span>
      <span>${esc(opt)}</span>
    </button>
  `).join('');
}

function renderCareerRouteBoxes(q, revealAll = false) {
  const routeBox = $('#careerRoute');
  if (!routeBox || !q) return;

  const isPlayer = Boolean(q.name && Array.isArray(q.clubs));
  const diffLevel = Number(q.difficultyLevel) || (state.activeUnitIdx + 1) || 1;
  const isPro = Boolean(q.isPro) || diffLevel >= 7;
  const hideYears = !revealAll && (diffLevel >= 4 || isPro);
  const mysteryIdx1 = !revealAll ? state.mysteryClubIdx : -1;
  const mysteryIdx2 = !revealAll ? state.mysteryClubIdx2 : -1;

  if (isPlayer) {
    routeBox.innerHTML = q.clubs.map((c, i) => {
      const isMystery = i === mysteryIdx1 || i === mysteryIdx2;
      const clubName = isMystery ? '❓ CLUB MISTERIOSO' : c[0];
      const clubCode = isMystery ? '???' : (c[1] || c[0]);
      const clubKit = isMystery ? 'juve' : c[2];
      const clubYear = (hideYears || isMystery) ? '????' : (c[3] || '');

      return `
        ${i > 0 ? '<span class="route-arrow-icon" aria-hidden="true">➔</span>' : ''}
        <div class="club-stop-item ${isMystery ? 'club-stop-mystery' : ''}">
          <span class="club-stop-kit">${jerseySVG(clubKit, clubCode)}</span>
          <b class="club-stop-name">${esc(clubName)}</b>
          <span class="club-stop-year">${esc(String(clubYear))}</span>
        </div>
      `;
    }).join('');
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
}

window.revealMisterHint = () => {
  const q = state.currentQuestions[state.questionIndex];
  if (!q || state.hintRevealed) return;
  state.hintRevealed = true;
  playTone('click');

  const tagEl = $('#quizTag');
  if (tagEl && q.number) {
    tagEl.textContent = `👕 GAEL LEAGUE • MAGLIA #${q.number}`;
  }
  const subEl = $('#quizSubprompt');
  if (subEl && q.hint) {
    subEl.innerHTML = `<span class="mister-hint-revealed">💡 <b>Indizio del Mister:</b> ${esc(q.hint)}</span>`;
  }
  renderCareerRouteBoxes(q, true);
};

window.selectAnswer = (btn) => {
  if (state.answered || state.sessionFinished) return;
  const q = state.currentQuestions[state.questionIndex];
  const isMulti = Boolean(q?.multiSelect || (Array.isArray(q?.correct) && q.correct.length > 1));

  if (isMulti) {
    if (!state.selectedAnswers) state.selectedAnswers = new Set();
    const opt = btn.dataset.opt;
    const badge = btn.querySelector('.key-badge');

    if (state.selectedAnswers.has(opt)) {
      state.selectedAnswers.delete(opt);
      btn.classList.remove('selected');
      if (badge) badge.textContent = '☐';
    } else {
      state.selectedAnswers.add(opt);
      btn.classList.add('selected');
      if (badge) badge.textContent = '☑';
    }

    const targetCount = Array.isArray(q.correct) ? q.correct.length : 1;
    const selCount = state.selectedAnswers.size;
    const continueBtn = $('#continueBtn');
    continueBtn.disabled = selCount === 0;
    continueBtn.textContent = selCount >= targetCount
      ? `VERIFICA (${selCount}/${targetCount})`
      : `SCEGLI ANCORA (${selCount}/${targetCount})`;
    playTone('click');
  } else {
    state.selectedAnswer = btn.dataset.opt;
    $$('.answer-card-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    const continueBtn = $('#continueBtn');
    continueBtn.disabled = false;
    continueBtn.textContent = 'VERIFICA';
    playTone('click');
  }
};

function verifyAnswer() {
  const q = state.currentQuestions[state.questionIndex];
  const isMulti = Boolean(q?.multiSelect || (Array.isArray(q?.correct) && q.correct.length > 1));
  const drawer = $('#quizBottomDrawer');
  const continueBtn = $('#continueBtn');
  const feedback = $('#feedback');

  state.answered = true;
  if (q.name && Array.isArray(q.clubs)) {
    renderCareerRouteBoxes(q, true);
    const tagEl = $('#quizTag');
    if (tagEl && q.number) tagEl.textContent = `👕 GAEL LEAGUE • MAGLIA #${q.number}`;
  }

  let isCorrect = false;
  let correctDisplay = '';

  if (isMulti) {
    const required = Array.isArray(q.correct) ? q.correct : [q.correct];
    correctDisplay = required.join(', ');
    const userSelected = Array.from(state.selectedAnswers || []);

    const hasAll = required.every(r => userSelected.includes(r));
    const noExtra = userSelected.every(u => required.includes(u));
    isCorrect = hasAll && noExtra;

    $$('.answer-card-btn').forEach(b => {
      b.disabled = true;
      const opt = b.dataset.opt;
      const badge = b.querySelector('.key-badge');
      if (required.includes(opt)) {
        b.classList.add('correct');
        if (badge) badge.textContent = '✓';
      } else if (userSelected.includes(opt)) {
        b.classList.add('wrong');
        if (badge) badge.textContent = '✗';
      }
    });
  } else {
    const rightAnswer = q.correct || q.name;
    correctDisplay = rightAnswer;
    isCorrect = state.selectedAnswer === rightAnswer;

    $$('.answer-card-btn').forEach(b => {
      b.disabled = true;
      if (b.dataset.opt === rightAnswer) b.classList.add('correct');
      else if (b.dataset.opt === state.selectedAnswer) b.classList.add('wrong');
    });
  }

  if (isCorrect) {
    state.sessionCorrect++;
    state.todayCorrect++;
    state.comboStreak++;
    const mult = getRoundMultiplier(state.survivalRound);
    const earnedNow = Math.round(10 * mult);
    state.pendingXp = (state.pendingXp || 0) + earnedNow;
    const goalVariant = playTone('correct');

    const goalBanners = [
      '⚽ GOOOOL! BOATO DELLA CURVA!',
      '🔥 EUROGOL ALL\'INCROCIO DEI PALI!',
      '⚡ TIRO DELLA TIGRE IN RETE!',
      '🎺 STADIO IN DELIRIO! RETEEEE!'
    ];
    const shoutText = goalBanners[(goalVariant || 0) % goalBanners.length];

    $('#quizMascotMood').textContent = '🥳';
    if (state.comboStreak >= 2) {
      $('#quizComboPill').hidden = false;
      $('#quizComboNum').textContent = `${state.comboStreak}x`;
    }

    drawer.className = 'quiz-bottom-drawer state-correct';
    feedback.innerHTML = `
      <div class="goal-shout-banner">${shoutText} (+${earnedNow} XP • Bottino: ${state.pendingXp} XP)</div>
      <div style="display:flex;align-items:center;gap:8px;font-size:17px;margin-bottom:3px;">
        <span>✅</span> <b>ESATTO! ${isMulti ? 'MARCATORI: ' : ''}${esc(correctDisplay.toUpperCase())}</b>
      </div>
      <p style="font-size:12.5px;font-weight:700;">${esc(q.check || '')}</p>
    `;
    continueBtn.textContent = 'CONTINUA';
  } else {
    state.comboStreak = 0;
    $('#quizComboPill').hidden = true;
    $('#quizMascotMood').textContent = '😱';

    if (state.quizMode !== 'practice') {
      state.hearts = Math.max(0, state.hearts - 1);
    }
    $('#quizHeartsNum').textContent = state.hearts;
    const missVariant = playTone('wrong');

    const missBanners = [
      '😱 OOOOOH! BOATO DELLO STADIO: TRAVERSA PIENA!',
      '📢 FISCHIO DELL\'ARBITRO! PALLONE IN TRIBUNA!',
      '💥 PARATA MIRACOLOSA DEL PORTIERE!'
    ];
    const missText = missBanners[(missVariant || 0) % missBanners.length];

    drawer.className = 'quiz-bottom-drawer state-wrong';
    feedback.innerHTML = `
      <div class="miss-shout-banner">${missText} ${state.hearts <= 0 ? '• 💔 ULTIMA VITA PERSA!' : `• ❤️ ${state.hearts} VITE RIMASTE`}</div>
      <div style="display:flex;align-items:center;gap:8px;font-size:16px;margin-bottom:3px;">
        <span>❌</span> <b>RISPOSTA CORRETTA: ${esc(correctDisplay)}</b>
      </div>
      <p style="font-size:12.5px;font-weight:700;">${esc(q.check || '')}</p>
    `;
    continueBtn.textContent = state.hearts <= 0 ? '💔 ESITO PARTITA' : 'HO CAPITO';
  }

  updateTopStats();
  persistState();
}

function handleContinueClick() {
  if (state.sessionFinished) {
    if (state.hearts > 0 && (state.pendingXp > 0 || state.pendingGems > 0)) {
      cashOutQuizRun();
    } else {
      closeQuizSession();
    }
    return;
  }

  if (!state.answered) {
    verifyAnswer();
    return;
  }

  if (state.quizMode !== 'practice' && state.hearts <= 0) {
    failQuizSessionByNoHearts();
    return;
  }

  state.questionIndex++;
  if (state.questionIndex >= state.currentQuestions.length) {
    completeQuizSession();
  } else {
    renderQuizQuestion();
  }
}

function failQuizSessionByNoHearts() {
  state.sessionFinished = true;
  const lostXp = state.pendingXp || 0;
  const lostGems = state.pendingGems || 0;
  state.pendingXp = 0;
  state.pendingGems = 0;

  playTone('wrong');

  const fill = $('#quizProgressFill');
  if (fill) fill.style.width = '100%';

  if ($('#completionBadgeText')) {
    $('#completionBadgeText').textContent = `💔 VITE ESAURITE AL ROUND ${state.survivalRound} (LIV. ${state.currentDiffLevel})`;
  }
  if ($('#completionTitle')) {
    $('#completionTitle').textContent = 'HAI ESAURITO LE VITE!';
    $('#completionTitle').style.color = 'var(--duo-red)';
  }
  if ($('#completionSub')) {
    $('#completionSub').innerHTML = `Non hai incassato in tempo e il bottino accumulato (<b>${lostXp} XP</b> e <b>${lostGems} 💎</b>) è sfumato! Ricarica subito le 5 vite per riprovare la scalata.`;
  }

  $('#compXpVal').textContent = '0 XP';
  $('#compAccVal').textContent = '💔 0 Vite';
  $('#compGemsVal').textContent = '0 💎';

  const nextBtn = $('#btnNextDifficulty');
  if (nextBtn) nextBtn.hidden = true;

  const cashBtn = $('#btnCashOutBank');
  if (cashBtn) {
    cashBtn.textContent = '🏥 RICARICA VITE (GEMME / ALLENAMENTO / SPOT)';
    cashBtn.onclick = () => {
      closeQuizSession();
      openHeartsFreemiumModal();
    };
  }

  $('#quizQuestionView').hidden = true;
  $('#quizCompletionView').hidden = false;

  const drawer = $('#quizBottomDrawer');
  drawer.className = 'quiz-bottom-drawer state-wrong';
  $('#feedback').innerHTML = '<b>💔 Triplice fischio amaro! Vai in Infermeria per ricaricare le vite.</b>';
  const continueBtn = $('#continueBtn');
  continueBtn.disabled = false;
  continueBtn.textContent = '🏥 RICARICA VITE ➔';
}

function completeQuizSession() {
  state.sessionFinished = true;
  state.dailyGoalDone++;

  const mult = getRoundMultiplier(state.survivalRound);
  const roundBonusXp = Math.round(40 * mult);
  const roundBonusGems = Math.round(15 * mult);
  state.pendingXp = (state.pendingXp || 0) + roundBonusXp;
  state.pendingGems = (state.pendingGems || 0) + roundBonusGems;

  if (state.quizMode === 'practice' && state.hearts < state.maxHearts) {
    state.hearts = Math.min(state.maxHearts, state.hearts + 1);
  }

  playTone('cheer');

  const isPastoreMode = state.sessionGameType === 'pastore' || state.activeGameMode === 'pastore';
  const isGaelMode = state.sessionGameType === 'gael' || state.activeGameMode === 'gael';
  const isF1 = state.activeSport === 'f1';
  const isBasket = state.activeSport === 'basket';
  const compTrophy = $('#completionTrophyImg');
  if (compTrophy) {
    compTrophy.src = isF1
      ? 'assets/trophy-f1.jpg?v=32'
      : isBasket
        ? 'assets/trophy-basket.jpg?v=32'
        : isPastoreMode
          ? 'assets/trophy-pastore.jpg?v=32'
          : isGaelMode
            ? 'assets/trophy-gael.jpg?v=32'
            : 'assets/trophy-quizzone.jpg?v=32';
    compTrophy.alt = isF1
      ? 'Coppa dei Motori F1'
      : isBasket
        ? 'Trofeo Larry O\'Brien NBA'
        : isPastoreMode
          ? 'Coppa Pastore League'
          : isGaelMode
            ? 'Coppa Gael League'
            : 'Coppa Quizzone';
  }

  if (state.quizMode === 'path') {
    const unitObj = catalog?.units?.[state.activeUnitIdx];
    const key = `${unitObj?.id || `u${state.activeUnitIdx + 1}`}-l${state.activeLessonIdx + 1}`;
    if (!state.completedLessons.includes(key)) {
      state.completedLessons.push(key);
    }
  }

  // RETENTION & STREAK PER CATEGORIA
  recordCategoryDailyWin(state.activeSport || 'calcio');

  persistState();
  updateTopStats();

  const fill = $('#quizProgressFill');
  if (fill) fill.style.width = '100%';

  const nextDiff = Math.min(10, (state.currentDiffLevel || 1) + 1);
  const nextMult = getRoundMultiplier((state.survivalRound || 1) + 1);

  const diffLabels = {
    1: 'Esordienti (Carriera Completa)',
    2: 'Big Anni \'90 (Senza Indizio Automatico)',
    3: 'Campioni 2000 (Opzioni Simili)',
    4: 'Doppi Ex (Maglia #?? Nascosta)',
    5: 'Fantasisti (Maglia #?? Nascosta)',
    6: 'Idoli di Piazza (Maglia #?? Nascosta)',
    7: 'Uomini Coppa (Anni Nascosti 🔒)',
    8: 'Re di Provincia (Anni Nascosti 🔒)',
    9: 'Cult Heroes (1 Club Misterioso ❓)',
    10: 'Meteore Estreme (1 Club Misterioso ❓)'
  };

  if ($('#completionBadgeText')) {
    $('#completionBadgeText').textContent = `ROUND ${state.survivalRound} SUPERATO • DIFFICOLTÀ LIV. ${state.currentDiffLevel}/10`;
  }
  if ($('#completionTitle')) {
    $('#completionTitle').textContent = '💰 INCASSI O VAI AVANTI?';
    $('#completionTitle').style.color = 'var(--duo-green)';
  }
  if ($('#completionSub')) {
    $('#completionSub').innerHTML = `Hai nel piatto <b>+${state.pendingXp} XP</b> e <b>+${state.pendingGems} 💎</b> con <b>❤️ ${state.hearts} vite</b> rimaste! Vuoi <b>incassare il bottino</b> o sfidare altre 5 domande alla <b>Difficoltà Successiva (Liv. ${nextDiff}/10 • Bonus x${nextMult})</b> finché non esaurisci le vite?`;
  }

  $('#compXpVal').textContent = `+${state.pendingXp} XP`;
  $('#compAccVal').textContent = `❤️ ${state.hearts}/${state.maxHearts}`;
  $('#compGemsVal').textContent = `+${state.pendingGems} 💎`;

  const nextBtn = $('#btnNextDifficulty');
  if (nextBtn) {
    nextBtn.hidden = false;
    const titleEl = $('#nextDiffBtnTitle');
    const subEl = $('#nextDiffBtnSub');
    if (titleEl) {
      titleEl.textContent = `🔥 VAI ALLA DIFFICOLTÀ SUCCESSIVA (LIV. ${nextDiff}/10 • x${nextMult})`;
    }
    if (subEl) {
      subEl.textContent = `Prossimo step: ${diffLabels[nextDiff] || 'Livello Maestro'} • Rischia il bottino con ❤️ ${state.hearts} vite!`;
    }
  }

  const cashBtn = $('#btnCashOutBank');
  if (cashBtn) {
    cashBtn.textContent = `💰 INCASSA ORA (+${state.pendingXp} XP & +${state.pendingGems} 💎)`;
    cashBtn.onclick = () => window.cashOutQuizRun();
  }

  $('#quizQuestionView').hidden = true;
  $('#quizCompletionView').hidden = false;

  const drawer = $('#quizBottomDrawer');
  drawer.className = 'quiz-bottom-drawer state-correct';
  $('#feedback').innerHTML = `<b>🏆 Round ${state.survivalRound} completato! Scegli: Incassa (+${state.pendingXp} XP) o Rilancia a Difficoltà Liv. ${nextDiff}!</b>`;
  const continueBtn = $('#continueBtn');
  continueBtn.disabled = false;
  continueBtn.textContent = `💰 INCASSA (+${state.pendingXp} XP) ➔`;

  launchConfetti();
}

window.cashOutQuizRun = () => {
  const bankedXp = state.pendingXp || 0;
  const bankedGems = state.pendingGems || 0;
  state.xp += bankedXp;
  state.gems += bankedGems;
  state.pendingXp = 0;
  state.pendingGems = 0;

  playTone('cheer');

  const isPastoreMode = state.sessionGameType === 'pastore' || state.activeGameMode === 'pastore';
  const isGaelMode = state.sessionGameType === 'gael' || state.activeGameMode === 'gael';
  const isF1 = state.activeSport === 'f1';
  const isBasket = state.activeSport === 'basket';
  const compTrophy = $('#completionTrophyImg');
  if (compTrophy) {
    compTrophy.src = isF1
      ? 'assets/trophy-f1.jpg?v=32'
      : isBasket
        ? 'assets/trophy-basket.jpg?v=32'
        : isPastoreMode
          ? 'assets/trophy-pastore.jpg?v=32'
          : isGaelMode
            ? 'assets/trophy-gael.jpg?v=32'
            : 'assets/trophy-quizzone.jpg?v=32';
    compTrophy.alt = isF1
      ? 'Coppa dei Motori F1'
      : isBasket
        ? 'Trofeo Larry O\'Brien NBA'
        : isPastoreMode
          ? 'Coppa Pastore League'
          : isGaelMode
            ? 'Coppa Gael League'
            : 'Coppa Quizzone';
  }
  recordCategoryDailyWin(state.activeSport || 'calcio');
  trackEvent('quiz_session_cashout', { xp: bankedXp, gems: bankedGems, sport: state.activeSport, round: state.survivalRound });
  persistState();
  updateTopStats();
  closeQuizSession();
};

window.advanceToNextDifficultyRound = () => {
  if (state.hearts <= 0) {
    failQuizSessionByNoHearts();
    return;
  }

  playTone('click');
  stopConfetti();

  state.survivalRound = (state.survivalRound || 1) + 1;
  state.currentDiffLevel = Math.min(10, (state.currentDiffLevel || 1) + 1);

  // Avanza anche il puntatore della mappa se siamo sul percorso
  if (state.quizMode === 'path') {
    const actualMode = (state.sessionGameType === 'quiz' || state.sessionGameType === 'quizzone') ? 'quizzocampo' : (state.sessionGameType || 'gael');
    const modeUnits = catalog?.units?.filter(u => (u.mode || '') === actualMode) || [];
    const targetUnit = modeUnits[Math.min(modeUnits.length - 1, state.currentDiffLevel - 1)];
    if (targetUnit) {
      state.activeUnitIdx = catalog.units.indexOf(targetUnit);
    }
  }

  const nextQuestions = getQuestionsForDifficulty(state.sessionGameType || 'gael', state.currentDiffLevel, 5);
  state.currentQuestions = nextQuestions.map(q => ({
    ...q,
    difficultyLevel: state.currentDiffLevel,
    options: [...(q.options || [])]
  }));

  state.questionIndex = 0;
  state.selectedAnswer = null;
  state.answered = false;
  state.sessionFinished = false;
  state.sessionCorrect = 0;

  $('#quizCompletionView').hidden = true;
  $('#quizQuestionView').hidden = false;
  renderQuizQuestion();
};

// -------------------------------------------------------------
// 9. MOTORE CONFETTI CANVAS
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
// 10. CLASSIFICA UFFICIALE (SOLO GIOCATORI REALI CLOUD SUPABASE)
// -------------------------------------------------------------
async function renderLeaderboard() {
  const list = $('#leaderboardList');
  const podiumEl = $('#leaguePodium');
  if (!list) return;

  let competitors = [];

  // Se Supabase è attivo, carica ESCLUSIVAMENTE i giocatori reali registrati nel Cloud
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('id, username, avatar_letter, xp')
        .order('xp', { ascending: false })
        .limit(50);

      if (!error && Array.isArray(data)) {
        competitors = data
          .filter(r => !currentCloudUser || r.id !== currentCloudUser.id)
          .map(r => ({
            name: r.username || 'Giocatore',
            xp: Number(r.xp) || 0,
            av: (r.avatar_letter || r.username || 'G').trim().charAt(0).toUpperCase()
          }));
      }
    } catch (e) {
      console.warn('Errore lettura profili Supabase:', e);
    }
  }

  const userAvatar = (state.username || 'M').trim().charAt(0).toUpperCase();
  const full = [
    ...competitors,
    { name: `${state.username} (Tu)`, xp: state.xp, av: userAvatar, isUser: true }
  ].sort((a, b) => b.xp - a.xp);

  // Rendering dinamico del Podio (#leaguePodium) SOLO con giocatori reali
  if (podiumEl) {
    if (full.length === 1) {
      const p1 = full[0];
      podiumEl.innerHTML = `
        <div class="podium-step step-1" style="transform:none;">
          <span class="podium-crown">👑</span>
          <span class="podium-medal">🥇</span>
          <div class="podium-avatar av-gold">${esc(p1.av)}</div>
          <b>${esc(p1.name)}</b>
          <span class="podium-xp">${p1.xp} XP</span>
        </div>
      `;
    } else if (full.length === 2) {
      const p1 = full[0];
      const p2 = full[1];
      podiumEl.innerHTML = `
        <div class="podium-step step-2">
          <span class="podium-medal">🥈</span>
          <div class="podium-avatar av-blue">${esc(p2.av)}</div>
          <b>${esc(p2.name)}</b>
          <span class="podium-xp">${p2.xp} XP</span>
        </div>
        <div class="podium-step step-1">
          <span class="podium-crown">👑</span>
          <span class="podium-medal">🥇</span>
          <div class="podium-avatar av-gold">${esc(p1.av)}</div>
          <b>${esc(p1.name)}</b>
          <span class="podium-xp">${p1.xp} XP</span>
        </div>
      `;
    } else {
      const p1 = full[0];
      const p2 = full[1];
      const p3 = full[2];
      podiumEl.innerHTML = `
        <div class="podium-step step-2">
          <span class="podium-medal">🥈</span>
          <div class="podium-avatar av-blue">${esc(p2.av)}</div>
          <b>${esc(p2.name)}</b>
          <span class="podium-xp">${p2.xp} XP</span>
        </div>
        <div class="podium-step step-1">
          <span class="podium-crown">👑</span>
          <span class="podium-medal">🥇</span>
          <div class="podium-avatar av-gold">${esc(p1.av)}</div>
          <b>${esc(p1.name)}</b>
          <span class="podium-xp">${p1.xp} XP</span>
        </div>
        <div class="podium-step step-3">
          <span class="podium-medal">🥉</span>
          <div class="podium-avatar av-green">${esc(p3.av)}</div>
          <b>${esc(p3.name)}</b>
          <span class="podium-xp">${p3.xp} XP</span>
        </div>
      `;
    }
  }

  // Rendering righe classifica (#leaderboardList)
  const rowsHtml = [];
  full.forEach((c, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`;
    rowsHtml.push(`
      <div class="rank-row ${c.isUser ? 'is-user' : ''}">
        <span class="rank-pos">${medal}</span>
        <span class="rank-av">${esc(c.av)}</span>
        <span class="rank-name">${esc(c.name)}</span>
        <span class="rank-xp">${Number(c.xp) || 0} XP</span>
      </div>
    `);
    if (i === 2 && full.length > 3) {
      rowsHtml.push(`<div class="promotion-divider">▲ ZONA PROMOZIONE LEGA FUORICLASSE ▲</div>`);
    }
  });

  if (full.length === 1) {
    rowsHtml.push(`
      <div style="text-align:center;padding:16px 12px;font-size:13px;color:var(--text-muted);line-height:1.4;">
        ⚽ <b>Sei al 1° posto!</b> Condividi Fuoriclasse con gli amici per sfidarli in classifica generale.
      </div>
    `);
  }

  list.innerHTML = rowsHtml.join('');
}

function renderQuests() {
  const m1 = Math.min(5, state.todayCorrect);
  const m1Pct = Math.round((m1 / 5) * 100);
  if ($('#quest1Fill')) $('#quest1Fill').style.width = `${m1Pct}%`;
  if ($('#quest1Label')) $('#quest1Label').textContent = `${m1} / 5 risposte esatte`;

  const m2 = Math.min(50, state.xp);
  const m2Pct = Math.round((m2 / 50) * 100);
  if ($('#quest2Fill')) $('#quest2Fill').style.width = `${m2Pct}%`;
  if ($('#quest2Label')) $('#quest2Label').textContent = `${m2} / 50 XP guadagnati`;

  const m3 = Math.min(3, state.completedLessons.length);
  const m3Pct = Math.round((m3 / 3) * 100);
  if ($('#quest3Fill')) $('#quest3Fill').style.width = `${m3Pct}%`;
  if ($('#quest3Label')) $('#quest3Label').textContent = `${m3} / 3 tappe completate`;

  if ($('#railGoalFill')) $('#railGoalFill').style.width = `${m1Pct}%`;
  if ($('#railGoalText')) $('#railGoalText').textContent = `${m1} / 5 sfide completate oggi`;
  if ($('#railGoalPct')) $('#railGoalPct').textContent = `${m1Pct}%`;

  let unlockedCount = 2;
  const u1Done = Array.from({ length: 10 }, (_, i) => `u1-l${i + 1}`).every(k => state.completedLessons.includes(k));
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

function updateTopStats() {
  if ($('#streakCount')) $('#streakCount').textContent = state.streak;
  if ($('#gemsCount')) $('#gemsCount').textContent = state.gems;
  if ($('#heartsCount')) $('#heartsCount').textContent = state.hearts;
  if ($('#railStreakCount')) $('#railStreakCount').textContent = state.streak;
  if ($('#railHeartsCount')) $('#railHeartsCount').textContent = `${state.hearts}/${state.maxHearts}`;

  if ($('#profileName')) $('#profileName').textContent = state.username || 'Mister Fuoriclasse';
  if ($('#profileNicknameInput') && document.activeElement !== $('#profileNicknameInput')) {
    $('#profileNicknameInput').value = state.username || 'Mister Fuoriclasse';
  }
  if ($('#onboardingUsernameInput') && document.activeElement !== $('#onboardingUsernameInput')) {
    $('#onboardingUsernameInput').value = state.username === 'Mister Fuoriclasse' ? '' : state.username;
  }
  if ($('#topUserNameText')) {
    $('#topUserNameText').textContent = state.username && state.username !== 'Mister Fuoriclasse'
      ? state.username.toUpperCase()
      : (currentCloudUser ? 'PROFILO' : 'ACCEDI');
  }
  if ($('#topUserIcon')) {
    $('#topUserIcon').textContent = currentCloudUser ? '🟢' : '👤';
  }
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
// 11. CAMBIO SCHEDA / TAB SWITCHER
// -------------------------------------------------------------
function switchTab(tabId, forcedGameMode = null) {
  state.activeTab = tabId;
  if (forcedGameMode) {
    state.activeGameMode = forcedGameMode;
  }

  $$('.view-panel').forEach(p => p.hidden = true);
  const target = $(`#view-${tabId}`);
  if (target) target.hidden = false;

  $$('.sidebar-nav .nav-item').forEach(link => {
    if (link.dataset.tab === 'path' && link.dataset.gamemode) {
      link.classList.toggle('active', tabId === 'path' && link.dataset.gamemode === state.activeGameMode);
    } else {
      link.classList.toggle('active', link.dataset.tab === tabId);
    }
  });

  $$('.duo-mobile-nav .mobile-nav-btn').forEach(btn => {
    if (btn.dataset.tab === 'path' && btn.dataset.gamemode) {
      btn.classList.toggle('active', tabId === 'path' && btn.dataset.gamemode === state.activeGameMode);
    } else {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    }
  });

  if (tabId === 'path') {
    setGameMode(state.activeGameMode, false);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// -------------------------------------------------------------
// 12. MOTORE AUDIO PRO STADIO & 16-BIT ARCADE (DISATTIVABILE)
// - Sintesi Pink-Noise 1/f con filtri formanti vocali (vero boato "GOOOOL!" e vero coro delusione "OOOOOH!")
// - Riverbero Stadio stereo + Fischietto Arbitro con trillo reale (pea-whistle FM) + Ottoni/Chiptune filtrati caldi
// -------------------------------------------------------------
let audioCtx = null;
let stadiumReverbNode = null;
let pinkNoiseBuffer = null;

function getPinkNoiseBuffer(ctx, durationSec = 2.0) {
  const sampleRate = ctx.sampleRate;
  const bufferSize = Math.floor(sampleRate * durationSec);
  const buffer = ctx.createBuffer(2, bufferSize, sampleRate);

  for (let ch = 0; ch < 2; ch++) {
    const out = buffer.getChannelData(ch);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.042;
      b6 = white * 0.115926;
    }
  }
  return buffer;
}

function getStadiumReverb(ctx) {
  if (stadiumReverbNode) return stadiumReverbNode;
  const length = Math.floor(ctx.sampleRate * 1.15);
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      const decay = Math.pow(1 - i / length, 2.6);
      data[i] = (Math.random() * 2 - 1) * decay * 0.35;
    }
  }
  const convolver = ctx.createConvolver();
  convolver.buffer = impulse;
  convolver.connect(ctx.destination);
  stadiumReverbNode = convolver;
  return convolver;
}

// Boato della Curva con formanti vocali ("GOOOOOOL!") + rombo basso dello stadio
function playStadiumGoalRoar(ctx, durationSec = 1.25, intensity = 0.34) {
  const now = ctx.currentTime;
  if (!pinkNoiseBuffer) pinkNoiseBuffer = getPinkNoiseBuffer(ctx, 2.2);
  const reverb = getStadiumReverb(ctx);

  // 3 formanti corali (simulano migliaia di voci su vocali A / O)
  const formants = [
    { fStart: 420, fEnd: 620, q: 2.2, weight: 0.45 },
    { fStart: 820, fEnd: 1180, q: 2.5, weight: 0.38 },
    { fStart: 1450, fEnd: 1850, q: 3.0, weight: 0.22 }
  ];

  formants.forEach(fm => {
    const src = ctx.createBufferSource();
    src.buffer = pinkNoiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(fm.q, now);
    filter.frequency.setValueAtTime(fm.fStart, now);
    filter.frequency.exponentialRampToValueAtTime(fm.fEnd, now + durationSec * 0.45);
    filter.frequency.exponentialRampToValueAtTime(fm.fStart * 1.15, now + durationSec);

    const gain = ctx.createGain();
    const peak = intensity * fm.weight;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.16);
    gain.gain.setValueAtTime(peak * 0.92, now + durationSec * 0.55);
    gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    gain.connect(reverb);

    src.start(now);
    src.stop(now + durationSec);
  });

  // Caldo rombo acustico da stadio (lowpass 165Hz)
  const subNoise = ctx.createBufferSource();
  subNoise.buffer = pinkNoiseBuffer;
  const lowFilter = ctx.createBiquadFilter();
  lowFilter.type = 'lowpass';
  lowFilter.frequency.setValueAtTime(165, now);
  const lowGain = ctx.createGain();
  lowGain.gain.setValueAtTime(0.001, now);
  lowGain.gain.linearRampToValueAtTime(intensity * 0.45, now + 0.18);
  lowGain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);
  subNoise.connect(lowFilter);
  lowFilter.connect(lowGain);
  lowGain.connect(ctx.destination);
  subNoise.start(now);
  subNoise.stop(now + durationSec);
}

// Boato di delusione dello stadio ("OOOOOOH!") con transizione formante vocale F1/F2 discendente
function playStadiumMissGroan(ctx, durationSec = 1.05, intensity = 0.36) {
  const now = ctx.currentTime;
  if (!pinkNoiseBuffer) pinkNoiseBuffer = getPinkNoiseBuffer(ctx, 2.2);
  const reverb = getStadiumReverb(ctx);

  // Transizione vocale umana da "AAAH!" a "OOOOOH!" (F1: 680->340Hz, F2: 1180->640Hz)
  const vocalFormants = [
    { f1: 680, f2: 330, q: 3.6, w: 0.58 },
    { f1: 1180, f2: 640, q: 4.0, w: 0.36 },
    { f1: 210, f2: 115, q: 1.8, w: 0.42 }
  ];

  vocalFormants.forEach(vf => {
    const src = ctx.createBufferSource();
    src.buffer = pinkNoiseBuffer;

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.setValueAtTime(vf.q, now);
    bp.frequency.setValueAtTime(vf.f1, now);
    bp.frequency.exponentialRampToValueAtTime(vf.f2, now + durationSec * 0.72);

    const g = ctx.createGain();
    const peak = intensity * vf.w;
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(peak, now + 0.12);
    g.gain.setValueAtTime(peak * 0.85, now + 0.38);
    g.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

    src.connect(bp);
    bp.connect(g);
    g.connect(ctx.destination);
    g.connect(reverb);

    src.start(now);
    src.stop(now + durationSec);
  });
}

// Fischietto reale dell'arbitro con pallina vibrante (FM + AM pea trill a 28Hz)
function playRefereeWhistle(ctx, startTime, duration = 0.22, baseFreq = 2820, volume = 0.085) {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  const lp = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc1.type = 'sine';
  osc2.type = 'triangle';
  osc1.frequency.setValueAtTime(baseFreq, startTime);
  osc2.frequency.setValueAtTime(baseFreq * 1.018, startTime); // Leggero battimento dual-chamber

  // Trillo della pallina del fischietto (28 Hz)
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(28, startTime);
  lfoGain.gain.setValueAtTime(55, startTime);
  lfo.connect(lfoGain);
  lfoGain.connect(osc1.frequency);
  lfoGain.connect(osc2.frequency);

  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(3600, startTime);

  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
  gain.gain.setValueAtTime(volume * 0.9, startTime + duration - 0.04);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc1.connect(lp);
  osc2.connect(lp);
  lp.connect(gain);
  gain.connect(ctx.destination);
  gain.connect(getStadiumReverb(ctx));

  osc1.start(startTime);
  osc2.start(startTime);
  lfo.start(startTime);
  osc1.stop(startTime + duration);
  osc2.stop(startTime + duration);
  lfo.stop(startTime + duration);
}

// Nota musicale calda filtrata (stile SNES / Ottoni da stadio senza asprezza)
function playWarmNote(ctx, freq, startTime, duration, waveType = 'sawtooth', vol = 0.1, cutoff = 1850) {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc1.type = waveType;
  osc2.type = waveType === 'sawtooth' ? 'triangle' : 'sine';
  osc1.frequency.setValueAtTime(freq, startTime);
  osc2.frequency.setValueAtTime(freq * 1.003, startTime); // Chorus caldo

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(cutoff, startTime);
  filter.frequency.exponentialRampToValueAtTime(cutoff * 0.65, startTime + duration);

  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.linearRampToValueAtTime(vol, startTime + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  gain.connect(getStadiumReverb(ctx));

  osc1.start(startTime);
  osc2.start(startTime);
  osc1.stop(startTime + duration);
  osc2.stop(startTime + duration);
}

function playTone(type) {
  if (!state.soundEnabled) return 0;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;

    if (type === 'correct') {
      const variant = Math.floor(Math.random() * 4);

      if (variant === 0) {
        // GOAL 1: Fischio dell'arbitro + Boato "GOOOOL!" della Curva + Accordo trionfale caldo
        playRefereeWhistle(audioCtx, now, 0.20, 2840, 0.08);
        playStadiumGoalRoar(audioCtx, 1.35, 0.36);
        const chord = [523.25, 659.25, 783.99, 1046.5];
        chord.forEach((f, i) => {
          playWarmNote(audioCtx, f, now + 0.08 + i * 0.07, 0.48, 'triangle', 0.11, 2200);
        });
        // Basso fondamentale caldo
        playWarmNote(audioCtx, 261.63, now + 0.08, 0.55, 'sine', 0.15, 800);
      } else if (variant === 1) {
        // GOAL 2: Fanfara 16-Bit SNES stile Captain Tsubasa + Boato Stadio
        playStadiumGoalRoar(audioCtx, 1.25, 0.30);
        const melody = [
          { f: 587.33, t: 0.00, d: 0.09 },
          { f: 587.33, t: 0.09, d: 0.09 },
          { f: 587.33, t: 0.18, d: 0.09 },
          { f: 880.00, t: 0.27, d: 0.22 },
          { f: 783.99, t: 0.49, d: 0.14 },
          { f: 1174.66, t: 0.63, d: 0.45 }
        ];
        melody.forEach(n => {
          playWarmNote(audioCtx, n.f, now + n.t, n.d, 'square', 0.085, 2100);
          playWarmNote(audioCtx, n.f * 0.5, now + n.t, n.d, 'triangle', 0.09, 1200);
        });
      } else if (variant === 2) {
        // GOAL 3: Fruscio della rete + Trombe da Stadio ("Olé!") + Boato Curva
        playStadiumGoalRoar(audioCtx, 1.4, 0.38);
        const horns = [
          { f: 392.00, t: 0.02, d: 0.14 },
          { f: 523.25, t: 0.16, d: 0.14 },
          { f: 659.25, t: 0.30, d: 0.16 },
          { f: 783.99, t: 0.46, d: 0.50 }
        ];
        horns.forEach(h => {
          playWarmNote(audioCtx, h.f, now + h.t, h.d, 'sawtooth', 0.095, 1650);
          playWarmNote(audioCtx, h.f * 0.75, now + h.t, h.d, 'triangle', 0.06, 1400);
        });
      } else {
        // GOAL 4: Tiro della Tigre (Impatto pallone + Boato esplosivo + Arpeggio vittoria)
        playStadiumGoalRoar(audioCtx, 1.3, 0.35);
        // Colpo del pallone nel sette (sub-kick)
        const kick = audioCtx.createOscillator();
        const kGain = audioCtx.createGain();
        kick.type = 'sine';
        kick.frequency.setValueAtTime(150, now);
        kick.frequency.exponentialRampToValueAtTime(42, now + 0.14);
        kGain.gain.setValueAtTime(0.28, now);
        kGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        kick.connect(kGain);
        kGain.connect(audioCtx.destination);
        kick.start(now);
        kick.stop(now + 0.16);

        [440, 554.37, 659.25, 880, 1108.73].forEach((f, idx) => {
          playWarmNote(audioCtx, f, now + 0.06 + idx * 0.06, 0.38, 'triangle', 0.10, 2400);
        });
      }
      return variant;
    } else if (type === 'wrong') {
      const variant = Math.floor(Math.random() * 3);

      if (variant === 0) {
        // ERRORE 1: Colpo sulla Traversa ("DOOONG!") + Boato di delusione dello stadio ("OOOOOH!")
        playStadiumMissGroan(audioCtx, 1.15, 0.38);

        // Impatto del pallone sul legno/metallo della traversa
        const thud = audioCtx.createOscillator();
        const tGain = audioCtx.createGain();
        thud.type = 'sine';
        thud.frequency.setValueAtTime(135, now);
        thud.frequency.exponentialRampToValueAtTime(45, now + 0.12);
        tGain.gain.setValueAtTime(0.30, now);
        tGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        thud.connect(tGain);
        tGain.connect(audioCtx.destination);
        thud.start(now);
        thud.stop(now + 0.14);

        // Risonanza tubolare metallica del palo (armonica morbida, non gracchiante)
        [515, 778].forEach((f, i) => {
          playWarmNote(audioCtx, f, now, 0.32 - i * 0.08, 'sine', 0.11, 1400);
        });
      } else if (variant === 1) {
        // ERRORE 2: Doppio fischio fallo dell'arbitro ("Fiii-Fiiiii!") + Boato "OOOOOH!" della curva
        playRefereeWhistle(audioCtx, now, 0.12, 2760, 0.075);
        playRefereeWhistle(audioCtx, now + 0.15, 0.26, 2680, 0.085);
        playStadiumMissGroan(audioCtx, 1.10, 0.35);
        playWarmNote(audioCtx, 146.83, now + 0.15, 0.45, 'triangle', 0.14, 600);
      } else {
        // ERRORE 3: Cadenza minore 16-bit morbida + Sospiro di delusione dello stadio
        playStadiumMissGroan(audioCtx, 1.05, 0.34);
        const sadNotes = [
          { f: 349.23, t: 0.00, d: 0.14 },
          { f: 311.13, t: 0.12, d: 0.14 },
          { f: 261.63, t: 0.24, d: 0.36 }
        ];
        sadNotes.forEach(n => {
          playWarmNote(audioCtx, n.f, now + n.t, n.d, 'triangle', 0.12, 1100);
          playWarmNote(audioCtx, n.f * 0.5, now + n.t, n.d, 'sine', 0.10, 600);
        });
      }
      return variant;
    } else if (type === 'click') {
      playWarmNote(audioCtx, 660, now, 0.045, 'triangle', 0.055, 1800);
    } else if (type === 'cheer') {
      playRefereeWhistle(audioCtx, now, 0.11, 2850, 0.07);
      playRefereeWhistle(audioCtx, now + 0.14, 0.11, 2850, 0.07);
      playRefereeWhistle(audioCtx, now + 0.28, 0.28, 2920, 0.085);
      playStadiumGoalRoar(audioCtx, 1.5, 0.38);
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        playWarmNote(audioCtx, freq, now + 0.15 + idx * 0.09, 0.45, 'triangle', 0.11, 2200);
      });
    }
  } catch (e) {}
  return 0;
}

// -------------------------------------------------------------
// 13. SINTESI VOCALE DOMANDE
// -------------------------------------------------------------
function speakCurrentQuestion() {
  if (!('speechSynthesis' in window)) return;
  const q = state.currentQuestions[state.questionIndex];
  if (!q) return;

  window.speechSynthesis.cancel();
  const parsed = parseCleanQuestionText(q.question || '');
  const text = q.name
    ? `Gael League: indovina il giocatore che ha militato in ${(q.clubs || []).map(c => c[0]).join(', ')}. Opzioni: ${q.options.join(', ')}`
    : `Quizzocampo: ${parsed.cleanText}. Opzioni: ${q.options.join(', ')}`;

  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'it-IT';
  u.rate = 1.0;
  window.speechSynthesis.speak(u);
}

// -------------------------------------------------------------
// 14. GESTIONE MODALI E EVENT LISTENERS
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

  // Mode Switcher Buttons (Gael League vs Quizzocampo)
  $$('.mode-switch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playTone('click');
      setGameMode(btn.dataset.mode, true);
    });
  });

  // Tab switchers (Desktop e Mobile)
  $$('.sidebar-nav .nav-item, .duo-mobile-nav .mobile-nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(btn.dataset.tab, btn.dataset.gamemode || null);
    });
  });

  // Brand Home Link
  $('#brandHomeLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchTab('path', 'gael');
  });

  // Hero Quick Play
  $('#heroQuickPlayBtn')?.addEventListener('click', () => {
    const { uIdx, lIdx } = getActiveLessonCoords(state.activeGameMode);
    forceStartNode(uIdx, lIdx);
  });

  // Selettore Rapido Unità
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

  // Toggle Audio (Goal & Boato Disattivabili)
  const audioBtn = $('#audioToggle');
  if (audioBtn) {
    const syncAudioBtnUI = () => {
      $('#audioIcon').textContent = state.soundEnabled ? '🔊' : '🔇';
      if ($('#audioLabelText')) {
        $('#audioLabelText').textContent = state.soundEnabled ? 'SUONI ON' : 'MUTO';
      }
      audioBtn.setAttribute('aria-pressed', String(state.soundEnabled));
    };
    syncAudioBtnUI();
    audioBtn.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      syncAudioBtnUI();
      if (state.soundEnabled) playTone('click');
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
  $('#authClose')?.addEventListener('click', () => {
    localStorage.setItem(ONBOARDING_DONE_KEY, '1');
    $('#authModal').hidden = true;
  });
  $('#authOkBtn')?.addEventListener('click', () => {
    localStorage.setItem(ONBOARDING_DONE_KEY, '1');
    $('#authModal').hidden = true;
  });

  $('#topUserLoginBtn')?.addEventListener('click', () => $('#authModal').hidden = false);
  $('#openAuthModalBtn')?.addEventListener('click', () => $('#authModal').hidden = false);
  $('#sidebarDeployBtn')?.addEventListener('click', () => $('#authModal').hidden = false);
  $('#sidebarSourcesBtn')?.addEventListener('click', () => $('#sourcesModal').hidden = false);

  // Azioni Banner Home Installazione PWA & Accesso Google
  $('#btnBannerLoginGoogle')?.addEventListener('click', async () => {
    if (!supabaseClient) {
      $('#authModal').hidden = false;
      return;
    }
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: getAppRedirectUrl() }
    });
    if (error) {
      openModal('Errore Google Login', `<p>${esc(error.message)}</p>`);
    }
  });

  $('#btnBannerInstallPwa')?.addEventListener('click', async () => {
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      const choice = await window.deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        window.deferredPrompt = null;
        updateHomeInstallBannerVisibility();
      }
    } else {
      openModal('📲 Installazione Fuoriclasse PWA', `
        <div style="line-height:1.6;font-size:14px;">
          <p><b>🍏 Su iPhone / iPad (Safari):</b><br>
          1. Tocca l'icona <b>Condividi ⎘</b> in basso al centro.<br>
          2. Scorri in basso e tocca <b>"Aggiungi alla schermata Home" ➕</b>.<br>
          3. Tocca <b>Aggiungi</b> in alto a destra!</p>
          <hr style="margin:12px 0;border:0;border-top:1px solid var(--border-light);">
          <p><b>🤖 Su Android / Chrome / PC:</b><br>
          1. Tocca i tre puntini <b>⋮</b> in alto a destra.<br>
          2. Seleziona <b>"Installa app"</b> oppure <b>"Aggiungi a schermata Home"</b>.<br>
          3. Troverai Fuoriclasse tra le tue app a schermo intero!</p>
        </div>
      `);
    }
  });

  $('#btnBannerDismiss')?.addEventListener('click', () => {
    const banner = $('#homeInstallLoginBanner');
    if (banner) {
      banner.hidden = true;
      banner.style.display = 'none';
    }
  });

  // Reset vite a mezzanotte quando l'utente riapre la scheda/app
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      checkMidnightHeartsReset();
      updateHomeInstallBannerVisibility();
    }
  });

  // Salvataggio Nickname Giocatore (dalla scheda Profilo)
  $('#saveNicknameBtn')?.addEventListener('click', () => {
    const val = sanitizeUsername($('#profileNicknameInput')?.value || '');
    if (val) {
      state.username = val;
      localStorage.setItem(ONBOARDING_DONE_KEY, '1');
      persistState();
      updateTopStats();
      renderLeaderboard();
      playTone('correct');
      openModal('✅ Nickname Aggiornato', `<p>Il tuo nome in classifica è ora <b>${esc(state.username)}</b>!</p>`);
    }
  });

  // Inizializza Cloud e bottoni Auth
  initSupabase();

  const getAppRedirectUrl = () => {
    if (window.location.hostname.includes('fuoriclasse.cloud')) {
      return `${window.location.origin}/`;
    }
    if (window.location.hostname.includes('matteornati.com')) {
      return 'https://www.matteornati.com/Fuoriclasse/index.html';
    }
    return window.location.origin + window.location.pathname;
  };

  // UNICO ACCESSO UFFICIALE: LOGIN CON GOOGLE
  $('#btnSupabaseGoogle')?.addEventListener('click', async () => {
    const msgEl = $('#authFeedbackMsg');
    if (!supabaseClient) return;
    if (msgEl) msgEl.textContent = '⏳ Connessione a Google in corso...';
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: getAppRedirectUrl() }
    });
    if (error && msgEl) msgEl.textContent = `❌ Errore Google: ${error.message}`;
  });

  // Salvataggio Nickname Scelto dall'Utente
  $('#saveOnboardingUsernameBtn')?.addEventListener('click', async () => {
    const raw = ($('#onboardingUsernameInput')?.value || '').trim();
    const clean = sanitizeUsername(raw);
    const fb = $('#usernameFeedbackMsg');
    if (!clean) {
      if (fb) {
        fb.style.color = '#ef4444';
        fb.textContent = '⚠️ Inserisci un soprannome valido (1-24 caratteri).';
      }
      return;
    }
    state.username = clean;
    state.avatarLetter = clean.charAt(0).toUpperCase();
    persistState();
    updateTopStats();
    await syncProfileToSupabase();
    await renderLeaderboard();
    if (fb) {
      fb.style.color = '#10b981';
      fb.textContent = `✅ Perfetto ${clean}! Nickname registrato in classifica.`;
    }
    setTimeout(() => {
      $('#authModal').hidden = true;
    }, 1200);
  });

  $('#btnForceCloudPush')?.addEventListener('click', async () => {
    await syncProfileToSupabase();
    const msgEl = $('#authFeedbackMsg');
    if (msgEl) msgEl.textContent = '☁️ Progressi salvati nel Cloud Supabase!';
  });

  $('#syncCloudNowBtn')?.addEventListener('click', async () => {
    if (!supabaseClient || !currentCloudUser) {
      $('#authModal').hidden = false;
      return;
    }
    await syncProfileToSupabase();
    await renderLeaderboard();
    openModal('☁️ Sincronizzazione Completata', '<p>I tuoi XP, Cuori, Gemme e Tappe di Gael League e Quizzocampo sono stati salvati su Supabase!</p>');
  });

  $('#btnSupabaseLogout')?.addEventListener('click', async () => {
    if (supabaseClient) await supabaseClient.auth.signOut();
    currentCloudUser = null;
    updateCloudStatusUI(null, Boolean(supabaseClient));
    const msgEl = $('#authFeedbackMsg');
    if (msgEl) msgEl.textContent = '👋 Disconnesso dall\'account Cloud.';
  });

  // Modal Infermeria & Ricarica Vite (Architettura Freemium: Ripasso, Gemme, Spot Sponsor, Timer 15m, PRO)
  $('#topHeartsPillBtn')?.addEventListener('click', () => openHeartsFreemiumModal());
  $('#heartsModalClose')?.addEventListener('click', () => {
    $('#heartsEmptyModal').hidden = true;
  });

  $('#practiceToRegainHeartBtn')?.addEventListener('click', () => {
    $('#heartsEmptyModal').hidden = true;
    const pool = state.activeGameMode === 'gael'
      ? (catalog.gaelModes?.allstars || [])
      : (catalog.extraModes?.goals || []);
    startQuizSession('practice', sampleQuestions(pool, 5));
  });

  $('#refillHeartsCoinsBtn')?.addEventListener('click', () => {
    const fb = $('#freemiumActionFeedback');
    if (state.hearts >= state.maxHearts) {
      if (fb) fb.textContent = '✅ Hai già il massimo delle vite (5/5 ❤️)!';
      return;
    }
    if (state.gems >= 50) {
      state.gems -= 50;
      state.hearts = state.maxHearts;
      playTone('cheer');
      updateTopStats();
      persistState();
      if ($('#freemiumHeartsNow')) $('#freemiumHeartsNow').textContent = state.hearts;
      if ($('#freemiumGemsNow')) $('#freemiumGemsNow').textContent = state.gems;
      if (fb) fb.textContent = '🎉 5/5 Vite ricaricate con 50 Gemme!';
      setTimeout(() => { $('#heartsEmptyModal').hidden = true; }, 800);
    } else {
      if (fb) fb.textContent = '⚠️ Ti servono 50 💎! Usa l\'Allenamento gratuito o lo Spot Sponsor.';
    }
  });

  $('#watchAdForHeartBtn')?.addEventListener('click', () => {
    const btn = $('#watchAdForHeartBtn');
    const fb = $('#freemiumActionFeedback');
    if (state.hearts >= state.maxHearts) {
      if (fb) fb.textContent = '✅ Hai già 5/5 ❤️!';
      return;
    }
    if (btn.disabled) return;
    btn.disabled = true;
    let sec = 5;
    btn.textContent = `⏳ Sponsor Amazon... (${sec}s)`;
    const timer = setInterval(() => {
      sec--;
      if (sec > 0) {
        btn.textContent = `⏳ Sponsor Amazon... (${sec}s)`;
      } else {
        clearInterval(timer);
        state.hearts = Math.min(state.maxHearts, state.hearts + 1);
        playTone('correct');
        updateTopStats();
        persistState();
        btn.disabled = false;
        btn.textContent = '❤️ Guarda 5s (+1 Vita)';
        if ($('#freemiumHeartsNow')) $('#freemiumHeartsNow').textContent = state.hearts;
        if (fb) fb.textContent = '🎉 +1 ❤️ Vita ricaricata con lo Sponsor Amazon!';
      }
    }, 1000);
  });

  // Timer automatico rigenerazione gratuita (+1 ❤️ ogni 15 minuti) & Reset Vite a Mezzanotte
  let regenSecondsLeft = 15 * 60;
  setInterval(() => {
    checkMidnightHeartsReset();
    const timerEl = $('#heartsRegenTimerText');
    if (state.hearts >= state.maxHearts) {
      regenSecondsLeft = 15 * 60;
      if (timerEl) timerEl.textContent = '✅ Batterie al 100%: hai tutte le 5/5 ❤️ vite disponibili!';
      return;
    }
    regenSecondsLeft--;
    if (regenSecondsLeft <= 0) {
      state.hearts = Math.min(state.maxHearts, state.hearts + 1);
      regenSecondsLeft = 15 * 60;
      updateTopStats();
      persistState();
      if ($('#freemiumHeartsNow')) $('#freemiumHeartsNow').textContent = state.hearts;
    }
    const mm = String(Math.floor(regenSecondsLeft / 60)).padStart(2, '0');
    const ss = String(regenSecondsLeft % 60).padStart(2, '0');
    if (timerEl) {
      timerEl.textContent = `⏱️ Prossima vita gratis (+1 ❤️) tra ${mm}:${ss}`;
    }
  }, 1000);

  $('#practiceHeartsBtn')?.addEventListener('click', () => {
    openHeartsFreemiumModal();
  });

  // Arene Rapide GAEL LEAGUE (anni90, anni2000, allstars, pro)
  $$('.extra-card[data-gaelmode]').forEach(card => {
    card.addEventListener('click', () => {
      const gMode = card.dataset.gaelmode;
      const pool = catalog.gaelModes?.[gMode] || [];
      const questions = sampleQuestions(pool, 5);
      if (questions.length) {
        startQuizSession(`gael-${gMode}`, questions);
      }
    });
  });

  // Modalità PASTORE (Marcatori Serie A dal 1990 a oggi)
  $$('.extra-card[data-pastoremode]').forEach(card => {
    card.addEventListener('click', () => {
      const pool = catalog.pastoreMode || [];
      const questions = sampleQuestions(pool, 5);
      if (questions.length) {
        startQuizSession('pastore', questions);
      }
    });
  });

  // Arene Rapide QUIZZOCAMPO (goals, scorers, derby, champions)
  $$('.extra-card[data-mode]').forEach(card => {
    card.addEventListener('click', () => {
      const mode = card.dataset.mode;
      const pool = catalog.extraModes?.[mode] || [];
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
    openModal('🔄 Cache Wikidata Ripulita', `<p>Sono state rimosse <b>${count}</b> voci dalla cache locale.</p>`);
  });

  // GESTIONE SELETTORE MULTI-SPORT
  $('#sportSelectorBtn')?.addEventListener('click', () => {
    renderStreakDetailModal();
    const modal = $('#sportModal');
    if (modal) modal.hidden = false;
  });
  $('#sportModalClose')?.addEventListener('click', () => {
    const modal = $('#sportModal');
    if (modal) modal.hidden = true;
  });
  $('#chooseSportCalcio')?.addEventListener('click', () => window.switchSport('calcio'));
  $('#chooseSportF1')?.addEventListener('click', () => window.switchSport('f1'));
  $('#chooseSportBasket')?.addEventListener('click', () => window.switchSport('basket'));

  // GESTIONE FIAMMA & RETENTION STREAK
  const openStreakModal = () => {
    renderStreakDetailModal();
    const modal = $('#streakDetailModal');
    if (modal) modal.hidden = false;
  };
  $('#topStreakPillBtn')?.addEventListener('click', openStreakModal);
  $('#railStreakBox')?.addEventListener('click', openStreakModal);
  $('#streakDetailClose')?.addEventListener('click', () => {
    const modal = $('#streakDetailModal');
    if (modal) modal.hidden = true;
  });
  $('#streakCelebrationOkBtn')?.addEventListener('click', () => {
    const modal = $('#streakCelebrationModal');
    if (modal) modal.hidden = true;
  });

  // ACQUISTO GELO FIAMMA (STREAK FREEZE)
  $('#btnBuyFreeze')?.addEventListener('click', () => {
    const curSport = state.activeSport || 'calcio';
    const cost = 100;
    if (state.gems < cost) {
      alert('Non hai abbastanza gemme! Te ne servono 100 💎 per acquistare un Gelo Fiamma.');
      return;
    }
    state.gems -= cost;
    if (!state.categoryStreaks) state.categoryStreaks = {};
    if (!state.categoryStreaks[curSport]) {
      state.categoryStreaks[curSport] = { streak: 0, lastDay: null, freezeCount: 0 };
    }
    state.categoryStreaks[curSport].freezeCount = (state.categoryStreaks[curSport].freezeCount || 0) + 1;
    playTone('cheer');
    persistState();
    updateTopStats();
    renderStreakDetailModal();
    openModal('🧊 Gelo Fiamma Attivato!', `<p>Hai protetto la tua fiamma per la categoria <b>${curSport.toUpperCase()}</b>! Se salti un giorno di sfide, il Gelo Fiamma manterrà intatto il tuo streak.</p>`);
  });

  // Reset Progressi
  $('#resetProgressBtn')?.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    state.xp = 120;
    state.streak = 1;
    state.gems = 250;
    state.hearts = 5;
    state.completedLessons = ['u1-l1', 'u7-l1'];
    state.claimedChests = [];
    state.todayCorrect = 0;
    persistState();
    renderSnakePath();
    renderLeaderboard();
    renderQuests();
    updateTopStats();
    openModal('✅ Progressi Azzerati', '<p>Il tuo profilo locale è stato riportato all\'inizio della stagione.</p>');
  });
});

// -------------------------------------------------------------
// 15. REGISTRAZIONE SERVICE WORKER & ANTI-CACHE STALE SU MOBILE
// -------------------------------------------------------------
function purgeLegacySetupBlocks() {
  document.querySelectorAll('.deploy-section').forEach(sec => {
    const txt = sec.textContent || '';
    if (
      txt.includes('Collega il tuo Database Supabase') ||
      txt.includes('Caricamento su Aruba') ||
      txt.includes('CREDENZIALI PROGETTO SUPABASE') ||
      txt.includes('PACCHETTO PRONTO PER ARUBA')
    ) {
      sec.remove();
    }
  });
}
purgeLegacySetupBlocks();

if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    purgeLegacySetupBlocks();
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })
      .then(reg => {
        console.info('Fuoriclasse Service Worker attivo:', reg.scope);
      })
      .catch(err => console.warn('Registrazione Service Worker:', err.message));
  });
}
