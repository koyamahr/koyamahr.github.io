# Hiroshi Koyama — Physics & Computation

Personal project index: **https://koyamahr.github.io/**

The homepage links to four independently maintained projects:

- [Theoretical Astrophysics, Step by Step](https://koyamahr.github.io/astronomy-step-by-step/)
- [An Atlas of Numerical Methods](https://koyamahr.github.io/numerical-methods-atlas/)
- [The Art of Thermal Instability](https://koyamahr.github.io/the-art-of-thermal-instability/)
- [Optical Atlas — 光学系のギャラリー](https://koyamahr.github.io/optics/) (Japanese)

It also links to the author's ORCID (0009-0003-7503-4715), Google Scholar, LinkedIn, and ResearchGate profiles. Japanese and English are available using the language buttons or `?lang=ja` / `?lang=en`. The selected language follows links to the bilingual projects.

The homepage also links to the bilingual [Computing Policy Archive](https://koyamahr.github.io/hpci-policy/), a personal record of two secondments to MEXT and related committees and work, with public primary sources. It includes 19 committees and working groups whose involvement the author confirmed, alongside detailed records for HPCI and the post-K basic-design review. An institutional context section explains the shared-facility law (Act No. 78 of 1994). Committee involvement is distinguished from committee membership; personal responsibilities and public-source summaries are labeled separately. Public meeting dates are not treated as the author's assignment dates.

## Edit and preview

Edit `index.html`. Text in both languages is defined in its `copy` object; Japanese content remains readable without JavaScript. The page uses local SVG artwork and system fonts, with no build step or external dependencies.

```sh
python3 -m http.server 4180 --bind 127.0.0.1
```

GitHub Pages serves the `main` branch at `/` from this user-site repository. Project sites retain their existing URLs and deployment settings.

## Add to the Computing Policy Archive

1. Edit `hpci-policy/content.json`. Add Japanese and English text to a record and list its public sources in `sources`. Connect records to `first` or `second` only when the relevant secondment is known; use an empty `periods` array when that relationship is awaiting confirmation.
2. Mark a source `read` only after its text has been reviewed. Use `indexed-only` with a note when only an index or reference has been verified. Update the source's `checked` date and the archive's `updated` date after research.
3. Run `node scripts/build-policy.mjs`. Commit the generated `hpci-policy/index.html` together with the data. The generator checks source and period references and escapes content; Japanese text is readable without JavaScript. The deployed site needs no runtime dependencies or build service.
4. Preview `/hpci-policy/?lang=ja` and `/hpci-policy/?lang=en`. Check search, period filters, source links, and both narrow and wide layouts after content changes.

The page-specific interface translations are in `hpci-policy/site.js` and its layout is in `hpci-policy/style.css`. The supplied career document is used only as background for the requested career facts; the document itself and personal contact details are not included in this repository. The second secondment's start month follows the supplied CV; its end month and both roles were confirmed by the author.

The confirmed committee directory is in `hpci-policy/committees.json`. Each entry contains a bilingual summary and public milestone, its original MEXT or NDL WARP link, optional additional evidence, and any parent committee or detailed-record association. `retrievedUrl` records the archived document frame read during research. `verification: "read"` means the landing-page content was read, rather than every document linked from it. Entries can be filtered by topic and searched independently of the detailed responsibilities. Only assign a `periods` value when the personal assignment period is known.

The author excluded eight entries from the initial MEXT list: 071, 059, 035, 034, 027, 019, 017, and 016. These are not included in the personal directory. The source list's contradictory FY2015 end-date label is not copied as a personal assignment date. The legal context is in `content.json` under `framework`; historical assignments should use the version of the law and policy applicable at the time.

## Market Chart Atlas

The bilingual [Market Chart Atlas](https://koyamahr.github.io/market-chart-atlas/) lives in `market-chart-atlas/`, linked from a separate **Data & Markets** section on the homepage. It is a static, dependency-free app with 12 curated historical cases across eight US stocks and two index ETFs.

- `cases.json`: bilingual observation, question, and retrospective commentary. The observation date is a US trading-session date.
- `data.json`: finite Yahoo Finance daily OHLC/volume snapshots, with source and actual retrieval date. Each case has 130 preceding sessions, the observation session, and 20 following sessions. Prices reflect splits (including subsequent splits), not dividends.
- `app.js`, `style.css`, `index.html`: interactive charts, category/search filters, shareable case anchors, language controls, and accessible per-session slider. Future data and retrospective commentary are hidden until revealed. Initial chart: 81 sessions through observation; reveal: 101 sessions. Indicator warm-up uses preceding data.
- `indicators.mjs`: trailing SMA, fixed prior-20-session high/low reference levels, and close-to-close percentage calculation. These are not trading strategy returns.

Preview from the repository root using the server above and visit `/market-chart-atlas/?lang=ja` or `?lang=en`. No build is needed for GitHub Pages. Refresh snapshots deliberately with `python3 scripts/fetch-market-data.py` (network required). Refreshing can change historical prices when the provider applies subsequent corporate actions. Run `node --test scripts/market-atlas.test.mjs` after dataset or indicator changes. The case selection is educational and retrospective, not a statistical sample or investment recommendation.
