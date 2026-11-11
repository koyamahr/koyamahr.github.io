import {outcome, extent, calculateIndicator} from './indicators.mjs';
import {methods, parseSettings} from './methods.mjs';
import {chartSVG, methodPreview} from './chart.mjs';
const $ = id => document.getElementById(id);
const copy = {
 ja: {skip:'事例一覧へ進む',back:'← プロジェクト一覧',headline:'値動きの形を、\nその先まで。',intro:'ろうそく足を読み、仮説を立て、続きを確かめる。過去の12事例から、市場の時系列を観察するアトラス。',step1:'先の見えないチャートを観察する',step2:'根拠を重ね、自分の読みを考える',step3:'続きを開き、仮説を振り返る',lab:'チャートの観察室',daily:'日足 · USD',ma20:'20日平均',ma50:'50日平均',levels:'直前20日高安',volume:'出来高',loading:'過去のチャートを読み込んでいます…',scrub:'各営業日の値を確認',chartNote:'分割調整後・配当未調整 / 上昇：緑・下落：茶',observation:'観察する',hypothesis:'読みを考える',reveal:'その後の20営業日を見る',hide:'観察日に戻る',previous:'← 前の事例',next:'次の事例 →',gallery:'12のチャートを、見比べる。',empty:'該当する事例がありません。検索や分類を変えてみてください。',methodTitle:'形を見つける。\n読みを確かめる。',methodIntro:'チャートは過去の記録です。似た形が同じ結果になるとは限りません。成立した例も崩れた例も、観察と結果を分けて読むことから。',method1:'データとチャートの読み方',method1Text:'米国株8銘柄と指数ETF2本の実際の日足です。日付は取引日の現地日付、価格は米ドル。Yahoo Finance配信のOHLC（株式分割調整後・配当未調整）と出来高を使用しています。後年の分割も反映されるため、当時報道された価格と異なる場合があります。緑は終値≧始値、茶は終値＜始値です。',source:'この銘柄のデータ出典 ↗',method2:'指標と表示範囲',method2Text:'最初に表示するのは観察日までの81営業日。「その後」を開くと20営業日を追加します。移動平均は終値の単純平均で、表示前のデータも計算に含みます。補助線は観察日を除く直前20営業日の高値・安値で、表示中は固定です。縦軸は表示範囲に合わせて変わります。出来高の目盛りは価格とは別です。',method3:'事例の選び方と結果の意味',method3Text:'2020〜2024年の目立った値動きを教材として選んだ事例集です。無作為抽出や売買ルールの検証ではなく、パターンの勝率は示していません。変化率は観察日終値から20営業日後終値までの単純変化で、配当・手数料・約定条件を含む投資収益ではありません。解説は学習用で、売買推奨を目的としません。',search:'銘柄・事例を探す',all:'すべて',breakout:'高値への接近',reversal:'反転の観察',trend:'トレンド',gap:'窓とイベント',failed:'継続の検証',future:'この先は、まだ見ない',asof:'観察日',after:'20営業日後',resultLabel:'終値の変化 / 20営業日',reflection:'振り返る',returnNote:'観察日終値 → 20営業日後終値',open:'始',high:'高',low:'安',close:'終',vol:'出来高',retrieved:'データ取得日：',caseUnit:'事例',chartAlt:'の日足ろうそく足チャート。各営業日の価格は下のスライダーで確認できます。',error:'データを読み込めませんでした。接続を確認して再試行してください。',retry:'再読み込み',title:'株価チャート・アトラス | Market Chart Atlas'},
 en: {skip:'Skip to cases',back:'← All projects',headline:'Read the pattern.\nReveal what follows.',intro:'Read the candles. Form a hypothesis. Reveal what followed. An atlas for exploring market time series through 12 historical cases.',step1:'Observe the chart with the future hidden',step2:'Layer evidence and form your own reading',step3:'Reveal the next sessions and reflect',lab:'The observation room',daily:'Daily · USD',ma20:'20-day SMA',ma50:'50-day SMA',levels:'Prior 20-day range',volume:'Volume',loading:'Loading historical charts…',scrub:'Inspect each trading session',chartNote:'Split-adjusted · no dividend adjustment / Up: green · Down: brown',observation:'OBSERVE',hypothesis:'FORM A READING',reveal:'Reveal the next 20 sessions',hide:'Return to the observation date',previous:'← Previous case',next:'Next case →',gallery:'Twelve charts. Many ways to read.',empty:'No matching cases. Try a different search or category.',methodTitle:'Notice the pattern.\nTest your reading.',methodIntro:'A chart records the past. Similar shapes need not lead to similar outcomes. Read both the examples that held and those that broke down, keeping observation separate from hindsight.',method1:'Data and reading the chart',method1Text:'Actual daily prices for eight US stocks and two index ETFs. Dates are local trading-session dates; prices are in USD. OHLC prices and volume come from Yahoo Finance. Prices reflect stock splits, including later splits, but not dividend adjustments, so they may differ from prices reported at the time. Green: close ≥ open. Brown: close < open.',source:'Historical data for this symbol ↗',method2:'Indicators and display range',method2Text:'Initially, 81 sessions end at the observation date. Revealing the outcome adds 20 sessions. Moving averages are simple averages of closing prices, including warm-up data before the visible window. Reference lines show the high and low of the 20 sessions before the observation date, excluding that date, and remain fixed. The price axis rescales to the visible data. Volume has its own scale.',method3:'Selection and interpreting outcomes',method3Text:'These are curated teaching cases of notable moves from 2020–2024, not a random sample or a test of trading rules. They do not establish pattern success rates. Percentage change compares the observation close with the close 20 sessions later; it is not an investment return including dividends, fees, or execution conditions. Commentary is educational and is not a trading recommendation.',search:'Search symbols or cases',all:'All cases',breakout:'Near highs',reversal:'Reversals',trend:'Trends',gap:'Gaps & events',failed:'Continuation',future:'The future stays hidden',asof:'Observation',after:'+20 sessions',resultLabel:'CLOSE CHANGE / 20 SESSIONS',reflection:'REFLECT',returnNote:'Observation close → close 20 sessions later',open:'O',high:'H',low:'L',close:'C',vol:'Vol',retrieved:'Data retrieved: ',caseUnit:'cases',chartAlt:' daily candlestick chart. Inspect individual session prices using the slider below.',error:'Could not load the data. Check your connection and try again.',retry:'Reload',title:'Market Chart Atlas | Hiroshi Koyama'}
};
Object.assign(copy.ja,{skip:'分析手法の一覧へ進む',headline:'同じ値動きを、\n4つの視点で。',intro:'移動平均、MACD、RSI、ボリンジャーバンド。数式をたどり、期間を動かし、同じチャートを違う眼で読む。',step1:'指標の仕組みと数式を知る',step2:'同じチャートで手法を見比べる',step3:'期間を動かし、読みと限界を確かめる',lab:'同じチャートで、見比べる',gallery:'チャート事例から探す',indicatorGallery:'分析手法から探す',chooseCase:'事例',parameters:'パラメータを動かす',reset:'標準に戻す',parameterNote:'期間は営業日数。銘柄・表示期間を保ったまま比較できます。',sameData:'同じ価格、異なる視点。',readExplanation:'数式・読み方・限界を読む',formulaLabel:'数式と定義',readingLabel:'どう読むか',limitLabel:'どこに注意するか',method2Text:'最初は観察日までの81営業日を表示し、「その後」を開くと20営業日を追加します。指標は表示前のデータも計算に含みます。EMAとRSIは有限の履歴から初期化するため、他サービスの値と差が残る場合があります。補助線は観察日を除く直前20営業日の高安で固定です。縦軸は表示範囲に合わせて変わります。出来高・MACD・RSIは価格と別の縦軸で、RSIのみ0〜100に固定します。',days:'日',sigma:'σ',preview:'プレビューは同じ事例・同じ観察日、各手法の標準設定。選択すると下のチャートで比較できます。',sourceMethod:'定義の参考：',title:'テクニカル分析のギャラリー | Market Chart Atlas'});
Object.assign(copy.en,{skip:'Skip to indicators',headline:'One price series.\nFour perspectives.',intro:'Moving averages, MACD, RSI, and Bollinger Bands. Follow the formulas, change the periods, and see the same chart through different lenses.',step1:'Understand each indicator and its formula',step2:'Compare methods on the same chart',step3:'Vary parameters; examine readings and limits',lab:'Compare on the same chart',gallery:'Explore historical cases',indicatorGallery:'Explore the indicators',chooseCase:'Case',parameters:'ADJUST THE PARAMETERS',reset:'Reset defaults',parameterNote:'Periods are trading sessions. The selected case and date window stay the same as you compare methods.',sameData:'Same prices. Different perspectives.',readExplanation:'Read the formula, interpretation & limits',formulaLabel:'FORMULA & DEFINITION',readingLabel:'HOW TO READ IT',limitLabel:'WHAT IT CANNOT TELL YOU',method2Text:'Initially, 81 sessions end at the observation date. Revealing adds 20 sessions. Calculations include preceding history. EMA and RSI use finite-history initialization and may differ from services with longer histories. Reference levels are the high and low of the prior 20 sessions, excluding the observation session, and stay fixed. Axes rescale to visible data. Volume, MACD, and RSI each use separate axes; RSI is fixed at 0–100.',days:'days',sigma:'σ',preview:'Previews use the same case and observation date, with each method’s default settings. Select a method to compare it in the chart below.',sourceMethod:'Definition reference: ',title:'Technical Indicator Gallery | Market Chart Atlas'});
const initial = parseSettings(location.search);
let method = initial.method, settings = initial.settings, currentSeries = null;
const prompts = {
 ma:{ja:'期間を短くしたとき、SMAとEMAのどちらが直近の価格変化に速く反応するでしょうか。',en:'When you shorten the period, how do the SMA and EMA respond to recent price changes?'},
 macd:{ja:'棒がゼロを跨ぐ日は、MACD線とシグナル線が交差する日。価格の方向とは分けて観察してみてください。',en:'The histogram crosses zero when MACD crosses the signal line. Observe this separately from the direction of price.'},
 rsi:{ja:'同じ値動きでも、期間を変えると70・30への到達日はどう変わるでしょうか。',en:'How does changing the period affect when the same price series reaches 70 or 30?'},
 bb:{ja:'倍率だけを動かすと中心線はそのまま。期間も変えたときとの違いを比べてください。',en:'Changing only the multiplier leaves the middle line unchanged. Compare this with changing the period.'}
};
let lang = 'ja', cases = [], active = 0, revealed = false, category = 'all', selected = 80, retrieved = '';
try {lang = localStorage.getItem('koyamarium.home.language') === 'en' ? 'en' : 'ja';} catch {}
const query = new URLSearchParams(location.search).get('lang');
if (['ja','en'].includes(query)) lang = query;
const t = key => copy[lang][key];
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const price = value => value.toLocaleString(lang === 'ja' ? 'ja-JP' : 'en-US',{minimumFractionDigits:2, maximumFractionDigits:2});
const volume = value => Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}).format(value);
const stateURL = () => {const url = new URL(location.href);url.searchParams.set('lang',lang);url.searchParams.set('indicator',method);for(const key of ['period','fast','slow','signal','multiplier'])url.searchParams.delete(key);for(const [key,value] of Object.entries(settings[method]))url.searchParams.set(key,String(value));if(cases.length) url.hash=cases[active].id;history.replaceState(null,'',url);};
function setLanguage(next, save = false) {
 lang = next; document.documentElement.lang = lang; document.title = t('title');
 document.querySelectorAll('[data-i18n]').forEach(el => {const value=t(el.dataset.i18n);el.replaceChildren(...value.split('\n').flatMap((part,i)=>i?[document.createElement('br'),document.createTextNode(part)]:[document.createTextNode(part)]));});
 document.querySelectorAll('[data-lang]').forEach(el => el.setAttribute('aria-pressed',String(el.dataset.lang === lang)));
 $('home').href=$('back').href='../?lang='+lang;
 $('search').placeholder=t('search');$('search').setAttribute('aria-label',t('search'));$('scrub').setAttribute('aria-label',t('scrub'));$('case-picker').setAttribute('aria-label',lang==='ja'?'チャート事例':'Chart case');$('method-tabs').setAttribute('aria-label',lang==='ja'?'分析手法':'Indicator methods');
 $('filters').setAttribute('aria-label',lang==='ja'?'事例の分類':'Case categories');document.querySelector('.chart-options').setAttribute('aria-label',lang==='ja'?'指標の表示':'Chart indicators');
 if(save)try{localStorage.setItem('koyamarium.home.language',lang);}catch{}
 stateURL(); renderFilters();renderMethods();renderMethodPanel(); if(cases.length){renderStudy();renderCards();}
}
function renderFilters(){
 $('filters').innerHTML=['all','breakout','reversal','trend','gap','failed'].map(key=>`<button type="button" data-filter="${key}" aria-pressed="${category===key}">${t(key)}</button>`).join('');
}
function renderMethods(){
 $('indicator-cards').innerHTML=Object.entries(methods).map(([key,m])=>{
  const url=new URL(location.href);url.searchParams.set('indicator',key);for(const k of ['period','fast','slow','signal','multiplier'])url.searchParams.delete(k);for(const [k,v] of Object.entries(settings[key]))url.searchParams.set(k,String(v));
  const preview=cases.length?methodPreview(cases[active],key,calculateIndicator(cases[active].rows,key,m.defaults)):'';
  return `<article class="indicator-card ${method===key?'active':''}"><div class="indicator-art"><span class="indicator-number">${m.number} / ${esc(m.short)}</span>${preview}</div><div class="indicator-card-body"><p>${esc(m.group[lang])}</p><h3><a href="${esc(url.href)}" data-method="${key}" ${method===key?'aria-current="true"':''}>${esc(m.name[lang])}</a></h3><p class="indicator-card-description">${esc(m.summary[lang])}</p><span class="indicator-open">${lang==='ja'?'仕組みを見て、動かす':'Explore & adjust'} <span aria-hidden="true">↗</span></span></div></article>`;
 }).join('');
 $('preview-note').textContent=(cases.length?`${cases[active].symbol} · ${cases[active].date} / `:'')+t('preview');
}
function renderLegend(){
 const p=settings[method],legends={ma:[['SMA '+p.period,'#b69552'],['EMA '+p.period,'#728c9e']],macd:[['MACD','#728c9e'],['Signal','#b69552'],['Histogram','#52745f']],rsi:[['RSI '+p.period,'#8b7a9b'],['30 / 50 / 70','#abb4a8']],bb:[['SMA '+p.period,'#b69552'],['±'+Number(p.multiplier).toFixed(1)+'σ','#728c9e']]};
 $('indicator-legend').innerHTML=legends[method].map(([label,color])=>`<span><i style="background:${color}"></i>${esc(label)}</span>`).join('');
}
function updateFormula(){const m=methods[method];$('formula').textContent=m.formula(settings[method]);renderLegend();}
function renderMethodPanel(){
 const m=methods[method];
 $('method-tabs').innerHTML=Object.entries(methods).map(([key,m])=>`<button type="button" data-method="${key}" aria-pressed="${key===method}">${esc(m.short)}</button>`).join('');
 for(const [id,value] of Object.entries({'indicator-group':m.group[lang],'indicator-title':m.name[lang],'indicator-summary':m.summary[lang],definition:m.definition[lang],convention:m.convention[lang],'indicator-reading':m.reading[lang],'indicator-limit':m.limit[lang],'indicator-prompt':prompts[method][lang]}))$(id).textContent=value;
 $('indicator-source').textContent=t('sourceMethod')+m.sourceLabel+' ↗';$('indicator-source').href=m.source;
 $('parameters').innerHTML=m.controls.map(c=>`<label class="parameter" for="param-${c.key}"><span>${esc(c.label[lang])}<output for="param-${c.key}" id="output-${c.key}">${settings[method][c.key]} ${t(c.unit)}</output></span><input id="param-${c.key}" data-parameter="${c.key}" type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${settings[method][c.key]}" aria-label="${esc(c.label[lang])}" aria-valuetext="${settings[method][c.key]} ${t(c.unit)}"></label>`).join('');
 updateFormula();
}
function selectMethod(key,scroll=false){
 if(!Object.hasOwn(methods,key))return;
 method=key;stateURL();renderMethods();renderMethodPanel();if(cases.length){drawChart();readout();}
 if(scroll){$('lab-title').focus({preventScroll:true});$('lab-title').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}
}
function miniChart(c) {
 const rows=c.rows.slice(c.observationIndex-39,c.observationIndex+1),[lo,hi]=extent(rows), y=v=>104-(v-lo)/(hi-lo)*94;
 return `<svg viewBox="0 0 310 112" aria-hidden="true"><path d="M0 25H310M0 60H310M0 95H310" stroke="#d8dcd2" stroke-width=".5"/>${rows.map((r,i)=>{const x=5+i*7.6,color=r[4]>=r[1]?'#52745f':'#a57459';return `<path d="M${x} ${y(r[2])}V${y(r[3])}" stroke="${color}" stroke-width=".9"/><rect x="${x-2.1}" y="${Math.min(y(r[1]),y(r[4]))}" width="4.2" height="${Math.max(1,Math.abs(y(r[1])-y(r[4])))}" fill="${color}"/>`;}).join('')}</svg>`;
}
function renderCards(){
 const search=$('search').value.trim().toLocaleLowerCase();
 const filtered=cases.map((c,index)=>({c,index})).filter(({c})=>(category==='all'||c.category===category)&&[c.symbol,c.company,c.date,c.title.ja,c.title.en,c.pattern.ja,c.pattern.en].some(value=>value.toLocaleLowerCase().includes(search)));
 $('count').textContent=`${String(filtered.length).padStart(2,'0')} / ${cases.length} ${t('caseUnit')}`;$('empty').hidden=filtered.length!==0;
 $('cards').innerHTML=filtered.map(({c,index})=>`<article class="card ${index===active?'active':''}"><div class="card-chart"><span class="card-number">${String(index+1).padStart(2,'0')} / ${esc(c.symbol)}</span>${miniChart(c)}</div><div class="card-body"><div class="card-meta"><strong>${esc(c.symbol)}</strong><span>${c.date}</span></div><h3><a href="#${c.id}" data-case="${index}" ${index===active?'aria-current="true"':''}>${esc(c.title[lang])}</a></h3><div class="card-bottom"><span>${esc(c.pattern[lang])}</span><span aria-hidden="true">↗</span></div></div></article>`).join('');
}
function selectCase(index,scroll=false){
 active=(index+cases.length)%cases.length;revealed=false;selected=80;stateURL();renderMethods();renderStudy();renderCards();
 if(scroll){$('lab-title').focus({preventScroll:true});$('lab-title').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}
}
function renderStudy(){
 const c=cases[active];renderMethodPanel();
 $('scrub').disabled=false;$('case-picker').disabled=false;$('case-picker').innerHTML=cases.map((item,i)=>`<option value="${i}" ${i===active?'selected':''}>${esc(item.symbol)} · ${item.date}</option>`).join('');
 $('case-counter').textContent=`CASE ${String(active+1).padStart(2,'0')} / ${cases.length}`;
 for(const [id,value] of Object.entries({'study-symbol':c.symbol,'study-company':c.company,'study-pattern':c.pattern[lang],'study-date':c.date,'study-title':c.title[lang],observe:c.observe[lang],question:c.question[lang]}))$(id).textContent=value;
 $('source-link').href=`https://finance.yahoo.com/quote/${encodeURIComponent(c.symbol)}/history/`;
 $('retrieved').textContent=t('retrieved')+retrieved;
 $('reveal').disabled=$('previous').disabled=$('next').disabled=false;
 $('reveal').setAttribute('aria-expanded',String(revealed));$('reveal').setAttribute('aria-controls','result');
 $('reveal').innerHTML=`<span>${t(revealed?'hide':'reveal')}</span><span aria-hidden="true">${revealed?'↶':'↗'}</span>`;
 $('result').hidden=!revealed;
 if(revealed){const pct=outcome(c.rows,c.observationIndex);$('result').innerHTML=`<small>${t('resultLabel')}</small><div class="return">${pct>=0?'+':''}${pct.toFixed(1)}<span style="font-size:18px">%</span></div><small>${t('returnNote')}<br>${c.date} → ${c.rows[c.observationIndex+20][0]}</small><p class="small-label" style="margin-top:16px">${t('reflection')}</p><p>${esc(c.review[lang])}</p>`;}else{$('result').replaceChildren();}
 $('scrub').max=String(revealed?100:80);selected=Math.min(selected,Number($('scrub').max));$('scrub').value=String(selected);
 drawChart();readout();
}
function drawChart(){
 const c=cases[active];currentSeries=calculateIndicator(c.rows,method,settings[method]);
 const view=chartSVG(c,method,currentSeries,{revealed,narrow:matchMedia('(max-width:760px)').matches,volume:$('volume').checked,levels:$('levels').checked,lang});
 $('chart').innerHTML=view.svg;$('chart').setAttribute('aria-busy','false');
 $('range-note').textContent=`${view.first} — ${view.last}`;
 $('chart').onpointermove=e=>{if(e.pointerType==='touch')return;const rect=$('chart').querySelector('svg').getBoundingClientRect(),px=(e.clientX-rect.left)/rect.width*view.width;selected=Math.max(0,Math.min(revealed?100:80,Math.floor((px-view.left)/view.dx)));$('scrub').value=selected;readout();};
 Object.assign($('chart').dataset,{cursorTop:view.top,cursorBottom:view.bottom,dx:view.dx,left:view.left});updateCursor();
}
function updateCursor(){const line=$('cursor-line');if(!line)return;const d=$('chart').dataset,x=Number(d.left)+(selected+.5)*Number(d.dx);line.setAttribute('d',`M${x} ${d.cursorTop}V${d.cursorBottom}`);}
function readout(){
 const c=cases[active],index=c.observationIndex-80+selected,r=c.rows[index];
 $('readout').innerHTML=`<strong>${r[0]}</strong> &nbsp; ${t('open')} ${price(r[1])} &nbsp; ${t('high')} ${price(r[2])} &nbsp; ${t('low')} ${price(r[3])} &nbsp; ${t('close')} <strong>${price(r[4])}</strong> &nbsp; ${t('vol')} ${volume(r[5])}`;
 const names={sma:'SMA',ema:'EMA',line:'MACD',signal:'Signal',histogram:'Histogram',rsi:'RSI',middle:lang==='ja'?'中心線':'Middle',upper:lang==='ja'?'上の帯':'Upper',lower:lang==='ja'?'下の帯':'Lower'};
 const values=Object.entries(currentSeries).map(([key,a])=>`${names[key]} ${a[index]===null?'—':price(a[index])}`);
 $('indicator-readout').textContent=values.join('  ·  ');
 $('scrub').setAttribute('aria-valuetext',`${r[0]}, ${t('open')} ${price(r[1])}, ${t('high')} ${price(r[2])}, ${t('low')} ${price(r[3])}, ${t('close')} ${price(r[4])}, ${t('vol')} ${r[5].toLocaleString()}, ${values.join(', ')}`);updateCursor();
}
document.querySelectorAll('[data-lang]').forEach(button=>button.addEventListener('click',()=>setLanguage(button.dataset.lang,true)));
$('filters').addEventListener('click',event=>{const button=event.target.closest('[data-filter]');if(button){category=button.dataset.filter;renderFilters();renderCards();$('filters').querySelector(`[data-filter="${category}"]`).focus();}});
$('search').addEventListener('input',renderCards);
$('cards').addEventListener('click',event=>{const link=event.target.closest('[data-case]');if(link){event.preventDefault();selectCase(Number(link.dataset.case),true);}});
$('reveal').addEventListener('click',()=>{revealed=!revealed;selected=revealed?100:80;renderStudy();});
$('previous').addEventListener('click',()=>selectCase(active-1));$('next').addEventListener('click',()=>selectCase(active+1));
for(const id of ['levels','volume'])$(id).addEventListener('change',drawChart);
$('indicator-cards').addEventListener('click',event=>{const link=event.target.closest('[data-method]');if(link){event.preventDefault();selectMethod(link.dataset.method,true);}});
$('method-tabs').addEventListener('click',event=>{const button=event.target.closest('[data-method]');if(button){const key=button.dataset.method;selectMethod(key);$('method-tabs').querySelector(`[data-method="${key}"]`).focus();}});
$('case-picker').addEventListener('change',()=>selectCase(Number($('case-picker').value)));
$('parameters').addEventListener('input',event=>{const input=event.target.closest('[data-parameter]');if(!input)return;const key=input.dataset.parameter,control=methods[method].controls.find(c=>c.key===key);settings[method][key]=Number(input.value);$('output-'+key).textContent=input.value+' '+t(control.unit);input.setAttribute('aria-valuetext',input.value+' '+t(control.unit));updateFormula();stateURL();if(cases.length){drawChart();readout();}});
$('reset-params').addEventListener('click',()=>{settings[method]={...methods[method].defaults};renderMethodPanel();stateURL();if(cases.length){drawChart();readout();}});
$('scrub').addEventListener('input',()=>{selected=Number($('scrub').value);readout();});
let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(cases.length)drawChart();},120);});
window.addEventListener('hashchange',()=>{const i=cases.findIndex(c=>'#'+c.id===location.hash);if(i>=0)selectCase(i);});
document.querySelectorAll('.skip,.explanation-link').forEach(link=>link.addEventListener('click',event=>{const target=document.getElementById(link.getAttribute('href').slice(1));if(!target)return;event.preventDefault();target.tabIndex=-1;target.focus({preventScroll:true});target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}));
setLanguage(lang);
try{
 const response=await fetch(new URL('./data.json',import.meta.url));if(!response.ok)throw Error(response.status);
 const data=await response.json();if(!Array.isArray(data.cases)||data.cases.length!==12)throw Error('Invalid case data');
 cases=data.cases;retrieved=data.retrieved;
 const fromHash=cases.findIndex(c=>'#'+c.id===location.hash);if(fromHash>=0)active=fromHash;
 stateURL();renderMethods();renderStudy();renderCards();
}catch(error){$('chart').setAttribute('aria-busy','false');$('chart').innerHTML=`<div class="error" role="alert">${t('error')}<br><button class="retry">${t('retry')}</button></div>`;$('chart').querySelector('button').addEventListener('click',()=>location.reload());console.error('Market atlas data could not be loaded',error);}
