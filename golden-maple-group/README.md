# Golden Maple Group

**Built for longevity. Designed for life.**

The parent / venture-studio brand above the operating businesses (Golden Maple
Landscaping, Northbound Dispatch, estimate-ai, ...). This folder holds Golden
Maple Group–branded documents and the shared PDF brand system used to generate them.

## What's here

```
golden-maple-group/
├── brand.py                        # shared PDF branding (ReportLab): palette, maple-leaf mark, Montserrat, flowables
├── generate_investor_brief.py      # bilingual (EN/ES) investor brief
├── generate_concept_whitepaper.py  # "The AI-Leveraged Service Business" concept & method whitepaper
├── fonts/                          # Montserrat (brand font), static weights
├── requirements.txt
└── output/
    ├── Golden-Maple-Group-Investor-Brief-EN-ES.pdf
    └── Golden-Maple-Group-Concept-Whitepaper.pdf
```

## The documents

- **Investor Brief (EN/ES)** — investor-facing overview of the venture-studio thesis
  (Northbound Dispatch as the proof point). Every section is English + Spanish side by side:
  executive summary, opportunity, solution & moat, business model, traction/portfolio,
  market/replication, financial projections, the ask & use of funds, why now & team, contact.
- **Concept & Method whitepaper** — explains the core business concept via Northbound Dispatch,
  then generalizes it into a repeatable method for scaling similar AI-leveraged, asset-light
  service businesses.

> Financial figures in both documents are clearly labelled **illustrative planning estimates**,
> not guarantees — confirm the raise amount, projections, and contact details before sending.

## Build

```bash
cd golden-maple-group
pip install -r requirements.txt
python3 generate_investor_brief.py        # → output/Golden-Maple-Group-Investor-Brief-EN-ES.pdf
python3 generate_concept_whitepaper.py    # → output/Golden-Maple-Group-Concept-Whitepaper.pdf
```

Pass an output path to override: `python3 generate_investor_brief.py /tmp/my.pdf`

## Brand system

Per the Golden Maple Landscaping Brand Guidelines (gold-forward, premium, calm) and the
dark + gold social system.

| Token | Hex | Role |
|-------|-----|------|
| Ink | `#0E0E0C` | warm near-black — covers, header bands |
| Gold | `#D4B06A` | primary accent — mark, numbers, rules |
| Gold (light) | `#E2C27D` | hover / lighter gold |
| Cream | `#F3E9D6` | soft accent — callout fills |
| Text | `#111111` | body text |
| Paper | `#FAF8F4` | warm white surface |

- **Mark:** a gold maple leaf (drawn in `brand.py`, no external asset needed).
- **Type:** **Montserrat** (bundled static weights in `fonts/`). Falls back to Helvetica if the
  TTFs are missing. Letter-spaced uppercase for kickers/labels, generous negative space.
- **Tagline:** *Built for longevity. Designed for life.*

Brand helpers live in `brand.py` (`styles`, `make_page_decorator`, `make_cover_decorator`,
`section_heading`, `callout`, `stat_tiles`, `data_table`, `numbered_step`, `draw_leaf`) and are
reusable for future Golden Maple Group documents.
