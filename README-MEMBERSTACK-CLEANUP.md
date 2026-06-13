# Memberstack CTA Cleanup

Changed only Memberstack CTA behavior/copy.

Files changed:
- `src/north-jersey/index.njk`
- `src/_includes/list-card.njk`

What changed:
- All `Become A Yokal` CTAs use consistent capitalization.
- All free-page `Become A Yokal` / full-list CTAs include `data-ms-modal="signup"`.
- All free-page monthly CTAs include `data-ms-price:add="prc_yokal-nj-monthly-x3470asv"`.
- Annual price button keeps `data-ms-price:add="prc_yokal-nj-annual-374v08rm"`.
- Signup CTAs no longer point to `#become`, so they should not scroll the page before Memberstack opens.
- Memberstack script remains in `src/_includes/layouts/base.njk` with app ID `app_cmpzrc8r1000f0tvo9wcd3h0r`.

Not changed:
- No page redesign.
- No color/layout/CSS changes.
- No homepage changes.
- No paid hub/Boys/Girls/College content changes.
- No Memberstack billing/Stripe setup changes.

Build verified: `npm run build` wrote 11 pages successfully.
