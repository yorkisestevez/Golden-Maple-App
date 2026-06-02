#!/usr/bin/env python3
"""Parse the Carr Landscape Depot 2026 Price Book PDF into structured data.

Source PDF: "2026 Complete Price List V1" (Carr Landscape Depot, dated 05-27-2026).
Requires PyMuPDF:  pip install pymupdf

Usage:
    python extract.py [path/to/price-list.pdf]

Writes price-list.json and price-list.csv next to the input PDF.
Re-run after replacing the PDF to refresh the dataset.
"""
import fitz, re, json, csv, sys, os

PDF_PATH = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
    os.path.dirname(os.path.abspath(__file__)), 'price-list.pdf')
OUT_DIR = os.path.dirname(os.path.abspath(PDF_PATH)) or '.'
doc = fitz.open(PDF_PATH)

UNITS = {'SqFt', 'SqF', 'LnFt', 'Piece', 'Tonne', 'Yard', 'Each', 'Pallet', 'Bag', 'Skid'}
DOLLAR = re.compile(r'^\$')
CENT = re.compile(r'¢$')
GLUED = re.compile(r'^(SqFt|SqF|LnFt|Piece|Tonne|Yard|Each|Pallet|Bag|Skid)(\$[\d,].*|N/A)$')

NOISE_WORDS = {'Sold', 'By', 'Bundle', 'Pricing', 'Splitting', 'Fee', 'Delivery',
               'Pavers', 'Slabs', 'Item', 'Code', 'Length', 'Depth', 'Width',
               'Thickness', 'Price', 'Del.$/U', 'of', 'M', 'Size', 'Sizes'}

def clean(tok):
    return tok.replace('™', '').replace('®', '').replace('©', '').strip()

def is_money(t):
    if t.upper() == 'N/A':
        return True
    return bool(re.fullmatch(r'\$?\.?\d[\d,]*(?:\.\d+)?¢?', t))

def split_glued(toks):
    """Split tokens like 'Piece$1,469.58' -> ['Piece', '$1,469.58']."""
    out = []
    for t in toks:
        m = GLUED.match(t)
        if m:
            out.extend([m.group(1), m.group(2)])
        else:
            out.append(t)
    return out

def normmoney(toks):
    """Join a leading '$' token with the following number (PDF splits '$' '299.00')."""
    out = []
    i = 0
    while i < len(toks):
        if toks[i] == '$' and i + 1 < len(toks) and re.match(r'^[\d,]+(\.\d+)?$', toks[i+1]):
            out.append('$' + toks[i+1]); i += 2
        else:
            out.append(toks[i]); i += 1
    return out

def get_rows(page, halves=True, ytol=3.5):
    """Return list of (side, [tokens]) reconstructed by visual position."""
    mid = page.rect.width / 2
    words = page.get_text('words')
    blocks = [('L', 0, mid), ('R', mid, page.rect.width)] if halves else [('F', 0, page.rect.width)]
    rows = []
    for side, lo, hi in blocks:
        ws = [w for w in words if lo <= (w[0]+w[2])/2 < hi]
        ws.sort(key=lambda w: (w[1], w[0]))
        cur = []; cy = None
        lines = []
        for w in ws:
            if cy is None or abs(w[1]-cy) <= ytol:
                cur.append(w); cy = w[1] if cy is None else cy
            else:
                lines.append(cur); cur = [w]; cy = w[1]
        if cur: lines.append(cur)
        for ln in lines:
            ln.sort(key=lambda w: w[0])
            rows.append((side, [clean(w[4]) for w in ln if clean(w[4])]))
    return rows

FOOTER_MARKERS = ('Prices do not include', 'Prices are subject', 'DELIVERY CHARGES',
                  'ZONE ', 'If Quantity', 'Maximum Splitting', 'Information is accurate',
                  'NOT REGULARLY STOCKED', '** NOT', 'Page ')
HEADER_MARKERS = ('653 Dunlop', 'Phone:', 'www.carr', 'info@carr', 'Pricing Applies',
                  'Barrie,', 'DESIGNED TO CONNECT')

def is_boiler(text):
    return any(m in text for m in FOOTER_MARKERS + HEADER_MARKERS)

records = []

def classify(page):
    t = page.get_text()
    if 'Item' in t and 'Code' in t and 'NS-' in t:
        return 'natural_stone'
    if 'Skid' in t and 'Pricing' in t and 'Splitting' in t and 'NS-' not in t:
        return 'tile'
    if 'Bundle' in t and 'Pricing' in t and 'Splitting' in t:
        return 'paver_slab'
    if 'RETAIL' in t and 'TRADE' in t:
        return 'bulk'
    return None

# ---- Format parsers -------------------------------------------------

