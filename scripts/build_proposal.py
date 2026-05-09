"""Build Adamson_Proposal_Revised.pdf — Golden Maple Landscaping.

Premium hardscape proposal in burgundy/gold brand system.
Letter size, ~10 pages.
"""
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle,
    Image, KeepTogether, PageBreak, Flowable, NextPageTemplate
)
from reportlab.pdfgen import canvas
from pathlib import Path

# ────────── BRAND ──────────
BURGUNDY = HexColor("#6B1E2E")
BURGUNDY_DEEP = HexColor("#4E1522")
GOLD = HexColor("#D4AF63")
BONE = HexColor("#F2EEE7")
CREAM_ROW = HexColor("#FAF6ED")
DARK = HexColor("#3B3832")
MID = HexColor("#6B6760")
WHITE = HexColor("#FFFFFF")

ROOT = Path(__file__).parent
ASSETS = ROOT / "assets"
HERO = str(ASSETS / "hero.jpg")
LOGO = str(ASSETS / "logo.png")
OUT_PDF = ROOT.parent / "Adamson_Proposal_Revised.pdf"

PAGE_W, PAGE_H = LETTER
MARGIN_L = 0.75 * inch
MARGIN_R = 0.75 * inch
MARGIN_T = 0.95 * inch
MARGIN_B = 0.85 * inch
HEADER_H = 0.55 * inch
FOOTER_H = 0.55 * inch
CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R

# ────────── PARAGRAPH STYLES ──────────
def ps(name, **kw):
    base = dict(
        fontName="Helvetica",
        fontSize=10.5,
        leading=14.5,
        textColor=DARK,
        alignment=TA_LEFT,
        spaceAfter=0,
    )
    base.update(kw)
    return ParagraphStyle(name, **base)

S_BODY      = ps("body")
S_BODY_J    = ps("bodyJ", alignment=TA_JUSTIFY)
S_BODY_SM   = ps("bodySm", fontSize=9.5, leading=13)
S_LEAD      = ps("lead", fontSize=11, leading=15.5, textColor=DARK)
S_EYEBROW   = ps("eyebrow", fontName="Helvetica-Bold", fontSize=8.5, leading=11,
                 textColor=GOLD, alignment=TA_LEFT)
S_EYEBROW_C = ps("eyebrowC", fontName="Helvetica-Bold", fontSize=8.5, leading=11,
                 textColor=GOLD, alignment=TA_CENTER)
S_H1        = ps("h1", fontName="Helvetica-Bold", fontSize=22, leading=26,
                 textColor=BURGUNDY, spaceAfter=4)
S_H2        = ps("h2", fontName="Helvetica-Bold", fontSize=15, leading=19,
                 textColor=BURGUNDY, spaceAfter=4)
S_H3        = ps("h3", fontName="Helvetica-Bold", fontSize=11.5, leading=15,
                 textColor=BURGUNDY, spaceAfter=2)
S_COVER_T   = ps("coverT", fontName="Helvetica-Bold", fontSize=34, leading=38,
                 textColor=BONE, alignment=TA_LEFT)
S_COVER_SUB = ps("coverSub", fontName="Helvetica", fontSize=12, leading=16,
                 textColor=GOLD, alignment=TA_LEFT)
S_COVER_BODY = ps("coverBody", fontName="Helvetica", fontSize=11, leading=15,
                 textColor=BONE)
S_COVER_BODY_DK = ps("coverBodyDk", fontName="Helvetica", fontSize=11, leading=15,
                 textColor=DARK)
S_TBL_HEAD  = ps("tblHead", fontName="Helvetica-Bold", fontSize=10, leading=12,
                 textColor=BONE)
S_TBL       = ps("tbl", fontSize=10, leading=13, textColor=DARK)
S_TBL_RIGHT = ps("tblR", fontSize=10, leading=13, textColor=DARK, alignment=TA_RIGHT)
S_TBL_BOLD  = ps("tblB", fontName="Helvetica-Bold", fontSize=10.5, leading=13,
                 textColor=DARK)
S_TBL_BOLD_R = ps("tblBR", fontName="Helvetica-Bold", fontSize=10.5, leading=13,
                 textColor=DARK, alignment=TA_RIGHT)
S_TOTAL     = ps("total", fontName="Helvetica-Bold", fontSize=12, leading=15,
                 textColor=BONE)
S_TOTAL_R   = ps("totalR", fontName="Helvetica-Bold", fontSize=12, leading=15,
                 textColor=BONE, alignment=TA_RIGHT)
S_SIG       = ps("sig", fontName="Times-Italic", fontSize=14, leading=18,
                 textColor=DARK)
S_SIG_LBL   = ps("sigLbl", fontName="Helvetica-Bold", fontSize=8.5, leading=11,
                 textColor=MID)
S_CALLOUT_LG = ps("calloutLg", fontName="Helvetica-Bold", fontSize=28, leading=32,
                 textColor=BONE, alignment=TA_CENTER)
S_CALLOUT_SM = ps("calloutSm", fontName="Helvetica", fontSize=10, leading=13,
                 textColor=GOLD, alignment=TA_CENTER)
S_STAT_NUM  = ps("statN", fontName="Helvetica-Bold", fontSize=22, leading=26,
                 textColor=BURGUNDY, alignment=TA_CENTER)
S_STAT_LBL  = ps("statL", fontName="Helvetica-Bold", fontSize=8.5, leading=11,
                 textColor=GOLD, alignment=TA_CENTER)
S_TERMS_H   = ps("termsH", fontName="Helvetica-Bold", fontSize=11, leading=14,
                 textColor=BURGUNDY, spaceBefore=8, spaceAfter=2)
S_TERMS     = ps("terms", fontSize=9.5, leading=12.8, textColor=DARK,
                 alignment=TA_JUSTIFY, spaceAfter=4)
S_TERMS_SM  = ps("termsSm", fontSize=9, leading=12, textColor=DARK,
                 alignment=TA_JUSTIFY, spaceAfter=3)


# ────────── HEADER / FOOTER ──────────
def draw_header_footer(canv, doc, show=True):
    canv.saveState()
    if show:
        # Header band
        canv.setFillColor(BURGUNDY)
        canv.rect(0, PAGE_H - HEADER_H, PAGE_W, HEADER_H, stroke=0, fill=1)
        # Gold hairline under header
        canv.setStrokeColor(GOLD)
        canv.setLineWidth(0.8)
        canv.line(0, PAGE_H - HEADER_H, PAGE_W, PAGE_H - HEADER_H)

        canv.setFont("Helvetica-Bold", 9.5)
        canv.setFillColor(BONE)
        canv.drawString(MARGIN_L, PAGE_H - HEADER_H + 20, "GOLDEN MAPLE LANDSCAPING")
        canv.setFillColor(GOLD)
        canv.setFont("Helvetica-Bold", 9.5)
        canv.drawRightString(PAGE_W - MARGIN_R, PAGE_H - HEADER_H + 20,
                             "PROJECT PROPOSAL — R. ADAMSON")

        # Footer band
        canv.setFillColor(BURGUNDY)
        canv.rect(0, 0, PAGE_W, FOOTER_H, stroke=0, fill=1)
        canv.setStrokeColor(GOLD)
        canv.setLineWidth(0.8)
        canv.line(0, FOOTER_H, PAGE_W, FOOTER_H)

        canv.setFillColor(BONE)
        canv.setFont("Helvetica", 8.5)
        canv.drawString(MARGIN_L, FOOTER_H - 20,
            "Golden Maple Landscaping Inc.   ·   (705) 500-3581   ·   info@goldenmaplelandscaping.ca   ·   goldenmaplelandscaping.ca")
        canv.setFillColor(GOLD)
        canv.setFont("Helvetica-Bold", 9)
        canv.drawRightString(PAGE_W - MARGIN_R, FOOTER_H - 20, f"PAGE {doc.page}")
    canv.restoreState()


