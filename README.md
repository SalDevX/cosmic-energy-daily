# Cosmic Energy Daily

Daily horoscope website for all 12 zodiac signs. Deployed via GitHub Pages.

**Live URL:** https://saldevx.github.io/cosmic-energy-daily

## Structure

```
cosmic-energy-daily-web/
├── index.html              lean shell — meta, body, script tags
├── assets/
│   ├── css/
│   │   ├── main.css        CSS variables, reset, global styles
│   │   ├── layout.css      header, footer, wrap, date-bar
│   │   ├── wheel.css       zodiac wheel, sign nodes, scaling
│   │   └── video.css       video section, embed, detail cards
│   ├── js/
│   │   ├── data.js         signs array + ytIds — updated daily by pipeline
│   │   ├── wheel.js        buildWheel(), scaleWheel(), selectSign()
│   │   ├── stars.js        drawStars() canvas animation
│   │   └── sol.js          Seed of Life rotation animation
│   └── svg/
│       └── seed-of-life.svg  Seed of Life SVG (reference copy)
└── .github/workflows/
    └── pages.yml           GitHub Actions deploy from master branch root
```

## Updating ytIds manually

Open `assets/js/data.js` and update the `ytIds` object with today's YouTube video IDs:

```js
const ytIds={Aries:'VIDEO_ID',Taurus:'VIDEO_ID',...};
```

Commit and push to master — GitHub Actions deploys automatically.

## Pipeline auto-update

The reel-engine upload script (`~/dev/reel-engine/bin/upload-to-youtube`) updates `assets/js/data.js` automatically after each successful upload, then commits and pushes to master.

Run for a single sign:
```bash
python bin/upload-to-youtube --sign aries --date 2026-04-19
```

Run for all signs:
```bash
python bin/upload-to-youtube --all --date 2026-04-19
```

## Deploy

Push to `master` — the GitHub Actions workflow in `.github/workflows/pages.yml` deploys the repo root to GitHub Pages with no build step.
