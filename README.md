# Hiroshi Koyama — Writing, Learning, Research & Books

Personal project index: **https://koyamarium.github.io/**

The homepage is a compact public portfolio: a short author introduction and one photograph, four direct entry points (**Articles & essays**, **Learning & research**, **Books**, and **Photographs**), compact research-profile links and the public contact email. Articles lead to the public note profile, Koyamax (`https://note.com/hr_koyama`); the English entry explicitly labels those articles as Japanese. The language switch translates portfolio introductions, not the external note articles. In English the entry order is learning/research, books, photographs, then Japanese articles; Japanese retains articles first. Displayed numbers and keyboard order follow the selected language. Learning and research lead to `/research/`, which lists eight published resources and web works, including the projects below:

- [Theoretical Astrophysics, Step by Step](https://koyamarium.github.io/astronomy-step-by-step/)
- [An Atlas of Numerical Methods](https://koyamarium.github.io/numerical-methods-atlas/)
- [The Art of Thermal Instability](https://koyamarium.github.io/the-art-of-thermal-instability/)
- [Optical Atlas — 光学系のギャラリー](https://koyamarium.github.io/optics/) (Japanese)

It also links to the author's researchmap (`https://researchmap.jp/read0200749`), ORCID (0009-0003-7503-4715), Google Scholar, LinkedIn, and ResearchGate profiles. Japanese and English are available using the language buttons or `?lang=ja` / `?lang=en`. The selected language follows links to the bilingual projects.

The works directory also links to the bilingual [Computing Policy Archive](https://koyamarium.github.io/hpci-policy/), a personal record of two secondments to MEXT and related committees and work, with public primary sources. It includes 19 committees and working groups whose involvement the author confirmed, alongside detailed records for HPCI and the post-K basic-design review. An institutional context section explains the shared-facility law (Act No. 78 of 1994). Committee involvement is distinguished from committee membership; personal responsibilities and public-source summaries are labeled separately. Public meeting dates are not treated as the author's assignment dates.

## Academic Roots

[Academic Roots](https://koyamarium.github.io/academic-roots/) is a Japanese-language academic-lineage tool, linked from the homepage in Japanese and English. The example connects Hiroshi Koyama to Hideki Yukawa through four typed relationships. It includes Koyama's doctoral thesis title, degree date, the University of Tokyo degree record, and the National Diet Library catalog record. Koyama's supervision remains author-reported; degree evidence and examination committees do not automatically establish supervision.

Visitors enter themselves and a supervisor, copy a research request into their own web-enabled LLM, then paste the returned JSON to create, review and export their lineage. The site makes no LLM or search API requests and requires no API keys or account. An input notice explains that personal inputs and AI responses are not sent to the site operator, that created lineages stay in local browser storage, and that pasting into an AI or sharing exports discloses the included information to the chosen recipient. Inputs have no form names and submit controls are enabled only after local handlers attach, preventing native form fallback from including personal inputs in URLs.

- `academic-roots/data.json` contains the five-person example, evidence, typed relationships and thesis metadata. This example was manually researched and is not represented as a result of the new request template.
- `academic-roots/research-model.mjs` generates requests, validates 2–13-person paths and source URLs, and encodes shared results. AI-supplied verification flags are discarded. Creator review is labeled as such and is not passed to a recipient as verified status.
- `academic-roots/llm-builder.js` handles local storage (`academic-roots.research.v1`), import, source review, manual entry, text/image copying, PNG/JSON export, and fragment-only share links. Shared data includes names, affiliations and evidence. Long links fall back to JSON export.
- `academic-roots/app.js` renders the example and sources. Cached asset and data versions must stay synchronized when updated.

Run `node --test scripts/research-model.test.mjs`. The local working copy was browser-tested for prompt copy, import, review, text/image copy, PNG export, shared-result restoration, local restoration/deletion and narrow layouts. External LLM research accuracy and response compatibility across models remain unmeasured. No shared researcher database is implemented.

## Books

The bilingual [Books page](https://koyamarium.github.io/books/) is generated from `books/catalog.json`. The compact homepage links to it without repeating the individual covers and descriptions. Published books have a verified Amazon ASIN and a link for sampling and purchase. Forthcoming books are explicitly labeled **To be published**, without an invented release date or purchase link. The book editions listed here are Japanese; English descriptions introduce those editions.

To add a book or update availability:

1. Update its public metadata, short descriptions, and `published` / `upcoming` status in `books/catalog.json`. Set `asin` when the Amazon product page is available.
2. Add the authorized cover image under `books/covers/`.
3. Run `node scripts/build-books.mjs` from the repository root. Commit the catalog, generated `books/index.html`, and any changed cover together.
4. Check `/books/?lang=ja` and `/books/?lang=en`. Keep private production notes and submission records outside this repository.

The site hosts cover images and descriptions; reading samples are reached through the Amazon product page. Book manuscripts and EPUB files are not included.

## Notebook viewing release

The reviewed notebook collection is published at `/notebooks/`: 41 notebooks and 1,170 selected pages, with pixel-level redactions retained. Only the existing public viewing assets and licensing notices are included. Private originals, OCR audit records and the original repository history remain outside this repository. `notebooks/public-manifest.json` records the viewing file hashes. Publish new notebook material only after the same allowlist, redaction and metadata checks.

## Homepage editing

The final `#contact` section displays the public address `koyamarium@gmail.com` and links directly to `mailto:koyamarium@gmail.com`. Japanese and English copy explain that the visitor’s email application opens. Keep the default Japanese HTML and the translations in `home.js` synchronized.

Edit `index.html`, `research/index.html`, `home.css`, and `home.js`. Both pages share the paper-and-ink style and Japanese/English text in the `copy` object. Keep default Japanese HTML in sync so the page and all destinations work without JavaScript. Add new learning resources and public web works to `/research/`; keep the homepage's four category links compact. Unreleased apps stay private.

`#portfolio`, `#profiles`, and `#contact` stay on the homepage. Existing `#writing`, `#books`, and `#photographs` anchors target their entry cards. Old `#projects`, `#college-notes`, and `#academic-roots` links forward to the appropriate work in `/research/` when JavaScript is enabled, with a visible category-card fallback otherwise. The books generator now writes only `/books/index.html` and never reinserts detailed teasers into the homepage. The site uses system fonts, local assets and no framework or external runtime dependencies.

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

The bilingual [Market Chart Atlas](https://koyamarium.github.io/market-chart-atlas/) lives in `market-chart-atlas/`, linked from the **Archives & web works** group in `/research/`. It is a static, dependency-free technical indicator gallery: moving averages (SMA / EMA), MACD, Wilder RSI, and Bollinger Bands, compared on the same 12 curated historical cases across eight US stocks and two index ETFs.

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

The bilingual [`hpci-policy/history.html`](https://koyamarium.github.io/hpci-policy/history.html) is generated from `hpci-policy/history.json`. It connects institutional context to the 19 confirmed committees and includes six relationship views, an evidence panel, a filterable timeline, a 2006–2025 budget-overview chart, individual award examples, and political advocacy context. A relationship is typed as `parent`, `report` or `sequence`: do not turn a reporting relationship or chronological progression into a formal hierarchy. In particular, the post-2019 Information Committee is directly under the science council, and the exploratory projects sub-working group is under the priority-projects WG. Institutional context does not add personal involvement claims.

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

The HPCI archive itself includes an interactive comparison at [`/hpci-policy/?lang=ja#japan-us`](https://koyamarium.github.io/hpci-policy/?lang=ja#japan-us), without changes to the personal homepage. Tabs cover a 13-system timeline, published costs, a two-system comparison, decision-making and 30 primary sources. The archive’s existing Japanese/English switch also controls this section.

- `hpci-policy/comparison.json` preserves system-specific milestone definitions, cost scopes, historical source dates, evidence links and English descriptions. `cost` is in the explicitly declared `costUnit` (JPY 100 million or USD million), not base currency.
- `comparison-render.mjs` shares static and interactive rendering and validates source references and data. `comparison.js` handles scoped controls, keyboard-operable tabs and language changes. `comparison.css` uses a separate `sc-` namespace.
- Run `node scripts/build-policy.mjs` to regenerate the archive HTML and `comparison-data.csv`. The CSV exports **base currency** in `amount_native_currency`, preserves missing totals, and distinguishes future targets. Versioned module/style URLs prevent stale combinations. The deployed page has no framework or CDN dependency; chart content remains available without JavaScript.

Costs and intervals are intentionally heterogeneous historical observations, not a reconciled lifecycle-cost or development-efficiency ranking. The Summit/Sierra joint amount is not divided between systems. FugakuNEXT annual funding is not treated as a full project total. The comparison does not add personal involvement claims to the archive.

## Photographs

`photographs/` is Hiroshi Koyama’s bilingual photography portfolio, led by eight selected photographs across nature, light, architecture and an observatory. The compact homepage presents the author, one selected photograph and four direct entry points: articles, learning/research, books and photographs. The 2007–2008 American travel collection is separate at `photographs/america/`, linked from Series.

Default Japanese HTML includes every photograph, caption and expandable exposure record without JavaScript. `site.js` adds language switching and a keyboard-accessible image viewer (Escape to close, arrow keys to navigate). Images keep their original proportions, except for bounded presentation crops.

Public assets are resized, EXIF-free JPEG viewing copies. Public `catalog.json` files contain only whitelisted descriptive and camera fields; coordinates, HDD paths and complete EXIF stay outside this repository. Restrained tonal adjustments are CSS display filters. AI-generated editing attempts were rejected and are not used. Original photographs stay untouched; people-containing reserve photographs are excluded.

Preview `/photographs/?lang=ja`, `?lang=en`, and `/photographs/america/`. No build step or external dependency is needed.


## Licensing / ライセンス

Original implementation code: **MIT** ([LICENSE](LICENSE)). Text, figures, photographs, book material and data are **excluded** and follow separate terms; see [LICENSING.md](LICENSING.md) and [third-party notices](THIRD_PARTY_NOTICES.md). Public guide: https://koyamarium.github.io/rights/ .

## Research Compass / サイトを案内する

`/guide/` は、利用者の目的から公開資料を探し、質問・抜粋・出典URLを利用者自身のLLMへ手動で渡す日英の案内ページです。質問はブラウザ内だけで処理し、LLM・埋め込みAPI・APIキー・質問保存・運営者の推論従量課金はありません。対象は数値計算アトラスとThermal Instabilityの2サイトに限定し、その公開本文の抜粋と各サイトの概要を収録しています。更新方法、収録範囲、検証の限界は [guide/README.md](guide/README.md) を参照。索引と資料パックは公開後に手動更新します。