def parse_paver(page, pno):
    parent = None
    for side, toks in get_rows(page, halves=True):
        if not toks: continue
        text = ' '.join(toks)
        if is_boiler(text): continue
        toks = normmoney(split_glued(toks))
        # locate unit
        uidx = next((i for i, t in enumerate(toks) if t in UNITS), None)
        if uidx is None:
            # potential product header line (alpha, not noise)
            words_only = [t for t in toks if not is_money(t)]
            if words_only and not all(w in NOISE_WORDS for w in words_only) \
               and not is_money(toks[-1]) and len(text) > 1 and text not in ('I','II','I I'):
                cand = ' '.join(words_only).strip(' .–-_')
                if cand and not re.fullmatch(r'[^A-Za-z0-9]+', cand):
                    parent = cand
            continue
        name = ' '.join(toks[:uidx]).strip(' .–-_')
        unit = toks[uidx]
        prices = [t for t in toks[uidx+1:] if is_money(t)]
        if not prices: continue
        full = name
        if not name or re.match(r'^\d+\s*cm', name, re.I) or re.match(r'^\d+\s*x', name, re.I) \
           or name.lower() in ('colours','midnight','mix','combo','grey') \
           or 'Colours' in name or 'Premier' in name and len(name) < 14:
            full = f'{parent} — {name}'.strip(' —') if parent else name
        records.append({
            'page': pno, 'format': 'paver_slab', 'group': parent,
            'name': full or name, 'variant': name if full != name else None,
            'unit': unit,
            'price': prices[0] if len(prices) > 0 else None,
            'splitting_fee': prices[1] if len(prices) > 1 else None,
            'delivery': prices[2] if len(prices) > 2 else None,
            'raw': text,
        })

def parse_bulk(page, pno):
    section = None
    for side, toks in get_rows(page, halves=False):
        if not toks: continue
        text = ' '.join(toks)
        if is_boiler(text): continue
        if text in ('DESCRIPTION UM RETAIL TRADE', 'BULK PRODUCT & LANDSCAPE SUPPLY'):
            continue
        toks = normmoney(toks)
        uidx = next((i for i, t in enumerate(toks) if t in UNITS), None)
        if uidx is None:
            # section header (all caps, no prices)
            if text.upper() == text and re.search(r'[A-Z]', text) and len(text) > 2 \
               and not any(is_money(t) for t in toks):
                section = text
            continue
        name = ' '.join(toks[:uidx]).strip()
        unit = toks[uidx]
        prices = [t for t in toks[uidx+1:] if is_money(t)]
        if not prices or not name: continue
        records.append({'page': pno, 'format': 'bulk', 'group': section,
                        'name': name, 'variant': None, 'unit': unit,
                        'price': prices[0],
                        'trade_price': prices[1] if len(prices) > 1 else None,
                        'splitting_fee': None, 'delivery': None,
                        'raw': text})

