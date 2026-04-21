/* ═══════════════════════════════════════════════════════════════
   COSMIC ENERGY DAILY — app-ui.js  (v2 — full parity with app)
   All 35 gaps from gap analysis fixed.
   Depends on: data.js (for ytIds), stars.js (canvas animation)
   Save to: assets/js/app-ui.js
   ═══════════════════════════════════════════════════════════════ */

const G = {
  gold:'#C9A84C', gDim:'rgba(201,168,76,0.35)', gGlow:'rgba(201,168,76,0.15)',
  text:'#E8E0CC', dim:'rgba(232,224,204,0.5)',
};

/* ── FULL SIGNS ARRAY ──────────────────────────────────────── */
const SIGNS = [
  {name:'Aries',       s:'♈',dates:'Mar 21–Apr 19',el:'Fire', ruler:'Mars',    trait:'Bold & Pioneering',    elC:'#C84B4B',
   reading:'A surge of Martian initiative graces your path. Trust the impulse to begin what you have been postponing — your energy is magnetic and irresistible today.'},
  {name:'Taurus',      s:'♉',dates:'Apr 20–May 20',el:'Earth',ruler:'Venus',   trait:'Steady & Sensual',     elC:'#7A9A4A',
   reading:'Venus whispers of abundance and sensory pleasure. A slow, intentional approach yields more than haste. Beauty surrounds you — allow yourself to receive it fully.'},
  {name:'Gemini',      s:'♊',dates:'May 21–Jun 20',el:'Air',  ruler:'Mercury', trait:'Quick & Curious',      elC:'#5A9FD4',
   reading:'Mercury sharpens your mind to a fine point. A chance conversation carries an unexpected gift; one exchange could open a door you did not know existed.'},
  {name:'Cancer',      s:'♋',dates:'Jun 21–Jul 22',el:'Water',ruler:'Moon',    trait:'Deep & Nurturing',     elC:'#4A7FBF',
   reading:"The Moon's tender pull asks you to tend what matters most. Emotional honesty with someone close will deepen a bond that time has tested."},
  {name:'Leo',         s:'♌',dates:'Jul 23–Aug 22',el:'Fire', ruler:'Sun',     trait:'Radiant & Proud',      elC:'#C87832',
   reading:'The Sun illuminates your natural authority. Step into the spotlight without apology — what you share from the heart will resonate far wider than you expect.'},
  {name:'Virgo',       s:'♍',dates:'Aug 23–Sep 22',el:'Earth',ruler:'Mercury', trait:'Precise & Devoted',    elC:'#7A9A4A',
   reading:'Details others overlook become your greatest asset. A methodical review will reveal a hidden flaw — and its elegant, perfectly calibrated solution.'},
  {name:'Libra',       s:'♎',dates:'Sep 23–Oct 22',el:'Air',  ruler:'Venus',   trait:'Balanced & Just',      elC:'#5A9FD4',
   reading:'Balance comes not from stillness but from constant micro-adjustments. A relationship asks for honest negotiation. Lead with grace and you will find it.'},
  {name:'Scorpio',     s:'♏',dates:'Oct 23–Nov 21',el:'Water',ruler:'Pluto',   trait:'Intense & Perceptive', elC:'#4A3A90',
   reading:'Your perception cuts through pretense today. What lies beneath a situation is finally visible — use this knowledge with wisdom, not with force.'},
  {name:'Sagittarius', s:'♐',dates:'Nov 22–Dec 21',el:'Fire', ruler:'Jupiter', trait:'Free & Visionary',     elC:'#C87832',
   reading:'Jupiter expands your vision to horizons others cannot see. A long-distance connection or philosophical shift arrives. Embrace the adventure without overplanning.'},
  {name:'Capricorn',   s:'♑',dates:'Dec 22–Jan 19',el:'Earth',ruler:'Saturn',  trait:'Disciplined & Driven', elC:'#7A9A4A',
   reading:"Saturn rewards those who persist when others surrender. Today's challenge is a test of character — your response will determine which door opens next."},
  {name:'Aquarius',    s:'♒',dates:'Jan 20–Feb 18',el:'Air',  ruler:'Uranus',  trait:'Original & Visionary', elC:'#5A9FD4',
   reading:'Uranus sparks a breakthrough in how you see a longstanding problem. Your unconventional instinct is correct — trust the original idea, not the conventional one.'},
  {name:'Pisces',      s:'♓',dates:'Feb 19–Mar 20',el:'Water',ruler:'Neptune', trait:'Fluid & Empathic',     elC:'#4A3A90',
   reading:'Neptune dissolves the boundary between dream and reality. Creative inspiration arrives in quiet moments — protect your solitude and let the vision emerge fully.'},
];

