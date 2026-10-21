"""Exports game art into optimized web assets for the Abyssal Feast website.
Run from the site folder:  python tools/build_assets.py      (needs Pillow; reads the Unity project next door)
Everything it writes lives under assets/img (generated - safe to delete and rebuild)."""
import glob
import os
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

GAME = Path(r"C:\Users\nazee\Desktop\Abyssal Feast\Abyssal Feast")
SITE = Path(__file__).resolve().parent.parent
IMG = SITE / "assets" / "img"
Image.MAX_IMAGE_PIXELS = None


def out(*parts):
    p = IMG.joinpath(*parts)
    p.parent.mkdir(parents=True, exist_ok=True)
    return p


def save(im, path, q=80, lossless=False):
    path = Path(path)
    im.save(path, "WEBP", quality=q, method=6, lossless=lossless)
    return path.stat().st_size


def bbox_crop(im, pad=6):
    a = im.split()[3].point(lambda v: 255 if v > 24 else 0)
    bb = a.getbbox()
    if not bb:
        return im
    return im.crop((max(0, bb[0] - pad), max(0, bb[1] - pad), min(im.width, bb[2] + pad), min(im.height, bb[3] + pad)))


def fit_width(im, w):
    if im.width <= w:
        return im
    return im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)


def cover(im, w, h):
    s = max(w / im.width, h / im.height)
    r = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    x, y = (r.width - w) // 2, (r.height - h) // 2
    return r.crop((x, y, x + w, y + h))


total = 0


def rec(label, n):
    global total
    total += n
    print(f"{label:34} {n/1024:7.0f} KB")


# ---------------------------------------------------------------- backgrounds / maps
bgdir = GAME / "Assets/Art/Backgrounds/Chapter1/Bg"
bg_files = ["Level_1", "Level_2", "Level_3", "Level_4", "Level_5", "Level_6", "Level_7", "Level_8", "Level_9", "level_10", "level_12"]
for i, name in enumerate(bg_files, 1):
    im = Image.open(bgdir / f"{name}.png").convert("RGB")
    rec(f"bg/bg{i:02d}", save(cover(im, 960, 540), out("bg", f"bg{i:02d}.webp"), 76))

hero = Image.open(bgdir / "Level_1.png").convert("RGB")
rec("hero-bg", save(fit_width(hero, 1700), out("hero-bg.webp"), 80))

mapdir = GAME / "Assets/Art/Map  Backgrounds"
for n in range(1, 6):
    im = Image.open(mapdir / f"Chapter_{n}.png").convert("RGB")
    rec(f"map-ch{n}", save(fit_width(im, 1500), out(f"map-ch{n}.webp"), 74))

# ---------------------------------------------------------------- logo
logo = Image.open(GAME / "Assets/Art/Logo/logo.png").convert("RGBA")
logo = bbox_crop(logo, 10)
rec("logo", save(fit_width(logo, 900), out("logo.webp"), 90))
fit_width(logo, 500).save(out("logo.png"), optimize=True)

# ---------------------------------------------------------------- fish
def frame0(sheet, cell=512):
    im = Image.open(sheet).convert("RGBA")
    return im.crop((0, 0, cell, cell))


ENEMY = GAME / "Assets/Art/Enemies/1. Coral Reef"
PLAYER = GAME / "Assets/Art/Player"
STATIC = {
    "pufferfish": PLAYER / "Pufferfish/Anim/pufferfish_swim.png",
    "royal-gramma": PLAYER / "RoyalGramma/Anim/royal_gramma_swim.png",
    "yellow-tang": PLAYER / "YellowTang/Anim/yellow_tang_swim.png",
    "banggai": ENEMY / "Bangai Cardialfish/Anim/bangai_swim.png",
    "parrotfish": ENEMY / "Bleekers Parrotfish/Anim/parrotfish_swim.png",
    "blue-tang": ENEMY / "Blue Tang/Anim/blue_tang_swim.png",
    "butterflyfish": ENEMY / "Butterfly Dartfish/Anim/butterfly_swim.png",
    "clown-triggerfish": ENEMY / "Clown Triggerfish/Anim/clown_triggerfish_swim.png",
    "coral-beauty": ENEMY / "Coral Beauty Angelfish/Anim/coral_beauty_swim.png",
    "coral-fish": ENEMY / "Coral Fish/Anim/coral_fish_swim.png",
    "hogfish": ENEMY / "HogFish/Anim/hogfish_swim.png",
    "lionfish": ENEMY / "Lionfish/Anim/lionfish_swim.png",
    "mandarin": ENEMY / "Mandarin Fish/Anim/mandarin_swim.png",
    "moorish-idol": ENEMY / "Moorefish/Anim/moorefish_swim.png",
    "picasso": ENEMY / "Picaso Triggerfish/Anim/picaso_swim.png",
}
for key, path in STATIC.items():
    f = bbox_crop(frame0(path), 8)
    rec(f"fish/{key}", save(fit_width(f, 520), out("fish", f"{key}.webp"), 86))

