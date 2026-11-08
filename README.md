# Hiroshi Koyama — Physics & Computation

Personal project index: **https://koyamahr.github.io/**

The homepage links to four independently maintained projects:

- [Theoretical Astrophysics, Step by Step](https://koyamahr.github.io/astronomy-step-by-step/)
- [An Atlas of Numerical Methods](https://koyamahr.github.io/numerical-methods-atlas/)
- [The Art of Thermal Instability](https://koyamahr.github.io/the-art-of-thermal-instability/)
- [Optical Atlas — 光学系のギャラリー](https://koyamahr.github.io/optics/) (Japanese)

It also links to the author's ORCID (0009-0003-7503-4715), Google Scholar, LinkedIn, and ResearchGate profiles. Japanese and English are available using the language buttons or `?lang=ja` / `?lang=en`. The selected language follows links to the bilingual projects.

The homepage also links to the bilingual [Computing Policy Archive](https://koyamahr.github.io/hpci-policy/), a personal record of two secondments to MEXT and related committees and work, with public primary sources. It includes 19 committees and working groups whose involvement the author confirmed, alongside detailed records for HPCI and the post-K basic-design review. An institutional context section explains the shared-facility law (Act No. 78 of 1994). Committee involvement is distinguished from committee membership; personal responsibilities and public-source summaries are labeled separately. Public meeting dates are not treated as the author's assignment dates.

## Books

The bilingual [Books page](https://koyamahr.github.io/books/) and the homepage's books section are generated from `books/catalog.json`. Published books have a verified Amazon ASIN and a link for sampling and purchase. Forthcoming books are explicitly labeled **To be published**, without an invented release date or purchase link. The book editions listed here are Japanese; English descriptions introduce those editions.

To add a book or update availability:

1. Update its public metadata, short descriptions, and `published` / `upcoming` status in `books/catalog.json`. Set `asin` when the Amazon product page is available.
2. Add the authorized cover image under `books/covers/`.
3. Run `node scripts/build-books.mjs` from the repository root. Commit the catalog, generated `books/index.html` and homepage section, and any changed cover together.
4. Check `/books/?lang=ja`, `/books/?lang=en`, and the homepage's language switch. Keep private production notes and submission records outside this repository.

The site hosts cover images and descriptions; reading samples are reached through the Amazon product page. Book manuscripts and EPUB files are not included.

## Homepage editing

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

The bilingual [Market Chart Atlas](https://koyamahr.github.io/market-chart-atlas/) lives in `market-chart-atlas/`, linked from a separate **Data & Markets** section on the homepage. It is a static, dependency-free technical indicator gallery: moving averages (SMA / EMA), MACD, Wilder RSI, and Bollinger Bands, compared on the same 12 curated historical cases across eight US stocks and two index ETFs.

- `cases.json`: bilingual observation, question, and retrospective commentary. The observation date is a US trading-session date.
- `data.json`: finite Yahoo Finance daily OHLC/volume snapshots, with source and actual retrieval date. Each case has 130 preceding sessions, the observation session, and 20 following sessions. Prices reflect splits (including subsequent splits), not dividends.
- `app.js`, `style.css`, `index.html`: interactive charts, category/search filters, shareable case anchors, language controls, and accessible per-session slider. Future data and retrospective commentary are hidden until revealed. Initial chart: 81 sessions through observation; reveal: 101 sessions. Indicator warm-up uses preceding data.
- `indicators.mjs`: trailing SMA, fixed prior-20-session high/low reference levels, and close-to-close percentage calculation. These are not trading strategy returns.

Preview from the repository root using the server above and visit `/market-chart-atlas/?lang=ja` or `?lang=en`. No build is needed for GitHub Pages. Refresh snapshots deliberately with `python3 scripts/fetch-market-data.py` (network required). Refreshing can change historical prices when the provider applies subsequent corporate actions. Run `node --test scripts/market-atlas.test.mjs` after dataset or indicator changes. The case selection is educational and retrospective, not a statistical sample or investment recommendation.

### Technical indicator gallery

The primary entry point is now the four-method gallery. Each tile previews the same case with default parameters. Selecting a method preserves the case, observation window, and reveal state. The chart offers per-method sliders, reset, matching-date price and indicator readouts, definitions, equations, interpretation, limitations, and primary-source references. Case selection is also available directly above the chart. Japanese and English are supported throughout.

- `methods.mjs` contains bilingual method descriptions and parameter bounds. MACD is the default. URLs preserve `indicator`, active method parameters, language, and the case hash; old case links still work.
- `indicators.mjs` implements SMA-seeded EMA, MACD and signal/histogram, Wilder RSI, and population-standard-deviation Bollinger Bands. Both flat RSI gains/losses are defined as 50. EMA and RSI use finite historical initialization, so values can differ from services using longer histories.
- `chart.mjs` renders price overlays and separate aligned oscillator panes (fixed 0–100 for RSI). All displayed calculations and scales use only data visible up to the observation date unless the outcome is revealed. SMA, EMA, MACD, RSI, and band calculations use trailing data only.

Example: `/market-chart-atlas/?lang=ja&indicator=macd&fast=12&slow=26&signal=9#nvda-2023`. Indicator definitions link to Fidelity’s official indicator guide and John Bollinger’s band rules. Refreshing the historical dataset does not change the indicator definitions.

## Committee relationships, timeline and budgets

The bilingual [`hpci-policy/history.html`](https://koyamahr.github.io/hpci-policy/history.html) is generated from `hpci-policy/history.json`. It connects institutional context to the 19 confirmed committees and includes six relationship views, an evidence panel, a filterable timeline, a 2006–2025 budget-overview chart, individual award examples, and political advocacy context. A relationship is typed as `parent`, `report` or `sequence`: do not turn a reporting relationship or chronological progression into a formal hierarchy. In particular, the post-2019 Information Committee is directly under the science council, and the exploratory projects sub-working group is under the priority-projects WG. Institutional context does not add personal involvement claims.

Run both generators after editing:

```sh
node scripts/build-policy.mjs
node scripts/build-history.mjs
```

`history-render.mjs` provides the shared server/browser bilingual rendering; `history.js` supplies interactions; `budget-chart.mjs` renders the financial chart. Commit the generated HTML and `hpci-policy/budget-data.csv` with the data and scripts. The deployed site has no package/CDN dependencies. The builder checks source IDs, diagram endpoints, all committee relationships, annual coverage, monetary values and review-sheet arithmetic.

### Financial scope and provenance

The chart is a **major direct-program budget overview**, not an exhaustive total of all supercomputing-related MEXT spending. Operating block grants are excluded at the author’s explicit request. Earth Simulator and SINET are separate programs outside this series. All 20 fiscal years have an overview observation; FY2006–2013 are source-rounded totals, FY2014 is labeled “budget” by the source, and FY2019 currently uses a proposal. Reconciliation into one consistent accounting boundary is incomplete. Requests, supplementary budgets and expenditure are explicitly partial. Missing years are not zero.

Preserve each record's `kind`, `sourceAmountType`, `basis`, `precision`, `year`, `series`, `sourceIds` and bilingual notes. `millionYen` is nominal JPY million; the chart converts to JPY 100 million. Keep the budget-overview and administrative-review accounting scopes distinct, and retain carry-in, carry-out and reserve adjustments in `reviewComparison`. Never add award or subcontract records to a program total, multi-year commitments to annual appropriations, or compute-resource allocations to monetary allocations. Grant decisions are not final settlements or actual institutional expenditure. The individual award list is a verified starting sample, not all selected projects.

### Recipient, purpose and researcher employment

The `spending` dataset in `history.json` contains independently bounded cases. It separates recipient classification from expenditure purpose: a computer purchase is also a company payment, so those categories cannot be summed as one partition. The FY2022 RIKEN operations example uses source blocks A and I (14,424 and 12,530 JPY million). The Tokyo University fluid-prediction example uses the largest recipient in block G (84 JPY million, including 18 million personnel), not every institution or the entire project. Ratios are computed from the published rounded amounts. Remaining expenses are not inferred to be salaries.

`spending-render.mjs` renders those cases with their own denominators. PI salary-charging records are separately labeled and do not establish new employment. Aggregate equipment and newly hired researcher shares stay `null` until matching source accounts exist. The builder validates case totals and source references. The author requested operating block grants to stay outside the analysis.

The history builder hashes the shared modules and styles, emits versioned asset URLs and a matching import map, so an already-open browser receives updated renderers along with new data.

### Official links

The history page’s `#links` section groups nine official destinations for community recommendations, HPCI access and selection results, operating/support organizations, and policy/institutional documents. Edit bilingual titles, descriptions, URLs and check dates in `history.json` → `relatedLinks`; the builder validates these records. This directory is separate from the evidence index and does not add personal involvement claims.

## Japan–U.S. supercomputer comparison

The HPCI archive itself includes an interactive comparison at [`/hpci-policy/?lang=ja#japan-us`](https://koyamahr.github.io/hpci-policy/?lang=ja#japan-us), without changes to the personal homepage. Tabs cover a 13-system timeline, published costs, a two-system comparison, decision-making and 30 primary sources. The archive’s existing Japanese/English switch also controls this section.

- `hpci-policy/comparison.json` preserves system-specific milestone definitions, cost scopes, historical source dates, evidence links and English descriptions. `cost` is in the explicitly declared `costUnit` (JPY 100 million or USD million), not base currency.
- `comparison-render.mjs` shares static and interactive rendering and validates source references and data. `comparison.js` handles scoped controls, keyboard-operable tabs and language changes. `comparison.css` uses a separate `sc-` namespace.
- Run `node scripts/build-policy.mjs` to regenerate the archive HTML and `comparison-data.csv`. The CSV exports **base currency** in `amount_native_currency`, preserves missing totals, and distinguishes future targets. Versioned module/style URLs prevent stale combinations. The deployed page has no framework or CDN dependency; chart content remains available without JavaScript.

Costs and intervals are intentionally heterogeneous historical observations, not a reconciled lifecycle-cost or development-efficiency ranking. The Summit/Sierra joint amount is not divided between systems. FugakuNEXT annual funding is not treated as a full project total. The comparison does not add personal involvement claims to the archive.
