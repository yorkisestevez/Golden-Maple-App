"""
Golden Maple Group — Concept & Method whitepaper (branded PDF).

Explains the core business concept (using Northbound Dispatch as the worked
case study) and generalizes it into a repeatable method for building and
scaling similar AI-leveraged, asset-light service businesses.

Usage:
    python3 generate_concept_whitepaper.py [output_path]
"""

import sys
import os
import datetime

from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, PageBreak,
    NextPageTemplate, KeepTogether,
)

import brand
from brand import (
    PAGE, MARGIN, TOP_SPACE, BOTTOM_SPACE, styles, make_page_decorator,
    make_cover_decorator, section_heading, callout, stat_tiles, data_table,
    numbered_step, INDIGO, GOLD, CYAN, INK,
)

DOC_LABEL = "Concept & Method"


def build(output_path):
    st = styles()
    full = PAGE[0] - 2 * MARGIN
    today = datetime.date.today().strftime("%B %Y")

    # ---- frames ----
    cover_frame = Frame(MARGIN, BOTTOM_SPACE, full, 0.4 * inch, id="cover")
    interior_frame = Frame(MARGIN, BOTTOM_SPACE, full,
                           PAGE[1] - TOP_SPACE - BOTTOM_SPACE, id="main")

    doc = BaseDocTemplate(
        output_path, pagesize=PAGE,
        title="The AI-Leveraged Service Business — Concept & Method",
        author="Golden Maple Group",
        subject="Concept overview and scaling methodology")

    cover_tmpl = PageTemplate(
        id="cover", frames=[cover_frame],
        onPage=make_cover_decorator(
            kicker="A WHITEPAPER BY GOLDEN MAPLE GROUP",
            title="The AI-Leveraged<br/>Service Business",
            subtitle="How an asset-light dispatch company became a repeatable "
                     "method for building — and scaling — AI-run businesses.",
            meta_lines=[
                f"Concept & Method  ·  {today}",
                "Case study: Northbound Dispatch",
                "Barrie, Ontario, Canada",
            ]))
    interior_tmpl = PageTemplate(
        id="main", frames=[interior_frame],
        onPage=make_page_decorator(DOC_LABEL))
    doc.addPageTemplates([cover_tmpl, interior_tmpl])

    s = []

    # ===================== COVER =====================
    s.append(NextPageTemplate("main"))
    s.append(Spacer(1, 1))
    s.append(PageBreak())

    # ===================== 1. THESIS =====================
    s.append(Paragraph("The Thesis", st["title"]))
    s.append(Paragraph("// why this matters", st["subtitle"]))
    s.append(Paragraph(
        "Thousands of local service industries are large, fragmented, and still run on phone calls, "
        "spreadsheets, and memory. The work of <i>coordinating</i> them — matching supply to demand, "
        "negotiating, scheduling, following up, invoicing — is repetitive, rules-based, and perfectly "
        "suited to AI. <b>Golden Maple Group builds businesses that own the coordination layer, not "
        "the assets</b>, and wrap it in an AI stack that lets one operator do the work of three.", st["lead"]))
    s.append(callout(
        "<b>The pattern in one line:</b> pick a fragmented, manual service industry → enter asset-light "
        "(broker the service, don't buy the trucks/equipment) → build the system of record → layer AI "
        "automation on the repetitive work → reach operator leverage of 3x → productize the AI layer as "
        "a second revenue line.", accent=GOLD, bg="#F3E9D6"))
    s.append(Spacer(1, 10))
    s.append(stat_tiles([
        ("3x", "trucks per operator vs. a traditional dispatcher (15–20 vs. 5–7)"),
        ("~$150", "monthly cost to start — asset-light, no vehicles owned"),
        ("Day 1", "legal & cash-flow positive at the very first customer"),
    ]))
    s.append(Spacer(1, 8))
    s.append(Paragraph(
        "The rest of this paper walks the concept through a live example — <b>Northbound Dispatch</b> — "
        "then extracts the method so it can be pointed at the next industry.", st["body"]))

    # ===================== 2. THE CONCEPT (CASE STUDY) =====================
    s.append(section_heading("The Concept — Case Study: Northbound Dispatch", num="01"))
    s.append(Spacer(1, 6))
    s.append(Paragraph(
        "Northbound Dispatch finds, negotiates, and confirms freight loads for independent truck "
        "owner-operators across Ontario and cross-border lanes. It is a <b>dispatch service, not a "
        "freight broker</b> — carriers keep their own authority, insurance, and compliance — so no "
        "license or bond is required and the business can start immediately, legally, with almost no "
        "capital.", st["body"]))

    s.append(Paragraph("The problem it coordinates away", st["h3"]))
    s.append(Paragraph(
        "Owner-operators are excellent drivers and poor freight-finders. Empty trucks lose money, load "
        "boards are a full-time job, and brokers negotiate against them. A dispatcher keeps the truck "
        "loaded at the best rate so the driver just drives. That coordination is the product.", st["body"]))

    s.append(Paragraph("Why it is a good business", st["h3"]))
    for t, b in [
        ("Asset-light", "No trucks, no lot, no inventory. Revenue is a fee on coordination, not a margin on owned assets."),
        ("Recurring & week-to-week", "8% of gross load revenue, or a $200/week flat per truck — predictable, compounding as carriers are added."),
        ("Low cost to serve", "Sub-$300/month tooling. One active carrier covers the entire monthly cost in a single week."),
        ("AI-defensible", "The automation layer is the moat — it widens every month as more of the manual playbook is handed to software."),
    ]:
        s.append(Paragraph(f'• <b>{t}.</b> {b}', st["bullet"]))

    s.append(Paragraph("The moat: operator leverage", st["h3"]))
    s.append(Paragraph(
        "A traditional dispatcher manages 5–7 trucks because the work is manual. Northbound's stack — a "
        "voice agent for inbound calls, an agent that scans and scores load boards, and workflow "
        "automations for onboarding, alerts, and invoicing — targets <b>15–20 trucks per operator</b>. "
        "Same fee per truck, three times the throughput. That delta is the entire thesis, proven in one "
        "vertical.", st["body"]))
    s.append(callout(
        "<b>Unit economics (planning estimates).</b> A blended ~$300/truck/week fee → ~$1,290/truck/month. "
        "Five active carriers ≈ $6.5k/month; fifteen ≈ $19k/month — all on a single operator once the AI "
        "layer carries the repetitive load.", accent=INDIGO))

    # ===================== 3. WHY IT WORKS =====================
    s.append(PageBreak())
    s.append(section_heading("Why the Model Works — Five Structural Advantages", num="02"))
    s.append(Spacer(1, 6))
    s.append(data_table(
        ["#", "Advantage", "What it means"],
        [
            ["1", "<b>Asset-light entry</b>", "Coordinate the service instead of owning the means of delivery — near-zero capital, no balance-sheet risk."],
            ["2", "<b>AI operator leverage</b>", "Software absorbs the repetitive coordination; one person serves 3x the customers at the same quality."],
            ["3", "<b>Recurring revenue</b>", "Weekly, cancellable fees that compound with each customer added — a services annuity, not project work."],
            ["4", "<b>Low customer-acquisition cost</b>", "Local, high-intent channels (referrals, schools, community groups) reach customers who need the service now."],
            ["5", "<b>Productizable stack</b>", "The AI layer built to run the service can be sold to others in the industry — a second, higher-margin revenue line."],
        ],
        col_widths=[0.4 * inch, 1.7 * inch, full - 0.4 * inch - 1.7 * inch]))
    s.append(Spacer(1, 10))
    s.append(Paragraph(
        "Crucially, the advantages stack. Asset-light keeps capital near zero; AI leverage keeps "
        "headcount near zero; recurring revenue keeps cash flow predictable; low CAC keeps growth cheap; "
        "and productization turns the internal tooling into an external asset. The same five hold for any "
        "industry that fits the entry criteria below.", st["body"]))

    # ===================== 4. THE METHOD =====================
    s.append(section_heading("The Golden Maple Group Method", num="03"))
    s.append(Spacer(1, 6))
    s.append(Paragraph(
        "The repeatable blueprint that turns the case study into a process. Each step is sequenced so the "
        "business is profitable and useful <i>before</i> the automation is built — the AI is an "
        "accelerant on a model that already works manually, never a prerequisite.", st["body"]))
    s.append(Spacer(1, 4))
    for n, t, b in [
        ("1", "Pick the right industry",
         "Fragmented supply (many small independent operators), a manual coordination bottleneck, a recurring need, and relationship-driven demand. The more it runs on phone calls and spreadsheets, the better the fit."),
        ("2", "Enter asset-light",
         "Sell the coordination, not the asset. Broker / dispatch / arrange the service so there is no fleet, inventory, or property to finance. Confirm the legal lane (e.g. dispatch ≠ broker) so you can start immediately."),
        ("3", "Build the system of record first",
         "A simple CRM that captures supply, demand, status, and money. It is the single source of truth a human runs today and the AI reads/writes tomorrow. No system of record, no automation later."),
        ("4", "Write the manual playbook",
         "Document the daily operating rhythm a human follows end to end. This is both the operations manual and the exact specification the automations will implement, task by task."),
        ("5", "Layer AI by time-saved",
         "Automate in order of hours returned: workflow automations (onboarding, alerts, invoicing) → an inbound voice agent → a matching/scoring agent on the data feeds. Each release hands more of the playbook to software."),
        ("6", "Reach operator leverage",
         "Compound the automations until one operator profitably serves ~3x a traditional operator. This is the margin engine and the defensible moat."),
        ("7", "Productize the stack",
         "Package the AI layer as a product for others in the same industry — a second, higher-margin revenue line that is field-tested by your own operation."),
    ]:
        s.append(numbered_step(n, t, b))
    s.append(Spacer(1, 8))
    s.append(callout(
        "<b>Sequencing rule.</b> Manual-but-working beats automated-but-fragile. Ship steps 1–4 to a paying "
        "customer first; steps 5–7 are where the leverage and the enterprise value are created.",
        accent=CYAN, bg="#F3E9D6"))

    # ===================== 5. THE STACK =====================
    s.append(Spacer(1, 10))
    s.append(section_heading("The Shared Automation Stack", num="04"))
    s.append(Spacer(1, 6))
    s.append(Paragraph(
        "The same components power every business in the portfolio. Building them once and reusing them is "
        "what makes each new vertical cheaper and faster than the last.", st["body"]))
    s.append(data_table(
        ["Layer", "Role", "Reused across the portfolio"],
        [
            ["<b>System of record</b>", "CRM / tracker — supply, demand, status, money.", "Schema adapts per industry; the pattern is identical."],
            ["<b>Workflow automation</b>", "Onboarding, reminders, alerts, invoicing (n8n).", "Same engine, swapped triggers and templates."],
            ["<b>Voice agent</b>", "Inbound calls answered, logged, escalated (Sarah).", "One architecture (telephony + voice), re-skinned per brand."],
            ["<b>Matching / scoring agent</b>", "Scans feeds, ranks opportunities, drafts offers.", "Generic 'score & rank' engine pointed at new data sources."],
            ["<b>Human-in-the-loop</b>", "Approvals via chat before anything goes out.", "Same guardrail pattern keeps quality high while scaling."],
        ],
        col_widths=[1.45 * inch, full * 0.40, full - 1.45 * inch - full * 0.40]))
    s.append(Spacer(1, 8))
    s.append(Paragraph(
        "Because these are shared, the marginal cost of standing up business #2, #3, #4 falls each time. "
        "The first vertical pays to build the stack; every vertical after rents it for nearly free.", st["body"]))

    # ===================== 6. SCALING TO OTHER BUSINESSES =====================
    s.append(PageBreak())
    s.append(section_heading("Scaling to Similar Businesses", num="05"))
    s.append(Spacer(1, 6))
    s.append(Paragraph(
        "The method is industry-agnostic. Any market that is fragmented, manual, and recurring is a "
        "candidate. The table maps the same pattern onto several local-service industries — what you "
        "<i>don't</i> own, where the AI leverage sits, and the unit you scale.", st["body"]))
    s.append(data_table(
        ["Industry", "Asset you DON'T own", "Where AI leverage sits", "Unit scaled"],
        [
            ["<b>Truck dispatch</b>", "The trucks", "Load matching, rate negotiation, dispatch ops", "Trucks / operator"],
            ["<b>Home-services estimating</b>", "The crews", "Instant AI quotes, lead triage, follow-up", "Quotes / day"],
            ["<b>Cleaning & janitorial</b>", "The cleaners", "Scheduling, dispatch, client comms", "Jobs / coordinator"],
            ["<b>Last-mile courier</b>", "The vehicles", "Route/parcel matching, driver comms", "Deliveries / operator"],
            ["<b>Equipment rental brokerage</b>", "The equipment", "Availability matching, booking, billing", "Bookings / operator"],
            ["<b>Field-service trades</b>", "The technicians", "Intake voice agent, scheduling, invoicing", "Tickets / dispatcher"],
        ],
        col_widths=[1.5 * inch, 1.35 * inch, full - 1.5 * inch - 1.35 * inch - 0.95 * inch, 0.95 * inch]))
    s.append(Spacer(1, 8))
    s.append(callout(
        "<b>Live in the portfolio already:</b> Northbound Dispatch (truck dispatch) and the Golden Maple "
        "+ estimate-ai pairing (home-services estimating). Same stack, same method, different verticals — "
        "the proof that the blueprint travels.", accent=INDIGO))

    # ===================== 7. ECONOMICS OF REPLICATION =====================
    s.append(PageBreak())
    s.append(section_heading("The Economics of Replication", num="06"))
    s.append(Spacer(1, 6))
    s.append(Paragraph(
        "Each new vertical is cheaper, faster, and lower-risk than the one before, because the expensive "
        "part — the automation stack and the operating method — is already built and paid for.", st["body"]))
    s.append(stat_tiles([
        ("1st", "vertical funds the shared stack"),
        ("↓ cost", "each new vertical reuses it for near-free"),
        ("2 lines", "services revenue + productized software"),
    ]))
    s.append(Spacer(1, 10))
    s.append(Paragraph("The portfolio flywheel", st["h3"]))
    for t, b in [
        ("Build once, deploy many", "The stack built for vertical #1 is reused by #2 and #3 — engineering cost amortizes across the whole portfolio."),
        ("Learnings compound", "Every operational lesson, prompt, and workflow improves all businesses at once."),
        ("Two revenue lines per vertical", "The service generates cash; the productized AI layer is sold to others in that industry."),
        ("Capital-light growth", "Asset-light + shared stack means scaling adds verticals, not balance-sheet risk."),
    ]:
        s.append(Paragraph(f'• <b>{t}.</b> {b}', st["bullet"]))
    s.append(Spacer(1, 6))
    s.append(callout(
        "<b>The compounding insight:</b> you are not building one company — you are building a method and a "
        "stack, then pointing them at one fragmented industry after another. The moat is the machine that "
        "builds the businesses.", accent=GOLD, bg="#F3E9D6"))

    # ===================== 8. RISKS =====================
    s.append(section_heading("Risks & Guardrails", num="07"))
    s.append(Spacer(1, 6))
    s.append(data_table(
        ["Risk", "Guardrail"],
        [
            ["Regulatory / licensing confusion", "Confirm the legal lane per vertical (e.g. dispatch ≠ broker); position clearly; verify counterparties' compliance."],
            ["Automating before product-market fit", "Sequencing rule: manual-but-working first; automate only proven, repetitive steps."],
            ["Over-automation / quality slip", "Human-in-the-loop approval gates on anything customer-facing until trust is earned."],
            ["Key-person dependence", "Document everything; the stack and playbooks reduce reliance on any single human."],
            ["Spreading too thin", "Prove and stabilize one vertical before opening the next; reuse, don't reinvent."],
        ],
        col_widths=[2.3 * inch, full - 2.3 * inch]))

    # ===================== 9. CONCLUSION =====================
    s.append(Spacer(1, 14))
    s.append(KeepTogether([
        section_heading("In Short", num="08"),
        Spacer(1, 6),
        Paragraph(
            "Northbound Dispatch is not just a dispatch company — it is a working proof of a repeatable "
            "method: <b>own the coordination, not the assets; run it on an AI stack that gives one operator "
            "the output of three; then productize that stack and point the whole machine at the next "
            "fragmented industry.</b> That is what Golden Maple Group builds.", st["lead"]),
        Spacer(1, 8),
        callout(
            "<b>Golden Maple Group</b> &nbsp;·&nbsp; Built for longevity. Designed for life. "
            "&nbsp;·&nbsp; yorkis@goldenmaplelandscaping.ca &nbsp;·&nbsp; Barrie, Ontario",
            accent=GOLD, bg="#0E0E0C", textcolor="#FFFFFF"),
    ]))

    doc.build(s)
    print(f"✓ Concept & Method whitepaper → {output_path}")


if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    out = (sys.argv[1] if len(sys.argv) > 1
           else os.path.join(here, "output", "Golden-Maple-Group-Concept-Whitepaper.pdf"))
    os.makedirs(os.path.dirname(out), exist_ok=True)
    build(out)
