"""Builds assets/js/data.js for the Abyssal Feast website.
Wiki texts come straight from the game's own Wiki assets (so the site and the in-game Wiki never disagree); the rest (levels, features, FAQ) is authored here.
Run from the site folder:  python tools/build_data.py"""
import json
import re
from pathlib import Path

GAME = Path(r"C:\Users\nazee\Desktop\Abyssal Feast\Abyssal Feast")
SITE = Path(__file__).resolve().parent.parent

# ------------------------------------------------------------------ wiki facts from the game
def wiki_facts():
    out = {}
    for f in sorted((GAME / "Assets/Data/Wiki").glob("Wiki_*.asset")):
        t = f.read_text(encoding="utf-8")
        name = re.search(r"entryName: (.*)", t).group(1).strip().strip('"')
        m = re.search(r"funFact: ((?:.|\n(?!  \w))*)", t)
        fact = re.sub(r"\s*\n\s*", " ", m.group(1)).strip().strip("'\"") if m else ""
        out[name] = fact.replace("''", "'")
    return out


W = wiki_facts()


def fact(name, keep_sentences=None):
    s = W.get(name, "")
    s = re.sub(r"\s*PLAYER FISH - .*$", "", s, flags=re.S)
    s = re.sub(r"\s*ENEMY FISH - .*$", "", s, flags=re.S)
    s = re.sub(r"\s*(MINIBOSS|BOSS) - .*$", "", s, flags=re.S)
    return s.strip()


# ------------------------------------------------------------------ playable fish
PLAYER = [
    dict(id="clownfish", name="Clownfish", img="clownfish", sheet=dict(src="clownfish", cols=7, rows=3, frames=21, ratio=0.676, fps=22),
         ability="Suck", abilityText="Pulls in whatever is in front of you, like a living vacuum. Immune to sea anemones.",
         hearts=1, speed=6, how="Starter fish", fact=fact("Clown Fish"), level=1),
    dict(id="dartfish", name="Dartfish", img="dartfish", sheet=dict(src="dartfish", cols=3, rows=2, frames=6, ratio=0.539, fps=9), ability="Dash", abilityText="A quick burst of speed in the direction you face. Perfect for escaping or catching a fleeing meal.",
         hearts=2, speed=8, how="Shop - 6,500 shells", fact=fact("Dart Fish"), level=4),
    dict(id="pufferfish", name="Pufferfish", img="pufferfish", sheet=dict(src="pufferfish", cols=8, rows=4, frames=32, ratio=1, fps=22),
         ability="Puffer Shield", abilityText="Inflate into a spiky ball: invincible for a moment, and everything you touch is bounced away.",
         hearts=2, speed=7, how="Shop - 2,500 shells", fact=fact("Pufferfish"), level=2),
    dict(id="royal-gramma", name="Royal Gramma", img="royal-gramma", sheet=dict(src="royal-gramma", cols=8, rows=4, frames=32, ratio=1, fps=22),
         ability="Camouflage", abilityText="Fade into the reef so nearby enemies lose track of you. Sneak past anything.",
         hearts=2, speed=5, how="Shop - 3,500 shells", fact=fact("Royal Gramma"), level=4),
    dict(id="yellow-tang", name="Yellow Tang", img="yellow-tang", sheet=dict(src="yellow-tang", cols=8, rows=4, frames=32, ratio=1, fps=22),
         ability="Adrenaline Rush", abilityText="A temporary burst of movement speed. Outswim predators and snatch fast prey.",
         hearts=2, speed=7, how="Shop - 4,000 shells", fact=fact("Yellow Tang"), level=4),
]

# ------------------------------------------------------------------ prey / predators by size class
def en(id, name, img, size, level, sheet=False):
    d = dict(id=id, name=name, img=img, size=size, level=level, fact=fact(name))
    if sheet:
        d["sheet"] = dict(src=img, cols=8, rows=4, frames=32, ratio=1, fps=22)
    return d


