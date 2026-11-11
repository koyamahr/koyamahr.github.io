(() => {
  'use strict';
  const books = window.NOTEBOOKS.notebooks;
  const $ = id => document.getElementById(id);
  let group='all';
  const countPages=items=>items.reduce((n,b)=>n+b.frames.length,0);
  $('book-total').textContent=String(books.length).padStart(2,'0');
  $('page-total').textContent=countPages(books).toLocaleString('ja-JP');
  const preferred=[books.find(b=>b.id==='n060'),books.find(b=>b.id==='n087'),books.find(b=>b.id==='n049')].filter(Boolean);
  const featured=preferred.length ? preferred : books.slice(0,3);
  featured.forEach(b=>{const im=document.createElement('img');im.src=b.frames[0].thumb;im.alt='';$('library-collage').append(im);});
  function render(){
    const query=$('search').value.trim().toLocaleLowerCase();
    const shown=books.filter(b=>(group==='all'||b.group===group)&&`${b.display_title} ${b.source} ${b.lecture_title||''} ${b.lecturer||''} ${b.lecture_year||''}`.toLocaleLowerCase().includes(query));
    $('result-count').textContent=`${shown.length} 冊 / ${countPages(shown).toLocaleString('ja-JP')} ページ`;
    const grid=$('library-grid');grid.replaceChildren();
    for(const b of shown){
      const link=document.createElement('a');link.className='notebook-card';link.href=`notebook.html?id=${encodeURIComponent(b.id)}`;
      const cover=document.createElement('div');cover.className='cover';
      const im=document.createElement('img');im.src=b.frames[0].thumb;im.alt='';im.loading='lazy';cover.append(im);
      const copy=document.createElement('div');copy.className='card-copy';
      const small=document.createElement('small');small.textContent=`${b.group.toUpperCase()} / ${b.id.toUpperCase()}`;
      const title=document.createElement('h2');title.textContent=b.lecture_title||b.display_title;
      const source=document.createElement('p');source.className='original-name';source.textContent=b.source.split('/').pop();
      const meta=document.createElement('div');meta.className='card-meta';
      const status=document.createElement('span');status.textContent=`${b.lecturer||'講師未確認'} / ${b.lecture_year?b.lecture_year+'年'+(b.metadata_status==='from_original'?'（仮）':''):'年未確認'}`;
      const count=document.createElement('span');count.textContent=`${b.frames.length} ページ ↗`;
      meta.append(status,count);copy.append(small,title,source,meta);link.append(cover,copy);grid.append(link);
    }
    if(!shown.length){const p=document.createElement('p');p.className='empty-results';p.textContent='一致するノートがありません。検索語を変えてください。';grid.append(p);}
    document.querySelectorAll('[data-group]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.group===group)));
  }
  document.querySelectorAll('[data-group]').forEach(b=>b.addEventListener('click',()=>{group=b.dataset.group;render();}));
  $('search').addEventListener('input',render);render();
})();
