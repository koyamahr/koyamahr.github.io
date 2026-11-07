import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { renderHistory, esc } from '../hpci-policy/history-render.mjs';
import { renderBudgetChart } from '../hpci-policy/budget-chart.mjs';
const dir=new URL('../hpci-policy/',import.meta.url),data=JSON.parse(await readFile(new URL('history.json',dir),'utf8'));
data.periods=JSON.parse(await readFile(new URL('content.json',dir),'utf8')).periods;
const committees=JSON.parse(await readFile(new URL('committees.json',dir),'utf8'));
const unique=(items,type)=>{const ids=new Set();for(const a of items){if(ids.has(a.id))throw Error(`Duplicate ${type}: ${a.id}`);ids.add(a.id)}return ids};
const sources=unique(data.sources,'source'),nodes=unique(data.nodes,'node'),edges=unique(data.edges,'edge');
const checkSources=obj=>{if(!obj.sourceIds?.length&&obj.kind!=='personal')throw Error('Missing evidence: '+(obj.id||obj.title?.ja));for(const id of obj.sourceIds)if(!sources.has(id))throw Error('Unknown source: '+id)};
for(const s of data.sources){if(new URL(s.url).protocol!=='https:')throw Error('Unsafe source '+s.id);if(!s.title.ja||!s.title.en||!s.checked)throw Error('Incomplete source '+s.id)}
for(const n of data.nodes)checkSources(n);
for(const ed of data.edges){if(!nodes.has(ed.fromId)||!nodes.has(ed.toId))throw Error('Unknown edge endpoint '+ed.id);if(!['parent','report','sequence'].includes(ed.kind))throw Error('Unknown edge type '+ed.id);checkSources(ed)}
for(const v of data.views){const ids=new Set(v.positions.map(n=>n.id));for(const id of ids)if(!nodes.has(id))throw Error('Unknown view node '+id);for(const id of v.edgeIds){const ed=data.edges.find(e=>e.id===id);if(!ed||!ids.has(ed.fromId)||!ids.has(ed.toId))throw Error('Invalid view edge '+id)}}
for(const c of committees){if(!nodes.has(c.id))throw Error('Committee missing from context: '+c.id);if(c.parentId&&!data.edges.some(e=>e.kind==='parent'&&e.fromId===c.parentId&&e.toId===c.id))throw Error('Parent relationship mismatch: '+c.id)}
for(const event of data.events){if(!/^\d{4}(-\d{2}){0,2}$/.test(event.date))throw Error('Invalid date '+event.date);checkSources(event)}
for(const f of data.funding){if(!Number.isSafeInteger(f.yen)||f.yen<0)throw Error('Invalid amount '+f.id);checkSources(f)}
unique(data.budgetRecords,'budget record');const series=new Set(data.budgetSeries.map(s=>s.id));
for(const f of data.budgetRecords){if(!series.has(f.series)||!Number.isFinite(f.millionYen)||f.millionYen<0||f.year<2006||f.year>2025)throw Error('Invalid budget record '+f.id);checkSources(f)}
for(let y=2006;y<=2025;y++)if(!data.budgetRecords.some(r=>r.year===y&&r.kind==='initial'))throw Error('Missing annual budget '+y);
for(const row of data.reviewComparison){const actual=row.initial+row.supplementary+row.carryIn+row.carryOut+row.reserve;if(Math.abs(actual-row.available)>.11)throw Error('Review arithmetic mismatch: '+row.year);checkSources(row)}
for(const a of data.spending.cases){
 if(!['recipient','purpose'].includes(a.axis)||a.denominatorYen<=0||a.numeratorYen<0||a.numeratorYen>a.denominatorYen)throw Error('Invalid spending case '+a.id);
 if(a.segments.reduce((sum,s)=>sum+s.yen,0)!==a.denominatorYen)throw Error('Spending denominator mismatch '+a.id);
 for(const s of a.segments)if(!Number.isSafeInteger(s.yen)||s.yen<0)throw Error('Invalid spending segment '+a.id);
 if(a.examples.reduce((sum,e)=>sum+e.yen,0)>a.numeratorYen)throw Error('Payment examples exceed category '+a.id);
 checkSources(a);
}
for(const a of data.spending.piExamples){if(!Number.isSafeInteger(a.yen)||a.yen<0||a.people<1)throw Error('Invalid PI record');checkSources(a)}
if(data.spending.employmentShare!==null||data.spending.equipmentShare!==null)throw Error('Unverified aggregate spending shares must remain null');
unique(data.relatedLinks.flatMap(group=>group.items),'related link');
for(const group of data.relatedLinks){if(!group.title.ja||!group.title.en||!group.items.length)throw Error('Incomplete related-link group '+group.id);for(const item of group.items){if(new URL(item.url).protocol!=='https:'||!item.checked||!item.title.ja||!item.title.en||!item.note.ja||!item.note.en)throw Error('Incomplete related link '+item.id)}}
const assetNames=['history.js','history-render.mjs','budget-chart.mjs','spending-render.mjs','history.css','style.css'];
const assetVersion=createHash('sha256').update((await Promise.all(assetNames.map(name=>readFile(new URL(name,dir),'utf8')))).join('\n')).digest('hex').slice(0,12);
const importMap={imports:Object.fromEntries(['history-render.mjs','budget-chart.mjs','spending-render.mjs'].map(name=>['./'+name,'./'+name+'?v='+assetVersion]))};
const page=renderHistory(data).replace('<div id="budget-chart"></div>',`<div id="budget-chart">${renderBudgetChart(data)}</div>`);
const html=`<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f6f4ed"><meta name="description" content="HPCI・京・富岳の政策史、委員会の設置系列と評価経路、2006〜2025年度の文科省主要事業の予算概要。公開一次資料からたどる記録。"><meta property="og:title" content="委員会・計算基盤・予算の歩み | Hiroshi Koyama"><meta property="og:type" content="website"><meta property="og:url" content="https://koyamahr.github.io/hpci-policy/history.html"><link rel="canonical" href="https://koyamahr.github.io/hpci-policy/history.html"><link rel="icon" href="../favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="style.css?v=${assetVersion}"><link rel="stylesheet" href="history.css?v=${assetVersion}"><title>委員会・計算基盤・予算の歩み | Hiroshi Koyama</title><script type="importmap">${JSON.stringify(importMap)}</script><script type="module" src="history.js?v=${assetVersion}"></script></head><body><a class="skip" href="#map">関係図・年表・予算へ / Skip to content</a><div class="wrap"><header><a class="identity" data-home href="../?lang=ja" aria-label="Hiroshi Koyama Home"><span class="monogram" aria-hidden="true">hk</span><span class="name">Hiroshi Koyama</span></a><div class="lang-switch" role="group" aria-label="言語 / Language"><button type="button" data-lang="ja" lang="ja" aria-pressed="true">日本語</button><button type="button" data-lang="en" lang="en" aria-pressed="false">English</button></div></header><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="./?lang=ja" data-archive>← 出向・担当業務の記録</a><span aria-hidden="true">/</span><span>History &amp; funding</span></nav><main id="history-app">${page}</main><footer><span>小山 洋 / Hiroshi Koyama<br>公開資料確認・更新 / Updated: ${data.updated}</span><a href="./?lang=ja" data-archive>← 出向・担当業務の記録</a></footer></div><script id="history-data" type="application/json">${JSON.stringify(data).replace(/</g,'\\u003c')}</script></body></html>`;
await writeFile(new URL('history.html',dir),html.replace(/[\t ]+$/gm,''));
const csvEscape=v=>'"'+String(v).replace(/"/g,'""')+'"';const csv=[['id','fiscal_year','series_id','series_ja','amount_type','source_amount_type','million_yen','basis','precision','note_ja','source_urls'],...data.budgetRecords.map(r=>[r.id,r.year,r.series,data.budgetSeries.find(s=>s.id===r.series).title.ja,r.kind,r.sourceAmountType,r.millionYen,r.basis,r.precision,r.note.ja,r.sourceIds.map(id=>data.sources.find(s=>s.id===id).url).join(' | ')])].map(row=>row.map(csvEscape).join(',')).join('\n')+'\n';await writeFile(new URL('budget-data.csv',dir),'\uFEFF'+csv);
console.log(`Built history: ${data.nodes.length} nodes, ${data.edges.length} evidence-backed relationships, ${data.events.length} events, ${data.budgetRecords.length} budget observations, ${data.sources.length} sources.`);
