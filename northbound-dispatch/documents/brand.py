"""
Northbound Dispatch — shared PDF branding helpers (ReportLab).

Centralizes the color palette, typography, and reusable flowables (header
band, footer, disclaimer box, signature lines) so every generated document
looks like it came from the same shop.

Palette:  navy #0D1B2A | orange #FF6B35 | teal #1B998B
"""

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch, mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.platypus import Paragraph, Table, TableStyle, Spacer
from reportlab.pdfbase.pdfmetrics import stringWidth

# ----------------------------------------------------------------------------
# Palette
# ----------------------------------------------------------------------------
NAVY = colors.HexColor("#0D1B2A")
NAVY_2 = colors.HexColor("#122438")
ORANGE = colors.HexColor("#FF6B35")
TEAL = colors.HexColor("#1B998B")
LIGHT = colors.HexColor("#F7F7F7")
GREY = colors.HexColor("#5A6B7B")
TEXT = colors.HexColor("#1A1A1A")
LINE = colors.HexColor("#D5DCE3")

PAGE = letter
MARGIN = 0.85 * inch

# ReportLab ships with Helvetica; we use it as a clean stand-in for IBM Plex
# Sans / Barlow Condensed so the scripts have zero external font dependencies
# and run anywhere. (Swap in TTFs via pdfmetrics.registerFont if desired.)
FONT_HEAD = "Helvetica-Bold"
FONT_BODY = "Helvetica"
FONT_BODY_B = "Helvetica-Bold"
FONT_MONO = "Courier"

# Brand metadata
BRAND_NAME = "NORTHBOUND"
BRAND_SUB = "DISPATCH"
TAGLINE = "Your loads. Found. Confirmed. Done."
CONTACT_EMAIL = "yorkis@goldenmaplelandscaping.ca"
CONTACT_PHONE = "705-555-0000"
LOCATION = "Barrie, Ontario, Canada"


# ----------------------------------------------------------------------------
# Paragraph styles
# ----------------------------------------------------------------------------
def styles():
    ss = getSampleStyleSheet()
    out = {}
    out["title"] = ParagraphStyle(
        "nbTitle", parent=ss["Title"], fontName=FONT_HEAD, fontSize=20,
        textColor=NAVY, spaceAfter=4, leading=23,
    )
    out["subtitle"] = ParagraphStyle(
        "nbSubtitle", fontName=FONT_MONO, fontSize=9, textColor=TEAL,
        spaceAfter=14, leading=12,
    )
    out["h2"] = ParagraphStyle(
        "nbH2", fontName=FONT_HEAD, fontSize=12.5, textColor=NAVY,
        spaceBefore=14, spaceAfter=6, leading=15,
    )
    out["body"] = ParagraphStyle(
        "nbBody", fontName=FONT_BODY, fontSize=9.7, textColor=TEXT,
        spaceAfter=7, leading=14,
    )
    out["body_sm"] = ParagraphStyle(
        "nbBodySm", fontName=FONT_BODY, fontSize=8.6, textColor=TEXT,
        spaceAfter=5, leading=12,
    )
    out["bullet"] = ParagraphStyle(
        "nbBullet", parent=out["body"], leftIndent=16, bulletIndent=4,
        spaceAfter=4,
    )
    out["disclaimer"] = ParagraphStyle(
        "nbDisclaimer", fontName=FONT_BODY_B, fontSize=8.4, textColor=colors.HexColor("#7A2E12"),
        leading=11.5,
    )
    out["label"] = ParagraphStyle(
        "nbLabel", fontName=FONT_BODY_B, fontSize=8, textColor=GREY,
        leading=10,
    )
    out["mono"] = ParagraphStyle(
        "nbMono", fontName=FONT_MONO, fontSize=9, textColor=NAVY, leading=12,
    )
    out["footer"] = ParagraphStyle(
        "nbFooter", fontName=FONT_BODY, fontSize=7.5, textColor=GREY,
        alignment=TA_CENTER, leading=10,
    )
    out["white_brand"] = ParagraphStyle(
        "nbWhite", fontName=FONT_HEAD, fontSize=9, textColor=colors.white,
        alignment=TA_RIGHT, leading=11,
    )
    return out


