(() => {
  const copy={ja:{title:'小山 洋 | 写真ポートフォリオ',description:'小山洋の写真ポートフォリオ。鳥、花と虫、空の光、街の形、観測の現場。'},en:{title:'Hiroshi Koyama | Photography portfolio',description:'Selected photographs by Hiroshi Koyama: nature, light, architecture and the observatory.'}};
  let lang='ja';
  const links=[...document.querySelectorAll('[data-view]')];
  const viewer=document.querySelector('#viewer');
  let current=0;
  const label=(ja,en)=>lang==='en'?en:ja;
  function showPhoto(index){
    current=(index+links.length)%links.length;
    const link=links[current],figure=link.closest('figure');
    viewer.dataset.photo=link.dataset.view;
    viewer.querySelector('img').src=link.href;
    viewer.querySelector('img').alt=link.querySelector('img').alt;
    viewer.querySelector('#viewer-title').textContent=figure.querySelector('h3').textContent;
    viewer.querySelector('.viewer-meta').textContent=figure.querySelector('details p').textContent;
    viewer.querySelector('.viewer-count').textContent=`${current+1} / ${links.length}`;
  }
  function setLanguage(next,save=false){
    lang=next;
    document.documentElement.lang=lang;
    document.title=copy[lang].title;
    document.querySelector('meta[name=description]').content=copy[lang].description;
    document.querySelector('meta[property="og:title"]').content=copy[lang].title;
    document.querySelector('meta[property="og:description"]').content=copy[lang].description;
    document.querySelectorAll('[data-ja][data-en]').forEach(el=>el.textContent=el.dataset[lang]);
    document.querySelectorAll('[data-alt-ja]').forEach(el=>el.alt=el.dataset[lang==='ja'?'altJa':'altEn']);
    links.forEach(el=>el.setAttribute('aria-label',el.closest('figure').querySelector('h3').textContent));
    document.querySelectorAll('[data-lang]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.lang===lang)));
    document.querySelectorAll('[data-home],[data-series]').forEach(el=>{const url=new URL(el.href);url.searchParams.set('lang',lang);el.href=url;});
    const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url);
    if(save){try{localStorage.setItem('koyamarium.home.language',lang);}catch{}}
    if(viewer.open)showPhoto(current);
  }
  let saved;try{saved=localStorage.getItem('koyamarium.home.language');}catch{}
  const requested=new URLSearchParams(location.search).get('lang');
  setLanguage(['ja','en'].includes(requested)?requested:saved==='en'?'en':'ja');
  document.querySelector('.languages').hidden=false;
  document.querySelectorAll('[data-lang]').forEach(button=>button.addEventListener('click',()=>setLanguage(button.dataset.lang,true)));
  if(!viewer.showModal)return;
  links.forEach((link,i)=>link.addEventListener('click',event=>{event.preventDefault();showPhoto(i);viewer.showModal();}));
  viewer.querySelector('[data-close]').addEventListener('click',()=>viewer.close());
  viewer.querySelector('[data-prev]').addEventListener('click',()=>showPhoto(current-1));
  viewer.querySelector('[data-next]').addEventListener('click',()=>showPhoto(current+1));
  viewer.addEventListener('click',event=>{if(event.target===viewer)viewer.close();});
  viewer.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();showPhoto(current+1);}if(event.key==='ArrowLeft'){event.preventDefault();showPhoto(current-1);}});
})();
