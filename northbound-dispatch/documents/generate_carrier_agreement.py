"""
Northbound Dispatch — Carrier-Dispatcher Agreement (branded PDF).

Generates a clean, readable, fair contract template between Northbound
Dispatch and an owner-operator carrier. Northbound branding, Ontario
governing law. NOT legal advice — see the disclaimer banner.

Usage:
    python3 generate_carrier_agreement.py [output_path]
"""

import sys
import os
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table,
    TableStyle, ListFlowable, ListItem,
)
from reportlab.lib import colors

import brand
from brand import (
    PAGE, MARGIN, TOP_SPACE, BOTTOM_SPACE, styles, make_page_decorator,
    disclaimer_box, section_heading, NAVY, ORANGE, LINE, GREY,
)

# Default commercial terms (template placeholders)
DEFAULT_PCT = "8%"
DEFAULT_FLAT = "$200"
NON_CIRC_MONTHS = "6"


def build(output_path):
    st = styles()
    frame = Frame(
        MARGIN, BOTTOM_SPACE, PAGE[0] - 2 * MARGIN,
        PAGE[1] - TOP_SPACE - BOTTOM_SPACE, id="main",
    )
    doc = BaseDocTemplate(
        output_path, pagesize=PAGE, title="Carrier-Dispatcher Agreement",
        author="Northbound Dispatch", subject="Dispatch services agreement",
    )
    doc.addPageTemplates([
        PageTemplate(id="main", frames=[frame],
                     onPage=make_page_decorator("Carrier-Dispatcher Agreement"))
    ])

    s = []

    # --- Disclaimer first ---
    s.append(disclaimer_box(
        "THIS IS A TEMPLATE — NOT LEGAL ADVICE. Have this reviewed by a "
        "licensed Ontario attorney before use."
    ))
    s.append(Spacer(1, 12))

    s.append(Paragraph("Carrier-Dispatcher Agreement", st["title"]))
    s.append(Paragraph("Independent dispatch services · Province of Ontario, Canada", st["subtitle"]))

    intro = (
        'This Carrier-Dispatcher Agreement (the &ldquo;Agreement&rdquo;) is entered '
        'into as of <b>____________________</b> (the &ldquo;Effective Date&rdquo;) by and between:'
    )
    s.append(Paragraph(intro, st["body"]))

    # --- Parties table ---
    parties = Table([
        [Paragraph('<b>Northbound Dispatch</b><br/>'
                   '<font size=8 color="#5A6B7B">Independent contractor dispatcher</font><br/>'
                   'Barrie, Ontario, Canada<br/>'
                   '<font size=8>yorkis@goldenmaplelandscaping.ca</font>', st["body_sm"]),
         Paragraph('<b>The Carrier</b> (owner-operator)<br/>'
                   '<font size=8 color="#5A6B7B">Name:</font> ____________________________<br/>'
                   '<font size=8 color="#5A6B7B">MC / CVOR #:</font> _______________________<br/>'
                   '<font size=8 color="#5A6B7B">Address:</font> __________________________', st["body_sm"])],
    ], colWidths=[(PAGE[0] - 2 * MARGIN) / 2] * 2)
    parties.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.7, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.7, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FBFCFD")),
    ]))
    s.append(Spacer(1, 4))
    s.append(parties)
    s.append(Paragraph(
        'Collectively, the &ldquo;Parties.&rdquo; Northbound Dispatch is referred to as the '
        '&ldquo;Dispatcher&rdquo; and the owner-operator as the &ldquo;Carrier.&rdquo;', st["body"]))

    def clause(n, title, *paras):
        s.append(section_heading(f"{n}.  {title}"))
        s.append(Spacer(1, 5))
        for p in paras:
            if isinstance(p, (list, tuple)):
                items = [ListItem(Paragraph(x, st["body"]), value="•") for x in p]
                s.append(ListFlowable(items, bulletType="bullet", start="•",
                                      leftIndent=14, bulletFontSize=8))
            else:
                s.append(Paragraph(p, st["body"]))
        s.append(Spacer(1, 4))

    clause(1, "Services Provided",
           "The Dispatcher will provide the following services to the Carrier:",
           ["Sourcing and identifying freight loads matching the Carrier's equipment, lanes, and rate preferences.",
            "Negotiating freight rates with brokers and shippers on the Carrier's behalf.",
            "Communicating with brokers and shippers to arrange and confirm loads.",
            "Issuing load confirmations to the Carrier prior to dispatch.",
            "Basic paperwork coordination relating to dispatched loads."])

    clause(2, "Services NOT Provided",
           "<b>Northbound Dispatch is NOT a freight broker.</b> The Dispatcher does not, and shall not:",
           ["Hold, broker, or take possession of freight, or hold the Carrier's operating authority.",
            "Guarantee the availability, volume, or profitability of any loads.",
            "Provide insurance, vehicle maintenance, regulatory compliance, or safety services.",
            "Assume the role of carrier, shipper, or motor carrier of record."])

    clause(3, "Compensation Structure",
           "The Carrier shall compensate the Dispatcher under <b>one</b> of the following options, "
           "selected at the bottom of this Agreement:",
           [f"<b>Option A — Percentage:</b> {DEFAULT_PCT} of the gross load revenue for each load "
            "dispatched and delivered by the Carrier (default 8%).",
            f"<b>Option B — Flat Weekly Rate:</b> {DEFAULT_FLAT} per truck per week, regardless of "
            "load count (default $200/week), for high-volume consistent runners."],
           "<b>Payment terms:</b> The Dispatcher will invoice the Carrier weekly. Invoices are due "
           "within seven (7) days of issuance. All amounts are in Canadian Dollars (CAD) unless a "
           "specific cross-border load is quoted in U.S. Dollars (USD).")

    clause(4, "Term &amp; Termination",
           "This Agreement begins on the Effective Date and continues on a <b>week-to-week</b> basis. "
           "Either Party may terminate this Agreement for any reason with <b>seven (7) days' written "
           "notice</b> (email is sufficient). There are no termination penalties. Loads already "
           "confirmed at the time of termination shall be completed and invoiced under these terms.")

    clause(5, "Independent Contractor Status",
           "The Parties are independent contractors. Nothing in this Agreement creates an employment, "
           "partnership, joint venture, or agency relationship beyond the limited dispatch authority "
           "described herein. The Carrier is solely responsible for its own taxes, insurance, "
           "regulatory compliance, vehicle maintenance, WSIB coverage, fuel, and all costs of operation.")

    clause(6, "Carrier Obligations",
           ["Maintain a valid MC number and/or CVOR certificate, and all required operating authority.",
            "Maintain valid insurance (minimum $1,000,000 liability plus cargo coverage) and safety standards.",
            "Communicate truck availability, home base, and lane preferences accurately and promptly.",
            "Respond to confirmed load offers within the agreed timeframe and perform dispatched loads in good faith.",
            "Provide accurate documentation (BOLs, PODs) needed to invoice and close out loads."])

    clause(7, "Dispatcher Obligations",
           ["Source loads matching the Carrier's stated equipment, lanes, and rate preferences.",
            "Negotiate competitive rates in the Carrier's best interest.",
            "Communicate load details — rate, pickup/delivery, broker, and instructions — accurately.",
            "Maintain the confidentiality of the Carrier's business information."])

    clause(8, "Non-Circumvention",
           f"For a period of <b>{NON_CIRC_MONTHS} months</b> following termination of this Agreement, the "
           "Carrier agrees not to directly solicit or contract with any broker or shipper first "
           "introduced to the Carrier by the Dispatcher, where the purpose is to circumvent the "
           "Dispatcher's compensation. This is a standard industry clause and does not restrict the "
           "Carrier from working with brokers it had a prior relationship with.")

    clause(9, "Liability Limitation",
           "The Dispatcher is not liable for cargo loss or damage, delivery delays, accidents, "
           "demurrage, detention, claims, or the Carrier's regulatory or compliance failures. The "
           "Dispatcher's total aggregate liability under this Agreement shall not exceed the dispatch "
           "fees paid by the Carrier in the thirty (30) days preceding the event giving rise to the claim.")

    clause(10, "Confidentiality",
           "Each Party will keep confidential the non-public business information of the other Party "
           "disclosed in connection with this Agreement and will use it only to perform under this Agreement.")

    clause(11, "Governing Law",
           "This Agreement is governed by and construed in accordance with the laws of the "
           "<b>Province of Ontario</b> and the federal laws of Canada applicable therein. The Parties "
           "submit to the exclusive jurisdiction of the courts of Ontario.")

    clause(12, "Entire Agreement",
           "This Agreement is the entire agreement between the Parties regarding dispatch services "
           "and supersedes all prior discussions. Any amendment must be in writing and signed by both Parties.")

    # --- Compensation election ---
    s.append(section_heading("Compensation Election"))
    s.append(Spacer(1, 5))
    elect = Table([
        [Paragraph('<font face="Courier">[  ]</font>  Option A — Percentage of gross', st["body"]),
         Paragraph("Rate: _______ % (default 8%)", st["mono"])],
        [Paragraph('<font face="Courier">[  ]</font>  Option B — Flat weekly rate', st["body"]),
         Paragraph("Rate: $ _______ / week (default $200)", st["mono"])],
    ], colWidths=[(PAGE[0] - 2 * MARGIN) * 0.5] * 2)
    elect.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.7, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.7, LINE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
    ]))
    s.append(elect)

    # --- Signatures ---
    s.append(section_heading("Signatures"))
    s.append(Spacer(1, 14))
    sig = Table([
        [Paragraph("________________________________", st["body"]),
         Paragraph("________________________________", st["body"])],
        [Paragraph("Northbound Dispatch (Dispatcher)", st["label"]),
         Paragraph("Carrier (Owner-Operator)", st["label"])],
        [Spacer(1, 14), Spacer(1, 14)],
        [Paragraph("Printed name: ____________________", st["body_sm"]),
         Paragraph("Printed name: ____________________", st["body_sm"])],
        [Paragraph("Title: __________________________", st["body_sm"]),
         Paragraph("Title: __________________________", st["body_sm"])],
        [Paragraph("Date: ___________________________", st["body_sm"]),
         Paragraph("Date: ___________________________", st["body_sm"])],
    ], colWidths=[(PAGE[0] - 2 * MARGIN) * 0.5] * 2)
    sig.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ("LEFTPADDING", (0, 0), (0, -1), 0),
        ("LEFTPADDING", (1, 0), (1, -1), 18),
    ]))
    s.append(sig)

    doc.build(s)
    print(f"✓ Carrier-Dispatcher Agreement → {output_path}")


if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, "output", "Northbound-Carrier-Dispatcher-Agreement.pdf")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    build(out)