def on_content_page(canv, doc):
    draw_header_footer(canv, doc, show=True)


def on_cover_page(canv, doc):
    # Cover gets no header band — fully bled custom layout
    pass


# ────────── DOC TEMPLATE ──────────
class GMDocTemplate(BaseDocTemplate):
    def __init__(self, filename, **kw):
        super().__init__(filename, pagesize=LETTER,
                         leftMargin=MARGIN_L, rightMargin=MARGIN_R,
                         topMargin=MARGIN_T, bottomMargin=MARGIN_B,
                         title="Adamson Project Proposal — Revised",
                         author="Golden Maple Landscaping Inc.",
                         subject="Project Proposal",
                         **kw)
        cover_frame = Frame(0, 0, PAGE_W, PAGE_H, leftPadding=0,
                            rightPadding=0, topPadding=0, bottomPadding=0,
                            id="cover")
        content_frame = Frame(MARGIN_L, MARGIN_B, CONTENT_W,
                              PAGE_H - MARGIN_T - MARGIN_B,
                              leftPadding=0, rightPadding=0,
                              topPadding=0, bottomPadding=0,
                              id="content")
        self.addPageTemplates([
            PageTemplate(id="Cover", frames=[cover_frame], onPage=on_cover_page),
            PageTemplate(id="Content", frames=[content_frame], onPage=on_content_page),
        ])


# ────────── CUSTOM FLOWABLES ──────────
class HRule(Flowable):
    def __init__(self, width=None, color=GOLD, thickness=1.2, space_before=0, space_after=0):
        super().__init__()
        self.width = width
        self.color = color
        self.thickness = thickness
        self.space_before = space_before
        self.space_after = space_after

    def wrap(self, aw, ah):
        self._w = self.width or aw
        return (self._w, self.thickness + self.space_before + self.space_after)

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.thickness)
        y = self.space_after
        self.canv.line(0, y, self._w, y)


class CoverFlow(Flowable):
    """Renders the entire cover page as a single flowable."""
    def __init__(self):
        super().__init__()
        self.width = PAGE_W
        self.height = PAGE_H

    def wrap(self, aw, ah):
        return (self.width, self.height)

    def draw(self):
        c = self.canv
        # Top burgundy banner
        banner_h = 1.45 * inch
        c.setFillColor(BURGUNDY)
        c.rect(0, PAGE_H - banner_h, PAGE_W, banner_h, stroke=0, fill=1)
        # Gold rule under
        c.setStrokeColor(GOLD)
        c.setLineWidth(2)
        c.line(0, PAGE_H - banner_h, PAGE_W, PAGE_H - banner_h)

        # Eyebrow in banner
        c.setFillColor(GOLD)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(MARGIN_L, PAGE_H - 0.5 * inch, "GOLDEN MAPLE LANDSCAPING INC.")
        # Right-side meta
        c.setFillColor(GOLD)
        c.setFont("Helvetica-Bold", 9)
        c.drawRightString(PAGE_W - MARGIN_R, PAGE_H - 0.5 * inch,
                          "REVISED  —  SUPERSEDES PRIOR")
        # Big title
        c.setFillColor(BONE)
        c.setFont("Helvetica-Bold", 34)
        c.drawString(MARGIN_L, PAGE_H - 1.05 * inch, "PROJECT PROPOSAL")

        # Hero image — central band
        hero_top = PAGE_H - banner_h - 0.18 * inch
        hero_h = 5.0 * inch
        try:
            img = Image(HERO, width=PAGE_W, height=hero_h)
            img.drawOn(c, 0, hero_top - hero_h)
        except Exception:
            c.setFillColor(BURGUNDY_DEEP)
            c.rect(0, hero_top - hero_h, PAGE_W, hero_h, stroke=0, fill=1)

        # Gold rule beneath hero
        c.setStrokeColor(GOLD)
        c.setLineWidth(2)
        c.line(0, hero_top - hero_h, PAGE_W, hero_top - hero_h)

        # Bottom area: deep burgundy panel
        bot_h = PAGE_H - banner_h - hero_h - 0.18 * inch
        c.setFillColor(BURGUNDY_DEEP)
        c.rect(0, 0, PAGE_W, bot_h, stroke=0, fill=1)

        # Logo bottom-left (circular)
        logo_size = 1.55 * inch
        logo_x = MARGIN_L
        logo_y = (bot_h - logo_size) / 2
        try:
            c.drawImage(LOGO, logo_x, logo_y, width=logo_size, height=logo_size,
                        mask="auto")
        except Exception:
            c.setFillColor(GOLD)
            c.circle(logo_x + logo_size / 2, logo_y + logo_size / 2,
                     logo_size / 2, stroke=0, fill=1)

        # Vertical gold separator
        sep_x = logo_x + logo_size + 0.35 * inch
        c.setStrokeColor(GOLD)
        c.setLineWidth(0.8)
        c.line(sep_x, logo_y + 0.1 * inch, sep_x,
               logo_y + logo_size - 0.1 * inch)

        # Client block to right of separator
        tx = sep_x + 0.3 * inch
        c.setFillColor(GOLD)
        c.setFont("Helvetica-Bold", 8.5)
        c.drawString(tx, logo_y + logo_size - 0.30 * inch, "PREPARED FOR")
        c.setFillColor(BONE)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(tx, logo_y + logo_size - 0.60 * inch, "Randy Adamson")
        c.setFont("Helvetica", 10.5)
        c.drawString(tx, logo_y + logo_size - 0.85 * inch, "24 Falvo Street")
        c.drawString(tx, logo_y + logo_size - 1.05 * inch, "Wasaga Beach, Ontario")

        # Right side: date/quote info
        rx = PAGE_W - MARGIN_R
        c.setFillColor(GOLD)
        c.setFont("Helvetica-Bold", 8.5)
        c.drawRightString(rx, logo_y + logo_size - 0.30 * inch, "PROPOSAL DATE")
        c.setFillColor(BONE)
        c.setFont("Helvetica-Bold", 12)
        c.drawRightString(rx, logo_y + logo_size - 0.55 * inch, "May 9, 2026")
        c.setFillColor(GOLD)
        c.setFont("Helvetica-Bold", 8.5)
        c.drawRightString(rx, logo_y + logo_size - 0.85 * inch, "VALID FOR")
        c.setFillColor(BONE)
        c.setFont("Helvetica", 11)
        c.drawRightString(rx, logo_y + logo_size - 1.05 * inch, "30 Days")


