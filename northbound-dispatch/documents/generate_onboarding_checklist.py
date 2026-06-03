"""
Northbound Dispatch — Carrier Onboarding Checklist (one-page branded PDF).

Everything needed from a new carrier, as a printable checkbox list.

Usage:
    python3 generate_onboarding_checklist.py [output_path]
"""

import sys
import os
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle,
)
from reportlab.lib import colors

import brand
from brand import (
    PAGE, MARGIN, TOP_SPACE, BOTTOM_SPACE, styles, make_page_decorator,
    section_heading, NAVY, ORANGE, TEAL, LINE, GREY,
)

ITEMS = [
    ("Valid MC number or CVOR certificate", "Operating authority — required to dispatch."),
    ("Certificate of insurance", "Min $1M liability + cargo insurance. Note expiry date."),
    ("Driver's license (Class A / AZ)", "Copy of front and back."),
    ("Equipment details", "Year, make, type (dry van / flatbed / reefer / step deck), unit number."),
    ("Preferred lanes and home base", "e.g. ON-QC, Toronto-Detroit, GTA local. Home terminal city."),
    ("Rate expectations", "Per-mile minimum or per-load minimum."),
    ("Communication preferences", "Phone / text / email — and best hours to reach you."),
    ("Signed Carrier-Dispatcher Agreement", "Week-to-week. 8% or $200/week flat."),
    ("W-8BEN or T4A-NR info", "For cross-border loads, if applicable."),
    ("Direct deposit or payment info", "How fees are settled / how you get paid."),
]


def build(output_path):
    st = styles()
    frame = Frame(MARGIN, BOTTOM_SPACE, PAGE[0] - 2 * MARGIN,
                  PAGE[1] - TOP_SPACE - BOTTOM_SPACE, id="main")
    doc = BaseDocTemplate(
        output_path, pagesize=PAGE, title="Carrier Onboarding Checklist",
        author="Northbound Dispatch", subject="New carrier onboarding")
    doc.addPageTemplates([PageTemplate(
        id="main", frames=[frame],
        onPage=make_page_decorator("Onboarding Checklist"))])

    full = PAGE[0] - 2 * MARGIN
    s = []
    s.append(Paragraph("Carrier Onboarding Checklist", st["title"]))
    s.append(Paragraph("Get these to us and your truck is ready to roll. Most carriers onboard in under a day.", st["subtitle"]))

    # carrier name strip
    name_strip = Table([[
        Paragraph('<font size=7 color="#5A6B7B"><b>CARRIER NAME</b></font><br/>&nbsp;', st["body_sm"]),
        Paragraph('<font size=7 color="#5A6B7B"><b>DATE STARTED</b></font><br/>&nbsp;', st["body_sm"]),
        Paragraph('<font size=7 color="#5A6B7B"><b>ONBOARDED BY</b></font><br/>&nbsp;', st["body_sm"]),
    ]], colWidths=[full * 0.5, full * 0.25, full * 0.25])
    name_strip.setStyle(TableStyle([
        ("LINEBELOW", (0, 0), (-1, -1), 0.7, LINE),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING", (0, 0), (-1, -1), 2),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
    ]))
    s.append(name_strip)
    s.append(Spacer(1, 14))

    s.append(section_heading("Required from Carrier"))
    s.append(Spacer(1, 8))

    def checkbox():
        b = Table([[""]], colWidths=[0.16 * inch], rowHeights=[0.16 * inch])
        b.setStyle(TableStyle([("BOX", (0, 0), (-1, -1), 1, TEAL)]))
        return b

    rows = []
    for title, hint in ITEMS:
        text = Paragraph(
            f'<b>{title}</b><br/><font size=8 color="#5A6B7B">{hint}</font>', st["body_sm"])
        rows.append([checkbox(), text])
    chk = Table(rows, colWidths=[0.45 * inch, full - 0.45 * inch])
    chk.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LINEBELOW", (0, 0), (-1, -2), 0.5, colors.HexColor("#ECEFF2")),
        ("LEFTPADDING", (0, 0), (-1, -1), 2),
    ]))
    s.append(chk)

    s.append(Spacer(1, 16))
    # footer note box
    note = Paragraph(
        '<b>Questions?</b> Call or text us at 705-555-0000, or email '
        'yorkis@goldenmaplelandscaping.ca. We move fast — the sooner this is complete, '
        'the sooner we start finding you loads.', st["body_sm"])
    nt = Table([[note]], colWidths=[full])
    nt.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#EAF6F4")),
        ("BOX", (0, 0), (-1, -1), 1, TEAL),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    s.append(nt)

    doc.build(s)
    print(f"✓ Carrier Onboarding Checklist → {output_path}")


if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, "output", "Northbound-Carrier-Onboarding-Checklist.pdf")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    build(out)
