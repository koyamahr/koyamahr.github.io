import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sma, referenceLevels, outcome, extent} from '../market-chart-atlas/indicators.mjs';
const data=JSON.parse(readFileSync(new URL('../market-chart-atlas/data.json',import.meta.url)));
test('all twelve snapshots have ordered, valid OHLC and a full warm-up and outcome window',()=>{
 assert.equal(data.cases.length,12);assert.equal(new Set(data.cases.map(c=>c.id)).size,12);
 for(const c of data.cases){assert.equal(c.rows.length,151);assert.equal(c.observationIndex,130);assert.equal(c.rows[130][0],c.date);let date='';
  for(const r of c.rows){assert.ok(r[0]>date);date=r[0];assert.ok(r.slice(1).every(Number.isFinite));assert.ok(r[3]<=Math.min(r[1],r[4]));assert.ok(r[2]>=Math.max(r[1],r[4]));assert.ok(r[5]>=0);}
  for(const key of ['title','pattern','observe','question','review'])for(const lang of ['ja','en'])assert.ok(c[key][lang].length>0);
 }
});
test('indicators do not use future prices and reference levels exclude the observation candle',()=>{
 const c=data.cases[0],rows=c.rows,index=c.observationIndex;
 const altered=structuredClone(rows);for(let i=index+1;i<altered.length;i++)altered[i]=[altered[i][0],1,1e6,.01,5e5,1e9];
 assert.deepEqual(sma(rows,20).slice(0,index+1),sma(altered,20).slice(0,index+1));
 assert.deepEqual(sma(rows,50).slice(0,index+1),sma(altered,50).slice(0,index+1));
 assert.deepEqual(extent(rows.slice(50,index+1)),extent(altered.slice(50,index+1)));
 const levels=referenceLevels(rows,index);altered[index]=[rows[index][0],1,1e9,0,1,0];assert.deepEqual(levels,referenceLevels(altered,index));
 assert.equal(levels.high,Math.max(...rows.slice(110,130).map(r=>r[2])));
});
test('trailing averages and outcome agree with independent direct arithmetic',()=>{
 for(const c of data.cases){for(const n of [20,50]){const expected=c.rows.slice(131-n,131).reduce((sum,r)=>sum+r[4],0)/n;assert.ok(Math.abs(sma(c.rows,n)[130]-expected)<1e-8);}
  assert.ok(Math.abs(outcome(c.rows,130)-(c.rows[150][4]-c.rows[130][4])/c.rows[130][4]*100)<1e-10);
 }
});
