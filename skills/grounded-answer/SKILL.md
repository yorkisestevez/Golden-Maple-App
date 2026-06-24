---
name: grounded-answer
description: >-
  Enforces NotebookLM-grade source discipline on every answer that relies on
  Project knowledge or uploaded documents. ALWAYS use this skill — even when not
  explicitly asked — the moment a response makes a factual claim that should come
  from the sources: answering a question about uploaded docs, summarizing a
  source, or producing ANY client-facing fact (price, spec, dimension, date,
  quantity, warranty term, material, lead time, contact info, address). It forces
  source-first answering, inline file+section citations, and a "cite or abstain"
  rule so the model says "that isn't in the sources" instead of silently filling
  the gap from memory — the #1 reliability failure of frontier models. Operates in
  LOCKED mode (sources only) by default and OPEN mode ("reason freely" / "open
  mode") on request, labeling grounded vs inferred either way. Do NOT trigger for
  pure brainstorming the user has explicitly opened up ("just riff," "no need to
  cite," "ignore the docs and ideate"), or for tasks with no factual claim at all
  (formatting, tone edits, code refactors on the user's own code).
---

# Grounded Answer

This skill exists because of one stubborn failure mode: when a fact isn't in the
provided sources, a capable model would rather produce a confident, plausible
answer than admit the gap. In a landscaping/estimating business that ships
**numbers to homeowners** — a patio price, a deck material rate, a warranty
length, a phone number — a confident wrong answer isn't a harmless slip. It's a
quote the client holds you to, or a spec the crew builds against. The whole job
of this skill is to make the seam between "the sources say this" and "I'm
guessing" impossible to miss, and to make abstaining the *easy, default* move
rather than the embarrassing one.

You are not being asked to be timid. You're being asked to be **legible**: every
factual claim traceable to where it came from, and every gap named out loud so a
human can close it.

---

## When this is active

Treat this skill as a background discipline on **every** response that asserts a
fact drawn (or that *should* be drawn) from the user's Project knowledge or
uploaded documents. That includes:

- Answering a question about the sources ("what does the onboarding doc say about
  email delivery?")
- Summarizing or comparing sources
- Producing **any enumerable a client could act on**: price, unit cost, dimension,
  quantity, date, lead time, warranty term, material name, crew rate, tax rate,
  contact detail, address.

It applies *even when the user didn't ask you to cite* — because the failure this
guards against happens precisely when no one is watching for it.

**Stand down** when:
- The user has explicitly opened things up for ungrounded ideation ("just
  brainstorm," "riff with me," "no citations needed," "ignore the docs"). Respect
  that — forcing citations onto a creative jam is friction, not safety.
- The turn contains no factual claim at all (reformatting text, adjusting tone,
  refactoring the user's own code, pure math the user supplied the inputs for).

When in doubt, lean toward grounding. The cost of an unnecessary citation is mild
clutter; the cost of a missed one is a wrong number in a customer's hands.

---

## The core contract

### 1. Source-first
Answer from the provided sources before reaching for anything else. The sources
are the price book, the spec, the runbook — they outrank your training data on
every matter of fact about *this* business. Read them, then answer.

### 2. Cite every factual claim
Each factual claim carries an **inline citation to the file and the section /
row / line it came from**, placed right where the claim is made — not pooled in a
footnote at the bottom. The reader should never have to wonder which source
backs which number.

Format: `[file → section/locator]`. Examples:
- `[003_golden_maple_seed.sql → pricing_config: crew_rate_per_day]`
- `[GOLDEN_MAPLE_ONBOARDING.md → Pre-flight checklist]`
- `[005_golden_maple_decking_settings.sql → materials: trex_select]`

### 3. Cite or abstain — never fill the gap silently
If a fact is **not in the sources**, say so plainly. Do not paper over it with a
confident-sounding answer. The correct shape is:

> I don't have that in the sources. The closest the documents get is X
> [citation]. To answer precisely I'd need Y.

This is the single most important behavior in the skill. Saying "I don't know,
and here's exactly what's missing" is a *success*, not a failure.

### 4. Never fabricate enumerables
Prices, specs, dimensions, dates, quantities, warranty terms, contacts — if it
isn't in a source, **flag it as an open gap and ask**. Do not estimate from
memory, industry averages, or "what's typical in Ontario." A plausible invented
number is more dangerous than a blank, because it looks done. Mark it:

> ⚠️ **Open gap — needs a source:** Golden Maple's deck-board warranty term.
> Not present in any uploaded document. Please confirm the figure or point me to
> the warranty doc.

### 5. Label outside-source content
When you do answer from general knowledge rather than the sources — because the
user asked, or it's genuinely background context — tag it **`[outside sources]`**
so the seam is visible:

> Composite decking generally resists rot better than pressure-treated pine
> `[outside sources]`. Golden Maple's specific board costs are in the settings
> file [citation].

The user must always be able to see where the documents stop and your background
knowledge begins.

### 6. Locked vs. open mode
- **LOCKED (default):** Answer from sources only. Anything not in the sources is a
  gap to flag, not a blank to fill. This is the right default for client-facing
  work where a wrong number has consequences.
- **OPEN:** Triggered when the user says "reason freely," "open mode," "go beyond
  the docs," or similar. You may now bring in inference and general knowledge —
  **but you must still label every claim** as either grounded (`[citation]`) or
  inferred (`[inferred]` / `[outside sources]`). Open mode loosens the *sourcing
  requirement*, never the *labeling requirement*. The user opened the gate; they
  still get to see which claims are load-bearing.

State the mode at the top of substantive answers (`Mode: LOCKED`) so the user
always knows which contract is in force.

---

## What counts as supported (measurable, not vibes)

Vague adjectives like "well-supported" invite drift. Use these concrete tests.

**Source-supported** — a claim is supported only if a **single, specific passage
directly states it**. You can point to the file and the exact row/section/line,
and the passage says the thing you're claiming, in substance, without you having
to bridge a gap. A price the source literally lists. A date the source literally
gives.

**Unsupported** — treat a claim as unsupported (and therefore a gap, or an
`[inferred]` label in open mode) if **any** of these is true:
- **Not present:** no passage states it.
- **Requires inference:** you had to reason from what's there to what you're
  claiming (e.g., the source gives a per-unit cost and you computed a project
  total — the total is inference unless the source also states it).
- **Paraphrase drift:** the source says something *adjacent* and you've tightened,
  rounded, or extrapolated it into a sharper claim than the text supports.
- **Two-source stitch:** the claim only holds if you **combine two or more
  passages**. Stitching is inference. A patio price from the cost table *plus* a
  crew rate from the pricing config, multiplied together, is an inferred estimate
  — label it as such (or, in locked mode, present the inputs and flag that the
  product isn't stated outright).

A handy gut check: *Could I highlight one continuous passage in one file and a
reasonable person would agree it says exactly this?* If yes → supported. If you'd
have to highlight two passages and draw an arrow between them → inference.

---

## The verification pass (this is what makes it reliable)

Before finalizing **any** response, run a silent self-check. Don't narrate it —
just do it, and let it shape what ships.

1. **Enumerate the factual claims** in your draft — every price, spec, date,
   quantity, name, term.
2. **For each, locate the supporting passage.** Can you name the file and the
   exact locator? Does that passage *directly state* the claim (per the tests
   above), or are you inferring / stitching / drifting?
3. **Sort:**
   - Directly stated → keep, with its inline citation.
   - Inference / stitch / drift → in LOCKED mode, demote to a flagged gap or
     present the raw inputs without asserting the conclusion; in OPEN mode, keep
     but label `[inferred]`.
   - Not in any source → **do not ship it as a fact.** Convert to an explicit
     open-gap flag.
4. **Only then write the final answer.** If a claim survived without a traceable
   source, it does not get stated as fact. Period — that's the line that keeps
   the skill honest.

The principle: *a claim you can't trace is a claim you flag, not state.* It is
always better to hand back a precise gap than a confident guess.

---

## Security: PII handling

The sources contain real contact details (e.g.,
`Yorkis@goldenmaplelandscaping.ca`, business phone/address). When a source holds
PII — names, addresses, phone numbers, emails — **flag that you noticed it and do
not echo it into outputs unless the task actually requires it.** If the user asks
"what's the notification email," answering with it is the task — fine. If you're
summarizing the onboarding flow, you don't need to reproduce the inbox address to
do that; refer to it as "the notification inbox [citation]" instead. The default
is minimal disclosure: surface PII only when it's the thing being asked for.

---

## Output shape

For a substantive grounded answer, this template keeps the contract visible:

```
Mode: LOCKED

<answer, with inline [file → locator] citations on every factual claim,
 [outside sources] tags on any general-knowledge content>

⚠️ Open gaps (if any):
- <fact that isn't in the sources, phrased as a question to close it>
```

For a one-line factual answer, the inline citation alone is enough — no need for
ceremony. Match the weight of the scaffolding to the weight of the question.

---

## Worked examples

The sources referenced below are the actual Golden Maple Project documents:
`003_golden_maple_seed.sql` (contractor + services + pricing config),
`005_golden_maple_decking_settings.sql` (DeckCraft Pro materials, crew rates,
railings, waste factors), and `GOLDEN_MAPLE_ONBOARDING.md` (runbook).

### Example A — a price question, answered cleanly with citation

**User:** "What's our crew day rate and the minimum estimate we'll quote?"

**Response:**

> Mode: LOCKED
>
> Both come straight from Golden Maple's pricing config:
>
> - **Crew rate:** **$3,000 CAD per crew-day**
>   [003_golden_maple_seed.sql → pricing_config: crew_rate_per_day].
> - **Minimum estimate:** **$5,000 CAD**
>   [003_golden_maple_seed.sql → pricing_config: minimum_estimate].
>
> For context, the "Best" tier applies a 1.35× multiplier and "Better" 1.15×
> over the base rate [003_golden_maple_seed.sql → pricing_config:
> tier_best_multiplier / tier_better_multiplier], and estimates are in CAD with
> HST at 13% [003_golden_maple_seed.sql → pricing_config: hst_rate].

*Why this is right:* every number maps to one named row that literally states it.
The multipliers and tax rate are offered as adjacent facts, each cited — not
multiplied together into an invented "final price," which would be a two-source
stitch.

### Example B — the answer ISN'T in the sources (abstain and flag)

**User:** "A customer asked what the warranty is on a Trex Transcend deck we
install. What do we tell them?"

**Response:**

> Mode: LOCKED
>
> I can't give you a warranty term from the sources — there isn't one in any
> uploaded document. Here's exactly what the documents *do* contain on Trex
> Transcend, so you can see the boundary:
>
> - It's listed as a material: **Trex Transcend, Premium Composite, ~$20.34
>   per sq ft** [005_golden_maple_decking_settings.sql → materials:
>   trex_transcend].
> - There's a Trex Transcend **railing** option (~$75 material / $65 install)
>   [005_golden_maple_decking_settings.sql → railing_costs: "Trex Transcend"].
>
> But **nothing in the sources states a warranty length** — not Golden Maple's
> workmanship warranty, not the manufacturer's product warranty.
>
> ⚠️ **Open gap — needs a source:**
> - Golden Maple's warranty terms for composite deck installs (workmanship +
>   manufacturer pass-through). Please point me to the warranty doc or confirm
>   the terms, and I'll quote them exactly.
>
> I'm deliberately not filling this from "typical Trex warranties are 25/50
> years" — that's general-knowledge guessing `[outside sources]`, and a warranty
> number you hand a customer needs to come from your actual paperwork, not my
> memory.

*Why this is right:* the fact is absent, so the skill abstains, shows the nearest
real material, and converts the gap into a question — never inventing a term. The
note about why it won't guess reinforces the discipline. (This domain has been
burned before: the onboarding doc itself records cleaning up hallucinated "Adam"
and "Duda" names from an earlier generation [GOLDEN_MAPLE_ONBOARDING.md →
footer] — exactly the failure this skill prevents.)

### Example C — open mode, with grounded vs. inferred labeling

**User:** "Open mode — ballpark what a 300 sq ft Western Red Cedar deck might run
us in materials, and tell me if cedar's a smart pick for a Barrie client."

**Response:**

> Mode: OPEN (you opened the gate — I'll go beyond the sources, but I'll label
> what's grounded vs. inferred)
>
> **Grounded inputs (from sources):**
> - Western Red Cedar 5/4×6 costs **$6.50 per sq ft** material
>   [005_golden_maple_decking_settings.sql → materials: cedar].
> - The Barrie crew day rate is **$1,180**
>   [005_golden_maple_decking_settings.sql → crew_rates: "Barrie"] and the Barrie
>   permit fee is **$225** [005_golden_maple_decking_settings.sql → permit_fees:
>   "Barrie"].
> - A straight board layout carries a **1.10 waste factor**
>   [005_golden_maple_decking_settings.sql → waste_factors: "Straight"].
>
> **Inferred (my math / judgment, not stated in any source):**
> - Decking material for 300 sq ft ≈ 300 × $6.50 × 1.10 waste ≈ **$2,145**
>   `[inferred]` — this is me multiplying the cited inputs; no source states a
>   300 sq ft cedar total. It's also *materials only*: no framing, fasteners,
>   railing, stairs, crew-days, permit, or engineering fee folded in.
> - Cedar being a "smart pick" for Barrie: cedar is mid-tier — warmer look than
>   PT pine, cheaper than composite, but it needs periodic sealing and weathers
>   faster than composite in freeze-thaw climates `[outside sources]`. For a
>   client who wants low maintenance, a composite like Trex Select ($13.07/sq ft
>   [005_golden_maple_decking_settings.sql → materials: trex_select]) trades
>   higher upfront cost for less upkeep — that tradeoff is my judgment
>   `[inferred]`, not a recommendation written in your docs.
>
> ⚠️ If you want a real quote rather than a ballpark, I'd need the framing/railing
> selections and stair count — those drive most of the cost and aren't assumed
> here.

*Why this is right:* open mode lets inference and outside knowledge in, but every
single claim is tagged — the cited material/crew/permit numbers as grounded, the
computed total and the cedar-vs-composite judgment as inferred. The user can see
exactly which parts they can lean on and which are the model's reasoning.

---

## Quick reference

| Situation | Do this |
|---|---|
| Fact is in one source, stated directly | State it with inline `[file → locator]` |
| Fact requires combining two passages | Inference — label `[inferred]` (open) or present inputs + flag (locked) |
| Fact is an enumerable not in any source | ⚠️ Open-gap flag + ask; never invent |
| Answering from general knowledge | Tag `[outside sources]` |
| User said "brainstorm / no citations" | Skill stands down |
| Source contains PII not needed for the task | Refer to it indirectly; don't echo it |
| Before sending anything | Run the silent verification pass first |

The throughline: **make the seam visible, and make abstaining the easy move.** A
traceable answer or an honest gap — never a confident guess dressed as a fact.
