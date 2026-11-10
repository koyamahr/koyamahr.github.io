const $ = selector => document.querySelector(selector);
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const data = await fetch(new URL('data.json', import.meta.url)).then(response => {
  if (!response.ok) throw new Error('系譜データを読み込めませんでした');
  return response.json();
}).catch(() => null);

if (!data) {
  $('#graph').innerHTML = '<p class="no-js">系譜データを読み込めませんでした。再読み込みするか、<a href="data.json">出典付きデータ</a>をご覧ください。</p>';
} else {
  const people = data.people;
  const edges = data.edges;
  const sources = new Map(data.sources.map(source => [source.id, source]));
  const personById = new Map(people.map(person => [person.id, person]));
  const sourceLink = (id, className = 'evidence-link') => {
    const source = sources.get(id);
    return source.url ? `<a class="${className}" href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.title)} <span aria-hidden="true">↗</span></a>` : `<span class="source-self">本人申告・2026年11月10日（公開URLなし）</span>`;
  };
  $('#graph').innerHTML = people.map((person, index) => {
    const button = `<button type="button" class="person ${index === 4 ? 'target' : ''}" data-person="${person.id}" aria-pressed="false" aria-controls="detail"><span class="person-step">${escape(person.anchor)}</span><span class="person-arrow" aria-hidden="true">↗</span><span class="person-name">${escape(person.name)}</span><span class="person-en" lang="en">${escape(person.en)}</span><span class="person-field">${escape(person.field)}</span></button>`;
    const edge = edges[index];
    return button + (edge ? `<button class="connector ${edge.status === 'self_reported' ? 'self-reported' : ''}" type="button" data-edge="${edge.id}" aria-controls="detail" aria-pressed="false" aria-label="${escape(person.name)}から${escape(people[index + 1].name)}：${escape(edge.label)}・${escape(edge.statusLabel)}"><span class="edge-dot" aria-hidden="true"></span><span class="edge-label">${escape(edge.short)}</span></button>` : '');
  }).join('');
  const kindLabels = {self_report:'本人申告', first_person_article:'本人の解説記事', university_profile:'大学公式資料', first_person_interview:'本人対談', publisher_biography:'出版社の略歴'};
  $('#source-list').innerHTML = data.sources.map((source, index) => `<article id="source-${source.id}" class="source-row ${source.type === 'self_report' ? 'self' : ''}"><span class="source-number">${String(index + 1).padStart(2, '0')}</span><div><h3>${source.url ? `<a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.title)} <span aria-hidden="true">↗</span></a>` : escape(source.title)}</h3><p class="source-publisher">${escape(source.publisher)}${source.date ? ` · ${escape(source.date)}` : ''}</p><p>${escape(source.note)}</p></div><span class="source-kind">${kindLabels[source.type]}</span></article>`).join('');

  let activeIndex = 0;
  function select(personIndex, edgeId = null, writeHash = true) {
    activeIndex = personIndex;
    const person = people[personIndex];
    const edge = edgeId ? edges.find(item => item.id === edgeId) : edges[Math.max(0, personIndex - 1)];
    document.querySelectorAll('[data-person]').forEach((button, index) => {
      button.setAttribute('aria-pressed', String(!edgeId && index === personIndex));
      button.classList.toggle('step-visited', index < personIndex);
    });
    document.querySelectorAll('[data-edge]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.edge === edgeId)));
    $('#detail').innerHTML = `<div class="detail-person"><span class="small-label">${escape(person.anchor)} / RESEARCHER</span><h3>${escape(person.name)}</h3><p class="detail-en" lang="en">${escape(person.en)}</p><p class="detail-milestone">${escape(person.milestone)}</p><p class="detail-institution">${escape(person.institution)}</p><p class="detail-description">${escape(person.description)}</p></div><div class="detail-evidence"><span class="small-label">RELATIONSHIP / 関係の根拠</span><div class="edge-heading"><h3>${escape(personById.get(edge.from).name)} <span aria-hidden="true">→</span> ${escape(personById.get(edge.to).name)}</h3><span class="badge ${edge.status === 'self_reported' ? 'self' : ''}">${escape(edge.statusLabel)}</span></div><p class="edge-type">${escape(edge.label)}</p><p class="edge-period">${escape(edge.period)}</p><p class="edge-evidence">${escape(edge.evidence)}</p>${edge.sourceIds.map(id => sourceLink(id)).join('')}<p class="locator">参照箇所：${escape(edge.locator)}</p></div>`;
    $('#walk').innerHTML = personIndex === people.length - 1 ? '最初からたどる <span aria-hidden="true">↺</span>' : '次の人へ進む <span aria-hidden="true">→</span>';
    if (writeHash) history.replaceState(null, '', '#' + (edgeId || person.id));
  }
  $('#graph').addEventListener('click', event => {
    const node = event.target.closest('[data-person]');
    const edge = event.target.closest('[data-edge]');
    if (node) select(people.findIndex(person => person.id === node.dataset.person));
    if (edge) {
      const relation = edges.find(item => item.id === edge.dataset.edge);
      select(people.findIndex(person => person.id === relation.to), relation.id);
    }
    if ((node || edge) && matchMedia('(max-width:900px)').matches) {
      $('#detail').scrollIntoView({block:'start', behavior:matchMedia('(prefers-reduced-motion:reduce)').matches ? 'instant' : 'smooth'});
    }
  });
  $('#walk').hidden = false;
  $('#walk').addEventListener('click', () => {
    select((activeIndex + 1) % people.length);
    if (matchMedia('(max-width:900px)').matches) document.querySelector(`[data-person="${people[activeIndex].id}"]`).scrollIntoView({block:'center', behavior:matchMedia('(prefers-reduced-motion:reduce)').matches ? 'instant' : 'smooth'});
  });
  function readHash() {
    const hash = location.hash.slice(1);
    const index = people.findIndex(person => person.id === hash);
    const edge = edges.find(item => item.id === hash);
    if (index !== -1) select(index, null, false);
    else if (edge) select(people.findIndex(person => person.id === edge.to), edge.id, false);
    else select(0, null, false);
  }
  readHash();
  window.addEventListener('hashchange', () => {
    if (people.some(person => person.id === location.hash.slice(1)) || edges.some(edge => edge.id === location.hash.slice(1))) readHash();
  });

  $('#copy-link').hidden = false;
  $('#copy-link').addEventListener('click', async () => {
    const canonical = $('link[rel=canonical]').href + location.hash;
    try {
      await navigator.clipboard.writeText(canonical);
      $('#share-status').textContent = '選択中の人物・関係へのリンクをコピーしました。';
    } catch {
      $('#share-status').replaceChildren();
      const label = document.createElement('label');
      label.textContent = 'このURLをコピー： ';
      const input = document.createElement('input');
      input.readOnly = true;
      input.value = canonical;
      input.style.cssText = 'width:65%;max-width:500px;font-size:11px';
      label.append(input);
      $('#share-status').append(label);
      input.focus();
      input.select();
    }
  });
  function createCard() {
    const nodeMarkup = people.map((person, index) => {
      const x = 66 + index * 222;
      const next = index < edges.length ? `<path d="M${x + 177} 324h45" stroke="${index ? '#426750' : '#94632f'}" stroke-width="2" ${index ? '' : 'stroke-dasharray="5 4"'}/><path d="M${x + 215} 320l7 4-7 4" fill="none" stroke="#426750"/><text x="${x + 200}" y="419" text-anchor="middle" font-size="12" fill="#68736a">${escape(edges[index].short)}</text>` : '';
      return `<rect x="${x}" y="251" width="177" height="139" fill="${index === 4 ? '#203b32' : '#fdfcf7'}" stroke="#cfd6c8"/><text x="${x + 17}" y="279" font-size="12" fill="${index === 4 ? '#d2dccb' : '#68736a'}">${escape(person.anchor)}</text><text x="${x + 17}" y="323" font-size="24" fill="${index === 4 ? '#f6f4ed' : '#203b32'}">${escape(person.name)}</text><text x="${x + 17}" y="352" font-size="12" fill="${index === 4 ? '#d2dccb' : '#68736a'}">${escape(person.en)}</text>${next}`;
    }).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#f6f4ed"/><g font-family="sans-serif"><text x="66" y="63" font-size="21" fill="#426750">Academic Roots</text><path d="M66 89H1134" stroke="#cfd6c8"/><text x="66" y="157" font-size="37" fill="#203b32">湯川秀樹まで、4ステップ。</text><text x="66" y="194" font-size="16" fill="#68736a">小山洋からたどる、学術上のつながり</text>${nodeMarkup}<path d="M66 473H1134" stroke="#cfd6c8"/><text x="66" y="510" font-size="14" fill="#68736a">大学院での指導と研究室の師弟関係を含む。全区間が博士論文指導を意味するわけではありません。</text><text x="66" y="538" font-size="14" fill="#94632f">小山洋 → 犬塚修一郎：本人申告　／　残り3関係：公開資料で確認</text><text x="66" y="589" font-size="14" fill="#426750">koyamahr.github.io/academic-roots/</text><text x="1134" y="589" text-anchor="end" font-size="12" fill="#68736a">確認日 2026.11.10</text></g></svg>`;
  }
  $('#save-card').hidden = false;
  $('#save-card').addEventListener('click', () => {
    const blob = new Blob([createCard()], {type:'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'academic-roots-koyama-yukawa.svg';
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    $('#share-status').textContent = '出典ページのURLと確認状況を記したSVGカードを保存しました。';
  });
}
