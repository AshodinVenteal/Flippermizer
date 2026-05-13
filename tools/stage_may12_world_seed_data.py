from __future__ import annotations

import json
import re
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
REPO = ROOT / "flippermizer-essential-overlay"
DATA = ROOT / "manual_flippermizerworldsofpinball_base_game" / "data"
HOOK = ROOT / "manual_flippermizerworldsofpinball_base_game" / "hooks" / "World.py"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value) -> None:
    path.write_text(json.dumps(value, indent=4, ensure_ascii=False) + "\n", encoding="utf-8")


def key(name: str) -> str:
    return re.sub(r"[^A-Za-z0-9]+", "", name)


def score(table: str, diff: str, value: str) -> dict:
    return {
        "title": f"{diff} Score ({value}+)",
        "type": "score",
        "explanation": f"Build score to at least {value} before drain. Use the table-specific route and preserve bonus where practical.",
        "source_location": f"{table} - {diff} Score ({value}+)",
    }


def task(title: str, explanation: str) -> dict:
    return {
        "title": title,
        "type": "task",
        "explanation": explanation,
        "source_location": title,
    }


SCORES = {
    "Skateball": ("145,877", "295,853", "623,773"),
    "Vector": ("173,289", "321,367", "605,190"),
    "Gold Ball": ("115,324", "231,251", "501,364"),
    "City Slicker": ("278,639", "573,334", "1,275,769"),
    "Super Mario Bros.": ("8,714,604", "24,925,689", "69,593,091"),
    "Street Fighter II": ("25,105,590", "53,637,398", "111,065,152"),
    "Q*bert's Quest": ("231,844", "414,555", "731,471"),
    "Mr. & Mrs. Pac-Man": ("275,395", "412,475", "636,135"),
    "Space Invaders": ("58,445", "127,825", "299,175"),
}

PIXEL_TABLES = [
    ("SMB", "Super Mario Bros."),
    ("SF2", "Street Fighter II"),
    ("QBERT", "Q*bert's Quest"),
    ("MMPAC", "Mr. & Mrs. Pac-Man"),
    ("SINV", "Space Invaders"),
]