ENEMIES = [
    en("bangaii", "Bangaii Cardinalfish", "banggai", 1, 1),
    en("butterflyfish", "Butterflyfish", "butterflyfish", 1, 2, True),
    en("coral-fish", "Coral Fish", "coral-fish", 1, 3),
    en("coral-beauty", "Coral Beauty Angelfish", "coral-beauty", 1, 4, True),
    en("blue-tang", "Blue Tang", "blue-tang", 2, 1, True),
    en("mandarin", "Mandarin Fish", "mandarin", 2, 2, True),
    en("moorish-idol", "Moorish Idol", "moorish-idol", 2, 3),
    en("lionfish", "Lionfish", "lionfish", 3, 3, True),
    en("clown-triggerfish", "Clown Triggerfish", "clown-triggerfish", 3, 1),
    en("picasso", "Picasso Triggerfish", "picasso", 3, 2),
    en("hogfish", "Hogfish", "hogfish", 4, 11),
    en("parrotfish", "Bleeker's Parrotfish", "parrotfish", 4, 12),
]
for e in ENEMIES:
    if e["name"] == "Bangaii Cardinalfish":
        e["name"] = "Banggai Cardinalfish"
        e["fact"] = fact("Bangaii Cardinalfish")

MARINE = [
    dict(id="hermit-crab", name="Hermit Crab", img="icons/marine_hermitcrab", level=7, role="Free snack", fact=fact("Hermit Crab"), tag="Eat it for bonus shells"),
    dict(id="starfish", name="Starfish", img="icons/marine_starfish", level=7, role="Free snack", fact=fact("Starfish"), tag="A free snack that may carry shells"),
    dict(id="sea-anemone", name="Sea Anemone", img="icons/marine_seaanemone", level=9, role="Hazard", fact=fact("Sea Anemone"), tag="Stings everyone except Clownfish"),
    dict(id="sea-urchin", name="Sea Urchin", img="icons/marine_seaurchin", level=15, role="Hazard", fact=fact("Sea Urchin"), tag="Smash it once you are big enough"),
    dict(id="giant-clam", name="Giant Clam", img="icons/marine_giantclam", level=18, role="Risk and reward", fact=fact("Giant Clam"), tag="Hides Black Pearls - watch for the shake"),
    dict(id="swarm-larva", name="Swarm Larva", img="icons/marine_swarmlarva", level=30, role="Boss minion", fact=fact("Swarm Larva"), tag="Hunts in packs around the Queen"),
]

BOSSES = [
    dict(id="mantis", name="Peacock Mantis Shrimp", title="Miniboss", level=27, img="boss/mantis-shrimp", biome="The Sandy Seabed",
         fact=fact("Mantis Shrimp (Miniboss)"),
         moves=["Hops out of its burrow, patrols the floor and telegraphs every jump with a red landing circle", "A jump that misses you three times in a row cracks its shell - bite the glowing weak spot",
                "Every hit makes it faster and more alert", "Dives into the sand and bursts out right under you - keep moving"]),
    dict(id="queen", name="The Swarm Queen", title="Boss", level=30, img="boss/swarm-queen", img2="boss/swarm-queen-smooth", biome="The Shallows reef",
         fact=fact("Crown-of-Thorns Starfish (Boss)"),
         moves=["Phase 1 - SPIKY: dodge her volleys, rings, falling thorns and sweeping beams while larvae creep out from under her",
                "Phase 2 - SMOOTH: her spikes burst off and she is harmless to touch - bite her six arms one at a time, following the red rings",
                "Then only her head is left - but her spikes grow back, so stay sharp", "Eat larvae for a breather, and never sit still"]),
]

EVENTS = [
    dict(name="Tidal Current", level=21, icon="waves", fact=fact("Tidal Current"), tag="Gentle current drifts every fish one way"),
    dict(name="Rip Current", level=23, icon="swirl", fact=fact("Passing Current (Rip Current)"), tag="A fast band of water shoves you along"),
    dict(name="School Rush", level=25, icon="school", fact=fact("School Rush"), tag="Bite the calm front for a bonus"),
    dict(name="Drifting Debris", level=1, icon="log", fact=fact("Drifting Debris"), tag="Junk tumbles through the water"),
]

