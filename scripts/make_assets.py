"""Generate brand-consistent hero panel + circular monogram logo for the proposal PDF.

These are placeholder assets standing in for the original Adamson proposal photography
and logo, which were not present in the working copy when this proposal was generated.
"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from pathlib import Path
import math
import random

ASSETS = Path(__file__).parent / "assets"
ASSETS.mkdir(exist_ok=True)

BURGUNDY = (107, 30, 46)
BURGUNDY_DEEP = (78, 21, 34)
GOLD = (212, 175, 99)
BONE = (242, 238, 231)
CREAM = (250, 246, 237)
DARK = (59, 56, 50)


def hero_panel():
    """A warm, premium hardscape-toned panel — evokes flagstone + golden hour."""
    W, H = 1600, 900
    img = Image.new("RGB", (W, H), (60, 50, 45))
    draw = ImageDraw.Draw(img)

    # Vertical gradient: deep stone -> warm earth -> golden glow at horizon
    for y in range(H):
        t = y / H
        if t < 0.55:
            # sky / stone tone, deep slate to warm taupe
            k = t / 0.55
            r = int(45 + (110 - 45) * k)
            g = int(40 + (88 - 40) * k)
            b = int(48 + (78 - 48) * k)
        elif t < 0.62:
            # golden horizon band
            k = (t - 0.55) / 0.07
            r = int(110 + (190 - 110) * k)
            g = int(88 + (150 - 88) * k)
            b = int(78 + (95 - 78) * k)
        else:
            # foreground: paver-toned, subtle warm grey
            k = (t - 0.62) / 0.38
            r = int(135 - 60 * k)
            g = int(115 - 55 * k)
            b = int(95 - 50 * k)
        draw.line([(0, y), (W, y)], fill=(r, g, b))

    # Soft golden glow centered on the horizon
    glow = Image.new("RGB", (W, H), (0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    cx, cy = W // 2, int(H * 0.58)
    for r in range(420, 0, -8):
        a = int(60 * (r / 420) ** 1.4)
        glow_draw.ellipse(
            [cx - r, cy - int(r * 0.55), cx + r, cy + int(r * 0.55)],
            fill=(255 - a, 220 - a, 150 - a),
        )
    glow = glow.filter(ImageFilter.GaussianBlur(60))
    img = Image.blend(img, glow, 0.35)

    # Foreground paver pattern — running bond suggestion
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    fg_top = int(H * 0.62)
    rng = random.Random(7)
    row_h = 26
    y = fg_top
    offset = 0
    while y < H:
        x = -60 + offset
        while x < W + 60:
            w = rng.randint(70, 130)
            shade = rng.randint(-15, 12)
            base = (
                max(0, min(255, 90 + shade)),
                max(0, min(255, 78 + shade)),
                max(0, min(255, 70 + shade)),
                90,
            )
            od.rectangle([x, y, x + w, y + row_h], fill=base, outline=(40, 32, 28, 70))
            x += w
        y += row_h
        offset = (offset + row_h * 0.7) % 100

    overlay = overlay.filter(ImageFilter.GaussianBlur(0.7))
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")

    # Vignette
    vignette = Image.new("L", (W, H), 0)
    vd = ImageDraw.Draw(vignette)
    for i in range(60):
        vd.ellipse(
            [i * 8, i * 5, W - i * 8, H - i * 5],
            outline=int(255 * (i / 60) * 0.45),
        )
    vignette = vignette.filter(ImageFilter.GaussianBlur(80))
    dark_layer = Image.new("RGB", (W, H), (0, 0, 0))
    img = Image.composite(dark_layer, img, vignette)

    out = ASSETS / "hero.jpg"
    img.save(out, "JPEG", quality=88)
    return out


def logo_badge():
    """Circular gold-on-burgundy monogram badge: GM with maple-leaf accent."""
    S = 600
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    pad = 8
    # Outer gold ring
    d.ellipse([pad, pad, S - pad, S - pad], fill=GOLD)
    # Inner burgundy disc
    inner = 26
    d.ellipse([inner, inner, S - inner, S - inner], fill=BURGUNDY)
    # Thin gold inner ring
    ring = 50
    d.ellipse(
        [ring, ring, S - ring, S - ring],
        outline=GOLD,
        width=3,
    )

    # Try to load a serif font for the monogram
    font_paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ]
    font = None
    for p in font_paths:
        if Path(p).exists():
            font = ImageFont.truetype(p, 230)
            break
    if font is None:
        font = ImageFont.load_default()

    text = "GM"
    bbox = d.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = (S - tw) // 2 - bbox[0]
    ty = (S - th) // 2 - bbox[1] - 30
    d.text((tx, ty), text, fill=GOLD, font=font)

    # Wordmark arc text below: "GOLDEN MAPLE"
    arc_font = None
    for p in font_paths:
        if Path(p).exists():
            arc_font = ImageFont.truetype(p, 38)
            break
    label = "GOLDEN  MAPLE"
    if arc_font:
        lb = d.textbbox((0, 0), label, font=arc_font)
        lw = lb[2] - lb[0]
        d.text(((S - lw) // 2, S - 150), label, fill=GOLD, font=arc_font)

    # Small ornament line
    d.line([S // 2 - 80, S - 95, S // 2 + 80, S - 95], fill=GOLD, width=3)

    out = ASSETS / "logo.png"
    img.save(out, "PNG")
    return out


if __name__ == "__main__":
    hero_panel()
    logo_badge()
    print("Assets generated in", ASSETS)
