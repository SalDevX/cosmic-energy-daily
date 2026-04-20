# MEMORY — Cosmic Energy Daily

Living architecture notes. The goal: pick this up 6 months from now and not break anything.

---

## Project Identity

- **What it is:** Mobile-first PWA daily horoscope app for all 12 zodiac signs. Users select their sign during onboarding, then get a daily reading with energy bars, YouTube short video, moon calendar, discover feed, bookmarking, and newsletter signup.
- **Brand:** CosmicEnergyDaily — dark cosmic aesthetic, gold accents (#C9A84C), mystical tone
- **Live URL:** https://cosmic-energy-daily.com
- **GitHub repo:** https://github.com/SalDevX/cosmic-energy-daily
- **Deployment:** GitHub Pages, auto-deploys ~30s after push to `master`
- **Stack:** Pure vanilla HTML/CSS/JS — no framework, no bundler, no npm, no build step

---

## Architecture Decisions & Why

- **No framework** — deliberate. Fast, zero dependency rot, trivial to debug and hand off.
- **No bundler, no modules** — all JS declares globals, loaded via `<script src>` in order. Adding a bundler would require a build step and break the GitHub Pages deploy.
- **data.js must load first** — declares `signs[]` and `ytIds{}` as globals. Every other JS file depends on them. Load order is enforced by tag order in index.html.
- **main.css loads first** — defines `:root` variables used by app.css. Wrong order = nothing renders.
- **app.css is the full redesign** — the old layout.css / wheel.css / video.css / newsletter.css still exist in the repo but are **not loaded** in index.html. They are legacy files from the old zodiac-wheel site.
- **Single-page app shell** — index.html contains all 5 screens + onboarding inside one document. Screen switching is pure CSS (display:none / display:block) + JS class toggling. No routing library needed.
- **Google Apps Script for newsletter** — no server, no cost, deploys instantly. Tradeoff: no-cors means response is opaque; success is assumed if no network error.
- **GitHub Pages for hosting** — free, push-to-deploy, zero ops. Constraint: static files only, no server-side logic.

---

## Critical Load Order — NEVER change this

### CSS (in `<head>`, in this order):
1. `assets/css/main.css` — `:root` CSS variables. Everything else depends on these.
2. `assets/css/app.css` — full app redesign: onboarding, all 5 screens, nav, cards, glass-morphism.

### JS (before `</body>`, in this order):
3. `assets/js/data.js` — declares `signs[]` and `ytIds{}`. Must be first.
4. `assets/js/stars.js` — independent. Draws gold star field on `canvas#stars`.
5. `assets/js/app-ui.js` — entire app logic. Reads `signs[]`, `ytIds{}`, DOM elements.

### Legacy files (exist but NOT loaded in index.html):
- `assets/css/layout.css`, `wheel.css`, `video.css`, `newsletter.css` — old site
- `assets/js/wheel.js`, `sol.js`, `newsletter.js` — old site

---

## App Screens & Navigation

Five screens controlled by `showScreen(name)` in app-ui.js:

| Screen | data-screen | Nav icon | Nav label |
|---|---|---|---|
| Today's Reading | `home` | ☽ | Today |
| Browse all signs | `discover` | ✦ | Discover |
| Moon phase calendar | `moon` | 🌗 | Moon |
| Bookmarked readings | `saved` | ♡ | Saved |
| Profile + newsletter | `profile` | ◯ | You |

- **Mobile:** bottom nav bar (82px height), collapsible via ✦ handle
- **Desktop (768px+):** left sidebar (240px), bottom nav hidden

---

## Onboarding Flow

1. Page loads → check `localStorage.getItem('ced_sign')`
2. If null → show `#onboarding-screen`, hide `#app-shell`
3. User taps a sign tile → `selectSign(idx)` in index.html inline override
4. Override: hides onboarding, shows app-shell, calls original `selectSign`
5. Sign stored as string index in `localStorage('ced_sign')`
6. All future loads skip onboarding and go directly to home reading

---

## Sign Data Structure (`signs[]` in data.js)

Each of the 12 sign objects:
```js
{
  name: "Aries",           // display name
  symbol: "♈",            // Unicode glyph (also .s shorthand)
  s: "♈",                 // shorthand alias
  dates: "Mar 21–Apr 19", // date range string
  element: "Fire",         // Fire | Earth | Air | Water (also .el shorthand)
  el: "Fire",             // shorthand alias
  elC: "#C84B4B",         // element color hex
  ruler: "Mars",           // ruling planet
  trait: "Bold & Pioneering",
  desc: "~100 char description",
  reading: "~200 char daily horoscope text"
}
```

Elements and their colors:
- Fire (#C84B4B): Aries, Leo, Sagittarius
- Earth (#7A9A4A): Taurus, Virgo, Capricorn
- Air (#5A9FD4): Gemini, Libra, Aquarius
- Water (#4A7FBF): Cancer, Scorpio, Pisces

---

## Daily Update Flow (pipeline integration)

1. `~/dev/reel-engine/bin/upload-to-youtube --all --date YYYY-MM-DD` uploads 12 videos
2. Script updates `assets/js/data.js` — replaces the `ytIds` object via regex
3. Script runs `git add assets/js/data.js && git commit && git push`
4. GitHub Actions deploys in ~30s
5. **Only `data.js` ever changes in automation** — all other files are static
6. Service worker is network-first for data.js so fresh IDs always load

### ytIds format — the regex depends on this exact shape:
```js
const ytIds={Aries:'ID',Taurus:'ID',...,Pisces:'ID'};
```
- Single line, no spaces around `=` or `:`, values in single quotes
- Pipeline regex: `r'const ytIds=\{[^}]*\}'` — breaks if format changes

---

## Energy Bars

`energyBars(signIdx)` in app-ui.js generates deterministic scores:
- Categories: love, career, health, spirit
- Values: seeded by `(signIdx + today's date number)` modulo math
- Range: always between 45–90% — never extreme
- Bars animate to width on `showReading()` via 1s cubic-bezier transition

---

## Moon Phase Logic

`moonPhase(date)` in app-ui.js:
- Anchor: known full moon 2026-04-13
- Cycle: 29.53 days
- 8 named phases with emojis
- Returns `{n: phaseName, i: emoji}`
- Used in: moon calendar grid, hero card, tab icon (#tab-moon-icon), sidebar badge

---

## Bottom Nav — Collapsible Handle

Added in latest update. Controlled by `toggleNav()` in app-ui.js:
- `#bottom-nav` gets class `collapsed` when minimized
- Collapsed height: 28px (only ✦ handle visible)
- Expanded height: 82px (full nav with icons + labels)
- Transition: `height 0.3s ease` (defined in app.css)
- State persisted in `localStorage('ced_nav_collapsed')` as "0" or "1"
- State restored in `DOMContentLoaded`

---

## localStorage Keys

| Key | Type | Purpose |
|---|---|---|
| `ced_sign` | String "0"–"11" | Selected sign index |
| `ced_saved` | JSON array | Indices of bookmarked sign readings |
| `ced_nav_collapsed` | "0" or "1" | Bottom nav collapse state |

---

## Newsletter System

Two implementations exist — be aware of which is active:

### Active: `app-ui.js` → `submitNewsletter()`
- Currently shows success message locally without making a network request
- Wire up to SCRIPT_URL in app-ui.js when ready to activate

### Legacy: `assets/js/newsletter.js`
- Has the actual `fetch()` implementation with SCRIPT_URL
- NOT loaded by current index.html (legacy file)
- Move fetch logic into app-ui.js to complete integration

### Google Apps Script Backend
- Endpoint stored in `newsletter.js` line 1 (SCRIPT_URL constant) and `.env` (local, gitignored)
- POST body: `{email, sign, agreed}`
- Mode: `no-cors` — response is opaque, success inferred from no thrown error
- Sheet: https://docs.google.com/spreadsheets/d/19RMB_k5uA2RpwL0xXZf4gfnqRuZAd1Q-j5nnoGZNIxg
- Columns: Timestamp | Email | Sign | Agreed to Policy
- Full operating guide: `GOOGLE_SCRIPT_GUIDE.md`

---

## PWA / Service Worker

- `sw.js` registered silently in index.html
- Cache name: `cosmic-v1`
- **Fetch strategy:**
  - `data.js` → network-first (daily YouTube IDs must be fresh)
  - Everything else → cache-first (fonts, CSS, JS, HTML served from cache)
- **Manifest:** `assets/site.webmanifest` — display:standalone, theme #04060F
- PWA installable on iOS (apple-mobile-web-app-capable) and Android

---

## CSS Variables

Defined in `assets/css/main.css` `:root`. Touch names → everything breaks. Changing values is safe.

| Variable | Value | Used for |
|---|---|---|
| `--gold` | `#C9A84C` | Primary accent — active nav, headings, borders |
| `--gold-dim` | `#8A6F2E` | Secondary gold for borders on links |
| `--gold-glow` | `rgba(201,168,76,0.12)` | Hover glow on nodes and active sidebar items |
| `--deep` | `#04060F` | Page background |
| `--deep2` | `#080C1A` | Video frame background |
| `--surface` | `rgba(255,255,255,0.03)` | Card/input backgrounds (main.css); 0.06 in app.css override |
| `--border` | `rgba(201,168,76,0.18)` | All borders |
| `--text` | `#E8E0CC` | Primary body text |
| `--text-dim` | `rgba(232,224,204,0.5)` | Secondary text — labels, dates, placeholders |

app.css adds additional variables:
| Variable | Value | Used for |
|---|---|---|
| `--nav-h` | `82px` | Bottom nav height; used for padding-bottom |
| `--side-w` | `240px` | Desktop sidebar width |
| `--r` | `20px` | Card border radius |
| `--r-sm` | `12px` | Small element border radius |
| `--bg-grad` | linear-gradient... | Body background (richer than main.css) |
| `--gDim` | `rgba(201,168,76,0.35)` | Reading card left border |
| `--gGlow` | `rgba(201,168,76,0.15)` | Active sidebar item background |
| `--dim` | `rgba(232,224,204,0.5)` | Inactive text/icons (same value as --text-dim) |

---

## Fonts

- **Cinzel** — all headings, nav labels, buttons, filter pills, sign names, date pill
- **Cormorant Garamond** — body text, reading text, descriptions, form inputs
- Both loaded from Google Fonts CDN in `<head>` of index.html and privacy.html
- Never introduce other fonts. Brand consistency depends on exactly these two.

---

## Known Behaviors & Gotchas

- **GitHub Actions may push commits** (pipeline auto-push) → local can fall behind → always `git pull --rebase` before pushing manually
- **`.env` is gitignored** — never let it slip into a commit
- **YouTube autoplay** may be silently blocked on mobile without a prior user gesture. Browser behavior, not a bug.
- **Stars canvas redraws on every resize** — randomized each time. Intentional.
- **Energy bars use `setTimeout(()=>{...},50)` or direct DOM manipulation** — wait for `showReading()` to complete before animating bar widths, otherwise bars stay at 0
- **no-cors success assumption** — if fetch completes without throwing, user sees success. Check the Google Sheet to verify actual writes.
- **Google Apps Script auth scope** — if emails stop arriving: revoke app access at myaccount.google.com/permissions, re-run `testEmail()`, allow ALL scopes.
- **Legacy files still in repo** — wheel.js, sol.js, newsletter.js, layout.css, wheel.css, video.css, newsletter.css are NOT loaded by index.html. Do not delete without checking privacy.html and any other entry points.
- **Two CSS variable sets** — main.css and app.css both define `:root` variables. app.css loads after and overrides `--surface`. Be aware of which value is active.