def parse_natural(page, pno):
    colour = None       # ALL-CAPS colour name
    product = None      # product group description (Steps - ..., Coping - ...)
    sold_by = None
    rows = get_rows(page, halves=False)
    seq = [t for s, t in rows if t]
    pending = None  # (dims, money) from an orphan price line preceding a code line
    for toks in seq:
        text = ' '.join(toks)
        if is_boiler(text): continue
        nsidx = next((i for i, t in enumerate(toks) if t.startswith('NS-')), None)
        if nsidx is not None:
            toks2 = normmoney(toks)
            nsidx = next((i for i, t in enumerate(toks2) if t.startswith('NS-')), nsidx)
            code = toks2[nsidx]
            desc = ' '.join(toks2[:nsidx]).strip(' -–')
            # dimensions (num + 'in') and money tokens after the code
            dims, money = [], []
            j = nsidx + 1
            while j < len(toks2):
                if re.match(r'^[\d.]+$', toks2[j]) and j+1 < len(toks2) and toks2[j+1] == 'in':
                    dims.append(toks2[j] + ' in'); j += 2; continue
                if is_money(toks2[j]):
                    money.append(toks2[j])
                j += 1
            if not money and pending:   # price was on the preceding line
                dims, money = pending
            pending = None
            records.append({'page': pno, 'format': 'natural_stone',
                            'group': colour, 'name': product,
                            'variant': desc or code,
                            'item_code': code, 'dimensions': ', '.join(dims),
                            'unit': sold_by, 'description': desc or None,
                            'price': money[0] if len(money) > 0 else None,
                            'splitting_fee': money[1] if len(money) > 1 else None,
                            'delivery': money[2] if len(money) > 2 else None,
                            'raw': text})
            continue
        # orphan price line (dims + money, no code) preceding a '+size' code line
        toks2 = normmoney(toks)
        if any(t.startswith('$') for t in toks2) and not any(t.startswith('NS-') for t in toks2):
            dims, money = [], []
            j = 0
            while j < len(toks2):
                if re.match(r'^[\d.]+$', toks2[j]) and j+1 < len(toks2) and toks2[j+1] == 'in':
                    dims.append(toks2[j] + ' in'); j += 2; continue
                if is_money(toks2[j]):
                    money.append(toks2[j])
                j += 1
            if money and 'per Ton' not in text:
                pending = (dims, money)
                continue
        # "$126.00 per Ton" continuation -> attach to last natural-stone record
        m = re.search(r'(\$[\d,]+(?:\.\d+)?)\s*per\s*Ton', text, re.I)
        if m and records and records[-1]['format'] == 'natural_stone':
            records[-1]['unit_price'] = m.group(1) + ' per Ton'
            # a colour label may precede the price on the same line
            lead = text[:m.start()].strip(' -–')
            if lead and lead.upper() == lead and re.search(r'[A-Z]', lead):
                records[-1]['group'] = lead
            continue
        if text.startswith('Sold by') or text.startswith('Sold By'):
            m = re.search(r'Sold [Bb]y (\w[\w ]*?)(?: Sizes| Top| Flamed| Natural|$|,)', text)
            if m: sold_by = m.group(1).strip()
            continue
        if re.match(r'^(Steps|Coping|Curbs|Pier Caps|Flagstone|Treads|Wall|Caps|Risers|Slab|Pavers|Accessories|Drop|Bullnose|Square|Random)', text, re.I) and '-' in text:
            product = text; continue
        if re.match(r'^(Steps|Coping|Curbs|Pier Caps|Flagstone|Treads|Wall|Caps|Accessories)', text, re.I):
            product = text; continue
        # colour header: all caps, short, no digits-only
        letters = re.sub(r'[^A-Za-z]', '', text)
        if letters and text.upper() == text and len(text) <= 30 and not text.startswith('NS-') \
           and 'ITEM' not in text and 'PRICE' not in text:
            colour = text

def parse_tile(page, pno):
    """Tile/Porcelain: Name SIZE | Unit | SkidSize | $Price | Splitting | Delivery."""
    for side, toks in get_rows(page, halves=False):
        if not toks: continue
        text = ' '.join(toks)
        if is_boiler(text): continue
        toks = normmoney(split_glued(toks))
        uidx = next((i for i, t in enumerate(toks) if t in UNITS), None)
        if uidx is None: continue
        name = ' '.join(toks[:uidx]).strip()
        after = [t for t in toks[uidx+1:] if is_money(t)]
        if not name or not after: continue
        # first bare number = skid size; first $ = price; rest = split, delivery
        skid = next((t for t in after if not t.startswith('$') and t.upper() != 'N/A' and '¢' not in t), None)
        rest = [t for t in after if t != skid]
        records.append({'page': pno, 'format': 'tile', 'group': 'TILE / PORCELAIN',
                        'name': name, 'variant': None, 'unit': toks[uidx],
                        'skid_size': skid,
                        'price': rest[0] if len(rest) > 0 else None,
                        'splitting_fee': rest[1] if len(rest) > 1 else None,
                        'delivery': rest[2] if len(rest) > 2 else None,
                        'raw': text})

for i in range(doc.page_count):
    page = doc[i]
    pno = i + 1
    fmt = classify(page)
    if fmt == 'natural_stone':
        parse_natural(page, pno)
    elif fmt == 'tile':
        parse_tile(page, pno)
    elif fmt == 'paver_slab':
        parse_paver(page, pno)
    elif fmt == 'bulk':
        parse_bulk(page, pno)

# dedupe exact rows
seen = set(); uniq = []
for r in records:
    k = (r['page'], r.get('name'), r.get('variant'), r.get('price'), r.get('raw'))
    if k in seen: continue
    seen.add(k); uniq.append(r)
records = uniq

print('TOTAL RECORDS:', len(records))
from collections import Counter
print('by format:', Counter(r['format'] for r in records))

with open(os.path.join(OUT_DIR, 'price-list.json'), 'w') as f:
    json.dump(records, f, indent=2, ensure_ascii=False)

cols = ['page','format','group','name','variant','description','item_code','dimensions',
        'unit','skid_size','price','trade_price','unit_price','splitting_fee','delivery','raw']
with open(os.path.join(OUT_DIR, 'price-list.csv'), 'w', newline='') as f:
    w = csv.DictWriter(f, fieldnames=cols, extrasaction='ignore')
    w.writeheader()
    for r in records: w.writerow(r)
print('wrote json + csv')
