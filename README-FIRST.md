# Yokal Sports data-driven system — first implementation

This package changes the North Jersey website from hardcoded weekly HTML to a market-data system.

## Permanent rules implemented

- Every approved publication has a Tuesday `publish_date`.
- Newest approved publications sort first.
- The paid hub shows only the latest 3 publications.
- Older publications remain on Boys, Girls and College archive pages.
- Every market page uses a two-column desktop layout.
- Sports are generated from the data, so fall/winter/spring sports can change without rebuilding templates.
- The free page only shows selected teaser rows from the newest publication.
- The same dataset feeds free previews and paid pages.

## Copy into the GitHub repository

Copy every file in this package into the root of `yokalsports-production`. Allow Windows to replace files when asked.

Then in GitHub Desktop:

1. Review Changes.
2. Commit: `Add data-driven market templates and 3-week archive rule`
3. Push origin.

## Google Apps Script

Replace the current publisher with `google-apps-script/Code.gs`.

1. In the Sheet: Extensions > Apps Script.
2. Paste the code.
3. Save.
4. Reload the spreadsheet.
5. Yokal Sports > Configure Publisher.
6. Paste the GitHub token into the private prompt. Do not paste it into source code or chat.
7. Yokal Sports > Publish Market.

The exporter reads `rankings_history`, groups all sports by Tuesday date, season, level and gender, and preserves every approved snapshot.

## Netlify

Connect Netlify to the GitHub repository. `netlify.toml` supplies:

- Build command: `npm run build`
- Publish directory: `dist`

## Important paid-data note

This package establishes the publishing, seasonal and archive system. Before paid launch, full paid JSON must be served behind server-side Memberstack verification. A public static JSON file is not a secure paywall by itself. Do not market the archive as securely gated until that server-side step is completed.
