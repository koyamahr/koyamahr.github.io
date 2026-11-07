export function sma(rows, period) {
  let sum = 0;
  return rows.map((row, i) => {
    sum += row[4];
    if (i >= period) sum -= rows[i - period][4];
    return i >= period - 1 ? sum / period : null;
  });
}
export function referenceLevels(rows, index, period = 20) {
  const previous = rows.slice(index - period, index);
  return {high: Math.max(...previous.map(r => r[2])), low: Math.min(...previous.map(r => r[3]))};
}
export function outcome(rows, index, sessions = 20) {
  return (rows[index + sessions][4] / rows[index][4] - 1) * 100;
}
export function extent(rows) {
  const low = Math.min(...rows.map(r => r[3]));
  const high = Math.max(...rows.map(r => r[2]));
  const pad = Math.max((high - low) * .12, high * .01);
  return [low - pad, high + pad];
}

// An SMA seed and contiguous input give reproducible, trailing-only EMA values.
export function emaSeries(values, period) {
  const output = Array(values.length).fill(null);
  const alpha = 2 / (period + 1);
  let count = 0, sum = 0, previous = null;
  values.forEach((value, i) => {
    if (value === null || !Number.isFinite(value)) { count = 0; sum = 0; previous = null; return; }
    if (previous === null) {
      sum += value; count++;
      if (count === period) output[i] = previous = sum / period;
    } else output[i] = previous = alpha * value + (1 - alpha) * previous;
  });
  return output;
}
export function ema(rows, period) { return emaSeries(rows.map(row => row[4]), period); }
export function macd(rows, fast = 12, slow = 26, signalPeriod = 9) {
  if (fast >= slow) throw new RangeError('MACD fast period must be shorter than slow period.');
  const short = ema(rows, fast), long = ema(rows, slow);
  const line = short.map((value, i) => value === null || long[i] === null ? null : value - long[i]);
  const signal = emaSeries(line, signalPeriod);
  const histogram = line.map((value, i) => value === null || signal[i] === null ? null : value - signal[i]);
  return {line, signal, histogram};
}
export function rsi(rows, period = 14) {
  const output = Array(rows.length).fill(null);
  let gain = 0, loss = 0;
  for (let i = 1; i < rows.length; i++) {
    const change = rows[i][4] - rows[i - 1][4], up = Math.max(0, change), down = Math.max(0, -change);
    if (i <= period) { gain += up / period; loss += down / period; }
    else { gain = (gain * (period - 1) + up) / period; loss = (loss * (period - 1) + down) / period; }
    if (i >= period) output[i] = gain === 0 && loss === 0 ? 50 : loss === 0 ? 100 : 100 - 100 / (1 + gain / loss);
  }
  return output;
}
export function bollinger(rows, period = 20, multiplier = 2) {
  const middle = sma(rows, period), upper = [], lower = [];
  rows.forEach((row, i) => {
    if (middle[i] === null) { upper.push(null); lower.push(null); return; }
    const variance = rows.slice(i - period + 1, i + 1).reduce((sum, r) => sum + (r[4] - middle[i]) ** 2, 0) / period;
    const width = multiplier * Math.sqrt(variance);
    upper.push(middle[i] + width); lower.push(middle[i] - width);
  });
  return {middle, upper, lower};
}
export function calculateIndicator(rows, method, params) {
  if (method === 'ma') return {sma: sma(rows, params.period), ema: ema(rows, params.period)};
  if (method === 'macd') return macd(rows, params.fast, params.slow, params.signal);
  if (method === 'rsi') return {rsi: rsi(rows, params.period)};
  return bollinger(rows, params.period, params.multiplier);
}
