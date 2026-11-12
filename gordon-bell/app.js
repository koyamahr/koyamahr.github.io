'use strict';
let db, visible = [];
const $ = id => document.getElementById(id);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link = (url, label) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`;
const src = (ids) => (ids || []).map(id => link(db.sources[id].url, db.sources[id].label)).join(' ');
const doi = p => 'https://doi.org/' + p.doi;
function measurement(m) { return `${m.relation === '>' ? '> ' : ''}${m.value.toLocaleString('en-US')} ${m.unit}`; }
function fillSelect(id, values) { for (const value of [...new Set(values)].sort()) { const o = document.createElement('option'); o.value = value; o.textContent = value; $(id).append(o); } }
function render() {
  const q = $('search').value.toLowerCase().trim();
  visible = db.papers.filter(p => {
    const text = [p.title, ...p.title_aliases.map(a => a.title), ...p.authors, ...p.machines, p.field, p.summary, p.doi].join(' ').toLowerCase();
    return (!q || text.includes(q)) && ($('result').value === 'all' || Boolean(p.award) === ($('result').value === 'winner')) && ($('field').value === 'all' || p.field === $('field').value) && ($('machine').value === 'all' || p.machines.includes($('machine').value));
  });
  $('count').textContent = `${visible.length} of ${db.papers.length} papers`;
  $('list').innerHTML = visible.length ? visible.map(p => `<article class="card"><div class="year">${p.year}</div><div><span class="tag ${p.award ? 'winner' : ''}">${esc(p.award?.label || 'FINALIST')}</span><h3><button class="title-button" data-paper="${esc(p.id)}">${esc(p.title)}</button></h3><p class="authors">${esc(p.authors.join(' · '))}</p><p class="card-summary">${esc(p.summary)}</p><div class="paper-links">${link(doi(p), p.doi_verification?.status === 'unverified' ? 'DOI candidate: '+p.doi : 'DOI: '+p.doi)}<button data-paper="${esc(p.id)}">Details & sources</button><span>${esc(p.field)}</span></div></div><aside class="performance"><strong>${esc(p.machines.join(' / '))}</strong>${p.measurements.length ? p.measurements.map(m => `<div class="measure"><b>${esc(measurement(m))}</b><small>${esc(m.precision)} · ${esc(m.scope)}</small></div>`).join('') : '<p>Application FLOP/s not yet extracted.</p>'}</aside></article>`).join('') : '<p class="empty">No papers match these filters. Try another author, machine or research area.</p>';
}
function showPaper(id) {
  const p = db.papers.find(p => p.id === id); if (!p) return;
  const rows = p.measurements.map(m => `<tr><td><strong>${esc(measurement(m))}</strong><small>${esc(m.machine)}</small></td><td>${esc(m.precision)}</td><td>${esc(m.scope)}<small>${esc(m.scale)}</small>${m.note ? `<small>${esc(m.note)}</small>` : ''}<details><summary>Counting and timing method</summary><p>${esc(m.measurement_method || 'Not extracted')}</p></details></td><td>Preserved manuscript<small>Revision: ${esc(m.source_revision_date || 'not stated')}</small><small>Measured: ${esc(m.measurement_date || m.measurement_date_note || 'not established')}</small><small>Conference update: ${esc(m.conference_update_status)}</small><small>Final score: ${esc(m.final_score_status)}</small><small>Checked: ${esc(m.checked_on)}</small></td><td>${src([m.source_id])}<small>${esc(m.location)}</small></td></tr>`).join('');
  const sources = Object.entries(p.provenance).filter(([, ids]) => ids.length).map(([field, ids]) => `<li><strong>${esc(field[0].toUpperCase()+field.slice(1))}:</strong> ${src(ids)}</li>`).join('');
  const local = (p.local_evidence || []).map(e => `<h3>Preserved proceedings evidence</h3><p><strong>${esc(e.volume)} / ${esc(e.code)}</strong></p><p>Index title: ${esc(e.title)}</p><p>Original relative PDF path: <code>${esc(e.pdf_relative_path)}</code><br>Size: ${e.size_bytes.toLocaleString('en-US')} bytes</p><details><summary>File identity and verification</summary><p>Verified SHA-256: <code>${esc(e.sha256)}</code></p><p>Local copied bytes independently matched; selected manuscript fields checked ${esc(e.checked_on)}. Original PDFs are not hosted by this site. The DOI source link points to the publication record, not necessarily these exact manuscript bytes.</p></details>`).join('');
  const configurations = (p.machine_configurations || []).map(m => `<li><strong>${esc(m.name)}</strong> — ${esc(m.facility)}<p>${esc(m.configuration)}</p><small>${esc(m.location)} ${esc(m.note || '')}</small></li>`).join('');
  const abstractIds = p.provenance.abstract;
  $('detail-body').innerHTML = `<span class="eyebrow">${p.year} / ${esc(p.field)}</span><h2 id="detail-title">${esc(p.title)}</h2><span class="tag ${p.award ? 'winner' : ''}">${esc(p.award?.label || 'FINALIST')}</span><p class="detail-authors">${esc(p.authors.join(' · '))}</p><p>${link(doi(p), p.doi_verification?.status === 'unverified' ? 'DOI candidate: '+p.doi+' — direct verification pending' : 'DOI: '+p.doi)}</p><div class="notice">${esc(p.verification)}. Source checks: ${esc(db.updated_on)}.</div><h3>Abstract & research summary</h3><p>${esc(p.summary)}</p><p class="source-links">Editorial summary. Read the original abstract: ${src(abstractIds)}</p><h3>Reported performance</h3>${rows ? `<div class="table-wrap"><table><thead><tr><th>RATE / MACHINE</th><th>PRECISION</th><th>SCOPE / SCALE / METHOD</th><th>RESULT STAGE / DATE</th><th>EVIDENCE</th></tr></thead><tbody>${rows}</tbody></table></div>` : '<p>No measured application FLOP/s has been extracted. Hardware capacity is not substituted.</p>'}<h3>Machines and configuration</h3><ul>${configurations}</ul><p class="source-links">${src(p.provenance.machines)}</p>${p.title_aliases.length ? `<details class="aliases"><summary>Source title variants (${p.title_aliases.length})</summary><ul>${p.title_aliases.map(a => `<li>${esc(a.title)} — ${src([a.source_id])}</li>`).join('')}</ul></details>` : ''}${local}<h3>Research notes</h3><ul>${p.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul><h3>Field-level evidence</h3><ul class="source-list">${sources}</ul><p class="source-links">Local manuscript bytes and cited fields have been checked. DOI/abstract links are publication references and do not guarantee unrestricted access. Manuscript performance is not automatically the final conference score.</p>`;
  $('detail').showModal();
}
function download(name, content, type) { const a = document.createElement('a'); const url = URL.createObjectURL(new Blob([content], {type})); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
function exportCSV() {
  const columns = ['year','title','authors','award','doi','machine','relation','value','unit','precision','scope','scale','source_url','source_location','evidence_stage','source_revision_date','measurement_date','measurement_date_note','presentation_date','checked_on','conference_update_status','final_score_status','measurement_method','doi_verification'];
  const lines = [columns];
  for (const p of visible) for (const m of (p.measurements.length ? p.measurements : [null])) lines.push([p.year,p.title,p.authors.join('; '),p.award?.label || 'Finalist',p.doi,m?.machine || p.machines.join('; '),m?.relation === '=' ? 'equal' : (m?.relation || ''),m?.value ?? '',m?.unit || '',m?.precision || '',m?.scope || '',m?.scale || '',m ? db.sources[m.source_id].url : '',m?.location || '',m?.evidence_stage || '',m?.source_revision_date || '',m?.measurement_date || '',m?.measurement_date_note || '',m?.presentation_date || '',m?.checked_on || '',m?.conference_update_status || '',m?.final_score_status || '',m?.measurement_method || '',p.doi_verification?.status || 'existing bibliographic evidence']);
  const cell = v => { const s=String(v); return '"'+(/^[=+\-@]/.test(s) ? "'" : '')+s.replaceAll('"','""')+'"'; };
  download('gordon-bell-sc08.csv', '\uFEFF'+lines.map(row => row.map(cell).join(',')).join('\r\n'), 'text/csv;charset=utf-8');
}
function exportBib() {
  const bibEsc = s => s.replace(/[{}\\]/g, c => '\\'+c);
  download('gordon-bell-sc08.bib', visible.map(p => `@inproceedings{${p.id},\n  title = {${bibEsc(p.title)}},\n  author = {${p.authors.map(bibEsc).join(' and ')}},\n  year = {${p.year}},\n  booktitle = {Proceedings of SC08},\n${p.doi_verification?.status === 'unverified' ? '  note = {DOI candidate ' + bibEsc(p.doi) + ' remains unverified; manuscript evidence audited},' : '  doi = {'+p.doi+'},\n  url = {'+doi(p)+'}'}\n}`).join('\n\n'), 'text/plain;charset=utf-8');
}
function renderHoldings() {
  const q=$('holdings-search').value.trim().toLowerCase(), year=$('holdings-year').value;
  const rows=db.holdings.records.filter(r => (year==='all'||String(r.year)===year) && (!q||[r.title,r.year,r.code,...(r.authors||[])].join(' ').toLowerCase().includes(q)));
  $('holdings-count').textContent=`${rows.length} of ${db.holdings.records.length} local candidate records`;
  $('holdings-list').innerHTML=rows.map(r=>`<details class="holding"><summary><span>${r.year} / ${esc(r.code)}</span> ${esc(r.title)}</summary><p>${esc(r.content_status)}</p>${r.authors?`<p>${esc(r.authors.join(' · '))}</p>`:''}${r.award_status?`<p>${esc(r.award_status)}</p>`:''}<p>Source volume: ${esc(r.source_directory)}</p><ul>${r.body_files.map(f=>`<li><code>${esc(f.relative_path)}</code> · ${f.size_bytes.toLocaleString('en-US')} bytes</li>`).join('')}</ul><p>SHA-256-verified local copies. Full text is retained offline; this site provides metadata, not manuscript downloads.</p></details>`).join('');
}
function renderYearCoverage() {
  $('year-coverage').innerHTML=db.year_coverage.map(y=>`<div class="year-cell ${y.year===2008?'audited':''}"><strong>${y.year}</strong><span>${y.local_candidate_count==null?'Not reconciled':y.local_candidate_count+' local records'}</span><small>${esc(y.status)}</small></div>`).join('');
}

async function init() {
  try {
    const response = await fetch('data.json'); if (!response.ok) throw new Error('Data request failed'); db = await response.json();
    $('stat-papers').textContent=db.papers.length; $('stat-awards').textContent=db.papers.filter(p=>p.award).length; $('stat-runs').textContent=db.papers.reduce((n,p)=>n+p.measurements.length,0);
    fillSelect('field',db.papers.map(p=>p.field)); fillSelect('machine',db.papers.flatMap(p=>p.machines));
    for (const id of ['search','result','field','machine']) $(id).addEventListener(id==='search'?'input':'change',render);
    $('list').addEventListener('click',e=>{const b=e.target.closest('[data-paper]'); if(b) showPaper(b.dataset.paper);});
    $('close').addEventListener('click',()=> $('detail').close());
    $('detail').addEventListener('click',e=>{if(e.target===$('detail')){const r=$('detail').getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) $('detail').close();}});
    $('csv').addEventListener('click',exportCSV);$('bib').addEventListener('click',exportBib);
    $('coverage-links').innerHTML=src(['selection','schedule','awards']);
    $('issues').innerHTML=db.issues.map(i=>`<article class="issue"><span class="tag ${i.state==='Open'||i.state==='Blocked'?'pending':''}">${esc(i.state)}</span><h4>${esc(i.title)}</h4><p>${esc(i.detail)}</p></article>`).join('');
    fillSelect('holdings-year',db.holdings.records.map(r=>String(r.year)));
    $('holdings-search').addEventListener('input',renderHoldings); $('holdings-year').addEventListener('change',renderHoldings);
    renderYearCoverage(); renderHoldings(); render();
  } catch(err) { $('list').innerHTML='<p class="empty">The research records could not be loaded. Please reload the page.</p>'; console.error(err); }
}
init();