POWERUPS = [
    dict(name="Speed Boost", img="icons/powerup_speedboost", text="Swim much faster for a short time."),
    dict(name="Shield", img="icons/powerup_shield", text="Protects you from damage for a few seconds."),
    dict(name="Slow World", img="icons/powerup_slowworld", text="Everything else slows down - easy pickings!"),
    dict(name="Growth Point", img="icons/powerup_growthpoint", text="Instantly boosts your level progress."),
    dict(name="Extra Heart", img="icons/powerup_heart1", text="Restores one of your hearts."),
    dict(name="Shells", img="icons/powerup_shellsbubble", text="A bonus pile of shells to spend in the Shop."),
    dict(name="Poison Bubble", img="icons/powerup_poisonbubble", text="The only bad bubble. Popping it hurts - steer around it.", bad=True),
    dict(name="Algae Pellet", img="icons/powerup_algaepellet", text="Clears away the creeping moss that clouds your view in some waters."),
]
PERKS = [
    dict(name="Extra Heart", img="icons/perk_extraheart", text="Start the level with one bonus heart."),
    dict(name="Extra Revive", img="icons/perk_extrarevive", text="Start the level with one bonus revive."),
    dict(name="Retry", img="icons/perk_retry", text="When you lose, keep playing right where you were."),
    dict(name="Score x2", img="icons/perk_scorex2", text="Doubles the points you earn from eating fish this level."),
    dict(name="Starting Shield", img="icons/perk_startingshield", text="Invincible for the first 10 seconds of the level."),
]

# ------------------------------------------------------------------ the 31 levels of Chapter 1
# type: eat | pool | timed | hunt | survival | boss | maze
L = []


def lv(n, name, typ, bg, blurb, new=None, tip=None, extra=None):
    d = dict(n=n, name=name, type=typ, bg=bg, blurb=blurb, new=new or [], tip=tip or "")
    if extra:
        d.update(extra)
    L.append(d)


lv(1, "First Bites", "eat", 1, "Your first swim in the Shallows. Learn the basics: swim, eat fish smaller than you, grow through 3 size stages and fill the bar to win. A short cutscene and on-screen hints walk you through it - everyone starts as a Clownfish.",
   ["Swimming and eating", "Hearts and the ability button", "Feast Streak combos"], "Fish bigger than you will eat you. Eat the small ones first!")
lv(2, "Into the Reef", "eat", 2, "The reef gets busier - and not every little fish is harmless. Meet the Pufferfish: when you get close it puffs into a spiky ball that bounces everyone away and cannot be eaten. Wait for it to deflate, then bite!",
   ["Pufferfish enemy"], "Keep your distance from puffed-up pufferfish.")
lv(3, "Powerups", "eat", 3, "Floating bubbles hold powerups: Speed Boost, Shield, Slow World, Growth Point, Extra Heart and piles of shells. Swim into one to grab it - its timer shows on your HUD. Watch out for the one bad bubble.",
   ["Powerup bubbles", "The Poison Bubble"], "Save Slow World for a crowded screen.")
lv(4, "Feeding Pool", "pool", 4, "Only the tiniest fish live here - eat 150 of them to win! Finishing this level triggers a short story scene and unlocks the Shop (fish, accessories, perks), My Aquarium and the PVP, Quickstart and Custom game modes.",
   ["Unlocks the Shop and Aquarium", "Unlocks PVP, Quickstart and Custom modes"], "Only the tiniest fish live here - eat 150 of them to win!")
lv(5, "Timed Trial", "timed", 5, "A race against the clock. Collect as many shell bubbles as you can before the timer runs out - stay alive and eat as you go!",
   ["Timed Trials"], "Survive until the timer runs out - grab the shell bubbles for bonus shells!")
lv(6, "Hungry Waters", "eat", 6, "Back to growing: four size stages and hungrier predators. Time to put powerups to work.")
lv(7, "Marine Life", "eat", 7, "Small sea-floor critters you can always eat, whatever your size. Hermit Crabs walk along the sea floor (bonus shells!) and Starfish drift in for a free snack that may carry shells.",
   ["Hermit Crab", "Starfish"])
