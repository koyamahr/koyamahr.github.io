(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const id=new URLSearchParams(location.search).get('id')||'n060';
 const book=window.NOTEBOOKS.notebooks.find(b=>b.id===id);
 if(!book){$('book-main').replaceChildren();const box=document.createElement('section');box.className='book-error';const p=document.createElement('p');p.textContent='このノートは見つかりませんでした。';const a=document.createElement('a');a.href='index.html';a.textContent='書庫一覧へ戻る';box.append(p,a);$('book-main').append(box);return;}
 const frames=book.frames;let current=0;
 document.title=`${book.lecture_title||book.display_title}${book.lecturer?' / '+book.lecturer:''} | 大学ノート`;
 $('book-title').textContent=book.lecture_title||book.display_title;$('book-id').textContent=`NOTE / ${book.id.toUpperCase()}`;
 $('book-source').textContent=`保存元：${book.source}`;$('book-group').textContent=book.group;
 const summary=document.createElement('p');summary.className='source-name';summary.textContent=`講師名：${book.lecturer||'未確認'}　／　年：${book.lecture_year?book.lecture_year+'年':'未確認'}${book.lecture_year&&book.metadata_status==='from_original'?'　（原本から仮入力）':''}`;$('book-source').after(summary);
 $('book-count').textContent=`収録 ${frames.length} ページ / 原本 ${book.source_pages} ページ`;
 $('page-count').textContent=String(frames.length).padStart(2,'0');$('book-pdf').href=book.pdf;
 $('lecture-title').textContent=book.lecture_title||'未確認';$('lecturer').textContent=book.lecturer||'未確認';
 $('lecture-year').textContent=book.lecture_year?`${book.lecture_year}年${book.metadata_status==='from_original'?'（原本の日付から仮入力）':''}`:'未確認';
 $('lecture-period').textContent=book.lecture_period||'—';$('lecture-notes').textContent=book.notes||'—';
 $('metadata-explanation').textContent=(book.metadata_sources||[]).some(s=>s.source==='user')?'ノート作成者が確認した情報を反映しています。原本の日付から仮入力した年は、その旨を併記しています。':(book.metadata_sources||[]).some(s=>s.source==='related_handout')?'対応する配布プリントの記載から講師名を転記しています。フルネームが確認できていないものは姓のみを表示しています。':book.metadata_status==='from_original'?'原本の見出し・氏名・日付から仮入力しています。正式な講義情報は、確認できたものから更新します。':'講義名・講師名・年は、確認できたものから追記します。';
 const fieldNames={lecture_title:'講義名',lecturer:'講師名',lecture_year:'年'};
 for(const s of book.metadata_sources||[]){const li=document.createElement('li');if(s.source==='user'){li.textContent=`${fieldNames[s.field]||s.field}：作成者の確認「${s.value}」`;}else if(s.source==='related_handout'){li.textContent=`${fieldNames[s.field]||s.field}：配布プリント「${s.source_label}」p.${s.source_pages.join('・')}の記載「${s.excerpt}」から転記（姓のみ）`;}else{li.textContent=`${fieldNames[s.field]||s.field}：原本 p.${s.source_pages.join('・')}「${s.excerpt}」`;if(s.source_pages.some(p=>!frames.some(f=>f.source_page===p)))li.textContent+='（該当ページは閲覧版未収録）';}$('metadata-sources').append(li);}
 $('selection-note').textContent=frames.length===book.source_pages?'原本のページ順で収録しています。':'原本の一部を収録。ページ番号は原本に対応します。';
 const buttons=[];
 frames.forEach((f,i)=>{
  const li=document.createElement('li');const b=document.createElement('button');b.type='button';
  const im=document.createElement('img');im.src=f.thumb;im.alt='';im.loading='lazy';
  const text=document.createElement('span');const small=document.createElement('small');small.textContent=String(i+1).padStart(2,'0');
  const strong=document.createElement('strong');strong.textContent=`原本 p.${f.source_page}`;text.append(small,strong);b.append(im,text);
  b.addEventListener('click',()=>choose(i));li.append(b);$('page-list').append(li);buttons.push(b);
  const opt=document.createElement('option');opt.value=String(i);opt.textContent=`原本 p.${f.source_page}（${i+1}/${frames.length}）`;$('page-select').append(opt);
 });
 function render(){const f=frames[current];$('page-image').src=f.image;$('page-image').alt=`${book.display_title} 原本${f.source_page}ページ目`;$('image-link').href=f.image;
  $('page-kicker').textContent=`ORIGINAL PAGE ${String(f.source_page).padStart(2,'0')}${f.redacted?' / 個人情報をマスク':''}`;$('page-title').textContent=`原本 p.${f.source_page} / 収録 ${current+1} of ${frames.length}`;
  $('page-select').value=String(current);$('prev').disabled=current===0;$('next').disabled=current===frames.length-1;
  buttons.forEach((b,i)=>{if(i===current)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  $('reader-status').textContent=`原本${f.source_page}ページ目を表示中。`;
 }
 function choose(i,hash=true){if(!Number.isInteger(i)||i<0||i>=frames.length)return;current=i;render();$('image-viewport').scrollTo(0,0);if(hash)history.replaceState(null,'',`#p${frames[current].source_page}`);}
 $('prev').addEventListener('click',()=>choose(current-1));$('next').addEventListener('click',()=>choose(current+1));$('page-select').addEventListener('change',e=>choose(Number(e.target.value)));
 $('zoom').addEventListener('input',e=>{$('image-panels').style.setProperty('--zoom',`${e.target.value}%`);$('zoom-label').textContent=`${e.target.value}%`;});
 $('image-viewport').addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();choose(current+(e.key==='ArrowRight'?1:-1));}});
 function hash(){const match=/^#p(\d+)$/.exec(location.hash);if(match){const i=frames.findIndex(f=>f.source_page===Number(match[1]));if(i>=0)choose(i,false);}}
 window.addEventListener('hashchange',hash);render();hash();
})();
