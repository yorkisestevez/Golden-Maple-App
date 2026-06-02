# Carr Landscape Depot — 2026 Complete Price List

Structured extraction of every priced item from the **Carr Landscape Depot
2026 Price Book** (a division of D. Carr Excavating Ltd.).

- **Source document:** `2026-Complete-Price-List-V1` (PDF, 55 pages)
- **Effective / printed:** May 27, 2026 (V1)
- **Supplier:** Carr Landscape Depot — 653 Dunlop Street West, Barrie, ON L4N 9W9 · 705‑726‑3253 · info@carrlandscapedepot.com
- **Extracted:** 2026‑06‑02 · **853 line items**

> Prices are exclusive of H.S.T. Delivery is extra. Terms, zone delivery
> charges, and restocking rules are in the source PDF (pages 2–4) and are
> **not** reproduced here — this dataset is the item/price table only.

## Files

| File | Description |
|------|-------------|
| `price-list.json` | All 853 items as a JSON array (full fidelity, includes `raw` source row). |
| `price-list.csv`  | Same data, flat CSV — easiest for spreadsheets / imports. |
| `extract.py`      | The PyMuPDF parser used to generate the data. Re-run after dropping a new `price-list.pdf` here. |

**Loaded into the app:** `estimate-ai/supabase/migrations/006_carr_material_prices.sql`
creates a `material_prices` table and seeds all 853 items for the Golden Maple
contractor, so the catalog is queryable in-app when building quotes. Re-running
the migration replaces the existing Carr list. (See `MaterialPrice` in
`estimate-ai/lib/types.ts`.)

The source PDF itself is **not** committed (it is a large, expiring CDN link).
To regenerate: place the PDF as `price-list.pdf` in this folder and run
`pip install pymupdf && python extract.py`.

## Item counts by section

| Format (`format` field) | Items | Source pages | What it covers |
|-------------------------|------:|--------------|----------------|
| `bulk`          |  59 | 5–6   | Bulk aggregate, granite, mulch, soils, seed/fertilizer, accessories, Carr Caddy bags |
| `paver_slab`    | 358 | 7–19  | Slabs, pavers, walls, steps, curbs, edging, outdoor features (117 product lines) |
| `tile`          |  39 | 25–26 | Porcelain tile / pavers |
| `natural_stone` | 397 | 27–55 | Natural stone — flagstone, coping, steps, curbs, pier caps, armour stone (27 colours/materials) |

Pages 1–4 (cover, terms & conditions, contractor rebate program) and the
photo-only catalog pages (11, 20, 21, 23, 24) contain no item pricing.

## Field reference

Not every field applies to every format; unused fields are `null`.

| Field | Meaning |
|-------|---------|
| `page` | Source PDF page number. |
| `format` | One of `bulk`, `paver_slab`, `tile`, `natural_stone`. |
| `group` | Section / product family / stone colour the item belongs to. |
| `name` | Item (or product) name. |
| `variant` | Sub-option, e.g. *Prestige Colours*, *Standard Colours*, a size, or (for natural stone) the item description. |
| `description` | Natural stone: the full item description (e.g. *Coping – Flamed Top, Sawn Bottom…*). |
| `item_code` | Natural stone SKU (e.g. `NS-CSVALR2001248+Length`). `+Length`/`+size` codes are templates completed at order time. |
| `dimensions` | Natural stone dimensions (e.g. `12 in, 2 in`). |
| `unit` | Unit of measure: `SqFt`, `SqF`, `LnFt`, `Piece`, `Tonne`, `Yard`, `Each`, `Bag`, `Square Foot`, `Linear Foot`, `Pound`. |
| `skid_size` | Tile only: pieces/sq ft per skid. |
| `price` | Primary price. **bulk** → Retail; **paver_slab / tile / natural_stone** → unit/bundle price. |
| `trade_price` | **bulk** only: Trade price (or, for Carr Caddy bags on p6, the *Delivered* price vs. `price` = *F.O.B. Barrie*). |
| `unit_price` | Armour stone: bulk price per ton (e.g. `$126.00 per Ton`). |
| `splitting_fee` | Per-unit splitting fee (cents or dollars, as printed). |
| `delivery` | Per-unit delivery rate used in the zone delivery calculation. |
| `raw` | The raw reconstructed source row, for verification. |

## Notes & caveats

- **Pavers/slabs/tile** are sold by the bundle/skid; `price` is the per‑unit
  (sq ft / piece) price, with `splitting_fee` and `delivery` as printed.
- **Trade pricing** for pavers/natural stone is not a separate column in the
  source — the book is the *TRADE 2026* edition, so listed prices are trade
  prices. The `bulk` pages are the only ones showing both Retail and Trade.
- Prices are transcribed exactly as printed (e.g. cent values like `.063¢`,
  `38.8¢`). `N/A` means the supplier listed no value for that column.
- Natural stone `+size` / `+Length` codes are price templates: the listed
  price applies across the size options noted in the source row; the final SKU
  is completed with the chosen size at order time.
- Always confirm current pricing with the supplier — the source notes prices
  are *subject to change without notice.*
