/* ═══════════════════════════════════════════════════════
   COSMIC ENERGY DAILY — app-ui.js
   Wires up the app UI. Depends on data.js being loaded first.
   Save to: assets/js/app-ui.js
   ═══════════════════════════════════════════════════════ */

/* ── SIGN DATA ─────────────────────────────────────────
   Uses the `signs` array already loaded from data.js.
   Falls back gracefully if data.js format differs.
──────────────────────────────────────────────────────── */
const ELEMENTS = {
  Aries:'fire', Leo:'fire', Sagittarius:'fire',
  Taurus:'earth', Virgo:'earth', Capricorn:'earth',
  Gemini:'air', Libra:'air', Aquarius:'air',
  Cancer:'water', Scorpio:'water', Pisces:'water'
};

const ELEMENT_EMOJI = { fire:'🔥', earth:'🌿', air:'💨', water:'💧' };

const MOON_PHASES = ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'];
const MOON_NAMES  = [
  'New Moon','Waxing Crescent','First Quarter','Waxing Gibbous',
  'Full Moon','Waning Gibbous','Last Quarter','Waning Crescent'
];
const MOON_DESCS  = [
  'A time for new beginnings and setting intentions.',
  'Momentum builds — take inspired action.',
  'Balance effort with rest; check your progress.',
  'Energy peaks — stay focused on your goals.',
  'Culmination and celebration — manifest fully.',
  'Release what no longer serves you.',
  'Turn inward; reassess and refine.',
  'Rest, reflect and prepare for the new cycle.'
];

/* ── STATE ─────────────────────────────────────────── */
let currentSign   = localStorage.getItem('ced_sign') || null;
let savedReadings = JSON.parse(localStorage.getItem('ced_saved') || '[]');
let videoOpen     = false;

/* ── INIT ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  setDatePill();
  setMoonPhase();
  buildSignGrids();
  buildDiscoverGrid();
  buildMoonCalendar();
  buildSavedList();
  populateProfileSelect();

  if (currentSign) {
    selectSign(currentSign);
  }

  // Sync profile sign selector
  const sel = document.getElementById('profile-sign-select');
  if (sel && currentSign) sel.value = currentSign;

  // Stars (reuse existing stars.js — it targets #stars canvas)
  // If stars.js is present it runs itself. Nothing needed here.
});

/* ── DATE PILL ──────────────────────────────────────── */
function setDatePill() {
  const opts = { weekday:'long', year:'numeric', month:'long', day:'numeric' };
  const str  = new Date().toLocaleDateString('en-US', opts);
  const el   = document.getElementById('date-pill');
  if (el) el.textContent = str;
}

/* ── MOON PHASE ─────────────────────────────────────── */
function getMoonPhaseIndex() {
  const known    = new Date(2000, 0, 6); // known new moon
  const now      = new Date();
  const diff     = (now - known) / (1000 * 60 * 60 * 24);
  const cycle    = 29.53059;
  const dayInCycle = ((diff % cycle) + cycle) % cycle;
  return Math.floor((dayInCycle / cycle) * 8);
}

function setMoonPhase() {
  const idx   = getMoonPhaseIndex();
  const emoji = MOON_PHASES[idx];
  const name  = MOON_NAMES[idx];
  const desc  = MOON_DESCS[idx];

  const chip    = document.getElementById('moon-chip');
  const badge   = document.getElementById('sidebar-moon');
  const display = document.getElementById('moon-phase-display');
  const orb     = document.getElementById('moon-orb');
  const nameEl  = document.getElementById('moon-name');
  const descEl  = document.getElementById('moon-desc');

  if (chip)    chip.textContent  = emoji;
  if (badge)   badge.textContent = `${emoji} ${name}`;
  if (display) display.textContent = emoji;
  if (orb)     orb.textContent   = emoji;
  if (nameEl)  nameEl.textContent = name;
  if (descEl)  descEl.textContent = desc;
}

/* ── SIGN GRID (HOME EMPTY STATE) ───────────────────── */
function buildSignGrids() {
  const grid = document.getElementById('sign-grid-home');
  if (!grid || typeof signs === 'undefined') return;
  signs.forEach(s => {
    const tile = document.createElement('button');
    tile.className = 'sign-tile';
    tile.innerHTML = `<span class="symbol">${s.symbol}</span><span class="label">${s.name}</span>`;
    tile.onclick = () => selectSign(s.name);
    grid.appendChild(tile);
  });
}

