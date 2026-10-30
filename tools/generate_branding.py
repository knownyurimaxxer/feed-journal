"""Draws the Feed Journal branding into assets/ (needs Pillow: pip install pillow).

Run from the project root:  python3 tools/generate_branding.py
The mark is a fanned stack of feed cards, in the colors of the default Navy theme.
"""
import math
import os
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

NAVY, NAVY_LIGHT = (0, 25, 53), (10, 62, 112)
ACCENT, ACCENT_DARK = (0, 184, 255), (14, 112, 178)
WHITE, INK, MUTED, LINE = (255, 255, 255), (11, 42, 77), (159, 179, 204), (195, 208, 224)
HEART = (255, 92, 138)
SS = 4  # supersampling
OUT = "assets"

CARD_W, CARD_H, CARD_R = 0.36, 0.43, 0.055  # as a fraction of the mark size


def gradient(w, h):
    """Navy with a soft cyan-blue glow from the top left."""
    img = Image.new("RGB", (w, h), NAVY)
    glow = Image.radial_gradient("L").resize((int(w * 1.6), int(h * 1.6)))
    layer = Image.new("RGB", glow.size, NAVY_LIGHT)
    mask = ImageChops.invert(glow).point(lambda v: int(v * 0.9))
    img.paste(layer, (int(-w * 0.45), int(-h * 0.45)), mask)
    return img


def card_layer(size, unit, details):
    """One card, centered on a transparent canvas of size x size."""
    layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    c = size / 2
    w, h, r = CARD_W * unit, CARD_H * unit, CARD_R * unit
    d.rounded_rectangle((c - w / 2, c - h / 2, c + w / 2, c + h / 2), r, fill=WHITE)
    if details:
        details(d, c, unit)
    return layer


def heart(d, cx, cy, size, fill):
    pts = []
    for i in range(120):
        t = i / 120 * 2 * math.pi
        x = 16 * math.sin(t) ** 3
        y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        pts.append((cx + x / 17 * size / 2, cy - y / 17 * size / 2))
    d.polygon(pts, fill=fill)


def bar(d, x0, yc, w, h, fill):
    d.rounded_rectangle((x0, yc - h / 2, x0 + w, yc + h / 2), h / 2, fill=fill)


def post_details(d, c, u, colors=None):
    """The little post drawn on the front card. `colors` overrides the paint (used for cut-outs)."""
    avatar, name, sub, body, tag, like = colors or (ACCENT, INK, MUTED, LINE, ACCENT, HEART)
    d.ellipse((c - 0.145 * u, c - 0.18 * u, c - 0.065 * u, c - 0.10 * u), fill=avatar)
    bar(d, c - 0.04 * u, c - 0.155 * u, 0.16 * u, 0.03 * u, name)
    bar(d, c - 0.04 * u, c - 0.115 * u, 0.10 * u, 0.02 * u, sub)
    for y, w in ((-0.035, 0.29), (0.015, 0.29), (0.065, 0.18)):
        bar(d, c - 0.145 * u, c + y * u, w * u, 0.026 * u, body)
    bar(d, c - 0.145 * u, c + 0.15 * u, 0.10 * u, 0.034 * u, tag)
    heart(d, c + 0.115 * u, c + 0.15 * u, 0.07 * u, like)


def tint(layer, color):
    solid = Image.new("RGBA", layer.size, color + (255,))
    solid.putalpha(layer.getchannel("A"))
    return solid


def shadow(layer, dy, blur, opacity):
    a = layer.getchannel("A").filter(ImageFilter.GaussianBlur(blur))
    a = a.point(lambda v: int(v * opacity))
    s = Image.new("RGBA", layer.size, (0, 8, 24, 255))
    s.putalpha(a)
    return ImageChops.offset(s, 0, dy)


def render_mark(size, scale):
    """The fanned stack of cards on a transparent size x size canvas."""
    big = size * SS
    unit = big * scale
    canvas = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    for angle, color in ((-24, ACCENT_DARK), (-12, ACCENT)):  # back card, middle card
        card = tint(card_layer(big, unit, None), color).rotate(-angle, resample=Image.BICUBIC)
        canvas.alpha_composite(shadow(card, int(0.012 * unit), 0.012 * unit, 0.45))
        canvas.alpha_composite(card)
    front = card_layer(big, unit, post_details)
    canvas.alpha_composite(shadow(front, int(0.014 * unit), 0.014 * unit, 0.5))
    canvas.alpha_composite(front)
    return canvas.resize((size, size), Image.LANCZOS)


def render_mono(size, scale):
    """One-color version for Android's themed icons: only the alpha matters."""
    big = size * SS
    unit = big * scale
    cards = [card_layer(big, unit, None).rotate(a, resample=Image.BICUBIC) for a in (24, 12)]
    sil = ImageChops.lighter(cards[0].getchannel("A"), cards[1].getchannel("A"))
    gap = card_layer(big, unit * 1.07, None).getchannel("A")  # clear gap around the front card
    sil = ImageChops.subtract(sil, gap)
    sil = ImageChops.lighter(sil, card_layer(big, unit, None).getchannel("A"))
    holes = Image.new("L", (big, big), 0)  # the post's avatar, lines and heart become holes
    post_details(ImageDraw.Draw(holes), big / 2, unit, colors=(255,) * 6)
    sil = ImageChops.subtract(sil, holes)
    out = Image.new("RGBA", (big, big), (255, 255, 255, 0))
    out.putalpha(sil)
    return out.resize((size, size), Image.LANCZOS)


def save(img, name, mode=None):
    path = os.path.join(OUT, name)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.convert(mode).save(path, optimize=True) if mode else img.save(path, optimize=True)
    print("wrote", path, img.size)


def icon_on_gradient(size, scale):
    base = gradient(size, size).convert("RGBA")
    base.alpha_composite(render_mark(size, scale))
    return base


def font(size):
    for p in ("/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf",
              "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def main():
    # App icon (full bleed, no transparency, so the OS can round it)
    save(icon_on_gradient(1024, 1.42), "icon.png", "RGB")
    # Android adaptive icon: background, foreground (kept in the 66dp safe zone), monochrome
    save(gradient(512, 512), "android-icon-background.png", "RGB")
    save(render_mark(512, 1.0), "android-icon-foreground.png")
    save(render_mono(432, 1.0), "android-icon-monochrome.png")
    # Splash: just the mark, the background color comes from app.json
    save(render_mark(1024, 1.0), "splash-icon.png")
    # Web favicon
    save(icon_on_gradient(256, 1.5).resize((48, 48), Image.LANCZOS), "favicon.png", "RGB")
    # Play Store: 512 icon and 1024x500 feature graphic
    save(icon_on_gradient(512, 1.42), "store/play-icon-512.png", "RGB")
    fg = gradient(1024, 500).convert("RGBA")
    mark = render_mark(500, 1.55)
    fg.alpha_composite(mark, (560, 0))
    d = ImageDraw.Draw(fg)
    d.text((70, 160), "Feed Journal", font=font(84), fill=WHITE)
    d.text((74, 275), "Your notes, as a feed.", font=font(34), fill=ACCENT)
    save(fg, "store/feature-graphic-1024x500.png", "RGB")


if __name__ == "__main__":
    main()