# ----------------------------------------------------------------------------
# Page furniture (header band + footer) drawn on every page
# ----------------------------------------------------------------------------
def _draw_wordmark(c, x, y):
    """Draw the NORTHBOUND DISPATCH wordmark with a small orange arrow mark."""
    c.saveState()
    # arrow mark (points up — "northbound")
    c.setFillColor(ORANGE)
    p = c.beginPath()
    p.moveTo(x, y + 14)
    p.lineTo(x + 5, y + 7)
    p.lineTo(x + 2.2, y + 7)
    p.lineTo(x + 2.2, y + 2)
    p.lineTo(x - 2.2, y + 2)
    p.lineTo(x - 2.2, y + 7)
    p.lineTo(x - 5, y + 7)
    p.close()
    c.drawPath(p, fill=1, stroke=0)
    # wordmark
    c.setFillColor(colors.white)
    c.setFont(FONT_HEAD, 15)
    c.drawString(x + 12, y + 4, BRAND_NAME)
    w = stringWidth(BRAND_NAME, FONT_HEAD, 15)
    c.setFillColor(ORANGE)
    c.setFont(FONT_HEAD, 9)
    c.drawString(x + 12 + w + 6, y + 4, BRAND_SUB)
    c.restoreState()


def make_page_decorator(doc_label):
    """Return an onPage callback drawing the header band + footer."""
    def _decorate(c, doc):
        w, h = PAGE
        # ---- top navy band ----
        band_h = 0.62 * inch
        c.setFillColor(NAVY)
        c.rect(0, h - band_h, w, band_h, fill=1, stroke=0)
        # orange accent stripe under the band
        c.setFillColor(ORANGE)
        c.rect(0, h - band_h - 3, w, 3, fill=1, stroke=0)
        _draw_wordmark(c, MARGIN + 6, h - band_h + 0.21 * inch)
        # doc label, right aligned
        c.setFillColor(colors.white)
        c.setFont(FONT_MONO, 7.5)
        c.drawRightString(w - MARGIN, h - band_h + 0.30 * inch, doc_label.upper())
        c.setFillColor(TEAL)
        c.setFont("Helvetica-Oblique", 7)
        c.drawRightString(w - MARGIN, h - band_h + 0.18 * inch, TAGLINE)

        # ---- footer ----
        c.setStrokeColor(LINE)
        c.setLineWidth(0.5)
        c.line(MARGIN, 0.62 * inch, w - MARGIN, 0.62 * inch)
        c.setFillColor(GREY)
        c.setFont(FONT_BODY, 7.3)
        c.drawString(MARGIN, 0.46 * inch,
                     f"Northbound Dispatch · {LOCATION}")
        c.drawCentredString(w / 2, 0.46 * inch,
                            f"{CONTACT_EMAIL} · {CONTACT_PHONE}")
        c.drawRightString(w - MARGIN, 0.46 * inch, f"Page {doc.page}")
        c.setFont("Helvetica-Oblique", 6.6)
        c.drawString(MARGIN, 0.33 * inch,
                     "Independent dispatch service for owner-operators — not a freight broker.")
    return _decorate


# Distance from top of page to where flowables should begin (below band)
TOP_SPACE = 0.85 * inch
BOTTOM_SPACE = 0.85 * inch


def disclaimer_box(text):
    """A boxed legal disclaimer (orange-tinted)."""
    st = styles()
    p = Paragraph("<b>IMPORTANT — " + text + "</b>", st["disclaimer"])
    t = Table([[p]], colWidths=[PAGE[0] - 2 * MARGIN])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FDEFE8")),
        ("BOX", (0, 0), (-1, -1), 1, ORANGE),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    return t


def section_heading(text):
    """Navy section heading bar."""
    st = styles()
    p = Paragraph(f'<font color="#FFFFFF"><b>{text}</b></font>', st["h2"])
    t = Table([[p]], colWidths=[PAGE[0] - 2 * MARGIN])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), NAVY),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LINEBEFORE", (0, 0), (0, 0), 3, ORANGE),
    ]))
    return t
