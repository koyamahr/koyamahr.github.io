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
