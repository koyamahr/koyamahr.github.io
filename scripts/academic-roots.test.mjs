import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildRoute, encodeDraft, decodeDraft, validateDraft, routeText} from '../academic-roots/builder-model.mjs';
const seed=JSON.parse(readFileSync(new URL('../academic-roots/data.json',import.meta.url),'utf8'));
const input=()=>({v:1,name:'訪問者 太郎',mode:'existing',mentor:'shuichiro-inutsuka',ancestors:'',relation:'研究指導',year:'2001年',source:''});
test('joining an existing researcher retains the documented upstream route and adds a claim',()=>{
 const route=buildRoute(input(),seed);
 assert.equal(route.steps,4);assert.equal(route.people.at(-1).id,'hideki-yukawa');
 assert.equal(route.claimed,1);assert.equal(route.documented,3);
 assert.equal(route.edges[0].status,'self_reported');assert.equal(route.edges[3].label,'研究室での師弟関係');
 assert.equal(seed.people.length,5);assert.equal(seed.edges.length,4);
});
test('joining Koyama preserves his pre-existing self-report instead of upgrading it',()=>{
 const route=buildRoute({...input(),mentor:'hiroshi-koyama'},seed);
 assert.equal(route.steps,5);assert.equal(route.claimed,2);assert.equal(route.documented,3);
});
test('manual routes never imply a connection to Yukawa or upgrade a supplied URL to verification',()=>{
 const route=buildRoute({...input(),mode:'manual',ancestors:'先生A\n\n先生B',source:'https://example.org/thesis'},seed);
 assert.equal(route.steps,2);assert.equal(route.documented,0);assert.equal(route.people.at(-1).name,'先生B');
 assert.equal(route.edges[0].status,'self_reported');assert.equal(route.edges[0].sources[0].url,'https://example.org/thesis');
 assert.match(routeText(route,'https://example.org/'),/未検証/);
});
test('Japanese, accented names and source URLs round-trip through share fragments',()=>{
 const draft=validateDraft({...input(),name:'Émile 山田',mode:'manual',ancestors:'佐藤 一郎\n林 二郎',source:'https://example.org/?q=研究&n=1'},seed);
 assert.deepEqual(decodeDraft(encodeDraft(draft),seed),draft);
});
test('dangerous protocols and credential-bearing URLs cannot become source links',()=>{
 for(const source of ['javascript:alert(1)','data:text/html,test','file:///tmp/test','https://secret:password@example.org/'])assert.throws(()=>buildRoute({...input(),source},seed));
});
test('unknown mentors, self-cycles and duplicate manually entered names are rejected',()=>{
 assert.throws(()=>buildRoute({...input(),mentor:'unregistered'},seed));
 assert.throws(()=>buildRoute({...input(),name:'犬塚修一郎'},seed),/重複/);
 assert.throws(()=>buildRoute({...input(),mode:'manual',ancestors:'佐藤 一郎\n佐藤一郎'},seed),/重複/);
});
test('empty or excessive inputs and malformed share links fail safely',()=>{
 for(const draft of [{...input(),name:''},{...input(),name:'あ'.repeat(61)},{...input(),mode:'manual',ancestors:''},{...input(),mode:'manual',ancestors:Array.from({length:13},(_,i)=>'先生'+i).join('\n')}])assert.throws(()=>buildRoute(draft,seed));
 for(const hash of ['#roots=bad-data','#roots='+ 'a'.repeat(10000),'#create'])assert.throws(()=>decodeDraft(hash,seed));
});
test('shared data cannot forge the verified status of newly added relationships',()=>{
 const malicious={...input(),status:'documented',edges:[{status:'documented'}],documented:100};
 const restored=decodeDraft(encodeDraft(malicious),seed);
 assert.equal(buildRoute(restored,seed).edges[0].status,'self_reported');
 assert.equal(restored.status,undefined);
});
