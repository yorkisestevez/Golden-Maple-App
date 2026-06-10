# Estevez Intelligence

**Applied intelligence for real-world businesses.**

The parent / venture-studio brand above the operating businesses (Northbound Dispatch,
Golden Maple + estimate-ai, ...). This folder holds Estevez Intelligence–branded
documents and the shared PDF brand system used to generate them.

## What's here

```
estevez-intelligence/
├── brand.py                        # shared PDF branding (ReportLab): palette, mark, flowables
├── generate_concept_whitepaper.py  # "The AI-Leveraged Service Business" concept & method whitepaper
├── requirements.txt
└── output/
    └── Estevez-Intelligence-Concept-Whitepaper.pdf
```

## The whitepaper

**"The AI-Leveraged Service Business — Concept & Method"** explains the core business
concept using **Northbound Dispatch** as the worked case study, then generalizes it into
a repeatable method for building and scaling similar AI-leveraged, asset-light service
businesses. 8 pages: thesis → case study → why it works → the method → the shared stack →
scaling to other industries → economics of replication → risks → conclusion.

## Build

```bash
cd estevez-intelligence
pip install -r requirements.txt
python3 generate_concept_whitepaper.py        # writes output/Estevez-Intelligence-Concept-Whitepaper.pdf
```

Pass an output path to override: `python3 generate_concept_whitepaper.py /tmp/my.pdf`

## Brand system

| Token | Hex | Role |
|-------|-----|------|
| Ink | `#0A0E1A` | near-black navy — authority, dark backgrounds |
| Indigo | `#6C5CE7` | signature accent — intelligence / AI |
| Gold | `#F2B441` | premium highlight |
| Cyan | `#22D3EE` | data / tech accent |
| Light | `#F5F6FA` | light surfaces |
| Grey | `#646B7C` | muted text |

- **Mark:** a rounded indigo tile holding four nodes on an ascending path — "applied
  intelligence lifting a business upward."
- **Type:** Helvetica (headings/body) + Courier (labels/data). Zero external font
  dependencies so the generators run anywhere; swap in brand TTFs via
  `pdfmetrics.registerFont` if desired.
- **Tagline:** *Applied intelligence for real-world businesses.*

Brand helpers live in `brand.py` (`styles`, `make_page_decorator`, `make_cover_decorator`,
`section_heading`, `callout`, `stat_tiles`, `data_table`, `numbered_step`, `draw_mark`) and
are reusable for future Estevez Intelligence documents.