POOLS = {
    "Skateball": {
        "Easy": [
            task("Complete S-K-A-T-E once", "Drop all S-K-A-T-E targets once to advance the right saucer value."),
            score("Skateball", "Easy", SCORES["Skateball"][0]),
            task("Complete the 1-2-3 top lanes", "Collect all three top lanes to advance bonus multiplier progress and light a bumper."),
            task("Complete the upper-left drop target bank", "Clear the upper-left drop bank once for points and bonus advances."),
            task("Light the right spinner", "Collect both A and B in-lane letters to light the spinner for increased value."),
            task("Advance bonus to at least 20,000", "Build base bonus to the first super-bonus carry threshold."),
        ],
        "Medium": [
            task("Advance the right saucer to 100,000", "Complete S-K-A-T-E twice so the right saucer is showing the 100,000 value."),
            score("Skateball", "Medium", SCORES["Skateball"][1]),
            task("Collect a 100,000 right saucer", "After two S-K-A-T-E completions, shoot the right saucer for the 100,000 award."),
            task("Advance bonus multiplier to 3X", "Use 1-2-3 lanes or the upper-left bank to reach at least 3X bonus."),
            task("Light Collect Bonus at the right saucer", "Lock in all three yellow arrows on the upper-left bank to light Collect Bonus."),
            task("Light two bumpers", "Complete 1-2-3 lanes twice to light two bumpers."),
        ],
        "Hard": [
            task("Collect two 100,000 right saucers in one game", "Keep the saucer value at 100,000 and collect it twice before game over."),
            score("Skateball", "Hard", SCORES["Skateball"][2]),
            task("Reach 5X bonus multiplier", "Use lane and drop-bank completions to max the bonus multiplier."),
            task("Collect Bonus at the right saucer with 3X or better", "Build multiplier to at least 3X, light Collect Bonus, then shoot the saucer."),
            task("Complete the upper-left bank three times in one ball", "Clear the upper-left drop bank three times before draining."),
            task("Score a 300,000+ end-of-ball bonus", "Build enough bonus and multiplier for a 300,000 or higher drain bonus."),
        ],
    },
    "Vector": {
        "Easy": [
            task("Complete X-Y-Z targets", "Clear the X-Y-Z upper-playfield target set once."),
            score("Vector", "Easy", SCORES["Vector"][0]),
            task("Make one Vectorscan ramp shot", "Shoot the left Vectorscan ramp completely for a flip-speed score."),
            task("Complete one H-Y-P-E target set", "Hit all four H-Y-P-E targets in any order."),
            task("Collect a V saucer bonus", "Nudge or feed the ball into either lower saucer to collect the current V bonus."),
            task("Advance display bonus by 30,000", "Build the playfield display bonus through targets, lanes, or drops."),
        ],
        "Medium": [
            task("Complete Defender drops in order", "Clear the back-left Defender drops from left to right to light lock immediately."),
            score("Vector", "Medium", SCORES["Vector"][1]),
            task("Lock 1 ball on the Vectorscan ramp", "Light lock and make the left ramp to send a ball to the lock saucer."),
            task("Complete H-Y-P-E in order", "Hit H-Y-P-E in sequence to multiply display bonus and light ramp arrows."),
            task("Light all ramp arrows", "Complete H-Y-P-E in order or enough out-of-order sets to light every ramp-arrow insert."),
            task("Make 3 Vectorscan ramp shots", "Complete three left-ramp shots in the same game."),
        ],
        "Hard": [
            task("Start Vector multiball", "Lock three balls through the Vectorscan ramp to begin multiball."),
            score("Vector", "Hard", SCORES["Vector"][2]),
            task("Collect 2 Vectorscan multiball ramp awards", "During multiball, make two successful left-ramp shots."),
            task("Reach 3X display bonus", "Complete H-Y-P-E in order twice to reach the 3X display-bonus multiplier."),
            task("Score a 500,000+ display bonus", "Build and multiply display bonus so the end-of-ball display bonus reaches 500,000 or more."),
            task("Earn a Fastest Flip award", "Make a Vectorscan ramp shot fast enough to beat the displayed flip-speed record."),
        ],
    },
    "Gold Ball": {
        "Easy": [
            task("Spell P-L-A-Y once", "Complete the four P-L-A-Y top lanes once."),
            score("Gold Ball", "Easy", SCORES["Gold Ball"][0]),
            task("Complete 1-2-3 targets once", "Light all three upper-right 1-2-3 standup targets once."),
            task("Light 2 GOLDBALL letters", "Spot any two letters in GOLDBALL from the star rollovers or center standup."),
            task("Move the lit GOLDBALL arrow 4 positions", "Use spinner, lanes, or arrow-advance targets to reposition the lit letter arrow."),
            task("Reach 2X bonus", "Complete the 1-2-3 targets once to advance bonus multiplier to 2X."),
        ],
        "Medium": [
            task("Light 4 GOLDBALL letters", "Spot four total letters toward GOLDBALL."),
            score("Gold Ball", "Medium", SCORES["Gold Ball"][1]),
            task("Reach 3X bonus", "Complete 1-2-3 targets twice on the same ball."),
            task("Collect a 50,000 P-L-A-Y award", "Spell P-L-A-Y for the 50,000-point completion award."),
            task("Score the 100,000 1-2-3 award", "Complete 1-2-3 enough times on one ball to collect the 100,000 award."),
            task("Advance base bonus to 60,000", "Build base bonus to at least 60,000 before the ball drains."),
        ],
        "Hard": [
            task("Complete G-O-L-D-B-A-L-L", "Light all eight GOLDBALL letters to earn the Gold Ball feature."),
            score("Gold Ball", "Hard", SCORES["Gold Ball"][2]),
            task("Play a golden ball", "Complete GOLDBALL and put the golden ball into play."),
            task("Collect a 3X golden-ball bonus", "Drain a golden ball with 3X bonus active to collect the tripled bonus sequence."),
            task("Score two 100,000 1-2-3 awards in one game", "Repeat the upper-right target-bank award cycle for two 100,000 collections."),
            task("Reach 90,000 base bonus", "Build the maximum base bonus before draining."),
        ],
    },
    "City Slicker": {
        "Easy": [
            task("Spot 5 City Slicker letters", "Use orbit shots, side banks, or upper playfield completions to spot five letters."),
            score("City Slicker", "Easy", SCORES["City Slicker"][0]),
            task("Increase an orbit value to 3 letters", "Make repeated orbit shots until either orbit is spotting three letters."),
            task("Complete one lower 3-bank", "Unlight all lit targets in one lower side target bank."),
            task("Collect a 25,000 top saucer award", "Press at least one orange dollar button and shoot the top saucer."),
            task("Shoot the center saucer once", "Land the ball in the center saucer and survive the auto-flip return."),
        ],
        "Medium": [
            task("Complete City Slicker", "Collect all letters in CITY SLICKER once."),
            score("City Slicker", "Medium", SCORES["City Slicker"][1]),
            task("Qualify Uptown", "Spell CITY SLICKER or light the four orange dollar buttons to qualify Uptown."),
            task("Start Uptown at the top saucer", "With Uptown qualified, shoot the top saucer to begin the round and lock a ball."),
            task("Collect a center saucer bonus", "Shoot the center saucer three times to collect the current letter bonus."),
            task("Start 2-ball multiball", "Start Uptown from the top saucer and validate the second ball to begin multiball."),
        ],
        "Hard": [
            task("Collect an Uptown Award", "During Uptown, hit the flashing targets until all six white dollar symbols are collected."),
            score("City Slicker", "Hard", SCORES["City Slicker"][2]),
            task("Complete City Slicker twice in one game", "Finish a second CITY SLICKER spelling before game over."),
            task("Collect two center saucer bonuses in one game", "Earn two separate every-third-center-saucer bonus collects."),
            task("Score a 330,000+ letter bonus", "Build stored CITY SLICKER bonus to 330,000 or more."),
            task("Start Uptown and multiball twice", "Qualify and start the top-saucer Uptown lock sequence twice in one game."),
        ],
    },
}


