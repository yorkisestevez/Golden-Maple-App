"""
Golden Maple Group — shared PDF branding helpers (ReportLab).

The parent / venture-studio brand above the operating businesses (Golden
Maple Landscaping, Northbound Dispatch, estimate-ai, ...). Centralizes the
palette, Montserrat typography, the maple-leaf mark, and reusable flowables
so every Golden Maple Group document looks like one premium house style.

Brand: gold #D4B06A on warm near-black, calm and premium. Montserrat.
Source: Golden Maple Landscaping Brand Guidelines + the Estevez/Yorkis
social system (dark + gold, letter-spaced caps, generous negative space).
"""

import os

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.platypus import Paragraph, Table, TableStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import stringWidth

# ----------------------------------------------------------------------------
# Fonts — Montserrat (brand font). Falls back to Helvetica if TTFs missing.
# ----------------------------------------------------------------------------
_FONT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts")


def _register_fonts():
    try:
        reg = [
            ("Montserrat", "Montserrat-Regular.ttf"),
            ("Montserrat-Medium", "Montserrat-Medium.ttf"),
            ("Montserrat-SemiBold", "Montserrat-SemiBold.ttf"),
            ("Montserrat-Bold", "Montserrat-Bold.ttf"),
            ("Montserrat-ExtraBold", "Montserrat-ExtraBold.ttf"),
            ("Montserrat-Light", "Montserrat-Light.ttf"),
        ]
        for name, fn in reg:
            path = os.path.join(_FONT_DIR, fn)
            if not os.path.exists(path):
                raise FileNotFoundError(path)
            pdfmetrics.registerFont(TTFont(name, path))
        pdfmetrics.registerFontFamily(
            "Montserrat", normal="Montserrat", bold="Montserrat-Bold",
            italic="Montserrat", boldItalic="Montserrat-Bold")
        return True
    except Exception:
        return False


_HAS_MONT = _register_fonts()

if _HAS_MONT:
    FONT_BODY = "Montserrat"
    FONT_MED = "Montserrat-Medium"
    FONT_SEMI = "Montserrat-SemiBold"
    FONT_HEAD = "Montserrat-Bold"
    FONT_HEAVY = "Montserrat-ExtraBold"
    FONT_LIGHT = "Montserrat-Light"
else:  # graceful fallback
    FONT_BODY = "Helvetica"
    FONT_MED = "Helvetica"
    FONT_SEMI = "Helvetica-Bold"
    FONT_HEAD = "Helvetica-Bold"
    FONT_HEAVY = "Helvetica-Bold"
    FONT_LIGHT = "Helvetica"

FONT_BODY_B = FONT_HEAD  # alias

# ----------------------------------------------------------------------------
# Palette — gold on warm near-black (Golden Maple Group)
# ----------------------------------------------------------------------------
INK = colors.HexColor("#0E0E0C")       # warm near-black — covers, bands
INK_2 = colors.HexColor("#1A1916")     # raised charcoal — tiles
GOLD = colors.HexColor("#D4B06A")      # primary gold — accents, numbers
GOLD_LT = colors.HexColor("#E2C27D")   # hover / lighter gold
CREAM = colors.HexColor("#F3E9D6")     # soft accent — callout fills
PAPER = colors.HexColor("#FAF8F4")     # warm white surface
TEXT = colors.HexColor("#111111")      # primary text
TEXT_2 = colors.HexColor("#5A554C")    # muted warm grey
LINE = colors.HexColor("#E6DECF")      # warm hairline
LINE_DK = colors.HexColor("#34322C")   # hairline on dark

PAGE = letter
MARGIN = 0.9 * inch

# Brand metadata
BRAND_NAME = "GOLDEN MAPLE"
BRAND_SUB = "GROUP"
TAGLINE = "Built for longevity. Designed for life."
CONTACT_EMAIL = "yorkis@goldenmaplelandscaping.ca"
LOCATION = "Barrie, Ontario, Canada"

TOP_SPACE = 0.98 * inch
BOTTOM_SPACE = 0.85 * inch


