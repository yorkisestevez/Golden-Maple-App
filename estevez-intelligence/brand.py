"""
Estevez Intelligence — shared PDF branding helpers (ReportLab).

Parent / venture-studio brand that sits above the operating businesses
(Northbound Dispatch, Golden Maple + estimate-ai, ...). Centralizes the
palette, typography, the "constellation" mark, and reusable flowables so
every Estevez Intelligence document looks like one house style.

Palette:  ink #0A0E1A | indigo #6C5CE7 | gold #F2B441 | cyan #22D3EE

Zero external font dependencies — uses ReportLab's built-in Helvetica /
Courier so the generators run anywhere. Swap in TTFs via
pdfmetrics.registerFont if brand fonts are desired later.
"""

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.platypus import Paragraph, Table, TableStyle
from reportlab.pdfbase.pdfmetrics import stringWidth

# ----------------------------------------------------------------------------
# Palette
# ----------------------------------------------------------------------------
INK = colors.HexColor("#0A0E1A")       # near-black navy — authority
INK_2 = colors.HexColor("#131A2E")     # raised ink surface
INDIGO = colors.HexColor("#6C5CE7")    # signature accent — intelligence / AI
INDIGO_D = colors.HexColor("#4B3FC4")  # deeper indigo
GOLD = colors.HexColor("#F2B441")      # premium highlight
CYAN = colors.HexColor("#22D3EE")      # data / tech accent
LIGHT = colors.HexColor("#F5F6FA")     # light surface
CARD = colors.HexColor("#EEF0F7")      # tinted card
GREY = colors.HexColor("#646B7C")      # muted text
TEXT = colors.HexColor("#161A23")      # body text
LINE = colors.HexColor("#DCE0EA")      # hairlines

PAGE = letter
MARGIN = 0.85 * inch

FONT_HEAD = "Helvetica-Bold"
FONT_BODY = "Helvetica"
FONT_BODY_B = "Helvetica-Bold"
FONT_ITAL = "Helvetica-Oblique"
FONT_MONO = "Courier"
FONT_MONO_B = "Courier-Bold"

# Brand metadata
BRAND_NAME = "ESTEVEZ"
BRAND_SUB = "INTELLIGENCE"
TAGLINE = "Applied intelligence for real-world businesses."
CONTACT_EMAIL = "yorkis@estevezintelligence.com"
LOCATION = "Barrie, Ontario, Canada"

# Distances from the page edges to the content frame
TOP_SPACE = 0.95 * inch
BOTTOM_SPACE = 0.85 * inch


# ----------------------------------------------------------------------------
# Paragraph styles
# ----------------------------------------------------------------------------
def styles():
    ss = getSampleStyleSheet()
    out = {}
    out["title"] = ParagraphStyle(
        "eiTitle", parent=ss["Title"], fontName=FONT_HEAD, fontSize=21,
        textColor=INK, spaceAfter=4, leading=24, alignment=TA_LEFT)
    out["subtitle"] = ParagraphStyle(
        "eiSubtitle", fontName=FONT_MONO, fontSize=9, textColor=INDIGO,
        spaceAfter=14, leading=12)
    out["h2"] = ParagraphStyle(
        "eiH2", fontName=FONT_HEAD, fontSize=13, textColor=INK,
        spaceBefore=14, spaceAfter=6, leading=16)
    out["h3"] = ParagraphStyle(
        "eiH3", fontName=FONT_HEAD, fontSize=10.5, textColor=INDIGO_D,
        spaceBefore=10, spaceAfter=3, leading=13)
    out["body"] = ParagraphStyle(
        "eiBody", fontName=FONT_BODY, fontSize=9.8, textColor=TEXT,
        spaceAfter=7, leading=14.5)
    out["body_sm"] = ParagraphStyle(
        "eiBodySm", fontName=FONT_BODY, fontSize=8.7, textColor=TEXT,
        spaceAfter=5, leading=12.5)
    out["bullet"] = ParagraphStyle(
        "eiBullet", parent=out["body"], leftIndent=15, bulletIndent=3,
        spaceAfter=4)
    out["lead"] = ParagraphStyle(
        "eiLead", fontName=FONT_BODY, fontSize=11, textColor=INK,
        spaceAfter=9, leading=16)
    out["label"] = ParagraphStyle(
        "eiLabel", fontName=FONT_MONO, fontSize=7.5, textColor=GREY,
        leading=10)
    out["mono"] = ParagraphStyle(
        "eiMono", fontName=FONT_MONO, fontSize=8.6, textColor=INK, leading=12)
    out["footer"] = ParagraphStyle(
        "eiFooter", fontName=FONT_BODY, fontSize=7.5, textColor=GREY,
        alignment=TA_CENTER, leading=10)
    # cover-page styles (light text on ink)
    out["cover_kicker"] = ParagraphStyle(
        "eiCoverKick", fontName=FONT_MONO, fontSize=10, textColor=GOLD,
        leading=14, alignment=TA_LEFT)
    out["cover_title"] = ParagraphStyle(
        "eiCoverTitle", fontName=FONT_HEAD, fontSize=33, textColor=colors.white,
        leading=37, spaceAfter=10, alignment=TA_LEFT)
    out["cover_sub"] = ParagraphStyle(
        "eiCoverSub", fontName=FONT_BODY, fontSize=13, textColor=colors.HexColor("#C7CCDA"),
        leading=19, alignment=TA_LEFT)
    out["cover_meta"] = ParagraphStyle(
        "eiCoverMeta", fontName=FONT_MONO, fontSize=8.5, textColor=colors.HexColor("#8C93A8"),
        leading=13, alignment=TA_LEFT)
    return out


