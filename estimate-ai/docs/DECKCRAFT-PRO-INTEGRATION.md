# DeckCraft Pro Integration Guide

> Full setup, configuration, and operational reference for the DeckCraft Pro decking estimator embedded inside EstimateAI.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Installation Steps](#installation-steps)
4. [Database Setup](#database-setup)
5. [File Reference](#file-reference)
6. [How the Wizard Works](#how-the-wizard-works)
7. [Route Configuration](#route-configuration)
8. [Dashboard Settings](#dashboard-settings)
9. [Lead Capture API](#lead-capture-api)
10. [Branding System](#branding-system)
11. [CSS Classes](#css-classes)
12. [Embedding on External Sites](#embedding-on-external-sites)
13. [Calculation Engine](#calculation-engine)
14. [Troubleshooting](#troubleshooting)

---

## Overview

DeckCraft Pro is a contractor-grade residential deck estimating tool for Ontario, featuring a 5-step wizard, live canvas visualizer, branded material takeoff, and detailed cost breakdown. It is embedded inside EstimateAI as a premium estimator type that contractors can enable from their dashboard.

**What it does:**
- 5-step wizard: Setup → Design → Materials → Features → Estimate
- Ontario-specific pricing (municipalities, permits, soil conditions, OBC compliance)
- 21+ decking materials (PT Pine, Cedar, Ipe, Trex, Deckorators, TimberTech, AZEK)
- 9 railing systems with auto-calculated linear footage
- in-lite lighting system integration (17 products)
- Live drag-to-resize canvas deck visualizer
- SVG deck plan diagram with board patterns, breaker boards, stairs, railings
- Branded material takeoff list with supplier links
- Per-contractor configurable pricing (crew rates, permit fees, waste factors, material costs)
- Lead capture via webhook API
- Embeddable via iframe for contractor websites

---

## Architecture

```
EstimateAI (Next.js 16 SaaS)
├── /estimator/[slug]/decking     ← Public estimator route
├── /embed/[slug]/decking         ← Iframe embed route
├── /dashboard/decking-settings   ← Contractor settings page
├── /api/webhook/decking-lead     ← Lead submission API
│
├── components/estimator/decking/
│   ├── DeckingEstimatorShell.tsx  ← Main 5-step wizard (1850 lines)
│   ├── DeckDiagram.tsx           ← SVG deck plan renderer
│   └── BrandedMaterialsList.tsx  ← Material takeoff component
│
├── lib/decking/
│   ├── types.ts                  ← All types, constants, product data
│   ├── calculations.ts           ← Full calculation engine (671 lines)
│   └── seed-settings.ts          ← Default contractor settings
│
└── supabase/migrations/
    └── 004_decking_estimator.sql ← Database schema
```

**Data flow:**
1. Server component loads contractor + settings from Supabase
2. Passes both as props to `DeckingEstimatorShell` (client component)
3. User fills out 5-step wizard
4. Calculations run client-side via `calculateEstimate(data, settings)`
5. Lead submission POSTs to `/api/webhook/decking-lead`

---

## Installation Steps

### Step 1: Install Dependencies

```bash
cd /c/Business/projects/estimateai/estimate-ai
npm install jspdf jspdf-autotable
```

> `framer-motion`, `clsx`, `tailwind-merge`, and `lucide-react` are already in the project.

### Step 2: Run the Database Migration

Apply the migration to your Supabase project:

```bash
# Option A: Via Supabase CLI
supabase db push

# Option B: Via Supabase Dashboard
# Copy the contents of supabase/migrations/004_decking_estimator.sql
# and run it in the SQL Editor at https://supabase.com/dashboard
```

**What this migration does:**
- Creates `decking_settings` table with JSONB columns for all pricing config
- Adds `estimator_type` and `decking_data` columns to the existing `leads` table
- Sets up RLS policies so contractors can only read/write their own settings
- Creates an auto-update trigger for the `updated_at` timestamp

### Step 3: Verify the Build

```bash
npm run build
```

You should see these routes in the build output:
```
├ ƒ /embed/[slug]/decking
├ ƒ /estimator/[slug]/decking
├ ○ /dashboard/decking-settings
```

### Step 4: Start the Dev Server

```bash
npm run dev
```

### Step 5: Enable DeckCraft Pro for a Contractor

1. Log in to the dashboard as a contractor
2. Click **"Decking Estimator"** in the sidebar (Hammer icon)
3. Click **"Enable DeckCraft Pro"**
4. This creates a `decking_settings` row with default Ontario pricing
5. The estimator is now live at `/estimator/{contractor-slug}/decking`

---

## Database Setup

### Table: `decking_settings`

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | UUID | auto | Primary key |
| `contractor_id` | UUID | required | FK to contractors table (unique per contractor) |
| `materials` | JSONB | `[]` | Array of MaterialTier objects (21 materials with costs) |
| `crew_rates` | JSONB | `{}` | Per-municipality crew day rates: `{"Toronto": 1350, "Barrie": 1180, ...}` |
| `permit_fees` | JSONB | `{}` | Per-municipality building permit fees: `{"Toronto": 215, ...}` |
| `engineering_fee` | NUMERIC | 1500 | Structural engineering review cost |
| `railing_costs` | JSONB | `{}` | Per-railing-type costs: `{"Aluminum": {"material": 60, "install": 55, "spacing": 6, "postCost": 95}}` |
| `stair_tread_costs` | JSONB | `{}` | Per-material stair costs: `{"pine": 24, "cedar": 40, "composite": 85}` |
| `waste_factors` | JSONB | `{}` | Per-pattern waste multiplier: `{"Straight": 1.10, "Diagonal": 1.18, ...}` |
| `is_enabled` | BOOLEAN | false | Whether the decking estimator is active |
| `created_at` | TIMESTAMPTZ | NOW() | Auto-set on creation |
| `updated_at` | TIMESTAMPTZ | NOW() | Auto-updated via trigger |

### Leads Table Additions

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `estimator_type` | TEXT | 'standard' | `'standard'` for regular estimates, `'decking'` for deck estimates |
| `decking_data` | JSONB | null | Full DeckData snapshot (dimensions, materials, all selections) |

### RLS Policies

- **Contractors** can SELECT, INSERT, UPDATE their own settings (where `contractor_id = auth.uid()`)
- **Public** can SELECT settings where `is_enabled = true` AND contractor has active/trialing subscription
- Auto-update trigger keeps `updated_at` current

---

## File Reference

### Core Components

| File | Lines | Purpose |
|------|-------|---------|
| `components/estimator/decking/DeckingEstimatorShell.tsx` | ~1850 | Main wizard: 5 steps, all UI, step navigation, branding injection |
| `components/estimator/decking/DeckDiagram.tsx` | 420 | SVG deck plan with board patterns, breaker boards, stairs, railings |
| `components/estimator/decking/BrandedMaterialsList.tsx` | 832 | Material takeoff: framing, decking, hardware, lighting with supplier links |

### Library

| File | Lines | Purpose |
|------|-------|---------|
| `lib/decking/types.ts` | 250 | All TypeScript types, enums, constants, product data (21 materials, 17 lighting products, 9 railing types) |
| `lib/decking/calculations.ts` | 671 | Full calculation engine: area, framing, foundation, fasteners, railing, stairs, lighting, labor, overhead, profit |
| `lib/decking/seed-settings.ts` | 20 | Default DeckingSettings object used when contractor first enables the feature |

### Routes

| File | Route | Type |
|------|-------|------|
| `app/estimator/[slug]/decking/page.tsx` | `/estimator/:slug/decking` | Server component, public |
| `app/embed/[slug]/decking/page.tsx` | `/embed/:slug/decking` | Server component, noindex |
| `app/dashboard/decking-settings/page.tsx` | `/dashboard/decking-settings` | Client component, auth required |
| `app/api/webhook/decking-lead/route.ts` | `POST /api/webhook/decking-lead` | API route |

### Modified Files

| File | Change |
|------|--------|
| `components/dashboard/Sidebar.tsx` | Added "Decking Estimator" nav item with Hammer icon |
| `app/globals.css` | Added DeckCraft Pro CSS classes (card-slate, btn-primary, btn-secondary, input-field, number-font, brand-* utilities) |

---

## How the Wizard Works

### Step 1: Setup
User configures the project foundation:
- **Customer name** and **project address** (text inputs)
- **Deck type**: Attached, Freestanding, Floating, Add-on
- **Add-on config** (if Add-on selected): Transition labor, hardware cost, ledger flashing
- **Municipality**: Toronto, Barrie, Simcoe County, Burlington-Oakville, Rural-Other
- **Site type**: Standard, Waterfront-Lakefront, Hillside, Urban Tight, Island-Ferry
- **Soil condition**: Unknown, Sandy, Clay, Shallow Bedrock, Fill
- **Build season**: Spring-Summer, Fall, Winter (affects labor multiplier)
- **Intended load**: Standard, Heavy (triggers engineering requirement)
- **Foundation**: Concrete Piers, Helical Piles, Deck Blocks

### Step 2: Design
User defines the physical deck shape:
- **Width, Length, Height** (number inputs with visual progress bars)
- **Multi-level support**: 1, 2, or 3 levels with independent dimensions per level
- **L-Shape cutouts**: Inner width/length for L-shaped decks
- **Deck shape**: Rectangle, L-Shape, Multi-corner, Curved
- **Board pattern**: Straight, Diagonal, Picture Frame, Herringbone
- **Live canvas visualizer**: Drag handles to resize the deck shape interactively
- Real-time stats: Area (sqft), Perimeter (lf), Est. Boards, Est. Joists

### Step 3: Materials
User selects the decking surface and framing:
- **Decking material**: 21 options from PT Pine ($3.25/sqft) to Ipe ($28/sqft), including Trex, Deckorators, TimberTech lines
- **Board width**: 5.5" (standard) or 3.5" (narrow)
- **Picture frame border**: None, Single, or Double
- **Joist spacing**: 16" OC (standard) or 12" OC (heavy duty)
- **Fastening system**: Face Screws (visible) or Hidden Clips (seamless)
- **Custom inlay**: Toggle with linear feet input, auto-adds ladder blocking

### Step 4: Features
User adds railings, stairs, lighting, and accessories:
- **Railing system**: 10 options (None, Wood Picket, Aluminum, Cable, Glass, Trex, Fortress, TimberTech)
  - Auto-calculated linear footage based on perimeter + stair railing
  - Manual override option
  - OBC compliance warnings for height > 24" and > 71"
- **Stairs**: Flights (0-4), width, type (Straight/Winder/Landing), position (Front/Left/Right/Back), offset slider
- **in-lite Lighting**: Product selector (17 items across 5 categories), quantity per product, wire distance to transformer
- **Add-ons**: Built-in bench (lf), privacy screen (sqft), drainage system, demo/removal, pergola (sqft)

### Step 5: Estimate
Full cost breakdown with interactive overrides:
- **Hero card**: Total investment, cost/sqft, deck area, man-hours
- **Quick adjustments**: Custom labor cost override, material markup percentage
- **Itemized sections** (collapsible accordion):
  - Permits & Professional Fees
  - Foundation & Footings
  - Structural Framing
  - Decking (with breaker board logic for long decks)
  - Hardware & Fasteners
  - Railing System
  - Labour (Construction & Build)
  - in-lite Lighting System
  - Add-ons & Extras
  - Overhead (18%), Contingency (10%), Profit (15%)
- **Flags/warnings**: Estimate sanity checks, OBC compliance notes, breaker board recommendations
- **DeckDiagram**: Full SVG deck plan visualization
- **BrandedMaterialsList**: Complete material takeoff with supplier links

---

## Route Configuration

### Public Estimator: `/estimator/[slug]/decking`

**How it loads:**
```
1. URL: /estimator/golden-maple/decking
2. Server component extracts slug = "golden-maple"
3. Supabase query: SELECT * FROM contractors WHERE slug = 'golden-maple'
4. Supabase query: SELECT * FROM decking_settings WHERE contractor_id = {id} AND is_enabled = true
5. Maps snake_case DB columns → camelCase props
6. Falls back to DEFAULT_DECKING_SETTINGS if no settings row exists
7. Renders <DeckingEstimatorShell contractor={...} settings={...} source="website" />
```

### Embed: `/embed/[slug]/decking`

Identical to public route but:
- Sets `robots: 'noindex, nofollow'` metadata
- Passes `source="embed"` to the component

### Dashboard: `/dashboard/decking-settings`

**Authentication required.** Client component that:
1. Loads authenticated user via `supabase.auth.getUser()`
2. Queries `decking_settings` for that user's contractor ID
3. If no row exists: shows "Enable DeckCraft Pro" activation screen
4. If row exists: shows full settings editor with collapsible sections
5. Save button upserts all settings to Supabase

---

## Dashboard Settings

Contractors configure their deck estimator pricing from `/dashboard/decking-settings`:

### Enabling the Feature
- First visit shows an activation screen with feature description
- Click "Enable DeckCraft Pro" to create settings with Ontario defaults
- Toggle on/off anytime with the enable/disable switch

### Configurable Sections

**Crew Day Rates** (per municipality)
| Municipality | Default |
|-------------|---------|
| Toronto | $1,350/day |
| Barrie | $1,180/day |
| Simcoe County | $1,220/day |
| Burlington-Oakville | $1,220/day |
| Rural-Other | $1,220/day |

**Permit Fees** (per municipality)
| Municipality | Default |
|-------------|---------|
| Toronto | $215 |
| Barrie | $225 |
| Simcoe County | $200 |
| Burlington-Oakville | $280 |
| Rural-Other | $175 |

**Engineering Fee**: $1,500 default (triggers when heavy load, 3+ levels, pergola, or shallow bedrock)

**Waste Factors** (per board pattern)
| Pattern | Default |
|---------|---------|
| Straight | 1.10 (10%) |
| Diagonal | 1.18 (18%) |
| Picture Frame | 1.22 (22%) |
| Herringbone | 1.25 (25%) |

**Materials** (21 items)
- Toggle visibility (show/hide per material)
- Edit cost per square foot
- Materials span: PT Pine ($3.25) → Ipe ($28.00), Trex, Deckorators, TimberTech, AZEK lines

---

## Lead Capture API

### Endpoint

```
POST /api/webhook/decking-lead
Content-Type: application/json
```

### Request Body

```json
{
  "contractor_id": "uuid-here",
  "email": "customer@example.com",
  "name": "John Doe",
  "phone": "416-555-1234",
  "notes": "Interested in composite decking",
  "selected_features": [
    {"key": "decking", "label": "16x12 Trex Transcend Deck", "qty": 192, "unit": "sqft"}
  ],
  "estimate_low": 25000,
  "estimate_high": 35000,
  "estimate_mid": 30000,
  "breakdown": [
    {"title": "Decking", "total": 8500},
    {"title": "Foundation", "total": 3200}
  ],
  "decking_data": { ... full DeckData object ... },
  "site_condition": "Standard",
  "source": "website"
}
```

**Required fields:** `contractor_id`, `email`

### Response

**Success (200):**
```json
{ "success": true, "lead_id": "uuid-of-created-lead" }
```

**Error (400):** Missing contractor_id or email
```json
{ "error": "Missing required fields" }
```

**Error (500):** Database or webhook failure
```json
{ "error": "Failed to save lead" }
```

### What Happens on Submit

1. Lead inserted into `leads` table with `estimator_type = 'decking'`
2. Usage event logged to `usage_logs` table
3. If contractor has a `webhook_url` configured, fires async POST notification:
   ```json
   {
     "event": "decking_lead_submitted",
     "lead": { "id": "...", "name": "John Doe", "email": "...", "phone": "...", "estimate_mid": 30000 }
   }
   ```

---

## Branding System

DeckCraft Pro inherits the contractor's brand from EstimateAI. The `DeckingEstimatorShell` component sets CSS custom properties on its root div based on the contractor's settings:

```typescript
style={{
  '--brand-bg':        contractor.background_color || '#F9FAFB',
  '--brand-card':      contractor.card_color || '#FFFFFF',
  '--brand-text':      contractor.text_color || '#111827',
  '--brand-accent':    contractor.primary_color || '#2563EB',
  '--brand-secondary': contractor.secondary_color || '#059669',
}}
```

All DeckCraft CSS classes reference these variables (e.g., `.bg-brand-gold` uses `var(--brand-accent)`), so the estimator automatically matches the contractor's brand without any manual theming.

**What adapts to the brand:**
- Header company name and logo
- Step indicator active/inactive colors
- All buttons (primary, secondary, card selections)
- Input focus borders
- Cost display accent color
- Footer text

---

## CSS Classes

Added to `app/globals.css` under the `DeckCraft Pro Estimator Classes` section:

| Class | Purpose |
|-------|---------|
| `.card-slate` | Card container with brand background, subtle border, rounded corners |
| `.btn-primary` | Primary action button (brand accent color, pill shape, uppercase) |
| `.btn-secondary` | Secondary button (white/card background, bordered, pill shape) |
| `.input-field` | Form input with subtle background, focus highlights to brand accent |
| `.number-font` | Tabular numeric font (monospace numbers for aligned columns) |
| `.bg-brand-gold` | Background using `var(--brand-accent)` |
| `.text-brand-gold` | Text color using `var(--brand-accent)` |
| `.border-brand-gold` | Border color using `var(--brand-accent)` |
| `.text-brand-text-primary` | Text using `var(--brand-text)` |
| `.text-brand-text-secondary` | Text using `var(--brand-text)` at 60% opacity |
| `.bg-brand-accent` | Background using brand accent at 8% opacity (tint) |
| `.bg-brand-text-primary` | Background using `var(--brand-text)` |

---

## Embedding on External Sites

### Method 1: Direct Link

Give the contractor's customers a link to:
```
https://your-domain.com/estimator/{contractor-slug}/decking
```

### Method 2: Iframe Embed

Use the embed route for iframe embedding on contractor websites:

```html
<iframe
  src="https://your-domain.com/embed/{contractor-slug}/decking"
  width="100%"
  height="800"
  frameborder="0"
  style="border: none; border-radius: 12px;"
></iframe>
```

The embed route has `robots: noindex` to prevent duplicate content in search engines.

---

## Calculation Engine

The calculation engine (`lib/decking/calculations.ts`) computes a detailed estimate from the DeckData input and contractor settings. Here's what it calculates:

### Cost Sections

1. **Permits & Professional Fees**: Building permit (per municipality), Conservation Authority permit (waterfront/island), engineering review (heavy load/3+ levels)
2. **Foundation & Footings**: Footing count = `ceil(width/8) * ceil(length/8)`, cost per unit varies by type (Concrete Piers $190, Helical Piles $475, Deck Blocks $4.50)
3. **Structural Framing**: Joist count, rim board, blocking, breaker board blocking. Cost per LF varies by framing size (2x8: $3.50, 2x10: $4.50, 2x12: $5.50)
4. **Decking**: Board count = `(area / boardCoverage) * wasteFactor / boardLength`. Includes breaker boards for decks longer than standard board length
5. **Hardware & Fasteners**: Face screws or hidden clips, joist hangers, ledger bolts, post anchors
6. **Railing System**: Auto-calculated perimeter railing + stair railing. Posts, sections, hardware by railing type
7. **Labour**: Crew days based on area production rates, complexity multipliers (shape, pattern, levels, height, site, season, railing type)
8. **Lighting**: Per-product cost + labor from INLITE_PRODUCTS catalog
9. **Add-ons**: Bench ($155/lf), privacy ($70/sqft), drainage ($12/sqft), demo ($14/sqft), pergola ($65/sqft)
10. **Overhead/Contingency/Profit**: 18% overhead + 10% contingency + 15% profit on direct costs

### Complexity Multipliers

| Factor | Multiplier |
|--------|-----------|
| L-Shape | 1.10x |
| Multi-corner | 1.25x |
| Curved | 1.50x |
| Diagonal pattern | 1.20x |
| Picture Frame | 1.25x |
| Herringbone | 1.30x |
| 2 levels | 1.35x |
| 3 levels | 1.60x |
| Height 48-96" | 1.20x |
| Height > 96" | 1.30x |
| Waterfront | 1.10x |
| Hillside | 1.25x |
| Urban Tight | 1.35x |
| Island-Ferry | 1.75x |
| Fall season | 1.15x |
| Winter season | 1.40x |
| Cable railing | 1.30x |
| Glass railing | 1.40x |

Multipliers stack multiplicatively.

---

## Troubleshooting

### Estimator shows 404
- Verify the contractor slug exists in the `contractors` table
- Verify `decking_settings` has a row with `is_enabled = true` for that contractor
- If using defaults (no settings row), the page still renders — check for Supabase connection errors in server logs

### Leads not saving
- Check the API route at `/api/webhook/decking-lead`
- Verify `contractor_id`, `name`, and `phone` are present in the POST body (email is optional)
- Check Supabase RLS — the `leads` table must allow inserts
- Check that the `estimator_type` and `decking_data` columns exist (migration 004 must be applied)

### Branding not applying
- The contractor must have `primary_color`, `background_color`, `text_color`, `card_color` set in the `contractors` table
- Fallback values (blue/white/gray) apply if any are null
- CSS classes in globals.css must be present (search for "DeckCraft Pro Estimator Classes")

### Settings not saving
- Dashboard uses `supabase.auth.getUser()` — contractor must be logged in
- Check browser console for Supabase errors
- Verify RLS policies allow the contractor to UPDATE their own `decking_settings` row

### Step navigation not working
- Steps use plain conditional rendering (`{step === N && ...}`)
- If framer-motion causes hydration issues, the step content may render invisible (opacity:0). The current implementation avoids this by NOT using motion.div for step containers
- The SectionAccordion component (Step 5 cost breakdown) still uses framer-motion for expand/collapse animations — this is intentional and works correctly

---

## Lead Capture Gate (Step 5)

After showing the hero card (total estimate, cost/sqft, area, flags) and the DeckDiagram, the detailed breakdown is hidden behind a lead capture form.

**Visible without lead capture:** Hero card, compliance flags, deck diagram
**Gated (blurred overlay):** Quick Adjustments, Itemized Breakdown, Breaker Board Info, BrandedMaterialsList

**Form fields:**
- Name (required)
- Phone (required)
- Email (optional)
- Project Vision / Notes (optional)

**On submit:** POSTs to `/api/webhook/decking-lead` with full estimate data + DeckData snapshot. On success, the form is replaced with a success confirmation and the full breakdown is revealed.

**Trust badges:** Zero Obligation, Professional Visit, Detailed Bid

---

## Step Validation Rules

Validation runs when the user clicks Continue. Invalid steps show red borders on inputs with error messages, and the Continue button is disabled.

| Step | Rule | Error Message |
|------|------|---------------|
| Step 2 | Width must be 1–100 ft | "Width must be 1–100 ft" |
| Step 2 | Length must be 1–100 ft | "Length must be 1–100 ft" |
| Step 2 | Height must be 1–240 in | "Height must be 1–240 in" |
| Step 4 | Stair width > 0 when flights > 0 | "Stair width required" |
| Steps 1, 3, 5 | Always valid (defaults exist) | — |

Errors clear automatically when the user modifies any input.

---

## Save & Resume

The estimator automatically saves progress to `localStorage` and restores it on page load.

**Storage key:** `deckcraft-{contractor-slug}-draft`
**Save behavior:** Debounced 500ms after any data change
**Restore behavior:** On mount, checks for saved data with a basic shape validation (`deckType` field exists)
**Toast:** "Draft restored from your last session" appears in top-right for 4 seconds
**Start Fresh:** Button in header clears localStorage, resets to DEFAULT_DECK_DATA, returns to Step 1

---

## Mobile Responsiveness

- **Step indicator:** Labels hidden on mobile (< 640px), circles shrink to 32px
- **Visualizer canvas:** Fluid width with responsive stats grid (2-col on mobile, 4-col on desktop)
- **Railing grid (Step 4):** 1-col on mobile → 2-col sm → 3-col md → 5-col lg
- **Step 5 hero stats:** Flex-wrap with hidden dividers on mobile
- **Navigation buttons:** Full-width stacked on mobile, side-by-side on desktop
- **Trust badges:** Dot separators hidden on mobile

---

## Golden Maple Test Setup

Golden Maple is the pilot contractor for EstimateAI. Migration 005 seeds a `decking_settings` row with all Ontario defaults.

**Migration:** `supabase/migrations/005_golden_maple_decking_settings.sql`
**Contractor UUID:** `a0000000-0000-0000-0000-000000000001`
**URL:** `/estimator/golden-maple/decking`
**Brand:** Forest green (#2F7D32) primary, dark green (#1B5E20) secondary

**To test:**
1. Apply migration 005 to Supabase
2. Run `npm run dev`
3. Navigate to `/estimator/golden-maple/decking`
4. Walk through all 5 steps
5. Submit a lead on Step 5 — verify in Supabase `leads` table with `estimator_type = 'decking'`
