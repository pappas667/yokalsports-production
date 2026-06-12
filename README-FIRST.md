# Yokal Sports — Clean Production Project

This folder is the single source of truth for the Netlify/GitHub deployment.

## Authoritative files
- `src/` — all homepage, North Jersey, South Jersey, paid hub, archive, layout and CSS templates
- `_data/north-jersey.json` — current North Jersey data exported from Google Sheets
- `google-apps-script/Code.gs` — Google Sheet publishing script
- `eleventy.config.js` — Eleventy build configuration
- `netlify.toml` — Netlify build, headers and canonical-domain redirect

## Build
- Build command: `npm run build`
- Publish directory: `dist`

## Important
- Do not restore the old root `index.html`.
- Do not restore the old `memberstack-fix/` folder.
- Keep the existing hidden `.git` folder in your local GitHub project; this clean package intentionally does not include one.
- Official domain: `https://yokalsports.com`
- `www.yokalsports.com` redirects to the official domain.