# clownfish: hi-res first cell of the turn sheet; dartfish: hi-res still
turn = Image.open(GAME / "Resources/Resources/Player/1. Coral Reef/Clown fish/clownfish_turn.png").convert("RGBA")
cw, ch = turn.width // 4, turn.height // 3
clown = bbox_crop(turn.crop((0, 0, cw, ch)), 8)
rec("fish/clownfish", save(fit_width(clown, 520), out("fish", "clownfish.webp"), 88))
dart = Image.open(GAME / "Resources/Resources/Player/1. Coral Reef/Decorated Dartfish/dartfish_swim_0.png").convert("RGBA")
rec("fish/dartfish", save(fit_width(bbox_crop(dart, 8), 520), out("fish", "dartfish.webp"), 86))

# secret golden fish: silhouette teaser only (it is a redeem-code fish)
gold = bbox_crop(frame0(PLAYER / "GoldClown/Anim/gold_clown_swim.png"), 8)
sil = Image.new("RGBA", gold.size, (6, 22, 40, 255))
sil.putalpha(gold.split()[3])
rec("fish/secret-silhouette", save(fit_width(sil, 420), out("fish", "secret.webp"), 80))

# ---------------------------------------------------------------- animated swim sheets (32 frames, 8x4, 45 ms) at 256 px cells
SHEETS = {
    "pufferfish": STATIC["pufferfish"], "royal-gramma": STATIC["royal-gramma"], "yellow-tang": STATIC["yellow-tang"],
    "blue-tang": STATIC["blue-tang"], "lionfish": STATIC["lionfish"], "coral-beauty": STATIC["coral-beauty"],
    "butterflyfish": STATIC["butterflyfish"], "mandarin": STATIC["mandarin"],
}
for key, path in SHEETS.items():
    s = Image.open(path).convert("RGBA").resize((2048, 1024), Image.LANCZOS)
    rec(f"sheet/{key}", save(s, out("sheets", f"{key}.webp"), 78))

