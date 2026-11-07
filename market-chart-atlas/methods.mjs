const fidelity = 'https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-indicator-guide/';
export const methods = {
 ma: {number:'01',name:{ja:'移動平均',en:'Moving averages'},short:'SMA / EMA',group:{ja:'トレンドをならす',en:'Smoothing the trend'},summary:{ja:'同じ期間のSMAとEMAを重ね、ならし方と反応の違いを見る。',en:'Overlay an SMA and EMA with the same period to compare their smoothing and response.'},
 defaults:{period:20},controls:[{key:'period',min:5,max:50,step:1,label:{ja:'平均する期間',en:'Averaging period'},unit:'days'}],
 formula:p=>`SMAₜ = (Cₜ + … + Cₜ₋ₙ₊₁) / n\nEMAₜ = α Cₜ + (1 − α) EMAₜ₋₁\nα = 2 / (n + 1),  n = ${p.period}`,
 definition:{ja:'Cは日々の終値、nは営業日数。SMAは直近n個を等しく平均し、EMAは新しい終値ほど大きく重み付けします。ここでは両方を同じnで比較します。',en:'C denotes the closing price and n the number of trading sessions. An SMA weights the last n closes equally. An EMA gives recent closes greater weight. Both use the same n here.'},
 reading:{ja:'価格に対する線の向き、反応の遅れ、SMAとEMAの距離を観察します。期間を短くすると細かな変化を追い、長くすると滑らかになります。',en:'Observe the slopes, lag behind price, and distance between the SMA and EMA. Shorten the period to follow finer changes; lengthen it for a smoother view.'},
 limit:{ja:'どちらも過去の価格をならす指標です。横ばい相場では価格と線が何度も交差しやすく、交差したことだけでは次の方向は決まりません。',en:'Both smooth past prices. In a sideways market, price may cross an average repeatedly; a crossover alone does not establish the next direction.'},
 convention:{ja:'EMAの初期値には最初のn終値のSMAを使います。',en:'EMA starts with the SMA of the first n closes.'},source:fidelity+'ema',sourceLabel:'Fidelity · EMA'},
 macd:{number:'02',name:{ja:'MACD',en:'MACD'},short:'MACD',group:{ja:'勢いの変化を測る',en:'Comparing momentum'},summary:{ja:'短期と長期のEMAの差を、シグナル線とヒストグラムで読む。',en:'Read the difference between fast and slow EMAs alongside a signal line and histogram.'},
 defaults:{fast:12,slow:26,signal:9},controls:[{key:'fast',min:5,max:20,step:1,label:{ja:'短期EMA',en:'Fast EMA'},unit:'days'},{key:'slow',min:21,max:40,step:1,label:{ja:'長期EMA',en:'Slow EMA'},unit:'days'},{key:'signal',min:3,max:12,step:1,label:{ja:'シグナルEMA',en:'Signal EMA'},unit:'days'}],
 formula:p=>`MACDₜ = EMA${p.fast}(C)ₜ − EMA${p.slow}(C)ₜ\nSignalₜ = EMA${p.signal}(MACD)ₜ\nHistogramₜ = MACDₜ − Signalₜ`,
 definition:{ja:'MACD線は二つのEMAの差。シグナル線はMACD線自体のEMA、棒はその差です。ゼロより上なら短期EMAが長期EMAを上回っています。単位は価格と同じ米ドルです。',en:'The MACD line is the difference between two EMAs. The signal is an EMA of the MACD; bars show their difference. Above zero, the fast EMA exceeds the slow EMA. Values use the price unit, USD.'},
 reading:{ja:'ゼロ線との位置、MACD線とシグナル線の交差、棒の伸縮を分けて観察します。棒が縮むことと、価格が下落することは同じ意味ではありません。',en:'Separate the position relative to zero, signal-line crossovers, and histogram expansion or contraction. A shrinking histogram does not necessarily mean price is falling.'},
 limit:{ja:'移動平均を使うため反応には遅れがあります。横ばいでは交差が頻発します。値の大きさは株価水準にも依存するため、異なる銘柄の生の数値を直接比較しないでください。',en:'Moving averages introduce lag, and crossovers can repeat in a range. Magnitude also depends on the price level, so raw MACD values are not directly comparable across different stocks.'},
 convention:{ja:'各EMAは最初の有効な期間のSMAで初期化します。シグナルはMACDが計算できた日から求めます。',en:'Each EMA is seeded with its first valid period’s SMA. The signal starts only after valid MACD values exist.'},source:fidelity+'macd',sourceLabel:'Fidelity · MACD'},
 rsi:{number:'03',name:{ja:'RSI',en:'RSI'},short:'RSI',group:{ja:'上昇と下落の強さ',en:'Balancing gains and losses'},summary:{ja:'終値の上げ幅と下げ幅から、勢いを0〜100で表す。',en:'Express the balance of closing-price gains and losses on a scale from 0 to 100.'},
 defaults:{period:14},controls:[{key:'period',min:5,max:30,step:1,label:{ja:'平滑化する期間',en:'Smoothing period'},unit:'days'}],
 formula:p=>`RSIₜ = 100 − 100 / (1 + Gₜ / Lₜ)\nGₜ = ((${p.period} − 1) Gₜ₋₁ + max(ΔCₜ, 0)) / ${p.period}\nLₜ = ((${p.period} − 1) Lₜ₋₁ + max(−ΔCₜ, 0)) / ${p.period}`,
 definition:{ja:'ΔCは前日からの終値の変化。GとLは上げ幅・下げ幅をWilder方式で平滑化した値です。初期値は最初のn回の変化の平均で求めます。',en:'ΔC is the change in closing price. G and L are gains and losses smoothed using Wilder’s recurrence. Initial values are averages of the first n changes.'},
 reading:{ja:'30・50・70を参照線として、強さの推移を見る指標です。期間を変え、価格が高値を更新するときのRSIの反応や、高い水準が続く場面を観察します。',en:'Use 30, 50, and 70 as reference levels. Change the period and compare RSI at new price highs or during sustained elevated readings.'},
 limit:{ja:'70以上や30以下に達しても、すぐ反転するとは限りません。強いトレンドでは高い・低い水準が長く続きます。「買われすぎ」「売られすぎ」は自動的な売買判断ではありません。',en:'A reading above 70 or below 30 does not establish an immediate reversal. Strong trends can sustain extreme readings. “Overbought” and “oversold” are not automatic trading decisions.'},
 convention:{ja:'下げ幅だけが0なら100、上げ幅だけが0なら0。両方0の完全な横ばいは、このサイトでは50と定義します。',en:'Zero losses with positive gains gives 100; zero gains with positive losses gives 0. This site defines a completely flat series (both zero) as 50.'},source:fidelity+'rsi',sourceLabel:'Fidelity · RSI'},
 bb:{number:'04',name:{ja:'ボリンジャーバンド',en:'Bollinger Bands'},short:'Bollinger',group:{ja:'変動の幅を見る',en:'Mapping volatility'},summary:{ja:'平均線のまわりに標準偏差の帯を重ね、変動の拡大と縮小を見る。',en:'Place standard-deviation bands around an average to observe volatility expanding and contracting.'},
 defaults:{period:20,multiplier:2},controls:[{key:'period',min:10,max:40,step:1,label:{ja:'平均・標準偏差の期間',en:'Mean / deviation period'},unit:'days'},{key:'multiplier',min:1,max:3,step:.1,label:{ja:'バンド幅の倍率',en:'Band multiplier'},unit:'sigma'}],
 formula:p=>`Middleₜ = SMA${p.period}(C)ₜ\nσₜ = √[Σ(Cᵢ − Middleₜ)² / ${p.period}]\nUpper / Lower = Middleₜ ± ${p.multiplier.toFixed(1)} σₜ`,
 definition:{ja:'直近n終値のSMAを中心に、同じn終値の標準偏差σのk倍だけ上下に帯を描きます。標準偏差はnで割る母標準偏差を使います。',en:'Bands sit k standard deviations above and below the SMA of the last n closes. Deviation uses those same n closes and a population denominator of n.'},
 reading:{ja:'帯の狭まり・広がりと、価格が帯のどこにいるかを観察します。倍率kを変えると帯の幅だけが変わり、中心線は変わりません。',en:'Observe narrowing or widening bands and price’s position within them. Changing k affects the width, while the middle line stays unchanged.'},
 limit:{ja:'上の帯への接触は、それだけで売りを意味しません。価格が帯に沿って進む場合もあります。±2σを「将来の価格が95%の確率で収まる範囲」とは解釈できません。',en:'Touching the upper band is not, by itself, a sell signal; price can follow a band. ±2σ is not a forecast interval containing future prices with 95% probability.'},
 convention:{ja:'標準偏差も中心線も同じ終値・同じ期間で計算します。Bollinger Bands®はJohn Bollingerの登録商標です。',en:'Both deviation and middle line use the same closing prices and period. Bollinger Bands® is a registered trademark of John Bollinger.'},source:'https://www.bollingerbands.com/bollinger-band-rules',sourceLabel:'John Bollinger · Band rules'}
};
export function parseSettings(search) {
 const query = new URLSearchParams(search);
 const method = Object.hasOwn(methods, query.get('indicator')) ? query.get('indicator') : 'macd';
 const settings = Object.fromEntries(Object.entries(methods).map(([key,value])=>[key,{...value.defaults}]));
 for (const control of methods[method].controls) {
  const raw=query.get(control.key); if (raw===null || raw.trim()==='') continue;
  const value=Number(raw);if (!Number.isFinite(value)) continue;
  settings[method][control.key] = Number((Math.round((Math.max(control.min,Math.min(control.max,value))-control.min)/control.step)*control.step+control.min).toFixed(1));
 }
 return {method,settings};
}
