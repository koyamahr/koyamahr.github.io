(() => {
  const supported = value => value === 'ja' || value === 'en';
  function renderLanguage() {
    const lang = document.documentElement.lang === 'en' ? 'en' : 'ja';
    document.querySelectorAll('[data-book-ja][data-book-en]').forEach(element => {
      element.textContent = element.getAttribute(`data-book-${lang}`);
    });
    document.querySelectorAll('[data-books-link]').forEach(link => {
      const url = new URL(link.getAttribute('href'), location.href);
      url.searchParams.set('lang', lang);
      link.setAttribute('href', `${url.pathname}${url.search}${url.hash}`);
    });
    document.querySelectorAll('[data-books-lang]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.booksLang === lang));
    });
    if (document.body.classList.contains('books-page')) {
      document.title = lang === 'en' ? 'Books | Hiroshi Koyama' : '著書・Kindle本 | 小山 洋';
    }
  }
  if (document.body.classList.contains('books-page')) {
    let saved;
    try { saved = localStorage.getItem('koyamarium.home.language'); } catch {}
    const requested = new URL(location.href).searchParams.get('lang');
    document.documentElement.lang = supported(requested) ? requested : saved === 'en' ? 'en' : 'ja';
    document.querySelector('.books-language').hidden = false;
    document.querySelectorAll('[data-books-lang]').forEach(button => button.addEventListener('click', () => {
      const lang = button.dataset.booksLang;
      document.documentElement.lang = lang;
      const url = new URL(location.href);
      url.searchParams.set('lang', lang);
      history.replaceState(null, '', url);
      try { localStorage.setItem('koyamarium.home.language', lang); } catch {}
      renderLanguage();
    }));
  }
  renderLanguage();
  new MutationObserver(renderLanguage).observe(document.documentElement, {attributes:true, attributeFilter:['lang']});
})();