# ----------------------------------------------------------------------------
# The constellation mark — nodes ascending (intelligence + growth)
# ----------------------------------------------------------------------------
def draw_mark(c, x, y, size=22, tile=True, node=GOLD, link=None):
    """Draw the Estevez Intelligence mark anchored at lower-left (x, y).

    A rounded indigo tile holding four nodes connected on an ascending path —
    'applied intelligence lifting a business upward.'
    """
    if link is None:
        link = colors.HexColor("#C9C2FF")
    c.saveState()
    if tile:
        c.setFillColor(INDIGO)
        c.roundRect(x, y, size, size, size * 0.26, fill=1, stroke=0)
    s = size
    # node positions (relative within the tile), ascending left->right
    pts = [
        (x + 0.22 * s, y + 0.28 * s),
        (x + 0.44 * s, y + 0.52 * s),
        (x + 0.62 * s, y + 0.38 * s),
        (x + 0.80 * s, y + 0.74 * s),
    ]
    # links
    c.setStrokeColor(link)
    c.setLineWidth(max(1.0, size * 0.055))
    for (ax, ay), (bx, by) in zip(pts, pts[1:]):
        c.line(ax, ay, bx, by)
    # nodes
    r = max(1.3, size * 0.075)
    for i, (px, py) in enumerate(pts):
        c.setFillColor(node if i == len(pts) - 1 else colors.white)
        c.circle(px, py, r if i != len(pts) - 1 else r * 1.25, fill=1, stroke=0)
    c.restoreState()


def _draw_wordmark(c, x, y, on_dark=True):
    """ESTEVEZ INTELLIGENCE wordmark with the mark, baseline at y."""
    c.saveState()
    draw_mark(c, x, y - 4, size=20)
    name_color = colors.white if on_dark else INK
    c.setFillColor(name_color)
    c.setFont(FONT_HEAD, 14)
    c.drawString(x + 28, y + 3, BRAND_NAME)
    w = stringWidth(BRAND_NAME, FONT_HEAD, 14)
    c.setFillColor(GOLD)
    c.setFont(FONT_HEAD, 8.5)
    c.drawString(x + 28 + w + 6, y + 3.5, BRAND_SUB)
    c.restoreState()