class StatPanel(Flowable):
    """Three-stat timeline panel: Spring 2026 / 4 Days / 5-Year Warranty."""
    def __init__(self, stats, width=None, height=72):
        super().__init__()
        self.stats = stats
        self.width = width
        self.height = height

    def wrap(self, aw, ah):
        self._w = self.width or aw
        return (self._w, self.height)

    def draw(self):
        c = self.canv
        cell_w = self._w / len(self.stats)
        # Outer bone background
        c.setFillColor(BONE)
        c.rect(0, 0, self._w, self.height, stroke=0, fill=1)
        # Gold top + bottom rules
        c.setStrokeColor(GOLD)
        c.setLineWidth(1.5)
        c.line(0, self.height, self._w, self.height)
        c.line(0, 0, self._w, 0)

        for i, (label, value) in enumerate(self.stats):
            x = i * cell_w
            if i > 0:
                c.setStrokeColor(GOLD)
                c.setLineWidth(0.6)
                c.line(x, 12, x, self.height - 12)
            c.setFillColor(GOLD)
            c.setFont("Helvetica-Bold", 8.5)
            c.drawCentredString(x + cell_w / 2, self.height - 18, label.upper())
            c.setFillColor(BURGUNDY)
            c.setFont("Helvetica-Bold", 19)
            c.drawCentredString(x + cell_w / 2, 18, value)


class FeeCallout(Flowable):
    """Big burgundy callout box for the total fee on the sign-off page."""
    def __init__(self, label, amount, sublabel, width=None, height=110):
        super().__init__()
        self.label = label
        self.amount = amount
        self.sublabel = sublabel
        self.width = width
        self.height = height

    def wrap(self, aw, ah):
        self._w = self.width or aw
        return (self._w, self.height)

    def draw(self):
        c = self.canv
        c.setFillColor(BURGUNDY)
        c.rect(0, 0, self._w, self.height, stroke=0, fill=1)
        # Gold inner border
        c.setStrokeColor(GOLD)
        c.setLineWidth(1.2)
        c.rect(8, 8, self._w - 16, self.height - 16, stroke=1, fill=0)

        c.setFillColor(GOLD)
        c.setFont("Helvetica-Bold", 9.5)
        c.drawCentredString(self._w / 2, self.height - 26, self.label.upper())
        c.setFillColor(BONE)
        c.setFont("Helvetica-Bold", 36)
        c.drawCentredString(self._w / 2, self.height - 70, self.amount)
        c.setFillColor(GOLD)
        c.setFont("Helvetica", 9.5)
        c.drawCentredString(self._w / 2, 18, self.sublabel)


class CredentialsBar(Flowable):
    """Bone bar listing trust credentials with gold separator dots."""
    def __init__(self, items, width=None, height=44):
        super().__init__()
        self.items = items
        self.width = width
        self.height = height

    def wrap(self, aw, ah):
        self._w = self.width or aw
        return (self._w, self.height)

    def draw(self):
        c = self.canv
        c.setFillColor(BONE)
        c.rect(0, 0, self._w, self.height, stroke=0, fill=1)
        c.setStrokeColor(GOLD)
        c.setLineWidth(0.8)
        c.line(0, self.height, self._w, self.height)
        c.line(0, 0, self._w, 0)

        n = len(self.items)
        cell_w = self._w / n
        for i, item in enumerate(self.items):
            x = i * cell_w + cell_w / 2
            c.setFillColor(BURGUNDY)
            c.setFont("Helvetica-Bold", 9)
            c.drawCentredString(x, self.height / 2 - 4, item)
            if i > 0:
                # Gold dot separator
                c.setFillColor(GOLD)
                c.circle(i * cell_w, self.height / 2, 2.2, stroke=0, fill=1)


# ────────── HELPERS ──────────
def section_heading(eyebrow, title, gap_after=10):
    return [
        Paragraph(eyebrow.upper(), S_EYEBROW),
        Spacer(1, 2),
        Paragraph(title, S_H1),
        HRule(width=CONTENT_W * 0.18, color=GOLD, thickness=2, space_after=6),
        Spacer(1, gap_after),
    ]


def burgundy_panel_table(rows, col_widths, header_rows=1, total_row=False,
                         alt_rows=True):
    """Helper: build a table with burgundy header band + cream alternating rows."""
    style = [
        ("BACKGROUND", (0, 0), (-1, header_rows - 1), BURGUNDY),
        ("TEXTCOLOR",  (0, 0), (-1, header_rows - 1), BONE),
        ("FONTNAME",   (0, 0), (-1, header_rows - 1), "Helvetica-Bold"),
        ("FONTSIZE",   (0, 0), (-1, header_rows - 1), 10),
        ("VALIGN",     (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LINEABOVE", (0, header_rows), (-1, header_rows), 1.2, GOLD),
        ("BOX", (0, 0), (-1, -1), 0.6, BURGUNDY_DEEP),
        ("LINEBELOW", (0, 0), (-1, -1), 0.4, HexColor("#E5DFD2")),
    ]
    if alt_rows:
        for r in range(header_rows, len(rows) - (1 if total_row else 0)):
            if (r - header_rows) % 2 == 1:
                style.append(("BACKGROUND", (0, r), (-1, r), CREAM_ROW))
    if total_row:
        style += [
            ("BACKGROUND", (0, -1), (-1, -1), BURGUNDY),
            ("TEXTCOLOR", (0, -1), (-1, -1), BONE),
            ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, -1), (-1, -1), 12),
            ("LINEABOVE", (0, -1), (-1, -1), 1.2, GOLD),
            ("TOPPADDING", (0, -1), (-1, -1), 10),
            ("BOTTOMPADDING", (0, -1), (-1, -1), 10),
        ]
    t = Table(rows, colWidths=col_widths, hAlign="LEFT")
    t.setStyle(TableStyle(style))
    return t


def bone_panel(content_flowables, padding=14, border_color=GOLD):
    """Wrap flowables in a bone-colored panel with gold left rule."""
    inner = Table([[content_flowables]], colWidths=[CONTENT_W - 2])
    inner.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), BONE),
        ("LEFTPADDING", (0, 0), (-1, -1), padding + 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), padding),
        ("TOPPADDING", (0, 0), (-1, -1), padding),
        ("BOTTOMPADDING", (0, 0), (-1, -1), padding),
        ("LINEBEFORE", (0, 0), (0, -1), 3, border_color),
        ("BOX", (0, 0), (-1, -1), 0.4, HexColor("#E5DFD2")),
    ]))
    return inner