PIXEL_TASKS = {
    "Super Mario Bros.": [
        ("Spell S-U-P-E-R once", "Light the Key", "Start any bonus round", "Shoot the castle once", "Light 1-2-3-4 for multiball"),
        ("Start multiball", "Destroy 1 castle", "Complete one bonus round", "Collect a castle jackpot", "Complete video mode"),
        ("Start 3-ball multiball", "Destroy 2 castles in one game", "Complete 2 bonus rounds in one game", "Collect three castle jackpots", "Complete video mode for 30,000,000"),
    ],
    "Street Fighter II": [
        ("Defeat 1 opponent", "Light a multiball start", "Collect a car-crash award", "Spell T-O-R-P-E-D-O once", "Collect a 10,000,000+ hurry-up or mode award"),
        ("Start 2-ball multiball", "Defeat 3 opponents", "Spell TORPEDO completely", "Collect a multiball jackpot", "Collect two mystery awards"),
        ("Defeat 6 opponents", "Collect 3 multiball jackpots", "Start both multiballs in one game", "Collect a Super Jackpot", "Score 100,000,000+ in TORPEDO Multiball"),
    ],
    "Q*bert's Quest": [
        ("Add 1 Qube to the pyramid", "Complete one 2-target drop bank", "Stop 1 villain", "Make a 3-rollunder loop sequence", "Score the top rollover pyramid award"),
        ("Complete 1 pyramid", "Stop all 3 villains once", "Add 3 Qubes in one ball", "Complete both drop banks", "Collect a 100,000+ end-of-ball bonus"),
        ("Complete 2 pyramids", "Complete 3 pyramids", "Light extra ball from villain lamps", "Collect a 200,000+ end-of-ball bonus", "Stop 5 villains in one game"),
    ],
    "Mr. & Mrs. Pac-Man": [
        ("Collect 5 Pac-Maze moves", "Enter the Pac-Maze", "Complete one drop target bank", "Collect a saucer award", "Light one Pac-Man grid row or column"),
        ("Complete 1 Pac-Maze", "Enter Aggressive mode", "Collect 10 Pac-Maze moves", "Complete two target banks", "Score a completed-maze end bonus"),
        ("Complete 2 Pac-Mazes", "Complete a Pac-Maze in Aggressive mode", "Collect 20 Pac-Maze moves", "Complete 3 target banks in one game", "Score 250,000+ maze bonus"),
    ],
    "Space Invaders": [
        ("Light the right spinner", "Hit the captive ball 3 times", "Complete the three top blue invaders", "Knock down the right-side drop target", "Collect a 50,000 right-side drop award"),
        ("Max the captive-ball value", "Complete all five blue invaders", "Collect bonus through the right-side gap", "Reach 3X bonus multiplier", "Collect the Clone Chamber value"),
        ("Collect bonus at 3X or better", "Collect a 50,000 Clone Chamber value", "Reach 5X bonus multiplier", "Light both return-lane extra balls", "Score a 300,000+ bonus collect"),
    ],
}