# ----------------------------------------------------------------------------
# Interior page furniture (header band + footer)
# ----------------------------------------------------------------------------
def make_page_decorator(doc_label):
    def _decorate(c, doc):
        w, h = PAGE
        band_h = 0.66 * inch
        # ink band
        c.setFillColor(INK)
        c.rect(0, h - band_h, w, band_h, fill=1, stroke=0)
        # thin indigo->gold accent stripe (two segments)
        c.setFillColor(INDIGO)
        c.rect(0, h - band_h - 3, w * 0.62, 3, fill=1, stroke=0)
        c.setFillColor(GOLD)
        c.rect(w * 0.62, h - band_h - 3, w * 0.38, 3, fill=1, stroke=0)
        _draw_wordmark(c, MARGIN, h - band_h + 0.24 * inch, on_dark=True)
        # doc label, right
        c.setFillColor(colors.HexColor("#C7CCDA"))
        c.setFont(FONT_MONO, 7.3)
        c.drawRightString(w - MARGIN, h - band_h + 0.30 * inch, doc_label.upper())
        c.setFillColor(GOLD)
        c.setFont(FONT_ITAL, 6.8)
        c.drawRightString(w - MARGIN, h - band_h + 0.18 * inch, "WHITEPAPER")

        # footer
        c.setStrokeColor(LINE)
        c.setLineWidth(0.5)
        c.line(MARGIN, 0.62 * inch, w - MARGIN, 0.62 * inch)
        c.setFillColor(GREY)
        c.setFont(FONT_BODY, 7.3)
        c.drawString(MARGIN, 0.46 * inch, f"Estevez Intelligence · {LOCATION}")
        c.drawCentredString(w / 2, 0.46 * inch, TAGLINE)
        c.drawRightString(w - MARGIN, 0.46 * inch, f"Page {doc.page}")
        c.setFont(FONT_ITAL, 6.6)
        c.drawString(MARGIN, 0.33 * inch,
                     "Confidential — concept & methodology overview. © Estevez Intelligence.")
    return _decorate


def make_cover_decorator(title, subtitle, kicker, meta_lines):
    """Full-bleed ink cover drawn entirely on the canvas."""
    def _cover(c, doc):
        w, h = PAGE
        # full ink background
        c.setFillColor(INK)
        c.rect(0, 0, w, h, fill=1, stroke=0)
        # faint constellation texture (decorative nodes, top-right)
        c.saveState()
        c.setFillColor(INK_2)
        for gx in range(0, 6):
            for gy in range(0, 4):
                px = w - 2.6 * inch + gx * 0.42 * inch
                py = h - 2.2 * inch + gy * 0.42 * inch
                c.circle(px, py, 1.6, fill=1, stroke=0)
        c.restoreState()
        # top stripe
        c.setFillColor(INDIGO)
        c.rect(0, h - 0.16 * inch, w * 0.62, 0.16 * inch, fill=1, stroke=0)
        c.setFillColor(GOLD)
        c.rect(w * 0.62, h - 0.16 * inch, w * 0.38, 0.16 * inch, fill=1, stroke=0)

        # big mark, upper-left
        draw_mark(c, MARGIN, h - 1.7 * inch, size=58)
        # wordmark next to it
        c.setFillColor(colors.white)
        c.setFont(FONT_HEAD, 22)
        c.drawString(MARGIN + 74, h - 1.43 * inch, BRAND_NAME)
        ww = stringWidth(BRAND_NAME, FONT_HEAD, 22)
        c.setFillColor(GOLD)
        c.setFont(FONT_HEAD, 13)
        c.drawString(MARGIN + 74 + ww + 8, h - 1.43 * inch, BRAND_SUB)

        st = styles()
        # kicker / title / subtitle stacked in a frame-less block
        from reportlab.platypus import Paragraph as P
        from reportlab.lib.units import inch as IN
        text_w = w - 2 * MARGIN
        y = h - 3.2 * IN

        def draw_para(style_key, text, gap):
            nonlocal y
            para = P(text, st[style_key])
            pw, ph = para.wrap(text_w, 4 * IN)
            para.drawOn(c, MARGIN, y - ph)
            y = y - ph - gap

        draw_para("cover_kicker", kicker, 10)
        draw_para("cover_title", title, 8)
        draw_para("cover_sub", subtitle, 26)

        # divider
        c.setStrokeColor(colors.HexColor("#2A3350"))
        c.setLineWidth(1)
        c.line(MARGIN, 1.7 * inch, w - MARGIN, 1.7 * inch)
        # meta lines bottom
        c.setFillColor(colors.HexColor("#8C93A8"))
        c.setFont(FONT_MONO, 8.5)
        my = 1.45 * inch
        for ln in meta_lines:
            c.drawString(MARGIN, my, ln)
            my -= 0.2 * inch
        # tagline bottom-right
        c.setFillColor(GOLD)
        c.setFont(FONT_ITAL, 9)
        c.drawRightString(w - MARGIN, 0.85 * inch, TAGLINE)
    return _cover


