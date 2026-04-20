# MEMORY_MAP — Cosmic Energy Daily

Every file: what it does, what it needs, what breaks if you touch it wrong.

**Note:** This documents the V2 app redesign. The old zodiac-wheel architecture (wheel.js, sol.js, etc.) still has files in the repo but is not the active site.

---

## Entry Points

### `index.html`
- **Purpose:** Entire single-page app. Contains onboarding screen + 5 app screens (home, discover, moon, saved, profile) + desktop sidebar + mobile bottom nav.
- **Depends on:** main.css, app.css (in that order in `<head>`); data.js, stars.js, app-ui.js (in that order before `</body>`); Google Fonts CDN; `sw.js` (service worker, registered inline)
- **Depended on by:** Nothing — it's the root
- **Screens (data-screen attribute):** home, discover, moon, saved, profile
- **Key IDs:** onboarding-screen, app-shell, bottom-nav, nav-handle, screen-home, screen-discover, screen-moon, screen-saved, screen-profile, sign-grid-home, sign-grid-onboarding, home-empty, home-reading, date-pill, tab-moon-icon, and ~30 more reading/form element IDs (see app-ui.js for full list)
- ⚠️ **DANGER:** Do not reorder `<link>` or `<script>` tags. Do not rename IDs that app-ui.js queries by ID.

### `privacy.html`
- **Purpose:** Privacy policy page. Linked from the newsletter checkbox in profile screen.
- **Depends on:** `assets/css/main.css`, `assets/css/layout.css`, Google Fonts, `assets/js/stars.js`
- **Depended on by:** index.html profile section newsletter form
- Has inline `<style>` for `.privacy-body`, `.back-link` — intentional, not worth a separate file

### `sw.js`
- **Purpose:** Service worker for PWA offline support and caching.
- **Depends on:** Nothing (runs in service worker context)
- **Depended on by:** index.html (registers it silently)
- **Cache name:** `cosmic-v1` — bump version string here when you need to invalidate all caches
- **Strategy:** network-first for `data.js` (daily YouTube IDs must be fresh); cache-first for everything else
- ⚠️ **DANGER:** If you add new static assets (CSS, JS, images), add them to the `PRECACHE` list inside `sw.js` so they work offline.

---

## CSS Files (`assets/css/`)

### `main.css` ← LOAD FIRST
- **Purpose:** CSS reset (`*,*::before,*::after` box-sizing) + `:root` CSS variables + `body` base styles + `canvas#stars` positioning
- **Depends on:** Nothing
- **Depended on by:** Every other CSS file via `var(--...)`. Also app.css overrides some values. Also privacy.html inline styles.
- ⚠️ **DANGER:** Renaming any CSS variable (`--gold`, `--border`, etc.) breaks every file that references it. Changing values is safe.

### `app.css` ← LOAD SECOND (after main.css)
- **Purpose:** The entire V2 app redesign — all components, screens, and layout
- **Depends on:** `main.css` variables (and defines additional variables of its own)
- **Depended on by:** index.html (all screens, nav, cards)
- **Overrides:** `--surface` from main.css (0.06 instead of 0.03)
- **Additional variables it defines:** `--nav-h`, `--side-w`, `--r`, `--r-sm`, `--bg-grad`, `--gDim`, `--gGlow`, `--dim`
- **Key sections (in order):**
  1. Onboarding screen
  2. Layout (`.app-main`, `.screen`, responsive breakpoint @768px, sidebar)
  3. Bottom nav + collapsible handle
  4. Sidebar (desktop)
  5. App header
  6. Sign grid (onboarding + home empty state)
  7. Home empty state
  8. Sign hero (large glyph, name, dates, badges)
  9. Reading card (glass, reading text, energy bars, gold CTA, video, stat row, actions)
  10. Filter pills (discover)
  11. Discover feed (feed cards with element tags)
  12. Moon calendar (hero card, month nav, day grid, phase legend)
  13. Saved list (saved cards)
  14. Profile (avatar, settings rows, toggle, newsletter card)
  15. Newsletter card (form, success state)
  16. Footer
- ⚠️ **DANGER:** `.app-main` `padding-bottom` uses `calc(var(--nav-h) + 80px)` — must be larger than nav height so content is never hidden. If `--nav-h` changes, verify this still works.

