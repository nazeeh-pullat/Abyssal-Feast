"""Converts the Aquarium art (decor, equipment, substrates, room textures) into small web images for the interactive tank demo.
Run:  python tools/build_aquarium.py   (needs the Unity project next door; writes assets/img/aq/*.webp)"""
from pathlib import Path
from PIL import Image

A = Path(r"C:\Users\nazee\Desktop\Abyssal Feast\Abyssal Feast\Assets\Art\Aquarium")
OUT = Path(__file__).resolve().parent.parent / "assets" / "img" / "aq"
OUT.mkdir(parents=True, exist_ok=True)


def trim(im):
    b = im.split()[3].point(lambda v: 255 if v > 20 else 0).getbbox()
    return im.crop(b) if b else im


for n in ["decor_coral", "decor_leaf", "decor_rock", "decor_seaweed", "equip_airstone", "equip_chest", "equip_light", "equip_pump"]:
    im = trim(Image.open(A / f"{n}.png").convert("RGBA"))
    im.thumbnail((300, 300))
    im.save(OUT / f"{n}.webp", "WEBP", quality=86, method=6)
for n in ["sand", "gravel", "pebbles", "coral", "black"]:
    Image.open(A / f"substrate_{n}.png").convert("RGBA").save(OUT / f"substrate_{n}.webp", "WEBP", quality=86, method=6)
for r in ["coral_cottage", "cozy_den", "golden_hall", "midnight_study", "mint_studio", "royal_parlor", "seaside_cottage", "sunset_loft"]:
    for part in ["wall", "wainscot", "floor"]:
        Image.open(A / "Rooms" / f"room_{r}_{part}.png").convert("RGB").resize((128, 128), Image.LANCZOS).save(OUT / f"{r}_{part}.webp", "WEBP", quality=84, method=6)
print("done", sum(f.stat().st_size for f in OUT.glob("*")) // 1024, "KB")
for n in ["decor_coral", "decor_leaf", "decor_rock", "decor_seaweed", "equip_airstone", "equip_chest", "equip_light", "equip_pump"]:
    print(n, Image.open(OUT / f"{n}.webp").size)
