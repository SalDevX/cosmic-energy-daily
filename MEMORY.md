# MEMORY — Cosmic Energy Daily

Living architecture notes. The goal: pick this up 6 months from now and not break anything.

---

## Project Identity

- **What it is:** Daily horoscope site for all 12 zodiac signs. Visitors select their sign from an animated zodiac wheel, watch today's YouTube short, see sign details.
- **Brand:** CosmicEnergyDaily — dark cosmic aesthetic, gold accents, mystical tone
- **Live URL:** https://cosmic-energy-daily.com
- **GitHub repo:** https://github.com/SalDevX/cosmic-energy-daily
- **Deployment:** GitHub Pages, auto-deploys ~30s after push to `master`
- **Stack:** Pure vanilla HTML/CSS/JS — no framework, no bundler, no npm, no build step

---

## Architecture Decisions & Why

- **No framework** — deliberate. Keeps the site fast, zero dependencies to rot, trivial to hand off or debug.
- **No bundler, no modules** — all JS files declare globals and are loaded via `<script src>` in a specific order. The browser is the runtime. Adding a bundler would require a build step and break the GitHub Pages deploy.
- **data.js must load first** — it declares `signs[]` and `ytIds{}` as globals. Every other JS file depends on them. Loading order is enforced by tag order in index.html.
- **CSS split into logical files** — main.css defines `:root` variables that all other CSS files reference via `var(--...)`. It must load first or nothing renders correctly.
- **Google Apps Script for the newsletter backend** — no server, no cost, deploys instantly. Tradeoff: can't read the HTTP response (no-cors), so success is assumed if no network error.
- **GitHub Pages for hosting** — free, deploys on git push, zero ops. Constraint: static files only, no server-side logic.

---

## Critical Load Order — NEVER change this

### CSS (in `<head>`, in this order):
1. `assets/css/main.css` — `:root` CSS variables. Everything else depends on these.
2. `assets/css/layout.css` — wrap, header, footer, date-bar
3. `assets/css/wheel.css` — zodiac wheel, sign nodes
4. `assets/css/video.css` — video section, embed, detail cards
5. `assets/css/newsletter.css` — newsletter form section

### JS (before `</body>`, in this order):
6. `assets/js/data.js` — declares `signs[]` and `ytIds{}`. Must be first.
7. `assets/js/wheel.js` — reads `signs[]`. Calls `buildWheel()`, `setDate()`, `scaleWheel()` immediately.
8. `assets/js/stars.js` — independent. Calls `drawStars()` immediately.
9. `assets/js/sol.js` — reads `#sol-svg` from DOM. Starts `requestAnimationFrame` loop.
10. `assets/js/newsletter.js` — waits for `DOMContentLoaded`, then binds form submit.

---

## Zodiac Wheel — How It Works

- The `.zodiac-wheel` div is always **480×480px** internally, regardless of screen size
- Sign nodes are positioned absolutely at **r=205px** from center (cx=240, cy=240)
- Each node's `left`/`top` are set in pixels by `buildWheel()` in wheel.js
- **Mobile scaling:** `scaleWheel()` reads `.wheel-outer` width, computes `scale = min(1, available/480)`, applies `transform: scale(scale)` to the wheel div, and sets `.wheel-outer` height to `480 * scale`
- **Never** try to reposition individual nodes for mobile — `scaleWheel()` handles everything uniformly
- The Seed of Life SVG (`#sol-svg`) rotates at 0.025°/frame via `requestAnimationFrame` in sol.js. Rotation persists through sign selections — that's intentional.

---

## Daily Update Flow (pipeline integration)

1. `~/dev/reel-engine/bin/upload-to-youtube --all --date YYYY-MM-DD` uploads 12 videos to YouTube
2. After each successful upload, the script updates `assets/js/data.js` — replaces the `ytIds` object via regex
3. Script runs `git add assets/js/data.js && git commit && git push` from the web repo
4. GitHub Actions deploys in ~30s
5. **Only `data.js` ever changes in automation** — all other files are static

### ytIds format — the regex depends on this exact shape:
```js
const ytIds={Aries:'ID',Taurus:'ID',...,Pisces:'ID'};
```
- Single line, no spaces around `=` or `:`, values in single quotes
- Pipeline regex: `r'const ytIds=\{[^}]*\}'` — breaks if format changes

---

## Newsletter System

- Form at bottom of index.html POSTs JSON `{email, sign, agreed}` to Apps Script endpoint
- Apps Script: appends row to Google Sheet + sends welcome email from Gmail
- **Sheet:** https://docs.google.com/spreadsheets/d/19RMB_k5uA2RpwL0xXZf4gfnqRuZAd1Q-j5nnoGZNIxg
- **Apps Script endpoint** stored in two places:
  - `assets/js/newsletter.js` line 1: `const SCRIPT_URL = '...'`
  - `.env` (local only, gitignored — never commit this)
- `mode: 'no-cors'` is required — Google Apps Script rejects credentialed cross-origin requests. Consequence: the response body is opaque, success is inferred from no thrown error.
- If you redeploy the Apps Script and get a new URL, update `newsletter.js` line 1 and push.
- Full operating guide: `GOOGLE_SCRIPT_GUIDE.md`

---

## Known Behaviors & Gotchas

- **GitHub Actions may push commits** (e.g. pipeline auto-push) → local can fall behind → always `git pull --rebase` before pushing manually
- **`.env` is gitignored** — it was accidentally committed once (then immediately removed). Never let it slip in again.
- **YouTube autoplay** in the iframe may be silently blocked on some mobile browsers without a prior user gesture. This is browser behavior, not a bug.
- **Stars canvas redraws on every resize** — `drawStars()` fires on `window resize`. Stars are randomized each time. Intentional.
- **Sol SVG rotation never resets** — `_solDeg` accumulates forever. Doesn't matter; it's decorative.
- **Google Apps Script auth scope** — if the script runs but emails don't arrive, it's almost always a missing OAuth scope. Fix: revoke app access at myaccount.google.com/permissions, re-run `testEmail()`, allow ALL scopes.
- **no-cors success assumption** — if the network request completes without throwing, the user sees the success message. We have no way to confirm the sheet write actually happened. Check the sheet to verify.

---

## CSS Variables (defined in `assets/css/main.css` `:root`)

Touch variable names → everything breaks. Changing values is safe as long as names stay the same.

| Variable | Value | Used for |
|---|---|---|
| `--gold` | `#C9A84C` | Primary accent — headings, active nodes, buttons |
| `--gold-dim` | `#8A6F2E` | Secondary gold — borders on links, checkbox links |
| `--gold-glow` | `rgba(201,168,76,0.12)` | Hover glow on nodes and buttons |
| `--deep` | `#04060F` | Page background |
| `--deep2` | `#080C1A` | Video frame background |
| `--surface` | `rgba(255,255,255,0.03)` | Card and input backgrounds |
| `--border` | `rgba(201,168,76,0.18)` | All borders — dividers, node borders, input borders |
| `--text` | `#E8E0CC` | Primary body text |
| `--text-dim` | `rgba(232,224,204,0.5)` | Secondary text — dates, labels, placeholders |

---

## Fonts

- **Cinzel** — all headings, labels, buttons, date bar, sign labels on wheel
- **Cormorant Garamond** — body text, taglines, descriptions, form inputs
- Both loaded from Google Fonts in `<head>` of index.html and privacy.html
- Never introduce other fonts. Brand consistency depends on exactly these two.