# ----------------------------------------------------------------------------
# Paragraph styles
# ----------------------------------------------------------------------------
def styles():
    ss = getSampleStyleSheet()
    out = {}
    out["title"] = ParagraphStyle(
        "gmTitle", parent=ss["Title"], fontName=FONT_HEAD, fontSize=21,
        textColor=TEXT, spaceAfter=4, leading=25, alignment=TA_LEFT)
    out["subtitle"] = ParagraphStyle(
        "gmSubtitle", fontName=FONT_SEMI, fontSize=8.5, textColor=GOLD,
        spaceAfter=14, leading=12)
    out["h2"] = ParagraphStyle(
        "gmH2", fontName=FONT_HEAD, fontSize=13, textColor=TEXT,
        spaceBefore=14, spaceAfter=6, leading=16)
    out["h3"] = ParagraphStyle(
        "gmH3", fontName=FONT_SEMI, fontSize=10.5, textColor=TEXT,
        spaceBefore=10, spaceAfter=3, leading=13)
    out["body"] = ParagraphStyle(
        "gmBody", fontName=FONT_BODY, fontSize=9.6, textColor=TEXT,
        spaceAfter=7, leading=14.5)
    out["body_sm"] = ParagraphStyle(
        "gmBodySm", fontName=FONT_BODY, fontSize=8.5, textColor=TEXT,
        spaceAfter=5, leading=12.5)
    out["bullet"] = ParagraphStyle(
        "gmBullet", parent=out["body"], leftIndent=15, bulletIndent=3,
        spaceAfter=4)
    out["lead"] = ParagraphStyle(
        "gmLead", fontName=FONT_MED, fontSize=11, textColor=TEXT,
        spaceAfter=9, leading=16.5)
    out["label"] = ParagraphStyle(
        "gmLabel", fontName=FONT_SEMI, fontSize=7.3, textColor=TEXT_2,
        leading=10)
    out["footer"] = ParagraphStyle(
        "gmFooter", fontName=FONT_BODY, fontSize=7.5, textColor=TEXT_2,
        alignment=TA_CENTER, leading=10)
    # cover styles (light text on ink)
    out["cover_title"] = ParagraphStyle(
        "gmCoverTitle", fontName=FONT_HEAVY, fontSize=34, textColor=colors.white,
        leading=37, spaceAfter=10, alignment=TA_LEFT)
    out["cover_sub"] = ParagraphStyle(
        "gmCoverSub", fontName=FONT_LIGHT, fontSize=13, textColor=colors.HexColor("#C9C3B6"),
        leading=19, alignment=TA_LEFT)
    out["cover_meta"] = ParagraphStyle(
        "gmCoverMeta", fontName=FONT_MED, fontSize=8.5, textColor=colors.HexColor("#8C887E"),
        leading=13, alignment=TA_LEFT)
    return out


# ----------------------------------------------------------------------------
# The maple-leaf mark
# ----------------------------------------------------------------------------
# Right half of a stylized maple leaf, normalized: x out from centre (0),
# y up from the stem base (0..1). Mirrored to form the full symmetric leaf.
_LEAF_RIGHT = [
    (0.000, 1.000), (0.060, 0.840), (0.035, 0.792), (0.205, 0.838),
    (0.150, 0.690), (0.120, 0.628), (0.385, 0.660), (0.300, 0.512),
    (0.262, 0.452), (0.500, 0.470), (0.355, 0.318), (0.392, 0.214),
    (0.205, 0.262), (0.182, 0.108), (0.066, 0.150), (0.070, 0.030),
    (0.030, 0.020), (0.030, 0.000), (0.000, 0.000),
]


def draw_leaf(c, cx, cy, size, color=GOLD):
    """Draw the maple-leaf mark; cx = horizontal centre, cy = stem base, size = height."""
    c.saveState()
    c.setFillColor(color)
    p = c.beginPath()
    pts = [(cx + x * size, cy + y * size) for (x, y) in _LEAF_RIGHT]
    pts += [(cx - x * size, cy + y * size) for (x, y) in reversed(_LEAF_RIGHT[:-1])]
    p.moveTo(*pts[0])
    for px, py in pts[1:]:
        p.lineTo(px, py)
    p.close()
    c.drawPath(p, fill=1, stroke=0)
    c.restoreState()


def _spaced(c, x, y, text, font, size, color, gap=2.0, right=False):
    """Draw letter-spaced text (small caps style). Returns drawn width.

    Resets the PDF char-spacing (Tc) afterwards — otherwise it leaks into
    every subsequent text op on the page.
    """
    w = stringWidth(text, font, size) + gap * max(0, len(text) - 1)
    sx = x - w if right else x
    to = c.beginText()
    to.setFont(font, size)
    to.setFillColor(color)
    to.setCharSpace(gap)
    to.setTextOrigin(sx, y)
    to.textOut(text)
    to.setCharSpace(0)  # reset within the same text object
    c.drawText(to)
    return w


