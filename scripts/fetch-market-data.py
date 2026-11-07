"""Refresh the finite, historical teaching dataset (Python standard library only)."""
import concurrent.futures
import datetime as dt
import json
from pathlib import Path
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
TICKERS = ['AAPL', 'NVDA', 'MSFT', 'TSLA', 'META', 'AMZN', 'NFLX', 'SPY', 'QQQ', 'AMD']

def fetch(symbol):
    url = f'https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?period1=1546300800&period2=1735689600&interval=1d'
    request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(request, timeout=30) as response:
        data = json.load(response)['chart']['result'][0]
    q = data['indicators']['quote'][0]
    rows = []
    for i, timestamp in enumerate(data['timestamp']):
        values = [q[key][i] for key in ['open', 'high', 'low', 'close', 'volume']]
        if any(value is None for value in values):
            continue
        o, h, l, c, v = values
        assert l <= min(o, c) <= max(o, c) <= h and v >= 0
        rows.append([dt.datetime.fromtimestamp(timestamp, dt.timezone.utc).date().isoformat(),
                     *[round(value, 4) for value in values[:4]], int(v)])
    return symbol, rows

if __name__ == '__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        prices = dict(pool.map(fetch, TICKERS))
    definitions = json.loads((ROOT / 'market-chart-atlas' / 'cases.json').read_text())
    for case in definitions:
        rows = prices[case['symbol']]
        index = next(i for i, row in enumerate(rows) if row[0] == case['date'])
        assert index >= 130 and index + 20 < len(rows), case['id']
        case['rows'] = rows[index - 130:index + 21]
        case['observationIndex'] = 130
    destination = ROOT / 'market-chart-atlas' / 'data.json'
    destination.parent.mkdir(exist_ok=True)
    destination.write_text(json.dumps({'source': 'Yahoo Finance chart API', 'retrieved': dt.datetime.now(dt.timezone.utc).date().isoformat(), 'cases': definitions}, ensure_ascii=False, separators=(',', ':')) + '\n')
    print(f'Saved {len(definitions)} historical cases with 151 validated trading sessions each.')
