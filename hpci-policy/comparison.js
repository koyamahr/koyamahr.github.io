import {copy,initialState,shown,renderComparison,renderTimeline,renderBudget,renderPair,renderProcess} from './comparison-render.mjs';
const data=JSON.parse(document.getElementById('comparison-data').textContent);
const state={...initialState,pair:[...initialState.pair],lang:document.documentElement.lang==='en'?'en':'ja'};
let root=document.getElementById('japan-us');
const views=Object.keys(copy.ja.views);
function hashView(){if(location.hash==='#japan-us')state.view='timeline';const name=location.hash.replace('#japan-us-','');if(views.includes(name))state.view=name}
hashView();
function update(rebuild=false){
 if(rebuild){root.outerHTML=renderComparison(data,state);root=document.getElementById('japan-us')}
 else{root.querySelector('#sc-timeline-content').innerHTML=renderTimeline(data,state);root.querySelector('#sc-budget-content').innerHTML=renderBudget(data,state);root.querySelector('#sc-compare-content').innerHTML=renderPair(data,state);root.querySelector('#sc-process-content').innerHTML=renderProcess(data,state)}
 root.querySelectorAll('.sc-tabs,.sc-toolbar,.sc-country[hidden],[data-sc-cost-kind]').forEach(el=>el.hidden=false);
 root.querySelectorAll('[data-sc-panel]').forEach(el=>el.hidden=el.dataset.scPanel!==state.view);
 root.querySelectorAll('[data-sc-view]').forEach(el=>{const active=el.dataset.scView===state.view;el.setAttribute('aria-selected',String(active));el.tabIndex=active?0:-1});
 root.querySelectorAll('[data-sc-country]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.scCountry===state.country)));
 root.querySelectorAll('[data-sc-process]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.scProcess===state.process)));
 root.querySelector('.sc-count').textContent=copy[state.lang].count(shown(data,state).length);
}
function selectView(view){state.view=view;const url=new URL(location.href);url.hash=view==='timeline'?'japan-us':'japan-us-'+view;history.replaceState(null,'',url)}
document.addEventListener('click',event=>{
 const button=event.target.closest('#japan-us button');if(!button)return;
 if(button.dataset.scView){selectView(button.dataset.scView);update();button.focus({preventScroll:true})}
 else if(button.dataset.scCountry){state.country=button.dataset.scCountry;update()}
 else if(button.dataset.scProcess){state.process=button.dataset.scProcess;update()}
 else if(button.dataset.scSelect){state.selected=button.dataset.scSelect;if(button.hasAttribute('data-sc-from-budget'))selectView('timeline');update();root.querySelector(`[data-sc-select="${state.selected}"]`)?.focus({preventScroll:true})}
 else if(button.dataset.scCompare){const id=button.dataset.scCompare;state.pair=state.pair.includes(id)?state.pair.filter(v=>v!==id):[...state.pair.slice(-1),id];update();root.querySelector(`[data-sc-compare="${id}"]`)?.focus({preventScroll:true})}
});
document.addEventListener('input',event=>{if(event.target.matches('#japan-us [data-sc-search]')){state.query=event.target.value;update()}});
document.addEventListener('change',event=>{if(event.target.matches('#japan-us [data-sc-mission]')){state.mission=event.target.value;update()}if(event.target.matches('#japan-us [data-sc-cost-kind]')){state.costKind=event.target.value;update()}});
document.addEventListener('keydown',event=>{const tab=event.target.closest('#japan-us [data-sc-view]');if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();let i=views.indexOf(state.view);i=event.key==='Home'?0:event.key==='End'?views.length-1:(i+(event.key==='ArrowRight'?1:-1)+views.length)%views.length;selectView(views[i]);update();root.querySelector(`[data-sc-view="${state.view}"]`).focus({preventScroll:true})});
document.addEventListener('archive-language-change',event=>{state.lang=event.detail==='en'?'en':'ja';update(true)});
window.addEventListener('hashchange',()=>{hashView();update()});
update(true);
