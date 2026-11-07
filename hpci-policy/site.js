(() => {
  const copy = {
    ja: {
      title: '小山 洋 | 計算科学政策の記録', skip: '委員会・業務の記録へ', home: 'ホーム', breadcrumb: '計算科学政策の記録',
      headline1: '計算科学を支える、', headline2: '政策の記録。',
      intro: '文部科学省への2度の出向で携わった委員会や業務を、公開資料とともにたどる個人アーカイブ。HPCIとポスト「京」の基本設計評価を起点に、記録を順次追加しています。',
      periodsHeading: '文部科学省への2度の出向', first: '第1期', second: '第2期', organizationNote: '期間・役職・担当業務は本人提供の経歴情報による。',
      recordsHeading: '委員会・業務の記録', recordsNote: '公開資料に基づく要約', all: 'すべて', filterFirst: '第1期', filterSecond: '第2期', search: '記録を検索', searchPlaceholder: 'HPCI、基本設計…',
      involvement: '担当・関わり', sources: '公開資料', emptySecond: '第2期の委員会・会合は、担当内容の確認に合わせて順次追加します。', emptySearch: '一致する記録がありません。検索語や出向期を変更してください。',
      methodsTitle: '記録の読み方', methods1: '委員会の目的・審議内容・評価結果は、リンク先の公開一次資料に基づいて要約しています。各資料の確認状況はリンクの注記に記載しています。',
      methods2: '出向期間・役職と本人の担当内容は、本人提供の経歴情報に基づきます。委員会への関与は、委員への就任を意味するものではありません。詳細が未確認の項目はその旨を明記しています。',
      methods3: '個人による記録であり、文部科学省・所属機関の公式見解を示すものではありません。英語の役職・委員会名は説明のための訳語です。',
      sourceIndex: '出典一覧と確認状況', read: '本文確認', indexed: '直接取得未確認', updated: '更新', checked: '確認日', footer: '小山 洋 / Hiroshi Koyama', back: 'ホームに戻る', count: n => `${n}件の記録`,
    },
    en: {
      title: 'Hiroshi Koyama | Computing Policy Archive', skip: 'Skip to the records', home: 'Home', breadcrumb: 'Computing Policy Archive',
      headline1: 'Behind the infrastructure,', headline2: 'a record of policy work.',
      intro: 'A personal archive of committees and work during two secondments to MEXT, with links to public source documents. Starting with HPCI and the post-K basic-design review, this is a growing record.',
      periodsHeading: 'Two secondments to MEXT', first: 'First secondment', second: 'Second secondment', organizationNote: 'Dates, roles, and duties are based on career information provided by the author.',
      recordsHeading: 'Committees & work', recordsNote: 'Summaries from public sources', all: 'All records', filterFirst: 'First secondment', filterSecond: 'Second secondment', search: 'Search records', searchPlaceholder: 'HPCI, basic design…',
      involvement: 'Responsibilities & involvement', sources: 'Public sources', emptySecond: 'Committees and meetings from the second secondment will be added as the responsibilities are confirmed.', emptySearch: 'No matching records. Try another search or secondment.',
      methodsTitle: 'About this record', methods1: 'Committee purposes, discussions, and findings are summarized from the linked public primary sources. Notes on each link distinguish the verification status of the sources.',
      methods2: 'Secondment dates, roles, and personal responsibilities are based on career information supplied by the author. Involvement does not imply committee membership. Details awaiting confirmation are labeled accordingly.',
      methods3: 'This is a personal record and does not represent the official views of MEXT or affiliated institutions. English role and committee names are descriptive translations.',
      sourceIndex: 'Source index & verification', read: 'Text reviewed', indexed: 'Direct retrieval unverified', updated: 'Updated', checked: 'Checked', footer: 'Hiroshi Koyama / 小山 洋', back: 'Back to home', count: n => `${n} record${n === 1 ? '' : 's'}`,
    }
  };
  const data = JSON.parse(document.getElementById('archive-data').textContent);
  let language = 'ja';
  let selectedPeriod = 'all';
  const field = (value, lang = language) => value[lang];
  function filterRecords() {
    const query = document.getElementById('record-search').value.trim().normalize('NFKC').toLocaleLowerCase();
    let count = 0;
    document.querySelectorAll('.record').forEach(element => {
      const record = data.records.find(record => record.id === element.id);
      const visible = (selectedPeriod === 'all' || record.periods.includes(selectedPeriod)) && JSON.stringify(record).normalize('NFKC').toLocaleLowerCase().includes(query);
      element.hidden = !visible;
      if (visible) count++;
    });
    document.getElementById('result-count').textContent = copy[language].count(count);
    const empty = document.getElementById('empty-state');
    empty.hidden = count > 0;
    empty.textContent = selectedPeriod === 'second' && !query ? copy[language].emptySecond : copy[language].emptySearch;
    document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === selectedPeriod)));
  }
  function setLanguage(lang, save = false) {
    language = lang;
    const strings = copy[lang];
    document.documentElement.lang = lang;
    document.title = strings.title;
    document.querySelectorAll('[data-i18n]').forEach(element => { element.textContent = strings[element.dataset.i18n]; });
    document.querySelectorAll('[data-period-field]').forEach(element => {
      element.textContent = field(data.periods.find(period => period.id === element.dataset.period).role);
    });
    document.querySelectorAll('[data-period-summary]').forEach(element => { element.textContent = field(data.periods.find(period => period.id === element.dataset.periodSummary).summary); });
    document.querySelectorAll('[data-period-dates]').forEach(element => { element.textContent = field(data.periods.find(period => period.id === element.dataset.periodDates).dates); });
    document.getElementById('organization').textContent = field(data.organization);
    document.querySelectorAll('[data-record-field]').forEach(element => {
      element.textContent = field(data.records.find(record => record.id === element.dataset.record).title);
    });
    document.querySelectorAll('[data-content-field]').forEach(element => {
      const record = data.records.find(record => record.id === element.dataset.record);
      element.textContent = field(record[element.dataset.contentField]);
    });
    document.querySelectorAll('[data-points]').forEach(element => {
      const points = field(data.records.find(record => record.id === element.dataset.points).points);
      element.replaceChildren(...points.map(point => { const li = document.createElement('li'); li.textContent = point; return li; }));
    });
    document.querySelectorAll('[data-source-title]').forEach(element => { element.textContent = field(data.sources.find(source => source.id === element.dataset.sourceTitle).title); });
    document.querySelectorAll('[data-source-note]').forEach(element => { element.textContent = field(data.sources.find(source => source.id === element.dataset.sourceNote).note); });
    document.querySelectorAll('[data-verification]').forEach(element => { element.textContent = strings[element.dataset.verification === 'read' ? 'read' : 'indexed']; });
    document.querySelectorAll('[data-lang]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lang === lang)));
    document.querySelectorAll('[data-home]').forEach(link => { link.href = '../?lang=' + lang; });
    document.getElementById('record-search').placeholder = strings.searchPlaceholder;
    if (save) { try { localStorage.setItem('koyamahr.home.language', lang); } catch {} }
    const url = new URL(location.href); url.searchParams.set('lang', lang); history.replaceState(null, '', url);
    filterRecords();
  }
  let saved; try { saved = localStorage.getItem('koyamahr.home.language'); } catch {}
  const requested = new URLSearchParams(location.search).get('lang');
  setLanguage(['ja', 'en'].includes(requested) ? requested : saved === 'en' ? 'en' : 'ja');
  document.querySelector('.lang-switch').hidden = false;
  document.getElementById('tools').hidden = false;
  document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.lang, true)));
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => { selectedPeriod = button.dataset.filter; filterRecords(); }));
  document.getElementById('record-search').addEventListener('input', filterRecords);
})();
