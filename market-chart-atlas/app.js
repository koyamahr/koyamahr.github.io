import {sma, referenceLevels, outcome, extent} from './indicators.mjs';
const $ = id => document.getElementById(id);
const copy = {
 ja: {skip:'事例一覧へ進む',back:'← プロジェクト一覧',headline:'値動きの形を、\nその先まで。',intro:'ろうそく足を読み、仮説を立て、続きを確かめる。過去の12事例から、市場の時系列を観察するアトラス。',step1:'先の見えないチャートを観察する',step2:'根拠を重ね、自分の読みを考える',step3:'続きを開き、仮説を振り返る',lab:'チャートの観察室',daily:'日足 · USD',ma20:'20日平均',ma50:'50日平均',levels:'直前20日高安',volume:'出来高',loading:'過去のチャートを読み込んでいます…',scrub:'各営業日の値を確認',chartNote:'分割調整後・配当未調整 / 上昇：緑・下落：茶',observation:'観察する',hypothesis:'読みを考える',reveal:'その後の20営業日を見る',hide:'観察日に戻る',previous:'← 前の事例',next:'次の事例 →',gallery:'12のチャートを、見比べる。',empty:'該当する事例がありません。検索や分類を変えてみてください。',methodTitle:'形を見つける。\n読みを確かめる。',methodIntro:'チャートは過去の記録です。似た形が同じ結果になるとは限りません。成立した例も崩れた例も、観察と結果を分けて読むことから。',method1:'データとチャートの読み方',method1Text:'米国株8銘柄と指数ETF2本の実際の日足です。日付は取引日の現地日付、価格は米ドル。Yahoo Finance配信のOHLC（株式分割調整後・配当未調整）と出来高を使用しています。後年の分割も反映されるため、当時報道された価格と異なる場合があります。緑は終値≧始値、茶は終値＜始値です。',source:'この銘柄のデータ出典 ↗',method2:'指標と表示範囲',method2Text:'最初に表示するのは観察日までの81営業日。「その後」を開くと20営業日を追加します。移動平均は終値の単純平均で、表示前のデータも計算に含みます。補助線は観察日を除く直前20営業日の高値・安値で、表示中は固定です。縦軸は表示範囲に合わせて変わります。出来高の目盛りは価格とは別です。',method3:'事例の選び方と結果の意味',method3Text:'2020〜2024年の目立った値動きを教材として選んだ事例集です。無作為抽出や売買ルールの検証ではなく、パターンの勝率は示していません。変化率は観察日終値から20営業日後終値までの単純変化で、配当・手数料・約定条件を含む投資収益ではありません。解説は学習用で、売買推奨を目的としません。',search:'銘柄・事例を探す',all:'すべて',breakout:'高値への接近',reversal:'反転の観察',trend:'トレンド',gap:'窓とイベント',failed:'継続の検証',future:'この先は、まだ見ない',asof:'観察日',after:'20営業日後',resultLabel:'終値の変化 / 20営業日',reflection:'振り返る',returnNote:'観察日終値 → 20営業日後終値',open:'始',high:'高',low:'安',close:'終',vol:'出来高',retrieved:'データ取得日：',caseUnit:'事例',chartAlt:'の日足ろうそく足チャート。各営業日の価格は下のスライダーで確認できます。',error:'データを読み込めませんでした。接続を確認して再試行してください。',retry:'再読み込み',title:'株価チャート・アトラス | Market Chart Atlas'},
 en: {skip:'Skip to cases',back:'← All projects',headline:'Read the pattern.\nReveal what follows.',intro:'Read the candles. Form a hypothesis. Reveal what followed. An atlas for exploring market time series through 12 historical cases.',step1:'Observe the chart with the future hidden',step2:'Layer evidence and form your own reading',step3:'Reveal the next sessions and reflect',lab:'The observation room',daily:'Daily · USD',ma20:'20-day SMA',ma50:'50-day SMA',levels:'Prior 20-day range',volume:'Volume',loading:'Loading historical charts…',scrub:'Inspect each trading session',chartNote:'Split-adjusted · no dividend adjustment / Up: green · Down: brown',observation:'OBSERVE',hypothesis:'FORM A READING',reveal:'Reveal the next 20 sessions',hide:'Return to the observation date',previous:'← Previous case',next:'Next case →',gallery:'Twelve charts. Many ways to read.',empty:'No matching cases. Try a different search or category.',methodTitle:'Notice the pattern.\nTest your reading.',methodIntro:'A chart records the past. Similar shapes need not lead to similar outcomes. Read both the examples that held and those that broke down, keeping observation separate from hindsight.',method1:'Data and reading the chart',method1Text:'Actual daily prices for eight US stocks and two index ETFs. Dates are local trading-session dates; prices are in USD. OHLC prices and volume come from Yahoo Finance. Prices reflect stock splits, including later splits, but not dividend adjustments, so they may differ from prices reported at the time. Green: close ≥ open. Brown: close < open.',source:'Historical data for this symbol ↗',method2:'Indicators and display range',method2Text:'Initially, 81 sessions end at the observation date. Revealing the outcome adds 20 sessions. Moving averages are simple averages of closing prices, including warm-up data before the visible window. Reference lines show the high and low of the 20 sessions before the observation date, excluding that date, and remain fixed. The price axis rescales to the visible data. Volume has its own scale.',method3:'Selection and interpreting outcomes',method3Text:'These are curated teaching cases of notable moves from 2020–2024, not a random sample or a test of trading rules. They do not establish pattern success rates. Percentage change compares the observation close with the close 20 sessions later; it is not an investment return including dividends, fees, or execution conditions. Commentary is educational and is not a trading recommendation.',search:'Search symbols or cases',all:'All cases',breakout:'Near highs',reversal:'Reversals',trend:'Trends',gap:'Gaps & events',failed:'Continuation',future:'The future stays hidden',asof:'Observation',after:'+20 sessions',resultLabel:'CLOSE CHANGE / 20 SESSIONS',reflection:'REFLECT',returnNote:'Observation close → close 20 sessions later',open:'O',high:'H',low:'L',close:'C',vol:'Vol',retrieved:'Data retrieved: ',caseUnit:'cases',chartAlt:' daily candlestick chart. Inspect individual session prices using the slider below.',error:'Could not load the data. Check your connection and try again.',retry:'Reload',title:'Market Chart Atlas | Hiroshi Koyama'}
};
let lang = 'ja', cases = [], active = 0, revealed = false, category = 'all', selected = 80, retrieved = '';
try {lang = localStorage.getItem('koyamahr.home.language') === 'en' ? 'en' : 'ja';} catch {}
const query = new URLSearchParams(location.search).get('lang');
if (['ja','en'].includes(query)) lang = query;
const t = key => copy[lang][key];
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const price = value => value.toLocaleString(lang === 'ja' ? 'ja-JP' : 'en-US',{minimumFractionDigits:2, maximumFractionDigits:2});
const volume = value => Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}).format(value);
const stateURL = () => {const url = new URL(location.href);url.searchParams.set('lang',lang);if(cases.length) url.hash=cases[active].id;history.replaceState(null,'',url);};
function setLanguage(next, save = false) {
 lang = next; document.documentElement.lang = lang; document.title = t('title');
 document.querySelectorAll('[data-i18n]').forEach(el => {const value=t(el.dataset.i18n);el.replaceChildren(...value.split('\n').flatMap((part,i)=>i?[document.createElement('br'),document.createTextNode(part)]:[document.createTextNode(part)]));});
 document.querySelectorAll('[data-lang]').forEach(el => el.setAttribute('aria-pressed',String(el.dataset.lang === lang)));
 $('home').href=$('back').href='../?lang='+lang;
 $('search').placeholder=t('search');$('search').setAttribute('aria-label',t('search'));$('scrub').setAttribute('aria-label',t('scrub'));
 $('filters').setAttribute('aria-label',lang==='ja'?'事例の分類':'Case categories');document.querySelector('.chart-options').setAttribute('aria-label',lang==='ja'?'指標の表示':'Chart indicators');
 if(save)try{localStorage.setItem('koyamahr.home.language',lang);}catch{}
 stateURL(); renderFilters(); if(cases.length){renderStudy();renderCards();}
}
function renderFilters(){
 $('filters').innerHTML=['all','breakout','reversal','trend','gap','failed'].map(key=>`<button type="button" data-filter="${key}" aria-pressed="${category===key}">${t(key)}</button>`).join('');
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
 active=(index+cases.length)%cases.length;revealed=false;selected=80;stateURL();renderStudy();renderCards();
 if(scroll){$('lab-title').focus({preventScroll:true});$('lab-title').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}
}
function renderStudy(){
 const c=cases[active];
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
 const c=cases[active],start=c.observationIndex-80,end=c.observationIndex+(revealed?20:0),rows=c.rows.slice(start,end+1);
 const show20=$('ma20').checked,show50=$('ma50').checked,showVolume=$('volume').checked;
 const avg20=sma(c.rows,20),avg50=sma(c.rows,50);
 let [lo,hi]=extent(rows);
 const references=referenceLevels(c.rows,c.observationIndex);
 const indicatorValues=[...(show20?avg20.slice(start,end+1):[]),...(show50?avg50.slice(start,end+1):[]),...($('levels').checked?Object.values(references):[])].filter(v=>v!==null);
 for(const value of indicatorValues){lo=Math.min(lo,value*.99);hi=Math.max(hi,value*1.01);}
 const narrow=matchMedia('(max-width:760px)').matches;
 const W=narrow?520:840,H=390,left=12,right=narrow?58:68,top=23,bottom=showVolume?278:335,plotRight=W-right,dx=(plotRight-left)/101,x=i=>left+(i+.5)*dx,y=v=>bottom-(v-lo)/(hi-lo)*(bottom-top),obx=x(80)+dx/2;
 let svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(c.symbol+t('chartAlt'))}"><title>${esc(c.symbol)} · ${c.date}</title>`;
 if(revealed)svg+=`<rect x="${obx}" y="${top}" width="${plotRight-obx}" height="${H-top-30}" fill="#e8ede3" opacity=".65"/>`;
 for(let i=0;i<5;i++){const value=lo+(hi-lo)*i/4;svg+=`<path d="M${left} ${y(value)}H${plotRight}" stroke="#d9ddd3" stroke-width=".7"/><text x="${plotRight+10}" y="${y(value)+3}" class="axis">${price(value)}</text>`;}
 if($('levels').checked)for(const value of Object.values(references))svg+=`<path d="M${left} ${y(value)}H${plotRight}" stroke="#7d8c7c" stroke-width="1" stroke-dasharray="4 5"/>`;
 const maxVol=Math.max(...rows.map(r=>r[5]));
 rows.forEach((r,i)=>{const color=r[4]>=r[1]?'#52745f':'#a57459';svg+=`<path d="M${x(i)} ${y(r[2])}V${y(r[3])}" stroke="${color}" stroke-width="1"/><rect x="${x(i)-dx*.29}" y="${Math.min(y(r[1]),y(r[4]))}" width="${dx*.58}" height="${Math.max(.9,Math.abs(y(r[1])-y(r[4])))}" fill="${color}"/>`;if(showVolume){const h=r[5]/maxVol*48;svg+=`<rect x="${x(i)-dx*.29}" y="${349-h}" width="${dx*.58}" height="${h}" fill="${color}" opacity=".45"/>`;}});
 for(const [show,avg,color] of [[show20,avg20,'#b69552'],[show50,avg50,'#728c9e']])if(show){const points=avg.slice(start,end+1).map((v,i)=>v===null?'':`${x(i)},${y(v)}`).filter(Boolean);svg+=`<polyline points="${points.join(' ')}" fill="none" stroke="${color}" stroke-width="1.65"/>`;}
 svg+=`<path d="M${obx} ${top-6}V${showVolume?353:bottom}" stroke="#839480" stroke-width="1" stroke-dasharray="3 4"/><text x="${obx-5}" y="14" text-anchor="end" style="font-size:9px">${t('asof')} ${c.date}</text>`;
 if(!revealed)svg+=`<text x="${obx+(plotRight-obx)/2}" y="${top+(bottom-top)/2-8}" text-anchor="middle" style="font-size:9px">${lang==='ja'?'この先は、':'THE FUTURE'}</text><text x="${obx+(plotRight-obx)/2}" y="${top+(bottom-top)/2+9}" text-anchor="middle" style="font-size:9px">${lang==='ja'?'まだ見ない':'STAYS HIDDEN'}</text>`;
 if(showVolume)svg+=`<path d="M${left} 349H${plotRight}" stroke="#d9ddd3" stroke-width=".6"/><text x="${plotRight+10}" y="312" class="axis">${volume(maxVol)}</text><text x="${plotRight+10}" y="348" class="axis">0</text>`;
 for(const i of [0,30,60,...(revealed?[100]:[])])svg+=`<text x="${x(i)}" y="377" text-anchor="${i===0?'start':'middle'}" class="axis">${rows[i][0]}</text>`;
 svg+=`<g class="crosshair" id="crosshair"><path id="cursor-line" stroke="#20352f" stroke-width=".8" opacity=".6" stroke-dasharray="2 3"/></g></svg>`;
 $('chart').innerHTML=svg;$('chart').setAttribute('aria-busy','false');
 $('range-note').textContent=`${rows[0][0]} — ${rows.at(-1)[0]}`;
 $('chart').onpointermove=e=>{if(e.pointerType==='touch')return;const rect=$('chart').querySelector('svg').getBoundingClientRect();const px=(e.clientX-rect.left)/rect.width*W;selected=Math.max(0,Math.min(rows.length-1,Math.floor((px-left)/dx)));$('scrub').value=selected;readout();};
 $('chart').dataset.cursorTop=top;$('chart').dataset.cursorBottom=showVolume?350:bottom;$('chart').dataset.dx=dx;$('chart').dataset.left=left;
 updateCursor();
}
function updateCursor(){const line=$('cursor-line');if(!line)return;const d=$('chart').dataset,x=Number(d.left)+(selected+.5)*Number(d.dx);line.setAttribute('d',`M${x} ${d.cursorTop}V${d.cursorBottom}`);}
function readout(){
 const c=cases[active],r=c.rows[c.observationIndex-80+selected];
 $('readout').innerHTML=`<strong>${r[0]}</strong> &nbsp; ${t('open')} ${price(r[1])} &nbsp; ${t('high')} ${price(r[2])} &nbsp; ${t('low')} ${price(r[3])} &nbsp; ${t('close')} <strong>${price(r[4])}</strong> &nbsp; ${t('vol')} ${volume(r[5])}`;
 $('scrub').setAttribute('aria-valuetext',`${r[0]}, ${t('open')} ${price(r[1])}, ${t('high')} ${price(r[2])}, ${t('low')} ${price(r[3])}, ${t('close')} ${price(r[4])}, ${t('vol')} ${r[5].toLocaleString()}`);updateCursor();
}
document.querySelectorAll('[data-lang]').forEach(button=>button.addEventListener('click',()=>setLanguage(button.dataset.lang,true)));
$('filters').addEventListener('click',event=>{const button=event.target.closest('[data-filter]');if(button){category=button.dataset.filter;renderFilters();renderCards();$('filters').querySelector(`[data-filter="${category}"]`).focus();}});
$('search').addEventListener('input',renderCards);
$('cards').addEventListener('click',event=>{const link=event.target.closest('[data-case]');if(link){event.preventDefault();selectCase(Number(link.dataset.case),true);}});
$('reveal').addEventListener('click',()=>{revealed=!revealed;selected=revealed?100:80;renderStudy();});
$('previous').addEventListener('click',()=>selectCase(active-1));$('next').addEventListener('click',()=>selectCase(active+1));
for(const id of ['ma20','ma50','levels','volume'])$(id).addEventListener('change',drawChart);
$('scrub').addEventListener('input',()=>{selected=Number($('scrub').value);readout();});
let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(cases.length)drawChart();},120);});
window.addEventListener('hashchange',()=>{const i=cases.findIndex(c=>'#'+c.id===location.hash);if(i>=0)selectCase(i);});
setLanguage(lang);
try{
 const response=await fetch(new URL('./data.json',import.meta.url));if(!response.ok)throw Error(response.status);
 const data=await response.json();if(!Array.isArray(data.cases)||data.cases.length!==12)throw Error('Invalid case data');
 cases=data.cases;retrieved=data.retrieved;
 const fromHash=cases.findIndex(c=>'#'+c.id===location.hash);if(fromHash>=0)active=fromHash;
 stateURL();renderStudy();renderCards();
}catch(error){$('chart').setAttribute('aria-busy','false');$('chart').innerHTML=`<div class="error" role="alert">${t('error')}<br><button class="retry">${t('retry')}</button></div>`;$('chart').querySelector('button').addEventListener('click',()=>location.reload());console.error('Market atlas data could not be loaded',error);}
