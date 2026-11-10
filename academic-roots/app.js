import { initBuilder } from './llm-builder.js?v=4';
const $ = selector => document.querySelector(selector);
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const data = await fetch(new URL('data.json?v=4', import.meta.url)).then(response => {
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
  const kindLabels = {self_report:'本人申告', first_person_article:'本人の解説記事', university_profile:'大学公式資料', first_person_interview:'本人対談', publisher_biography:'出版社の略歴',degree_record:'大学の学位記録',library_catalog:'図書館の書誌'};
  $('#source-list').innerHTML = data.sources.map((source, index) => `<article id="source-${source.id}" class="source-row ${source.type === 'self_report' ? 'self' : ''}"><span class="source-number">${String(index + 1).padStart(2, '0')}</span><div><h3>${source.url ? `<a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.title)} <span aria-hidden="true">↗</span></a>` : escape(source.title)}</h3><p class="source-publisher">${escape(source.publisher)}${source.date ? ` · ${escape(source.date)}` : ''}</p><p>${escape(source.note)}</p></div><span class="source-kind">${kindLabels[source.type]}</span></article>`).join('');

  let activeIndex = 0;
  function select(personIndex, edgeId = null, writeHash = true) {
    activeIndex = personIndex;
    const person = people[personIndex];
    const thesis = person.thesis;
    const thesisHtml = thesis ? `<section class="thesis-detail" aria-label="博士論文"><span class="small-label">DOCTORAL THESIS / 博士論文</span><h4>${escape(thesis.titleJa)}</h4><p class="thesis-english" lang="en">${escape(thesis.titleEn)}</p><p>${escape(thesis.university)} · ${escape(thesis.degree)}<br>${escape(thesis.awarded)}授与 · ${escape(thesis.reportNumber)}</p><div class="thesis-links"><a href="${escape(thesis.recordUrl)}" target="_blank" rel="noopener noreferrer">東大の学位記録・要旨 ↗</a><a href="${escape(thesis.catalogUrl)}" target="_blank" rel="noopener noreferrer">国会図書館の書誌 ↗</a></div><p class="thesis-note">${escape(thesis.note)}</p></section>` : '';
    const edge = edgeId ? edges.find(item => item.id === edgeId) : edges[Math.max(0, personIndex - 1)];
    document.querySelectorAll('[data-person]').forEach((button, index) => {
      button.setAttribute('aria-pressed', String(!edgeId && index === personIndex));
      button.classList.toggle('step-visited', index < personIndex);
    });
    document.querySelectorAll('[data-edge]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.edge === edgeId)));
    $('#detail').innerHTML = `<div class="detail-person"><span class="small-label">${escape(person.anchor)} / RESEARCHER</span><h3>${escape(person.name)}</h3><p class="detail-en" lang="en">${escape(person.en)}</p><p class="detail-milestone">${escape(person.milestone)}</p><p class="detail-institution">${escape(person.institution)}</p><p class="detail-description">${escape(person.description)}</p>${thesisHtml}</div><div class="detail-evidence"><span class="small-label">RELATIONSHIP / 関係の根拠</span><div class="edge-heading"><h3>${escape(personById.get(edge.from).name)} <span aria-hidden="true">→</span> ${escape(personById.get(edge.to).name)}</h3><span class="badge ${edge.status === 'self_reported' ? 'self' : ''}">${escape(edge.statusLabel)}</span></div><p class="edge-type">${escape(edge.label)}</p><p class="edge-period">${escape(edge.period)}</p><p class="edge-evidence">${escape(edge.evidence)}</p>${edge.sourceIds.map(id => sourceLink(id)).join('')}<p class="locator">参照箇所：${escape(edge.locator)}</p></div>`;
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

}
initBuilder(data);