/* ── SELECT SIGN ────────────────────────────────────── */
function selectSign(name) {
  if (typeof signs === 'undefined') return;
  const s = signs.find(x => x.name === name);
  if (!s) return;

  currentSign = name;
  localStorage.setItem('ced_sign', name);

  // Hide empty, show reading
  const empty   = document.getElementById('home-empty');
  const reading = document.getElementById('home-reading');
  if (empty)   empty.style.display   = 'none';
  if (reading) reading.style.display = 'block';

  // Populate reading card
  document.getElementById('r-symbol').textContent = s.symbol || '✦';
  document.getElementById('r-name').textContent   = s.name;
  document.getElementById('r-dates').textContent  = s.dates || '';

  // Energy bars — deterministic pseudo-random from sign name
  const seed = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = (offset) => 40 + ((seed * (offset + 7) * 13) % 51);
  animateBar('bar-love',     rand(1));
  animateBar('bar-career',   rand(2));
  animateBar('bar-wellness', rand(3));
  animateBar('bar-spirit',   rand(4));

  // Detail tags
  const tagsEl = document.getElementById('r-tags');
  if (tagsEl) {
    const el   = ELEMENTS[name] || 'fire';
    const tags = [
      s.element || el,
      s.planet   || 'Venus',
      s.quality  || 'Cardinal',
      ELEMENT_EMOJI[el] + ' ' + (el.charAt(0).toUpperCase() + el.slice(1))
    ];
    tagsEl.innerHTML = tags.map(t => `<span class="tag">${t}</span>`).join('');
  }

  // Description
  const descEl = document.getElementById('r-desc');
  if (descEl) {
    descEl.textContent = s.description || s.desc ||
      `The stars align for ${name} today. Trust the celestial currents guiding you forward — your intuition is your most powerful compass right now.`;
  }

  // Bookmark state
  updateBookmarkBtn();

  // Close video if open
  videoOpen = false;
  const vw = document.getElementById('video-wrap');
  if (vw) vw.style.display = 'none';

  // Sync profile sign selector
  const sel = document.getElementById('profile-sign-select');
  if (sel) sel.value = name;

  // Update profile card
  updateProfileCard(s);
}

function animateBar(id, pct) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.width = '0';
  setTimeout(() => { el.style.width = pct + '%'; }, 100);
}

/* ── CHANGE SIGN ─────────────────────────────────────── */
function changeSign() {
  const empty   = document.getElementById('home-empty');
  const reading = document.getElementById('home-reading');
  if (empty)   empty.style.display   = 'flex';
  if (reading) reading.style.display = 'none';
}

/* ── OPEN VIDEO ─────────────────────────────────────── */
function openVideo() {
  if (typeof signs === 'undefined' || !currentSign) return;
  const vw = document.getElementById('video-wrap');
  const vf = document.getElementById('video-frame');
  if (!vw || !vf) return;

  // Try to get ytId from the ytIds object (loaded by data.js)
  let videoId = '';
  if (typeof ytIds !== 'undefined' && ytIds[currentSign]) {
    videoId = ytIds[currentSign];
  }

  if (videoId) {
    vf.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" allowfullscreen allow="autoplay"></iframe>`;
    vw.style.display = 'block';
    videoOpen = true;
    vw.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    // Fall back to YouTube channel
    window.open('https://youtube.com/@CosmicEnergyDaily', '_blank');
  }
}

/* ── DISCOVER GRID ──────────────────────────────────── */
function buildDiscoverGrid() {
  const grid = document.getElementById('discover-grid');
  if (!grid || typeof signs === 'undefined') return;
  signs.forEach(s => {
    const el   = ELEMENTS[s.name] || 'fire';
    const card = document.createElement('div');
    card.className   = 'discover-card';
    card.dataset.element = el;
    card.innerHTML = `
      <span class="dc-symbol">${s.symbol}</span>
      <div class="dc-name">${s.name}</div>
      <div class="dc-dates">${s.dates || ''}</div>
      <span class="dc-element">${ELEMENT_EMOJI[el]} ${el}</span>
    `;
    card.onclick = () => {
      showScreen('home');
      selectSign(s.name);
    };
    grid.appendChild(card);
  });
}

function filterSigns(element, btn) {
  // Update pills
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');

  // Show/hide cards
  document.querySelectorAll('.discover-card').forEach(card => {
    card.style.display = (element === 'all' || card.dataset.element === element) ? '' : 'none';
  });
}

