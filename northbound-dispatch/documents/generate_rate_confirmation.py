"""
Northbound Dispatch — Rate Confirmation Template (branded, fillable-style PDF).

A standard load confirmation sheet sent to the carrier before every load.
Blank labelled fields with monospace value lines for handwriting or filling.

Usage:
    python3 generate_rate_confirmation.py [output_path]
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


def _field(label, hint=""):
    """A label-over-line field cell."""
    st = styles()
    extra = f'  <font size=6 color="#9AA7B4">{hint}</font>' if hint else ""
    return Paragraph(
        f'<font size=7 color="#5A6B7B"><b>{label.upper()}</b></font>{extra}<br/>'
        f'<font size=11 color="#1A1A1A">&nbsp;</font>', st["body_sm"])


def _field_table(rows, col_widths):
    t = Table(rows, colWidths=col_widths)
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "BOTTOM"),
        ("LINEBELOW", (0, 0), (-1, -1), 0.7, LINE),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING", (0, 0), (-1, -1), 2),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
    ]))
    return t


def build(output_path):
    st = styles()
    frame = Frame(MARGIN, BOTTOM_SPACE, PAGE[0] - 2 * MARGIN,
                  PAGE[1] - TOP_SPACE - BOTTOM_SPACE, id="main")
    doc = BaseDocTemplate(
        output_path, pagesize=PAGE, title="Rate Confirmation",
        author="Northbound Dispatch", subject="Load rate confirmation")
    doc.addPageTemplates([PageTemplate(
        id="main", frames=[frame],
        onPage=make_page_decorator("Rate Confirmation"))])

    s = []
    s.append(Paragraph("Rate Confirmation", st["title"]))
    s.append(Paragraph("Confirm all details before dispatch. Sign and return to lock the load.", st["subtitle"]))

    full = PAGE[0] - 2 * MARGIN

    # --- Load ID strip ---
    s.append(section_heading("Load"))
    s.append(_field_table([[
        _field("Load ID / Ref #"),
        _field("Date issued"),
        _field("Source / board", "Loadlink · DAT · Direct"),
    ]], [full * 0.4, full * 0.3, full * 0.3]))

    # --- Pickup ---
    s.append(section_heading("Pickup"))
    s.append(_field_table([[
        _field("Pickup location (city, prov/state)"),
        _field("Date"),
        _field("Time window"),
    ]], [full * 0.5, full * 0.25, full * 0.25]))

    # --- Delivery ---
    s.append(section_heading("Delivery"))
    s.append(_field_table([[
        _field("Delivery location (city, prov/state)"),
        _field("Date"),
        _field("Time window"),
    ]], [full * 0.5, full * 0.25, full * 0.25]))

    # --- Freight ---
    s.append(section_heading("Freight"))
    s.append(_field_table([[
        _field("Commodity / description"),
        _field("Weight"),
        _field("Equipment required"),
    ]], [full * 0.5, full * 0.2, full * 0.3]))

    # --- Rate breakdown (highlighted) ---
    s.append(section_heading("Rate"))
    rate_rows = [
        [Paragraph('<font size=8 color="#5A6B7B"><b>GROSS RATE TO CARRIER</b></font>', st["body_sm"]),
         Paragraph('<font size=8 color="#5A6B7B"><b>DISPATCH FEE (% OR FLAT)</b></font>', st["body_sm"]),
         Paragraph('<font size=8 color="#FFFFFF"><b>NET TO CARRIER</b></font>', st["body_sm"])],
        [Paragraph('<font face="Courier" size=13>$ ____________</font>', st["mono"]),
         Paragraph('<font face="Courier" size=13>$ ___________</font>', st["mono"]),
         Paragraph('<font face="Courier" size=13 color="#FFFFFF">$ ____________</font>', st["mono"])],
    ]
    rt = Table(rate_rows, colWidths=[full / 3] * 3)
    rt.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (1, -1), colors.HexColor("#F2F5F8")),
        ("BACKGROUND", (2, 0), (2, -1), TEAL),
        ("BOX", (0, 0), (-1, -1), 0.7, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.7, colors.white),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
    ]))
    s.append(rt)
    s.append(Spacer(1, 2))
    s.append(_field_table([[
        _field("Loaded miles"),
        _field("Deadhead miles"),
        _field("Rate per mile", "calc"),
    ]], [full / 3] * 3))

    # --- Broker ---
    s.append(section_heading("Broker"))
    s.append(_field_table([[
        _field("Broker name"),
        _field("Broker contact (phone / email)"),
    ]], [full * 0.5, full * 0.5]))

    # --- Special instructions ---
    s.append(section_heading("Special Instructions"))
    si = Table([[Paragraph("&nbsp;", st["body"])]], colWidths=[full], rowHeights=[0.6 * inch])
    si.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.7, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    s.append(si)

    # --- Acknowledgment ---
    s.append(section_heading("Carrier Acknowledgment"))
    s.append(Spacer(1, 4))
    s.append(Paragraph(
        "By signing below, the Carrier confirms acceptance of this load at the net rate stated above "
        "and agrees to the pickup and delivery windows. This confirmation is governed by the "
        "Carrier-Dispatcher Agreement between the Parties.", st["body_sm"]))
    s.append(Spacer(1, 16))
    sig = Table([
        [Paragraph("________________________________", st["body"]),
         Paragraph("________________________________", st["body"])],
        [Paragraph("Carrier signature", st["label"]),
         Paragraph("Date", st["label"])],
    ], colWidths=[full * 0.6, full * 0.4])
    sig.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("LEFTPADDING", (0, 0), (0, -1), 0),
    ]))
    s.append(sig)

    doc.build(s)
    print(f"✓ Rate Confirmation Template → {output_path}")


if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, "output", "Northbound-Rate-Confirmation-Template.pdf")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    build(out)