def numbered_step_panel(steps):
    """Numbered ordered steps in a bone panel — for 'next steps' / 'after signing'."""
    rows = []
    for i, (title, desc) in enumerate(steps, start=1):
        num_cell = Paragraph(f"<font color='#D4AF63' size='22'><b>{i:02d}</b></font>",
                             ps("num", alignment=TA_CENTER))
        body_cell = [
            Paragraph(f"<b>{title}</b>", S_H3),
            Paragraph(desc, S_BODY),
        ]
        rows.append([num_cell, body_cell])
    t = Table(rows, colWidths=[0.7 * inch, CONTENT_W - 0.7 * inch - 28])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, HexColor("#E5DFD2")),
    ]))
    return bone_panel([t], padding=10)


def numbered_service_blocks(items):
    """Numbered service section — gold number + title + description."""
    blocks = []
    for i, (title, desc) in enumerate(items, start=1):
        num = Paragraph(
            f"<font color='#D4AF63' size='26'><b>{i:02d}</b></font>",
            ps("svcN", alignment=TA_LEFT))
        body = [
            Paragraph(f"<b>{title}</b>", S_H3),
            Paragraph(desc, S_BODY),
        ]
        t = Table([[num, body]], colWidths=[0.7 * inch, CONTENT_W - 0.7 * inch])
        t.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        blocks.append(t)
        blocks.append(Spacer(1, 6))
    return blocks


# ────────── PAGES ──────────
def build_cover():
    return [CoverFlow()]


def build_cover_letter():
    flow = []
    flow += section_heading("A Personal Note", "Welcome to a Refined Vision")
    body = (
        "Randy, thank you for trusting Golden Maple Landscaping with your backyard "
        "transformation. Following our conversations after the original agreement was "
        "signed, this revised proposal incorporates the additional scope you've asked "
        "us to take on — an expanded paver footprint, a pair of natural limestone "
        "steps, and a mini-armour stone riser detail that ties the new grade change "
        "into the patio with the same stonework discipline as the rest of the build."
    )
    flow.append(Paragraph(body, S_LEAD))
    flow.append(Spacer(1, 10))
    body2 = (
        "Every square foot of this project will be installed to the same Interlocking "
        "Concrete Pavement Institute standards we hold ourselves to on every job: a "
        "compacted HPB base, Gator Base composite panels for long-term load support, "
        "polymeric sand joints, and proper edge restraint. As a "
        "<b>CMHA Certified Concrete Paver Installer</b> and an authorized "
        "<b>Techo-Pro Contractor</b>, our crew brings manufacturer-grade training to "
        "the work — and we back it up with a <b>5-year hardscape craftsmanship "
        "warranty</b> on everything we build for you."
    )
    flow.append(Paragraph(body2, S_BODY_J))
    flow.append(Spacer(1, 10))
    body3 = (
        "This document supersedes the previously signed proposal in its entirety. "
        "All original scope is preserved; the revised pricing, materials, and timeline "
        "below reflect the complete, expanded build. Once you've had a chance to "
        "review, a quick signature on page seven moves us into scheduling for a "
        "Spring 2026 start."
    )
    flow.append(Paragraph(body3, S_BODY_J))
    flow.append(Spacer(1, 10))
    body4 = (
        "Please don't hesitate to reach out by phone or email with any questions "
        "ahead of signing — about the materials, the build sequence, the warranty, "
        "or anything else. I want you to feel completely confident in what you're "
        "signing for. We'll be there with you from the first cut to the final sweep."
    )
    flow.append(Paragraph(body4, S_BODY_J))
    flow.append(Spacer(1, 18))

    flow.append(Paragraph("With craftsmanship,", S_BODY))
    flow.append(Spacer(1, 6))
    flow.append(Paragraph("Yorkis Estevez", S_SIG))
    flow.append(HRule(width=2 * inch, color=GOLD, thickness=1.2, space_after=4))
    flow.append(Paragraph("Yorkis Estevez &middot; Owner &amp; Lead Installer", S_SIG_LBL))
    flow.append(Paragraph("Golden Maple Landscaping Inc.", S_SIG_LBL))
    flow.append(Spacer(1, 14))

    # Revisions-at-a-glance highlight
    flow.append(Paragraph("WHAT'S NEW IN THIS REVISION", S_EYEBROW))
    flow.append(Spacer(1, 4))
    revs = [
        "+ 95 sqft paver expansion (1 additional pallet of Windermere 70mm)",
        "+ 2 limestone steps (4× Oakville Antique Rockface Treads, 16\" × 48\" × 2\")",
        "+ Mini-armour stone riser course (1 pallet)",
        "+ $3,000 labour and $100 disposal applied to revised totals",
    ]
    rev_style = ps("rev", fontSize=10, leading=14, textColor=DARK,
                   leftIndent=14, firstLineIndent=-14, spaceAfter=2)
    rev_paras = [
        Paragraph(
            f"<font color='#D4AF63'><b>&#9670;</b></font>&nbsp;&nbsp;{x}",
            rev_style,
        )
        for x in revs
    ]
    flow.append(bone_panel(rev_paras, padding=12))
    flow.append(Spacer(1, 12))

    # Credentials trust bar at bottom of page
    flow.append(CredentialsBar([
        "CMHA Certified Paver Installer",
        "Techo-Pro Contractor",
        "5-Year Hardscape Warranty",
    ], width=CONTENT_W, height=44))
    return flow


def build_scope():
    flow = []
    flow += section_heading("Section One", "Scope of Work")

    flow.append(StatPanel(
        [("Start", "Spring 2026"),
         ("Build Duration", "4 Days"),
         ("Hardscape Warranty", "5 Years")],
        width=CONTENT_W, height=78,
    ))
    flow.append(Spacer(1, 14))

    flow.append(Paragraph("PROJECT OVERVIEW", S_EYEBROW))
    flow.append(Spacer(1, 4))
    flow.append(Paragraph(
        "Lift, relay, and expand the existing backyard patio at 24 Falvo Street using "
        "Windermere 70mm pavers on an upgraded HPB and Gator Base foundation. The "
        "revised scope adds a 95 sqft paver expansion and a two-tread limestone step "
        "system framed by a mini-armour stone riser detail — extending the usable patio "
        "footprint and resolving the grade change into the lawn with permanent natural "
        "stonework.",
        S_BODY_J))
    flow.append(Spacer(1, 12))

    flow.append(Paragraph("SERVICES PROVIDED", S_EYEBROW))
    flow.append(Spacer(1, 6))

    services = [
        (
            "Patio Lift & Foundation Upgrade",
            "Carefully lift and palletize all existing field pavers. Excavate and "
            "regrade the base. Install fresh High-Performance Bedding (HPB) and a "
            "full Gator Base composite panel system for long-term structural "
            "performance and frost resistance."
        ),
        (
            "Patio Relay & Expansion",
            "Relay the existing Windermere Cliffside Grey Textured pavers and lay one "
            "additional pallet of Windermere 70mm pavers to expand the footprint by "
            "approximately 95 sqft. Maintain the original Charcoal Black perimeter "
            "banding around the full new perimeter for a clean, framed finish."
        ),
        (
            "Limestone Steps & Mini-Armour Stone Risers",
            "Build two natural-stone steps using four Oakville Antique Limestone "
            "Rockface Treads (16\" × 48\" × 2\"), set on a compacted base and bonded "
            "to a mini-armour stone riser course. Hand-cut and dry-stacked for a "
            "sculptural, permanent finish."
        ),
        (
            "Joint Stabilization & Site Restoration",
            "Sweep and activate polymeric sand in all paver joints, install concealed "
            "edge restraint at all open edges, and complete final site cleanup. "
            "Disposal bin on site for the duration; all excavated material removed at "
            "completion."
        ),
    ]
    flow += numbered_service_blocks(services)
    return flow


