# Research Compass / サイトを案内する

Buildless, bilingual, client-side retrieval and manual handoff to the visitor's own LLM. Published at https://koyamarium.github.io/guide/ .

## Data and scope

- `catalog.json`: curated bilingual descriptions and scope limits for the two public research sites. Update these when a work's scope changes.
- `index.json`: a versioned snapshot of extracted public text, source URLs and per-page SHA-256 hashes. No private paths or credentials.
- `packs/*.md`: downloadable, source-linked knowledge packs derived from that same snapshot. Not a mirror of all content.
- `search.mjs`: deterministic lexical retrieval with related-term expansion and explicit topic boosts; not semantic embeddings, model inference or scientific ranking. Translation-equivalent pages are collapsed; the best matching excerpt per page is shown. Results are capped at 14, selections at 6 and the handoff at 16,000 characters.
- `app.mjs`: renders text with DOM textContent, not imported HTML. Questions are held in memory, never saved, logged, placed in a URL or sent by application code. Only the public index is fetched. The user decides whether to paste the prompt into another service. Host access logs still apply to ordinary page/asset requests.
- No model, API key field, inference endpoint, embedding API, server process, analytics, third-party JS or runtime dependencies.

Extracted text: Numerical Methods Atlas reading chapters and static Thermal Instability pages, plus two project overviews. Astrophysics lessons and other portfolio works are excluded. No local manuscripts, handwritten originals, unpublished apps, EXIF/GPS or external paper bodies are read. Figure content and running experiments are not represented; mathematical/table extraction can be incomplete. Japanese translations may be drafts. Source pages remain authoritative for implementation/verification scope. Quantum chemistry/DFT is future work, not a dedicated implemented solver.

## Refresh after public content changes

From this repository root, with Python 3.10+:

```
python3 scripts/build-guide.py
node --test scripts/guide.test.mjs
```

The collector fetches only allowlisted published GitHub Pages sitemaps and their public HTML, with six workers and bounded page counts/body sizes. It fails rather than silently dropping unreadable sources. It never scans local project folders. Page count increases beyond the guard require review before adjusting it. HTML title fallback and whitespace-separated legacy heading tags are normalized for extraction.

To regenerate metadata/Markdown packs using the existing text snapshot without re-fetching pages:

```
python3 scripts/build-guide.py --reuse-snapshot
```

This retains the original capture timestamp. The version suffix hashes the resulting records. Refresh is manual, not automatic: commit regenerated index and packs together. Review diffs and source counts, check representative citations/queries, preview Japanese/English and mobile, then publish. A future CI refresh should keep this review step and avoid numerical solver runs.

The root `llms.txt` and `guide/index.md` provide machine-readable pointers. They do not guarantee discovery, ingestion or complete use by any particular LLM. Knowledge-base uploads depend on the visitor's service limits.

## Rights

Original implementation code: MIT within `/LICENSING.md`. Extracted prose, figures and other materials retain their separate conditions. These packs are provided for source-grounded consultation about the published resources with the visitor's own LLM. No blanket training/republication license is added. See https://koyamarium.github.io/rights/ .

## Checks

```
node --test scripts/guide.test.mjs scripts/research-model.test.mjs scripts/market-atlas.test.mjs
```

Checks cover bilingual overview, focused scientific retrieval, planned DFT status, missing terms and filters, bounded/source-linked export, untrusted-text serialization, source URL restrictions and public snapshot scope. Browser QA covers selection/copy, stale question handling, download, language changes, no-result behavior and responsive layout. It does not claim to evaluate a visitor's LLM or independently validate underlying scientific results.

Scope decision (2026-11-11): keep this first research-consultation release focused on Numerical Methods Atlas and Thermal Instability. Astrophysics is a future expansion candidate; ordinary portfolio browsing remains in the works directory.
