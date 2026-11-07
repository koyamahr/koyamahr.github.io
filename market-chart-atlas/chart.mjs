import {extent, referenceLevels} from './indicators.mjs';
const colors={up:'#52745f',down:'#a57459',gold:'#b69552',blue:'#728c9e',purple:'#8b7a9b',grid:'#d9ddd3'};
const fmt=v=>v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const compact=v=>Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}).format(v);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function chartSVG(c, method, series, {revealed=false,narrow=false,volume=true,levels=false,lang='ja'}={}) {
 const start=c.observationIndex-80,end=c.observationIndex+(revealed?20:0),rows=c.rows.slice(start,end+1);
 const oscillator=method==='macd'||method==='rsi',W=narrow?540:840,H=oscillator?540:440,left=12,right=narrow?61:68,top=28,bottom=oscillator?260:326,plotRight=W-right,dx=(plotRight-left)/101,x=i=>left+(i+.5)*dx;
 let [lo,hi]=extent(rows);
 const overlayKeys=method==='ma'?['sma','ema']:method==='bb'?['upper','lower','middle']:[];
 for(const key of overlayKeys)for(const value of series[key].slice(start,end+1))if(value!==null){lo=Math.min(lo,value*.99);hi=Math.max(hi,value*1.01);}
 const references=referenceLevels(c.rows,c.observationIndex);
 if(levels)for(const v of Object.values(references)){lo=Math.min(lo,v*.99);hi=Math.max(hi,v*1.01);}
 const y=v=>bottom-(v-lo)/(hi-lo)*(bottom-top),obx=x(80)+dx/2,volBottom=oscillator?320:387,oscTop=365,oscBottom=493;
 let svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${escape(c.symbol)} · ${escape(method.toUpperCase())} · ${lang==='ja'?'日足チャート。下のスライダーで各日の価格と指標値を確認できます。':'daily chart. Use the slider below to inspect prices and indicator values.'}"><title>${escape(c.symbol)} · ${escape(method.toUpperCase())} · ${c.date}</title>`;
 if(revealed)svg+=`<rect x="${obx}" y="${top}" width="${plotRight-obx}" height="${H-top-28}" fill="#e8ede3" opacity=".65"/>`;
 for(let i=0;i<5;i++){const value=lo+(hi-lo)*i/4;svg+=`<path d="M${left} ${y(value)}H${plotRight}" stroke="${colors.grid}" stroke-width=".7"/><text x="${plotRight+8}" y="${y(value)+3}" class="axis">${fmt(value)}</text>`;}
 if(levels)for(const v of Object.values(references))svg+=`<path d="M${left} ${y(v)}H${plotRight}" stroke="#7d8c7c" stroke-width="1" stroke-dasharray="4 5"/>`;
 const polyline=(values,scale,color,width=1.7)=>{
  // Nulls break a path rather than connecting across unavailable history.
  let path='',move=true;
  values.slice(start,end+1).forEach((v,i)=>{if(v===null||!Number.isFinite(v)){move=true;return;}path+=`${move?'M':'L'}${x(i).toFixed(2)},${scale(v).toFixed(2)} `;move=false;});
  return `<path d="${path}" stroke="${color}" stroke-width="${width}" fill="none"/>`;
 };
 if(method==='bb'){
  const upper=series.upper.slice(start,end+1),lower=series.lower.slice(start,end+1);
  const indices=upper.map((v,i)=>v===null?null:i).filter(i=>i!==null);
  if(indices.length)svg+=`<polygon points="${[...indices.map(i=>`${x(i)},${y(upper[i])}`),...indices.toReversed().map(i=>`${x(i)},${y(lower[i])}`)].join(' ')}" fill="${colors.blue}" opacity=".11"/>`;
 }
 const maxVol=Math.max(...rows.map(r=>r[5]));
 rows.forEach((r,i)=>{
  const color=r[4]>=r[1]?colors.up:colors.down;
  svg+=`<path d="M${x(i)} ${y(r[2])}V${y(r[3])}" stroke="${color}" stroke-width="1"/><rect x="${x(i)-dx*.29}" y="${Math.min(y(r[1]),y(r[4]))}" width="${dx*.58}" height="${Math.max(.9,Math.abs(y(r[1])-y(r[4])))}" fill="${color}"/>`;
  if(volume){const height=r[5]/maxVol*38;svg+=`<rect x="${x(i)-dx*.29}" y="${volBottom-height}" width="${dx*.58}" height="${height}" fill="${color}" opacity=".45"/>`;}
 });
 if(method==='ma'){svg+=polyline(series.sma,y,colors.gold);svg+=polyline(series.ema,y,colors.blue);}
 if(method==='bb'){svg+=polyline(series.middle,y,colors.gold);svg+=polyline(series.upper,y,colors.blue,1.2);svg+=polyline(series.lower,y,colors.blue,1.2);}
 if(volume)svg+=`<text x="${plotRight+8}" y="${volBottom-29}" class="axis">${compact(maxVol)}</text><text x="${plotRight+8}" y="${volBottom}" class="axis">0</text>`;
 let oscillatorScale=null;
 if(oscillator){
  let olow=0,ohigh=100;
  if(method==='macd'){
   const values=Object.values(series).flatMap(a=>a.slice(start,end+1)).filter(v=>v!==null);
   const bound=Math.max(1e-6,...values.map(Math.abs))*1.15;olow=-bound;ohigh=bound;
  }
  const oy=v=>oscBottom-(v-olow)/(ohigh-olow)*(oscBottom-oscTop);oscillatorScale=oy;
  svg+=`<text x="${left}" y="${oscTop-15}" class="pane-label">${method==='macd'?'MACD · USD':'RSI · 0–100'}</text>`;
  if(method==='rsi')svg+=`<rect x="${left}" y="${oy(70)}" width="${plotRight-left}" height="${oy(30)-oy(70)}" fill="${colors.blue}" opacity=".07"/>`;
  for(const value of method==='rsi'?[0,30,50,70,100]:[olow*.7,0,ohigh*.7])svg+=`<path d="M${left} ${oy(value)}H${plotRight}" stroke="${colors.grid}" stroke-width="${value===0?1:.6}" ${method==='rsi'&&[30,70].includes(value)?'stroke-dasharray="4 4"':''}/><text x="${plotRight+8}" y="${oy(value)+3}" class="axis">${method==='rsi'?value:fmt(value)}</text>`;
  if(method==='rsi')svg+=polyline(series.rsi,oy,colors.purple,1.9);
  else{
   series.histogram.slice(start,end+1).forEach((v,i)=>{if(v===null)return;svg+=`<rect x="${x(i)-dx*.3}" y="${Math.min(oy(0),oy(v))}" width="${dx*.6}" height="${Math.max(.6,Math.abs(oy(v)-oy(0)))}" fill="${v>=0?colors.up:colors.down}" opacity=".6"/>`;});
   svg+=polyline(series.line,oy,colors.blue,1.8)+polyline(series.signal,oy,colors.gold,1.6);
  }
 }
 svg+=`<path d="M${obx} ${top-6}V${oscillator?oscBottom:volume?volBottom:bottom}" stroke="#839480" stroke-width="1" stroke-dasharray="3 4"/><text x="${obx-5}" y="14" text-anchor="end" class="observation-date">${lang==='ja'?'観察日':'Observation'} ${c.date}</text>`;
 if(!revealed)svg+=`<text x="${obx+(plotRight-obx)/2}" y="${top+(bottom-top)/2-8}" text-anchor="middle" class="future-label">${lang==='ja'?'この先は、':'THE FUTURE'}</text><text x="${obx+(plotRight-obx)/2}" y="${top+(bottom-top)/2+9}" text-anchor="middle" class="future-label">${lang==='ja'?'まだ見ない':'STAYS HIDDEN'}</text>`;
 for(const i of [0,30,60,...(revealed?[100]:[])])svg+=`<text x="${x(i)}" y="${H-12}" text-anchor="${i===0?'start':'middle'}" class="axis">${rows[i][0]}</text>`;
 svg+=`<path id="cursor-line" class="crosshair" stroke="#20352f" stroke-width=".8" opacity=".6" stroke-dasharray="2 3"/></svg>`;
 return {svg,width:W,dx,left,top,bottom:oscillator?oscBottom:volume?volBottom:bottom,first:rows[0][0],last:rows.at(-1)[0]};
}
export function methodPreview(c,method,series){
 const start=c.observationIndex-49,end=c.observationIndex,rows=c.rows.slice(start,end+1),[low,high]=extent(rows),x=i=>8+i*5.75,y=v=>68-(v-low)/(high-low)*60;
 let svg='<svg viewBox="0 0 300 140" aria-hidden="true"><path d="M0 35H300M0 70H300M0 110H300" stroke="#d5d9cd" stroke-width=".6"/>';
 const line=(values,scale,color)=>`<polyline points="${values.slice(start,end+1).map((v,i)=>v===null?'':`${x(i)},${scale(v)}`).filter(Boolean).join(' ')}" fill="none" stroke="${color}" stroke-width="1.7"/>`;
 svg+=`<polyline points="${rows.map((r,i)=>`${x(i)},${y(r[4])}`).join(' ')}" fill="none" stroke="#52745f" stroke-width="1" opacity=".65"/>`;
 if(method==='ma')svg+=line(series.sma,y,colors.gold)+line(series.ema,y,colors.blue);
 if(method==='bb')svg+=line(series.middle,y,colors.gold)+line(series.upper,y,colors.blue)+line(series.lower,y,colors.blue);
 if(method==='rsi'){const oy=v=>133-v*.47;svg+=`<path d="M0 ${oy(30)}H300M0 ${oy(70)}H300" stroke="#bcb9c7" stroke-dasharray="2 4" stroke-width=".6"/>`+line(series.rsi,oy,colors.purple);}
 if(method==='macd'){
  const bound=Math.max(1e-6,...Object.values(series).flatMap(a=>a.slice(start,end+1)).filter(v=>v!==null).map(Math.abs)),oy=v=>110-v/bound*23;
  series.histogram.slice(start,end+1).forEach((v,i)=>{if(v!==null)svg+=`<rect x="${x(i)-1.6}" y="${Math.min(oy(0),oy(v))}" width="3.2" height="${Math.max(.4,Math.abs(oy(v)-oy(0)))}" fill="${v>=0?colors.up:colors.down}" opacity=".5"/>`;});svg+=line(series.line,oy,colors.blue)+line(series.signal,oy,colors.gold);
 }
 return svg+'</svg>';
}
