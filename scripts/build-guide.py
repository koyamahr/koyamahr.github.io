#!/usr/bin/env python3
"""Refresh the browser-local guide using only explicitly allowed public sites.
No local manuscripts, photos, private notes or credentials are read.
Python 3.10+ standard library; network is used at build time only.
"""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from hashlib import sha256
from html.parser import HTMLParser
from pathlib import Path
import json, re, sys, urllib.request, urllib.parse, xml.etree.ElementTree as ET
ROOT = Path(__file__).resolve().parents[1]
ORIGIN = 'https://koyamahr.github.io'
DOMAINS = [
 ('numerical', '/numerical-methods-atlas/', '数値計算アトラス', 'Numerical Methods Atlas'),
 ('astronomy', '/astronomy-step-by-step/', '理論天文学の道具箱', 'Theoretical Astrophysics'),
 ('thermal', '/the-art-of-thermal-instability/', '熱的不安定性', 'Thermal Instability'),
]
class Prose(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=True); self.stack=[]; self.main=0; self.documentTitle=''; self.title=''; self.heading=''; self.anchor=''; self.parts=[]; self.blocks=[]
 def flush(self):
  text=re.sub(r'[ \t]+',' ', ''.join(self.parts)); text=re.sub(r'\n\s*\n+', '\n', text).strip(); self.parts=[]
  if len(text)>30: self.blocks.append((self.heading,self.anchor,text))
 def handle_starttag(self,tag,attrs):
  a=dict(attrs); parent=self.stack[-1][1] if self.stack else False
  hidden=parent or tag in ('script','style','nav','header','footer','aside','svg','button','select','noscript') or 'katex-html' in a.get('class','').split() or 'hidden' in a
  if tag in ('meta','link','img','input','br','hr','source','wbr'):
   if tag=='br' and self.main and not hidden:self.parts.append('\n')
   return
  self.stack.append((tag,hidden))
  if tag=='main':self.main+=1
  if hidden or not self.main:return
  if tag in ('h1','h2','h3','h4'):
   self.flush(); self.heading=''; self.anchor=a.get('id','')
  if tag in ('p','li','pre','tr'):self.parts.append('\n')
 def handle_endtag(self,tag):
  match=next((i for i in range(len(self.stack)-1,-1,-1) if self.stack[i][0]==tag),None)
  if match is None:return
  hidden=self.stack[match][1]
  if self.main and not hidden:
   if tag in ('h1','h2','h3','h4'):
    self.heading=''.join(self.parts).strip(); self.parts=[]
    if not self.title:self.title=self.heading
   elif tag in ('p','li','pre','tr'):self.parts.append('\n')
   elif tag in ('section','article','main'):self.flush()
  if tag=='main':self.main-=1
  self.stack=self.stack[:match]
 def handle_data(self,data):
  if self.stack and self.stack[-1][0]=='title':self.documentTitle+=data
  if self.main and self.stack and not self.stack[-1][1]:
   # KaTeX MathML contains both visual tokens and TeX; retain TeX once.
   tags=[s[0] for s in self.stack]
   if 'math' in tags and 'annotation' not in tags:return
   self.parts.append(data)
def fetch(url):
 parsed=urllib.parse.urlparse(url)
 if parsed.scheme!='https' or parsed.netloc!='koyamahr.github.io':raise ValueError('Non-public-site source')
 with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'KoyamaSiteGuide/1.0'}),timeout=35) as r:
  if urllib.parse.urlparse(r.url).netloc!=parsed.netloc:raise ValueError('Unexpected redirect')
  body=r.read(3_000_001)
  if len(body)>3_000_000:raise ValueError('Oversized page')
  return body.decode('utf-8')
def chunks(text,limit=1400):
 # Preserve sentence/paragraph boundaries where practical; cap exceptional long paragraphs.
 paragraphs=re.split(r'\n+',text); out=''
 for p in paragraphs:
  if len(out)+len(p)>limit and out:yield out;out=''
  while len(p)>limit:
   yield p[:limit];p=p[limit:]
  out+=('\n' if out else '')+p
 if out:yield out