### Legacy CSS (NOT loaded in index.html — old zodiac-wheel site):

### `layout.css`
- **Purpose:** Old site header, footer, `.wrap`, `.logo-sol`, `h1`, `.tagline`, `.date-bar`
- **Loaded by:** privacy.html only

### `wheel.css`
- **Purpose:** Old zodiac wheel, sign nodes, `.sign-symbol`, `.sign-label`
- **Loaded by:** NOTHING currently

### `video.css`
- **Purpose:** Old video section, detail cards, YouTube link
- **Loaded by:** NOTHING currently

### `newsletter.css`
- **Purpose:** Old newsletter section form layout
- **Loaded by:** NOTHING currently

---

## JS Files (`assets/js/`)

### `data.js` ← LOAD FIRST
- **Purpose:** Declares two globals: `signs[]` (12 sign objects) and `ytIds{}` (YouTube video IDs keyed by sign name)
- **Depends on:** Nothing
- **Depended on by:** `app-ui.js` reads both globals. Pipeline regex rewrites `ytIds` daily.
- **Sign object fields:** `name`, `symbol`/`s`, `dates`, `element`/`el`, `elC` (color hex), `ruler`, `trait`, `desc`, `reading`
- **ytIds format:** `const ytIds={Aries:'ID',Taurus:'ID',...,Pisces:'ID'};` — must stay exactly one line
- ⚠️ **DANGER:** Must load before app-ui.js. ytIds must be one line — pipeline regex `r'const ytIds=\{[^}]*\}'` breaks on multiline. Single quotes around values required.
- **Updated daily** by `~/dev/reel-engine/bin/upload-to-youtube` via regex + git push

### `stars.js` ← LOAD SECOND
- **Purpose:** `drawStars()` — draws 220 random gold dots on `canvas#stars` (fixed fullscreen background)
- **Depends on:** `canvas#stars` exists in DOM; `window.innerWidth`, `window.innerHeight`
- **Depended on by:** index.html and privacy.html both load this
- **Safe to change:** star count (220), size range (0–1.1px), opacity range (0.1–0.6)

### `app-ui.js` ← LOAD THIRD
- **Purpose:** The entire app UI logic — all screen rendering, state management, event handlers
- **Depends on:** `signs[]` and `ytIds{}` from data.js; all DOM IDs in index.html; localStorage
- **Depended on by:** Nothing (calls itself via DOMContentLoaded)
- **Global state variables:**
  - `currentSignIdx` — selected sign index (null or 0–11)
  - `savedIdxs[]` — bookmarked sign indices (persisted to localStorage)
  - `discoverFilter` — "All" or element name string
  - `moonMonth` / `moonYear` — month/year shown in calendar
- **localStorage keys it reads/writes:** `ced_sign`, `ced_saved`, `ced_nav_collapsed`
- **Key functions:**

| Function | What it does |
|---|---|
| `showScreen(name)` | Switches active screen, updates nav button active states |
| `selectSign(idx)` | Stores sign, calls showReading, updates profile |
| `showReading(idx)` | Populates all home reading elements (hero, text, bars, stat row) |
| `changeSign()` | Toggles home-empty / home-reading visibility |
| `openVideo()` | Embeds YouTube iframe or opens channel, scrolls into view |
| `toggleNav()` | Collapses/expands bottom nav, saves state |
| `toggleBookmark()` | Toggles bookmark for currentSignIdx |
| `toggleSave(idx)` | Adds/removes from savedIdxs, persists, re-renders saved list |
| `renderDiscoverList()` | Builds discover feed cards (filtered by discoverFilter) |
| `filterDiscover(el,btn)` | Updates filter, re-renders discover list |
| `openSignReading(idx)` | Navigate to home screen with a specific sign |
| `renderMoonCalendar()` | Builds moon calendar grid for moonMonth/moonYear |
| `moonPhase(date)` | Returns {n: phaseName, i: emoji} for a given date |
| `prevMonth()` / `nextMonth()` | Calendar navigation |
| `energyBars(signIdx)` | Returns {love,career,health,spirit} percentages (45–90) |
| `renderSavedList()` | Renders saved cards or empty state |
| `updateBookmarkBtn()` | Syncs heart icon state with savedIdxs |
| `populateProfileSelect()` | Fills sign dropdown in profile settings |
| `setProfileSign(name)` | Changes sign from profile dropdown |
| `updateProfileCard(idx)` | Updates profile avatar, name, dates |
| `submitNewsletter()` | Validates + submits newsletter form (currently shows success locally) |
| `buildSignGrids()` | Creates 12 sign tiles in home-empty and onboarding grids |
| `setDatePill()` | Formats today's date into #date-pill |
| `setMoonChips()` | Updates all moon phase display elements |