/* ── MOON CALENDAR ──────────────────────────────────── */
function buildMoonCalendar() {
  const cal  = document.getElementById('moon-calendar');
  if (!cal) return;
  const now  = new Date();
  const year = now.getFullYear();
  const mon  = now.getMonth();
  const days = new Date(year, mon + 1, 0).getDate();
  const today = now.getDate();

  for (let d = 1; d <= days; d++) {
    const date     = new Date(year, mon, d);
    const dayInCyc = (() => {
      const known = new Date(2000, 0, 6);
      const diff  = (date - known) / (1000 * 60 * 60 * 24);
      const cycle = 29.53059;
      return ((diff % cycle) + cycle) % cycle;
    })();
    const phaseIdx = Math.floor((dayInCyc / 29.53059) * 8);

    const div = document.createElement('div');
    div.className = 'moon-day' + (d === today ? ' today' : '');
    div.innerHTML = `<span class="md-num">${d}</span><span class="md-phase">${MOON_PHASES[phaseIdx]}</span>`;
    cal.appendChild(div);
  }
}

/* ── SAVED READINGS ─────────────────────────────────── */
function toggleBookmark() {
  if (!currentSign) return;
  const idx = savedReadings.findIndex(r => r.sign === currentSign);
  if (idx > -1) {
    savedReadings.splice(idx, 1);
  } else {
    savedReadings.push({ sign: currentSign, date: new Date().toLocaleDateString() });
  }
  localStorage.setItem('ced_saved', JSON.stringify(savedReadings));
  updateBookmarkBtn();
  buildSavedList();
}

function updateBookmarkBtn() {
  const btn = document.getElementById('bookmark-btn');
  if (!btn) return;
  const saved = savedReadings.some(r => r.sign === currentSign);
  btn.classList.toggle('saved', saved);
  btn.title = saved ? 'Remove from saved' : 'Save reading';
}

function buildSavedList() {
  const list = document.getElementById('saved-list');
  if (!list) return;
  if (savedReadings.length === 0) {
    list.innerHTML = `<div class="empty-state"><div style="font-size:2.5rem;margin-bottom:1rem">🔖</div><p>No saved readings yet.<br>Tap the bookmark on any reading to save it.</p></div>`;
    return;
  }
  list.innerHTML = savedReadings.map((r, i) => {
    const s = typeof signs !== 'undefined' ? signs.find(x => x.name === r.sign) : null;
    const sym = s ? s.symbol : '✦';
    return `
      <div class="saved-card glass" onclick="showScreen('home');selectSign('${r.sign}')">
        <div class="sc-symbol">${sym}</div>
        <div>
          <div class="sc-name">${r.sign}</div>
          <div class="sc-date">Saved ${r.date}</div>
        </div>
        <button class="sc-remove" onclick="event.stopPropagation();removeBookmark(${i})" title="Remove">✕</button>
      </div>
    `;
  }).join('');
}

function removeBookmark(idx) {
  savedReadings.splice(idx, 1);
  localStorage.setItem('ced_saved', JSON.stringify(savedReadings));
  updateBookmarkBtn();
  buildSavedList();
}

/* ── PROFILE ────────────────────────────────────────── */
function populateProfileSelect() {
  const sel = document.getElementById('profile-sign-select');
  if (!sel || typeof signs === 'undefined') return;
  signs.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.name;
    opt.textContent = `${s.symbol} ${s.name}`;
    sel.appendChild(opt);
  });
  if (currentSign) sel.value = currentSign;
}

function setProfileSign(name) {
  if (!name) return;
  selectSign(name);
}

function updateProfileCard(s) {
  const av    = document.getElementById('profile-avatar');
  const nm    = document.getElementById('profile-sign-name');
  const dates = document.getElementById('profile-sign-dates');
  if (av)    av.textContent    = s.symbol || '✦';
  if (nm)    nm.textContent    = s.name;
  if (dates) dates.textContent = s.dates || '';
}

/* ── SCREEN NAVIGATION ──────────────────────────────── */
function showScreen(name) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  // Show target
  const target = document.getElementById('screen-' + name);
  if (target) target.classList.add('active');

  // Update bottom nav
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.screen === name);
  });
  // Update sidebar nav
  document.querySelectorAll('.snav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.screen === name);
  });

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── NEWSLETTER ─────────────────────────────────────── */
function submitNewsletter() {
  const email = document.getElementById('nl-email')?.value.trim();
  const sign  = document.getElementById('nl-sign')?.value;
  const agree = document.getElementById('nl-agree')?.checked;
  const msg   = document.getElementById('nl-msg');

  if (!email || !sign || !agree) {
    if (msg) { msg.style.color = '#ff6b6b'; msg.textContent = 'Please fill all fields and agree to the privacy policy.'; }
    return;
  }

  // Reuse existing newsletter.js logic if available, otherwise fallback
  if (typeof handleNewsletterSubmit === 'function') {
    handleNewsletterSubmit(email, sign);
  } else {
    // Fallback: show success message (wire up your backend here)
    if (msg) { msg.style.color = 'var(--gold)'; msg.textContent = '✦ Welcome to the Cosmic Circle!'; }
  }
}