def build_estimate():
    flow = []
    flow += section_heading("Section Two", "Revised Estimate")

    rows = [
        [Paragraph("Line Item", S_TBL_HEAD),
         Paragraph("Detail", S_TBL_HEAD),
         Paragraph("Amount", ps("h", fontName="Helvetica-Bold", fontSize=10,
                                 textColor=BONE, alignment=TA_RIGHT))],
        [Paragraph("Materials", S_TBL_BOLD),
         Paragraph("Windermere 70mm pavers (existing + 1 added pallet for 95 sqft "
                   "expansion), Charcoal Black banding, polymeric sand, edge "
                   "restraint, HPB, Gator Base, mini-armour stone pallet, "
                   "4× Oakville Antique Limestone Rockface Treads", S_TBL),
         Paragraph("$7,327.24", S_TBL_BOLD_R)],
        [Paragraph("Disposal", S_TBL_BOLD),
         Paragraph("Bin rental, haul-away of excavated material and debris "
                   "(includes +$100 for revised scope)", S_TBL),
         Paragraph("$550.00", S_TBL_BOLD_R)],
        [Paragraph("Labour", S_TBL_BOLD),
         Paragraph("Lift & relay, foundation rebuild, 95 sqft expansion install, "
                   "step build, finishing (includes +$3,000 for revised scope)", S_TBL),
         Paragraph("$8,400.00", S_TBL_BOLD_R)],
        [Paragraph("Subtotal", S_TBL_BOLD),
         Paragraph("Materials + Disposal + Labour", S_TBL),
         Paragraph("$16,277.24", S_TBL_BOLD_R)],
        [Paragraph("HST", S_TBL_BOLD),
         Paragraph("13% Harmonized Sales Tax", S_TBL),
         Paragraph("$2,116.04", S_TBL_BOLD_R)],
        [Paragraph("PROJECT TOTAL", S_TOTAL),
         Paragraph("All-in, contract price", ps("tot",
            fontSize=10, textColor=GOLD, fontName="Helvetica")),
         Paragraph("$18,393.28", S_TOTAL_R)],
    ]
    flow.append(burgundy_panel_table(
        rows, col_widths=[1.25 * inch, CONTENT_W - 1.25 * inch - 1.35 * inch, 1.35 * inch],
        header_rows=1, total_row=True))

    flow.append(Spacer(1, 14))
    flow.append(Paragraph("WHAT'S INCLUDED", S_EYEBROW))
    flow.append(Spacer(1, 4))

    incl_items = [
        "Lift, palletize, and protect all existing field pavers",
        "Excavation, regrade, and base prep to ICPI standard",
        "HPB bedding + Gator Base composite panel foundation",
        "Relay of existing Windermere Cliffside Grey Textured field",
        "1 additional pallet of Windermere 70mm pavers (95 sqft expansion)",
        "Continuous Charcoal Black perimeter banding around full footprint",
        "1 pallet mini-armour stone for step risers",
        "4× Oakville Antique Limestone Rockface Treads (16\" × 48\" × 2\"), 2 built steps",
        "Polymeric sand joint sweep + activation",
        "Concealed edge restraint at all open edges",
        "Disposal bin on site, haul-away of all material",
        "Final cleanup and site restoration",
        "5-year Golden Maple hardscape craftsmanship warranty",
    ]
    bullet_style = ps("bul", fontSize=9.5, leading=13.5, textColor=DARK,
                      leftIndent=14, firstLineIndent=-14, spaceAfter=2)
    incl_paras = [
        Paragraph(
            f"<font color='#D4AF63' face='Helvetica-Bold'>&#9670;</font>&nbsp;&nbsp;{x}",
            bullet_style,
        )
        for x in incl_items
    ]
    flow.append(bone_panel(incl_paras, padding=12))
    return flow


def build_lighting():
    flow = []
    flow += section_heading("Optional Upgrade", "In-Lite Landscape Lighting")

    intro = (
        "An optional add-on package — separate from the contract above and priced "
        "independently. Add the following to your project at any time before scheduling "
        "to elevate the patio into evening use."
    )
    flow.append(Paragraph(intro, S_LEAD))
    flow.append(Spacer(1, 12))

    # Why In-Lite callout
    why = (
        "<b>Why In-Lite.</b>&nbsp; Premium low-voltage landscape lighting hand-built "
        "in the Netherlands. Marine-grade <b>brass and 316 stainless steel</b> "
        "construction, sealed for permanent outdoor use, and backed by a "
        "<b>5-year manufacturer warranty</b>. The same system specified on luxury "
        "residential and architectural projects across Europe and North America. "
        "Materials below are passed through to you <b>at our cost</b> — no markup."
    )
    flow.append(bone_panel([Paragraph(why, S_BODY_J)], padding=12))
    flow.append(Spacer(1, 14))

    flow.append(Paragraph("PACKAGE SCOPE", S_EYEBROW))
    flow.append(Spacer(1, 4))
    scope_items = [
        "4× In-Lite EVO HYDE 180 Dark facade lights",
        "1× In-Lite HUB-100 transformer (100W capacity)",
        "Low-voltage main cable + watertight connectors",
        "Professional installation, fixture aiming, and commissioning",
    ]
    bullet_style = ps("bulL", fontSize=10, leading=14, textColor=DARK,
                      leftIndent=14, firstLineIndent=-14, spaceAfter=3)
    for x in scope_items:
        flow.append(Paragraph(
            f"<font color='#D4AF63' face='Helvetica-Bold'>&#9670;</font>&nbsp;&nbsp;{x}",
            bullet_style,
        ))
    flow.append(Spacer(1, 12))

    rows = [
        [Paragraph("Line Item", S_TBL_HEAD),
         Paragraph("Detail", S_TBL_HEAD),
         Paragraph("Amount", ps("h2r", fontName="Helvetica-Bold", fontSize=10,
                                 textColor=BONE, alignment=TA_RIGHT))],
        [Paragraph("Materials (at cost)", S_TBL_BOLD),
         Paragraph("In-Lite EVO HYDE 180 Dark fixtures, HUB-100 transformer, "
                   "cable and connectors — passed through at supplier cost",
                   S_TBL),
         Paragraph("$724.65", S_TBL_BOLD_R)],
        [Paragraph("Labour", S_TBL_BOLD),
         Paragraph("Layout, trenching, fixture install, transformer mounting, "
                   "commissioning", S_TBL),
         Paragraph("$400.00", S_TBL_BOLD_R)],
        [Paragraph("Subtotal", S_TBL_BOLD),
         Paragraph("Materials + Labour", S_TBL),
         Paragraph("$1,124.65", S_TBL_BOLD_R)],
        [Paragraph("HST", S_TBL_BOLD),
         Paragraph("13% Harmonized Sales Tax", S_TBL),
         Paragraph("$146.20", S_TBL_BOLD_R)],
        [Paragraph("LIGHTING PACKAGE TOTAL", S_TOTAL),
         Paragraph("Optional — add to contract any time before scheduling",
                   ps("tot2", fontSize=10, textColor=GOLD,
                       fontName="Helvetica")),
         Paragraph("$1,270.85", S_TOTAL_R)],
    ]
    flow.append(burgundy_panel_table(
        rows, col_widths=[1.6 * inch, CONTENT_W - 1.6 * inch - 1.25 * inch, 1.25 * inch],
        header_rows=1, total_row=True))
    flow.append(Spacer(1, 14))

    closing = (
        "<b>How to add this package.</b>&nbsp; To include the In-Lite lighting "
        "package in your build, indicate so by reply email when returning the "
        "signed proposal, or simply let Yorkis know at the pre-build walkthrough. "
        "We'll add a single-line addendum to the contract — no need to re-sign "
        "the main document. Lighting work is performed during the same build "
        "window as the hardscape, with no additional schedule impact."
    )
    flow.append(bone_panel([Paragraph(closing, S_BODY_J)], padding=12))
    return flow


