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

const {ema,macd,rsi,bollinger,calculateIndicator}=await import('../market-chart-atlas/indicators.mjs');
const {methods,parseSettings}=await import('../market-chart-atlas/methods.mjs');
const {chartSVG}=await import('../market-chart-atlas/chart.mjs');
const rowsOf=closes=>closes.map((c,i)=>[String(i),c,c,c,c,0]);
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-9,`${actual} ≈ ${expected}`);
test('EMA uses an SMA seed and the exponential recurrence',()=>{
 assert.deepEqual(ema(rowsOf([10,10,10,20,20]),3),[null,null,10,15,17.5]);
});
test('MACD and signal have independent warm-up and match hand-derived values',()=>{
 const m=macd(rowsOf([1,2,4,8,16,32]),2,3,2);
 assert.equal(m.line[1],null);assert.equal(m.signal[2],null);near(m.line[2],5/6);near(m.line[3],11/9);near(m.signal[3],37/36);near(m.histogram[3],7/36);
 assert.throws(()=>macd(rowsOf([1,2,3]),3,2,2),RangeError);
});
test('Wilder RSI matches a reference arithmetic example and handles monotone and flat prices',()=>{
 const values=[44.34,44.09,44.15,43.61,44.33,44.83,45.10,45.42,45.84,46.08,45.89,46.03,45.61,46.28,46.28,46.00];
 const result=rsi(rowsOf(values),14);assert.equal(result[13],null);near(result[14],70.46413502109705);near(result[15],66.24961855355505);
 assert.equal(rsi(rowsOf([1,2,3,4]),3)[3],100);assert.equal(rsi(rowsOf([4,3,2,1]),3)[3],0);assert.equal(rsi(rowsOf([2,2,2,2]),3)[3],50);
});
test('Bollinger Bands use population deviation; multiplier changes width but not center',()=>{
 const rows=rowsOf([1,2,3,4,5]),b=bollinger(rows,3,2),wide=bollinger(rows,3,3);
 near(b.middle[2],2);near(b.upper[2],2+2*Math.sqrt(2/3));near(b.lower[2],2-2*Math.sqrt(2/3));assert.deepEqual(b.middle,wide.middle);near(wide.upper[2]-2,1.5*(b.upper[2]-2));
});
test('future edits cannot change any pre-observation indicator or hidden-outcome SVG',()=>{
 const c=data.cases[0],altered=structuredClone(c);
 for(let i=131;i<altered.rows.length;i++)altered.rows[i]=[altered.rows[i][0],1,1e6,.01,5e5,1e9];
 for(const [key,m] of Object.entries(methods)){
  const before=calculateIndicator(c.rows,key,m.defaults),after=calculateIndicator(altered.rows,key,m.defaults);
  for(const name of Object.keys(before))assert.deepEqual(before[name].slice(0,131),after[name].slice(0,131));
  assert.equal(chartSVG(c,key,before).svg,chartSVG(altered,key,after).svg);
  assert.ok(!chartSVG(c,key,before).svg.includes('NaN'));
 }
});
test('all allowed period extremes have usable indicators throughout the visible window',()=>{
 for(const c of data.cases)for(const [key,m] of Object.entries(methods))for(const bound of ['min','max']){
  const params=Object.fromEntries(m.controls.map(control=>[control.key,control[bound]]));
  for(const values of Object.values(calculateIndicator(c.rows,key,params)))assert.ok(values.slice(50).every(Number.isFinite),`${c.id} ${key} ${bound}`);
 }
});
test('shared URLs clamp, quantize, and reject invalid parameter inputs',()=>{
 assert.equal(parseSettings('?indicator=unknown').method,'macd');
 assert.deepEqual(parseSettings('?indicator=macd&fast=100&slow=-8&signal=NaN').settings.macd,{fast:20,slow:21,signal:9});
 assert.deepEqual(parseSettings('?indicator=bb&period=23.8&multiplier=2.36').settings.bb,{period:24,multiplier:2.4});
 assert.equal(parseSettings('?indicator=ma&period=').settings.ma.period,20);
});