- ⚠️ **DANGER:** Do not remove or rename any DOM IDs that app-ui.js queries. A missing element will silently do nothing or throw `Cannot set property of null`.
- ⚠️ **DANGER:** `submitNewsletter()` currently does NOT make the actual fetch request. The actual fetch logic lives in the legacy `newsletter.js`. To activate, copy the fetch block from newsletter.js into app-ui.js's submitNewsletter().

### Legacy JS (NOT loaded in index.html — old zodiac-wheel site):

### `wheel.js`
- **Purpose:** Old zodiac wheel rendering, sign node positioning, video section population
- **Loaded by:** NOTHING currently

### `sol.js`
- **Purpose:** Rotates `#sol-svg` continuously via requestAnimationFrame
- **Loaded by:** NOTHING currently (there is no #sol-svg in new index.html)

### `newsletter.js`
- **Purpose:** Old newsletter form handler with actual fetch() to Google Apps Script
- **Loaded by:** NOTHING currently
- **Contains:** SCRIPT_URL constant (line 1) with live Apps Script endpoint URL
- **Note:** This file has the working fetch implementation that app-ui.js `submitNewsletter()` currently lacks

---

## SVG Files (`assets/svg/`)

### `seed-of-life.svg`
- **Purpose:** Rotating logo used in onboarding screen and home empty state
- **Loaded by:** Inlined or `<img src>` in index.html
- **Design:** 7-circle Seed of Life geometry, blue-purple-red gradients, circular clip path, gold center dot
- Safe to edit visual attributes (stroke colors, gradients) — geometry must stay 200×200 viewBox

---

## Documentation Files

### `MEMORY.md`
- Architecture decisions, load order, screen flows, data structures, known gotchas, CSS variable reference, font rules

### `MEMORY_MAP.md`
- This file. Per-file dependency map and danger zones.

### `GOOGLE_SCRIPT_GUIDE.md`
- How to operate the Google Apps Script + Google Sheet subscriber system. Includes deploy steps, troubleshooting, both critical URLs.

### `README.md`
- Project overview, directory structure, how to update ytIds manually, pipeline usage, deploy info.

---

## Config & Deployment Files

### `.github/workflows/pages.yml`
- **Purpose:** Auto-deploys site to GitHub Pages on every push to master
- **Trigger:** push to master OR manual workflow_dispatch
- **Steps:** upload repo root → deploy-pages v4
- **Time to live:** ~30 seconds after push

### `assets/site.webmanifest`
- **Purpose:** PWA manifest — makes site installable as an app
- **Key values:** name "Cosmic Energy Daily", short_name "CosmicEnergy", display "standalone", theme_color "#04060F"
- **Icon:** `assets/favicon-192x192.png`

### `CNAME`
- **Purpose:** Tells GitHub Pages to serve site at `cosmic-energy-daily.com`
- Contains: `cosmic-energy-daily.com` (one line, no trailing newline)

### `.env`
- **Purpose:** Local-only environment reference
- **Contains:** `GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/...`
- **Gitignored** — never commit this file

### `.gitignore`
- Excludes: `.env`, `.env.*`

---

## External Dependencies

| Dependency | Where used | What breaks if unavailable |
|---|---|---|
| Google Fonts (Cinzel + Cormorant Garamond) | `<head>` of index.html and privacy.html | Falls back to Georgia serif — readable but off-brand |
| YouTube embed (`youtube.com/embed/{id}`) | `openVideo()` in app-ui.js | Video doesn't embed; falls back to channel link |
| Google Apps Script endpoint | `newsletter.js` SCRIPT_URL / app-ui.js submitNewsletter | Form shows success but no data saved to Sheet |
| GitHub Pages | Hosting via `.github/workflows/pages.yml` | Site goes down |
| GitHub Actions | pages.yml workflow | Pushes to master don't auto-deploy |

---

## Danger Zones — Changes That Break Things

| What to not touch | Why |
|---|---|
| `data.js` load order (must be first) | app-ui.js crashes on undefined `signs` or `ytIds` |
| `main.css` `:root` variable names | Every CSS file referencing them breaks |
| `ytIds` object format in data.js | Pipeline regex `r'const ytIds=\{[^}]*\}'` fails on multiline or different quotes |
| Any ID queried by app-ui.js (e.g. `#home-reading`, `#date-pill`) | Silent failure or null reference error |
| `--nav-h` CSS variable without updating `padding-bottom` | Content hidden behind nav |
| `cache name 'cosmic-v1'` in sw.js without bumping | Old cached assets served after updates |
| `newsletter.js` SCRIPT_URL | Must match live Apps Script deployment; wrong URL = silent failure |

---

## Safe to Edit Without Risk

- Sign `reading`, `desc`, `trait`, `dates`, `ruler` strings in `data.js` — display only, no logic depends on values
- Star count/size/opacity in `stars.js` (`i<220`, `r*1.1`, `a*.5+.1`)
- CSS variable **values** in `main.css` `:root` (as long as names stay the same)
- Privacy policy body text in `privacy.html`
- Footer text in index.html and privacy.html
- Newsletter success/error message strings in app-ui.js `submitNewsletter()`
- Moon phase names/emojis in `moonPhase()` function in app-ui.js
- `energyBars()` seeding formula — values stay in 45–90 range regardless
- `--nav-h` value (but must update `padding-bottom` in `.app-main` proportionally)

---

## Element ID Quick-Reference (app-ui.js ↔ index.html)

| ID | Screen | Purpose |
|---|---|---|
| `onboarding-screen` | Onboarding | Shown when no sign selected |
| `app-shell` | All | Main app container |
| `bottom-nav` | Global (mobile) | Collapsible bottom navigation |
| `nav-handle` | Global (mobile) | ✦ tap target to collapse/expand nav |
| `tab-moon-icon` | Global | Moon phase emoji in nav |
| `date-pill` | Home | Formatted today's date |
| `sign-grid-home` | Home | 12-tile sign grid (empty state) |
| `sign-grid-onboarding` | Onboarding | 12-tile sign grid |
| `home-empty` | Home | Empty state (no sign selected) |
| `home-reading` | Home | Reading state (sign selected) |
| `r-hero-symbol` | Home | Large sign glyph |
| `r-name` | Home | Sign name |
| `r-dates` | Home | Sign date range |
| `r-badges` | Home | Element + trait badges |
| `r-desc` | Home | Reading text |
| `bar-love`, `bar-career`, `bar-health`, `bar-spirit` | Home | Energy bar fill elements |
| `bar-pct-love`, etc. | Home | Energy bar percentage labels |
| `stat-ruler`, `stat-element`, `stat-nature` | Home | Stat row values |
| `bookmark-btn` | Home | Heart bookmarks button |
| `video-wrap` | Home | Container shown when video open |
| `video-frame` | Home | YouTube iframe target |
| `discover-list` | Discover | Feed card container |
| `moon-chip` | Home | Moon emoji chip in header |
| `moon-phase-display` | Moon | Phase name text |
| `moon-orb` | Moon | Large phase emoji in hero |
| `moon-name` | Moon | Phase name in hero card |
| `moon-desc` | Moon | Phase description in hero card |
| `moon-month-label` | Moon | "April 2026" month label |
| `moon-calendar` | Moon | Calendar grid container |
| `sidebar-moon` | Sidebar | Moon badge in desktop sidebar |
| `saved-list` | Saved | Saved cards container |
| `profile-avatar` | Profile | Sign emoji avatar |
| `profile-sign-name` | Profile | Sign name in profile card |
| `profile-sign-dates` | Profile | Sign dates in profile card |
| `profile-sign-select` | Profile | Sign change dropdown |
| `nl-email` | Profile | Newsletter email input |
| `nl-sign` | Profile | Newsletter sign select |
| `nl-agree` | Profile | Newsletter privacy checkbox |
| `nl-msg` | Profile | Newsletter feedback message |
| `nl-form-wrap` | Profile | Newsletter form container |
| `nl-success` | Profile | Newsletter success message |
