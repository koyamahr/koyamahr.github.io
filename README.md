# Hiroshi Koyama — Physics & Computation

Personal project index: **https://koyamahr.github.io/**

The homepage links to four independently maintained projects:

- [Theoretical Astrophysics, Step by Step](https://koyamahr.github.io/astronomy-step-by-step/)
- [An Atlas of Numerical Methods](https://koyamahr.github.io/numerical-methods-atlas/)
- [The Art of Thermal Instability](https://koyamahr.github.io/the-art-of-thermal-instability/)
- [Optical Atlas — 光学系のギャラリー](https://koyamahr.github.io/optics/) (Japanese)

It also links to the author's ORCID (0009-0003-7503-4715), Google Scholar, LinkedIn, and ResearchGate profiles. Japanese and English are available using the language buttons or `?lang=ja` / `?lang=en`. The selected language follows links to the bilingual projects.

The homepage also links to the bilingual [Computing Policy Archive](https://koyamahr.github.io/hpci-policy/), a personal record of two secondments to MEXT and related committees and work, with public primary sources. The initial entries cover the HPCI Plan Promotion Committee and the post-K basic-design review. Committee involvement is distinguished from committee membership; personal responsibilities and public-source summaries are labeled separately.

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