def _draw_wordmark(c, x, y, on_dark=True, leaf_h=17):
    """Maple leaf + GOLDEN MAPLE / GROUP wordmark, baseline at y."""
    draw_leaf(c, x + leaf_h * 0.5, y - 2, leaf_h, GOLD)
    name_color = colors.white if on_dark else TEXT
    tx = x + leaf_h + 9
    wn = _spaced(c, tx, y + 2.5, BRAND_NAME, FONT_HEAD, 12, name_color, gap=1.2)
    _spaced(c, tx + wn + 7, y + 2.5, BRAND_SUB, FONT_SEMI, 9, GOLD, gap=2)


# ----------------------------------------------------------------------------
# Interior page furniture
# ----------------------------------------------------------------------------
def make_page_decorator(doc_label):
    def _decorate(c, doc):
        w, h = PAGE
        band_h = 0.64 * inch
        c.setFillColor(INK)
        c.rect(0, h - band_h, w, band_h, fill=1, stroke=0)
        c.setFillColor(GOLD)
        c.rect(0, h - band_h - 2, w, 2, fill=1, stroke=0)
        _draw_wordmark(c, MARGIN, h - band_h + 0.24 * inch, on_dark=True)
        _spaced(c, w - MARGIN, h - band_h + 0.255 * inch, doc_label.upper(),
                FONT_MED, 7, colors.HexColor("#C9C3B6"), gap=1.5, right=True)

        # footer
        c.setStrokeColor(LINE)
        c.setLineWidth(0.5)
        c.line(MARGIN, 0.62 * inch, w - MARGIN, 0.62 * inch)
        c.setFillColor(TEXT_2)
        c.setFont(FONT_BODY, 7.3)
        c.drawString(MARGIN, 0.46 * inch, f"Golden Maple Group · {LOCATION}")
        c.setFont(FONT_MED, 7.3)
        c.drawCentredString(w / 2, 0.46 * inch, TAGLINE)
        c.setFont(FONT_BODY, 7.3)
        c.drawRightString(w - MARGIN, 0.46 * inch, f"Page {doc.page}")
        c.setFont(FONT_BODY, 6.6)
        c.setFillColor(colors.HexColor("#8C887E"))
        c.drawString(MARGIN, 0.33 * inch,
                     "Confidential — for the named recipient only. © Golden Maple Group.")
    return _decorate


def make_cover_decorator(title, subtitle, kicker, meta_lines):
    def _cover(c, doc):
        w, h = PAGE
        c.setFillColor(INK)
        c.rect(0, 0, w, h, fill=1, stroke=0)
        # top gold corner stripe (left segment, like the social system)
        c.setFillColor(GOLD)
        c.rect(0, h - 0.14 * inch, 0.95 * inch, 0.14 * inch, fill=1, stroke=0)

        # big maple leaf + wordmark, upper-left
        draw_leaf(c, MARGIN + 0.34 * inch, h - 1.62 * inch, 0.7 * inch, GOLD)
        wx = MARGIN + 0.85 * inch
        ww = _spaced(c, wx, h - 1.32 * inch, BRAND_NAME, FONT_HEAD, 20, colors.white, gap=1.5)
        _spaced(c, wx + ww + 8, h - 1.32 * inch, BRAND_SUB, FONT_SEMI, 12, GOLD, gap=3)

        st = styles()
        # kicker (letter-spaced gold) + gold underline
        ky = h - 3.25 * inch
        _spaced(c, MARGIN, ky, kicker.upper(), FONT_SEMI, 9.5, GOLD, gap=2.4)
        c.setStrokeColor(GOLD)
        c.setLineWidth(1.4)
        c.line(MARGIN, ky - 8, MARGIN + 0.5 * inch, ky - 8)

        # title + subtitle as paragraphs (handle <br/>)
        text_w = w - 2 * MARGIN
        y = ky - 26

        def draw_para(key, text, gap):
            nonlocal y
            para = Paragraph(text, st[key])
            pw, ph = para.wrap(text_w, 4 * inch)
            para.drawOn(c, MARGIN, y - ph)
            y = y - ph - gap

        draw_para("cover_title", title, 10)
        draw_para("cover_sub", subtitle, 26)

        # divider + meta
        c.setStrokeColor(LINE_DK)
        c.setLineWidth(1)
        c.line(MARGIN, 1.62 * inch, w - MARGIN, 1.62 * inch)
        c.setFillColor(colors.HexColor("#8C887E"))
        c.setFont(FONT_MED, 8.5)
        my = 1.4 * inch
        for ln in meta_lines:
            c.drawString(MARGIN, my, ln)
            my -= 0.2 * inch
        c.setFillColor(GOLD)
        c.setFont(FONT_MED, 9)
        c.drawRightString(w - MARGIN, 0.85 * inch, TAGLINE)
    return _cover