/* ── MOON PHASE (anchored to known full moon 2026-04-13) ───── */
function moonPhase(date) {
  date = date || new Date();
  const fullMoon = new Date('2026-04-13');
  const diff = (date - fullMoon) / 864e5;
  const c = ((diff % 29.53) + 29.53) % 29.53;
  if (c < 1.85)  return {n:'New Moon',        i:'🌑'};
  if (c < 7.38)  return {n:'Waxing Crescent', i:'🌒'};
  if (c < 9.22)  return {n:'First Quarter',   i:'🌓'};
  if (c < 14.77) return {n:'Waxing Gibbous',  i:'🌔'};
  if (c < 16.61) return {n:'Full Moon',        i:'🌕'};
  if (c < 22.15) return {n:'Waning Gibbous',  i:'🌖'};
  if (c < 23.99) return {n:'Last Quarter',    i:'🌗'};
  return {n:'Waning Crescent', i:'🌘'};
}

const MOON_DESCS = {
  'New Moon':'A time for new beginnings and setting intentions.',
  'Waxing Crescent':'Momentum builds — take inspired action.',
  'First Quarter':'Balance effort with rest; check your progress.',
  'Waxing Gibbous':'Energy peaks — stay focused on your goals.',
  'Full Moon':'Culmination and celebration — manifest fully.',
  'Waning Gibbous':'Release what no longer serves you.',
  'Last Quarter':'Turn inward; reassess and refine.',
  'Waning Crescent':'Rest, reflect and prepare for the new cycle.',
};

/* ── ENERGY BARS (date-seeded, matches app formula exactly) ── */
function energyBars(idx) {
  const d = new Date().getDate();
  return {
    love:   55 + ((idx * 7  + d * 3) % 35),
    career: 50 + ((idx * 11 + d * 5) % 40),
    health: 60 + ((idx * 3  + d * 7) % 30),
    spirit: 45 + ((idx * 13 + d * 2) % 45),
  };
}

const EL_COLORS = {Fire:'#C84B4B', Earth:'#7A9A4A', Air:'#5A9FD4', Water:'#4A7FBF', All:'#C9A84C'};
const BAR_COLS  = {love:'#C84B7A', career:'#C9A84C', health:'#4A9A6A', spirit:'#6B4FBF'};

/* ── STATE ─────────────────────────────────────────────────── */
let currentSignIdx = null;
let savedIdxs      = JSON.parse(localStorage.getItem('ced_saved') || '[]');
let discoverFilter = 'All';
let moonMonth      = new Date().getMonth();
const moonYear     = new Date().getFullYear();

/* ── INIT ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  setDatePill();
  setMoonChips();
  buildSignGrids();
  renderDiscoverList();
  renderMoonCalendar();
  renderSavedList();
  populateProfileSelect();

  const stored = localStorage.getItem('ced_sign');
  if (stored !== null) {
    currentSignIdx = parseInt(stored);
    showReading(currentSignIdx);
    updateProfileCard(currentSignIdx);
  }

  if (localStorage.getItem('ced_nav_collapsed') === '1') {
    document.getElementById('bottom-nav').classList.add('collapsed');
  }
});

/* ── NAV COLLAPSE ──────────────────────────────────────────── */
function toggleNav() {
  const nav = document.getElementById('bottom-nav');
  const collapsed = nav.classList.toggle('collapsed');
  localStorage.setItem('ced_nav_collapsed', collapsed ? '1' : '0');
}

/* ── DATE PILL ─────────────────────────────────────────────── */
function setDatePill() {
  const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const now    = new Date();
  const str    = `${days[now.getDay()]} · ${months[now.getMonth()]} ${now.getDate()}`;
  const el = document.getElementById('date-pill');
  if (el) el.textContent = str;
}

