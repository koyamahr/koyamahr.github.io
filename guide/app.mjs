import {makeEngine,buildPrompt,MAX_SOURCES} from './search.mjs';
const $=s=>document.querySelector(s);
const copy={
 ja:{skip:'質問へ進む',directory:'教材・研究',title:'知りたいことから、\nたどり着く。',lead:'公開教材を探して、あなたのLLMと読み解く。',intro:'計算したいこと、学びたいことを書いてください。関連資料の抜粋と出典をまとめ、いつものLLMに渡せます。',step1:'目的を書く',step2:'資料を選ぶ',step3:'自分のLLMへ渡す',start:'START WITH A QUESTION',questionLabel:'何をしたいですか？',filter:'範囲',search:'関連資料を探す →',privacyTitle:'質問・入力内容を収集しません',privacy:'この案内機能で入力した質問や内容を、サイト運営者が収集・保存・送信することはありません。ブラウザ内で処理し、アクセス解析や追跡も行いません。コピーした内容をLLMに貼り付けると、そのサービスに渡ります。',hostingPrivacy:'ページの配信元（GitHub Pages）では、IPアドレス等の通常のアクセス記録が残ります。質問や入力内容を送るものではありません。',hostingDetails:'配信元の説明',results:'関連する資料',ranking:'語句と関連用語の一致で探します。並び順は手法の優劣や検証の強さを示しません。',handoff:'あなたのLLMへ',handoffNote:'選んだ資料と出典を、相談文にまとめます。コピーして、使い慣れたLLMのチャットに貼り付けてください。',copy:'相談文をコピー',download:'相談文を保存 (.md)',preview:'渡す内容を確認・手動コピー',manual:'このページは回答を生成しません。LLMの提供・自動接続・APIキーの入力はありません。利用するサービスの料金や制限に従います。',coverage:'収録範囲と資料パック',scope:'数値計算の解説章・宇宙物理・熱的不安定性は公開ページの本文抜粋を収録。光学、大学ノート、系譜、株価、政策、本、note、写真は概要案内です。図・動く実験・外部論文全文・手書き本文・書籍原稿・未公開アプリは含みません。',limits:'数式や表の抽出は不完全な場合があります。実装・検証の範囲は元ページを確認してください。日本語訳がドラフトの資料や、英語のみの資料もあります。索引は取得時点の保存版です。',allPack:'全体の資料パック (.md)',numPack:'数値計算 (.md)',astroPack:'宇宙物理 (.md)',thermalPack:'熱的不安定性 (.md)',packNote:'対応するLLMの知識ベースに登録するためのテキストです。容量・利用条件は各サービスに従い、登録後も毎回全資料が読まれるとは限りません。llms.txtの自動読込はサービス次第です。',rights:'資料の利用条件',update:'索引の更新方法',back:'← ポートフォリオへ',placeholder:'例：衝撃波を含む流れを計算したい。どの手法から学べばいい？',examples:['このサイトでは何ができる？','衝撃波の計算手法を比較したい','Poisson方程式を解きたい','星間ガスの熱的不安定性を学びたい','DFTの実装はある？'],domains:{all:'すべて',numerical:'数値計算',astronomy:'宇宙物理',thermal:'熱的不安定性',optics:'光学',archives:'ノート・記録・Web作品',writing:'本・記事',photographs:'写真'},loading:'公開資料の索引を読み込んでいます…',ready:'検索の準備ができました。まずは全体の案内を表示しています。',error:'索引を読み込めませんでした。ページを再読込するか、下の資料パックをお使いください。',none:'一致する資料が見つかりません。用語を短くするか、範囲を広げてください。未収録の内容もあります。',select:'LLMへ渡す資料に加える',excerpt:'抜粋をすべて見る',reading:'本文抜粋 · 実装・検証範囲は元ページ参照',overview:'概要のみ',copied:'コピーしました。自分のLLMへ貼り付けてください。',fallback:'自動コピーできませんでした。「渡す内容を確認」を開き、選択済みの文章を手動でコピーしてください。',changed:'質問が変わりました。「関連資料を探す」で選び直してください。',need:'質問を入力して検索すると、資料を選べます。',max:'一度に選べる資料は6件までです。',selected:n=>`${n}件 / 最大6件`,count:n=>`${n}件`,snapshot:d=>`保存版 ${d.version} · ${d.pages.length}公開ページの本文 + 11作品の概要 · 取得日時（UTC）${d.capturedAt}`},
 en:{skip:'Skip to the question',directory:'Learning & research',title:'Start with a question.\nFind your way.',lead:'Find public sources. Explore them with your own LLM.',intro:'Describe what you want to calculate or learn. Gather relevant excerpts and source links to take to the LLM you already use.',step1:'Describe your goal',step2:'Choose sources',step3:'Take them to your LLM',start:'START WITH A QUESTION',questionLabel:'What would you like to do?',filter:'Scope',search:'Find related sources →',privacyTitle:'We do not collect your questions or input',privacy:'This guide does not collect, save or transmit your questions or input to the site operator. Processing stays in your browser, with no analytics or tracking. If you paste copied content into an LLM, it is shared with that service.',hostingPrivacy:'The hosting provider (GitHub Pages) keeps ordinary access logs, including IP addresses. This does not send your questions or input.',hostingDetails:'Hosting provider’s explanation',results:'Related sources',ranking:'Matching uses words and related terms. Ranking does not measure algorithm quality or the strength of validation.',handoff:'To your own LLM',handoffNote:'Combine your question with selected excerpts and source links. Copy the text, then paste it into your usual LLM chat.',copy:'Copy the consultation prompt',download:'Save the prompt (.md)',preview:'Review text / copy manually',manual:'This page does not generate answers. No LLM hosting, automatic connection or API key entry. Your chosen service’s fees and limits apply.',coverage:'Coverage & knowledge packs',scope:'Extracted public text from numerical reading chapters, astrophysics and thermal-instability pages. Optics, notebooks, genealogy, markets, policy, books, note and photography are overview entries. Figures, interactive experiments, external paper full texts, handwritten contents, book manuscripts and unpublished apps are excluded.',limits:'Extraction may omit or distort mathematics and tables. Check original pages for implementation and verification scope. Some Japanese translations are drafts, and some sources are English only. This index is a saved snapshot.',allPack:'Whole-site pack (.md)',numPack:'Numerical methods (.md)',astroPack:'Astrophysics (.md)',thermalPack:'Thermal instability (.md)',packNote:'Text for a compatible LLM knowledge base. Service capacity and usage terms apply. Uploading does not guarantee every entry is read for each answer. Automatic reading of llms.txt depends on the service.',rights:'Material usage terms',update:'How to refresh the index',back:'← Back to the portfolio',placeholder:'Example: I want to simulate a flow with shocks. Which methods should I study first?',examples:['What can I do on this site?','Compare numerical methods for shock waves','Solve a Poisson equation','Learn thermal instability in interstellar gas','Is there a DFT implementation?'],domains:{all:'All sources',numerical:'Numerical methods',astronomy:'Astrophysics',thermal:'Thermal instability',optics:'Optics',archives:'Notebooks, archives & web works',writing:'Books & writing',photographs:'Photographs'},loading:'Loading the public source index…',ready:'Ready. Showing an overview of the published works.',error:'The index could not be loaded. Reload the page or use a knowledge pack below.',none:'No matching sources. Try fewer terms or a broader scope. Some topics are not covered.',select:'Include in the LLM prompt',excerpt:'Read the full excerpt',reading:'Text excerpt · check source for implementation / validation scope',overview:'Overview only',copied:'Copied. Paste it into your own LLM chat.',fallback:'Automatic copying failed. Open “Review text” and copy the selected text manually.',changed:'Your question changed. Use “Find related sources” to choose sources again.',need:'Enter a question and search to select sources.',max:'Select up to six sources at a time.',selected:n=>`${n} selected / 6 maximum`,count:n=>`${n} sources`,snapshot:d=>`Snapshot ${d.version} · ${d.pages.length} public text pages + 11 work overviews · Captured (UTC) ${d.capturedAt}`}
};
let lang=new URLSearchParams(location.search).get('lang')==='en'?'en':'ja',data,search,results=[],selected=new Map(),searchedQuestion='';
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
function stale(){return $('#question').value.trim()!==searchedQuestion;}
function updatePrompt(){
 const q=$('#question').value.trim(),active=!!q&&!stale()&&selected.size>0;
 const pack=buildPrompt(q,[...selected.values()],data?.version||'',lang);
 $('#prompt').value=active?pack.text:'';
 $('#selected-count').textContent=stale()?copy[lang].changed:q?copy[lang].selected(selected.size):copy[lang].need;
 $('#copy').disabled=$('#download').disabled=!active;
 $('#copy-status').textContent='';
}
function renderResults(){
 const c=copy[lang],list=$('#result-list');list.replaceChildren();$('#result-count').textContent=c.count(results.length);
 if(!results.length)list.append(el('p',c.none,'empty'));
 for(const [i,r] of results.entries()){
  const card=el('article',undefined,'result-card');
  card.append(el('p',`${c.domains[r.domain]||r.domain} / ${r.lang==='ja'?'日本語':'English'} / ${r.kind==='overview'?c.overview:c.reading}`,'result-meta'));
  const title=el('h3'),a=el('a',r.title);a.href=r.url;a.target='_blank';a.rel='noopener noreferrer';title.append(a);card.append(title);
  if(r.notice)card.append(el('p',r.notice,'privacy'));
  if(r.section&&r.section!==r.title)card.append(el('p',r.section,'muted'));
  card.append(el('p',r.text.slice(0,240)+(r.text.length>240?'…':''),'excerpt'));
  const details=el('details');details.append(el('summary',c.excerpt),el('p',r.text));card.append(details);
  card.append(el('p',r.url.replace('https://',''),'source-path'));
  const label=el('label'),check=el('input');check.type='checkbox';check.checked=selected.has(i);check.disabled=!searchedQuestion;
  check.addEventListener('change',()=>{if(check.checked&&selected.size>=MAX_SOURCES){check.checked=false;$('#copy-status').textContent=c.max;return;}if(check.checked)selected.set(i,r);else selected.delete(i);updatePrompt();});
  label.append(check,el('span',c.select));card.append(label);list.append(card);
 }
 updatePrompt();
}
function runSearch(){
 if(!search)return;
 searchedQuestion=$('#question').value.trim();selected.clear();results=search(searchedQuestion,$('#domain').value,lang);
 if(searchedQuestion)results.slice(0,3).forEach((r,i)=>selected.set(i,r));
 $('#load-status').textContent=searchedQuestion?'':copy[lang].ready;renderResults();
}
function language(next){
 lang=next;const c=copy[lang];document.documentElement.lang=lang;document.title=lang==='ja'?'サイトを案内する | 小山 洋':'Research Compass | Hiroshi Koyama';
 document.querySelector('meta[name="description"]').content=c.intro;
 document.querySelectorAll('[data-t]').forEach(n=>{n.textContent=c[n.dataset.t];});
 document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===lang)));
 for(const id of ['home','back'])$('#'+id).href='/?lang='+lang;$('#directory').href='/research/?lang='+lang;
 $('#question').placeholder=c.placeholder;
 const current=$('#domain').value;$('#domain').replaceChildren(...Object.entries(c.domains).map(([v,t])=>{const n=el('option',t);n.value=v;return n;}));$('#domain').value=current||'all';
 $('#examples').replaceChildren(...c.examples.map(t=>{const b=el('button',t);b.type='button';b.addEventListener('click',()=>{$('#question').value=t;runSearch();});return b;}));
 if(data){$('#snapshot').textContent=c.snapshot(data);runSearch();}
 else $('#load-status').textContent=c.loading;
 const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url.pathname+url.search);
}
document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>language(b.dataset.lang)));
$('#search').addEventListener('click',runSearch);$('#domain').addEventListener('change',()=>{if(search)runSearch();});
$('#question').addEventListener('input',updatePrompt);
$('#question').addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)&&search){e.preventDefault();runSearch();}});
$('#copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#prompt').value);$('#copy-status').textContent=copy[lang].copied;}catch{$('#handoff details').open=true;$('#prompt').focus();$('#prompt').select();$('#copy-status').textContent=copy[lang].fallback;}});
$('#download').addEventListener('click',()=>{const blob=new Blob([$('#prompt').value],{type:'text/markdown;charset=utf-8'}),url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download='research-question.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);});
language(lang);
try{const response=await fetch('./index.json');if(!response.ok)throw new Error('Index unavailable');data=await response.json();search=makeEngine(data);$('#search').disabled=false;$('#snapshot').textContent=copy[lang].snapshot(data);runSearch();}catch{$('#load-status').textContent=copy[lang].error;}