def build_payment():
    flow = []
    flow += section_heading("Section Three", "Payment Schedule")

    rows = [
        [Paragraph("Stage", S_TBL_HEAD),
         Paragraph("Trigger", S_TBL_HEAD),
         Paragraph("Amount", ps("h3r", fontName="Helvetica-Bold", fontSize=10,
                                 textColor=BONE, alignment=TA_RIGHT))],
        [Paragraph("01 · Booking Deposit", S_TBL_BOLD),
         Paragraph("Due upon signing — secures your spot on the schedule", S_TBL),
         Paragraph("$500.00", S_TBL_BOLD_R)],
        [Paragraph("02 · Second Deposit", S_TBL_BOLD),
         Paragraph("Due 1–2 days prior to project start", S_TBL),
         Paragraph("$8,946.64", S_TBL_BOLD_R)],
        [Paragraph("03 · Final Balance", S_TBL_BOLD),
         Paragraph("Due upon project completion and walkthrough", S_TBL),
         Paragraph("$8,946.64", S_TBL_BOLD_R)],
        [Paragraph("CONTRACT TOTAL", S_TOTAL),
         Paragraph("HST included", ps("totp", fontSize=10, textColor=GOLD,
                                       fontName="Helvetica")),
         Paragraph("$18,393.28", S_TOTAL_R)],
    ]
    flow.append(burgundy_panel_table(
        rows, col_widths=[1.85 * inch, CONTENT_W - 1.85 * inch - 1.25 * inch, 1.25 * inch],
        header_rows=1, total_row=True))

    flow.append(Spacer(1, 14))
    flow.append(Paragraph("PAYMENT OPTIONS", S_EYEBROW))
    flow.append(Spacer(1, 4))
    bullet_style = ps("bulP", fontSize=10, leading=14, textColor=DARK,
                      leftIndent=14, firstLineIndent=-14, spaceAfter=3)
    pay_lines = [
        ("E-transfer", "auto-deposit to "
         "<font color='#6B1E2E'><b>goldenmaplelandscaping@gmail.com</b></font> "
         "(preferred)."),
        ("Cheque", "payable to <b>Golden Maple Landscaping Inc.</b>"),
        ("Cash", "accepted with receipt issued."),
        ("Credit Card", "accepted with 3% surcharge; advance notice required."),
    ]
    pay_paras = [
        Paragraph(
            f"<font color='#D4AF63'><b>&#9670;</b></font>&nbsp;&nbsp;"
            f"<b>{label}</b> — {body}",
            bullet_style,
        )
        for label, body in pay_lines
    ]
    flow.append(bone_panel(pay_paras, padding=12))

    flow.append(Spacer(1, 14))
    flow.append(Paragraph("WHAT TO EXPECT AFTER SIGNING", S_EYEBROW))
    flow.append(Spacer(1, 6))

    after = [
        ("Confirmation & Booking",
         "We confirm receipt of your signed proposal and booking deposit, then "
         "lock your project into the Spring 2026 schedule."),
        ("Pre-Build Walkthrough",
         "Yorkis walks the site with you to confirm layout, finished elevations, "
         "step placement, and access for the disposal bin."),
        ("Build Window",
         "Materials are staged the day prior. The 4-day build runs continuously, "
         "weather permitting, with the same crew start to finish."),
        ("Final Walkthrough & Handover",
         "We walk the finished work together, activate the polymeric sand joints, "
         "register your 5-year warranty, and collect the final balance."),
    ]
    flow.append(numbered_step_panel(after))
    return flow


def build_signoff():
    flow = []
    flow += section_heading("Section Four", "Proposal Sign-Off", gap_after=4)

    flow.append(FeeCallout(
        label="Total Contract Fee — HST Included",
        amount="$18,393.28",
        sublabel="Optional In-Lite Lighting Package available separately at $1,270.85",
        width=CONTENT_W, height=110,
    ))
    flow.append(Spacer(1, 10))

    flow.append(Paragraph("FIVE STEPS TO BREAK GROUND", S_EYEBROW))
    flow.append(Spacer(1, 4))
    steps = [
        ("Review", "Read this proposal in full, including the Terms, Conditions "
                   "& Warranty section that follows."),
        ("Sign", "Sign and date below — this document supersedes the previously "
                 "signed proposal in its entirety."),
        ("Return", "Return a signed copy by reply email to "
                   "info@goldenmaplelandscaping.ca."),
        ("Deposit", "Send the $500 booking deposit by e-transfer to "
                    "goldenmaplelandscaping@gmail.com to lock your slot."),
        ("Schedule", "We confirm your Spring 2026 start window and walk you "
                     "through day one."),
    ]
    flow.append(_compact_step_panel(steps))
    flow.append(Spacer(1, 10))

    # Signature block — two columns
    sig_left = [
        Paragraph("FOR GOLDEN MAPLE LANDSCAPING INC.", S_EYEBROW),
        Spacer(1, 12),
        Paragraph("Yorkis Estevez", S_SIG),
        HRule(width=2.6 * inch, color=DARK, thickness=0.8, space_after=4),
        Paragraph("Yorkis Estevez &middot; Owner", S_SIG_LBL),
        Spacer(1, 10),
        Paragraph("DATE", S_SIG_LBL),
        Spacer(1, 12),
        HRule(width=2.6 * inch, color=DARK, thickness=0.8, space_after=2),
    ]
    sig_right = [
        Paragraph("ACCEPTED &amp; AGREED BY CLIENT", S_EYEBROW),
        Spacer(1, 12),
        Spacer(1, 18),
        HRule(width=2.6 * inch, color=DARK, thickness=0.8, space_after=4),
        Paragraph("Randy Adamson", S_SIG_LBL),
        Spacer(1, 10),
        Paragraph("DATE", S_SIG_LBL),
        Spacer(1, 12),
        HRule(width=2.6 * inch, color=DARK, thickness=0.8, space_after=2),
    ]
    sig_t = Table([[sig_left, sig_right]],
                  colWidths=[CONTENT_W / 2 - 8, CONTENT_W / 2 - 8])
    sig_t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
    ]))
    flow.append(sig_t)
    flow.append(Spacer(1, 12))

    flow.append(CredentialsBar([
        "CMHA Certified Paver Installer",
        "Techo-Pro Contractor",
        "5-Year Hardscape Warranty",
        "HST #712237155RC0001",
    ], width=CONTENT_W, height=40))
    return flow


