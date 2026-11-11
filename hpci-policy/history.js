import { renderHistory, renderer } from './history-render.mjs';
import { renderBudgetChart, bindBudgetChart } from './budget-chart.mjs';
const data=JSON.parse(document.getElementById('history-data').textContent),app=document.getElementById('history-app');
let language='ja',view='origins',selected='review2009',timeline='all';
function updateMap(){
 const r=renderer(data,language);
 document.getElementById('diagram').innerHTML=r.chart(view,selected);
 document.getElementById('map-evidence').innerHTML=r.evidence(view,selected);
 document.getElementById('relation-list').innerHTML=r.relations(view,selected);
 document.getElementById('view-note').textContent=r.t(data.views.find(v=>v.id===view).note);
 document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));
}
function filterTimeline(){
 let n=0;document.querySelectorAll('[data-event]').forEach(el=>{el.hidden=timeline!=='all'&&(timeline==='critical'?el.dataset.critical!=='true':el.dataset.kind!==timeline);if(!el.hidden)n++});
 document.getElementById('event-count').textContent=renderer(data,language).c.eventCount(n);
 document.querySelectorAll('[data-timeline]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.timeline===timeline)));
}
function filterFinance(){
 const year=document.getElementById('finance-year').value,kind=document.getElementById('finance-kind').value;let n=0;
 document.querySelectorAll('[data-finance]').forEach(el=>{el.hidden=(year!=='all'&&el.dataset.year!==year)||(kind!=='all'&&el.dataset.kind!==kind);if(!el.hidden)n++});
 document.getElementById('finance-count').textContent=renderer(data,language).c.fundingCount(n);document.getElementById('finance-empty').hidden=n>0;
}
function setLanguage(lang,save=false){
 language=lang;document.documentElement.lang=lang;document.title=(lang==='ja'?'委員会・計算基盤・予算の歩み':'Committees, computing systems & funding')+' | Hiroshi Koyama';
 app.innerHTML=renderHistory(data,lang);document.getElementById('budget-chart').innerHTML=renderBudgetChart(data,lang);bindBudgetChart(data,lang);
 updateMap();filterTimeline();
 document.querySelectorAll('[data-home]').forEach(a=>{a.href='../?lang='+lang});
 document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===lang)));
 document.querySelectorAll('[data-archive]').forEach(a=>{a.href='./?lang='+lang;a.textContent=lang==='ja'?'← 出向・担当業務の記録':'← Secondments & responsibilities'});
 if(save){try{localStorage.setItem('koyamarium.home.language',lang)}catch{}const u=new URL(location.href);u.searchParams.set('lang',lang);history.replaceState(null,'',u)}
}
app.addEventListener('click',event=>{
 const b=event.target.closest('button');if(!b)return;
 if(b.dataset.view){view=b.dataset.view;selected=data.views.find(v=>v.id===view).positions[0].id;updateMap();document.querySelector(`[data-view="${view}"]`).focus()}
 if(b.dataset.node){selected=b.dataset.node;const x=document.querySelector('.graph-scroll').scrollLeft;updateMap();document.querySelector('.graph-scroll').scrollLeft=x;document.querySelector(`[data-node="${selected}"]`).focus({preventScroll:true})}
 if(b.dataset.edge){selected=b.dataset.edge;updateMap();document.querySelector(`[data-edge="${selected}"]`).focus({preventScroll:true})}
 if(b.dataset.timeline){timeline=b.dataset.timeline;filterTimeline()}
});
app.addEventListener('change',e=>{if(e.target.matches('#finance-year,#finance-kind'))filterFinance()});
document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>setLanguage(b.dataset.lang,true)));
let initial=new URL(location.href).searchParams.get('lang');if(!['ja','en'].includes(initial)){try{initial=localStorage.getItem('koyamarium.home.language')}catch{}}
setLanguage(['ja','en'].includes(initial)?initial:'ja');
const initialAnchor=location.hash.slice(1);
if(initialAnchor) requestAnimationFrame(()=>document.getElementById(initialAnchor)?.scrollIntoView({block:'start'}));