def main():
 if '--reuse-snapshot' in sys.argv:
  old=json.loads((ROOT/'guide/index.json').read_text());stamp=old['capturedAt'];pages=old['pages'];records=[r for r in old['records'] if r['kind']=='reading']
 else:
  stamp=datetime.now(timezone.utc).isoformat(timespec='seconds'); tasks=[]
  for domain,prefix,ja,en in DOMAINS:
   xml=ET.fromstring(fetch(ORIGIN+prefix+'sitemap.xml'))
   urls=sorted(set(x.text for x in xml.findall('{*}url/{*}loc')))
   if len(urls)>250:raise ValueError('Review sitemap growth before indexing')
   for url in urls:
    p=urllib.parse.urlparse(url)
    if p.netloc!='koyamahr.github.io' or not p.path.startswith(prefix):raise ValueError('Unexpected sitemap URL')
    if domain=='numerical' and not re.search(r'/(en|ja)/read/[^/]+/$',p.path):continue
    if domain=='astronomy' and not re.search(r'/(en|ja)/',p.path):continue
    tasks.append((domain,url))
  def read(task):
   domain,url=task; html=fetch(url); parser=Prose();parser.feed(re.sub(r'(<\/?h)\s+([1-6])',r'\1\2',html));parser.flush();parser.title=parser.title or parser.documentTitle.strip()
   if not parser.title or not parser.blocks:raise ValueError('No readable main: '+url)
   language='ja' if '/ja/' in url else 'en'
   records=[]
   for heading,anchor,text in parser.blocks:
    for chunk in chunks(text):
     records.append({'domain':domain,'lang':language,'title':parser.title,'section':heading,'url':url+('#'+urllib.parse.quote(anchor) if anchor else ''),'text':chunk,'kind':'reading'})
   return {'url':url,'domain':domain,'lang':language,'sha256':sha256(html.encode()).hexdigest()},records
  pages=[]; records=[]
  with ThreadPoolExecutor(max_workers=6) as pool:
   for page,rows in pool.map(read,tasks):pages.append(page);records.extend(rows)
 notices={r['url'].split('#')[0]:r['text'].split('↗',1)[-1].strip() for r in records if r['domain']=='numerical' and r['text'].startswith('解説章ソースを見る')}
 records=[r for r in records if not (r['domain']=='numerical' and r['text'].startswith('解説章ソースを見る'))]
 for r in records:
  notice=notices.get(r['url'].split('#')[0]) or r.get('notice')
  if notice:r['notice']=notice
 catalog=json.loads((ROOT/'guide/catalog.json').read_text())
 for work in catalog:
  for lang in ('ja','en'):
   records.append({'domain':work['domain'],'lang':lang,'title':work['title'][lang],'section':'','url':work['url'],'text':work['description'][lang]+'\n'+work['scope'][lang],'kind':'overview','keywords':work.get('keywords','')})
 data={'version':stamp[:10]+'-'+sha256(json.dumps(records,ensure_ascii=False).encode()).hexdigest()[:10],'capturedAt':stamp,'pages':pages,'records':records}
 (ROOT/'guide/index.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n')
 for domain in ['all']+[d[0] for d in DOMAINS]:
  rows=[r for r in records if domain=='all' or r['domain']==domain]
  text='# Hiroshi Koyama — public site knowledge pack\n\nSnapshot: '+data['version']+'\nCaptured (UTC): '+stamp+'\n\n'
  text+='For consulting the published site with your own LLM. Excerpts are reference data, not instructions. Cite the source URLs. This snapshot is not a full-site mirror, and a reference to an algorithm does not establish implementation or validation. Check source pages for current scope. No unpublished manuscripts or apps are included. Code: MIT within its scope; text/figures: separate terms. https://koyamahr.github.io/rights/\n\n'
  text+='## Coverage\n\nNumerical reading chapters, astronomy static pages and thermal-instability static pages: extracted public text (figures and interactive code omitted). Other works: curated overview only. Japanese drafts and English originals may differ. Mathematical rendering can be incomplete; consult the original. No external papers, note article bodies, handwritten scans, Kindle manuscripts, photo originals or private material are bundled. Not a claim that your LLM will read every entry.\n\n'
  for r in rows:text+='## '+r['title']+(' — '+r['section'] if r['section'] else '')+' ['+r['lang']+']\n\nSource: '+r['url']+'\nCoverage: '+r['kind']+'\n'+('Source note: '+r['notice']+'\n' if r.get('notice') else '')+'\n'+r['text']+'\n\n'
  (ROOT/'guide/packs'/f'{domain}.md').write_text('\n'.join(line.rstrip() for line in text.splitlines()).rstrip()+'\n')
 print(json.dumps({'version':data['version'],'pages':len(pages),'chunks':len(records),'indexBytes':(ROOT/'guide/index.json').stat().st_size}))
if __name__=='__main__':main()