def _compact_step_panel(steps):
    """Tighter version of numbered_step_panel for sign-off page."""
    rows = []
    for i, (title, desc) in enumerate(steps, start=1):
        num_cell = Paragraph(f"<font color='#D4AF63' size='18'><b>{i:02d}</b></font>",
                             ps("numC", alignment=TA_CENTER))
        body_cell = [
            Paragraph(f"<b>{title}</b>", ps("titleC", fontName="Helvetica-Bold",
                                              fontSize=10.5, leading=13,
                                              textColor=BURGUNDY)),
            Paragraph(desc, ps("descC", fontSize=9.5, leading=12.5,
                                textColor=DARK)),
        ]
        rows.append([num_cell, body_cell])
    t = Table(rows, colWidths=[0.55 * inch, CONTENT_W - 0.55 * inch - 28])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, HexColor("#E5DFD2")),
    ]))
    return bone_panel([t], padding=8)


def build_terms():
    flow = []
    flow += section_heading("Section Five", "Terms, Conditions & Warranty")

    def H(t):
        flow.append(Paragraph(t, S_TERMS_H))

    def P(t):
        flow.append(Paragraph(t, S_TERMS))

    def Psm(t):
        flow.append(Paragraph(t, S_TERMS_SM))

    H("1. Background")
    P("This Agreement (the \"Agreement\") is made between Golden Maple Landscaping "
      "Inc. (the \"Contractor\") and Randy Adamson (the \"Customer\") in respect of "
      "the property at 24 Falvo Street, Wasaga Beach, Ontario (the \"Worksite\"). "
      "This Agreement supersedes in its entirety any prior proposal or agreement "
      "between the parties for the Worksite.")

    H("2. Services Provided")
    P("The Contractor agrees to provide all labour, materials, equipment and "
      "supervision required to perform the Services as described in the Scope of "
      "Work and Revised Estimate sections of this proposal. Any work not expressly "
      "included in those sections is excluded unless added by written change order "
      "signed by both parties.")

    H("3. Term of Agreement")
    P("This Agreement commences on the date of the Customer's signature and "
      "continues until the Services have been completed and the final payment has "
      "been received in full. Scheduling of the build window is targeted for "
      "Spring 2026, subject to weather, ground conditions, and material lead times.")

    H("4. Additional Terms and Conditions")
    Psm("<b>4.1 Worksite Photography.</b> The Customer grants the Contractor a "
        "non-exclusive, royalty-free licence to photograph the Worksite before, "
        "during and after the Services for use in the Contractor's portfolio, "
        "website and marketing materials. The Customer's name and street address "
        "will not be published without separate written consent.")
    Psm("<b>4.2 Surplus Materials.</b> Any surplus materials remaining on completion "
        "of the Services (including but not limited to pavers, banding, mini-armour "
        "stone, polymeric sand and base aggregates) are the property of the "
        "Contractor and may be removed from the Worksite at the Contractor's "
        "discretion.")

    H("5. Deposits, Payments and Interest on Late Payments")
    P("Payments are due in accordance with the Payment Schedule set out in this "
      "proposal. The booking deposit secures the Customer's position on the "
      "Contractor's schedule and is non-refundable once material orders have been "
      "placed. Any payment not received by its due date will accrue interest at the "
      "rate of <b>five percent (5%) per month, compounding monthly</b>, from the "
      "due date until paid in full. The Contractor reserves the right to suspend "
      "or delay the Services for non-payment.")

    H("6. Customer Obligations")
    P("The Customer shall: (a) provide safe and unobstructed access to the "
      "Worksite during scheduled work hours; (b) ensure the Worksite is clear of "
      "vehicles, personal property, pets and obstructions before the build window "
      "begins; (c) provide reasonable access to water and exterior electrical "
      "outlets; (d) identify and locate any private utilities, irrigation lines, "
      "low-voltage cables, septic components or underground structures not covered "
      "by Ontario One Call; and (e) be available, in person or by phone, for the "
      "pre-build and final walkthroughs.")

    H("7. Concealed or Unknown Conditions")
    P("If the Contractor encounters concealed or unknown subsurface conditions "
      "(including but not limited to buried debris, contaminated fill, unstable "
      "soils, unmarked utilities, abandoned footings, or existing drainage issues) "
      "that materially differ from those reasonably anticipated, the Contractor "
      "shall promptly notify the Customer. The parties shall agree in writing on "
      "an adjustment to the price and/or schedule before the affected work proceeds.")

    H("8. Capacity / Independent Contractor")
    P("The Contractor is engaged as an independent contractor and not as an "
      "employee, partner, agent or joint venturer of the Customer. The Contractor "
      "is responsible for its own taxes, WSIB coverage, and liability insurance. "
      "Nothing in this Agreement creates any relationship of employment between "
      "the parties.")

    H("9. Right of Substitution")
    P("Where a specified material is unavailable, discontinued, or subject to "
      "unreasonable lead times, the Contractor may substitute a material of equal "
      "or greater quality, colour and durability with prior notice to the Customer. "
      "Where reasonably practical, sample images or product cuts will be provided "
      "before the substitution is installed.")

    H("10. Indemnification")
    P("Each party shall indemnify and hold harmless the other from any claims, "
      "losses, damages, costs and expenses arising out of the indemnifying party's "
      "negligent acts, omissions or breach of this Agreement, except to the extent "
      "caused by the negligence or wilful misconduct of the indemnified party.")

    H("11. Governing Law")
    P("This Agreement shall be governed by and construed in accordance with the "
      "laws of the Province of <b>Ontario</b> and the federal laws of Canada "
      "applicable therein. The parties attorn to the exclusive jurisdiction of "
      "the courts of Ontario.")

    H("12. Warranty — Hardscape Craftsmanship (5 Years)")
    P("The Contractor warrants the craftsmanship of all hardscape work — "
      "including paver installation, base preparation, edge restraint, polymeric "
      "sand jointing, and natural stone step construction — for a period of "
      "<b>five (5) years</b> from the date of substantial completion. This "
      "warranty covers settlement, lifting, lateral movement and joint failure "
      "directly attributable to defective installation by the Contractor.")

    H("13. Warranty — Carpentry Craftsmanship (1 Year)")
    P("Where the Services include carpentry work (decking, fencing, pergolas or "
      "similar), the Contractor warrants the craftsmanship of that work for a "
      "period of <b>one (1) year</b> from the date of substantial completion, "
      "covering defects in fastening, framing and finish carpentry attributable "
      "to the Contractor.")

    H("14. Warranty — Landscape Lighting Craftsmanship (5 Years)")
    P("Where the Services include the installation of low-voltage landscape "
      "lighting, the Contractor warrants the craftsmanship of that installation "
      "for a period of <b>five (5) years</b> from the date of substantial "
      "completion. Manufacturer warranties on the lighting products themselves "
      "(including In-Lite fixtures and transformers) are passed through to the "
      "Customer in addition to this craftsmanship warranty.")

    H("15. Warranty — Electrical, Plumbing & Sub-Contractors (3 Years)")
    P("Work performed by licensed electrical, plumbing or other trade "
      "sub-contractors engaged by the Contractor is warranted as to workmanship "
      "for a period of <b>three (3) years</b> from the date of substantial "
      "completion, in addition to any warranties offered directly by the "
      "sub-contractor or manufacturer.")

    H("16. Warranty — Artificial Turf Craftsmanship (5 Years)")
    P("Where the Services include the installation of artificial turf, the "
      "Contractor warrants the craftsmanship of the base preparation, seaming "
      "and edge fastening for a period of <b>five (5) years</b> from the date "
      "of substantial completion. Manufacturer warranties on the turf product "
      "itself are passed through to the Customer.")

    H("17. Warranty Notes")
    notes = [
        ("Live Materials.", "Plant material, sod, seed and other live "
         "installations are warranted only against installation defects for "
         "30 days; long-term survival depends on customer aftercare and "
         "environmental factors and is not warranted."),
        ("Efflorescence.", "A natural whitish bloom that can appear on new "
         "concrete pavers as they cure. Efflorescence is a characteristic of "
         "the product and is not covered under this warranty."),
        ("Colour Variation.", "Natural stone, concrete pavers and "
         "manufactured products will exhibit colour and texture variation "
         "between batches and over time. Such variation is normal and is not "
         "considered a defect."),
        ("Joint Sand Settling.", "Polymeric sand may settle slightly within "
         "joints during the first season as the installation cures. Top-up "
         "during the first year is included as part of normal aftercare on "
         "request."),
        ("Customer Modifications.", "This warranty is voided in respect of "
         "any area of the work that is altered, repaired, modified, sealed "
         "or built upon by the Customer or any third party without the "
         "Contractor's prior written consent."),
        ("Exclusions — Acts of God.", "Damage caused by flood, fire, storm, "
         "frost heave outside of normal conditions, vehicle impact, vandalism, "
         "or other forces beyond the Contractor's reasonable control is "
         "excluded."),
        ("Exclusions — Drainage.", "Pre-existing drainage or grading issues "
         "on the Worksite that are not part of the Scope of Work are "
         "excluded; the Contractor will identify any such concerns prior to "
         "or during construction."),
        ("Exclusions — Tree Roots & Soil Movement.", "Damage caused by root "
         "growth, soil heave, or subsidence resulting from undisclosed "
         "subsurface conditions is excluded from this warranty."),
        ("Exclusions — De-icing Chemicals.", "Damage caused by the use of "
         "salt, calcium chloride or other de-icing chemicals on hardscape "
         "surfaces is excluded."),
        ("Exclusions — Improper Use.", "Damage resulting from use of the "
         "installed work outside of its intended residential pedestrian or "
         "vehicular load class is excluded."),
        ("Transferability.", "This warranty is extended to the original "
         "Customer at the Worksite address shown on this Agreement and is "
         "not transferable to subsequent owners."),
        ("Claim Process.", "Warranty claims must be submitted in writing to "
         "info@goldenmaplelandscaping.ca with a description of the issue and "
         "photographs. The Contractor will inspect the work within a "
         "reasonable period and, where the claim is valid, will repair or "
         "replace the affected portion of the work at its discretion."),
        ("Warranty Period Commencement.", "All warranty periods commence on "
         "the date of substantial completion of the Services, defined as the "
         "date the final walkthrough is completed and the final balance is "
         "invoiced."),
    ]
    for i, (title, body) in enumerate(notes, start=1):
        Psm(f"<b>17.{i}&nbsp;&nbsp;{title}</b>&nbsp; {body}")

    flow.append(Spacer(1, 8))
    H("18. Acknowledgement")
    P("By signing the Proposal Sign-Off page, the Customer acknowledges receipt "
      "of and agreement to all of the Terms, Conditions and Warranty provisions "
      "set out in this section. This Agreement, together with the Scope of Work, "
      "Revised Estimate and Payment Schedule, constitutes the entire agreement "
      "between the parties for the Worksite and supersedes all prior proposals, "
      "agreements and understandings, written or oral, including the previously "
      "signed proposal between the parties for this Worksite.")
    P("No amendment, modification or waiver of any provision of this Agreement "
      "shall be effective unless in writing and signed by both the Customer and "
      "an authorized representative of the Contractor. The failure of either "
      "party to enforce any provision of this Agreement shall not be construed "
      "as a waiver of that provision or of the right to enforce it later.")
    P("The headings used throughout this Agreement are for convenience of "
      "reference only and do not affect the interpretation of the provisions to "
      "which they relate. If any provision of this Agreement is held to be "
      "invalid or unenforceable, the remainder of the Agreement shall continue "
      "in full force and effect.")

    flow.append(Spacer(1, 12))

    # Closing thank-you panel
    closing_html = (
        "<font color='#D4AF63'><b>THANK YOU, RANDY.</b></font><br/><br/>"
        "We're looking forward to building this for you. Every detail in this "
        "document — from the base depth to the joint sand to the limestone tread "
        "selection — has been thought through with the same care we'll bring to "
        "the Worksite. When the dust settles in Spring 2026, you'll have a patio "
        "and step system that does its job for decades."
    )
    closing_para = Paragraph(closing_html, ps(
        "closing", fontSize=10.5, leading=14.5, textColor=DARK,
        alignment=TA_LEFT, spaceAfter=0,
    ))
    flow.append(bone_panel([closing_para], padding=14))
    flow.append(Spacer(1, 10))
    flow.append(CredentialsBar([
        "CMHA Certified Paver Installer",
        "Techo-Pro Contractor",
        "5-Year Hardscape Warranty",
        "HST #712237155RC0001",
    ], width=CONTENT_W, height=40))
    return flow


# ────────── BUILD ──────────
def build():
    doc = GMDocTemplate(str(OUT_PDF))
    story = []
    # Cover
    story += build_cover()
    story.append(NextPageTemplate("Content"))
    story.append(PageBreak())
    # Cover letter
    story += build_cover_letter()
    story.append(PageBreak())
    # Scope
    story += build_scope()
    story.append(PageBreak())
    # Estimate
    story += build_estimate()
    story.append(PageBreak())
    # Lighting
    story += build_lighting()
    story.append(PageBreak())
    # Payment
    story += build_payment()
    story.append(PageBreak())
    # Sign-off
    story += build_signoff()
    story.append(PageBreak())
    # Terms (let it flow naturally — no PageBreaks between sections)
    story += build_terms()

    doc.build(story)
    print(f"Wrote {OUT_PDF}")


if __name__ == "__main__":
    build()