lv(8, "Feeding Pool 2", "pool", 4, "Another pool full of the tiniest fish. Eat 150 of them to win - chain bites for a big Feast Streak.", [], "Only the tiniest fish live here - eat 150 of them to win!")
lv(9, "Anemone Alley", "eat", 8, "Sea anemones sting everyone but Clownfish: anyone else gets hurt and slowed. Steer clear - or play as the Clownfish, who is immune.",
   ["Sea Anemone"], "Only clownfish are safe inside an anemone.")
lv(10, "Big Appetite", "eat", 9, "Bigger crowds, bigger bites. Fill the growth bar through four size stages.")
lv(11, "Giant Prey", "eat", 10, "The first level with a fourth prey size: the Hogfish joins the menu - a big meal for a grown fish, and a real danger to anything smaller.",
   ["4th prey size - Hogfish"])
lv(12, "Hunt the Mandarinfish", "hunt", 11, "Hunt levels give you one target. Eat the smaller fish to grow to full size - then catch the one Mandarinfish. Other fish do not count toward the goal!",
   ["Hunt levels"], "Eat the smaller fish to grow to full size - then catch the one Mandarinfish.")
lv(13, "Open Ocean", "eat", 6, "More open water and faster fish. Keep moving and keep chaining bites.")
lv(14, "Timed Trial 2", "timed", 5, "Another shell-grabbing race, now with 75 seconds on the clock.", [], "Survive until the timer runs out - grab the shell bubbles for bonus shells!")
lv(15, "Spiky Waters", "eat", 10, "Sea urchins just sit there with hundreds of spines - touching them hurts. Grow big enough and you can smash them instead.",
   ["Sea Urchin"], "Touching its spikes hurts. Grow big enough and you can smash it!")
lv(16, "Drifting Tides", "eat", 9, "Wide-open reef and big schools. Eat your way through four size stages without losing your hearts.")
lv(17, "Hunt the Moorefish", "hunt", 11, "Reach full size by eating smaller fish, then catch the one Moorish Idol. Only the target counts.", [], "Eat the smaller fish to grow to full size - then catch the one Moorefish.")
lv(18, "Giant Clam", "eat", 7, "Risk versus reward: a giant clam opens to show a reward (Black Pearls!), but if it snaps shut while you are inside, it is over. Watch for the shake!",
   ["Giant Clam"])
lv(19, "Poison Fish", "eat", 3, "Not every glowing snack is a good idea. Poison fish are slow and green-tinted - and eating one flips your controls for a few seconds!",
   ["Poison Fish"])
lv(20, "Feast Frenzy", "eat", 2, "A feeding frenzy: the more you bite in a row, the higher your Feast Streak climbs. How far can you spell it?")
lv(21, "Riptide Run", "survival", 5, "The water itself starts to move. Every so often a gentle tidal current pushes you and every fish along - drifting bubbles show which way it flows. Survive until the timer runs out.",
   ["Tidal Currents"], "Ride out the riptide! Survive until the timer runs out.")
lv(22, "Hungry Reef", "eat", 6, "The reef is packed with hungry predators. Stay one size ahead of them.")
lv(23, "Riptide Run 2", "survival", 5, "The sea gets wilder. Rip currents are fast bands of water that sweep across the level and shove you along - swim out of their way and survive the timer.",
   ["Rip Currents"], "Ride out the riptide! Survive until the timer runs out.")
lv(24, "Fish Fiesta", "eat", 9, "A party of prey. Plenty to eat - and plenty of things that want to eat you.")
lv(25, "School Rush", "eat", 2, "A stampede of fish! A huge school bursts across the screen and stirs up the water. Stay clear of its wake, then bite the calm front for a bonus - eat the whole school for a 100-shell School Bonus.",
   ["School Rush event"])
lv(26, "Feeding Pool 3", "pool", 4, "The last Feeding Pool: 150 tiny fish stand between you and the boss.", [], "Only the tiniest fish live here - eat 150 of them to win!")
lv(27, "The Mantis Shrimp", "boss", 1, "Your first real fight. The peacock mantis shrimp leaps from its burrow - stay out of the red circle. When it misses you enough times its shell cracks, so bite the glowing weak spot!",
   ["Miniboss fight"], "Stay out of the red circle. After it misses you 3 times the shell cracks - bite the weak spot!", dict(boss="mantis", title="Miniboss"))
