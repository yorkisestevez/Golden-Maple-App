#!/usr/bin/env python3
"""Look up items in the Carr Landscape Depot price list.

Usage:
    python3 lookup.py "river stone"
    python3 lookup.py umbriano --category paver_slab
    python3 lookup.py mulch --unit Yard

Searches name / variant / description / group / item_code (case-insensitive,
all terms must match somewhere in the row). Prints the matching items with
unit and price.
"""
import csv, sys, os, argparse

CSV = os.path.join(os.path.dirname(__file__),
                   '..', '..', '..', 'data', 'carr-landscape-depot-2026',
                   'price-list.csv')

SEARCH_FIELDS = ('group', 'name', 'variant', 'description', 'item_code')

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('terms', nargs='+', help='search term(s)')
    ap.add_argument('--category', help='filter: bulk|paver_slab|tile|natural_stone')
    ap.add_argument('--unit', help='filter by unit, e.g. Tonne, Yard, SqFt')
    ap.add_argument('--limit', type=int, default=50)
    args = ap.parse_args()

    path = os.path.abspath(CSV)
    if not os.path.exists(path):
        sys.exit(f'Price list not found at {path}')

    terms = [t.lower() for t in args.terms]
    rows = []
    with open(path, newline='') as f:
        for r in csv.DictReader(f):
            blob = ' '.join((r.get(k) or '') for k in SEARCH_FIELDS).lower()
            if not all(t in blob for t in terms):
                continue
            if args.category and r.get('format') != args.category:
                continue
            if args.unit and (r.get('unit') or '').lower() != args.unit.lower():
                continue
            rows.append(r)

    if not rows:
        print(f'No matches for: {" ".join(args.terms)}')
        return

    print(f'{len(rows)} match(es) — prices are TRADE, exclude HST, delivery extra:\n')
    for r in rows[:args.limit]:
        label = ' / '.join(x for x in (r['group'], r['name'], r['variant'],
                                       r['description']) if x)
        price = r['price'] or '?'
        extra = []
        if r['trade_price']:
            price = f"{r['price']} retail / {r['trade_price']} trade"
        if r['unit_price']:
            extra.append(r['unit_price'])
        if r['splitting_fee']:
            extra.append(f"split {r['splitting_fee']}")
        if r['delivery']:
            extra.append(f"del {r['delivery']}")
        dims = f" [{r['dimensions']}]" if r['dimensions'] else ''
        tail = ('  (' + ', '.join(extra) + ')') if extra else ''
        print(f"  p{r['page']:>2} | {label}{dims} — {price} /{r['unit'] or '?'}{tail}")
    if len(rows) > args.limit:
        print(f'\n... {len(rows) - args.limit} more (use --limit to see more)')

if __name__ == '__main__':
    main()
