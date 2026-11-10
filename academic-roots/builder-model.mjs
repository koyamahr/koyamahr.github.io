const RELATIONS = ['研究指導', '博士課程での研究指導', '修士課程での研究指導', 'ポスドクでの研究指導', 'その他の学術上の関係'];
export { RELATIONS };
const normalized = name => name.normalize('NFKC').replace(/[\s　]+/g, '').toLowerCase();
function name(value) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 60 || /[\u0000-\u001f\u007f]/.test(value)) throw Error('名前は1人につき60文字以内で入力してください。');
  return value.trim();
}
export function validateDraft(input, seed) {
  if (!input || input.v !== 1) throw Error('この共有データの形式には対応していません。');
  const draft = {v:1, name:name(input.name), mode:input.mode, mentor:'', ancestors:'', relation:input.relation, year:'', source:''};
  if (!RELATIONS.includes(draft.relation)) throw Error('関係の種類を選んでください。');
  if (typeof input.year !== 'string' || input.year.trim().length > 40 || /[\u0000-\u001f\u007f]/.test(input.year)) throw Error('年・期間は40文字以内で入力してください。');
  draft.year = input.year.trim();
  if (typeof input.source !== 'string' || input.source.length > 800) throw Error('出典URLは800文字以内で入力してください。');
  if (input.source.trim()) {
    let url;
    try { url = new URL(input.source.trim()); } catch { throw Error('出典には正しいURLを入力してください。'); }
    if (!['http:','https:'].includes(url.protocol) || url.username || url.password) throw Error('出典にはhttpまたはhttpsの公開URLを入力してください。');
    draft.source = url.href;
  }
  let upstreamNames;
  if (draft.mode === 'existing') {
    const index = seed.people.findIndex(person => person.id === input.mentor);
    if (index < 0) throw Error('つなぎたい指導教員を選んでください。');
    draft.mentor = seed.people[index].id;
    upstreamNames = seed.people.slice(index).map(person => person.name);
  } else if (draft.mode === 'manual') {
    if (typeof input.ancestors !== 'string' || input.ancestors.length > 900) throw Error('系譜は指導教員から順に、1行に1人ずつ入力してください。');
    const names = input.ancestors.split(/\r?\n/).filter(line => line.trim()).map(name);
    if (!names.length || names.length > 12) throw Error('指導教員から上の系譜を、1人から12人まで入力してください。');
    draft.ancestors = names.join('\n');
    upstreamNames = names;
  } else throw Error('系譜の作り方を選んでください。');
  const keys = [draft.name, ...upstreamNames].map(normalized);
  if (new Set(keys).size !== keys.length) throw Error('同じ名前が経路の中で重複しています。同姓同名の場合は、名前に所属などを添えて区別してください。');
  return draft;
}
export function buildRoute(input, seed) {
  const draft = validateDraft(input, seed);
  const first = {id:'visitor', name:draft.name, custom:true};
  let people, edges;
  const reported = (from, to, relation, year = '', url = '') => ({from, to, label:relation, period:year || '年・期間は未入力', status:'self_reported', statusLabel:url ? '作成者の申告・出典未検証' : '作成者の申告', evidence:'作成者が入力した学術上の関係です。このサイトで独立した検証は行っていません。', sources:url ? [{title:'作成者が添えた出典（未検証）', url}] : []});
  if (draft.mode === 'existing') {
    const start = seed.people.findIndex(person => person.id === draft.mentor);
    people = [first, ...seed.people.slice(start)];
    edges = [reported(first.id, people[1].id, draft.relation, draft.year, draft.source), ...seed.edges.slice(start).map(edge => ({...edge, sources:edge.sourceIds.map(id => seed.sources.find(source => source.id === id)).filter(source => source?.url)}))];
  } else {
    people = [first, ...draft.ancestors.split('\n').map((name, index) => ({id:'custom-'+index, name, custom:true}))];
    edges = people.slice(1).map((person, index) => reported(people[index].id, person.id, index === 0 ? draft.relation : '学術上の関係', index === 0 ? draft.year : '', index === 0 ? draft.source : ''));
  }
  const documented = edges.filter(edge => edge.status === 'documented').length;
  return {draft, people, edges, steps:edges.length, documented, claimed:edges.length-documented};
}
export function encodeDraft(draft) {
  const bytes = new TextEncoder().encode(JSON.stringify(draft));
  return '#roots=' + btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join('')).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
export function decodeDraft(hash, seed) {
  if (!hash.startsWith('#roots=') || hash.length > 10000 || !/^[-\w]+$/.test(hash.slice(7))) throw Error('共有リンクの形式を読み取れませんでした。');
  try {
    const bytes = Uint8Array.from(atob(hash.slice(7).replace(/-/g,'+').replace(/_/g,'/')), char => char.charCodeAt(0));
    return validateDraft(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes)), seed);
  } catch (error) { throw Error('共有リンクを読み込めませんでした。' + (error instanceof SyntaxError ? '' : ' ' + error.message)); }
}
export function routeText(route, base) {
  const names = route.people.map(person => person.name);
  return `Academic Roots\n${names.join(' → ')}\n${names.at(-1)}まで${route.steps}ステップ\n\n${route.edges.map((edge, i) => `${names[i]} → ${names[i+1]}：${edge.label}／${edge.statusLabel}${edge.period ? '／'+edge.period : ''}${edge.sources.map(source => '\n出典：'+source.url).join('')}`).join('\n\n')}\n\n学術上の関係をたどった系譜です。すべてが博士論文指導を意味するわけではありません。\n作成：${base}`;
}