/* ── MOON CHIPS ─────────────────────────────────────────────── */
function setMoonChips() {
  const m = moonPhase();
  const chip   = document.getElementById('moon-chip');
  const badge  = document.getElementById('sidebar-moon');
  const disp   = document.getElementById('moon-phase-display');
  const orb    = document.getElementById('moon-orb');
  const nameEl = document.getElementById('moon-name');
  const descEl = document.getElementById('moon-desc');
  if (chip)   chip.textContent  = m.i;
  if (badge)  badge.textContent = `${m.i} ${m.n}`;
  if (disp)   disp.textContent  = m.i;
  if (orb)    orb.textContent   = m.i;
  if (nameEl) nameEl.textContent = m.n;
  if (descEl) descEl.textContent = MOON_DESCS[m.n] || '';
}

/* ══════════════════════════════════════════════════════════════
   SIGN GRIDS (Onboarding + Home empty)
══════════════════════════════════════════════════════════════ */
function buildSignGrids() {
  ['sign-grid-home','sign-grid-onboarding'].forEach(id => {
    const grid = document.getElementById(id);
    if (!grid) return;
    SIGNS.forEach((s, i) => {
      const tile = document.createElement('button');
      tile.className = 'sign-tile';
      tile.innerHTML = `<span class="symbol">${s.s}</span><span class="label">${s.name}</span>`;
      tile.onclick = () => selectSign(i);
      grid.appendChild(tile);
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   SELECT SIGN
══════════════════════════════════════════════════════════════ */
function selectSign(idx) {
  currentSignIdx = idx;
  localStorage.setItem('ced_sign', String(idx));
  showScreen('home');
  showReading(idx);
  updateProfileCard(idx);
  const sel = document.getElementById('profile-sign-select');
  if (sel) sel.value = SIGNS[idx].name;
}

/* ══════════════════════════════════════════════════════════════
   SHOW READING (Home screen populated state)
══════════════════════════════════════════════════════════════ */
function showReading(idx) {
  const s      = SIGNS[idx];
  const energy = energyBars(idx);
  const moon   = moonPhase();

  // Toggle empty/reading
  const empty   = document.getElementById('home-empty');
  const reading = document.getElementById('home-reading');
  if (empty)   empty.style.display   = 'none';
  if (reading) reading.style.display = 'block';

  // Hero glyph (large, glowing)
  const hero = document.getElementById('r-hero-symbol');
  if (hero) hero.textContent = s.s;

  // Name + dates
  const rName  = document.getElementById('r-name');
  const rDates = document.getElementById('r-dates');
  if (rName)  rName.textContent  = s.name;
  if (rDates) rDates.textContent = s.dates;

  // Moon + element badges
  const badgeEl = document.getElementById('r-badges');
  if (badgeEl) {
    badgeEl.innerHTML =
      `<span class="badge-pill">${moon.i} ${moon.n}</span>` +
      `<span class="badge-pill" style="border-color:${s.elC};color:${s.elC}">${s.el}</span>`;
  }

  // Reading text
  const rDesc = document.getElementById('r-desc');
  if (rDesc) rDesc.textContent = s.reading;

  // Energy bars with per-category colours + % labels
  Object.entries(energy).forEach(([key, val]) => {
    const fill  = document.getElementById(`bar-${key}`);
    const label = document.getElementById(`bar-pct-${key}`);
    if (fill) {
      fill.style.width      = '0';
      fill.style.background = `linear-gradient(90deg, ${BAR_COLS[key]}, ${BAR_COLS[key]}88)`;
      setTimeout(() => { fill.style.width = val + '%'; }, 120);
    }
    if (label) label.textContent = val + '%';
  });

  // Ruler / Element / Nature stat row
  const ruler   = document.getElementById('stat-ruler');
  const element = document.getElementById('stat-element');
  const nature  = document.getElementById('stat-nature');
  if (ruler)   ruler.textContent    = s.ruler;
  if (element) { element.textContent = s.el; element.style.color = s.elC; }
  if (nature)  nature.textContent   = s.trait.split(' & ')[0];

  updateBookmarkBtn();

  // Close video
  const vw = document.getElementById('video-wrap');
  if (vw) vw.style.display = 'none';
}

function changeSign() {
  const empty   = document.getElementById('home-empty');
  const reading = document.getElementById('home-reading');
  if (empty)   { empty.style.display = 'flex'; empty.style.flexDirection = 'column'; }
  if (reading) reading.style.display = 'none';
}

function openVideo() {
  if (currentSignIdx === null) return;
  const s  = SIGNS[currentSignIdx];
  const vw = document.getElementById('video-wrap');
  const vf = document.getElementById('video-frame');
  if (!vw || !vf) return;
  let videoId = '';
  if (typeof ytIds !== 'undefined' && ytIds[s.name]) videoId = ytIds[s.name];
  if (videoId) {
    vf.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" allowfullscreen allow="autoplay"></iframe>`;
    vw.style.display = 'block';
    vw.scrollIntoView({behavior:'smooth', block:'nearest'});
  } else {
    window.open('https://youtube.com/@CosmicEnergyDaily', '_blank');
  }
}

/* ══════════════════════════════════════════════════════════════
   DISCOVER — vertical list with reading excerpts + per-element colours
══════════════════════════════════════════════════════════════ */
function renderDiscoverList() {
  const container = document.getElementById('discover-list');
  if (!container) return;
  const filtered = discoverFilter === 'All' ? SIGNS : SIGNS.filter(s => s.el === discoverFilter);
  container.innerHTML = filtered.map(s => {
    const idx     = SIGNS.indexOf(s);
    const isSaved = savedIdxs.includes(idx);
    const excerpt = s.reading.length > 110 ? s.reading.substring(0, 110) + '…' : s.reading;
    return `
      <div class="feed-card glass" onclick="openSignReading(${idx})">
        <div class="feed-card-inner" style="border-left:3px solid ${s.elC}">
          <div class="feed-symbol">${s.s}</div>
          <div class="feed-info">
            <div class="feed-name-row">
              <span class="feed-name">${s.name}</span>
              <span class="el-tag" style="border-color:${s.elC};color:${s.elC}">${s.el}</span>
            </div>
            <p class="feed-excerpt">${excerpt}</p>
          </div>
        </div>
        <button class="heart-btn${isSaved ? ' saved' : ''}" onclick="event.stopPropagation();toggleSave(${idx})">
          ${isSaved ? '♥' : '♡'}
        </button>
      </div>`;
  }).join('');
}

function filterDiscover(el, btn) {
  discoverFilter = el;
  document.querySelectorAll('.filter-pill').forEach(p => {
    p.classList.remove('active');
    p.style.borderColor = '';
    p.style.color = '';
  });
  btn.classList.add('active');
  const col = EL_COLORS[el] || G.gold;
  btn.style.borderColor = col;
  btn.style.color       = col;
  btn.style.background  = col + '18';
  renderDiscoverList();
}

function openSignReading(idx) { selectSign(idx); }

/* ══════════════════════════════════════════════════════════════
   MOON CALENDAR — month nav + day headers + phase legend
══════════════════════════════════════════════════════════════ */
function renderMoonCalendar() {
  const cal = document.getElementById('moon-calendar');
  if (!cal) return;
  const today        = new Date();
  const daysInMonth  = new Date(moonYear, moonMonth + 1, 0).getDate();
  const firstDay     = new Date(moonYear, moonMonth, 1).getDay();
  const monthNames   = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const label = document.getElementById('moon-month-label');
  if (label) label.textContent = `${monthNames[moonMonth]} ${moonYear}`;

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const isToday = d => moonMonth === today.getMonth() && moonYear === today.getFullYear() && d === today.getDate();

  cal.innerHTML = `
    <div class="cal-day-headers">
      ${['S','M','T','W','T','F','S'].map(d => `<div class="cal-hdr">${d}</div>`).join('')}
    </div>
    <div class="cal-grid">
      ${cells.map(d => !d ? '<div></div>' : `
        <div class="moon-day${isToday(d) ? ' today' : ''}">
          <span class="md-num">${d}</span>
          <span class="md-phase">${moonPhase(new Date(moonYear, moonMonth, d)).i}</span>
        </div>`).join('')}
    </div>
    <div class="phase-legend">
      ${[['🌑','New'],['🌓','First Q'],['🌕','Full'],['🌗','Last Q']].map(([icon, lbl]) =>
        `<div class="legend-card glass"><div>${icon}</div><div class="legend-lbl">${lbl}</div></div>`
      ).join('')}
    </div>`;
}

function prevMonth() { moonMonth = moonMonth > 0 ? moonMonth - 1 : 11; renderMoonCalendar(); }
function nextMonth() { moonMonth = moonMonth < 11 ? moonMonth + 1 : 0;  renderMoonCalendar(); }

/* ══════════════════════════════════════════════════════════════
   SAVE / BOOKMARK
══════════════════════════════════════════════════════════════ */
function toggleSave(idx) {
  const pos = savedIdxs.indexOf(idx);
  if (pos > -1) savedIdxs.splice(pos, 1);
  else savedIdxs.push(idx);
  localStorage.setItem('ced_saved', JSON.stringify(savedIdxs));
  updateBookmarkBtn();
  renderSavedList();
  renderDiscoverList();
}

function toggleBookmark() {
  if (currentSignIdx === null) return;
  toggleSave(currentSignIdx);
}

function updateBookmarkBtn() {
  const btn = document.getElementById('bookmark-btn');
  if (!btn || currentSignIdx === null) return;
  const saved = savedIdxs.includes(currentSignIdx);
  btn.textContent = saved ? '♥' : '♡';
  btn.classList.toggle('saved', saved);
}

function renderSavedList() {
  const list = document.getElementById('saved-list');
  if (!list) return;
  if (!savedIdxs.length) {
    list.innerHTML = `<div class="empty-state"><div style="font-size:2rem;margin-bottom:12px">♡</div><p>No saved readings yet.<br>Tap ♡ on any reading to save it.</p></div>`;
    return;
  }
  list.innerHTML = savedIdxs.map(idx => {
    const s       = SIGNS[idx];
    const excerpt = s.reading.length > 90 ? s.reading.substring(0, 90) + '…' : s.reading;
    return `
      <div class="saved-card glass" onclick="openSignReading(${idx})" style="border-left:3px solid ${s.elC}">
        <div class="sc-symbol">${s.s}</div>
        <div class="sc-body">
          <div class="sc-name">${s.name}</div>
          <p class="sc-excerpt">${excerpt}</p>
        </div>
        <span class="sc-heart">♥</span>
      </div>`;
  }).join('');
}

/* ══════════════════════════════════════════════════════════════
   PROFILE
══════════════════════════════════════════════════════════════ */
function populateProfileSelect() {
  const sel = document.getElementById('profile-sign-select');
  if (!sel) return;
  SIGNS.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.name;
    opt.textContent = `${s.s} ${s.name}`;
    sel.appendChild(opt);
  });
  if (currentSignIdx !== null) sel.value = SIGNS[currentSignIdx].name;
}

function setProfileSign(name) {
  const idx = SIGNS.findIndex(s => s.name === name);
  if (idx !== -1) selectSign(idx);
}

function updateProfileCard(idx) {
  const s = SIGNS[idx];
  const av  = document.getElementById('profile-avatar');
  const nm  = document.getElementById('profile-sign-name');
  const dt  = document.getElementById('profile-sign-dates');
  if (av) av.textContent = s.s;
  if (nm) nm.textContent = `${s.name} ${s.s}`;
  if (dt) { dt.textContent = `${s.dates} · ${s.el}`; dt.style.color = s.elC; }
}

/* ══════════════════════════════════════════════════════════════
   NEWSLETTER
══════════════════════════════════════════════════════════════ */
function submitNewsletter() {
  const email   = document.getElementById('nl-email')?.value.trim();
  const sign    = document.getElementById('nl-sign')?.value;
  const agree   = document.getElementById('nl-agree')?.checked;
  const msg     = document.getElementById('nl-msg');
  const form    = document.getElementById('nl-form-wrap');
  const success = document.getElementById('nl-success');
  if (!email || !sign || !agree) {
    if (msg) { msg.style.color = '#ff6b6b'; msg.textContent = 'Please fill all fields and agree to the privacy policy.'; }
    return;
  }

  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzCDo8bOVUUBsGJlWlAMIUDegu1hA_HbkbwQQBqVNS1LhcDRa7dN0QcavmgCMRHCQ4K/exec';

  fetch(SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, sign, agreed: agree }),
  }).catch(() => {}); // no-cors — response is opaque, silently ignore errors

  if (form)    form.style.display    = 'none';
  if (success) success.style.display = 'flex';
}

/* ══════════════════════════════════════════════════════════════
   SCREEN NAVIGATION
══════════════════════════════════════════════════════════════ */
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('screen-' + name);
  if (target) target.classList.add('active');
  document.querySelectorAll('.nav-btn, .snav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.screen === name);
  });
  window.scrollTo({top:0, behavior:'smooth'});
}
