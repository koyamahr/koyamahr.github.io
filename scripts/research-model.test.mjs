import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makePrompt,parseResearch,validateResearch,exampleResearch,asRoute,resultText,encodeResult,decodeResult,manualResearch} from '../academic-roots/research-model.mjs';
const seed=JSON.parse(readFileSync(new URL('../academic-roots/data.json',import.meta.url),'utf8'));
const fixture=()=>({format:'academic-roots-research',version:1,people:[{id:'p0',name:'訪問者'},{id:'p1',name:'自分の先生'},{id:'p2',name:'上流の先生'}],relationships:[{from:'p0',to:'p1',kind:'doctoral',basis:'self_report',evidence:'本人の申告',sources:[]},{from:'p1',to:'p2',kind:'research',basis:'public_source',evidence:'本人の履歴に指導を受けた旨の記述。',sources:[{title:'大学の履歴',url:'https://example.org/profile'}]}],unresolved:[{personId:'p2',note:'この先は未確認。'}]});
test('research request works for any supervisor, without assuming the sample route',()=>{
  const prompt=makePrompt({name:'訪問者',mentor:'任意の先生',affiliation:'大学A',year:'2001年',kind:'doctoral'});
  assert.match(prompt,/任意の先生/);assert.match(prompt,/博士課程/);assert.match(prompt,/審査委員/);assert.match(prompt,/原資料/);assert.match(prompt,/その人物で経路を止め/);
  assert.doesNotMatch(prompt,/湯川|犬塚/);
});
test('imported or shared AI trust flags never upgrade evidence',()=>{
  const f=fixture();f.relationships[1].status='documented';f.relationships[1].reviewed=true;f.reviewed=[1];
  const safe=validateResearch(f);assert.equal(safe.relationships[1].reviewed,undefined);
  assert.equal(asRoute(safe).checked,0);assert.equal(asRoute(safe).edges[1].status,'candidate');
  assert.equal(asRoute(safe,[0,1]).checked,1);assert.equal(asRoute(safe,[0,1]).edges[0].status,'self_reported');
  assert.equal(asRoute(decodeResult(encodeResult(f))).checked,0);
});
test('a fabricated URL protocol or credentials cannot become an evidence link',()=>{
  for(const url of ['javascript:alert(1)','data:text/html,x','file:///etc/passwd','https://user:secret@example.org/a']){const f=fixture();f.relationships[1].sources[0].url=url;assert.throws(()=>validateResearch(f));}
});
test('missing, branched, reversed, cyclic and disconnected paths are rejected',()=>{
  const missing=fixture();missing.relationships.pop();assert.throws(()=>validateResearch(missing));
  const reversed=fixture();reversed.relationships[1].to='p0';assert.throws(()=>validateResearch(reversed));
  const duplicate=fixture();duplicate.people[2].name=' 訪 問 者 ';assert.throws(()=>validateResearch(duplicate));
  const orphan=fixture();orphan.unresolved[0].personId='absent';assert.throws(()=>validateResearch(orphan));
});
test('public-source claims require evidence URLs while hypotheses cannot be checked',()=>{
  const f=fixture();f.relationships[1].sources=[];assert.throws(()=>validateResearch(f));
  f.relationships[1].basis='hypothesis';assert.equal(asRoute(f,[1]).checked,0);
});
test('JSON fences and Japanese data round-trip; prose and oversized payloads fail explicitly',()=>{
  const f=validateResearch(fixture());assert.deepEqual(parseResearch('```json\n'+JSON.stringify(f)+'\n```'),f);
  assert.deepEqual(decodeResult(encodeResult(f)),f);
  assert.throws(()=>parseResearch('調査しました。'+JSON.stringify(f)));
  assert.throws(()=>parseResearch('x'.repeat(80001)));
  assert.throws(()=>decodeResult('#research=!!!'));
});
test('the Koyama import sample keeps its four actual relation types and self-report provenance',()=>{
  const f=exampleResearch(seed),route=asRoute(f);assert.equal(route.steps,4);
  assert.equal(f.people[0].name,'小山 洋');assert.equal(f.people.at(-1).name,'湯川 秀樹');
  assert.equal(f.relationships[3].kind,'lab');assert.equal(f.relationships[0].basis,'self_report');
  assert.equal(route.checked,0);assert.equal(asRoute(f,[0,1,2,3]).checked,3);
});
test('copied results retain evidence, unresolved research and creator-only confirmations',()=>{
  const text=resultText(fixture(),[1]);assert.match(text,/作成者が出典を確認/);assert.match(text,/https:\/\/example.org\/profile/);assert.match(text,/この先は未確認/);assert.match(text,/独立に検証/);
});
test('manual fallback keeps all relationships as claims without borrowing sample ancestors',()=>{
  const f=manualResearch({name:'訪問者',kind:'masters'},'先生甲\n先生乙');assert.equal(f.relationships[0].kind,'masters');assert.equal(asRoute(f,[0,1]).checked,0);assert.equal(f.people.at(-1).name,'先生乙');
});
