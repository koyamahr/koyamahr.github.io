import { readFile, writeFile } from 'node:fs/promises';

const directory = new URL('../hpci-policy/', import.meta.url);
const data = JSON.parse(await readFile(new URL('content.json', directory), 'utf8'));
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const sourceMap = new Map(data.sources.map(source => [source.id, source]));
const periodIds = new Set(data.periods.map(period => period.id));
const recordIds = new Set();
for (const record of data.records) {
  if (recordIds.has(record.id)) throw new Error(`Duplicate record: ${record.id}`);
  recordIds.add(record.id);
  for (const id of record.sourceIds) if (!sourceMap.has(id)) throw new Error(`Unknown source: ${id}`);
  for (const id of record.periods) if (!periodIds.has(id)) throw new Error(`Unknown period: ${id}`);
}
for (const source of data.sources) if (new URL(source.url).protocol !== 'https:') throw new Error(`Non-HTTPS source: ${source.id}`);
const t = (key, value, tag = 'span') => `<${tag} data-i18n="${key}">${value}</${tag}>`;
const sourceLink = source => `<li><a class="source-link" href="${escape(source.url)}" target="_blank" rel="noopener noreferrer"><span class="source-title" data-source-title="${escape(source.id)}">${escape(source.title.ja)}</span> <span class="external" aria-hidden="true">↗</span><span class="source-meta">${escape(source.publisher)} · ${escape(source.kind)} · <span data-verification="${source.verification}">${source.verification === 'read' ? '本文確認' : '直接取得未確認'}</span></span></a>${source.note ? `<span class="source-note" data-source-note="${source.id}">${escape(source.note.ja)}</span>` : ''}</li>`;
const recordField = (record, key, cls, tag = 'p') => `<${tag} class="${cls}" data-record="${record.id}" data-content-field="${key}">${escape(record[key].ja)}</${tag}>`;
const periods = data.periods.map((period, index) => `<article class="period">
  <div class="period-head"><p class="period-label" data-i18n="${period.id}">${index === 0 ? '第1期' : '第2期'}</p><span class="period-label" aria-hidden="true">0${index + 1}</span></div>
  <h3 data-period="${period.id}" data-period-field="role">${escape(period.role.ja)}</h3>
  <p class="dates" data-period-dates="${period.id}">${escape(period.dates.ja)}</p>
  <p class="summary" data-period-summary="${period.id}">${escape(period.summary.ja)}</p>
</article>`).join('\n');
const records = data.records.map((record, index) => `<article class="record" id="${record.id}" aria-labelledby="${record.id}-title">
  <span class="record-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
  <div class="record-main">
    ${recordField(record, 'category', 'category')}
    <h3 id="${record.id}-title" data-record="${record.id}" data-record-field="title">${escape(record.title.ja)}</h3>
    ${recordField(record, 'officialName', 'official-name')}
    ${recordField(record, 'dateLabel', 'date-label')}
    ${recordField(record, 'summary', 'record-summary')}
    <ul class="record-points" data-points="${record.id}">${record.points.ja.map(point => `<li>${escape(point)}</li>`).join('')}</ul>
  </div>
  <aside class="record-aside">
    ${t('involvement', '担当・関わり', 'h4').replace('<h4 ', '<h4 class="aside-heading" ')}
    ${recordField(record, 'involvement', 'involvement')}
    ${t('sources', '公開資料', 'h4').replace('<h4 ', '<h4 class="aside-heading" ')}
    <ul class="source-list">${record.sourceIds.map(id => sourceLink(sourceMap.get(id))).join('')}</ul>
  </aside>
</article>`).join('\n');
const html = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f6f4ed">
  <meta name="description" content="小山 洋の文部科学省への2度の出向に関する個人アーカイブ。HPCI計画推進委員会、ポスト「京」の基本設計評価を公開資料からたどる。Hiroshi Koyama's Computing Policy Archive.">
  <meta property="og:title" content="小山 洋 | Computing Policy Archive">
  <meta property="og:description" content="計算科学を支える、政策の記録。文部科学省への2度の出向と、HPCI・ポスト「京」の公開資料。">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://koyamahr.github.io/hpci-policy/">
  <link rel="canonical" href="https://koyamahr.github.io/hpci-policy/">
  <link rel="icon" href="../favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="style.css">
  <title>小山 洋 | 計算科学政策の記録</title>
  <script src="site.js" defer></script>