# ----------------------------------------------------------------------------
# Reusable flowables
# ----------------------------------------------------------------------------
def section_heading(text, num=None):
    st = styles()
    label = f'{num} &nbsp; {text}' if num else text
    p = Paragraph(f'<font color="#FFFFFF"><b>{label}</b></font>', st["h2"])
    t = Table([[p]], colWidths=[PAGE[0] - 2 * MARGIN])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), INK),
        ("LEFTPADDING", (0, 0), (-1, -1), 11),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LINEBEFORE", (0, 0), (0, 0), 3.5, GOLD),
    ]))
    return t


def callout(text, accent=INDIGO, bg="#EEF0F7", textcolor=None):
    """Tinted callout / pull-quote box with a left accent bar."""
    st = styles()
    tc = textcolor or "#161A23"
    p = Paragraph(f'<font color="{tc}">{text}</font>', st["body"])
    t = Table([[p]], colWidths=[PAGE[0] - 2 * MARGIN])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor(bg)),
        ("LINEBEFORE", (0, 0), (0, 0), 4, accent),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))
    return t


def stat_tiles(items):
    """Row of stat tiles: items = [(big, small), ...] (2–4 tiles)."""
    st = styles()
    full = PAGE[0] - 2 * MARGIN
    gap = 0.16 * inch
    n = len(items)
    cw = (full - gap * (n - 1)) / n
    cells = []
    for big, small in items:
        cell = Table([
            [Paragraph(f'<font color="#FFFFFF" size=19><b>{big}</b></font>', st["body"])],
            [Paragraph(f'<font color="#C7CCDA" size=8>{small}</font>', st["body_sm"])],
        ], colWidths=[cw])
        cell.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), INK_2),
            ("LINEABOVE", (0, 0), (-1, 0), 3, GOLD),
            ("LEFTPADDING", (0, 0), (-1, -1), 11),
            ("RIGHTPADDING", (0, 0), (-1, -1), 11),
            ("TOPPADDING", (0, 0), (0, 0), 11),
            ("BOTTOMPADDING", (0, 0), (0, 0), 2),
            ("TOPPADDING", (0, 1), (0, 1), 0),
            ("BOTTOMPADDING", (0, 1), (-1, -1), 11),
        ]))
        cells.append(cell)
    # space the tiles
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
    """Branded data table with ink header row."""
    st = styles()
    full = PAGE[0] - 2 * MARGIN
    if col_widths is None:
        col_widths = [full / len(header)] * len(header)
    data = [[Paragraph(f'<font color="#FFFFFF"><b>{h}</b></font>', st["body_sm"]) for h in header]]
    for r in rows:
        data.append([Paragraph(str(cell), st["body_sm"]) for cell in r])
    t = Table(data, colWidths=col_widths, repeatRows=1)
    style = [
        ("BACKGROUND", (0, 0), (-1, 0), INK),
        ("LINEBELOW", (0, 0), (-1, 0), 2, GOLD),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, 1), (-1, -1), 0.4, LINE),
    ]
    if zebra:
        for i in range(1, len(data)):
            if i % 2 == 0:
                style.append(("BACKGROUND", (0, i), (-1, i), LIGHT))
    t.setStyle(TableStyle(style))
    return t


def numbered_step(num, title, body):
    """A numbered method step: gold number + title/body."""
    st = styles()
    full = PAGE[0] - 2 * MARGIN
    cell = Table([[
        Paragraph(f'<font color="#6C5CE7" size=20 face="Courier-Bold"><b>{num}</b></font>', st["body"]),
        Paragraph(f'<b>{title}</b><br/><font size=8.6 color="#646B7C">{body}</font>', st["body_sm"]),
    ]], colWidths=[0.52 * inch, full - 0.52 * inch])
    cell.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LINEBELOW", (0, 0), (-1, -1), 0.5, colors.HexColor("#ECEFF4")),
    ]))
    return cell
