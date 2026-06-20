"""
Northbound Dispatch — Business Card (print-ready PDF, branded).

Standard 3.5" x 2" card, front + back, with bleed-free safe layout.
Navy background, orange accent bar, white text. Drop in for Vistaprint.

Usage:
    python3 generate_business_card.py [output_path]
"""

import sys
import os
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.pdfbase.pdfmetrics import stringWidth

import brand
from brand import (NAVY, ORANGE, TEAL, FONT_HEAD, FONT_BODY, FONT_MONO,
                   BRAND_NAME, BRAND_SUB, TAGLINE, CONTACT_EMAIL, CONTACT_PHONE)

CARD_W = 3.5 * inch
CARD_H = 2.0 * inch

# Editable card details
PERSON_NAME = "Yorkis Estevez"
PERSON_TITLE = "Dispatcher / Founder"
WEBSITE = "northbounddispatch.ca"


def _arrow(c, x, y, scale=1.0):
    c.saveState()
    c.setFillColor(ORANGE)
    p = c.beginPath()
    p.moveTo(x, y + 17 * scale)
    p.lineTo(x + 6 * scale, y + 8 * scale)
    p.lineTo(x + 2.6 * scale, y + 8 * scale)
    p.lineTo(x + 2.6 * scale, y + 2 * scale)
    p.lineTo(x - 2.6 * scale, y + 2 * scale)
    p.lineTo(x - 2.6 * scale, y + 8 * scale)
    p.lineTo(x - 6 * scale, y + 8 * scale)
    p.close()
    c.drawPath(p, fill=1, stroke=0)
    c.restoreState()


def front(c):
    # navy background
    c.setFillColor(NAVY)
    c.rect(0, 0, CARD_W, CARD_H, fill=1, stroke=0)
    # orange accent bar (left)
    c.setFillColor(ORANGE)
    c.rect(0, 0, 0.16 * inch, CARD_H, fill=1, stroke=0)

    left = 0.40 * inch
    # wordmark (sized to fit a 3.5" card)
    _arrow(c, left + 5, CARD_H - 0.58 * inch, 0.85)
    c.setFillColor(colors.white)
    c.setFont(FONT_HEAD, 17)
    c.drawString(left + 15, CARD_H - 0.58 * inch, BRAND_NAME)
    w = stringWidth(BRAND_NAME, FONT_HEAD, 17)
    c.setFillColor(ORANGE)
    c.setFont(FONT_HEAD, 9)
    c.drawString(left + 15 + w + 5, CARD_H - 0.58 * inch, BRAND_SUB)
    # tagline
    c.setFillColor(TEAL)
    c.setFont("Helvetica-Oblique", 7)
    c.drawString(left + 15, CARD_H - 0.74 * inch, TAGLINE)

    # name + title
    c.setFillColor(colors.white)
    c.setFont(FONT_HEAD, 13)
    c.drawString(left, 0.82 * inch, PERSON_NAME)
    c.setFillColor(colors.HexColor("#8FA3B8"))
    c.setFont(FONT_BODY, 8.5)
    c.drawString(left, 0.67 * inch, PERSON_TITLE)

    # contact — stacked, each on its own line to avoid collisions
    c.setFillColor(colors.white)
    c.setFont(FONT_MONO, 7.5)
    c.drawString(left, 0.46 * inch, CONTACT_PHONE)
    c.drawString(left, 0.32 * inch, CONTACT_EMAIL)
    c.setFillColor(ORANGE)
    c.setFont(FONT_MONO, 7.5)
    c.drawString(left, 0.18 * inch, WEBSITE)


def back(c):
    c.setFillColor(NAVY)
    c.rect(0, 0, CARD_W, CARD_H, fill=1, stroke=0)
    # centered big arrow + wordmark
    cx = CARD_W / 2
    _arrow(c, cx, CARD_H / 2 + 0.12 * inch, 2.2)
    c.setFillColor(colors.white)
    c.setFont(FONT_HEAD, 20)
    c.drawCentredString(cx, CARD_H / 2 - 0.28 * inch, BRAND_NAME)
    c.setFillColor(ORANGE)
    c.setFont(FONT_HEAD, 10)
    c.drawCentredString(cx, CARD_H / 2 - 0.46 * inch, BRAND_SUB)
    c.setFillColor(colors.HexColor("#8FA3B8"))
    c.setFont(FONT_BODY, 7.5)
    c.drawCentredString(cx, 0.22 * inch, "Independent dispatch for owner-operators · Ontario & cross-border")


def build(output_path):
    c = canvas.Canvas(output_path, pagesize=(CARD_W, CARD_H))
    c.setTitle("Northbound Dispatch — Business Card")
    front(c)
    c.showPage()
    back(c)
    c.showPage()
    c.save()
    print(f"✓ Business Card (front + back) → {output_path}")


if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, "output", "Northbound-Business-Card.pdf")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    build(out)