# clownfish: 21 idle frames -> 7x3 sheet of 256x173 cells
frames = sorted(glob.glob(str(GAME / "Assets/Animations/Player/clownfish/idle/*.png")))
cw2, ch2 = 256, 173
cs = Image.new("RGBA", (cw2 * 7, ch2 * 3), (0, 0, 0, 0))
for i, f in enumerate(frames[:21]):
    fr = Image.open(f).convert("RGBA")
    fr = fr.resize((cw2, round(fr.height * cw2 / fr.width)), Image.LANCZOS)
    cs.alpha_composite(fr, ((i % 7) * cw2, (i // 7) * ch2 + (ch2 - fr.height) // 2))
rec("sheet/clownfish", save(cs, out("sheets", "clownfish.webp"), 80))

# ---------------------------------------------------------------- bosses
BOSS = GAME / "Assets/Art/Bosses/Chapter1"


def first_cell(path, cell):
    """frame 0 of a boss sprite sheet (the cell size is that boss's: Mantis 768 px, Starfish King 640 px)."""
    sh = Image.open(path).convert("RGBA")
    return sh.crop((0, 0, cell, cell))


for key, path, cell in (("mantis-shrimp", BOSS / "MantisShrimp/mantis_idle.png", 768), ("starfish-king", BOSS / "SwarmQueen/queen_idle.png", 640),
                        ("starfish-king-bare", BOSS / "SwarmQueen/queen_smooth_idle.png", 640)):
    f = bbox_crop(first_cell(path, cell), 10)
    rec(f"boss/{key}", save(fit_width(f, 720), out("boss", f"{key}.webp"), 86))
king = bbox_crop(first_cell(BOSS / "SwarmQueen/queen_idle.png", 640), 8)

# ---------------------------------------------------------------- wiki icons (marine life, powerups, perks, currency)
WIKI = GAME / "Assets/Art/Wiki"
for p in sorted(WIKI.glob("*.png")):
    if p.stem.startswith(("Marine_", "Powerup_", "Perk_", "Currency_")):
        im = bbox_crop(Image.open(p).convert("RGBA"), 4)
        rec(f"icon/{p.stem}", save(im, out("icons", p.stem.lower() + ".webp"), 88, lossless=False))

# ---------------------------------------------------------------- accessories showcase
ACC = GAME / "Assets/Art/Accessories"
SHOW = [("Hat", n) for n in ("hat_wizard_hat", "hat_birthday_crown", "hat_buccaneer_cap", "hat_halo_with_wings", "hat_crystal_shard_crown",
                              "hat_graduation_cap", "hat_pizza_slice_hat", "hat_hot_dog_hat", "hat_lily_pad_hat", "hat_teacup_hat",
                              "hat_birdhouse_hat", "hat_mini_windmill_hat", "hat_gold_top_hat", "hat_gold_laurel_crown")] + \
       [("Face", n) for n in ("face_gear_eye_visor", "face_donut_eye_frame", "face_lightning_eye_lens", "face_camera_lens_eye", "face_magnifier_loupe")] + \
       [("Neck", n) for n in ("neck_jellyfish_charm", "neck_trophy_charm", "neck_sun_medallion", "neck_treasure_map_pendant",
                              "neck_lucky_horseshoe_charm", "neck_shell_brooch", "neck_lantern_charm", "neck_jingle_bell", "neck_lighthouse_pendant")]
for folder, name in SHOW:
    p = ACC / folder / f"{name}.png"
    if p.exists():
        im = bbox_crop(Image.open(p).convert("RGBA"), 4)
        rec(f"acc/{name}", save(fit_width(im, 220), out("acc", f"{name}.webp"), 86))
    else:
        print("missing accessory", p)

# ---------------------------------------------------------------- share image + favicon
W, H = 1200, 630
og = cover(hero, W, H).convert("RGBA")
og = ImageEnhance.Brightness(og).enhance(0.8)
shade = Image.new("RGBA", (W, H), (3, 14, 28, 0))
sd = ImageDraw.Draw(shade)
for y in range(H):
    sd.line([(0, y), (W, y)], fill=(3, 14, 28, int(150 * (y / H) ** 1.5)))
og.alpha_composite(shade)
lg = fit_width(logo, 640)
og.alpha_composite(lg, ((W - lg.width) // 2, 70))
f1 = fit_width(clown, 220)
og.alpha_composite(f1, (150, 400))
f2 = fit_width(king, 340)                                  # the Starfish King, the new Chapter 1 boss
og.alpha_composite(f2, (800, 290))
f3 = fit_width(bbox_crop(frame0(STATIC["blue-tang"]), 8), 200)
og.alpha_composite(f3, (460, 440))
og.convert("RGB").save(out("og.jpg"), quality=88, optimize=True)

face = clown.crop((int(clown.width * 0.45), 0, clown.width, clown.height))
size = max(face.width, face.height)
sq = Image.new("RGBA", (size, size), (0, 0, 0, 0))
sq.alpha_composite(face, ((size - face.width) // 2, (size - face.height) // 2))
sq.resize((192, 192), Image.LANCZOS).save(out("icon-192.png"))
sq.resize((64, 64), Image.LANCZOS).save(SITE / "assets" / "favicon.png")

print(f"\nTOTAL {total/1024/1024:.1f} MB")
