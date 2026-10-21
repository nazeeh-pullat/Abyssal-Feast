"""Composes the gallery scene images from the game's real backgrounds, fish, bosses and creatures (artwork stills, not gameplay captures).
Run:  python tools/build_scenes.py     (needs the Unity project next door; writes assets/img/scenes/*.webp)"""
import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

GAME = Path(r"C:\Users\nazee\Desktop\Abyssal Feast\Abyssal Feast")
SITE = Path(__file__).resolve().parent.parent
OUT = SITE / "assets" / "img" / "scenes"
OUT.mkdir(parents=True, exist_ok=True)
W, H = 1280, 720
random.seed(7)
Image.MAX_IMAGE_PIXELS = None

BG = GAME / "Assets/Art/Backgrounds/Chapter1/Bg"
ENEMY = GAME / "Assets/Art/Enemies/1. Coral Reef"
PLAYER = GAME / "Assets/Art/Player"
WIKI = GAME / "Assets/Art/Wiki"
BOSS = GAME / "Assets/Art/Bosses/Chapter1"


def bbox_crop(im, pad=4):
    a = im.split()[3].point(lambda v: 255 if v > 24 else 0)
    bb = a.getbbox()
    return im.crop((max(0, bb[0] - pad), max(0, bb[1] - pad), min(im.width, bb[2] + pad), min(im.height, bb[3] + pad))) if bb else im


def frame0(path, cell=512):
    return bbox_crop(Image.open(path).convert("RGBA").crop((0, 0, cell, cell)))