# ----------------------------------------------------------------------------
# Reusable flowables
# ----------------------------------------------------------------------------
def section_heading(text, num=None):
    st = styles()
    label = f'{num}&nbsp;&nbsp;&nbsp;{text}' if num else text
    p = Paragraph(f'<font color="#FFFFFF" face="{FONT_HEAD}"><b>{label}</b></font>', st["h2"])
    t = Table([[p]], colWidths=[PAGE[0] - 2 * MARGIN])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), INK),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LINEBEFORE", (0, 0), (0, 0), 3.5, GOLD),
    ]))
    return t


def callout(text, accent=GOLD, bg="#F3E9D6", textcolor=None):
    st = styles()
    tc = textcolor or "#1A1916"
    p = Paragraph(f'<font color="{tc}">{text}</font>', st["body"])
    t = Table([[p]], colWidths=[PAGE[0] - 2 * MARGIN])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor(bg)),
        ("LINEBEFORE", (0, 0), (0, 0), 4, accent),
        ("LEFTPADDING", (0, 0), (-1, -1), 13),
        ("RIGHTPADDING", (0, 0), (-1, -1), 13),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    return t


def stat_tiles(items):
    st = styles()
    full = PAGE[0] - 2 * MARGIN
    gap = 0.16 * inch
    n = len(items)
    cw = (full - gap * (n - 1)) / n
    cells = []
    for big, small in items:
        cell = Table([
            [Paragraph(f'<font color="#D4B06A" size=19 face="{FONT_HEAVY}"><b>{big}</b></font>', st["body"])],
            [Paragraph(f'<font color="#C9C3B6" size=8>{small}</font>', st["body_sm"])],
        ], colWidths=[cw])
        cell.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), INK),
            ("LINEABOVE", (0, 0), (-1, 0), 2.5, GOLD),
            ("LEFTPADDING", (0, 0), (-1, -1), 12),
            ("RIGHTPADDING", (0, 0), (-1, -1), 12),
            ("TOPPADDING", (0, 0), (0, 0), 12),
            ("BOTTOMPADDING", (0, 0), (0, 0), 2),
            ("TOPPADDING", (0, 1), (0, 1), 0),
            ("BOTTOMPADDING", (0, 1), (-1, -1), 12),
        ]))
        cells.append(cell)
    row, widths = [], []
    for i, cell in enumerate(cells):
        row.append(cell)
        widths.append(cw)
        if i != len(cells) - 1:
            row.append("")
            widths.append(gap)
    t = Table([row], colWidths=widths)
    t.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP")]))
    return t


def data_table(header, rows, col_widths=None, zebra=True):
    st = styles()
    full = PAGE[0] - 2 * MARGIN
    if col_widths is None:
        col_widths = [full / len(header)] * len(header)
    data = [[Paragraph(f'<font color="#FFFFFF" face="{FONT_SEMI}"><b>{h}</b></font>', st["body_sm"]) for h in header]]
    for r in rows:
        data.append([Paragraph(str(cell), st["body_sm"]) for cell in r])
    t = Table(data, colWidths=col_widths, repeatRows=1)
    style = [
        ("BACKGROUND", (0, 0), (-1, 0), INK),
        ("LINEBELOW", (0, 0), (-1, 0), 2, GOLD),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LINEBELOW", (0, 1), (-1, -1), 0.4, LINE),
    ]
    if zebra:
        for i in range(1, len(data)):
            if i % 2 == 0:
                style.append(("BACKGROUND", (0, i), (-1, i), CREAM))
    t.setStyle(TableStyle(style))
    return t


def numbered_step(num, title, body):
    st = styles()
    full = PAGE[0] - 2 * MARGIN
    cell = Table([[
        Paragraph(f'<font color="#D4B06A" size=20 face="{FONT_HEAVY}"><b>{num}</b></font>', st["body"]),
        Paragraph(f'<font face="{FONT_SEMI}"><b>{title}</b></font><br/>'
                  f'<font size=8.6 color="#5A554C">{body}</font>', st["body_sm"]),
    ]], colWidths=[0.5 * inch, full - 0.5 * inch])
    cell.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LINEBELOW", (0, 0), (-1, -1), 0.5, LINE),
    ]))
    return cell


# Backwards-compatible colour aliases (generators referenced these names)
INDIGO = GOLD
CYAN = GOLD_LT
GREY = TEXT_2
