"""Reproduce the profession join. Pass a locally saved BLS Table 1.2 HTML file and site root."""
import argparse
from html.parser import HTMLParser
from pathlib import Path
import json
import re

class Rows(HTMLParser):
    def __init__(self):
        super().__init__()
        self.rows = []
        self.row = []
        self.cell = None

    def handle_starttag(self, tag, attrs):
        if tag == 'tr':
            self.row = []
        elif tag in ('td', 'th'):
            self.cell = []

    def handle_endtag(self, tag):
        if tag in ('td', 'th') and self.cell is not None:
            self.row.append(' '.join(''.join(self.cell).split()))
            self.cell = None
        elif tag == 'tr' and self.row:
            self.rows.append(self.row)

    def handle_data(self, data):
        if self.cell is not None:
            self.cell.append(data)

def main():
    args = argparse.ArgumentParser()
    args.add_argument('html', type=Path)
    args.add_argument('site', type=Path)
    options = args.parse_args()
    needed = set()
    for page in (options.site / 'content/professions').glob('*.mdx'):
        match = re.search(r'^occupationCode: "(\d\d-\d{4})\.', page.read_text(), re.M)
        if not match:
            raise ValueError(f'Missing occupation code: {page}')
        needed.add(match[1])
    parser = Rows()
    parser.feed(options.html.read_text())
    expected_header = "Employment change, percent, 2025–35"
    headers = [row for row in parser.rows if len(row) > 8 and row[8] == expected_header]
    if len(headers) != 1 or headers[0][1] != "2025 National Employment Matrix code" or headers[0][4] != "Employment, 2035":
        raise ValueError("Expected BLS Table 1.2 with the 2025–35 percent-change column at index 8")
    columns = [r for r in parser.rows if len(r) > 8 and r[2] == 'Line item' and r[1] in needed]
    if {r[1] for r in columns} != needed or len(columns) != len(needed):
        raise ValueError('Missing or duplicate occupational matches in BLS table')
    rows = [dict(soc=r[1], title=r[0], percentChange=float(r[8].replace('−', '-'))) for r in columns]
    print(json.dumps(dict(source="US Bureau of Labor Statistics, Employment Projections, Table 1.2",
                          url="https://www.bls.gov/emp/tables/occupational-projections-and-characteristics.Htm",
                          period="2025–35", units="Percent change in projected employment, 2025 to 2035",
                          rows=sorted(rows, key=lambda r: r['soc'])), indent=2, ensure_ascii=False))
if __name__ == '__main__':
    main()