def bg(name):
    im = Image.open(BG / f"{name}.png").convert("RGB")
    s = max(W / im.width, H / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    x, y = (im.width - W) // 2, (im.height - H) // 2
    return im.crop((x, y, x + W, y + H)).convert("RGBA")


def place(canvas, im, cx, cy, width, flip=False, rot=0, shadow=True, blur=0, alpha=1.0):
    s = width / im.width
    f = im.resize((width, round(im.height * s)), Image.LANCZOS)
    if flip:
        f = f.transpose(Image.FLIP_LEFT_RIGHT)
    if rot:
        f = f.rotate(rot, expand=True, resample=Image.BICUBIC)
    if blur:
        f = f.filter(ImageFilter.GaussianBlur(blur))
    if alpha < 1:
        f.putalpha(f.split()[3].point(lambda v: int(v * alpha)))
    if shadow:
        sh = Image.new("RGBA", f.size, (0, 15, 30, 0))
        sh.putalpha(f.split()[3].point(lambda v: int(v * 0.35)))
        sh = sh.filter(ImageFilter.GaussianBlur(10))
        canvas.alpha_composite(sh, (cx - f.width // 2 + 8, cy - f.height // 2 + 16))
    canvas.alpha_composite(f, (cx - f.width // 2, cy - f.height // 2))


def bubbles(canvas, n=40, region=None):
    d = ImageDraw.Draw(canvas, "RGBA")
    x0, y0, x1, y1 = region or (0, 0, W, H)
    for _ in range(n):
        r = random.choice([2, 3, 3, 4, 6, 9, 13])
        x, y = random.randint(x0, x1), random.randint(y0, y1)
        d.ellipse((x - r, y - r, x + r, y + r), outline=(225, 250, 255, 150), fill=(190, 240, 255, 28), width=2)
        d.ellipse((x - r * .5, y - r * .6, x - r * .1, y - r * .2), fill=(255, 255, 255, 170))


def finish(canvas, name, tint=(2, 18, 34), strength=.55):
    v = Image.new("RGBA", (W, H), tint + (0,))
    d = ImageDraw.Draw(v)
    for i in range(80):
        a = int(strength * 255 * (i / 80) ** 3.2)
        d.rectangle((i * 3, i * 2, W - i * 3, H - i * 2), outline=tint + (a,))
    canvas.alpha_composite(v.filter(ImageFilter.GaussianBlur(18)))
    out = ImageEnhance.Contrast(canvas.convert("RGB")).enhance(1.06)
    out.save(OUT / f"{name}.webp", "WEBP", quality=82, method=6)
    print(name, (OUT / f"{name}.webp").stat().st_size // 1024, "KB")


clown = bbox_crop(Image.open(GAME / "Resources/Resources/Player/1. Coral Reef/Clown fish/clownfish_turn.png").convert("RGBA").crop((0, 0, 362, 362)), 6)
f = lambda folder, sheet: frame0(ENEMY / folder / "Anim" / sheet)
fish = {
    "blue": f("Blue Tang", "blue_tang_swim.png"), "lion": f("Lionfish", "lionfish_swim.png"), "hog": f("HogFish", "hogfish_swim.png"), "parrot": f("Bleekers Parrotfish", "parrotfish_swim.png"),
    "coral": f("Coral Fish", "coral_fish_swim.png"), "bangai": f("Bangai Cardialfish", "bangai_swim.png"), "butter": f("Butterfly Dartfish", "butterfly_swim.png"), "beauty": f("Coral Beauty Angelfish", "coral_beauty_swim.png"),
    "mandarin": f("Mandarin Fish", "mandarin_swim.png"), "picasso": f("Picaso Triggerfish", "picaso_swim.png"), "clowntrig": f("Clown Triggerfish", "clown_triggerfish_swim.png"),
}
puffer = frame0(PLAYER / "Pufferfish/Anim/pufferfish_swim.png")
gramma = frame0(PLAYER / "RoyalGramma/Anim/royal_gramma_swim.png")
tang = frame0(PLAYER / "YellowTang/Anim/yellow_tang_swim.png")
icon = lambda n: bbox_crop(Image.open(WIKI / n).convert("RGBA"), 2)


def boss_frame(p, cell):
    sh = Image.open(p).convert("RGBA")
    return bbox_crop(sh.crop((0, 0, cell, cell)), 8)


mantis, queen = boss_frame(BOSS / "MantisShrimp/mantis_idle.png", 768), boss_frame(BOSS / "SwarmQueen/queen_idle.png", 640)

# 1 - First Bites
c = bg("Level_1")
for i, (k, x, y, w) in enumerate([("bangai", 840, 250, 120), ("coral", 960, 360, 110), ("butter", 1060, 230, 130), ("coral", 700, 420, 96), ("bangai", 1130, 420, 110), ("coral", 880, 500, 100)]):
    place(c, fish[k], x, y, w, flip=(i % 2 == 0), blur=0)
place(c, clown, 430, 380, 330)
place(c, fish["blue"], 1120, 590, 260, flip=True, alpha=.9)
bubbles(c, 55)
finish(c, "s1-first-bites")

# 2 - Pufferfish
c = bg("Level_2")
d = ImageDraw.Draw(c, "RGBA")
for r, a in [(250, 70), (320, 45), (390, 25)]:
    d.ellipse((640 - r, 360 - r, 640 + r, 360 + r), outline=(255, 209, 102, a), width=5)
place(c, puffer, 640, 360, 430)
for x, y, k, w, fl in [(180, 220, "coral", 120, False), (240, 520, "bangai", 130, False), (1090, 200, "butter", 140, True), (1120, 520, "coral", 110, True), (330, 330, "mandarin", 150, False)]:
    place(c, fish[k], x, y, w, flip=fl, rot=12 if not fl else -12)
bubbles(c, 45)
finish(c, "s2-puffer")

# 3 - Anemone Alley
c = bg("Level_8")
place(c, icon("Marine_SeaAnemone.png"), 930, 520, 360)
place(c, clown, 640, 470, 250)
place(c, fish["blue"], 250, 330, 280)
place(c, fish["parrot"], 1010, 200, 300, flip=True, alpha=.92)
bubbles(c, 40)
finish(c, "s3-anemone-alley")

# 4 - Mantis shrimp
c = bg("Level_1")
d = ImageDraw.Draw(c, "RGBA")
d.ellipse((220, 520, 640, 700), fill=(255, 93, 93, 45), outline=(255, 120, 100, 200), width=5)
place(c, mantis, 930, 520, 470)
place(c, clown, 330, 250, 230, rot=14)
bubbles(c, 35)
finish(c, "s4-mantis")

# 5 - Starfish King and his baby starfish
c = bg("Level_3")
place(c, queen, 900, 440, 560)
for x, y, w, r in [(520, 520, 110, 20), (400, 330, 96, -25), (560, 250, 90, 35), (640, 600, 120, -10)]:
    place(c, icon("Marine_SwarmLarva.png"), x, y, w, rot=r)
place(c, clown, 250, 420, 220)
bubbles(c, 40)
finish(c, "s5-starfish-king")

# 6 - Predators / food chain
c = bg("Level_9")
place(c, fish["hog"], 360, 300, 470)
place(c, fish["lion"], 940, 250, 380, flip=True)
place(c, fish["parrot"], 880, 520, 360)
place(c, fish["clowntrig"], 300, 560, 250, flip=True)
place(c, clown, 640, 400, 150)
bubbles(c, 40)
finish(c, "s6-predators")

# 7 - Chapter 1 map with level nodes
m = Image.open(GAME / "Assets/Art/Map  Backgrounds/Chapter_1.png").convert("RGB")
s = max(W / m.width, H / m.height)
m = m.resize((round(m.width * s), round(m.height * s)), Image.LANCZOS)
c = m.crop(((m.width - W) // 2, (m.height - H) // 2, (m.width - W) // 2 + W, (m.height - H) // 2 + H)).convert("RGBA")
d = ImageDraw.Draw(c, "RGBA")
pts = []
for i in range(35):
    t = i / 34
    x = 70 + t * (W - 140)
    y = H * 0.5 + math.sin(t * math.pi * 2.6) * H * 0.26 + math.sin(t * 9) * 14
    pts.append((x, y))
for a, b in zip(pts, pts[1:]):
    d.line([a, b], fill=(255, 255, 255, 120), width=6)
for i, (x, y) in enumerate(pts, 1):
    boss = i in (31, 34)
    r = 21 if boss else 16
    col = (255, 93, 93) if boss else (255, 209, 102) if i <= 13 else (94, 234, 212)
    d.ellipse((x - r - 4, y - r - 4, x + r + 4, y + r + 4), fill=(0, 20, 40, 130))
    d.ellipse((x - r, y - r, x + r, y + r), fill=col + (255,), outline=(255, 255, 255, 255), width=3)
finish(c, "s7-map", strength=.25)
print("done")
