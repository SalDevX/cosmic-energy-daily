# MEMORY_MAP — Cosmic Energy Daily

Every file: what it does, what it needs, what breaks if you touch it wrong.

---

## Entry Points

### `index.html`
- **Purpose:** The entire site. Zodiac wheel, video section, newsletter signup.
- **Depends on:** All 5 CSS files (in order), all 5 JS files (in order), Google Fonts CDN
- **Depended on by:** Nothing — it's the root
- **Load order is hardcoded** — do not reorder `<link>` or `<script>` tags without understanding the dependency chain (see MEMORY.md)
- **Sections:** header → date-bar → wheel-section → video-section → newsletter-section → footer

### `privacy.html`
- **Purpose:** Privacy policy page. Linked from the newsletter checkbox.
- **Depends on:** `assets/css/main.css`, `assets/css/layout.css`, Google Fonts, `assets/js/stars.js`
- **Depended on by:** index.html newsletter form (`href="/privacy.html"`)
- Has inline `<style>` for page-specific layout (`.privacy-body`, `.back-link`) — intentional, not worth a separate CSS file

---

## CSS Files (`assets/css/`)

### `main.css`
- **Purpose:** CSS reset + `:root` variables + `body` + `canvas#stars`
- **Depends on:** Nothing
- **Depended on by:** Every other CSS file via `var(--...)`. Also privacy.html inline styles.
- ⚠️ **DANGER:** Renaming any CSS variable breaks every file that references it. Changing values is safe.

### `layout.css`
- **Purpose:** `.wrap`, `header`, `.logo-sol`, `h1`, `.tagline`, `.date-bar`, `footer`
- **Depends on:** `main.css` (for `var(--border)`, `var(--gold)`, `var(--text-dim)`, `var(--text)`)
- **Depended on by:** index.html, privacy.html

### `wheel.css`
- **Purpose:** `.wheel-section`, `.wheel-outer`, `.zodiac-wheel`, `.sign-node`, `.sign-symbol`, `.sign-label`
- **Depends on:** `main.css` variables
- **Depended on by:** index.html wheel section; `wheel.js` adds `.active` class expecting these styles

### `video.css`
- **Purpose:** `.video-section`, `.video-header`, `.video-embed-wrap`, `.video-frame`, `.video-placeholder`, `.sign-details`, `.detail-row`, `.detail-card`, `.sign-description`, `.yt-link`; responsive breakpoint at 700px
- **Depends on:** `main.css` variables
- **Depended on by:** index.html video section; `wheel.js` injects `.detail-card` and `.video-placeholder` HTML expecting these classes

### `newsletter.css`
- **Purpose:** `.newsletter-section`, `.nl-heading`, `.nl-sub`, `.nl-fields`, `#nl-btn`, `.nl-agree-label`, `.nl-msg`; responsive breakpoint at 600px
- **Depends on:** `main.css` variables
- **Depended on by:** index.html newsletter section

---

## JS Files (`assets/js/`)

### `data.js`
- **Purpose:** Declares two globals: `signs[]` (12 sign objects) and `ytIds{}` (YouTube video IDs keyed by sign name)
- **Depends on:** Nothing
- **Depended on by:** `wheel.js` reads both globals. Pipeline regex rewrites `ytIds` daily.
- ⚠️ **DANGER:** Must load first. `ytIds` must stay on a single line in `{Key:'val',...}` format — the pipeline regex `r'const ytIds=\{[^}]*\}'` depends on it.
- **Updated daily** by `~/dev/reel-engine/bin/upload-to-youtube` via regex + git push

### `wheel.js`
- **Purpose:** `buildWheel()` — creates 12 `.sign-node` divs and appends to `#wheel`; `selectSign()` — updates video section on sign click; `scaleWheel()` — handles mobile scaling; `setDate()` — writes today's date to `#date-bar`
- **Depends on:** `signs[]` and `ytIds{}` from `data.js`; DOM elements `#wheel`, `#date-bar`, `#video-header`, `#vs-symbol`, `#vs-name`, `#vs-dates`, `#detail-row`, `#sign-desc`, `#sign-details`, `#video-frame`, `#video-section`; CSS classes from `wheel.css` and `video.css`
- **Depended on by:** Nothing (calls itself at load time)
- ⚠️ **DANGER:** `scaleWheel()` is the entire mobile layout strategy. Don't try to CSS-override `.zodiac-wheel` width/height for mobile — it will fight with the JS transform.