EXPLAIN = {
    "Super Mario Bros.": "Use castle, shell/key, numbered multiball, and bonus-round progress. These are table-specific Super Mario Bros. objectives.",
    "Street Fighter II": "Use opponent battles, multiballs, car/prize awards, and TORPEDO progress. Ultra-long final challenge routes are intentionally excluded.",
    "Q*bert's Quest": "Use Qube, pyramid, villain, drop-bank, and figure-eight loop progress.",
    "Mr. & Mrs. Pac-Man": "Use Pac-Maze moves, saucers, grid/drop-target progress, and maze completions.",
    "Space Invaders": "Use spinner, captive ball, blue invaders, bonus collect, and clone chamber progress.",
}

for table, groups in PIXEL_TASKS.items():
    easy, medium, hard = groups
    vals = SCORES[table]
    POOLS[table] = {}
    for diff, titles, val in [("Easy", easy, vals[0]), ("Medium", medium, vals[1]), ("Hard", hard, vals[2])]:
        entries = [task(t, EXPLAIN[table]) for t in titles]
        entries.insert(1, score(table, diff, val))
        POOLS[table][diff] = entries


def upsert_locations() -> None:
    locations = load_json(DATA / "locations.json")
    existing = {str(entry.get("name")) for entry in locations if isinstance(entry, dict)}
    for table, vals in SCORES.items():
        cat = key(table)
        for diff, ball, region, val in [
            ("Easy", 1, "Ball 1 Sphere", vals[0]),
            ("Medium", 2, "Ball 2 Sphere", vals[1]),
            ("Hard", 3, "Ball 3 Sphere", vals[2]),
        ]:
            for entry in [
                {
                    "name": f"{table} - {diff} Task",
                    "region": region,
                    "category": [cat, "Generic", diff],
                    "requires": f"|Progressive Ball - {table}:{ball}|",
                },
                {
                    "name": f"{table} - {diff} Score ({val}+)",
                    "region": region,
                    "category": [cat, "Generic", diff, "Score"],
                    "requires": f"|Progressive Ball - {table}:{ball}|",
                },
            ]:
                if entry["name"] not in existing:
                    locations.append(entry)
                    existing.add(entry["name"])
    write_json(DATA / "locations.json", locations)


def upsert_items() -> None:
    items = load_json(DATA / "items.json")
    existing = {str(entry.get("name")) for entry in items if isinstance(entry, dict)}
    for table in SCORES:
        name = f"Progressive Ball - {table}"
        if name in existing:
            continue
        items.append({
            "count": "3",
            "name": name,
            "category": ["Progression", "Ball", key(table)],
            "progression": True,
        })
    items.sort(key=lambda entry: str(entry.get("name", "")))
    write_json(DATA / "items.json", items)


