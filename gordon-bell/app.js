'use strict';
let db, visible = [], rosterVisible = [];
const $ = id => document.getElementById(id);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link = (url, label) => url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>` : `<span class="offline-source">${esc(label)} (preserved offline)</span>`;
const src = (ids) => (ids || []).map(id => link(db.sources[id].url, db.sources[id].label)).join(' ');
const doi = p => 'https://doi.org/' + p.doi;
function measurement(m) { return `${m.relation && m.relation !== '=' ? m.relation+' ' : ''}${m.value.toLocaleString('en-US')} ${m.unit}`; }
function stageLabel(m) { return ({preserved_proceedings_manuscript:'Preserved proceedings manuscript',submitted_manuscript:'Submitted manuscript',revised_manuscript:'Revised manuscript',conference_presentation:'Conference presentation',official_award_announcement:'Official award announcement',later_followup:'Later follow-up',author_preprint:'Author preprint',pre_conference_preprint:'Pre-conference preprint',archived_author_manuscript:'Archived author manuscript (revision date not stated)',later_author_manuscript:'Later author manuscript (after conference)',preprint:'Author preprint',pre_conference_preprint:'Pre-conference preprint',archived_author_manuscript:'Archived author manuscript (revision date not stated)',later_author_manuscript:'Later author manuscript (after conference)'})[m.evidence_stage] || 'Source manuscript'; }
function awardLabel(p) { return p.award?.label || (p.award_status?.startsWith('Outcome checked') ? 'FINALIST' : 'FINALIST · AWARD NOT CHECKED'); }
function reviewedVersions(p) { return (p.reviewed_versions || [{evidence_stage:'preserved_proceedings_manuscript',source_revision_date:null}]).map(v=>stageLabel(v)+(v.source_revision_date?' · '+v.source_revision_date:'')).join('; '); }
function fillSelect(id, values) { for (const value of [...new Set(values)].sort()) { const o = document.createElement('option'); o.value = value; o.textContent = value; $(id).append(o); } }
function render() {
  const q = $('search').value.toLowerCase().trim();
  visible = db.papers.filter(p => {
    const text = [p.year, p.title, ...p.title_aliases.map(a => a.title), ...p.authors, ...p.machines, p.field, p.summary, p.doi].join(' ').toLowerCase();
    return (!q || text.includes(q)) && ($('paper-year').value === 'all' || String(p.year) === $('paper-year').value) && ($('result').value === 'all' || Boolean(p.award) === ($('result').value === 'winner')) && ($('field').value === 'all' || p.field === $('field').value) && ($('machine').value === 'all' || p.machines.includes($('machine').value));
  });
  $('count').textContent = `${visible.length} of ${db.papers.length} papers`;
  $('list').innerHTML = visible.length ? visible.map(p => `<article class="card"><div class="year">${p.year}</div><div><span class="tag ${p.award ? 'winner' : ''}">${esc(awardLabel(p))}</span><h3><button class="title-button" data-paper="${esc(p.id)}">${esc(p.title)}</button></h3><p class="authors">${esc(p.authors.join(' · '))}</p><p class="card-summary">${esc(p.summary)}</p><p class="version-note">Performance source: ${esc(reviewedVersions(p))}</p><div class="paper-links">${link(doi(p), p.doi_verification?.status === 'unverified' ? 'DOI candidate: '+p.doi : 'DOI: '+p.doi)}<button data-paper="${esc(p.id)}">Details & sources</button><span>${esc(p.field)}</span></div></div><aside class="performance"><strong>${esc(p.machines.join(' / '))}</strong>${p.measurements.length ? p.measurements.map(m => `<div class="measure"><b>${esc(measurement(m))}</b><small>${esc(m.precision)} · ${esc(m.scope)}</small></div>`).join('') : '<p>Performance observation not yet extracted.</p>'}</aside></article>`).join('') : '<p class="empty">No papers match these filters. Try another author, machine or research area.</p>';
}
function showPaper(id) {
  const p = db.papers.find(p => p.id === id); if (!p) return;
  const rows = p.measurements.map(m => `<tr><td><strong>${esc(measurement(m))}</strong><small>${esc(m.machine)}</small></td><td>${esc(m.precision)}</td><td>${esc(m.scope)}<small>${esc(m.scale)}</small>${m.note ? `<small>${esc(m.note)}</small>` : ''}<details><summary>Counting and timing method</summary><p>${esc(m.measurement_method || 'Not extracted')}</p></details></td><td>${esc(stageLabel(m))}<small>Revision: ${esc(m.source_revision_date || 'not stated')}</small><small>Measured: ${esc(m.measurement_date || m.measurement_date_note || 'not established')}</small><small>Conference update: ${esc(m.conference_update_status)}</small><small>Final score: ${esc(m.final_score_status)}</small><small>Checked: ${esc(m.checked_on)}</small></td><td>${src([m.source_id])}<small>${esc(m.location)}</small></td></tr>`).join('');
  const sources = Object.entries(p.provenance).filter(([, ids]) => ids.length).map(([field, ids]) => `<li><strong>${esc(field[0].toUpperCase()+field.slice(1))}:</strong> ${src(ids)}</li>`).join('');
  const local = (p.local_evidence || []).map(e => `<h3>Preserved proceedings evidence</h3><p><strong>${esc(e.volume)} / ${esc(e.code)}</strong></p><p>Index title: ${esc(e.title)}</p><p>Original relative PDF path: <code>${esc(e.pdf_relative_path)}</code><br>Size: ${e.size_bytes.toLocaleString('en-US')} bytes</p><details><summary>File identity and verification</summary><p>Verified SHA-256: <code>${esc(e.sha256)}</code></p><p>Local copied bytes independently matched; selected manuscript fields checked ${esc(e.checked_on)}. Original PDFs are not hosted by this site. The DOI source link points to the publication record, not necessarily these exact manuscript bytes.</p></details>`).join('');
  const configurations = (p.machine_configurations || []).map(m => `<li><strong>${esc(m.name)}</strong> — ${esc(m.facility)}<p>${esc(m.configuration)}</p><small>${esc(m.location)} ${esc(m.note || '')}</small></li>`).join('');
  const abstractIds = p.provenance.abstract;
  const webEvidence = p.local_fulltext ? `<h3>Reviewed manuscript version</h3><p>${link(p.local_fulltext.source_url,'Read source manuscript')} · ${p.local_fulltext.page_count} PDF pages</p><p>The title, ordered byline and selected machine/performance fields were checked against this version. A later proceedings or presentation version may differ.</p><details><summary>Verified file identity</summary><p>SHA-256: <code>${esc(p.local_fulltext.sha256)}</code></p></details>` : '';
  $('detail-body').innerHTML = `<span class="eyebrow">${p.year} / ${esc(p.field)}</span><h2 id="detail-title">${esc(p.title)}</h2><span class="tag ${p.award ? 'winner' : ''}">${esc(awardLabel(p))}</span><p class="detail-authors">${esc(p.authors.join(' · '))}</p><p>${link(doi(p), p.doi_verification?.status === 'unverified' ? 'DOI candidate: '+p.doi+' — direct verification pending' : 'DOI: '+p.doi)}</p><div class="notice">${esc(p.verification)}. Source checks: ${esc(db.updated_on)}.</div><h3>Abstract & research summary</h3><p>${esc(p.summary)}</p><p class="source-links">Editorial summary. Read the original abstract: ${src(abstractIds)}</p><h3>Reported performance</h3>${rows ? `<div class="table-wrap"><table><thead><tr><th>REPORTED VALUE / MACHINE</th><th>PRECISION</th><th>SCOPE / SCALE / METHOD</th><th>RESULT STAGE / DATE</th><th>EVIDENCE</th></tr></thead><tbody>${rows}</tbody></table></div>` : '<p>No performance observation has been extracted. Hardware capacity is not substituted.</p>'}<h3>Machines and configuration</h3><ul>${configurations}</ul><p class="source-links">${src(p.provenance.machines)}</p>${p.title_aliases.length ? `<details class="aliases"><summary>Source title variants (${p.title_aliases.length})</summary><ul>${p.title_aliases.map(a => `<li>${esc(a.title)} — ${src([a.source_id])}</li>`).join('')}</ul></details>` : ''}${local}${webEvidence}<h3>Research notes</h3><ul>${p.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul><h3>Field-level evidence</h3><ul class="source-list">${sources}</ul><p class="source-links">Local manuscript bytes and cited fields have been checked. DOI/abstract links are publication references and do not guarantee unrestricted access. Manuscript performance is not automatically the final conference score.</p>`;
  $('detail').showModal();
}
function download(name, content, type) { const a = document.createElement('a'); const url = URL.createObjectURL(new Blob([content], {type})); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
function exportCSV() {
  const columns = ['year','title','authors','award','doi','machine','relation','value','unit','precision','scope','scale','source_url','source_location','evidence_stage','source_revision_date','measurement_date','measurement_date_note','presentation_date','checked_on','conference_update_status','final_score_status','measurement_method','doi_verification','award_status'];
  const lines = [columns];
  for (const p of visible) for (const m of (p.measurements.length ? p.measurements : [null])) lines.push([p.year,p.title,p.authors.join('; '),p.award?.label || 'Finalist',p.doi,m?.machine || p.machines.join('; '),m?.relation === '=' ? 'equal' : (m?.relation || ''),m?.value ?? '',m?.unit || '',m?.precision || '',m?.scope || '',m?.scale || '',m ? db.sources[m.source_id].url : '',m?.location || '',m?.evidence_stage || '',m?.source_revision_date || '',m?.measurement_date || '',m?.measurement_date_note || '',m?.presentation_date || '',m?.checked_on || '',m?.conference_update_status || '',m?.final_score_status || '',m?.measurement_method || '',p.doi_verification?.status || 'existing bibliographic evidence',p.award_status || '']);
  const cell = v => { const s=String(v); return '"'+(/^[=+\-@]/.test(s) ? "'" : '')+s.replaceAll('"','""')+'"'; };
  download('gordon-bell-archive.csv', '\uFEFF'+lines.map(row => row.map(cell).join(',')).join('\r\n'), 'text/csv;charset=utf-8');
}
function exportBib() {
  const bibEsc = s => s.replace(/[{}\\]/g, c => '\\'+c);
  download('gordon-bell-archive.bib', visible.map(p => `@inproceedings{${p.id},\n  title = {${bibEsc(p.citation_title || p.title)}},\n  author = {${(p.citation_authors || p.authors).map(bibEsc).join(' and ')}},\n  year = {${p.year}},\n  booktitle = {${bibEsc(p.booktitle || 'Proceedings of SC'+String(p.year).slice(-2))}},\n${p.doi_verification?.status === 'unverified' ? '  note = {DOI candidate ' + bibEsc(p.doi) + ' remains unverified; manuscript evidence audited},' : '  doi = {'+p.doi+'},\n  url = {'+doi(p)+'}'}\n}`).join('\n\n'), 'text/plain;charset=utf-8');
}
function renderHoldings() {
  const q=$('holdings-search').value.trim().toLowerCase(), year=$('holdings-year').value;
  const rows=db.holdings.records.filter(r => (year==='all'||String(r.year)===year) && (!q||[r.title,r.year,r.code,...(r.authors||[])].join(' ').toLowerCase().includes(q)));
  $('holdings-count').textContent=`${rows.length} of ${db.holdings.records.length} local candidate records`;
  $('holdings-list').innerHTML=rows.map(r=>`<details class="holding"><summary><span>${r.year} / ${esc(r.code)}</span> ${esc(r.title)}</summary><p>${esc(r.content_status)}</p>${r.authors?`<p>${esc(r.authors.join(' · '))}</p>`:''}${r.award_status?`<p>${esc(r.award_status)}</p>`:''}<p>Source volume: ${esc(r.source_directory)}</p><ul>${r.body_files.map(f=>`<li><code>${esc(f.relative_path)}</code> · ${f.size_bytes.toLocaleString('en-US')} bytes</li>`).join('')}</ul><p>SHA-256-verified local copies. Full text is retained offline; this site provides metadata, not manuscript downloads.</p></details>`).join('');
}
function renderYearCoverage() {
  $('year-coverage').innerHTML=db.year_coverage.map(y=>`<div class="year-cell ${y.year===2008?'audited':''}"><strong>${y.year}</strong><span>${y.candidate_count!=null?y.candidate_count+' indexed entries':y.local_candidate_count==null?'Not reconciled':y.local_candidate_count+' local records'}</span><small>${esc(y.status)}</small><p class="annual-links">${annualLinks(y.sc_links)||'SC conference series began in 1988.'}</p></div>`).join('');
}
function annualLinks(s) {
  if(!s) return '';
  return [s.website_url&&link(s.website_url,'SC website'),s.proceedings_url&&link(s.proceedings_url,'Proceedings'),s.history_pdf_url&&link(s.history_pdf_url,'SC history PDF')].filter(Boolean).join(' ');
}
function rosterStatus(r) {
  const status=r.roster_completeness.status;
  if(r.roster_completeness.expected_count==null || status.includes('partial')) return 'Partial roster · further candidates may be missing';
  if(status.includes('award_labels_unresolved')) return 'Preserved session list · finalist/winner labels unresolved';
  return r.source_method==='Preserved conference index' ? 'Preserved official index enumerated' : 'Primary source roster enumerated';
}
function renderRecent() {
  const q=$('recent-search').value.trim().toLowerCase(), year=$('recent-year').value, doiState=$('roster-doi').value;
  const catalogue=db.annual_rosters || db.recent_rosters;
  let total=0,matched=0; rosterVisible=[];
  const html=catalogue.map(r=>{
    total+=r.records.length;
    const records=r.records.filter(p=>(year==='all'||String(r.year)===year)&&(!q||[p.title,p.publisher_title,p.doi,r.year,...p.authors].join(' ').toLowerCase().includes(q))&&(doiState==='all'||(doiState==='verified'&&p.doi_status==='verified')||(doiState==='unresolved'&&!['verified','not_applicable'].includes(p.doi_status))||(doiState==='not_applicable'&&p.doi_status==='not_applicable')));
    matched+=records.length;
    if(!records.length) return '';
    const sources=Object.fromEntries(r.sources.map(s=>[s.id,s]));
    for(const p of records) rosterVisible.push({year:r.year,...p,conference_year:r.conference_year||r.year,year_label:r.year_label||String(r.year),entry_type:r.roster_completeness.membership_label||'candidates',title_source:sources[p.title_source_id],roster_status:r.roster_completeness.status});
    const ref=(id,label)=>sources[id]?link(sources[id].url,label||sources[id].label):'';
    const rosterSources=r.roster_completeness.basis_source_ids.map(id=>ref(id)).join(' ');
    const note=r.roster_completeness.note || r.notes?.[0] || '';
    const open=year!=='all'||q||doiState!=='all';
    const membership=r.roster_completeness.membership_label || 'candidates';
    const partial=r.roster_completeness.expected_count==null || r.roster_completeness.status.includes('partial');
    const countLabel=partial ? r.records.length+' identified · partial list' : r.records.length+' '+membership+(r.roster_completeness.status.includes('award_labels_unresolved')?' · labels unresolved':'');
    return `<details class="roster-year" ${open?'open':''}><summary><strong>${r.year}${r.event_label?' · '+esc(r.event_label):' / SC'+String(r.year).slice(-2)}</strong><span>${esc(countLabel)} · ${r.verified_doi_count} DOI verified</span></summary><p class="annual-links">${annualLinks(r.sc_links)}</p><details class="roster-evidence"><summary>Annual source evidence</summary><p class="source-links">${rosterSources}</p>${note?`<p>${esc(note)}</p>`:''}</details><p class="roster-status">${esc(rosterStatus(r))} · ${r.detailed_paper_count || 0} manuscript checks · Conference-day scores unverified.</p><ol class="roster-records">${records.map(p=>`<li><h4>${esc(p.title)}</h4>${p.title_kind==='editorial_description'?'<p class="title-kind">Editorial description; formal paper title not recovered.</p>':p.title_kind==='corporate_entry'?'<p class="title-kind">Organization-level finalist; no single paper is implied.</p>':p.title_kind==='publisher_title'?'<p class="title-kind">Publication title; original selection title not recovered.</p>':''}<div class="paper-links">${p.doi_status==='verified'?link('https://doi.org/'+p.doi,'DOI: '+p.doi):p.doi_status==='not_applicable'?'<span>DOI not applicable to this organization-level entry</span>':'<span class="unresolved-doi">DOI unresolved</span>'}${p.detailed_paper_id?`<button data-paper="${esc(p.detailed_paper_id)}">Manuscript details</button>`:''}${ref(p.title_source_id,'Title source')}${p.publication_url?link(p.publication_url,'Publisher record'):''}${p.doi_status==='verified'?ref(p.doi_source_id,'DOI verification'):''}</div><details><summary>Bibliographic evidence & title variants</summary>${p.publisher_title&&p.publisher_title!==p.title?`<p>Publisher title: ${esc(p.publisher_title)}</p>`:''}${p.authors.length?`<p>${esc(p.authors.join(' · '))}</p><p>${p.detailed_paper_id?'Registry names are preserved here; the reviewed manuscript byline is shown in Manuscript details.':/registry|crossref/i.test(p.authors_status)?'Names follow publisher-deposited registry order; the PDF byline has not been audited here.':'Names follow the cited source; the full publication byline has not been reconciled here.'}</p>`:/corporate|not_applicable/i.test(p.authors_status)?'<p>Organization-level entry; no single paper byline.</p>':'<p>Author list not yet verified.</p>'}${p.notes.length?`<ul>${p.notes.map(n=>`<li>${esc(n)}</li>`).join('')}</ul>`:''}<p>Checked ${esc(r.checked_on)}. ${p.detailed_paper_id?'Selected manuscript fields checked; see Manuscript details for version-specific values and award evidence.':'Manuscript, performance and award-outcome checks remain separate from this bibliography.'}</p></details></li>`).join('')}</ol></details>`;
  }).join('');
  $('recent-count').textContent=`${matched} of ${total} indexed entries`;
  $('recent-list').innerHTML=html||'<p class="empty">No annual records match these filters.</p>';
}
function rosterCSV() {
  const columns=['record_id','year','conference_year','year_label','entry_type','title_kind','selection_title','publisher_title','doi','doi_status','authors','authors_status','roster_status','title_source_url','preserved_source_reference'];
  const rows=rosterVisible.map(p=>[p.id,p.year,p.conference_year,p.year_label,p.entry_type,p.title_kind||'source_title',p.title,p.publisher_title||'',p.doi||'',p.doi_status,p.authors.join('; '),p.authors_status,p.roster_status,p.title_source?.url||'',p.title_source?.local_reference||'']);
  const cell=v=>'"'+String(v).replace(/^[=+\-@]/,"'$&").replaceAll('"','""')+'"';
  return '\uFEFF'+[columns,...rows].map(row=>row.map(cell).join(',')).join('\r\n');
}

async function init() {
  try {
    const response = await fetch('data.json?v=annual-20261112'); if (!response.ok) throw new Error('Data request failed'); db = await response.json();
    $('catalogue-gaps').textContent='Membership lists not yet recovered for: '+db.catalogue_summary.uncovered_years.join(', ')+'. Partial lists are labelled separately.'; $('stat-papers').textContent=db.papers.length; $('stat-roster-years').textContent=db.catalogue_summary.years; $('stat-candidates').textContent=db.catalogue_summary.records; $('stat-dois').textContent=db.catalogue_summary.verified_dois; $('detail-scope').textContent=`${db.papers.length} selected papers · ${db.papers.reduce((n,p)=>n+p.measurements.length,0)} performance observations · ${new Set(db.papers.map(p=>p.year)).size} conference years`;
    fillSelect('paper-year',db.papers.map(p=>String(p.year))); fillSelect('field',db.papers.map(p=>p.field)); fillSelect('machine',db.papers.flatMap(p=>p.machines));
    for (const id of ['search','paper-year','result','field','machine']) $(id).addEventListener(id==='search'?'input':'change',render);
    for(const id of ['list','recent-list']) $(id).addEventListener('click',e=>{const b=e.target.closest('[data-paper]'); if(b) showPaper(b.dataset.paper);});
    $('close').addEventListener('click',()=> $('detail').close());
    $('detail').addEventListener('click',e=>{if(e.target===$('detail')){const r=$('detail').getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) $('detail').close();}});
    $('csv').addEventListener('click',exportCSV);$('bib').addEventListener('click',exportBib);
    $('coverage-links').innerHTML=src(['selection','schedule','awards']);
    $('issues').innerHTML=db.issues.map(i=>`<article class="issue"><span class="tag ${i.state==='Open'||i.state==='Blocked'?'pending':''}">${esc(i.state)}</span><h4>${esc(i.title)}</h4><p>${esc(i.detail)}</p></article>`).join('');
    fillSelect('holdings-year',db.holdings.records.map(r=>String(r.year)));
    $('holdings-search').addEventListener('input',renderHoldings); $('holdings-year').addEventListener('change',renderHoldings);
    fillSelect('recent-year',db.annual_rosters.map(r=>String(r.year))); $('roster-csv').addEventListener('click',()=>download('gordon-bell-candidate-index.csv',rosterCSV(),'text/csv;charset=utf-8'));
    $('recent-search').addEventListener('input',renderRecent); $('recent-year').addEventListener('change',renderRecent); $('roster-doi').addEventListener('change',renderRecent);
    renderYearCoverage(); renderHoldings(); renderRecent(); render();
  } catch(err) { $('list').innerHTML='<p class="empty">The research records could not be loaded. Please reload the page.</p>'; console.error(err); }
}
init();
