import { makePrompt, parseResearch, exampleResearch, manualResearch, asRoute, resultText, encodeResult, decodeResult, validateResearch } from './research-model.mjs';

export function initBuilder(seed) {
  const $ = s=>document.querySelector(s);
  const esc = s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const storageKey='academic-roots.research.v1';
  const base=location.origin+location.pathname;
  let data=null,reviewed=new Set(),imageUrl=null,png=null,paintVersion=0;
  const smooth=()=>matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth';
  function requestValues(){return {name:$('#your-name').value,mentor:$('#your-mentor').value,affiliation:$('#your-school').value,year:$('#your-year').value,kind:$('#your-kind').value};}
  function download(blob,filename){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function save(){try{localStorage.setItem(storageKey,JSON.stringify({data,reviewed:[...reviewed]}));return true;}catch{return false;}}
  async function copy(text,status){
    try{await navigator.clipboard.writeText(text);$('#manual-copy').hidden=true;$('#result-status').textContent=status;}
    catch{$('#manual-copy').hidden=false;$('#copy-fallback').value=text;$('#copy-fallback').focus();$('#copy-fallback').select();$('#result-status').textContent='下の文章を選択してコピーしてください。';}
  }
  $('#research-request').addEventListener('submit',async event=>{
    event.preventDefault();$('#prompt-error').textContent='';
    try{
      const prompt=makePrompt(requestValues());$('#research-prompt').value=prompt;
      try{await navigator.clipboard.writeText(prompt);$('#prompt-status').textContent='依頼文をコピーしました。Web検索できるAIに貼り付けてください。回答をもらったら、このページに戻って貼り付けます。';}
      catch{$('#prompt-details').open=true;$('#research-prompt').focus();$('#research-prompt').select();$('#prompt-status').textContent='下の依頼文を選択してコピーしてください。';}
    }catch(e){$('#prompt-error').textContent=e.message;}
  });
  function wrap(ctx,text,width){const lines=[];let line='';for(const c of text){if(line && ctx.measureText(line+c).width>width){lines.push(line);line=c;}else line+=c;}if(line)lines.push(line);return lines;}
  function paint(route){
    const c=document.createElement('canvas');c.width=1000;
    const ctx=c.getContext('2d');
    ctx.font='28px sans-serif';
    const personLines=route.people.map(p=>wrap(ctx,p.name,680));
    const heights=personLines.map(lines=>Math.max(110,lines.length*34+62));
    c.height=310+heights.reduce((a,b)=>a+b,0)+route.people.length*24+112;
    ctx.fillStyle='#f6f4ed';ctx.fillRect(0,0,c.width,c.height);
    ctx.fillStyle='#426750';ctx.font='26px Georgia, serif';ctx.fillText('Academic Roots',64,61);
    ctx.strokeStyle='#cfd6c8';ctx.beginPath();ctx.moveTo(64,88);ctx.lineTo(936,88);ctx.stroke();
    ctx.fillStyle='#203b32';ctx.font='32px sans-serif';
    const title=route.people[0].name.length>20?'わたしの学術系譜':route.people[0].name+'の学術系譜';ctx.fillText(title,64,142);
    ctx.font='25px sans-serif';wrap(ctx,`${route.people.at(-1).name}まで、${route.steps}段階。`,855).slice(0,3).forEach((s,i)=>ctx.fillText(s,64,191+i*31));
    let y=284;
    route.people.forEach((p,i)=>{
      const edge=route.edges[i-1],last=i===route.people.length-1,h=heights[i];
      if(i){ctx.strokeStyle='#94632f';ctx.setLineDash(edge.status==='creator_reviewed'?[]:[5,4]);ctx.beginPath();ctx.moveTo(100,y-24);ctx.lineTo(100,y);ctx.stroke();ctx.setLineDash([]);}
      ctx.fillStyle=last?'#203b32':'#fdfcf7';ctx.fillRect(64,y,872,h);ctx.strokeStyle='#cfd6c8';ctx.strokeRect(64,y,872,h);
      ctx.fillStyle=last?'#d2dccb':'#68736a';ctx.font='18px sans-serif';ctx.fillText(i?String(i).padStart(2,'0'):'起点',85,y+39);
      ctx.font='28px sans-serif';ctx.fillStyle=last?'#f6f4ed':'#203b32';personLines[i].forEach((s,j)=>ctx.fillText(s,164,y+38+j*34));
      ctx.font='16px sans-serif';ctx.fillStyle=last?'#d2dccb':'#68736a';ctx.fillText(edge?`${edge.label} · ${edge.statusLabel}`:'作成者が入力した起点',164,y+h-17);
      y+=h+24;
    });
    ctx.fillStyle='#68736a';ctx.font='17px sans-serif';ctx.fillText(`作成者の出典確認：${route.checked}関係 ／ その他：${route.steps-route.checked}関係`,64,y+15);
    ctx.font='15px sans-serif';ctx.fillText('博士指導・研究指導などを含む系譜です。サイトによる独立検証ではありません。',64,y+44);
    ctx.fillStyle='#426750';ctx.fillText('自分のAIで調べて、自分のルーツへ。',64,y+74);
    return c;
  }
  async function refreshCard(route){
    const version=++paintVersion;png=null;$('#copy-image').disabled=true;$('#download-png').disabled=true;
    await document.fonts.ready;if(version!==paintVersion)return;
    const canvas=paint(route),blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(version!==paintVersion || !blob)return;
    if(imageUrl)URL.revokeObjectURL(imageUrl);imageUrl=URL.createObjectURL(blob);png=blob;
    const img=$('#card-preview');img.src=imageUrl;img.width=canvas.width;img.height=canvas.height;img.alt=route.people.map(p=>p.name).join(' → ')+`。${route.steps}段階の学術系譜。`;
    $('#copy-image').disabled=false;$('#download-png').disabled=false;
  }
  function render(scroll=false){
    const route=asRoute(data,[...reviewed]);$('#your-result').hidden=false;
    $('#result-title').textContent=data.people[0].name+'の学術系譜';
    $('#result-summary').textContent=`${data.people.at(-1).name}まで${route.steps}段階。作成者が出典を確認：${route.checked}関係 ／ 申告・未確認：${route.steps-route.checked}関係。`;
    $('#your-route').innerHTML=route.people.map((p,i)=>`<li><span class="route-position">${i?String(i).padStart(2,'0'):'起点'}</span><div><strong>${esc(p.name)}</strong><span class="route-relation">${i?esc(route.edges[i-1].label+' · '+route.edges[i-1].statusLabel):esc(p.affiliation || 'あなたの出発点')}</span></div></li>`).join('');
    $('#your-evidence').innerHTML=route.edges.map((e,i)=>`<article class="review-edge"><div class="review-edge-heading"><h5>${esc(route.people[i].name)} → ${esc(route.people[i+1].name)}</h5><span class="badge ${e.status==='creator_reviewed'?'':'self'}">${esc(e.statusLabel)}</span></div><p>${esc(e.label)}${e.period?' ／ '+esc(e.period):''}</p><p>${esc(e.evidence)}</p><div class="review-sources">${e.sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a>`).join('') || '<span class="field-help">公開出典なし</span>'}</div>${e.basis==='public_source'?`<label class="review-check"><input type="checkbox" data-review="${i}" ${reviewed.has(i)?'checked':''}><span>元資料を読み、この関係を示す記述を確認した</span></label>`:e.basis==='hypothesis'?'<p class="hypothesis-note">推測を含む候補です。根拠が得られたら取り込み内容を修正してください。</p>':'<p class="field-help">本人・作成者の申告として保持します。</p>'}</article>`).join('');
    $('#unresolved').hidden=!data.unresolved.length;$('#unresolved').innerHTML='<b>まだ分からないところ</b>'+data.unresolved.map(u=>`<p>${esc(data.people.find(p=>p.id===u.personId).name)}：${esc(u.note)}</p>`).join('');
    const fileMode=location.protocol==='file:';
    $('#copy-personal-link').disabled=fileMode;
    $('#local-link-note').hidden=!fileMode && !['localhost','127.0.0.1'].includes(location.hostname);
    $('#local-link-note').textContent=fileMode?'この保存版ではリンク共有は使えません。文章・画像・データ保存で系譜を渡せます。':'この非公開プレビューのリンクは、同じ端末での再現用です。ほかの人に渡す場合は文章・画像・データ保存を使ってください。';
    refreshCard(route);if(scroll)$('#your-result').scrollIntoView({block:'start',behavior:smooth()});
  }
  function accept(next,message,scroll=true){
    data=validateResearch(next);reviewed=new Set();$('#research-answer').value=JSON.stringify(data,null,2);render(scroll);
    const saved=save();$('#result-status').textContent=message+(saved?' このブラウザに保存しました。':' 自動保存は利用できません。データを保存してください。');
  }
  $('#research-import').addEventListener('submit',event=>{
    event.preventDefault();$('#import-error').textContent='';
    try{const next=parseResearch($('#research-answer').value);accept(next,'回答を取り込みました。関係と出典を確認してください。');}
    catch(e){$('#import-error').textContent=e.message;}
  });
  $('#load-example').disabled=!seed;
  $('#load-example').addEventListener('click',()=>{if(seed){$('#import-error').textContent='';accept(exampleResearch(seed),'小山の完成例を取り込みました。取り込み時の表示を試すため、公開資料のある関係も確認前に戻しています。');}});
  $('#manual-form').addEventListener('submit',event=>{
    event.preventDefault();$('#manual-error').textContent='';try{accept(manualResearch({name:$('#manual-name').value,kind:'research'},$('#manual-ancestors').value),'手入力した系譜を作成しました。関係は作成者の申告です。');}catch(e){$('#manual-error').textContent=e.message;}
  });
  $('#your-evidence').addEventListener('change',event=>{
    const input=event.target.closest('[data-review]');if(!input || !data)return;
    const i=Number(input.dataset.review);input.checked?reviewed.add(i):reviewed.delete(i);
    const edge=asRoute(data,[...reviewed]).edges[i];input.closest('article').querySelector('.badge').textContent=edge.statusLabel;input.closest('article').querySelector('.badge').classList.toggle('self',edge.status!=='creator_reviewed');
    const focused=i;render();$(`[data-review="${focused}"]`)?.focus({preventScroll:true});save();$('#result-status').textContent='作成者による確認状況を更新しました。';
  });
  $('#copy-text').addEventListener('click',()=>{if(data)copy(resultText(data,[...reviewed]),'系譜の文章と出典をコピーしました。');});
  $('#copy-personal-link').addEventListener('click',()=>{if(!data || location.protocol==='file:')return;try{copy(base+encodeResult(data),'再現用リンクをコピーしました。共有先では出典確認のチェックは引き継ぎません。');}catch(e){$('#result-status').textContent=e.message;}});
  $('#download-json').addEventListener('click',()=>{if(data){download(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),'my-academic-roots.json');$('#result-status').textContent='系譜のデータ保存を開始しました。';}});
  $('#edit-result').addEventListener('click',()=>{$('#research-answer').focus();$('#research-import').scrollIntoView({block:'center',behavior:smooth()});$('#result-status').textContent='回答欄の名前・関係・根拠を修正して、もう一度取り込めます。';});
  $('#copy-image').addEventListener('click',async()=>{if(!png)return;try{await navigator.clipboard.write([new ClipboardItem({'image/png':png})]);$('#result-status').textContent='画像をコピーしました。';}catch{$('#result-status').textContent='この環境では画像をコピーできません。「PNGで保存」を使ってください。';}});
  $('#download-png').addEventListener('click',()=>{if(png){download(png,'my-academic-roots.png');$('#result-status').textContent='PNG画像の保存を開始しました。';}});
  $('#reset-roots').addEventListener('click',()=>{
    data=null;reviewed.clear();++paintVersion;png=null;if(imageUrl)URL.revokeObjectURL(imageUrl);imageUrl=null;
    $('#card-preview').removeAttribute('src');$('#your-result').hidden=true;$('#research-request').reset();$('#research-import').reset();$('#manual-form').reset();$('#research-prompt').value='';
    for(const id of ['prompt-error','import-error','manual-error','result-status'])$('#'+id).textContent='';
    $('#prompt-status').textContent='コピーした依頼文を、普段使っているAIのチャットに貼ってください。';$('#prompt-details').open=false;
    try{localStorage.removeItem(storageKey);}catch{}
    history.replaceState(null,'','#create');$('#your-name').focus();
  });
  function readShared(){
    if(!location.hash.startsWith('#research='))return false;
    try{accept(decodeResult(location.hash),'共有された系譜を開きました。出典の内容は未確認です。');}catch(e){$('#import-error').textContent=e.message;$('#create').scrollIntoView({block:'start'});}return true;
  }
  window.addEventListener('hashchange',readShared);
  if(!readShared()){
    try{const saved=JSON.parse(localStorage.getItem(storageKey));if(saved?.data){data=validateResearch(saved.data);reviewed=new Set(Array.isArray(saved.reviewed)?saved.reviewed.filter(i=>Number.isInteger(i) && data.relationships[i]?.basis==='public_source'):[]);$('#research-answer').value=JSON.stringify(data,null,2);render();$('#result-status').textContent='このブラウザに保存された系譜を復元しました。';}}catch{}
    if(location.hash==='#create')$('#create').scrollIntoView({block:'start'});
  }
  // Only enable submission after every local handler is attached. Inputs have no
  // name attributes, so a native form fallback cannot put personal data in a URL.
  document.querySelectorAll('#create button[type="submit"]').forEach(button=>button.disabled=false);
}