def upsert_table_pool() -> None:
    data = load_json(DATA / "table_pool.json")
    tables = data.setdefault("tables", [])
    by_code = {str(entry.get("code")): entry for entry in tables if isinstance(entry, dict)}
    for code in ["SKATE", "VECT", "GBALL", "CSLICK"]:
        if code in by_code:
            by_code[code]["generation_ready"] = True
            by_code[code]["pool_tier"] = "base"
            by_code[code]["notes"] = "Inside-Out Lanes generation-ready for the 2026-05-12 episode seed."
    if "COMET" in by_code:
        by_code["COMET"]["world_group_keys"] = list(dict.fromkeys([*(by_code["COMET"].get("world_group_keys") or []), "inside_out_lanes"]))
    for code, name in PIXEL_TABLES:
        if code not in by_code:
            tables.append({
                "code": code,
                "name": name,
                "generation_ready": True,
                "pool_tier": "base",
                "group_key": "pixel_quest",
                "group_label": "Pixel Quest",
                "notes": "Pixel Quest generation-ready for the 2026-05-12 episode seed.",
                "world_group_keys": ["pixel_quest"],
            })
        else:
            by_code[code].update({
                "name": name,
                "generation_ready": True,
                "pool_tier": "base",
                "group_key": "pixel_quest",
                "group_label": "Pixel Quest",
            })
    groups = data.setdefault("world_groups", [])
    by_group = {str(entry.get("key")): entry for entry in groups if isinstance(entry, dict)}
    for group_key, label, codes in [
        ("inside_out_lanes", "Inside-Out Lanes", ["SKATE", "COMET", "VECT", "GBALL", "CSLICK"]),
        ("pixel_quest", "Pixel Quest", [code for code, _name in PIXEL_TABLES]),
    ]:
        if group_key not in by_group:
            groups.append({"key": group_key, "label": label, "generation_ready": True, "table_codes": codes})
        else:
            by_group[group_key].update({"label": label, "generation_ready": True, "table_codes": codes})
            by_group[group_key].pop("notes", None)
    write_json(DATA / "table_pool.json", data)


def upsert_generic_pools() -> None:
    pools = load_json(DATA / "generic_check_pools.json")
    pools.update(POOLS)
    write_json(DATA / "generic_check_pools.json", pools)


def install_hard_task_guard() -> None:
    text = HOOK.read_text(encoding="utf-8")
    if "HARD_TASK_FORBIDDEN_OBJECTIVE_RE" in text:
        return
    text = text.replace(
        'METASIZER_GROUP_SELECTION_SPLIT_RE = re.compile(r"[\\r\\n,|]+")\n',
        'METASIZER_GROUP_SELECTION_SPLIT_RE = re.compile(r"[\\r\\n,|]+")\n'
        'HARD_TASK_FORBIDDEN_OBJECTIVE_RE = re.compile(\n'
        '    r"\\b(?:start|begin|qualify|reach|complete|play|light)\\b.*\\b(?:wizard\\s*mode|wizard|grand\\s*finale|join\\s*the\\s*cirqus|battle\\s*for\\s*the\\s*kingdom|final\\s*battle|final\\s*frontier|champion\\s*challenge)\\b",\n'
        '    re.IGNORECASE,\n'
        ')\n',
    )
    text = text.replace(
        "def _extract_generic_task_location(location_name: str) -> tuple[str, str] | None:\n",
        "def _generic_task_allowed_for_difficulty(pick: dict[str, Any], difficulty: str) -> bool:\n"
        "    if str(difficulty or \"\").strip().title() != \"Hard\":\n"
        "        return True\n"
        "    text = \" \".join(\n"
        "        str(pick.get(field, \"\") or \"\")\n"
        "        for field in (\"title\", \"source_location\", \"explanation\")\n"
        "    )\n"
        "    return HARD_TASK_FORBIDDEN_OBJECTIVE_RE.search(text) is None\n\n\n"
        "def _extract_generic_task_location(location_name: str) -> tuple[str, str] | None:\n",
    )
    text = text.replace(
        '            task_entries = [entry for entry in pool if str(entry.get("type", "")).strip().lower() != "score"]\n',
        '            task_entries = [\n'
        '                entry\n'
        '                for entry in pool\n'
        '                if str(entry.get("type", "")).strip().lower() != "score"\n'
        '                and _generic_task_allowed_for_difficulty(entry, difficulty)\n'
        '            ]\n',
    )
    HOOK.write_text(text, encoding="utf-8")


