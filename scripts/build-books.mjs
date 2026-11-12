import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const {books} = JSON.parse(readFileSync(resolve(root, 'books/catalog.json'), 'utf8'));
const escape = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const text = (ja, en, tag='span', extra='') => `<${tag} data-book-ja="${escape(ja)}" data-book-en="${escape(en)}"${extra}>${escape(ja)}</${tag}>`;
const ids = new Set();
for (const book of books) {
  if (!/^[a-z0-9-]+$/.test(book.id) || ids.has(book.id)) throw Error('Invalid or duplicate book id');
  ids.add(book.id);
  if (!['published','upcoming'].includes(book.status)) throw Error('Invalid publication status');
  if (!book.cover.startsWith('/books/covers/') || !existsSync(resolve(root, '.'+book.cover))) throw Error('Missing cover');
  if (book.status === 'published' && !/^[A-Z0-9]{10}$/.test(book.asin || '')) throw Error('Published books need a valid ASIN');
  for (const key of ['genre','teaser']) for (const lang of ['ja','en']) if (!book[key]?.[lang]) throw Error(`Missing ${key}/${lang}`);
  if (!book.description.ja.length || book.description.ja.length !== book.description.en.length) throw Error('Descriptions must have both languages');
}
const badge = book => text(book.status === 'published' ? 'Kindle版・販売中' : 'To be published', book.status === 'published' ? 'Kindle edition · Published' : 'To be published', 'span', ` class="book-status ${book.status}"`);
const cover = (book,lazy=true) => `<img class="book-cover" src="${escape(book.cover)}" alt="${escape(book.title)} 表紙" width="600" height="960"${lazy?' loading="lazy"':''}>`;
function detail(book) {
  const actions = [];
  if (book.status === 'published') actions.push(`<a class="book-amazon" href="https://www.amazon.co.jp/dp/${book.asin}" rel="noopener noreferrer">${text('Amazonで試し読み・購入','Read a sample / buy on Amazon')} <span aria-hidden="true">↗</span></a>`);
  if (book.related) actions.push(`<a class="book-related" href="${escape(book.related.url)}">${text(book.related.ja, book.related.en)} <span aria-hidden="true">↗</span></a>`);
  return `<article class="book-detail" id="${book.id}">
    ${cover(book,book.status!=='published')}
    <div class="book-copy">${text(book.genre.ja,book.genre.en,'p',' class="book-genre"')}
      ${badge(book)}<h3 lang="ja">${escape(book.title)}</h3>
      <p class="book-subtitle" lang="ja">${escape(book.subtitle)}</p>
      ${text(book.status==='published'?'小山 洋 著 · 日本語 · Kindle版':'小山 洋 著 · 日本語 · Kindle版 · 発売日未定',book.status==='published'?'Hiroshi Koyama · Japanese-language Kindle edition':'Hiroshi Koyama · Japanese-language Kindle edition · Publication date TBA','p',' class="book-meta"')}
      <div class="book-description">${book.description.ja.map((ja,index)=>text(ja,book.description.en[index],'p')).join('\n')}</div>
      ${actions.length?`<div class="book-actions">${actions.join('\n')}</div>`:''}
    </div>
  </article>`;
}
const groups = [['published','販売中','Published'],['upcoming','刊行予定','To be published']].map(([status,ja,en])=>{
  const selected=books.filter(book=>book.status===status);
  return selected.length?`<section class="books-section" aria-labelledby="${status}-title">${text(ja,en,'h2',` class="books-section-heading" id="${status}-title"`)}${selected.map(detail).join('\n')}</section>`:'';
}).join('\n');
const page = `<!doctype html>
<html lang="ja"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>著書・Kindle本 | 小山 洋</title>
  <meta name="description" content="小山 洋の著書と刊行予定のKindle本。宇宙人マニュアル、ポスドクは投資しろ、理論天文学の道具箱 入門編。">
  <link rel="canonical" href="https://koyamarium.github.io/books/">
  <meta property="og:title" content="著書・Kindle本 | 小山 洋"><meta property="og:type" content="website">
  <meta property="og:description" content="物理の式から、空想や研究者の暮らしまで。著書と刊行予定の本をご紹介します。">
  <meta property="og:url" content="https://koyamarium.github.io/books/"><meta property="og:image" content="https://koyamarium.github.io/books/covers/alien-manual.jpg">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/books/books.css">
  <script src="/books/books.js" defer></script>
<style id="rights-notice-style">.rights-notice{display:block;box-sizing:border-box;max-width:1240px;width:100%;margin:32px auto 0;padding:20px 24px;border-top:1px solid #c8c4ba;color:#56564e;background:transparent;font:13px/1.7 system-ui,sans-serif}.rights-notice p{display:flex;flex-wrap:wrap;gap:8px 24px;margin:0!important}.rights-notice a{color:inherit;text-underline-offset:3px}.rights-notice span{overflow-wrap:anywhere}</style></head><body class="books-page"><div class="books-wrap">
  <header class="books-header"><a class="books-identity" data-books-link href="/?lang=ja">Hiroshi Koyama</a><div class="books-language" role="group" aria-label="言語 / Language" hidden><button type="button" data-books-lang="ja" lang="ja" aria-pressed="true">日本語</button><button type="button" data-books-lang="en" lang="en" aria-pressed="false">English</button></div></header>
  <main><section class="books-intro"><p class="books-eyebrow">BOOKS BY HIROSHI KOYAMA</p>${text('著書・Kindle本','Books','h1')}${text('物理の式から、空想や研究者の暮らしまで。小山 洋の著書と刊行予定の本を紹介します。','From physical equations to imagined worlds and life in research. Published and forthcoming books by Hiroshi Koyama.','p')}</section>
  ${groups}</main>
  <footer class="books-footer"><span>小山 洋 / Hiroshi Koyama</span><a data-books-link href="/?lang=ja">${text('トップページへ','Back to home')}</a></footer>
</div><footer class="rights-notice" aria-label="利用条件 / Licensing"><p><a href="https://koyamarium.github.io/rights/">利用条件 / Rights &amp; reuse</a><span>Original code: MIT · Text, figures &amp; photos: separate terms</span></p><p class="ai-credit" lang="en" style="font:11px/1.6 system-ui,sans-serif;opacity:.8;margin:0;padding-top:6px;flex-basis:100%;max-width:100%;overflow-wrap:anywhere">Website development · Built with assistance from ChatGPT and Codex.</p></footer></body></html>\n`;
writeFileSync(resolve(root,'books/index.html'),page);
console.log(`Built /books/: ${books.length} books`);