</head>
<body>
  <a class="skip" href="#records" data-i18n="skip">委員会・業務の記録へ</a>
  <div class="wrap">
    <header>
      <a class="identity" href="../" data-home aria-label="Hiroshi Koyama — Home"><span class="monogram" aria-hidden="true">hk</span><span class="name">Hiroshi Koyama</span></a>
      <div class="lang-switch" role="group" aria-label="言語 / Language" hidden><button type="button" data-lang="ja" lang="ja" aria-pressed="true">日本語</button><button type="button" data-lang="en" lang="en" aria-pressed="false">English</button></div>
    </header>
    <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="../" data-home data-i18n="home">ホーム</a><span aria-hidden="true">/</span>${t('breadcrumb', '計算科学政策の記録')}</nav>
    <main>
      <section class="hero" aria-labelledby="headline">
        <div><p class="eyebrow">Computing Policy Archive</p><h1 id="headline">${t('headline1', '計算科学を支える、')}${t('headline2', '政策の記録。')}</h1><p class="intro" data-i18n="intro">文部科学省への2度の出向で携わった委員会や業務を、公開資料とともにたどる個人アーカイブ。HPCIとポスト「京」の基本設計評価を起点に、記録を順次追加しています。</p></div>
        <figure class="archive-figure" aria-hidden="true">
          <svg viewBox="0 0 340 235" fill="none"><g stroke="#c5cebf" stroke-width=".7"><path d="M18 60h300M18 112h300M18 164h300M65 32v163m60-163v163m60-163v163m60-163v163" stroke-dasharray="2 5"/></g><g stroke="#78907b" stroke-width="1"><path d="M35 112h58m0 0 52-52h60m-112 52 52 52h60m0-104 52 52h44m-96 52 52-52"/><rect x="28" y="105" width="14" height="14" fill="#f6f4ed"/><rect x="86" y="105" width="14" height="14" fill="#52745f"/><circle cx="145" cy="60" r="5" fill="#f6f4ed"/><circle cx="205" cy="60" r="5" fill="#f6f4ed"/><circle cx="145" cy="164" r="5" fill="#f6f4ed"/><circle cx="205" cy="164" r="5" fill="#f6f4ed"/><rect x="250" y="105" width="14" height="14" fill="#52745f"/><rect x="294" y="105" width="14" height="14" fill="#f6f4ed"/></g><g fill="#5a6861" font-family="Georgia,serif" font-size="10"><text x="72" y="94">2015–17</text><text x="236" y="94">2023–25</text><text x="128" y="43">HPCI</text><text x="125" y="187">POST-K</text></g></svg>
          <figcaption>01 / INFRASTRUCTURE &amp; POLICY</figcaption>
        </figure>
      </section>
      <section aria-labelledby="periods-heading">
        <div class="section-label"><h2 id="periods-heading" data-i18n="periodsHeading">文部科学省への2度の出向</h2><span class="minor">2015–17 / 2023–25</span></div>
        <div class="periods">${periods}</div>
        <p class="organization"><span id="organization">${escape(data.organization.ja)}</span>${t('organizationNote', '期間・役職・担当業務は本人提供の経歴情報による。')}</p>
      </section>
      <section class="records-section" id="records" aria-labelledby="records-heading">
        <div class="section-label"><h2 id="records-heading" data-i18n="recordsHeading">委員会・業務の記録</h2>${t('recordsNote', '公開資料に基づく要約').replace('<span ', '<span class="minor" ')}</div>
        <div class="toolbar" id="tools" hidden>
          <div class="filters" role="group" aria-label="出向期 / Secondment"><button type="button" data-filter="all" aria-pressed="true" data-i18n="all">すべて</button><button type="button" data-filter="first" aria-pressed="false" data-i18n="filterFirst">第1期</button><button type="button" data-filter="second" aria-pressed="false" data-i18n="filterSecond">第2期</button></div>
          <label class="search">${t('search', '記録を検索')}<input id="record-search" type="search" placeholder="HPCI、基本設計…"></label>
        </div>
        <p class="result-count" id="result-count" role="status" aria-live="polite">${data.records.length}件の記録</p>
        ${records}
        <p class="empty" id="empty-state" hidden></p>
      </section>
      <section class="methods" aria-labelledby="methods-heading">
        <div><p class="label">SOURCES &amp; CONTEXT</p><h2 id="methods-heading" data-i18n="methodsTitle">記録の読み方</h2></div>
        <div>
          <p data-i18n="methods1">委員会の目的・審議内容・評価結果は、リンク先の公開一次資料に基づいて要約しています。各資料の確認状況はリンクの注記に記載しています。</p>
          <p data-i18n="methods2">出向期間・役職と本人の担当内容は、本人提供の経歴情報に基づきます。委員会への関与は、委員への就任を意味するものではありません。詳細が未確認の項目はその旨を明記しています。</p>
          <p data-i18n="methods3">個人による記録であり、文部科学省・所属機関の公式見解を示すものではありません。英語の役職・委員会名は説明のための訳語です。</p>
          <details><summary data-i18n="sourceIndex">出典一覧と確認状況</summary><ul class="source-list">${data.sources.map(source => sourceLink(source).replace('</li>', `<span class="source-note"><span data-i18n="checked">確認日</span>: ${source.checked}</span></li>`)).join('')}</ul></details>
        </div>
      </section>
    </main>
    <footer><span>${t('footer', '小山 洋 / Hiroshi Koyama')}<br>${t('updated', '更新')}: <time datetime="${data.updated}">${data.updated}</time></span><a href="../" data-home data-i18n="back">ホームに戻る</a></footer>
  </div>
  <script id="archive-data" type="application/json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
</body>
</html>
`;
await writeFile(new URL('index.html', directory), html);
console.log(`Built hpci-policy/index.html: ${data.periods.length} periods, ${data.records.length} records, ${data.sources.length} sources.`);