lv(28, "Timed Trial 3", "timed", 5, "The final shell race of the chapter: 75 seconds, as many shells as you can grab.", [], "Survive until the timer runs out - grab the shell bubbles for bonus shells!")
lv(29, "Last Feast", "eat", 6, "The last regular level of the Shallows. Everything you have learned, all at once.")
lv(30, "The Swarm Queen", "boss", 3, "The ruler of the Shallows reef. She throws her spikes - dodge them! When she runs out she turns smooth: bite her arms one by one (follow the red rings), then her head.",
   ["Boss fight", "Two-phase Queen"], "Dodge her spikes. When she runs out, bite her arms one by one, then her head.", dict(boss="queen", title="Boss"))
lv(31, "The Maze", "maze", 10, "The last stretch of the Shallows: swim through a winding cave maze to the glowing light at the end to finish the chapter - and open the way to the Kelp Forest.",
   ["Cave maze finale", "Chapter 2 cutscene"], "Enter the cave on the left and find your way through the maze to the light.")

# ------------------------------------------------------------------ the rest of the site content
FEATURES = [
    dict(icon="fish", title="Eat. Grow. Survive.", text="Swim with one thumb, chomp fish smaller than you and grow through size stages - but anything bigger is hunting you."),
    dict(icon="star", title="5 playable fish", text="Clownfish, Dartfish, Pufferfish, Royal Gramma and Yellow Tang - each with its own special ability, speed and hearts."),
    dict(icon="map", title="31 levels in Chapter 1", text="Eating races, timed shell runs, hunts, riptide survival, a maze finale - and every level introduces something new."),
    dict(icon="swords", title="Real boss fights", text="Dodge the Peacock Mantis Shrimp's leaps and take on the two-phase Swarm Queen with her spikes, larvae and weak points."),
    dict(icon="waves", title="A living ocean", text="Tidal currents, rip currents, school stampedes, drifting debris, stinging anemones and snapping giant clams."),
    dict(icon="flame", title="Feast Streak combos", text="Chain bites to spell FEAST, then keep climbing through six more tiers all the way to ABYSSAL FEAST."),
    dict(icon="hat", title="570+ accessories", text="Hats, glasses and necklaces for every fish - from wizard hats and pirate caps to halos and crowns."),
    dict(icon="tank", title="My Aquarium", text="Build a living tank with the fish you collect: decorate it, place coral and rocks, pick a room and use the sponge and net."),
    dict(icon="trophy", title="190+ achievements", text="Collect them all - plus an in-game Wiki that fills in as you discover new fish, creatures and events."),
    dict(icon="music", title="Your music, your game", text="Play your own music while you swim, and in Custom mode add your own fish pictures from your device."),
    dict(icon="gamepad", title="4 ways to play", text="Story Mode, two-player PVP on one device, Random Quickstart and fully custom games."),
    dict(icon="lock", title="No accounts. No tracking.", text="No sign-in, no ads and no analytics. Your progress lives on your device and the game plays offline."),
]

MODES = [
    dict(icon="map", name="Story Mode", text="The campaign. Pick a level on the map and swim your way through the chapters.", open="Open from the start"),
    dict(icon="swords", name="PVP", text="Two players, one device. Split Screen Duel, Score Race or Last Fish Standing.", open="Unlocks after Level 4"),
    dict(icon="dice", name="Random Quickstart", text="A surprise game: random level, fish, size mix, ability, powerups and ocean effects.", open="Unlocks after Level 4"),
    dict(icon="sliders", name="Custom", text="Build your own game: pick everything yourself and add your own fish from your device.", open="Unlocks after Level 4"),
]

