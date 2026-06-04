---
name: carr-pricing
description: Look up Carr Landscape Depot material costs when building quotes or estimates for Golden Maple. Use whenever a quote needs supplier pricing for landscaping materials — aggregates, sand, gravel, mulch, soil, seed/fertilizer, slabs, pavers, retaining walls, steps, curbs, edging, porcelain tile, or natural stone (flagstone, coping, armour stone). Triggers on questions like "how much is X", "price for X", "quote for a patio/wall/walkway", or "what does Carr charge for X".
---

# Carr Landscape Depot — Pricing

Golden Maple's primary materials supplier (Barrie, ON). This skill answers
material-cost questions and feeds quotes from the supplier's official price book.

## Current edition

- **2026 Complete Price List, V1** — effective **2026-05-27**
- **853 items**: bulk aggregate/soil/mulch (59), slabs & pavers (358),
  porcelain tile (39), natural stone (397)
- Listed prices are **TRADE** prices, **exclude HST (13%)**, and **delivery is
  extra** (the bulk section also lists retail prices).

## Where the data lives (source of truth)

All in `data/carr-landscape-depot-2026/` (relative to repo root):

- `price-list.csv` — all 853 items, flat columns (best for lookups/math)
- `price-list.json` — same data, structured
- `quoting-reference.md` — human-readable, grouped by section
- `extract.py` — regenerates the data from a new PDF

## How to look up a price

Use the helper (fast, handles the column layout):

```bash
python3 .claude/skills/carr-pricing/lookup.py "river stone"
python3 .claude/skills/carr-pricing/lookup.py "umbriano" --category paver_slab
```

Or grep the CSV directly:

```bash
grep -i "limestone" data/carr-landscape-depot-2026/price-list.csv
```

Match generously (supplier names vary, e.g. "1\" Riverstone" vs "River Stone")
and show the user the unit and exact item you matched.

## Column / price meaning

CSV/JSON columns (the CSV header uses `format`/`group`/`page`):

| Column | Meaning |
|--------|---------|
| `format` | `bulk`, `paver_slab`, `tile`, `natural_stone` (the `--category` filter) |
| `group` | section / family / stone colour |
| `name`, `variant`, `description` | item identity |
| `item_code`, `dimensions` | natural-stone SKU + size |
| `unit` | Tonne, Yard, Each, SqFt, LnFt, Piece, Pound, etc. |
| `price` | primary price, exactly as printed (e.g. `$27.60`, `.063¢`, `N/A`) |
| `trade_price` | bulk only: trade price (or, for Carr Caddy bags on p6, the *Delivered* price vs. `price` = *F.O.B. Barrie*) |
| `unit_price` | armour stone: bulk price per ton |
| `splitting_fee`, `delivery` | per-unit fees for partial bundles / zone delivery |
| `page` | source PDF page |

(In the app DB / migration 006 the equivalents are `category`, `product_group`,
`source_page`, plus parsed `price_cad` / `trade_price_cad` numerics.)

For arithmetic, the JSON also carries `price_cad` (parsed number); in the CSV,
strip the `$` from `price`. A handful of armour-stone items price in cents per
pound and carry the usable rate in `unit_price` ("$X per Ton") instead.

## Quoting guidance

- Quote from the **trade** price unless told otherwise.
- **Add HST (13%)** and **delivery** on top — they are NOT in the listed price.
- Pavers/slabs/tile are priced per SqFt/LnFt/Piece but sold by full
  bundle/skid; partial bundles incur the `splitting_fee` (max $20–$25/line).
- Always state the unit and that prices are "subject to change" — confirm with
  Carr (705-726-3253) for anything high-value or time-sensitive.
- This data is also seeded into the app DB: `material_prices` table,
  migration `006_carr_material_prices.sql`.

## Updating to a new edition

When Carr issues a new price book:

1. Save the new PDF as `data/carr-landscape-depot-2026/price-list.pdf`.
2. `pip install pymupdf && python3 data/carr-landscape-depot-2026/extract.py`
   (regenerates the CSV/JSON).
3. Regenerate `quoting-reference.md` and migration `006` from the JSON.
4. Update the **Current edition** section above (date, version, item count).
