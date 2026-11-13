#!/usr/bin/env python3
"""Generate root-site sitemaps from tracked public HTML and git modification dates.

Run from any directory: python3 scripts/build-sitemaps.py
Project sites publish their own sitemaps; they are not scanned or copied here.
"""
from pathlib import Path
from html.parser import HTMLParser
import subprocess
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://koyamarium.github.io/'
NS = 'http://www.sitemaps.org/schemas/sitemap/0.9'
PROJECTS = {'numerical-methods-atlas', 'the-art-of-thermal-instability',
            'astronomy-step-by-step', 'the-art-of-numerical-algorithms',
            'retro-astro-jax', 'ko09-pme', 'college-notes'}
NONPUBLIC = {'.git', '.github', 'scripts', 'node_modules', 'dist', 'build',
             'tests', 'test', 'work', 'outputs', 'docs'}
ET.register_namespace('', NS)

class Robots(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.noindex = False
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'meta' and attrs.get('name', '').lower() in {'robots', 'googlebot'}:
            if 'noindex' in attrs.get('content', '').lower():
                self.noindex = True

def git(*args):
    return subprocess.check_output(['git', '-C', str(ROOT), *args], text=True)

def write(name, element):
    ET.indent(element, space='  ')
    ET.ElementTree(element).write(ROOT / name, encoding='utf-8', xml_declaration=True)
    with (ROOT / name).open('a') as out:
        out.write('\n')

def main():
    urlset = ET.Element(f'{{{NS}}}urlset')
    for rel in sorted(git('ls-files', '-z').split('\0')):
        p = Path(rel)
        if not rel or p.suffix.lower() != '.html' or not (ROOT / p).is_file():
            continue
        if any(part in NONPUBLIC for part in p.parts) or p.parts[0] in PROJECTS:
            continue
        if p.name.lower().startswith('google') or Robots((ROOT / p).read_text()).noindex:
            continue
        path = p.as_posix()
        if p.name == 'index.html':
            path = path[:-len('index.html')]
        item = ET.SubElement(urlset, f'{{{NS}}}url')
        ET.SubElement(item, f'{{{NS}}}loc').text = BASE + path
        modified = git('log', '-1', '--format=%cs', '--', rel).strip()
        if modified:
            ET.SubElement(item, f'{{{NS}}}lastmod').text = modified
    write('sitemap-main.xml', urlset)
    index = ET.Element(f'{{{NS}}}sitemapindex')
    for path in ['sitemap-main.xml', 'numerical-methods-atlas/sitemap.xml',
                 'the-art-of-thermal-instability/sitemap.xml',
                 'astronomy-step-by-step/sitemap.xml']:
        item = ET.SubElement(index, f'{{{NS}}}sitemap')
        ET.SubElement(item, f'{{{NS}}}loc').text = BASE + path
    write('sitemap.xml', index)
    print(f'Generated sitemap index and {len(urlset)} root HTML URLs')

if __name__ == '__main__':
    main()