def sync_assets_and_overlay_refs() -> None:
    (REPO / "WorldsBanners" / "BestiaryFlyers").mkdir(parents=True, exist_ok=True)
    (ROOT / "WorldsBanners" / "BestiaryFlyers").mkdir(parents=True, exist_ok=True)
    for code in ["SKATE", "VECT", "GBALL", "CSLICK", "SMB", "SF2", "QBERT", "MMPAC", "SINV"]:
        src = REPO / "WorldsBanners" / "BestiaryFlyers" / f"{code}.jpg"
        if src.exists():
            shutil.copy2(src, ROOT / "WorldsBanners" / "BestiaryFlyers" / src.name)
    pixel_src = ROOT / "WorldsBanners" / "PixelQuest.png"
    if pixel_src.exists():
        shutil.copy2(pixel_src, REPO / "WorldsBanners" / "PixelQuest.png")
    for html_path in [
        REPO / "flippermizer_overlay_tower_v3.html",
        REPO / "flippermizer_table_repository_library.html",
        ROOT / "flippermizer_overlay_tower_v3.html",
        ROOT / "flippermizer_table_repository_library.html",
    ]:
        if not html_path.exists():
            continue
        html = html_path.read_text(encoding="utf-8")
        html = html.replace("WorldsBanners/PixelQuest.svg", "WorldsBanners/PixelQuest.png")
        if 'pixelquest: "WorldsBanners/PixelQuest.png"' not in html:
            html = html.replace(
                '    inside_out_lanes: "WorldsBanners/InsideOutLanes.png",\n    theshowmustgoon:',
                '    inside_out_lanes: "WorldsBanners/InsideOutLanes.png",\n'
                '    pixelquest: "WorldsBanners/PixelQuest.png",\n'
                '    pixel_quest: "WorldsBanners/PixelQuest.png",\n'
                '    theshowmustgoon:',
            )
        html_path.write_text(html, encoding="utf-8")


def sync_parent_repository_js() -> None:
    source = REPO / "flippermizer_table_repository.js"
    target = ROOT / "flippermizer_table_repository.js"
    if source.exists() and target.exists():
        shutil.copy2(source, target)


def write_docs() -> None:
    doc = ROOT / "VPX" / "new-worlds" / "pixel_quest_guides_and_tasks.md"
    doc.write_text(
        "# Pixel Quest Guides and Tasks\n\n"
        "## Score Ranges\n\n"
        "Thresholds use supplied PinScores rating 2 for Easy, rating 5 for Medium, and rating 8 for Hard.\n\n"
        "| Table | Easy | Medium | Hard |\n"
        "| --- | ---: | ---: | ---: |\n"
        "| Super Mario Bros. | 8,714,604+ | 24,925,689+ | 69,593,091+ |\n"
        "| Street Fighter II | 25,105,590+ | 53,637,398+ | 111,065,152+ |\n"
        "| Q*bert's Quest | 231,844+ | 414,555+ | 731,471+ |\n"
        "| Mr. & Mrs. Pac-Man | 275,395+ | 412,475+ | 636,135+ |\n"
        "| Space Invaders | 58,445+ | 127,825+ | 299,175+ |\n\n"
        "## Task Notes\n\n"
        "Tasks are table-specific, ordered so lock/qualification objectives appear before multiball or high-value collections, "
        "and no Hard task asks for starting a wizard mode. Full task text is staged in "
        "`manual_flippermizerworldsofpinball_base_game/data/generic_check_pools.json`.\n",
        encoding="utf-8",
    )
    for name in ["NEW_WORLD_FLYER_SOURCES.md", "VIDEO_GAME_WORLD.md"]:
        src = REPO / name
        if src.exists():
            shutil.copy2(src, ROOT / name)


def main() -> None:
    upsert_table_pool()
    upsert_locations()
    upsert_items()
    upsert_generic_pools()
    install_hard_task_guard()
    sync_assets_and_overlay_refs()
    sync_parent_repository_js()
    write_docs()
    print("Staged May 12 AP data, assets, and generator guard.")


if __name__ == "__main__":
    main()
