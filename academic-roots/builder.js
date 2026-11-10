import { buildRoute, decodeDraft, encodeDraft, RELATIONS, routeText } from './builder-model.mjs?v=2';

export function initBuilder(seedData) {
  const seed = seedData || {people:[], edges:[], sources:[]};
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const form = $('#roots-form');
  const storageKey = 'academic-roots.draft.v1';
  const base = $('link[rel=canonical]').href;
  let current = null, png = null, imageUrl = null, renderVersion = 0;
  $('#create').hidden = false;
  $('#your-mentor').insertAdjacentHTML('beforeend', seed.people.map((person, i) => `<option value="${person.id}">${esc(person.name)} → 湯川秀樹まで${seed.people.length-i-1}ステップ</option>`).join(''));
  $('#your-relation').innerHTML = RELATIONS.map(relation => `<option>${esc(relation)}</option>`).join('');
  function mode() {
    const manual = form.elements.mode.value === 'manual';
    $('#existing-fields').hidden = manual;
    $('#manual-fields').hidden = !manual;
    $('#your-mentor').required = !manual;
    $('#your-ancestors').required = manual;
    $('#your-mentor').disabled = manual;
    $('#your-ancestors').disabled = !manual;
    document.querySelectorAll('.mode-choice').forEach(label => label.classList.toggle('selected', label.querySelector('input').checked));
  }
  function values() {
    return {v:1, name:form.elements.personName.value, mode:form.elements.mode.value, mentor:form.elements.mentor.value, ancestors:form.elements.ancestors.value, relation:form.elements.relation.value, year:form.elements.year.value, source:form.elements.source.value};
  }
  function fill(draft) {
    for (const key of ['mode','mentor','ancestors','relation','year','source']) form.elements[key].value = draft[key];
    form.elements.personName.value = draft.name;
    mode();
  }
  document.querySelectorAll('input[name=mode]').forEach(input => input.addEventListener('change',mode));
  mode();

  function wrap(ctx, text, maxWidth) {
    const lines = []; let line = '';
    for (const char of text) {
      if (line && ctx.measureText(line+char).width > maxWidth) { lines.push(line); line = char; }
      else line += char;
    }
    if (line) lines.push(line);
    return lines;
  }
  function paint(route) {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 368 + route.people.length * 126;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f6f4ed';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#426750';ctx.font = '26px Georgia, serif';ctx.fillText('Academic Roots',64,60);
    ctx.strokeStyle = '#cfd6c8';ctx.beginPath();ctx.moveTo(64,86);ctx.lineTo(936,86);ctx.stroke();
    ctx.fillStyle = '#203b32';ctx.font = '32px sans-serif';
    const cardTitle = route.people[0].name.length > 26 ? 'わたしの学術系譜' : route.people[0].name+'の学術系譜';
    wrap(ctx,cardTitle,860).forEach((line,i)=>ctx.fillText(line,64,132+i*38));
    ctx.font = '22px sans-serif';
    const headline = wrap(ctx,route.people.at(-1).name+`まで、${route.steps}ステップ。`,860);
    headline.slice(0,2).forEach((line,i)=>ctx.fillText(line,64,207+i*27));
    route.people.forEach((person,index) => {
      const y = 256+index*126, last=index===route.people.length-1, edge=route.edges[index-1];
      if(index){ctx.strokeStyle=edge.status==='documented'?'#426750':'#94632f';ctx.setLineDash(edge.status==='documented'?[]:[5,4]);ctx.beginPath();ctx.moveTo(100,y-18);ctx.lineTo(100,y);ctx.stroke();ctx.setLineDash([]);}
      ctx.fillStyle=last?'#203b32':'#fdfcf7';ctx.fillRect(64,y,872,108);ctx.strokeStyle='#cfd6c8';ctx.strokeRect(64,y,872,108);
      ctx.fillStyle=last?'#d2dccb':'#68736a';ctx.font='18px sans-serif';ctx.fillText(index===0?'起点':String(index).padStart(2,'0'),85,y+40);
      ctx.font='27px sans-serif';
      if(ctx.measureText(person.name).width>1492)ctx.font='22px sans-serif';
      ctx.fillStyle=last?'#f6f4ed':'#203b32';
      const lines=wrap(ctx,person.name,746);lines.forEach((line,i)=>ctx.fillText(line,164,y+36+i*29));
      ctx.fillStyle=last?'#d2dccb':edge?.status==='documented'?'#426750':'#94632f';ctx.font='14px sans-serif';
      ctx.fillText(edge?`${edge.label} · ${edge.statusLabel}`:'作成者が入力した起点',164,y+93);
    });
    const bottom=canvas.height-91;
    ctx.fillStyle='#68736a';ctx.font='16px sans-serif';ctx.fillText(`公開資料で確認：${route.documented}関係 ／ 申告・未検証：${route.claimed}関係`,64,bottom);
    ctx.font='14px sans-serif';ctx.fillText('学術上の関係をたどる系譜です。全区間が博士論文指導を意味するわけではありません。',64,bottom+27);
    ctx.fillStyle='#426750';ctx.fillText('koyamahr.github.io/academic-roots/',64,bottom+57);
    return canvas;
  }
  async function render(route, message, scroll = true) {
    const version = ++renderVersion;
    current = route; png = null;
    $('#your-result').hidden = false;
    $('#result-title').textContent = route.people[0].name+'の学術系譜';
    $('#result-summary').textContent = `${route.people.at(-1).name}まで${route.steps}ステップ。公開資料で確認：${route.documented}関係、申告・未検証：${route.claimed}関係。`;
    $('#your-route').innerHTML = route.people.map((person,index) => `<li><span class="route-position">${index===0?'起点':String(index).padStart(2,'0')}</span><div><strong>${esc(person.name)}</strong>${index ? `<span class="route-relation">${esc(route.edges[index-1].label)} · ${esc(route.edges[index-1].statusLabel)}</span>` : '<span class="route-relation">あなたの起点</span>'}</div></li>`).join('');
    $('#your-evidence').innerHTML = route.edges.map((edge,index) => `<div><h4>${esc(route.people[index].name)} → ${esc(route.people[index+1].name)}</h4><p>${esc(edge.label)} ／ ${esc(edge.statusLabel)}<br>${esc(edge.period || '')}</p><p>${esc(edge.evidence)}</p>${edge.sources.map(source=>`<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)} ↗</a>`).join('')}</div>`).join('');
    $('#result-status').textContent = message;
    $('#manual-copy').hidden = true;
    $('#copy-image').disabled = true;
    $('#download-png').disabled = true;
    if(scroll) $('#your-result').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
    await document.fonts.ready;
    if(version!==renderVersion)return;
    const canvas = paint(route);
    const blob = await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    if(version!==renderVersion)return;
    if(!blob){$('#result-status').textContent='画像を作成できませんでした。文章またはリンクのコピーをご利用ください。';return;}
    png = blob;
    if(imageUrl)URL.revokeObjectURL(imageUrl);
    imageUrl=URL.createObjectURL(blob);
    $('#card-preview').src=imageUrl;
    $('#card-preview').alt=route.people.map(person=>person.name).join(' → ')+`。${route.steps}ステップの学術系譜カード`;
    $('#card-preview').width=canvas.width;$('#card-preview').height=canvas.height;
    $('#copy-image').disabled=false;
    $('#download-png').disabled=false;
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    $('#create-error').textContent='';
    try {
      const route=buildRoute(values(),seed);
      let message='系譜ができました。文章・画像・リンクをコピーできます。';
      try{localStorage.setItem(storageKey,JSON.stringify(route.draft));message+=' 入力はこのブラウザに保存しました。';}catch{message+=' 入力の自動保存は利用できません。再現用リンクを控えてください。';}
      history.replaceState(null,'',encodeDraft(route.draft));
      await render(route,message);
    }catch(error){$('#create-error').textContent=error.message;}
  });
  async function copyText(text, success) {
    try {await navigator.clipboard.writeText(text);$('#result-status').textContent=success;$('#manual-copy').hidden=true;}
    catch {$('#manual-copy').hidden=false;$('#copy-fallback').value=text;$('#copy-fallback').focus();$('#copy-fallback').select();$('#result-status').textContent='下の文章を選択してコピーしてください。';}
  }
  $('#copy-text').addEventListener('click',()=>{if(current)copyText(routeText(current,base),'系譜の文章と出典をコピーしました。そのまま貼り付けられます。');});
  $('#copy-personal-link').addEventListener('click',()=>{if(current)copyText(base+encodeDraft(current.draft),'系譜を再現できるリンクをコピーしました。');});
  $('#copy-image').addEventListener('click',async()=>{
    if(!png)return;
    try{
      await navigator.clipboard.write([new ClipboardItem({'image/png':png})]);
      $('#result-status').textContent='系譜の画像をコピーしました。画像を貼り付けられるアプリでペーストできます。';
    }catch{$('#result-status').textContent='この環境では画像をコピーできませんでした。「PNGで保存」をご利用ください。';}
  });
  $('#download-png').addEventListener('click',()=>{
    if(!imageUrl)return;
    const link=document.createElement('a');link.href=imageUrl;link.download='my-academic-roots.png';document.body.append(link);link.click();link.remove();
    $('#result-status').textContent='PNG画像の保存を開始しました。';
  });
  $('#reset-roots').addEventListener('click',()=>{
    form.reset();mode();current=null;png=null;++renderVersion;
    if(imageUrl){URL.revokeObjectURL(imageUrl);imageUrl=null;}
    $('#card-preview').removeAttribute('src');$('#your-result').hidden=true;$('#create-error').textContent='';
    try{localStorage.removeItem(storageKey);}catch{}
    history.replaceState(null,'','#create');$('#your-name').focus();
  });
  function loadShared() {
    if(!location.hash.startsWith('#roots='))return false;
    try{const draft=decodeDraft(location.hash,seed);fill(draft);render(buildRoute(draft,seed),'共有された系譜を復元しました。入力内容は作成者の申告です。');}
    catch(error){current=null;png=null;++renderVersion;$('#your-result').hidden=true;$('#create-error').textContent=error.message;$('#create').scrollIntoView({block:'start'});}
    return true;
  }
  window.addEventListener('hashchange',loadShared);
  if(!seed.people.length){form.elements.mode.value='manual';mode();}
  if(!loadShared()){
    try{const saved=localStorage.getItem(storageKey);if(saved){const draft=JSON.parse(saved);const route=buildRoute(draft,seed);fill(route.draft);render(route,'このブラウザに保存された前回の系譜を復元しました。',false);}}catch{}
    if(location.hash==='#create')$('#create').scrollIntoView({block:'start'});
  }
}