### `stars.js`
- **Purpose:** `drawStars()` — draws 220 random gold dots on `canvas#stars` (fixed, full-screen background)
- **Depends on:** `canvas#stars` in DOM; `window.innerWidth`, `window.innerHeight`
- **Depended on by:** index.html and privacy.html both load this
- Safe to change star count (currently 220) or size range (`r=0..1.1`) or opacity range (`a=0.1..0.6`)

### `sol.js`
- **Purpose:** Rotates `#sol-svg` continuously via `requestAnimationFrame` at 0.025°/frame
- **Depends on:** `#sol-svg` element in DOM (must exist when this script runs)
- **Depended on by:** Nothing
- Safe to change rotation speed (`_solDeg+=0.025`)

### `newsletter.js`
- **Purpose:** Binds submit handler to `#newsletter-form`. POSTs `{email, sign, agreed}` JSON to `SCRIPT_URL`. Shows success/error message in `#nl-msg`.
- **Depends on:** `SCRIPT_URL` constant (line 1); DOM elements `#newsletter-form`, `#nl-email`, `#nl-sign`, `#nl-agree`, `#nl-btn`, `#nl-msg`; Google Apps Script endpoint being live and authorized
- **Depended on by:** Nothing
- Uses `DOMContentLoaded` — safe to load before or after DOM is ready
- ⚠️ **DANGER:** `SCRIPT_URL` must match the current Apps Script deployment URL. If you redeploy Apps Script, update line 1 here and push.

---

## Documentation Files

### `MEMORY.md`
- Architecture decisions, load order, known gotchas, CSS variable reference, font rules

### `MEMORY_MAP.md`
- This file. Per-file dependency map and danger zones.

### `GOOGLE_SCRIPT_GUIDE.md`
- How to operate the Google Apps Script + Google Sheet subscriber system. Includes deploy steps, troubleshooting, and both critical URLs.

### `README.md`
- Project overview, directory structure, how to update ytIds manually, pipeline usage, deploy info.

---

## External Dependencies

| Dependency | Where used | What breaks if unavailable |
|---|---|---|
| Google Fonts (Cinzel + Cormorant Garamond) | `<head>` of index.html and privacy.html | Falls back to Georgia serif — readable but off-brand |
| YouTube embed (`youtube.com/embed/`) | `selectSign()` in wheel.js | Videos don't load; placeholder shown instead |
| Google Apps Script endpoint | newsletter.js `SCRIPT_URL` | Form submits show error message; no data saved |
| GitHub Pages | Deployment via `.github/workflows/pages.yml` | Site goes down |
| GitHub Actions | `.github/workflows/pages.yml` | Pushes to master don't auto-deploy |

---

## Danger Zones — Changes That Break Things

- **`data.js` load order** — if any other JS loads before `data.js`, it crashes on undefined `signs` or `ytIds`
- **`main.css` `:root` variable names** — renaming any `--variable` breaks every file referencing it
- **`ytIds` object format in `data.js`** — must be `const ytIds={Key:'val',...};` on one line; pipeline regex fails on multiline or different quoting
- **`scaleWheel()` in `wheel.js`** — any CSS that sets explicit `height` on `.wheel-outer` or overrides `.zodiac-wheel` transform will fight with the JS
- **`newsletter.js` `SCRIPT_URL`** — must match live Apps Script deployment exactly; wrong URL = silent failure (no error shown to user)
- **`#sol-svg` ID in index.html** — sol.js grabs this by ID at load time; renaming it crashes sol.js

---

## Safe to Edit Without Risk

- Sign `desc` strings in `data.js` `signs[]` — shown in `.sign-description`, no logic depends on them
- Star count/size/opacity in `stars.js` (`i<220`, `r=Math.random()*1.1`, `a=Math.random()*.5+.1`)
- Sol rotation speed in `sol.js` (`_solDeg+=0.025`)
- CSS variable **values** in `main.css` `:root` — as long as variable **names** stay the same
- Privacy policy body text in `privacy.html`
- Footer text in index.html and privacy.html
- Newsletter success/error message strings in `newsletter.js`
- Sign `trait`, `element`, `ruler`, `dates` in `data.js` — displayed only, no logic depends on values
