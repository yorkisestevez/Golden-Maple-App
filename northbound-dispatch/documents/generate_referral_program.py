"""
Northbound Dispatch — Referral Program one-pager (branded PDF).

"Refer a truck, get a free week of dispatch." Carrier-facing marketing sheet.

Usage:
    python3 generate_referral_program.py [output_path]
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


def build(output_path):
    st = styles()
    frame = Frame(MARGIN, BOTTOM_SPACE, PAGE[0] - 2 * MARGIN,
                  PAGE[1] - TOP_SPACE - BOTTOM_SPACE, id="main")
    doc = BaseDocTemplate(
        output_path, pagesize=PAGE, title="Referral Program",
        author="Northbound Dispatch", subject="Carrier referral program")
    doc.addPageTemplates([PageTemplate(
        id="main", frames=[frame],
        onPage=make_page_decorator("Referral Program"))])

    full = PAGE[0] - 2 * MARGIN
    s = []
    s.append(Paragraph("Refer a Truck. Get a Free Week.", st["title"]))
    s.append(Paragraph("Our way of saying thanks for spreading the word.", st["subtitle"]))

    s.append(Paragraph(
        "You know what good dispatch is worth — so you probably know other owner-operators who are "
        "tired of hunting loads themselves. Send them our way. When a truck you refer signs on and "
        "runs their first paid load with us, <b>you get one full week of dispatch with zero fees.</b>", st["body"]))

    # Big offer block
    offer = Table([[
        Paragraph('<font color="#FFFFFF" size=26><b>1 FREE WEEK</b></font><br/>'
                  '<font color="#FFD9C9" size=10>of dispatch — no fees on any load that week</font>', st["body"])
    ]], colWidths=[full])
    offer.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), ORANGE),
        ("TOPPADDING", (0, 0), (-1, -1), 18),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 18),
        ("LEFTPADDING", (0, 0), (-1, -1), 20),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
    ]))
    s.append(Spacer(1, 6))
    s.append(offer)
    s.append(Spacer(1, 14))

    s.append(section_heading("How It Works"))
    s.append(Spacer(1, 6))
    steps = [
        ("1", "Tell them about us", "Give them our number (705-555-0000) or send them to northbounddispatch.ca."),
        ("2", "They mention your name", "When they apply, they list you as the carrier who referred them."),
        ("3", "You get a free week", "Once they complete their first paid load, your next week of dispatch is on us."),
    ]
    rows = []
    for n, t, d in steps:
        rows.append([
            Paragraph(f'<font color="#FF6B35" size=20 face="Courier"><b>{n}</b></font>', st["body"]),
            Paragraph(f'<b>{t}</b><br/><font size=8 color="#5A6B7B">{d}</font>', st["body_sm"]),
        ])
    stt = Table(rows, colWidths=[0.6 * inch, full - 0.6 * inch])
    stt.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LINEBELOW", (0, 0), (-1, -2), 0.5, colors.HexColor("#ECEFF2")),
    ]))
    s.append(stt)
    s.append(Spacer(1, 12))

    s.append(section_heading("The Fine Print"))
    s.append(Spacer(1, 5))
    for line in [
        "The referred carrier must be a new carrier who has not previously worked with Northbound Dispatch.",
        "The free week applies after the referred carrier completes their first paid, delivered load.",
        "No limit — refer as many trucks as you like and stack the free weeks.",
        "Free week = no dispatch fees on loads dispatched in that week; all other terms unchanged.",
    ]:
        s.append(Paragraph(f"•&nbsp;&nbsp;{line}", st["body_sm"]))

    s.append(Spacer(1, 16))
    cta = Table([[
        Paragraph('<font color="#FFFFFF"><b>Ready to refer?</b>&nbsp;&nbsp;Call or text 705-555-0000 · '
                  'yorkis@goldenmaplelandscaping.ca · northbounddispatch.ca</font>', st["body_sm"])
    ]], colWidths=[full])
    cta.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), NAVY),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
    ]))
    s.append(cta)

    doc.build(s)
    print(f"✓ Referral Program one-pager → {output_path}")


if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, "output", "Northbound-Referral-Program.pdf")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    build(out)
