"""Builds the 'Scenes from the reef' gallery from REAL gameplay screenshots (Game view, HUD included), captured by the Unity project's Assets/Editor/AF_ShotGallery.cs
(batch Play Mode, env AF_SHOT_SCENE / AF_SHOT_NAME / AF_SHOT_COUNT, boss shots add AF_SHOT_BOSS=1; writes Logs/gallery/<name>_<n>.png).
Run:  python tools/build_scenes.py     (reads the picked frames below from the Unity project's Logs/gallery, writes assets/img/scenes/*.webp)"""
from pathlib import Path

from PIL import Image

GAME = Path(r"C:\Users\nazee\Desktop\Abyssal Feast\Abyssal Feast")
SHOTS = GAME / "Logs" / "gallery"
OUT = Path(__file__).resolve().parent.parent / "assets" / "img" / "scenes"
OUT.mkdir(parents=True, exist_ok=True)

PICKS = {
    "s1-first-bites": "l1_3",          # Level 1 - First Bites (tutorial thought bubble, score tip)
    "s2-puffer": "puffer_0",           # Level 2 - Meet the Pufferfish
    "s3-anemone-alley": "anemone_1",   # Level 9 - Anemone Alley
    "s4-mantis": "mantis_7",           # Level 31 - Miniboss: the Peacock Mantis Shrimp
    "s5-starfish-king": "king_5",      # Level 34 - Boss: the Starfish King
    "s6-giant-clam": "clam_2",         # Level 20 - Giant Clam
    "s7-map": "map_1",                 # The Shallows map screen
}

for name, shot in PICKS.items():
    im = Image.open(SHOTS / f"{shot}.png").convert("RGB")
    im.save(OUT / f"{name}.webp", "WEBP", quality=86, method=6)
    print(name, im.size, (OUT / f"{name}.webp").stat().st_size // 1024, "KB")