CHAPTERS = [
    dict(n=1, name="The Shallows", status="live", map="map-ch1", text="Warm, sunlit water above the reef. Coral, sand and small fish make it the perfect place to start growing. 31 levels, two bosses and a cave maze finale.",
         badges=["31 levels", "2 boss fights", "Playable now (in testing)"]),
    dict(n=2, name="The Kelp Forest", status="soon", map="map-ch2", text="Giant kelp can grow up to half a metre a day, making towering underwater forests full of hiding places. Bigger fish, new dangers and creeping moss are on the way.",
         badges=["Coming soon"]),
    dict(n=3, name="Chapter 3", status="soon", map="map-ch3", text="Somewhere past the reef the water turns deep blue. New creatures. New rules. Details soon.", badges=["Coming soon"], classified=True),
    dict(n=4, name="Chapter 4", status="soon", map="map-ch4", text="Something glows in the dark below. Whatever lives down here does not like visitors.", badges=["Coming soon"], classified=True),
    dict(n=5, name="Chapter 5", status="soon", map="map-ch5", text="The deepest water of all - where the abyss waits. Are you big enough?", badges=["Coming soon"], classified=True),
]

STREAK = ["FEAST", "FEAST RUSH", "FEAST SURGE", "FEASTSTORM", "GRAND FEAST", "SAVAGE FEAST", "ABYSSAL FEAST"]

FAQ = [
    ("When can I play?", "Chapter 1 is playable in testing now. A Google Play release is planned, with iOS, Steam and a browser version to follow - follow along here for news. Chapters 2 to 5 are in development."),
    ("Which devices does it run on?", "Android first, built in Unity for phones and tablets in landscape. iOS, Steam (PC) and a browser version are coming soon."),
    ("Does it need an internet connection?", "No. The game plays fully offline. The only feature that goes online is entering a redeem code, which is checked on our server."),
    ("Are there ads or in-app purchases?", "Not in the current build. If that ever changes we will say so here and update the Privacy Policy before the update ships."),
    ("Is there multiplayer?", "Local PVP: two players on one device (Split Screen Duel, Score Race or Last Fish Standing). There is no online play and no account."),
    ("What data do you collect?", "None about you. Progress and settings stay on your device. Entering a redeem code sends the code and a random device ID so it can only be used the allowed number of times - read the full Privacy Policy for details."),
    ("How do I get in touch?", "Email nazeehfazal12@gmail.com - bug reports, ideas and fish suggestions are all welcome."),
]

STATS = dict(levels=31, fish=17, accessories=570, achievements=190, chapters=5, bosses=2)

LADDER = {
    1: "Size 1 - The tiny ones",
    2: "Size 2 - Growing up",
    3: "Size 3 - Reef hunters",
    4: "Size 4 - Giants of the Shallows",
}

SCENES = [
    dict(src="assets/img/scenes/s1-first-bites.webp", caption="Level 1 - First Bites: your first swim in the Shallows"),
    dict(src="assets/img/scenes/s2-puffer.webp", caption="Puffed-up pufferfish bounce everyone away"),
    dict(src="assets/img/scenes/s3-anemone-alley.webp", caption="Anemone Alley - only Clownfish are safe"),
    dict(src="assets/img/scenes/s4-mantis.webp", caption="Miniboss: the Peacock Mantis Shrimp"),
    dict(src="assets/img/scenes/s5-swarm-queen.webp", caption="Boss: the Swarm Queen and her larvae"),
    dict(src="assets/img/scenes/s6-predators.webp", caption="Hogfish, Lionfish and Parrotfish rule the reef"),
    dict(src="assets/img/scenes/s7-map.webp", caption="Chapter 1 - pick your level on the map"),
]

data = dict(scenes=SCENES, stats=STATS, player=PLAYER, enemies=ENEMIES, ladder=LADDER, marine=MARINE, bosses=BOSSES, events=EVENTS, powerups=POWERUPS, perks=PERKS,
            levels=L, features=FEATURES, modes=MODES, chapters=CHAPTERS, streak=STREAK, faq=FAQ)

js = "/* generated by tools/build_data.py - edit the generator, not this file */\nwindow.AF_DATA = " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n"
dest = SITE / "assets" / "js" / "data.js"
dest.parent.mkdir(parents=True, exist_ok=True)
dest.write_text(js, encoding="utf-8")
print("wrote", dest, f"{len(js)/1024:.0f} KB", "levels", len(L), "wiki facts", sum(1 for v in W.values() if v))
missing = [e["name"] for e in ENEMIES + PLAYER + MARINE if not e.get("fact")]
print("missing facts:", missing)
