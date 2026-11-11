(() => {
  'use strict';
  const pages = [
    ['状態ベクトルと光量子', 'Apr. 14（年の記載なし）'],
    ['物質波と波束', 'Apr. 21（年の記載なし）'],
    ['波の確率解釈', '93.4.21'],
    ['デルタ関数と期待値', '93.4.21'],
    ['物理量と演算子', '93.4.21']
  ];
  const $ = id => document.getElementById(id);
  let page = 3, mode = 'clean';
  function render() {
    const number = String(page).padStart(2, '0');
    const [title, date] = pages[page - 1];
    $('page-title').textContent = title;
    $('page-kicker').textContent = `ORIGINAL PAGE ${number}`;
    $('page-date').textContent = `原本の日付：${date}`;
    $('page-select').value = String(page);
    $('original-image').src = `assets/quantum-a/original/${number}.png`;
    $('clean-image').src = `assets/quantum-a/clean/${number}.png`;
    $('original-image').alt = `量子力学A 原本${page}ページ目：${title}`;
    $('clean-image').alt = `量子力学A 整形版${page}ページ目：${title}`;
    $('original-panel').hidden = mode === 'clean';
    $('clean-panel').hidden = mode === 'original';
    $('image-panels').classList.toggle('compare', mode === 'compare');
    $('image-link').href = `assets/quantum-a/${mode === 'original' ? 'original' : 'clean'}/${number}.png`;
    $('prev').disabled = page === 1;
    $('next').disabled = page === pages.length;
    document.querySelectorAll('[data-page]').forEach(b => {
      if (Number(b.dataset.page) === page) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
    document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
    $('reader-status').textContent = `${page}ページ目：${title}。${mode === 'compare' ? '左右比較' : mode === 'clean' ? '整形版' : '原本'}を表示中。`;
  }
  function choose(n, updateHash = true) {
    if (!Number.isInteger(n) || n < 1 || n > pages.length) return;
    page = n;
    render();
    $('image-viewport').scrollTo(0, 0);
    if (updateHash) history.replaceState(null, '', `#page-${page}`);
  }
  document.querySelectorAll('[data-page]').forEach(b => b.addEventListener('click', () => choose(Number(b.dataset.page))));
  document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => {
    mode = b.dataset.mode; render(); $('image-viewport').scrollTo(0, 0);
  }));
  $('prev').addEventListener('click', () => choose(page - 1));
  $('next').addEventListener('click', () => choose(page + 1));
  $('page-select').addEventListener('change', event => choose(Number(event.target.value)));
  $('zoom').addEventListener('input', event => {
    $('image-panels').style.setProperty('--zoom', `${event.target.value}%`);
    $('zoom-label').textContent = `${event.target.value}%`;
  });
  $('image-viewport').addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); choose(page + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  for (const [id, target] of [['source-link', 3], ['continuation-link', 4]]) {
    $(id).addEventListener('click', event => {
      event.preventDefault(); choose(target); $('reader').scrollIntoView({block:'start'});
      $('image-viewport').focus({preventScroll:true});
    });
  }
  function fromHash(scroll) {
    const match = /^#page-([1-5])$/.exec(location.hash);
    if (match) { choose(Number(match[1]), false); if (scroll) $('reader').scrollIntoView({block:'start'}); }
  }
  window.addEventListener('hashchange', () => fromHash(true));
  render(); fromHash(true);
})();
