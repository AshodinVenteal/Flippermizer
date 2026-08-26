# Object classes from AP core, to represent an entire MultiWorld and this individual World that's part of it
from worlds.AutoWorld import World
from BaseClasses import MultiWorld, CollectionState, Item

# Object classes from Manual -- extending AP core -- representing items and locations that are used in generation
from ..Items import ManualItem
from ..Locations import (
    ManualLocation,
    location_id_to_name,
    location_name_groups,
    location_name_to_id,
    location_name_to_location,
)

# Raw JSON data from the Manual apworld, respectively:
#          data/game.json, data/items.json, data/locations.json, data/regions.json
#
from ..Data import game_table, item_table, location_table, region_table

# These helper methods allow you to determine if an option has been set, or what its value is, for any player in the multiworld
from ..Helpers import is_option_enabled, get_option_value, format_state_prog_items_key, ProgItemsCat, load_data_file, is_item_enabled

# calling logging.info("message") anywhere below in this file will output the message to both console and log file
import logging
import random
import re
from typing import Any

TASK_SHUFFLE_SLOT_KEY = "task_shuffle"
GENERIC_CHECKS_SLOT_KEY = "generic_checks"
PROGRESSIVE_BALL_STARTS_SLOT_KEY = "progressive_ball_starts"
BASE_GAME_TABLE_SET_SLOT_KEY = "base_game_table_set"
LEGACY_METASIZER_TABLE_SET_SLOT_KEY = "metasizer_table_set"
FORCED_EASY_BOSS_KEY_SLOT_KEY = "forced_easy_boss_key_location"
PROGRESSIVE_BALL_ITEM_PREFIX = "Progressive Ball - "
GENERIC_TASK_RE = re.compile(r"^(?P<table>.+?)\s-\s(?P<difficulty>Easy|Medium|Hard)\sTask$", re.IGNORECASE)
DEEP_RUN_TASK_RE = re.compile(r"^(?P<table>.+?)\s-\sDeep Task (?P<index>\d{2})$", re.IGNORECASE)
DEEP_RUN_SCORE_RE = re.compile(r"^(?P<table>.+?)\s-\sDeep Score (?P<index>\d{2})(?:\s+\((?P<score>[\d,]+)\+\))?$", re.IGNORECASE)
BASE_GAME_SEED_TYPE_SLOT_KEY = "base_game_seed_type"
BASE_GAME_FEATURE_UNLOCK_SLOT_KEY = "base_game_feature_unlock_enabled"
BASE_GAME_SEED_TYPE_STANDARD = "standard"
BASE_GAME_SEED_TYPE_DEEP_RUN = "deep_run"
FEATURE_KEY_ITEM_PREFIX = "Feature Key - "
FEATURE_KEY_PIECES_REQUIRED = 3
DEEP_RUN_BOSS_KEYS_REQUIRED = 4
DEEP_RUN_BOSS_KEYS_SEEDED = 10
DEEP_RUN_DEFAULT_ACTIVE_TABLE_COUNT = 20
DEEP_RUN_DEFAULT_START_OPEN_COUNT = 5
DEEP_RUN_15_TABLE_ACTIVE_COUNT = 15
DEEP_RUN_15_TABLE_START_OPEN_COUNT = 3
DEEP_RUN_LOCK_TIER_SEQUENCE = (1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 4, 4)
DEEP_RUN_TASKS_PER_TABLE = 10
DEEP_RUN_SCORE_CHECKS_PER_TABLE = 10
DEEP_RUN_GENERATED_TASK_TEMPLATES: dict[str, tuple[tuple[str, str], ...]] = {
    "Easy": (
        ("Make 3 clean major shots", "On {table}, make 3 clean shots to major lanes, ramps, or orbits in one game."),
        ("Collect any lit award", "On {table}, light and collect any award, mystery, hurry-up, mode award, or feature award in one game."),
        ("Start any non-multiball table feature", "On {table}, start any named mode, timed feature, lane feature, or playfield feature that is not a multiball."),
        ("Advance bonus or lane progress", "On {table}, advance bonus, a multiplier, lane progress, target progress, or another non-multiball table feature at least once."),
    ),
    "Medium": (
        ("Make 5 clean major shots in one game", "On {table}, make 5 clean shots to major lanes, ramps, or orbits before the game ends."),
        ("Collect 3 lit awards in one game", "On {table}, collect 3 lit awards, mystery awards, hurry-ups, mode awards, or feature awards in one game."),
        ("Start any multiball or main mode", "On {table}, start a multiball, wizard-path mode, main mode, or the closest table-specific major feature."),
        ("Complete 2 different table features", "On {table}, complete or cash out 2 different modes, awards, ramps, locks, lane groups, or other table-specific features in one game."),
    ),
    "Hard": (
        ("Complete 3 different table features in one game", "On {table}, complete or cash out 3 different modes, awards, ramps, locks, lane groups, or other table-specific features in one game."),
        ("Start a major feature and collect 2 awards", "On {table}, start any multiball, main mode, or major table feature, then collect 2 additional lit awards before the game ends."),
    ),
}
METASIZER_SELECTION_MODES = {
    0: "random_catalog_pool",
    1: "curated_catalog_groups",
    2: "hybrid_curated_random_fill",
    3: "curated_table_list",
}
METASIZER_DEFAULT_SELECTION_MODE = "random_catalog_pool"
METASIZER_GROUP_SELECTION_SPLIT_RE = re.compile(r"[\r\n,|]+")
METASIZER_TABLE_SELECTION_SPLIT_RE = re.compile(r"[\r\n,|]+")
METASIZER_CUSTOM_WORLD_LINE_SPLIT_RE = re.compile(r"[\r\n]+")
METASIZER_CUSTOM_WORLD_TABLE_SPLIT_RE = re.compile(r"\s*(?:\||;)\s*")
METASIZER_CURATED_THEME_RULES = {
    "cosmic": {
        "needles": ("star", "space", "mars", "trek", "stargate", "starship", "independence", "x-files", "mandalorian", "alien", "orbit"),
        "adjectives": ("Neon", "Astral", "Orbital", "Galactic"),
        "nouns": ("Signal", "Orbit", "Frontier", "Launch"),
        "palette": {"from": "#05173b", "mid": "#102b78", "to": "#00d9ff", "accent": "#b9f6ff"},
    },
    "monsters": {
        "needles": ("monster", "creature", "crypt", "dracula", "freddy", "elvira", "scared", "ghost", "haunted", "hulk"),
        "adjectives": ("Midnight", "Haunted", "Moonlit", "Cryptic"),
        "nouns": ("Masquerade", "Manor", "Coven", "Bash"),
        "palette": {"from": "#21051f", "mid": "#61215f", "to": "#ff4d9d", "accent": "#ffd1ec"},
    },
    "music": {
        "needles": ("ac/dc", "aerosmith", "beatles", "elvis", "rolling", "garage band", "parton", "party", "song"),
        "adjectives": ("Backstage", "Amplified", "Encore", "Electric"),
        "nouns": ("Riff", "Stage", "Setlist", "Arena"),
        "palette": {"from": "#321108", "mid": "#a13f12", "to": "#ffd67a", "accent": "#fff0b5"},
    },
    "speed": {
        "needles": ("getaway", "speed", "corvette", "whirlwind", "cyclone", "hurricane", "police", "dirty harry", "no fear", "race"),
        "adjectives": ("Nitro", "Thunder", "Redline", "Velocity"),
        "nouns": ("Run", "Chase", "Storm", "Circuit"),
        "palette": {"from": "#061f26", "mid": "#087a7f", "to": "#22ff88", "accent": "#d8fff0"},
    },
    "magic": {
        "needles": ("magic", "arabian", "mystery", "circus", "cirqus", "wizard", "dungeons", "dragons", "castle"),
        "adjectives": ("Arcane", "Golden", "Moonspell", "Mystic"),
        "nouns": ("Mirage", "Carnival", "Citadel", "Spellbook"),
        "palette": {"from": "#241348", "mid": "#6f42c1", "to": "#ffd67a", "accent": "#f2e6ff"},
    },
    "heroes": {
        "needles": ("batman", "spider", "iron man", "deadpool", "judge", "a-team", "rocky", "hulk", "robocop", "demolition"),
        "adjectives": ("Comic", "Heroic", "Masked", "Impact"),
        "nouns": ("Collision", "Patrol", "Showdown", "Arc"),
        "palette": {"from": "#081a33", "mid": "#0a62c9", "to": "#ff4d6d", "accent": "#e8faff"},
    },
    "casino": {
        "needles": ("poker", "casino", "roller", "who dunnit", "monopoly", "city slicker", "gold ball"),
        "adjectives": ("Jackpot", "Velvet", "High-Roll", "Gilded"),
        "nouns": ("Parlor", "Heist", "House", "Avenue"),
        "palette": {"from": "#071f17", "mid": "#0e7a48", "to": "#ffd67a", "accent": "#fff7cf"},
    },
    "arcade": {
        "needles": ("mario", "street fighter", "q*bert", "pac-man", "space invaders", "video", "game"),
        "adjectives": ("Pixel", "Quarter", "8-Bit", "Cabinet"),
        "nouns": ("Rush", "Arcade", "Combo", "Quest"),
        "palette": {"from": "#07111f", "mid": "#00a6ff", "to": "#22ff88", "accent": "#ffef5a"},
    },
    "classic": {
        "needles": ("fathom", "meteor", "paragon", "taxi", "bad cats", "jokerz", "skateball", "vector", "genesis"),
        "adjectives": ("Chrome", "Vintage", "Silver", "Retro"),
        "nouns": ("Alley", "Arc", "Vault", "Loop"),
        "palette": {"from": "#07121f", "mid": "#23445c", "to": "#e8faff", "accent": "#00d9ff"},
    },
}
HARD_TASK_FORBIDDEN_OBJECTIVE_RE = re.compile(
    r"\b(?:start|begin|qualify|reach|complete|play|light)\b.*\b(?:wizard\s*mode|wizard|grand\s*finale|join\s*the\s*cirqus|battle\s*for\s*the\s*kingdom|final\s*battle|final\s*frontier|champion\s*challenge)\b",
    re.IGNORECASE,
)
BOSS_TABLE_TASK_LOCATION_NAMES = [
    "Boss Table - Rip a Spinner",
    "Boss Table - Make a 2-Shot Combo",
    "Boss Table - Make a 3-Shot Combo",
    "Boss Table - Shoot Left Orbit/Loop/Lane",
    "Boss Table - Shoot Right Orbit/Loop/Lane",
    "Boss Table - Shoot Any Ramp",
    "Boss Table - Hit Any Scoop or Saucer",
    "Boss Table - Complete Top Lanes",
    "Boss Table - Complete a Target Bank",
    "Boss Table - Start Any Multiball",
]
BOSS_TABLE_SCORE_LOCATION_NAMES = [
    "Boss Table - Obtain a score of 100,000+",
    "Boss Table - Obtain a score of 250,000+",
    "Boss Table - Obtain a score of 500,000+",
    "Boss Table - Obtain a score of 1,000,000+",
    "Boss Table - Obtain a score of 2,500,000+",
    "Boss Table - Obtain a score of 5,000,000+",
    "Boss Table - Obtain a score of 10,000,000+",
    "Boss Table - Obtain a score of 25,000,000+",
    "Boss Table - Obtain a score of 50,000,000+",
    "Boss Table - Obtain a score of 100,000,000+",
]


def _get_ut_regen_slot_data(world: World) -> dict[str, Any]:
    direct_slot_data = getattr(world, "_flpr_ut_slot_data", None)
    if isinstance(direct_slot_data, dict):
        return direct_slot_data

    multiworld = getattr(world, "multiworld", None)
    passthrough = getattr(multiworld, "re_gen_passthrough", None)
    if not isinstance(passthrough, dict):
        return {}

    game_key = str(getattr(world, "game", "") or "").strip()
    if game_key and isinstance(passthrough.get(game_key), dict):
        slot_data = passthrough[game_key]
        setattr(world, "_flpr_ut_slot_data", dict(slot_data))
        return slot_data

    for slot_data in passthrough.values():
        if isinstance(slot_data, dict) and (
            BASE_GAME_TABLE_SET_SLOT_KEY in slot_data
            or LEGACY_METASIZER_TABLE_SET_SLOT_KEY in slot_data
            or GENERIC_CHECKS_SLOT_KEY in slot_data
            or TASK_SHUFFLE_SLOT_KEY in slot_data
        ):
            setattr(world, "_flpr_ut_slot_data", dict(slot_data))
            return slot_data

    return {}


def _get_ut_slot_payload(world: World, key: str) -> dict[str, Any] | None:
    payload = _get_ut_regen_slot_data(world).get(key)
    if isinstance(payload, dict):
        return dict(payload)
    return None


def _location_categories(location: dict[str, Any]) -> list[str]:
    categories = location.get("category", [])
    if isinstance(categories, list):
        return [str(c) for c in categories]
    if categories is None:
        return []
    return [str(categories)]


def _has_category(location: dict[str, Any], category: str) -> bool:
    return category in _location_categories(location)


def _task_difficulty(location: dict[str, Any]) -> str | None:
    for difficulty in ("Easy", "Medium", "Hard"):
        if _has_category(location, difficulty):
            return difficulty
    return None


def _is_task_shuffle_candidate(location: dict[str, Any]) -> bool:
    if _has_category(location, "DeepRun"):
        return False
    location_name = str(location.get("name", "")).strip()
    parsed = _extract_generic_task_location(location_name)
    if parsed is not None:
        return True
    if not _has_category(location, "Task"):
        return False
    if _has_category(location, "Score"):
        return False
    if _has_category(location, "Boss"):
        return False
    return True


def _split_table_and_objective(location_name: str) -> tuple[str, str]:
    # Split once at the first " - " or unicode en-dash separator.
    parts = re.split(r"\s+[\u2013-]\s+", location_name, maxsplit=1)
    if len(parts) == 2:
        return parts[0].strip(), parts[1].strip()
    return location_name.strip(), location_name.strip()


def _get_progressive_ball_start_payload(world: World) -> list[dict[str, Any]]:
    start_inventory = getattr(world, "start_inventory", {}) or {}
    payload: list[dict[str, Any]] = []
    for item_name, count in start_inventory.items():
        if not isinstance(item_name, str) or not item_name.startswith(PROGRESSIVE_BALL_ITEM_PREFIX):
            continue
        if int(count or 0) <= 0:
            continue
        table_name = _extract_metasizer_progressive_ball_table_name(item_name)
        if not table_name:
            table_name = item_name.replace(PROGRESSIVE_BALL_ITEM_PREFIX, "", 1).strip()
        payload.append({
            "item": item_name,
            "table": table_name,
            "count": int(count),
        })
    payload.sort(key=lambda entry: str(entry.get("table", "")))
    return payload


def _load_metasizer_table_pool() -> dict[str, Any]:
    cached = globals().get("_METASIZER_TABLE_POOL_CACHE")
    if isinstance(cached, dict):
        return cached
    try:
        data = load_data_file("table_pool.json")
    except Exception as exc:
        logging.warning("Base Game: failed to load table_pool.json: %s", exc)
        data = {}
    if not isinstance(data, dict):
        data = {}
    globals()["_METASIZER_TABLE_POOL_CACHE"] = data
    return data


def _metasizer_table_entries() -> list[dict[str, Any]]:
    data = _load_metasizer_table_pool()
    tables = data.get("tables", [])
    out: list[dict[str, Any]] = []
    seen: set[str] = set()
    if not isinstance(tables, list):
        return out
    for idx, raw in enumerate(tables):
        if isinstance(raw, dict):
            name = str(raw.get("name") or raw.get("title") or "").strip()
            code = str(raw.get("code") or "").strip()
            generation_ready = bool(raw.get("generation_ready", raw.get("implemented", True)))
            pool_tier = str(raw.get("pool_tier") or ("base" if generation_ready else "candidate")).strip() or ("base" if generation_ready else "candidate")
            notes = str(raw.get("notes") or "").strip()
            group_key = str(raw.get("group_key") or raw.get("bestiary_group") or "misc").strip() or "misc"
            group_label = str(raw.get("group_label") or raw.get("bestiary_group_label") or group_key.replace("_", " ").title()).strip() or group_key.replace("_", " ").title()
        else:
            name = str(raw or "").strip()
            code = ""
            generation_ready = True
            pool_tier = "base"
            notes = ""
            group_key = "misc"
            group_label = "Misc"
        if not name or name in seen:
            continue
        seen.add(name)
        out.append({
            "order": idx + 1,
            "name": name,
            "code": code,
            "generation_ready": generation_ready,
            "pool_tier": pool_tier,
            "group_key": group_key,
            "group_label": group_label,
            "world_group_keys": [str(key or "").strip() for key in (raw.get("world_group_keys") or []) if str(key or "").strip()] if isinstance(raw, dict) else [],
            "guide_key": code.lower() if code else re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_"),
            "flyer_code": code,
            "notes": notes,
        })
    return out


def _metasizer_table_pool_names() -> list[str]:
    return [str(entry.get("name") or "").strip() for entry in _metasizer_table_entries() if str(entry.get("name") or "").strip()]


def _metasizer_table_pool_name_lookup() -> dict[str, str]:
    return {
        _metasizer_normalize_lookup_key(name): name
        for name in _metasizer_table_pool_names()
        if str(name or "").strip()
    }


def _canonical_metasizer_table_name(value: str) -> str | None:
    table_name = str(value or "").strip()
    if not table_name:
        return None
    if table_name in _metasizer_table_pool_names():
        return table_name
    return _metasizer_table_pool_name_lookup().get(_metasizer_normalize_lookup_key(table_name))


def _progressive_ball_item_name_lookup(world: World | None = None) -> dict[str, str]:
    names: list[str] = []
    item_name_to_item = getattr(world, "item_name_to_item", None) if world is not None else None
    if isinstance(item_name_to_item, dict):
        names = [str(name or "").strip() for name in item_name_to_item.keys()]
    if not names:
        try:
            names = [
                str(item.get("name") or "").strip()
                for item in load_data_file("items.json")
                if isinstance(item, dict)
            ]
        except Exception:
            names = []
    lookup: dict[str, str] = {}
    for item_name in names:
        if not item_name.startswith(PROGRESSIVE_BALL_ITEM_PREFIX):
            continue
        raw_table_name = item_name[len(PROGRESSIVE_BALL_ITEM_PREFIX):].strip()
        canonical_table_name = _canonical_metasizer_table_name(raw_table_name) or raw_table_name
        lookup.setdefault(_metasizer_normalize_lookup_key(canonical_table_name), item_name)
    return lookup


def _progressive_ball_item_name_for_table(table_name: str, world: World | None = None) -> str:
    canonical_table_name = _canonical_metasizer_table_name(table_name) or str(table_name or "").strip()
    item_name = _progressive_ball_item_name_lookup(world).get(_metasizer_normalize_lookup_key(canonical_table_name))
    if item_name:
        return item_name
    return f"{PROGRESSIVE_BALL_ITEM_PREFIX}{canonical_table_name}"


def _metasizer_table_generation_data_status(table_name: str) -> dict[str, Any]:
    table_name = str(table_name or "").strip()
    missing: list[str] = []
    if not table_name:
        return {"complete": False, "missing": ["table name"]}

    location_names = {
        str(location.get("name") or "").strip()
        for location in location_table
        if isinstance(location, dict) and str(location.get("name") or "").strip()
    }
    for difficulty in ("Easy", "Medium", "Hard"):
        task_name = f"{table_name} - {difficulty} Task"
        score_prefix = f"{table_name} - {difficulty} Score"
        if task_name not in location_names:
            missing.append(f"{difficulty} task location")
        if not any(name.startswith(score_prefix) for name in location_names):
            missing.append(f"{difficulty} score location")

    pools = _load_generic_check_pools()
    table_pool = pools.get(table_name) if isinstance(pools, dict) else None
    if not isinstance(table_pool, dict):
        missing.append("generic check pool")
    else:
        for difficulty in ("Easy", "Medium", "Hard"):
            picks = table_pool.get(difficulty)
            if not isinstance(picks, list) or not picks:
                missing.append(f"{difficulty} generic checks")

    return {"complete": not missing, "missing": missing}


def _metasizer_table_has_complete_generation_data(table_name: str) -> bool:
    return bool(_metasizer_table_generation_data_status(table_name).get("complete"))


def _metasizer_generation_ready_table_entries() -> list[dict[str, Any]]:
    return [
        dict(entry)
        for entry in _metasizer_table_entries()
        if bool(entry.get("generation_ready"))
        and str(entry.get("name") or "").strip()
        and _metasizer_table_has_complete_generation_data(str(entry.get("name") or "").strip())
    ]


def _metasizer_generation_ready_table_names() -> list[str]:
    return [
        str(entry.get("name") or "").strip()
        for entry in _metasizer_table_entries()
        if bool(entry.get("generation_ready"))
        and str(entry.get("name") or "").strip()
        and _metasizer_table_has_complete_generation_data(str(entry.get("name") or "").strip())
    ]


def _metasizer_table_entry_lookup(table_entries: list[dict[str, Any]]) -> tuple[dict[str, dict[str, Any]], dict[str, dict[str, Any]], dict[str, dict[str, Any]], dict[str, dict[str, Any]]]:
    by_code: dict[str, dict[str, Any]] = {}
    by_name: dict[str, dict[str, Any]] = {}
    by_code_norm: dict[str, dict[str, Any]] = {}
    by_name_norm: dict[str, dict[str, Any]] = {}
    for entry in table_entries:
        safe = dict(entry)
        code = str(entry.get("code") or "").strip()
        name = str(entry.get("name") or "").strip()
        if code and code not in by_code:
            by_code[code] = safe
            by_code_norm[_metasizer_normalize_lookup_key(code)] = safe
        if name and name not in by_name:
            by_name[name] = safe
            by_name_norm[_metasizer_normalize_lookup_key(name)] = safe
    return by_code, by_name, by_code_norm, by_name_norm


def _metasizer_catalog_groups(table_entries: list[dict[str, Any]]) -> list[dict[str, Any]]:
    data = _load_metasizer_table_pool()
    explicit_groups = data.get("world_groups", [])
    by_code, by_name, by_code_norm, by_name_norm = _metasizer_table_entry_lookup(table_entries)
    groups: dict[str, dict[str, Any]] = {}
    explicit_group_keys: set[str] = set()
    order: list[str] = []

    if isinstance(explicit_groups, list):
        for raw_group in explicit_groups:
            if not isinstance(raw_group, dict):
                continue
            group_key = str(raw_group.get("key") or "").strip()
            if not group_key or group_key in groups:
                continue
            group_label = str(raw_group.get("label") or group_key.replace("_", " ").title()).strip() or group_key.replace("_", " ").title()
            refs = raw_group.get("table_codes")
            if not isinstance(refs, list):
                refs = raw_group.get("tables")
            if not isinstance(refs, list):
                refs = raw_group.get("table_names")
            resolved_entries: list[dict[str, Any]] = []
            unresolved_refs: list[str] = []
            seen_names: set[str] = set()
            if isinstance(refs, list):
                for ref in refs:
                    token = ""
                    if isinstance(ref, dict):
                        token = str(ref.get("code") or ref.get("name") or "").strip()
                    else:
                        token = str(ref or "").strip()
                    if not token:
                        continue
                    match = (
                        by_code.get(token)
                        or by_name.get(token)
                        or by_code_norm.get(_metasizer_normalize_lookup_key(token))
                        or by_name_norm.get(_metasizer_normalize_lookup_key(token))
                    )
                    if not match:
                        unresolved_refs.append(token)
                        continue
                    match_name = str(match.get("name") or "").strip()
                    if not match_name or match_name in seen_names:
                        continue
                    seen_names.add(match_name)
                    resolved_entries.append(dict(match))
            generation_ready_override = raw_group.get("generation_ready")
            generation_ready = bool(generation_ready_override) if generation_ready_override is not None else (
                len(resolved_entries) == 5 and all(bool(entry.get("generation_ready")) for entry in resolved_entries)
            )
            generation_data_missing: list[dict[str, Any]] = []
            for entry in resolved_entries:
                table_name = str(entry.get("name") or "").strip()
                status = _metasizer_table_generation_data_status(table_name)
                if not bool(status.get("complete")):
                    generation_data_missing.append({
                        "table": table_name,
                        "missing": list(status.get("missing") or []),
                    })
            generation_data_ready = len(resolved_entries) == 5 and not unresolved_refs and not generation_data_missing
            generation_ready = generation_ready and generation_data_ready
            groups[group_key] = {
                "key": group_key,
                "label": group_label,
                "table_names": [str(entry.get("name") or "").strip() for entry in resolved_entries if str(entry.get("name") or "").strip()],
                "table_codes": [str(entry.get("code") or "").strip() for entry in resolved_entries if str(entry.get("code") or "").strip()],
                "generation_ready_count": sum(1 for entry in resolved_entries if bool(entry.get("generation_ready"))),
                "candidate_count": sum(1 for entry in resolved_entries if not bool(entry.get("generation_ready"))),
                "generation_ready": generation_ready,
                "generation_data_ready": generation_data_ready,
                "missing_generation_data": generation_data_missing,
                "entries": [dict(entry) for entry in resolved_entries],
                "explicit": True,
                "unresolved_refs": unresolved_refs,
            }
            explicit_group_keys.add(group_key)
            order.append(group_key)

    for entry in table_entries:
        name = str(entry.get("name") or "").strip()
        if not name:
            continue
        group_key = str(entry.get("group_key") or "misc").strip() or "misc"
        group_label = str(entry.get("group_label") or group_key.replace("_", " ").title()).strip() or group_key.replace("_", " ").title()
        if group_key in explicit_group_keys:
            # Explicit reusable world definitions are authoritative for that key.
            continue
        if group_key not in groups:
            groups[group_key] = {
                "key": group_key,
                "label": group_label,
                "table_names": [],
                "table_codes": [],
                "generation_ready_count": 0,
                "candidate_count": 0,
                "generation_ready": True,
                "entries": [],
                "explicit": False,
                "unresolved_refs": [],
            }
            order.append(group_key)
        groups[group_key]["table_names"].append(name)
        code = str(entry.get("code") or "").strip()
        if code:
            groups[group_key]["table_codes"].append(code)
        if bool(entry.get("generation_ready")):
            groups[group_key]["generation_ready_count"] += 1
        else:
            groups[group_key]["candidate_count"] += 1
            groups[group_key]["generation_ready"] = False
        groups[group_key]["entries"].append(dict(entry))
    for key in order:
        group = groups[key]
        generation_data_missing: list[dict[str, Any]] = []
        for entry in group.get("entries", []) or []:
            if not isinstance(entry, dict):
                continue
            table_name = str(entry.get("name") or "").strip()
            status = _metasizer_table_generation_data_status(table_name)
            if not bool(status.get("complete")):
                generation_data_missing.append({
                    "table": table_name,
                    "missing": list(status.get("missing") or []),
                })
        generation_data_ready = len(group.get("table_names", [])) == 5 and not group.get("unresolved_refs") and not generation_data_missing
        group["generation_data_ready"] = generation_data_ready
        group["missing_generation_data"] = generation_data_missing
        if not bool(group.get("explicit")):
            group["generation_ready"] = len(group.get("table_names", [])) == 5 and not int(group.get("candidate_count") or 0)
        group["generation_ready"] = bool(group.get("generation_ready")) and generation_data_ready
    return [groups[key] for key in order]


def _metasizer_group_lookup(table_entries: list[dict[str, Any]], catalog_groups: list[dict[str, Any]]) -> dict[str, str]:
    lookup: dict[str, str] = {}

    def remember(token: str, group_key: str) -> None:
        key = _metasizer_normalize_lookup_key(token)
        if key and key not in lookup and group_key:
            lookup[key] = group_key

    for group in catalog_groups:
        group_key = str(group.get("key") or "").strip()
        if not group_key:
            continue
        remember(group_key, group_key)
        remember(str(group.get("label") or ""), group_key)
        for table_name in group.get("table_names", []) or []:
            remember(str(table_name or ""), group_key)
        for table_code in group.get("table_codes", []) or []:
            remember(str(table_code or ""), group_key)

    for entry in table_entries:
        group_key = str(entry.get("group_key") or "misc").strip() or "misc"
        remember(str(entry.get("name") or ""), group_key)
        remember(str(entry.get("code") or ""), group_key)

    return lookup


def _metasizer_featured_designer_group_keys(catalog_groups: list[dict[str, Any]]) -> set[str]:
    out: set[str] = set()
    for group in catalog_groups:
        group_key = str(group.get("key") or "").strip()
        group_label = str(group.get("label") or "").strip().lower()
        if not group_key:
            continue
        if group_label.startswith("featured designer;"):
            out.add(group_key)
    return out


def _metasizer_fill_group_keys(
    available_group_keys: list[str],
    desired_fill_count: int,
    rng: random.Random,
    featured_group_keys: set[str] | None = None,
    featured_cap: int | None = None,
    existing_selected_keys: list[str] | None = None,
) -> tuple[list[str], int]:
    if desired_fill_count <= 0 or not available_group_keys:
        return [], 0
    pool = list(available_group_keys)
    rng.shuffle(pool)
    featured_group_keys = set(featured_group_keys or set())
    featured_seen = 0
    if existing_selected_keys:
        for key in existing_selected_keys:
            if key in featured_group_keys:
                featured_seen += 1
    selected: list[str] = []
    skipped_for_cap = 0
    for key in pool:
        if featured_cap is not None and key in featured_group_keys and featured_seen >= featured_cap:
            skipped_for_cap += 1
            continue
        selected.append(key)
        if key in featured_group_keys:
            featured_seen += 1
        if len(selected) >= desired_fill_count:
            break
    return selected, skipped_for_cap


def _metasizer_group_table_names(group: dict[str, Any] | None) -> list[str]:
    if not isinstance(group, dict):
        return []
    out: list[str] = []
    seen: set[str] = set()
    for raw_name in group.get("table_names", []) or []:
        name = str(raw_name or "").strip()
        if not name or name in seen:
            continue
        seen.add(name)
        out.append(name)
    return out


def _metasizer_filter_non_overlapping_group_keys(
    group_keys: list[str],
    catalog_group_by_key: dict[str, dict[str, Any]],
    existing_tables: set[str] | None = None,
) -> tuple[list[str], list[dict[str, Any]], set[str]]:
    kept: list[str] = []
    skipped: list[dict[str, Any]] = []
    seen_tables: set[str] = set(existing_tables or set())
    for group_key in group_keys:
        group = catalog_group_by_key.get(group_key) or {}
        group_tables = _metasizer_group_table_names(group)
        overlaps = [name for name in group_tables if name in seen_tables]
        if overlaps:
            skipped.append({
                "key": group_key,
                "label": str(group.get("label") or group_key).strip() or group_key,
                "overlaps": overlaps,
            })
            continue
        kept.append(group_key)
        seen_tables.update(group_tables)
    return kept, skipped, seen_tables


def _metasizer_fill_non_overlapping_group_keys(
    available_group_keys: list[str],
    desired_fill_count: int,
    rng: random.Random,
    catalog_group_by_key: dict[str, dict[str, Any]],
    existing_selected_keys: list[str] | None = None,
    featured_group_keys: set[str] | None = None,
    featured_cap: int | None = None,
) -> tuple[list[str], list[dict[str, Any]], int]:
    selected: list[str] = []
    skipped_overlap: list[dict[str, Any]] = []
    skipped_for_cap_total = 0
    desired_fill_count = max(0, int(desired_fill_count or 0))
    if desired_fill_count <= 0 or not available_group_keys:
        return selected, skipped_overlap, skipped_for_cap_total

    existing_selected_keys = list(existing_selected_keys or [])
    existing_tables: set[str] = set()
    for group_key in existing_selected_keys:
        existing_tables.update(_metasizer_group_table_names(catalog_group_by_key.get(group_key)))

    pool = list(available_group_keys)
    rng.shuffle(pool)
    featured_group_keys = set(featured_group_keys or set())

    for group_key in pool:
        if len(selected) >= desired_fill_count:
            break
        if group_key in selected or group_key in existing_selected_keys:
            continue
        if featured_cap is not None and group_key in featured_group_keys:
            existing_featured_count = sum(1 for key in (existing_selected_keys + selected) if key in featured_group_keys)
            if existing_featured_count >= featured_cap:
                skipped_for_cap_total += 1
                continue
        group = catalog_group_by_key.get(group_key) or {}
        group_tables = _metasizer_group_table_names(group)
        overlaps = [name for name in group_tables if name in existing_tables]
        if overlaps:
            skipped_overlap.append({
                "key": group_key,
                "label": str(group.get("label") or group_key).strip() or group_key,
                "overlaps": overlaps,
            })
            continue
        selected.append(group_key)
        existing_tables.update(group_tables)
    return selected, skipped_overlap, skipped_for_cap_total


def _metasizer_normalize_lookup_key(value: Any) -> str:
    return re.sub(r"[^a-z0-9]+", "", str(value or "").strip().lower())


def _get_base_game_seed_type(multiworld: MultiWorld, player: int) -> str:
    raw = get_option_value(multiworld, player, BASE_GAME_SEED_TYPE_SLOT_KEY)
    if isinstance(raw, str):
        normalized = re.sub(r"[^a-z0-9_]+", "_", raw.strip().lower()).strip("_")
        if normalized in {"deep_run", "deeprun", "deep"}:
            return BASE_GAME_SEED_TYPE_DEEP_RUN
        return BASE_GAME_SEED_TYPE_STANDARD
    try:
        return BASE_GAME_SEED_TYPE_DEEP_RUN if int(raw) == 1 else BASE_GAME_SEED_TYPE_STANDARD
    except (TypeError, ValueError):
        return BASE_GAME_SEED_TYPE_STANDARD


def _is_deep_run_enabled(multiworld: MultiWorld, player: int) -> bool:
    return _get_base_game_seed_type(multiworld, player) == BASE_GAME_SEED_TYPE_DEEP_RUN


def _is_feature_unlock_enabled(multiworld: MultiWorld, player: int) -> bool:
    return _is_deep_run_enabled(multiworld, player) or bool(get_option_value(multiworld, player, BASE_GAME_FEATURE_UNLOCK_SLOT_KEY))


def _load_feature_gate_config() -> dict[str, Any]:
    cached = globals().get("_FEATURE_GATE_CONFIG_CACHE")
    if isinstance(cached, dict):
        return cached
    try:
        data = load_data_file("feature_gates.json")
    except Exception:
        data = {}
    if not isinstance(data, dict):
        data = {}
    globals()["_FEATURE_GATE_CONFIG_CACHE"] = data
    return data


def _feature_key_definitions() -> list[dict[str, Any]]:
    data = _load_feature_gate_config()
    definitions: list[dict[str, Any]] = []
    for raw_entry in data.get("feature_keys", []) or []:
        if not isinstance(raw_entry, dict):
            continue
        gate_id = str(raw_entry.get("id") or "").strip()
        item_name = str(raw_entry.get("item") or "").strip()
        if not gate_id or not item_name:
            continue
        definitions.append({
            "id": gate_id,
            "label": str(raw_entry.get("label") or gate_id.replace("_", " ").title()).strip(),
            "item": item_name,
            "short_label": str(raw_entry.get("short_label") or raw_entry.get("label") or gate_id).strip(),
        })
    if definitions:
        return definitions
    return [
        {"id": "dmd_screen_games", "label": "DMD Screen Games", "item": "Feature Key - DMD Screen Games", "short_label": "DMD"},
        {"id": "upper_playfield_games", "label": "Upper Playfield Games", "item": "Feature Key - Upper Playfield Games", "short_label": "UPPER"},
        {"id": "extra_flipper_games", "label": "Extra Flipper Games", "item": "Feature Key - Extra Flipper Games", "short_label": "FLIPPER"},
        {"id": "spinner_games", "label": "Spinner Games", "item": "Feature Key - Spinner Games", "short_label": "SPIN"},
        {"id": "ramp_games", "label": "Ramp Games", "item": "Feature Key - Ramp Games", "short_label": "RAMP"},
    ]


def _feature_key_definition_by_id() -> dict[str, dict[str, Any]]:
    return {str(defn.get("id") or "").strip(): dict(defn) for defn in _feature_key_definitions() if str(defn.get("id") or "").strip()}


def _feature_key_item_names() -> list[str]:
    return [str(defn.get("item") or "").strip() for defn in _feature_key_definitions() if str(defn.get("item") or "").strip()]


def _feature_gate_ids_for_table(table_name: str) -> list[str]:
    canonical = _canonical_metasizer_table_name(table_name) or str(table_name or "").strip()
    if not canonical:
        return []
    table_gates = _load_feature_gate_config().get("tables", {}) or {}
    raw_gates = table_gates.get(canonical)
    if raw_gates is None:
        raw_gates = table_gates.get(str(table_name or "").strip())
    if not isinstance(raw_gates, list):
        return []
    known = _feature_key_definition_by_id()
    gates: list[str] = []
    for raw_gate in raw_gates:
        gate_id = str(raw_gate or "").strip()
        if gate_id and gate_id in known and gate_id not in gates:
            gates.append(gate_id)
    return gates


def _feature_gate_item_names_for_table(table_name: str) -> list[str]:
    definitions = _feature_key_definition_by_id()
    items: list[str] = []
    for gate_id in _feature_gate_ids_for_table(table_name):
        item_name = str((definitions.get(gate_id) or {}).get("item") or "").strip()
        if item_name and item_name not in items:
            items.append(item_name)
    return items


def _feature_gate_labels_for_table(table_name: str) -> list[str]:
    definitions = _feature_key_definition_by_id()
    labels: list[str] = []
    for gate_id in _feature_gate_ids_for_table(table_name):
        label = str((definitions.get(gate_id) or {}).get("label") or gate_id).strip()
        if label and label not in labels:
            labels.append(label)
    return labels


def _decorate_feature_gate_entries(entries: list[dict[str, Any]]) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    definitions = _feature_key_definition_by_id()
    for raw_entry in entries:
        entry = dict(raw_entry)
        table_name = str(entry.get("name") or "").strip()
        gates = _feature_gate_ids_for_table(table_name)
        entry["feature_gates"] = gates
        entry["feature_gate_labels"] = _feature_gate_labels_for_table(table_name)
        entry["feature_gate_items"] = [
            str((definitions.get(gate_id) or {}).get("item") or "").strip()
            for gate_id in gates
            if str((definitions.get(gate_id) or {}).get("item") or "").strip()
        ]
        out.append(entry)
    return out


def _feature_gate_count_for_table(table_name: str) -> int:
    return len(_feature_gate_ids_for_table(table_name))


def _deep_run_gate_bucket_for_entry(entry: dict[str, Any]) -> int:
    table_name = str(entry.get("name") or "").strip()
    gates = entry.get("feature_gates")
    count = len(gates) if isinstance(gates, list) else _feature_gate_count_for_table(table_name)
    return max(0, min(4, int(count or 0)))


def _deep_run_start_open_count_for_active_count(active_count: int, requested_start_open: int = 0) -> int:
    active_count = max(1, int(active_count or 0))
    requested_start_open = int(requested_start_open or 0)
    if requested_start_open > 0:
        return max(1, min(active_count, requested_start_open))
    if active_count <= DEEP_RUN_15_TABLE_ACTIVE_COUNT:
        return max(1, min(active_count, DEEP_RUN_15_TABLE_START_OPEN_COUNT))
    return max(1, min(active_count, DEEP_RUN_DEFAULT_START_OPEN_COUNT))


def _deep_run_bucket_targets(desired_count: int, requested_start_open: int = 0) -> dict[int, int]:
    desired_count = max(1, int(desired_count or 0))
    starter_count = _deep_run_start_open_count_for_active_count(desired_count, requested_start_open)
    remaining = max(0, desired_count - starter_count)
    targets = {0: starter_count, 1: 0, 2: 0, 3: 0, 4: 0}
    for idx in range(remaining):
        if idx < len(DEEP_RUN_LOCK_TIER_SEQUENCE):
            tier = DEEP_RUN_LOCK_TIER_SEQUENCE[idx]
        else:
            tier = ((idx - len(DEEP_RUN_LOCK_TIER_SEQUENCE)) % 4) + 1
        targets[tier] += 1
    return targets


def _deep_run_feature_gate_labels_for_ids(gate_ids: list[str]) -> list[str]:
    definitions = _feature_key_definition_by_id()
    return [
        str((definitions.get(gate_id) or {}).get("label") or gate_id).strip()
        for gate_id in gate_ids
        if str(gate_id or "").strip()
    ]


def _deep_run_feature_gate_items_for_ids(gate_ids: list[str]) -> list[str]:
    definitions = _feature_key_definition_by_id()
    return [
        str((definitions.get(gate_id) or {}).get("item") or "").strip()
        for gate_id in gate_ids
        if str((definitions.get(gate_id) or {}).get("item") or "").strip()
    ]


def _deep_run_spread_starter_names(
    active_entries: list[dict[str, Any]],
    requested_start_open: int,
    rng: random.Random,
) -> list[str]:
    start_count = _deep_run_start_open_count_for_active_count(len(active_entries), requested_start_open)
    if start_count <= 0:
        return []

    featureless_entries = [
        entry
        for entry in active_entries
        if not _feature_gate_ids_for_table(str(entry.get("name") or "").strip())
    ]
    preferred_names = {str(entry.get("name") or "").strip() for entry in featureless_entries if str(entry.get("name") or "").strip()}
    selected: list[str] = []
    selected_set: set[str] = set()
    group_order: list[str] = []
    for entry in active_entries:
        group_key = str(entry.get("active_group_key") or entry.get("group_key") or "").strip()
        if group_key and group_key not in group_order:
            group_order.append(group_key)

    def choose_from(entries: list[dict[str, Any]]) -> str:
        choices = [
            str(entry.get("name") or "").strip()
            for entry in entries
            if str(entry.get("name") or "").strip() and str(entry.get("name") or "").strip() not in selected_set
        ]
        if not choices:
            return ""
        return str(rng.choice(choices))

    for group_key in group_order:
        if len(selected) >= start_count:
            break
        group_entries = [
            entry
            for entry in active_entries
            if str(entry.get("active_group_key") or entry.get("group_key") or "").strip() == group_key
        ]
        name = choose_from([entry for entry in group_entries if str(entry.get("name") or "").strip() in preferred_names])
        if not name:
            name = choose_from(group_entries)
        if name:
            selected.append(name)
            selected_set.add(name)

    remaining_preferred = [
        entry
        for entry in active_entries
        if str(entry.get("name") or "").strip() in preferred_names
    ]
    while len(selected) < start_count:
        name = choose_from(remaining_preferred)
        if not name:
            name = choose_from(active_entries)
        if not name:
            break
        selected.append(name)
        selected_set.add(name)
    return selected


def _assign_deep_run_feature_lock_profile(
    active_entries: list[dict[str, Any]],
    rng: random.Random,
    requested_start_open: int = 0,
) -> tuple[list[dict[str, Any]], str]:
    if not active_entries:
        return [], ""

    definitions = _feature_key_definitions()
    gate_ids = [str(defn.get("id") or "").strip() for defn in definitions if str(defn.get("id") or "").strip()]
    if not gate_ids:
        return active_entries, "Deep Run Feature Lock profile skipped because no Feature Keys are defined"

    targets = _deep_run_bucket_targets(len(active_entries), requested_start_open)
    start_count = _deep_run_start_open_count_for_active_count(len(active_entries), requested_start_open)
    starter_names = [
        str(entry.get("name") or "").strip()
        for entry in active_entries
        if bool(entry.get("deep_run_starting_open")) and str(entry.get("name") or "").strip()
    ]
    if len(starter_names) < start_count:
        seen_starters = set(starter_names)
        starter_names.extend(
            name
            for name in _deep_run_spread_starter_names(active_entries, requested_start_open, rng)
            if name not in seen_starters
        )
    starter_names = starter_names[:start_count]
    starter_set = set(starter_names)
    locked_entries = [dict(entry) for entry in active_entries if str(entry.get("name") or "").strip() not in starter_set]
    rng.shuffle(locked_entries)

    tier_queue: list[int] = []
    for tier in (1, 2, 3, 4):
        tier_queue.extend([tier] * int(targets.get(tier, 0)))
    while len(tier_queue) < len(locked_entries):
        tier_queue.append(((len(tier_queue) - sum(targets.get(t, 0) for t in (1, 2, 3, 4))) % 4) + 1)

    key_order = list(gate_ids)
    rng.shuffle(key_order)
    while len(key_order) < 5:
        key_order.append(key_order[len(key_order) % len(gate_ids)])
    unlock_a, unlock_b, unlock_c, unlock_d, unlock_e = key_order[:5]
    tier_gate_patterns: dict[int, list[list[str]]] = {
        1: [[unlock_a], [unlock_a], [unlock_b], [unlock_c]],
        2: [[unlock_a, unlock_b], [unlock_a, unlock_c], [unlock_b, unlock_c], [unlock_a, unlock_b]],
        3: [[unlock_a, unlock_b, unlock_d], [unlock_a, unlock_c, unlock_d]],
        4: [[unlock_a, unlock_b, unlock_c, unlock_e], [unlock_b, unlock_c, unlock_d, unlock_e]],
    }
    tier_pattern_indices = {1: 0, 2: 0, 3: 0, 4: 0}
    locked_by_name: dict[str, dict[str, Any]] = {}
    tier_counts = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0}
    for entry, tier in zip(locked_entries, tier_queue):
        tier_count = max(1, min(len(gate_ids), int(tier or 1)))
        patterns = tier_gate_patterns.get(tier_count, [])
        pattern_index = tier_pattern_indices.get(tier_count, 0)
        assigned_gates = list(patterns[pattern_index % len(patterns)]) if patterns else list(rng.sample(gate_ids, tier_count))
        tier_pattern_indices[tier_count] = pattern_index + 1
        assigned_gates = list(dict.fromkeys(assigned_gates))
        if len(assigned_gates) < tier_count:
            assigned_gates.extend(gate_id for gate_id in key_order if gate_id not in assigned_gates)
        assigned_gates = assigned_gates[:tier_count]
        entry["natural_feature_gates"] = list(entry.get("feature_gates") or _feature_gate_ids_for_table(str(entry.get("name") or "").strip()))
        entry["feature_gates"] = assigned_gates
        entry["feature_gate_labels"] = _deep_run_feature_gate_labels_for_ids(assigned_gates)
        entry["feature_gate_items"] = _deep_run_feature_gate_items_for_ids(assigned_gates)
        entry["deep_run_lock_count"] = tier_count
        entry["deep_run_feature_key_order"] = list(key_order[:5])
        entry["deep_run_starting_open"] = False
        locked_by_name[str(entry.get("name") or "").strip()] = entry
        tier_counts[tier_count] = tier_counts.get(tier_count, 0) + 1

    staged_entries: list[dict[str, Any]] = []
    for entry in active_entries:
        name = str(entry.get("name") or "").strip()
        staged = locked_by_name.get(name, dict(entry))
        if name in starter_set:
            staged["natural_feature_gates"] = list(staged.get("feature_gates") or _feature_gate_ids_for_table(name))
            staged["feature_gates"] = []
            staged["feature_gate_labels"] = []
            staged["feature_gate_items"] = []
            staged["deep_run_lock_count"] = 0
            staged["deep_run_starting_open"] = True
            staged["deep_run_feature_key_order"] = list(key_order[:5])
            tier_counts[0] = tier_counts.get(0, 0) + 1
        staged_entries.append(staged)

    notes = (
        "Deep Run assigned Feature Lock profile: "
        f"{tier_counts.get(0, 0)} open, "
        f"{tier_counts.get(1, 0)} one-lock, "
        f"{tier_counts.get(2, 0)} two-lock, "
        f"{tier_counts.get(3, 0)} three-lock, "
        f"{tier_counts.get(4, 0)} four-lock tables"
    )
    return staged_entries, notes


def _make_deep_run_balanced_active_entries(
    generation_ready_entries: list[dict[str, Any]],
    rng: random.Random,
    requested_count: int,
    requested_start_open: int = 0,
) -> tuple[list[dict[str, Any]], str]:
    requested_count = int(requested_count or 0)
    desired_count = requested_count if requested_count > 0 else DEEP_RUN_DEFAULT_ACTIVE_TABLE_COUNT
    desired_count = min(len(generation_ready_entries), desired_count)
    if desired_count <= 0:
        return [], "no generation-ready tables available for Deep Run"

    decorated = _decorate_feature_gate_entries([dict(entry) for entry in generation_ready_entries])
    rng.shuffle(decorated)
    targets = _deep_run_bucket_targets(desired_count, requested_start_open)
    starter_count = targets.get(0, _deep_run_start_open_count_for_active_count(desired_count, requested_start_open))
    featureless = [entry for entry in decorated if not _feature_gate_ids_for_table(str(entry.get("name") or "").strip())]
    rng.shuffle(featureless)
    starter_entries: list[dict[str, Any]] = []
    selected_names: set[str] = set()

    for entry in featureless + decorated:
        if len(starter_entries) >= starter_count:
            break
        name = str(entry.get("name") or "").strip()
        if not name or name in selected_names:
            continue
        staged = dict(entry)
        staged["deep_run_starting_open"] = True
        starter_entries.append(staged)
        selected_names.add(name)

    locked_entries: list[dict[str, Any]] = []
    for entry in decorated:
        if len(starter_entries) + len(locked_entries) >= desired_count:
            break
        name = str(entry.get("name") or "").strip()
        if not name or name in selected_names:
            continue
        locked_entries.append(dict(entry))
        selected_names.add(name)

    world_count = max(1, (desired_count + 4) // 5)
    world_chunks: list[list[dict[str, Any]]] = [[] for _ in range(world_count)]
    for idx, entry in enumerate(starter_entries):
        world_chunks[idx % world_count].append(entry)
    for entry in locked_entries:
        target_idx = min(range(world_count), key=lambda chunk_idx: (len(world_chunks[chunk_idx]), chunk_idx))
        if len(world_chunks[target_idx]) >= 5:
            target_idx = next((idx for idx, chunk in enumerate(world_chunks) if len(chunk) < 5), target_idx)
        world_chunks[target_idx].append(entry)

    selected: list[dict[str, Any]] = []
    for world_idx, chunk in enumerate(world_chunks, start=1):
        for entry in chunk:
            staged = dict(entry)
            staged["active_group_key"] = f"deep_run_w{world_idx}"
            staged["active_group_label"] = f"Deep Run World {world_idx}"
            selected.append(staged)
    selected = selected[:desired_count]

    selected, profile_note = _assign_deep_run_feature_lock_profile(selected, rng, requested_start_open)
    for entry in selected:
        bucket = max(0, min(4, int(entry.get("deep_run_lock_count") or 0)))
        if bucket <= 0:
            label = "Open Starter Tables"
        else:
            label = f"Feature Key {'I' * bucket}"
        entry["deep_run_lock_label"] = label

    notes: list[str] = []
    if len(selected) < desired_count:
        notes.append(f"Deep Run selected {len(selected)}/{desired_count} active tables")
    if profile_note:
        notes.append(profile_note)
    return selected, "; ".join([note for note in notes if note])


def _choose_metasizer_starting_open_entries(
    active_entries: list[dict[str, Any]],
    active_tables: list[str],
    requested_start_open: int,
    rng: random.Random,
    deep_run_enabled: bool,
    feature_unlock_enabled: bool,
) -> list[dict[str, Any]]:
    active_count = len(active_entries)
    if active_count <= 0:
        return []
    default_open_count = min(DEEP_RUN_DEFAULT_START_OPEN_COUNT, active_count) if deep_run_enabled else min(5, active_count)
    start_open_count = max(1, min(active_count, requested_start_open if requested_start_open > 0 else default_open_count))
    if deep_run_enabled:
        marked = [
            dict(entry)
            for entry in active_entries
            if bool(entry.get("deep_run_starting_open")) and str(entry.get("name") or "").strip()
        ]
        if marked:
            marked.sort(
                key=lambda entry: active_tables.index(str(entry.get("name") or "").strip())
                if str(entry.get("name") or "").strip() in active_tables else 10**9
            )
            return marked[:start_open_count]
    candidates = [dict(entry) for entry in active_entries]
    if feature_unlock_enabled:
        featureless = [
            entry for entry in candidates
            if not list(entry.get("feature_gates") if "feature_gates" in entry else _feature_gate_ids_for_table(str(entry.get("name") or "").strip()))
        ]
        if len(featureless) >= start_open_count:
            candidates = featureless
    opening_entries = [dict(entry) for entry in rng.sample(candidates, start_open_count)]
    opening_entries.sort(
        key=lambda entry: active_tables.index(str(entry.get("name") or "").strip())
        if str(entry.get("name") or "").strip() in active_tables else 10**9
    )
    return opening_entries


def _build_feature_unlock_payload(enabled: bool, active_entries: list[dict[str, Any]], starting_open_tables: list[str]) -> dict[str, Any]:
    definitions = [
        {**dict(defn), "pieces_required": FEATURE_KEY_PIECES_REQUIRED}
        for defn in _feature_key_definitions()
    ]
    by_id = {str(defn.get("id") or "").strip(): dict(defn) for defn in definitions if str(defn.get("id") or "").strip()}
    table_feature_gates: dict[str, list[str]] = {}
    table_feature_labels: dict[str, list[str]] = {}
    table_feature_items: dict[str, list[str]] = {}
    table_lock_counts: dict[str, int] = {}
    feature_gate_tables: dict[str, list[str]] = {str(defn.get("id") or "").strip(): [] for defn in definitions}
    used_gate_ids: list[str] = []
    for entry in active_entries:
        table_name = str(entry.get("name") or "").strip()
        if not table_name:
            continue
        raw_gates = entry.get("feature_gates") if "feature_gates" in entry else _feature_gate_ids_for_table(table_name)
        gates = list(raw_gates or [])
        labels = [str((by_id.get(gate_id) or {}).get("label") or gate_id).strip() for gate_id in gates]
        items = [str((by_id.get(gate_id) or {}).get("item") or "").strip() for gate_id in gates if str((by_id.get(gate_id) or {}).get("item") or "").strip()]
        table_feature_gates[table_name] = gates
        table_feature_labels[table_name] = labels
        table_feature_items[table_name] = items
        table_lock_counts[table_name] = len(gates)
        for gate_id in gates:
            if gate_id not in used_gate_ids:
                used_gate_ids.append(gate_id)
            feature_gate_tables.setdefault(gate_id, []).append(table_name)
    used_gate_ids = [gate_id for gate_id in [str(defn.get("id") or "").strip() for defn in definitions] if gate_id in used_gate_ids]
    deep_run_key_order = []
    for entry in active_entries:
        raw_order = entry.get("deep_run_feature_key_order")
        if isinstance(raw_order, list) and raw_order:
            deep_run_key_order = [str(gate_id or "").strip() for gate_id in raw_order if str(gate_id or "").strip()]
            break
    return {
        "enabled": bool(enabled),
        "version": 1,
        "mode": "feature_unlock",
        "feature_key_pieces_required": FEATURE_KEY_PIECES_REQUIRED,
        "feature_keys": definitions,
        "used_feature_keys": [by_id[gate_id] for gate_id in used_gate_ids if gate_id in by_id],
        "feature_key_items": [str((by_id.get(gate_id) or {}).get("item") or "").strip() for gate_id in used_gate_ids if str((by_id.get(gate_id) or {}).get("item") or "").strip()],
        "feature_key_item_counts": {
            str((by_id.get(gate_id) or {}).get("item") or "").strip(): FEATURE_KEY_PIECES_REQUIRED
            for gate_id in used_gate_ids
            if str((by_id.get(gate_id) or {}).get("item") or "").strip()
        },
        "table_feature_gates": table_feature_gates,
        "table_feature_labels": table_feature_labels,
        "table_feature_items": table_feature_items,
        "table_lock_counts": table_lock_counts,
        "feature_gate_tables": feature_gate_tables,
        "starting_open_tables": list(starting_open_tables),
        "deep_run_key_order": deep_run_key_order,
        "deep_run_key_tier_rewards": {"0": 1, "1": 2, "2": 1, "3": 1},
    }


def _metasizer_parse_curated_world_groups(raw: Any) -> list[str]:
    if raw is None:
        return []
    if isinstance(raw, (int, float)) and int(raw) in (0, 1):
        return []
    if isinstance(raw, (list, tuple, set)):
        out: list[str] = []
        for item in raw:
            out.extend(_metasizer_parse_curated_world_groups(item))
        return out
    text = str(raw or "").strip()
    if not text or text.lower() in {"auto", "default", "random", "none", "0", "1"}:
        return []
    parts = [part.strip() for part in METASIZER_GROUP_SELECTION_SPLIT_RE.split(text) if str(part or "").strip()]
    return parts


def _metasizer_resolve_group_keys(
    catalog_groups: list[dict[str, Any]],
    table_entries: list[dict[str, Any]],
    raw_selection: Any,
) -> tuple[list[str], list[str]]:
    lookup = _metasizer_group_lookup(table_entries, catalog_groups)
    resolved: list[str] = []
    unresolved: list[str] = []
    for token in _metasizer_parse_curated_world_groups(raw_selection):
        group_key = lookup.get(_metasizer_normalize_lookup_key(token))
        if not group_key:
            unresolved.append(token)
            continue
        if group_key not in resolved:
            resolved.append(group_key)
    return resolved, unresolved


def _metasizer_parse_curated_table_list(raw: Any) -> list[str]:
    if raw is None:
        return []
    if isinstance(raw, (int, float)) and int(raw) in (0, 1):
        return []
    if isinstance(raw, dict):
        return _metasizer_parse_curated_table_list(raw.get("name") or raw.get("code") or "")
    if isinstance(raw, (list, tuple, set)):
        out: list[str] = []
        for item in raw:
            out.extend(_metasizer_parse_curated_table_list(item))
        return out
    text = str(raw or "").strip()
    if not text or text.lower() in {"auto", "default", "random", "none", "0", "1"}:
        return []
    return [part.strip() for part in METASIZER_TABLE_SELECTION_SPLIT_RE.split(text) if str(part or "").strip()]


def _metasizer_resolve_table_entries(table_entries: list[dict[str, Any]], raw_selection: Any) -> tuple[list[dict[str, Any]], list[str]]:
    lookup: dict[str, dict[str, Any]] = {}

    def remember(token: Any, entry: dict[str, Any]) -> None:
        key = _metasizer_normalize_lookup_key(token)
        if key and key not in lookup:
            lookup[key] = entry

    for entry in table_entries:
        remember(entry.get("name"), entry)
        remember(entry.get("code"), entry)
        remember(entry.get("guide_key"), entry)
        remember(entry.get("flyer_code"), entry)

    resolved: list[dict[str, Any]] = []
    unresolved: list[str] = []
    seen_names: set[str] = set()
    for token in _metasizer_parse_curated_table_list(raw_selection):
        entry = lookup.get(_metasizer_normalize_lookup_key(token))
        if not entry:
            unresolved.append(token)
            continue
        name = str(entry.get("name") or "").strip()
        if not name or name in seen_names:
            continue
        seen_names.add(name)
        resolved.append(dict(entry))
    return resolved, unresolved


def _metasizer_split_custom_world_tables(raw: Any) -> list[str]:
    text = str(raw or "").strip()
    if not text:
        return []
    if "|" in text or ";" in text:
        return [part.strip() for part in METASIZER_CUSTOM_WORLD_TABLE_SPLIT_RE.split(text) if str(part or "").strip()]
    return _metasizer_parse_curated_table_list(text)


def _metasizer_parse_custom_world_sets(raw: Any) -> list[dict[str, Any]]:
    if raw is None:
        return []
    if isinstance(raw, dict):
        out: list[dict[str, Any]] = []
        for name, tables in raw.items():
            table_list = _metasizer_split_custom_world_tables(tables)
            if table_list:
                out.append({"name": str(name or "").strip(), "tables": table_list})
        return out
    if isinstance(raw, (list, tuple)):
        out: list[dict[str, Any]] = []
        for item in raw:
            if isinstance(item, dict):
                name = str(item.get("name") or item.get("world") or item.get("label") or "").strip()
                tables = item.get("tables") or item.get("table_names") or item.get("entries") or ""
                table_list = _metasizer_split_custom_world_tables(tables)
                if table_list:
                    out.append({"name": name, "tables": table_list})
            else:
                out.extend(_metasizer_parse_custom_world_sets(str(item or "")))
        return out
    text = str(raw or "").strip()
    if not text or text.lower() in {"auto", "default", "random", "none", "0", "1"}:
        return []
    out: list[dict[str, Any]] = []
    for raw_line in METASIZER_CUSTOM_WORLD_LINE_SPLIT_RE.split(text):
        line = re.sub(r"^\s*[-*]\s*", "", str(raw_line or "").strip())
        if not line:
            continue
        if ":" in line:
            name, tables_text = line.split(":", 1)
        elif "=" in line:
            name, tables_text = line.split("=", 1)
        else:
            name, tables_text = f"World {len(out) + 1}", line
        table_list = _metasizer_split_custom_world_tables(tables_text)
        if table_list:
            out.append({"name": str(name or "").strip(), "tables": table_list})
    return out


def _metasizer_resolve_custom_world_sets(table_entries: list[dict[str, Any]], raw_selection: Any) -> tuple[list[dict[str, Any]], list[str], list[str]]:
    worlds: list[dict[str, Any]] = []
    unresolved: list[str] = []
    duplicate_tables: list[str] = []
    seen_names: set[str] = set()
    for idx, custom_world in enumerate(_metasizer_parse_custom_world_sets(raw_selection), start=1):
        world_name = str(custom_world.get("name") or "").strip() or f"World {idx}"
        resolved_entries, missing = _metasizer_resolve_table_entries(table_entries, custom_world.get("tables") or [])
        unresolved.extend([f"{world_name}: {token}" for token in missing])
        world_entries: list[dict[str, Any]] = []
        for entry in resolved_entries:
            table_name = str(entry.get("name") or "").strip()
            if not table_name:
                continue
            if table_name in seen_names:
                duplicate_tables.append(table_name)
                continue
            seen_names.add(table_name)
            world_entries.append(dict(entry))
        if world_entries:
            worlds.append({"name": world_name, "entries": world_entries})
    return worlds, unresolved, duplicate_tables


def _metasizer_player_display_name(multiworld: MultiWorld, player: int) -> str:
    try:
        names = getattr(multiworld, "player_name", None)
        if isinstance(names, dict):
            value = str(names.get(player) or "").strip()
            if value:
                return value
        if isinstance(names, (list, tuple)) and 0 <= player < len(names):
            value = str(names[player] or "").strip()
            if value:
                return value
    except Exception:
        pass
    try:
        getter = getattr(multiworld, "get_player_name", None)
        if callable(getter):
            value = str(getter(player) or "").strip()
            if value:
                return value
    except Exception:
        pass
    return f"Player {player}"


def _parse_metasizer_world_curators(raw_selection: Any) -> list[str]:
    text = str(raw_selection or "").replace("\r\n", "\n").replace("\r", "\n").strip()
    if not text or text.lower() in {"auto", "default", "random", "none", "0", "1"}:
        return []
    pieces = text.split("\n") if "\n" in text else text.split("|" if "|" in text else ",")
    curators: list[str] = []
    for index, piece in enumerate(pieces, start=1):
        clean = str(piece or "").strip()
        if clean.startswith(("-", "*")):
            clean = clean[1:].strip()
        if ":" in clean:
            label, value = clean.split(":", 1)
            normalized_label = " ".join(str(label or "").strip().lower().split())
            if normalized_label == f"world {index}" or (
                normalized_label.startswith("world ")
                and normalized_label[6:].strip().isdigit()
            ):
                clean = value.strip()
        curators.append(clean)
    while curators and not curators[-1]:
        curators.pop()
    return curators


def _apply_metasizer_world_curators(
    world_layout: dict[str, Any],
    world_curators: list[str],
    fallback_curated_by: str,
) -> dict[str, Any]:
    worlds = world_layout.get("worlds")
    if not isinstance(worlds, list):
        return world_layout
    fallback = str(fallback_curated_by or "").strip()
    resolved: list[str] = []
    for index, entry in enumerate(worlds):
        if not isinstance(entry, dict):
            continue
        curator = str(world_curators[index] if index < len(world_curators) else "").strip()
        if not curator:
            curator = str(entry.get("curated_by") or fallback).strip()
        if curator:
            entry["curated_by"] = curator
        resolved.append(curator)
    world_layout["world_curators"] = resolved
    return world_layout


def _metasizer_curated_world_theme(world_chunk: list[dict[str, Any]], world_num: int) -> tuple[str, dict[str, str], str]:
    text = " ".join(
        [
            str(entry.get("name") or "")
            + " "
            + str(entry.get("group_label") or "")
            + " "
            + " ".join(str(key or "") for key in (entry.get("world_group_keys") or []))
            for entry in world_chunk
        ]
    ).lower()
    scored: list[tuple[int, str]] = []
    for theme_key, theme in METASIZER_CURATED_THEME_RULES.items():
        score = sum(1 for needle in theme.get("needles", ()) if str(needle or "").lower() in text)
        if score > 0:
            scored.append((score, theme_key))
    scored.sort(key=lambda item: (-item[0], item[1]))
    primary_key = scored[0][1] if scored else "classic"
    secondary_key = scored[1][1] if len(scored) > 1 else primary_key
    primary = METASIZER_CURATED_THEME_RULES.get(primary_key, METASIZER_CURATED_THEME_RULES["classic"])
    secondary = METASIZER_CURATED_THEME_RULES.get(secondary_key, primary)
    signature = "|".join(str(entry.get("name") or "").strip() for entry in world_chunk)
    offset = sum(ord(ch) for ch in signature) + int(world_num or 0)
    adjectives = tuple(primary.get("adjectives") or ("Curated",))
    nouns = tuple(secondary.get("nouns") or primary.get("nouns") or ("World",))
    name = f"{adjectives[offset % len(adjectives)]} {nouns[(offset // 7) % len(nouns)]}"
    palette = dict(primary.get("palette") or METASIZER_CURATED_THEME_RULES["classic"]["palette"])
    return name, palette, primary_key


def _build_metasizer_curated_table_world_layout(
    active_entries: list[dict[str, Any]],
    starting_open_tables: list[str],
    curated_by: str,
) -> dict[str, Any]:
    group_size = 5
    worlds_per_page = 5
    tables_per_page = group_size * worlds_per_page
    starting_open = set(str(name or "").strip() for name in starting_open_tables if str(name or "").strip())
    worlds: list[dict[str, Any]] = []
    world_order: list[str] = []
    for start in range(0, len(active_entries), group_size):
        world_chunk = [dict(entry) for entry in active_entries[start:start + group_size]]
        if not world_chunk:
            continue
        world_num = len(worlds) + 1
        world_key = f"w{world_num}"
        tables = [str(entry.get("name") or "").strip() for entry in world_chunk if str(entry.get("name") or "").strip()]
        generated_name, palette, theme_key = _metasizer_curated_world_theme(world_chunk, world_num)
        world_order.append(world_key)
        worlds.append({
            "key": world_key,
            "label": f"World {world_num}; {generated_name}",
            "generated_name": generated_name,
            "curated": True,
            "curated_seed": True,
            "curated_by": curated_by,
            "banner_palette": palette,
            "banner_theme": theme_key,
            "tables": tables,
            "table_codes": [str(entry.get("code") or "").strip() for entry in world_chunk if str(entry.get("code") or "").strip()],
            "group_keys": [f"curated_w{world_num}"],
            "group_labels": [generated_name],
            "starting_open_tables": [name for name in tables if name in starting_open],
        })
    world_order.append("boss")
    return {
        "group_size": group_size,
        "tables_per_page": tables_per_page,
        "worlds_per_page": worlds_per_page,
        "page_count": max(1, (len(worlds) + worlds_per_page - 1) // worlds_per_page),
        "layout_mode": "curated_table_list",
        "curated": True,
        "curated_by": curated_by,
        "world_order": world_order,
        "worlds": worlds,
    }


def _build_metasizer_custom_world_set_layout(
    custom_worlds: list[dict[str, Any]],
    starting_open_tables: list[str],
    curated_by: str,
) -> dict[str, Any]:
    group_size = 5
    worlds_per_page = 5
    tables_per_page = group_size * worlds_per_page
    starting_open = set(str(name or "").strip() for name in starting_open_tables if str(name or "").strip())
    worlds: list[dict[str, Any]] = []
    world_order: list[str] = []
    for custom_world in custom_worlds:
        world_chunk = [dict(entry) for entry in custom_world.get("entries") or []]
        if not world_chunk:
            continue
        world_num = len(worlds) + 1
        world_key = f"w{world_num}"
        tables = [str(entry.get("name") or "").strip() for entry in world_chunk if str(entry.get("name") or "").strip()]
        _, palette, theme_key = _metasizer_curated_world_theme(world_chunk, world_num)
        custom_name = str(custom_world.get("name") or "").strip() or f"World {world_num}"
        world_order.append(world_key)
        worlds.append({
            "key": world_key,
            "label": f"World {world_num}; {custom_name}",
            "generated_name": custom_name,
            "custom_name": custom_name,
            "curated": True,
            "curated_seed": True,
            "custom_world_set": True,
            "curated_by": curated_by,
            "banner_palette": palette,
            "banner_theme": theme_key,
            "tables": tables,
            "table_codes": [str(entry.get("code") or "").strip() for entry in world_chunk if str(entry.get("code") or "").strip()],
            "group_keys": [f"custom_w{world_num}"],
            "group_labels": [custom_name],
            "starting_open_tables": [name for name in tables if name in starting_open],
        })
    world_order.append("boss")
    return {
        "group_size": group_size,
        "tables_per_page": tables_per_page,
        "worlds_per_page": worlds_per_page,
        "page_count": max(1, (len(worlds) + worlds_per_page - 1) // worlds_per_page),
        "layout_mode": "custom_world_sets",
        "curated": True,
        "custom_world_sets": True,
        "curated_by": curated_by,
        "world_order": world_order,
        "worlds": worlds,
    }


def _metasizer_select_group_keys(
    catalog_groups: list[dict[str, Any]],
    table_entries: list[dict[str, Any]],
    desired_group_count: int,
    selection_mode: str,
    curated_selection: Any,
    random_one_featured_only: bool,
    rng: random.Random,
) -> tuple[list[str], str, list[str], list[str]]:
    available_group_keys = [str(group.get("key") or "").strip() for group in catalog_groups if str(group.get("key") or "").strip()]
    available_group_keys = [key for key in available_group_keys if key]
    if not available_group_keys or desired_group_count <= 0:
        return [], "no_available_groups", [], []

    curated_keys, unresolved = _metasizer_resolve_group_keys(catalog_groups, table_entries, curated_selection)
    featured_group_keys = _metasizer_featured_designer_group_keys(catalog_groups)
    featured_cap = 1 if random_one_featured_only else None
    selected: list[str] = []
    fallback_reasons: list[str] = []

    if selection_mode == "random_catalog_pool":
        selected, skipped_for_cap = _metasizer_fill_group_keys(
            available_group_keys,
            min(desired_group_count, len(available_group_keys)),
            rng,
            featured_group_keys=featured_group_keys,
            featured_cap=featured_cap,
            existing_selected_keys=[],
        )
        if curated_keys:
            fallback_reasons.append("curated world groups ignored in random mode")
        if skipped_for_cap:
            fallback_reasons.append("featured designer random cap applied")
    else:
        for key in curated_keys:
            if key not in selected:
                selected.append(key)
        if unresolved:
            fallback_reasons.append("unresolved curated group selectors: " + ", ".join(unresolved))
        if len(selected) > desired_group_count:
            selected = selected[:desired_group_count]
            fallback_reasons.append("curated list trimmed to the requested world count")
        remaining = [key for key in available_group_keys if key not in selected]
        if len(selected) < desired_group_count and remaining:
            fill_keys, skipped_for_cap = _metasizer_fill_group_keys(
                remaining,
                min(desired_group_count - len(selected), len(remaining)),
                rng,
                featured_group_keys=featured_group_keys,
                featured_cap=featured_cap,
                existing_selected_keys=selected,
            )
            fill_count = len(fill_keys)
            selected.extend(fill_keys)
            if fill_count:
                fallback_reasons.append("random fill used for remaining world slots")
            if skipped_for_cap:
                fallback_reasons.append("featured designer random cap applied")

    if len(selected) < desired_group_count:
        fallback_reasons.append(f"only {len(selected)} world groups available for a {desired_group_count}-world request")

    return selected, "; ".join([reason for reason in fallback_reasons if reason]), curated_keys, unresolved


def _metasizer_group_entries_by_key(table_entries: list[dict[str, Any]]) -> tuple[dict[str, list[dict[str, Any]]], list[str]]:
    grouped_entries: dict[str, list[dict[str, Any]]] = {}
    group_order: list[str] = []
    for entry in table_entries:
        group_key = str(entry.get("group_key") or "misc").strip() or "misc"
        if group_key not in grouped_entries:
            grouped_entries[group_key] = []
            group_order.append(group_key)
        grouped_entries[group_key].append(dict(entry))
    return grouped_entries, group_order


def _build_metasizer_world_layout(active_entries: list[dict[str, Any]], starting_open_tables: list[str]) -> dict[str, Any]:
    group_size = 5
    worlds_per_page = 5
    tables_per_page = group_size * worlds_per_page
    starting_open = set(str(name or "").strip() for name in starting_open_tables if str(name or "").strip())
    worlds: list[dict[str, Any]] = []
    world_order: list[str] = []
    grouped_entries: dict[str, list[dict[str, Any]]] = {}
    group_order: list[str] = []
    for entry in active_entries:
        name = str(entry.get("name") or "").strip()
        if not name:
            continue
        group_key = str(entry.get("active_group_key") or entry.get("group_key") or "misc").strip() or "misc"
        if group_key not in grouped_entries:
            grouped_entries[group_key] = []
            group_order.append(group_key)
        grouped_entries[group_key].append(dict(entry))

    world_chunk: list[dict[str, Any]] = []

    def flush_world() -> None:
        nonlocal world_chunk
        if not world_chunk:
            return
        world_num = len(worlds) + 1
        world_key = f"w{world_num}"
        tables = [str(entry.get("name") or "").strip() for entry in world_chunk if str(entry.get("name") or "").strip()]
        group_labels: list[str] = []
        group_keys: list[str] = []
        seen_groups: set[str] = set()
        for entry in world_chunk:
            group_key = str(entry.get("active_group_key") or entry.get("group_key") or "misc").strip() or "misc"
            if group_key in seen_groups:
                continue
            seen_groups.add(group_key)
            group_keys.append(group_key)
            group_labels.append(str(entry.get("active_group_label") or entry.get("group_label") or group_key.replace("_", " ").title()).strip() or group_key.replace("_", " ").title())
        if len(group_labels) == 1:
            label = f"World {world_num}; {group_labels[0]}"
        elif len(group_labels) == 2:
            label = f"World {world_num}; {group_labels[0]} / {group_labels[1]}"
        else:
            label = f"World {world_num}; Mixed Metatable Pool"
        world_order.append(world_key)
        worlds.append({
            "key": world_key,
            "label": label,
            "tables": tables,
            "table_codes": [str(entry.get("code") or "").strip() for entry in world_chunk if str(entry.get("code") or "").strip()],
            "group_keys": group_keys,
            "group_labels": group_labels,
            "starting_open_tables": [name for name in tables if name in starting_open],
        })
        world_chunk = []

    for group_key in group_order:
        entries = grouped_entries.get(group_key, [])
        while entries:
            remaining = group_size - len(world_chunk)
            if remaining <= 0:
                flush_world()
                remaining = group_size
            if world_chunk and len(entries) > remaining:
                flush_world()
                remaining = group_size
            world_chunk.extend(entries[:remaining])
            entries = entries[remaining:]
            if len(world_chunk) >= group_size:
                flush_world()
    flush_world()

    world_order.append("boss")
    return {
        "group_size": group_size,
        "tables_per_page": tables_per_page,
        "worlds_per_page": worlds_per_page,
        "page_count": max(1, (len(worlds) + worlds_per_page - 1) // worlds_per_page),
        "layout_mode": "world_group_catalog",
        "world_order": world_order,
        "worlds": worlds,
    }


def _get_metasizer_selection_mode(world: World, multiworld: MultiWorld, player: int) -> tuple[str, str, str]:
    raw = get_option_value(multiworld, player, "base_game_selection_mode")
    requested = METASIZER_DEFAULT_SELECTION_MODE
    if isinstance(raw, str):
        normalized = str(raw or "").strip().lower()
        if normalized in METASIZER_SELECTION_MODES.values():
            requested = normalized
    else:
        try:
            requested = METASIZER_SELECTION_MODES.get(int(raw), METASIZER_DEFAULT_SELECTION_MODE)
        except (TypeError, ValueError):
            requested = METASIZER_DEFAULT_SELECTION_MODE
    applied = requested
    fallback_reason = ""
    if requested not in METASIZER_SELECTION_MODES.values():
        applied = METASIZER_DEFAULT_SELECTION_MODE
        fallback_reason = "Unrecognized selection mode; falling back to seeded random catalog sampling."
    return requested, applied, fallback_reason


def _select_metasizer_boss_table_entry(
    active_entries: list[dict[str, Any]],
    seed_name: str,
    numeric_seed: str,
    player: int,
) -> dict[str, Any]:
    candidates = [
        dict(entry)
        for entry in active_entries
        if str(entry.get("name") or "").strip()
    ]
    if not candidates:
        return {}
    candidates.sort(key=lambda entry: _metasizer_normalize_lookup_key(entry.get("name")))
    signature = ",".join(str(entry.get("code") or entry.get("name") or "").strip() for entry in candidates)
    rng = random.Random(f"{seed_name}|{numeric_seed}|{player}|boss_table_v1|{signature}")
    return dict(rng.choice(candidates))


def _build_metasizer_table_set_payload(world: World, multiworld: MultiWorld, player: int) -> dict[str, Any]:
    enabled = bool(get_option_value(multiworld, player, "base_game_enabled"))
    table_entries = _metasizer_table_entries()
    catalog_groups = _metasizer_catalog_groups(table_entries)
    table_pool = [str(entry.get("name") or "").strip() for entry in table_entries if str(entry.get("name") or "").strip()]
    generation_ready_entries = _metasizer_generation_ready_table_entries()
    generation_ready_tables = [str(entry.get("name") or "").strip() for entry in generation_ready_entries]
    candidate_only_tables = [
        str(entry.get("name") or "").strip()
        for entry in table_entries
        if not bool(entry.get("generation_ready")) and str(entry.get("name") or "").strip()
    ]
    requested_count = int(get_option_value(multiworld, player, "base_game_active_table_count") or 0)
    requested_start_open = int(get_option_value(multiworld, player, "base_game_starting_open_table_count") or 0)
    random_one_featured_only = bool(get_option_value(multiworld, player, "base_game_random_one_featured_designer_only"))
    selection_mode_requested, selection_mode_applied, selection_mode_fallback_reason = _get_metasizer_selection_mode(world, multiworld, player)
    curated_world_groups_raw = get_option_value(multiworld, player, "base_game_curated_world_groups")
    curated_tables_raw = get_option_value(multiworld, player, "base_game_curated_tables")
    custom_world_sets_raw = get_option_value(multiworld, player, "base_game_custom_world_sets")
    world_curators_raw = get_option_value(multiworld, player, "base_game_world_curators")
    world_curators = _parse_metasizer_world_curators(world_curators_raw)
    group_size = 5
    desired_world_count = max(1, min(len(catalog_groups), requested_count // group_size if requested_count > 0 else len(catalog_groups)))
    seed_name = str(getattr(multiworld, "seed_name", ""))
    numeric_seed = str(getattr(multiworld, "seed", ""))
    rng = random.Random(f"{seed_name}|{numeric_seed}|{player}|metasizer_table_set_v2")
    seed_type = _get_base_game_seed_type(multiworld, player)
    deep_run_enabled = seed_type == BASE_GAME_SEED_TYPE_DEEP_RUN
    feature_unlock_enabled = _is_feature_unlock_enabled(multiworld, player)
    if deep_run_enabled:
        if requested_count <= 0 or requested_count == 25:
            requested_count = min(DEEP_RUN_DEFAULT_ACTIVE_TABLE_COUNT, len(generation_ready_entries))
        if requested_start_open <= 0:
            requested_start_open = _deep_run_start_open_count_for_active_count(requested_count)
        desired_world_count = max(1, min(len(catalog_groups), (requested_count + group_size - 1) // group_size))
    if selection_mode_applied == "curated_table_list":
        custom_world_sets, unresolved_custom_world_tables, duplicate_custom_world_tables = _metasizer_resolve_custom_world_sets(generation_ready_entries, custom_world_sets_raw)
        if custom_world_sets:
            desired_active_count = max(1, min(
                len(generation_ready_entries),
                requested_count if requested_count > 0 else min(25, len(generation_ready_entries)),
            ))
            active_world_sets: list[dict[str, Any]] = []
            active_entries: list[dict[str, Any]] = []
            custom_fallback_reasons: list[str] = []
            for world_idx, custom_world in enumerate(custom_world_sets, start=1):
                remaining = desired_active_count - len(active_entries)
                if remaining <= 0:
                    break
                chunk_entries = [dict(entry) for entry in (custom_world.get("entries") or [])[:remaining]]
                if not chunk_entries:
                    continue
                world_name = str(custom_world.get("name") or "").strip() or f"World {world_idx}"
                for staged in chunk_entries:
                    staged["active_group_key"] = f"custom_w{len(active_world_sets) + 1}"
                    staged["active_group_label"] = world_name
                active_entries.extend(chunk_entries)
                active_world_sets.append({"name": world_name, "entries": chunk_entries})
            active_entries = _decorate_feature_gate_entries(active_entries)
            custom_deep_run_profile_note = ""
            if deep_run_enabled and feature_unlock_enabled:
                active_entries, custom_deep_run_profile_note = _assign_deep_run_feature_lock_profile(
                    active_entries,
                    rng,
                    requested_start_open,
                )
            active_entry_by_name = {
                str(entry.get("name") or "").strip(): dict(entry)
                for entry in active_entries
                if str(entry.get("name") or "").strip()
            }
            active_world_sets = [
                {
                    "name": str(world.get("name") or "").strip(),
                    "entries": [
                        active_entry_by_name.get(
                            str(entry.get("name") or "").strip(),
                            dict(entry),
                        )
                        for entry in _decorate_feature_gate_entries(list(world.get("entries") or []))
                    ],
                }
                for world in active_world_sets
            ]
            trimmed_count = sum(len(world.get("entries") or []) for world in custom_world_sets) - len(active_entries)
            if unresolved_custom_world_tables:
                custom_fallback_reasons.append("unresolved custom world table selectors: " + ", ".join(unresolved_custom_world_tables))
            if duplicate_custom_world_tables:
                custom_fallback_reasons.append("duplicate custom world tables skipped: " + ", ".join(duplicate_custom_world_tables))
            if trimmed_count > 0:
                custom_fallback_reasons.append(f"custom world sets trimmed to {desired_active_count} active tables")
            active_tables = [str(entry.get("name") or "").strip() for entry in active_entries if str(entry.get("name") or "").strip()]
            active_count = len(active_tables)
            if active_entries:
                opening_entries = _choose_metasizer_starting_open_entries(
                    active_entries,
                    active_tables,
                    requested_start_open,
                    rng,
                    deep_run_enabled,
                    feature_unlock_enabled,
                )
            else:
                opening_entries = []
            opening_tables = [str(entry.get("name") or "").strip() for entry in opening_entries]
            feature_unlock_payload = _build_feature_unlock_payload(feature_unlock_enabled, active_entries, opening_tables)
            curated_by = _metasizer_player_display_name(multiworld, player)
            world_layout = _build_metasizer_custom_world_set_layout(active_world_sets, opening_tables, curated_by)
            world_layout = _apply_metasizer_world_curators(world_layout, world_curators, curated_by)
            boss_table_entry = _select_metasizer_boss_table_entry(active_entries, seed_name, numeric_seed, player)
            boss_table_name = str(boss_table_entry.get("name") or "").strip()
            boss_table_checks = _build_boss_table_checks_payload(boss_table_name, seed_name, numeric_seed, player)
            active_world_groups = []
            for entry in world_layout.get("worlds", []) or []:
                active_world_groups.append({
                    "key": str(entry.get("key") or "").strip(),
                    "label": str(entry.get("custom_name") or entry.get("generated_name") or entry.get("label") or "").strip(),
                    "table_names": list(entry.get("tables") or []),
                    "table_codes": list(entry.get("table_codes") or []),
                    "generation_ready": True,
                    "explicit": True,
                    "curated": True,
                    "custom_world_set": True,
                    "banner_palette": dict(entry.get("banner_palette") or {}),
                })
            return {
                "enabled": enabled and bool(active_tables),
                "version": 7,
                "base_variant": "Base Game",
                "variant": "Base Game",
                "seed_type": seed_type,
                "deep_run": deep_run_enabled,
                "feature_unlock": feature_unlock_payload,
                "pool_size": len(table_pool),
                "generation_ready_pool_size": len(generation_ready_tables),
                "candidate_pool_size": len(candidate_only_tables),
                "requested_active_table_count": requested_count,
                "requested_starting_open_count": requested_start_open,
                "random_one_featured_designer_only": random_one_featured_only,
                "selection_scope": "custom_world_sets",
                "selection_mode_requested": selection_mode_requested,
                "selection_mode": selection_mode_applied,
                "selection_mode_options": list(METASIZER_SELECTION_MODES.values()),
                "selection_mode_fallback_reason": selection_mode_fallback_reason,
                "selection_group_count": len(active_world_groups),
                "selected_group_keys": [str(group.get("key") or "").strip() for group in active_world_groups],
                "selected_group_metadata": active_world_groups,
                "selected_group_keys_requested": [],
                "selected_group_keys_inactive": [],
                "curated_world_groups_input": curated_world_groups_raw,
                "curated_world_groups_resolved": [],
                "curated_world_groups_unresolved": [],
                "curated_tables_input": curated_tables_raw,
                "curated_tables_resolved": active_tables,
                "curated_tables_unresolved": [],
                "custom_world_sets_input": custom_world_sets_raw,
                "world_curators_input": world_curators_raw,
                "world_curators_resolved": list(world_layout.get("world_curators") or []),
                "custom_world_sets_resolved": [
                    {
                        "name": str(world.get("name") or "").strip(),
                        "tables": [str(entry.get("name") or "").strip() for entry in world.get("entries") or [] if str(entry.get("name") or "").strip()],
                    }
                    for world in active_world_sets
                ],
                "custom_world_sets_unresolved": unresolved_custom_world_tables,
                "custom_world_sets_duplicates": duplicate_custom_world_tables,
                "curated_by": curated_by,
                "group_selection_fallback_reason": "; ".join(custom_fallback_reasons),
                "manual_pick_scaffold": True,
                "curated_pick_scaffold": True,
                "curated_table_scaffold": True,
                "custom_world_set_scaffold": True,
                "active_tables": active_tables,
                "active_table_entries": active_entries,
                "active_table_count": len(active_tables),
                "starting_open_tables": opening_tables,
                "starting_open_entries": opening_entries,
                "starting_open_count": len(opening_tables),
                "boss_table": boss_table_name,
                "boss_table_name": boss_table_name,
                "boss_table_code": str(boss_table_entry.get("code") or "").strip(),
                "boss_table_entry": boss_table_entry,
                "boss_table_checks": boss_table_checks,
                "table_pool": table_pool,
                "table_entries": table_entries,
                "catalog_groups": catalog_groups,
                "generation_ready_tables": generation_ready_tables,
                "candidate_only_tables": candidate_only_tables,
                "effective_active_table_count": len(active_tables),
                "effective_starting_open_count": len(opening_tables),
                "active_world_count": len(active_world_groups),
                "active_world_groups": active_world_groups,
                "world_layout": world_layout,
                "graph_mode": "custom_world_sets",
                "notes": [
                    "Base Game selected custom named world sets from YAML.",
                    f"Custom world sets active tables: {len(active_tables)}.",
                    *([custom_deep_run_profile_note] if custom_deep_run_profile_note else []),
                    *custom_fallback_reasons,
                ],
            }
        resolved_curated_entries, unresolved_curated_tables = _metasizer_resolve_table_entries(generation_ready_entries, curated_tables_raw)
        curated_table_fallback_reason = ""
        if unresolved_curated_tables:
            curated_table_fallback_reason = "unresolved curated table selectors: " + ", ".join(unresolved_curated_tables)
        if resolved_curated_entries:
            desired_active_count = max(1, min(
                len(generation_ready_entries),
                requested_count if requested_count > 0 else min(25, len(generation_ready_entries)),
            ))
            rng.shuffle(resolved_curated_entries)
            trimmed_count = max(0, len(resolved_curated_entries) - desired_active_count)
            active_entries = [dict(entry) for entry in resolved_curated_entries[:desired_active_count]]
            for idx, staged in enumerate(active_entries):
                staged["active_group_key"] = f"curated_w{idx // group_size + 1}"
                staged["active_group_label"] = "Curated Table List"
            if trimmed_count:
                curated_table_fallback_reason = "; ".join([
                    reason for reason in [
                        curated_table_fallback_reason,
                        f"curated table list trimmed to {desired_active_count} active tables",
                    ] if reason
                ])
            active_entries = _decorate_feature_gate_entries(active_entries)
            curated_deep_run_profile_note = ""
            if deep_run_enabled and feature_unlock_enabled:
                active_entries, curated_deep_run_profile_note = _assign_deep_run_feature_lock_profile(
                    active_entries,
                    rng,
                    requested_start_open,
                )
            active_tables = [str(entry.get("name") or "").strip() for entry in active_entries if str(entry.get("name") or "").strip()]
            active_count = len(active_tables)
            if active_entries:
                opening_entries = _choose_metasizer_starting_open_entries(
                    active_entries,
                    active_tables,
                    requested_start_open,
                    rng,
                    deep_run_enabled,
                    feature_unlock_enabled,
                )
            else:
                opening_entries = []
            opening_tables = [str(entry.get("name") or "").strip() for entry in opening_entries]
            feature_unlock_payload = _build_feature_unlock_payload(feature_unlock_enabled, active_entries, opening_tables)
            curated_by = _metasizer_player_display_name(multiworld, player)
            world_layout = _build_metasizer_curated_table_world_layout(active_entries, opening_tables, curated_by)
            world_layout = _apply_metasizer_world_curators(world_layout, world_curators, curated_by)
            boss_table_entry = _select_metasizer_boss_table_entry(active_entries, seed_name, numeric_seed, player)
            boss_table_name = str(boss_table_entry.get("name") or "").strip()
            boss_table_checks = _build_boss_table_checks_payload(boss_table_name, seed_name, numeric_seed, player)
            active_world_groups = []
            for entry in world_layout.get("worlds", []) or []:
                active_world_groups.append({
                    "key": str(entry.get("key") or "").strip(),
                    "label": str(entry.get("generated_name") or entry.get("label") or "").strip(),
                    "table_names": list(entry.get("tables") or []),
                    "table_codes": list(entry.get("table_codes") or []),
                    "generation_ready": True,
                    "explicit": True,
                    "curated": True,
                    "banner_palette": dict(entry.get("banner_palette") or {}),
                })
            return {
                "enabled": enabled and bool(active_tables),
                "version": 6,
                "base_variant": "Base Game",
                "variant": "Base Game",
                "seed_type": seed_type,
                "deep_run": deep_run_enabled,
                "feature_unlock": feature_unlock_payload,
                "pool_size": len(table_pool),
                "generation_ready_pool_size": len(generation_ready_tables),
                "candidate_pool_size": len(candidate_only_tables),
                "requested_active_table_count": requested_count,
                "requested_starting_open_count": requested_start_open,
                "random_one_featured_designer_only": random_one_featured_only,
                "selection_scope": "curated_table_list",
                "selection_mode_requested": selection_mode_requested,
                "selection_mode": selection_mode_applied,
                "selection_mode_options": list(METASIZER_SELECTION_MODES.values()),
                "selection_mode_fallback_reason": selection_mode_fallback_reason,
                "selection_group_count": len(active_world_groups),
                "selected_group_keys": [str(group.get("key") or "").strip() for group in active_world_groups],
                "selected_group_metadata": active_world_groups,
                "selected_group_keys_requested": [],
                "selected_group_keys_inactive": [],
                "curated_world_groups_input": curated_world_groups_raw,
                "curated_world_groups_resolved": [],
                "curated_world_groups_unresolved": [],
                "curated_tables_input": curated_tables_raw,
                "curated_tables_resolved": active_tables,
                "curated_tables_unresolved": unresolved_curated_tables,
                "world_curators_input": world_curators_raw,
                "world_curators_resolved": list(world_layout.get("world_curators") or []),
                "curated_by": curated_by,
                "group_selection_fallback_reason": curated_table_fallback_reason,
                "manual_pick_scaffold": True,
                "curated_pick_scaffold": True,
                "curated_table_scaffold": True,
                "active_tables": active_tables,
                "active_table_entries": active_entries,
                "active_table_count": len(active_tables),
                "starting_open_tables": opening_tables,
                "starting_open_entries": opening_entries,
                "starting_open_count": len(opening_tables),
                "boss_table": boss_table_name,
                "boss_table_name": boss_table_name,
                "boss_table_code": str(boss_table_entry.get("code") or "").strip(),
                "boss_table_entry": boss_table_entry,
                "boss_table_checks": boss_table_checks,
                "table_pool": table_pool,
                "table_entries": table_entries,
                "catalog_groups": catalog_groups,
                "generation_ready_tables": generation_ready_tables,
                "candidate_only_tables": candidate_only_tables,
                "effective_active_table_count": len(active_tables),
                "effective_starting_open_count": len(opening_tables),
                "active_world_count": len(active_world_groups),
                "active_world_groups": active_world_groups,
                "world_layout": world_layout,
                "graph_mode": "curated_table_list",
                "notes": [
                    "Base Game selected a curated table list from YAML and shuffled it into generated worlds.",
                    "Curated world banners use generated names and generated color palettes instead of source table/background art.",
                    "Curated table selectors can be supplied as table names, table codes, guide keys, or flyer codes.",
                    "Only generation-ready tables with complete task/check data participate in the active AP graph.",
                    *([curated_deep_run_profile_note] if curated_deep_run_profile_note else []),
                ],
            }
        selection_mode_applied = METASIZER_DEFAULT_SELECTION_MODE
        selection_mode_fallback_reason = "; ".join([
            reason for reason in [
                selection_mode_fallback_reason,
                curated_table_fallback_reason,
                "Curated Table List mode had no resolved generation-ready tables; falling back to seeded random catalog sampling.",
            ] if reason
        ])
    selected_group_keys, group_selection_fallback_reason, curated_group_keys, unresolved_curated_groups = _metasizer_select_group_keys(
        catalog_groups,
        table_entries,
        desired_world_count,
        selection_mode_applied,
        curated_world_groups_raw,
        random_one_featured_only,
        rng,
    )
    catalog_group_by_key = {str(group.get("key") or "").strip(): group for group in catalog_groups if str(group.get("key") or "").strip()}
    ready_group_keys = [key for key, group in catalog_group_by_key.items() if bool(group.get("generation_ready"))]
    if not selected_group_keys:
        selected_group_keys = ready_group_keys[:desired_world_count]
    active_group_keys: list[str] = []
    inactive_selected_group_keys: list[str] = []
    for group_key in selected_group_keys:
        group = catalog_group_by_key.get(group_key)
        if group and bool(group.get("generation_ready")):
            if group_key not in active_group_keys:
                active_group_keys.append(group_key)
        else:
            inactive_selected_group_keys.append(group_key)
    if inactive_selected_group_keys:
        extra_fallback = "selected world groups are not generation-ready yet: " + ", ".join(inactive_selected_group_keys)
        group_selection_fallback_reason = "; ".join([reason for reason in [group_selection_fallback_reason, extra_fallback] if reason])
    non_overlapping_group_keys, overlap_skipped_groups, _seen_tables = _metasizer_filter_non_overlapping_group_keys(
        active_group_keys,
        catalog_group_by_key,
    )
    if overlap_skipped_groups:
        active_group_keys = non_overlapping_group_keys
        inactive_selected_group_keys.extend(
            group["key"] for group in overlap_skipped_groups if str(group.get("key") or "").strip() and str(group.get("key") or "").strip() not in inactive_selected_group_keys
        )
        overlap_summary = ", ".join(
            f"{str(group.get('label') or group.get('key') or '').strip()} overlaps {', '.join(group.get('overlaps') or [])}"
            for group in overlap_skipped_groups
        )
        extra_fallback = "overlapping world groups skipped: " + overlap_summary
        group_selection_fallback_reason = "; ".join([reason for reason in [group_selection_fallback_reason, extra_fallback] if reason])
    remaining_ready_group_keys = [key for key in ready_group_keys if key not in active_group_keys]
    if len(active_group_keys) < desired_world_count and remaining_ready_group_keys:
        fill_keys, skipped_overlap_fill, skipped_for_cap = _metasizer_fill_non_overlapping_group_keys(
            remaining_ready_group_keys,
            min(desired_world_count - len(active_group_keys), len(remaining_ready_group_keys)),
            rng,
            catalog_group_by_key,
            existing_selected_keys=active_group_keys,
            featured_group_keys=_metasizer_featured_designer_group_keys(catalog_groups),
            featured_cap=1 if random_one_featured_only else None,
        )
        fill_count = len(fill_keys)
        active_group_keys.extend(fill_keys)
        if fill_count:
            extra_fallback = "random fill used from generation-ready world groups"
            group_selection_fallback_reason = "; ".join([reason for reason in [group_selection_fallback_reason, extra_fallback] if reason])
        if skipped_overlap_fill:
            extra_fallback = "overlap-safe fill skipped: " + ", ".join(
                f"{str(group.get('label') or group.get('key') or '').strip()} overlaps {', '.join(group.get('overlaps') or [])}"
                for group in skipped_overlap_fill
            )
            group_selection_fallback_reason = "; ".join([reason for reason in [group_selection_fallback_reason, extra_fallback] if reason])
        if skipped_for_cap:
            extra_fallback = "featured designer random cap applied"
            group_selection_fallback_reason = "; ".join([reason for reason in [group_selection_fallback_reason, extra_fallback] if reason])
    active_entries: list[dict[str, Any]] = []
    active_entry_names: set[str] = set()
    for group_key in active_group_keys:
        group = catalog_group_by_key.get(group_key) or {}
        entries = group.get("entries", [])
        if not entries:
            continue
        group_label = str(group.get("label") or group_key.replace("_", " ").title()).strip() or group_key.replace("_", " ").title()
        for entry in entries:
            staged = dict(entry)
            entry_name = str(staged.get("name") or "").strip()
            if not entry_name or entry_name in active_entry_names:
                continue
            active_entry_names.add(entry_name)
            staged["active_group_key"] = group_key
            staged["active_group_label"] = group_label
            active_entries.append(staged)
    active_entries = _decorate_feature_gate_entries(active_entries)
    deep_run_balance_note = ""
    if deep_run_enabled and feature_unlock_enabled:
        active_entries, deep_run_balance_note = _make_deep_run_balanced_active_entries(
            generation_ready_entries,
            rng,
            requested_count,
            requested_start_open,
        )
        active_group_keys = []
        for entry in active_entries:
            group_key = str(entry.get("active_group_key") or "").strip()
            if group_key and group_key not in active_group_keys:
                active_group_keys.append(group_key)
        inactive_selected_group_keys = []
    active_tables = [str(entry.get("name") or "").strip() for entry in active_entries if str(entry.get("name") or "").strip()]
    active_group_metadata = []
    if deep_run_enabled and feature_unlock_enabled:
        for group_key in active_group_keys:
            entries_for_group = [entry for entry in active_entries if str(entry.get("active_group_key") or "").strip() == group_key]
            if not entries_for_group:
                continue
            active_group_metadata.append({
                "key": group_key,
                "label": str(entries_for_group[0].get("active_group_label") or group_key).strip(),
                "table_names": [str(entry.get("name") or "").strip() for entry in entries_for_group if str(entry.get("name") or "").strip()],
                "table_codes": [str(entry.get("code") or "").strip() for entry in entries_for_group if str(entry.get("code") or "").strip()],
                "generation_ready": True,
                "explicit": False,
                "deep_run_balanced": True,
            })
    else:
        for group_key in active_group_keys:
            group = catalog_group_by_key.get(group_key)
            if not group:
                continue
            active_group_metadata.append({
                "key": group_key,
                "label": str(group.get("label") or "").strip(),
                "table_names": list(group.get("table_names") or []),
                "table_codes": list(group.get("table_codes") or []),
                "generation_ready": bool(group.get("generation_ready")),
                "explicit": bool(group.get("explicit")),
            })
    selection_scope = "generation_ready_world_groups"
    payload: dict[str, Any] = {
        "enabled": enabled and bool(generation_ready_tables),
        "version": 6,
        "base_variant": "Base Game",
        "variant": "Base Game",
        "seed_type": seed_type,
        "deep_run": deep_run_enabled,
        "feature_unlock": {"enabled": False, "version": 1, "mode": "feature_unlock", "feature_keys": _feature_key_definitions()},
        "pool_size": len(table_pool),
        "generation_ready_pool_size": len(generation_ready_tables),
        "candidate_pool_size": len(candidate_only_tables),
        "requested_active_table_count": requested_count,
        "requested_starting_open_count": requested_start_open,
        "random_one_featured_designer_only": random_one_featured_only,
        "selection_scope": selection_scope,
        "selection_mode_requested": selection_mode_requested,
        "selection_mode": selection_mode_applied,
        "selection_mode_options": list(METASIZER_SELECTION_MODES.values()),
        "selection_mode_fallback_reason": selection_mode_fallback_reason,
        "selection_group_count": len(active_group_keys),
        "selected_group_keys": active_group_keys,
        "selected_group_metadata": active_group_metadata,
        "selected_group_keys_requested": selected_group_keys,
        "selected_group_keys_inactive": inactive_selected_group_keys,
        "curated_world_groups_input": curated_world_groups_raw,
        "curated_world_groups_resolved": curated_group_keys,
        "curated_world_groups_unresolved": unresolved_curated_groups,
        "curated_tables_input": curated_tables_raw,
        "curated_tables_resolved": [],
        "curated_tables_unresolved": [],
        "curated_by": _metasizer_player_display_name(multiworld, player),
        "group_selection_fallback_reason": group_selection_fallback_reason,
        "manual_pick_scaffold": selection_mode_applied != METASIZER_DEFAULT_SELECTION_MODE,
        "curated_pick_scaffold": selection_mode_applied in ("curated_catalog_groups", "hybrid_curated_random_fill"),
        "curated_table_scaffold": False,
        "active_tables": active_tables,
        "active_table_entries": active_entries,
        "starting_open_tables": [],
        "starting_open_entries": [],
        "table_pool": table_pool,
        "table_entries": table_entries,
        "catalog_groups": catalog_groups,
        "generation_ready_tables": generation_ready_tables,
        "candidate_only_tables": candidate_only_tables,
        "world_layout": {
            "group_size": group_size,
            "tables_per_page": 25,
            "worlds_per_page": 5,
            "page_count": 1,
            "layout_mode": "world_group_catalog",
            "world_order": ["boss"],
            "worlds": [],
        },
        "graph_mode": "world_group_catalog",
        "notes": [
            "Base Game now selects episode packs at the world-group level.",
            f"The pool tracks {len(table_pool)} tables across {len(catalog_groups)} world groups with reusable guide/flyer keys.",
            f"Selection mode '{selection_mode_applied}' chooses up to {desired_world_count} five-table worlds for the active seed.",
            "Curated groups can be supplied through YAML as keys, labels, table codes, or table names.",
            "Only generation-ready world groups participate in the AP graph until the remaining catalog worlds receive item/location/rule data."
            ,
            "Explicit world definitions can now reuse the same table across multiple candidate worlds.",
            deep_run_balance_note,
        ]
    }
    if not payload["enabled"]:
        return payload

    active_count = len(active_tables)
    if active_entries:
        opening_entries = _choose_metasizer_starting_open_entries(
            active_entries,
            active_tables,
            requested_start_open,
            rng,
            deep_run_enabled,
            feature_unlock_enabled,
        )
    else:
        opening_entries = []
    opening_tables = [str(entry.get("name") or "").strip() for entry in opening_entries]
    feature_unlock_payload = _build_feature_unlock_payload(feature_unlock_enabled, active_entries, opening_tables)
    world_layout = _build_metasizer_world_layout(active_entries, opening_tables)
    boss_table_entry = _select_metasizer_boss_table_entry(active_entries, seed_name, numeric_seed, player)
    boss_table_name = str(boss_table_entry.get("name") or "").strip()
    boss_table_checks = _build_boss_table_checks_payload(boss_table_name, seed_name, numeric_seed, player)

    payload["active_table_count"] = len(active_tables)
    payload["starting_open_count"] = len(opening_tables)
    payload["feature_unlock"] = feature_unlock_payload
    payload["active_tables"] = active_tables
    payload["active_table_entries"] = active_entries
    payload["boss_table"] = boss_table_name
    payload["boss_table_name"] = boss_table_name
    payload["boss_table_code"] = str(boss_table_entry.get("code") or "").strip()
    payload["boss_table_entry"] = boss_table_entry
    payload["boss_table_checks"] = boss_table_checks
    payload["starting_open_tables"] = opening_tables
    payload["starting_open_entries"] = opening_entries
    payload["effective_active_table_count"] = len(active_tables)
    payload["effective_starting_open_count"] = len(opening_tables)
    payload["active_world_count"] = len(active_group_keys)
    payload["active_world_groups"] = active_group_metadata
    payload["world_layout"] = world_layout
    return payload


def _get_metasizer_table_set_payload(world: World, multiworld: MultiWorld, player: int) -> dict[str, Any]:
    cached = getattr(world, "_metasizer_table_set_payload", None)
    if isinstance(cached, dict):
        return cached
    ut_payload = (
        _get_ut_slot_payload(world, BASE_GAME_TABLE_SET_SLOT_KEY)
        or _get_ut_slot_payload(world, LEGACY_METASIZER_TABLE_SET_SLOT_KEY)
    )
    if isinstance(ut_payload, dict):
        setattr(world, "_metasizer_table_set_payload", ut_payload)
        return ut_payload
    payload = _build_metasizer_table_set_payload(world, multiworld, player)
    setattr(world, "_metasizer_table_set_payload", payload)
    return payload


def _get_metasizer_active_table_names(world: World, multiworld: MultiWorld, player: int) -> set[str]:
    payload = _get_metasizer_table_set_payload(world, multiworld, player)
    if not payload.get("enabled"):
        return set()
    return {
        str(name or "").strip()
        for name in payload.get("active_tables", [])
        if str(name or "").strip()
    }


def _extract_metasizer_location_table_name(location_name: str) -> str | None:
    table_name, objective = _split_table_and_objective(location_name)
    if not table_name or not objective or table_name == objective:
        return None
    if table_name in _metasizer_table_pool_names():
        return table_name
    return None


def _extract_metasizer_progressive_ball_table_name(item_name: str) -> str | None:
    item_name = str(item_name or "").strip()
    if not item_name.startswith(PROGRESSIVE_BALL_ITEM_PREFIX):
        return None
    table_name = item_name[len(PROGRESSIVE_BALL_ITEM_PREFIX):].strip()
    return _canonical_metasizer_table_name(table_name)


def _build_task_shuffle_payload(world: World, multiworld: MultiWorld, player: int) -> dict[str, Any]:
    enabled = bool(get_option_value(multiworld, player, "task_shuffle_enabled"))
    payload: dict[str, Any] = {
        "enabled": enabled,
        "mode": "by_difficulty",
        "version": 1,
        "entries": [],
    }
    if not enabled:
        return payload

    grouped_tasks: dict[str, list[dict[str, Any]]] = {"Easy": [], "Medium": [], "Hard": []}
    for location in world.location_table:
        if not _is_task_shuffle_candidate(location):
            continue
        difficulty = _task_difficulty(location)
        if difficulty in grouped_tasks:
            grouped_tasks[difficulty].append(location)

    seed_name = str(getattr(multiworld, "seed_name", ""))
    numeric_seed = str(getattr(multiworld, "seed", ""))
    rng = random.Random(f"{seed_name}|{numeric_seed}|{player}|task_shuffle_v1")

    entries: list[dict[str, Any]] = []
    by_location: dict[str, dict[str, Any]] = {}
    for difficulty in ("Easy", "Medium", "Hard"):
        targets = sorted(grouped_tasks[difficulty], key=lambda loc: str(loc.get("name", "")))
        sources = targets[:]
        rng.shuffle(sources)
        for target, source in zip(targets, sources):
            target_name = str(target.get("name", ""))
            source_name = str(source.get("name", ""))
            target_table, _ = _split_table_and_objective(target_name)
            source_table, source_objective = _split_table_and_objective(source_name)
            entry = {
                "location": target_name,
                "source_location": source_name,
                "difficulty": difficulty,
                "target_table": target_table,
                "source_table": source_table,
                "objective": source_objective,
            }
            entries.append(entry)
            by_location[target_name] = entry

    payload["enabled"] = bool(entries)
    payload["entries"] = entries
    payload["by_location"] = by_location
    return payload


def _get_task_shuffle_payload(world: World, multiworld: MultiWorld, player: int) -> dict[str, Any]:
    cached = getattr(world, "_task_shuffle_payload", None)
    if isinstance(cached, dict):
        return cached
    ut_payload = _get_ut_slot_payload(world, TASK_SHUFFLE_SLOT_KEY)
    if isinstance(ut_payload, dict):
        setattr(world, "_task_shuffle_payload", ut_payload)
        return ut_payload
    payload = _build_task_shuffle_payload(world, multiworld, player)
    setattr(world, "_task_shuffle_payload", payload)
    return payload


def _load_generic_check_pools() -> dict[str, Any]:
    cached = globals().get("_GENERIC_CHECK_POOLS_CACHE")
    if isinstance(cached, dict):
        return cached
    try:
        pools = load_data_file("generic_check_pools.json")
    except Exception as exc:
        logging.warning("Manual Pinball Generic: failed to load generic check pools: %s", exc)
        pools = {}
    try:
        deep_run_pools = load_data_file("deep_run_task_pools.json")
    except Exception as exc:
        logging.warning("Manual Pinball Deep Run: failed to load table-specific task pools: %s", exc)
        deep_run_pools = {}
    if isinstance(pools, dict) and isinstance(deep_run_pools, dict):
        for table_name, difficulty_map in deep_run_pools.items():
            if not isinstance(difficulty_map, dict):
                continue
            table_pool = pools.setdefault(str(table_name), {})
            if not isinstance(table_pool, dict):
                table_pool = {}
                pools[str(table_name)] = table_pool
            for difficulty in ("Easy", "Medium", "Hard"):
                replacements = difficulty_map.get(difficulty)
                if not isinstance(replacements, list):
                    continue
                score_entries = [
                    dict(entry) for entry in table_pool.get(difficulty, []) or []
                    if isinstance(entry, dict) and str(entry.get("type", "")).strip().lower() == "score"
                ]
                table_pool[difficulty] = score_entries + [dict(entry) for entry in replacements if isinstance(entry, dict)]
    globals()["_GENERIC_CHECK_POOLS_CACHE"] = pools
    return pools


def _generic_task_allowed_for_difficulty(pick: dict[str, Any], difficulty: str) -> bool:
    text = " ".join(
        str(pick.get(field, "") or "")
        for field in ("title", "source_location", "explanation")
    )
    difficulty_name = str(difficulty or "").strip().title()
    compact = _metasizer_normalize_lookup_key(text)
    if difficulty_name == "Easy":
        if (
            "multiball" in compact
            or "jackpot" in compact
            or "superjackpot" in compact
            or "lightlock" in compact
            or "lock1ball" in compact
            or "lock2balls" in compact
            or re.search(r"\block(?:\s+\d+)?\s+balls?\b", text, re.IGNORECASE)
            or re.search(r"\block\s+(?:a|one|two|three|\d+)\s+balls?\b", text, re.IGNORECASE)
        ):
            return False
        categories = _generic_task_requirement_categories(pick)
        if "requires:multiball" in categories or "requires:jackpot" in categories:
            return False
    if difficulty_name == "Hard":
        return HARD_TASK_FORBIDDEN_OBJECTIVE_RE.search(text) is None
    return True


def _generic_task_objective_text(table_name: str, pick: dict[str, Any]) -> str:
    raw_title = str(pick.get("title", "") or "").strip()
    raw_source = str(pick.get("source_location", "") or "").strip()
    parts: list[str] = []
    if raw_source:
        source_table, source_objective = _split_table_and_objective(raw_source)
        if source_objective and source_objective != source_table:
            parts.append(source_objective)
        else:
            parts.append(raw_source)
    if raw_title:
        parts.append(raw_title)
    text = " ".join(parts).replace("&", " and ").lower()
    if table_name:
        text = re.sub(rf"\b{re.escape(str(table_name).strip().lower())}\b", " ", text)
    return text


def _generic_task_objective_tokens(table_name: str, pick: dict[str, Any]) -> list[str]:
    text = _generic_task_objective_text(table_name, pick)
    number_words = {
        "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
        "single", "double", "triple",
    }
    stop_words = {
        "a", "an", "and", "any", "at", "by", "during", "each", "for", "from", "in", "into", "of",
        "on", "once", "or", "same", "the", "then", "to", "total", "toward", "towards", "with",
        "game", "games", "ball", "balls", "shot", "shots", "time", "times",
        "make", "shoot", "hit", "collect", "complete", "start", "light", "qualify", "advance",
        "build", "finish", "score", "earn", "get", "win", "play", "reach", "begin", "destroy",
        "beat", "rip",
    }
    tokens: list[str] = []
    for raw_word in re.findall(r"[a-z0-9]+", text):
        word = raw_word.strip().lower()
        if not word:
            continue
        if word.isdigit() or word in number_words or re.fullmatch(r"\d+(?:st|nd|rd|th)", word):
            tokens.append("count")
            continue
        if word in stop_words:
            continue
        if word.endswith("ies") and len(word) > 4:
            word = word[:-3] + "y"
        elif word.endswith("es") and len(word) > 4 and not word.endswith(("ss", "us")):
            word = word[:-2]
        elif word.endswith("s") and len(word) > 3 and not word.endswith(("ss", "us")):
            word = word[:-1]
        if word and word not in stop_words:
            tokens.append(word)
    return tokens


def _generic_task_objective_signature(table_name: str, pick: dict[str, Any], difficulty: str) -> str:
    text = _generic_task_objective_text(table_name, pick)
    normalized = _metasizer_normalize_lookup_key(text)
    if normalized:
        return f"{_metasizer_normalize_lookup_key(table_name)}:{normalized}"
    return _metasizer_normalize_lookup_key(
        f"{table_name}:{difficulty}:{pick.get('source_location', '')}:{pick.get('title', '')}"
    )


def _generic_task_similarity_family_signature(table_name: str, pick: dict[str, Any], difficulty: str) -> str:
    tokens = _generic_task_objective_tokens(table_name, pick)
    if not tokens:
        return _metasizer_normalize_lookup_key(difficulty)
    words = set(tokens)
    text = _generic_task_objective_text(table_name, pick)
    scope = _metasizer_normalize_lookup_key(table_name) or "generic"

    def family(name: str) -> str:
        return f"{scope}:{name}"

    if "wizard" in words or any(key in text for key in ("grand finale", "join the cirqus", "battle for the kingdom", "final battle", "final frontier", "champion challenge")):
        return family("wizard_progress")
    if "multiball" in words and "jackpot" in words:
        return family("multiball_jackpot")
    if "jackpot" in words and ("super" in words or "multiball" in words):
        return family("multiball_jackpot")
    if "jackpot" in words:
        return family("jackpot_progress")
    if "multiball" in words or ("lock" in words and "count" in words):
        return family("multiball_progress")
    if "goal" in words:
        return family("goal_progress")
    if "passenger" in words:
        return family("passenger_pickups")
    if "tale" in words:
        return family("tale_progress")
    if "city" in words and ({"stop", "tour", "mode"} & words):
        return family("city_tour_progress")
    if "mode" in words or "mission" in words or "round" in words or "song" in words:
        return family("mode_progress")
    if "spinner" in words:
        return family("spinner_progress")
    if "combo" in words:
        return family("combo_progress")
    if "ramp" in words:
        return family("ramp_progress")
    if "orbit" in words or "loop" in words:
        return family("orbit_loop_progress")
    if "lane" in words or "rollover" in words or "inline" in words:
        return family("lane_progress")
    if "target" in words or "bank" in words or "drop" in words:
        return family("target_bank_progress")
    if "scoop" in words or "saucer" in words or "hole" in words:
        return family("scoop_saucer_progress")
    if "award" in words or "mystery" in words or "tv" in words:
        return family("award_progress")
    if "bonus" in words or "multiplier" in words:
        return family("bonus_multiplier_progress")
    if "letter" in words:
        return family("letter_completion")
    return family(_metasizer_normalize_lookup_key(" ".join(tokens)) or difficulty)


def _generic_task_requirement_categories(pick: dict[str, Any]) -> set[str]:
    text = " ".join(
        str(pick.get(field, "") or "")
        for field in ("title", "source_location")
    ).strip().lower()
    compact = _metasizer_normalize_lookup_key(text)
    categories: set[str] = set()

    def has_word(*words: str) -> bool:
        return any(re.search(rf"\b{re.escape(word)}\b", text) for word in words)

    if "multiball" in compact or "multiball" in text or re.search(r"\block(?:\s+\d+)?\s+balls?\b", text) or "lightlock" in compact:
        categories.add("requires:multiball")
    if "jackpot" in compact:
        categories.add("requires:jackpot")
        if "multiball" in compact or "superjackpot" in compact:
            categories.add("requires:multiball")
    if has_word("mode", "mission", "round", "feature", "hurry-up", "hurryup") or any(token in compact for token in ("startanymode", "startamode", "completeanymode", "complete1mode", "startanymission", "completeanymission", "startanysongmode", "completeanysongmode")):
        categories.add("requires:mode")
    if has_word("wizard") or any(token in compact for token in ("grandfinale", "jointhecirqus", "battleforthekingdom", "finalbattle", "finalfrontier", "championchallenge", "ruletheuniverse")):
        categories.add("requires:wizard")
    if has_word("combo"):
        categories.add("requires:combo")
    if has_word("goal", "goals"):
        categories.add("requires:goal")
    if has_word("ramp", "ramps"):
        categories.add("requires:ramp")
    if has_word("orbit", "orbits", "loop", "loops"):
        categories.add("requires:orbit_loop")
    if has_word("lane", "lanes", "rollover", "rollovers"):
        categories.add("requires:lane")
    if has_word("target", "targets", "drop", "drops", "bank"):
        categories.add("requires:target_bank")
    if has_word("spinner", "spinners"):
        categories.add("requires:spinner")
    if has_word("scoop", "saucer", "hole"):
        categories.add("requires:scoop_saucer")
    if has_word("award", "awards", "mystery") or "tvaward" in compact:
        categories.add("requires:award")
    if "tvaward" in compact or "finaldraw" in compact or "finalmatch" in compact:
        categories.add("requires:tv_award_progress")
    if has_word("bonus", "multiplier", "multipliers"):
        categories.add("requires:bonus_multiplier")
    if has_word("extra ball", "extraball"):
        categories.add("requires:extra_ball")
    return categories


def _generic_task_confidence_score(pick: dict[str, Any], target_difficulty: str, source_difficulty: str) -> float:
    if not isinstance(pick, dict):
        return 0.25
    raw_confidence = pick.get("confidence_score", pick.get("confidence"))
    if raw_confidence is not None:
        try:
            return max(0.0, min(1.0, float(raw_confidence)))
        except (TypeError, ValueError):
            pass

    generated = bool(pick.get("generated"))
    score = 0.38 if generated else 0.78
    target = str(target_difficulty or "").strip().title()
    source = str(source_difficulty or "").strip().title()
    if source and source == target:
        score += 0.08
    elif source:
        score -= 0.10

    explanation = str(pick.get("explanation") or "").strip()
    source_location = str(pick.get("source_location") or "").strip()
    if source_location and not generated:
        score += 0.04
    if len(explanation) >= 80:
        score += 0.03

    categories = _generic_task_requirement_categories(pick)
    if target == "Easy" and ({"requires:multiball", "requires:jackpot"} & categories):
        score -= 0.25
    if target == "Hard" and "requires:wizard" in categories:
        score -= 0.15
    return round(max(0.15, min(0.98, score)), 2)


def _generic_task_confidence_label(score: float) -> str:
    try:
        value = float(score)
    except (TypeError, ValueError):
        return "low"
    if value >= 0.82:
        return "high"
    if value >= 0.62:
        return "medium"
    return "low"


def _generic_task_confidence_metadata(
    table_name: str,
    pick: dict[str, Any],
    wanted_difficulty: str,
    source_difficulty: str,
    generated: bool,
    family_reused: bool,
) -> dict[str, Any]:
    wanted = str(wanted_difficulty or "").strip().title()
    source = str(source_difficulty or "").strip().title() or wanted
    categories = _generic_task_requirement_categories(pick)
    text = " ".join(str(pick.get(field, "") or "") for field in ("title", "source_location", "explanation"))
    compact = _metasizer_normalize_lookup_key(text)
    score = 94
    reasons: list[str] = ["table-specific source task"]

    if generated:
        score -= 24
        reasons = ["generated fallback task"]
    if source != wanted:
        score -= 14
        reasons.append(f"source difficulty was {source}")
    if family_reused:
        score -= 8
        reasons.append("shares a task family with another Deep Run task")

    if wanted == "Easy":
        if "requires:multiball" in categories or "requires:jackpot" in categories:
            score -= 45
            reasons.append("multiball/jackpot content is usually too much for Easy")
        if "requires:wizard" in categories:
            score -= 55
            reasons.append("wizard-progress content does not fit Easy")
        if any(category in categories for category in ("requires:target_bank", "requires:lane", "requires:spinner", "requires:ramp", "requires:award", "requires:scoop_saucer")):
            score += 2
            reasons.append("single-shot or simple-feature objective")
    elif wanted == "Medium":
        if "requires:wizard" in categories:
            score -= 30
            reasons.append("wizard-progress content is usually Hard")
        if "requires:multiball" in categories or "requires:mode" in categories:
            score += 2
            reasons.append("setup or one-mode/multiball objective fits Medium")
        if "superjackpot" in compact or "superjackpot" in text.lower():
            score -= 12
            reasons.append("super jackpot content leans Hard")
    elif wanted == "Hard":
        if any(category in categories for category in ("requires:jackpot", "requires:multiball", "requires:wizard", "requires:mode", "requires:bonus_multiplier")):
            score += 2
            reasons.append("multi-step or high-value objective fits Hard")
        if not generated and not any(category in categories for category in ("requires:jackpot", "requires:multiball", "requires:wizard", "requires:mode", "requires:bonus_multiplier", "requires:combo")):
            score -= 8
            reasons.append("simple feature for Hard, verify table-specific difficulty")

    score = max(0, min(100, int(score)))
    if score >= 85:
        label = "high"
    elif score >= 70:
        label = "medium"
    else:
        label = "low"
    return {
        "task_confidence": score,
        "task_confidence_label": label,
        "task_confidence_reasons": reasons,
    }


def _extract_generic_task_location(location_name: str) -> tuple[str, str] | None:
    match = GENERIC_TASK_RE.match(str(location_name or "").strip())
    if not match:
        return None
    table = str(match.group("table") or "").strip()
    difficulty = str(match.group("difficulty") or "").strip().title()
    if not table or difficulty not in ("Easy", "Medium", "Hard"):
        return None
    return table, difficulty


def _extract_deep_run_task_location(location_name: str) -> tuple[str, int] | None:
    match = DEEP_RUN_TASK_RE.match(str(location_name or "").strip())
    if not match:
        return None
    table = _canonical_metasizer_table_name(match.group("table")) or str(match.group("table") or "").strip()
    if not table:
        return None
    try:
        index = int(match.group("index"))
    except (TypeError, ValueError):
        return None
    if index < 1 or index > DEEP_RUN_TASKS_PER_TABLE:
        return None
    return table, index


def _extract_deep_run_score_location(location_name: str) -> tuple[str, int, int] | None:
    match = DEEP_RUN_SCORE_RE.match(str(location_name or "").strip())
    if not match:
        return None
    table = _canonical_metasizer_table_name(match.group("table")) or str(match.group("table") or "").strip()
    if not table:
        return None
    try:
        index = int(match.group("index"))
    except (TypeError, ValueError):
        return None
    if index < 1 or index > DEEP_RUN_SCORE_CHECKS_PER_TABLE:
        return None
    try:
        target = int(str(match.group("score") or "0").replace(",", ""))
    except (TypeError, ValueError):
        target = 0
    return table, index, max(0, target)


def _deep_run_slot_difficulty(index: int) -> str:
    if index <= 4:
        return "Easy"
    if index <= 8:
        return "Medium"
    return "Hard"


def _deep_run_slot_ball_count(index: int) -> int:
    difficulty = _deep_run_slot_difficulty(index)
    if difficulty == "Easy":
        return 1
    if difficulty == "Medium":
        return 2
    return 3


def _deep_run_slot_region(index: int) -> str:
    return f"Ball {_deep_run_slot_ball_count(index)} Sphere"


def _table_location_category(table_name: str) -> str:
    canonical = _canonical_metasizer_table_name(table_name) or str(table_name or "").strip()
    return re.sub(r"[^A-Za-z0-9]+", "", canonical)


def _metasizer_payload_is_deep_run(payload: dict[str, Any]) -> bool:
    return str(payload.get("seed_type") or "").strip().lower() == BASE_GAME_SEED_TYPE_DEEP_RUN


def _deep_run_location_requires(table_name: str, ball_count: int, feature_unlock_payload: dict[str, Any] | None) -> str:
    requirements = [f"|{_progressive_ball_item_name_for_table(table_name)}:{max(1, min(3, int(ball_count or 1)))}|"]
    table_items = {}
    if isinstance(feature_unlock_payload, dict) and feature_unlock_payload.get("enabled"):
        table_items = feature_unlock_payload.get("table_feature_items", {}) or {}
    for item_name in table_items.get(table_name, []) if isinstance(table_items, dict) else []:
        item_name = str(item_name or "").strip()
        if item_name:
            requirements.append(f"|{item_name}:{FEATURE_KEY_PIECES_REQUIRED}|")
    return " and ".join(requirements)


def _register_dynamic_location(world: World, location: dict[str, Any]) -> dict[str, Any]:
    name = str(location.get("name") or "").strip()
    if not name:
        return location

    if name in location_name_to_id:
        loc_id = location_name_to_id[name]
    else:
        loc_id = max([int(value) for value in location_id_to_name.keys() if isinstance(value, int)] or [0]) + 1
        location_id_to_name[loc_id] = name
        location_name_to_id[name] = loc_id

    location["id"] = loc_id
    if "region" not in location:
        location["region"] = "Manual"
    if isinstance(location.get("category", []), str):
        location["category"] = [location["category"]]
    location_name_to_location[name] = location
    for category in location.get("category", []) or []:
        group = location_name_groups.setdefault(str(category), [])
        if name not in group:
            group.append(name)

    try:
        world.location_id_to_name[loc_id] = name
        world.location_name_to_id[name] = loc_id
        world.location_name_to_location[name] = location
    except Exception:
        pass
    return location


def _build_deep_run_locations(world: World, metasizer_payload: dict[str, Any]) -> list[dict[str, Any]]:
    if not _metasizer_payload_is_deep_run(metasizer_payload):
        return []

    pools = _load_generic_check_pools()
    feature_unlock_payload = metasizer_payload.get("feature_unlock") if isinstance(metasizer_payload.get("feature_unlock"), dict) else {}
    locations: list[dict[str, Any]] = []
    for table_name in metasizer_payload.get("active_tables", []) or []:
        table_name = str(table_name or "").strip()
        if not table_name:
            continue
        table_category = _table_location_category(table_name)
        for index in range(1, DEEP_RUN_TASKS_PER_TABLE + 1):
            difficulty = _deep_run_slot_difficulty(index)
            ball_count = _deep_run_slot_ball_count(index)
            location = {
                "name": f"{table_name} - Deep Task {index:02d}",
                "region": _deep_run_slot_region(index),
                "category": [table_category, "Generic", "DeepRun", difficulty, "Task"],
                "requires": _deep_run_location_requires(table_name, ball_count, feature_unlock_payload),
            }
            if ball_count == 1:
                location["dont_place_item"] = ["Boss Key"]
            locations.append(_register_dynamic_location(world, location))

        table_pool = pools.get(table_name, {}) if isinstance(pools, dict) else {}
        score_targets = _boss_table_score_targets(table_pool if isinstance(table_pool, dict) else {})
        for index, target in enumerate(score_targets[:DEEP_RUN_SCORE_CHECKS_PER_TABLE], start=1):
            difficulty = _deep_run_slot_difficulty(index)
            ball_count = _deep_run_slot_ball_count(index)
            location = {
                "name": f"{table_name} - Deep Score {index:02d} ({int(target):,}+)",
                "region": _deep_run_slot_region(index),
                "category": [table_category, "Generic", "DeepRun", difficulty, "Score"],
                "requires": _deep_run_location_requires(table_name, ball_count, feature_unlock_payload),
            }
            if ball_count == 1:
                location["dont_place_item"] = ["Boss Key"]
            locations.append(_register_dynamic_location(world, location))
    return locations


def _extract_table_name_from_location_label(location_name: str) -> str:
    table_name, objective = _split_table_and_objective(str(location_name or "").strip())
    if not table_name or not objective or table_name == objective:
        return ""
    return table_name


def _entry_references_only_active_tables(entry: dict[str, Any], location_name: str, active_tables: set[str]) -> bool:
    if not active_tables:
        return True
    target_table = str(
        entry.get("target_table")
        or entry.get("table")
        or _extract_table_name_from_location_label(location_name)
        or ""
    ).strip()
    if target_table and target_table not in active_tables:
        return False
    source_table = str(
        entry.get("source_table")
        or _extract_table_name_from_location_label(str(entry.get("source_location") or ""))
        or ""
    ).strip()
    if source_table and source_table not in active_tables:
        return False
    return True


def _filter_slot_payload_entries_to_active_tables(payload: dict[str, Any], active_tables: set[str]) -> dict[str, Any]:
    if not isinstance(payload, dict) or not active_tables:
        return payload

    filtered_payload = dict(payload)
    filtered_entries: list[dict[str, Any]] = []
    kept_location_names: set[str] = set()

    for raw_entry in payload.get("entries", []) or []:
        if not isinstance(raw_entry, dict):
            continue
        entry = dict(raw_entry)
        location_name = str(entry.get("location") or "").strip()
        if not _entry_references_only_active_tables(entry, location_name, active_tables):
            continue
        filtered_entries.append(entry)
        if location_name:
            kept_location_names.add(location_name)

    filtered_payload["entries"] = filtered_entries
    filtered_payload["enabled"] = bool(filtered_entries)

    filtered_by_location: dict[str, dict[str, Any]] = {}
    for raw_location_name, raw_entry in (payload.get("by_location", {}) or {}).items():
        if not isinstance(raw_entry, dict):
            continue
        location_name = str(raw_location_name or raw_entry.get("location") or "").strip()
        if not location_name:
            continue
        if location_name not in kept_location_names:
            if not _entry_references_only_active_tables(raw_entry, location_name, active_tables):
                continue
        filtered_by_location[location_name] = dict(raw_entry)
    filtered_payload["by_location"] = filtered_by_location
    return filtered_payload


def _build_generic_checks_payload(world: World, multiworld: MultiWorld, player: int) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "enabled": False,
        "version": 5,
        "mode": "generic_task_slots",
        "entries": [],
        "by_location": {},
    }
    pools = _load_generic_check_pools()
    if not pools:
        return payload

    grouped_tasks: dict[tuple[str, str], list[dict[str, Any]]] = {}
    deep_tasks: dict[str, list[tuple[int, dict[str, Any]]]] = {}
    deep_scores: dict[str, list[tuple[int, int, dict[str, Any]]]] = {}
    for location in world.location_table:
        name = str(location.get("name", "")).strip()
        deep_meta = _extract_deep_run_task_location(name)
        if deep_meta:
            table, index = deep_meta
            deep_tasks.setdefault(table, []).append((index, location))
            continue
        deep_score_meta = _extract_deep_run_score_location(name)
        if deep_score_meta:
            table, index, target = deep_score_meta
            deep_scores.setdefault(table, []).append((index, target, location))
            continue
        meta = _extract_generic_task_location(name)
        if not meta:
            continue
        grouped_tasks.setdefault(meta, []).append(location)

    if not grouped_tasks and not deep_tasks and not deep_scores:
        return payload

    seed_name = str(getattr(multiworld, "seed_name", ""))
    numeric_seed = str(getattr(multiworld, "seed", ""))
    shuffle_enabled = True
    rng = random.Random(f"{seed_name}|{numeric_seed}|{player}|generic_checks_v5")

    entries: list[dict[str, Any]] = []
    by_location: dict[str, dict[str, Any]] = {}
    grouped_by_table: dict[str, dict[str, list[dict[str, Any]]]] = {}
    for (table, difficulty), locations in grouped_tasks.items():
        grouped_by_table.setdefault(table, {})[difficulty] = locations

    def task_signature(pick: dict[str, Any], difficulty: str) -> str:
        title = str(pick.get("title", "")).strip()
        source_location = str(pick.get("source_location", "")).strip()
        if source_location:
            return _metasizer_normalize_lookup_key(source_location)
        if title:
            return _metasizer_normalize_lookup_key(title)
        return _metasizer_normalize_lookup_key(difficulty)

    def task_title_signature(pick: dict[str, Any], difficulty: str) -> str:
        title = str(pick.get("title", "")).strip()
        if title:
            return _metasizer_normalize_lookup_key(title)
        source_location = str(pick.get("source_location", "")).strip()
        if source_location:
            return _metasizer_normalize_lookup_key(source_location)
        return _metasizer_normalize_lookup_key(difficulty)

    def task_family_signature(table_name: str, pick: dict[str, Any], difficulty: str) -> str:
        explicit_family = _metasizer_normalize_lookup_key(str(pick.get("objective_family") or ""))
        if explicit_family:
            return f"{_metasizer_normalize_lookup_key(table_name)}:{explicit_family}"
        raw_title = str(pick.get("title", "")).strip()
        raw_source = str(pick.get("source_location", "")).strip()
        norm = _metasizer_normalize_lookup_key(f"{raw_source} {raw_title}")
        if not norm:
            return _metasizer_normalize_lookup_key(difficulty)

        if table_name == "Hollywood Heat":
            if "complete123toplanes" in norm or "completedroptargetbank" in norm:
                return "hollywood_heat:upper_playfield_progress"
        if table_name == "Cyclone":
            if "cometrampshot" in norm or "1000000cometrampshot" in norm:
                return "cyclone:comet_ramp_progress"
            if "balltosstargets" in norm:
                return "cyclone:ball_toss_targets"
            if "shootinggallerytargets" in norm:
                return "cyclone:shooting_gallery_targets"
            if "ferriswheelaward" in norm:
                return "cyclone:ferris_wheel_award"
            if "startdoublescoring" in norm:
                return "cyclone:double_scoring"
        if table_name == "Scared Stiff":
            if "lightscaredstiff" in norm or "startscaredstiff" in norm:
                return "scared_stiff:scared_stiff_progress"
            if "completeanytale" in norm or "complete2talesinonegame" in norm:
                return "scared_stiff:tale_completion"
        if table_name == "World Cup Soccer":
            if "score1goal" in norm or "score2goals" in norm or "score3goals" in norm:
                return "world_cup_soccer:goal_scoring"
        if table_name == "The Getaway":
            if "superchargercycle" in norm:
                return "the_getaway:supercharger_cycles"
        if table_name == "Taxi":
            if "pickup1passenger" in norm or "pickup2passengers" in norm or "pickup3passengers" in norm:
                return "taxi:passenger_pickups"
        if table_name == "Party Zone":
            if "cosmiccottage" in norm and "partymember" in norm:
                return "party_zone:cosmic_cottage_invites"

        if "collectsuperjackpot" in norm or "collect2multiballjackpots" in norm or "collectamultiballjackpot" in norm:
            return f"{table_name}:multiball_jackpot"
        if "startmultiballandcollectajackpot" in norm:
            return f"{table_name}:multiball_start_and_jackpot"
        if "start" in norm and "multiball" in norm:
            return f"{table_name}:multiball_start"
        if "lock1ball" in norm or "lock2balls" in norm or "lockasecondball" in norm or "lightlock" in norm:
            return f"{table_name}:multiball_lock_progress"
        if "startanymode" in norm or "startamode" in norm or "startanymission" in norm or "startanysongmode" in norm:
            return f"{table_name}:mode_start"
        if "completeanymode" in norm or "complete1mode" in norm or "completeanymission" in norm or "completeanysongmode" in norm:
            return f"{table_name}:mode_completion"
        return _generic_task_similarity_family_signature(table_name, pick, difficulty) or norm

    def combo_duplicate_count(values: list[str]) -> int:
        seen_values: set[str] = set()
        duplicates = 0
        for value in values:
            if not value:
                continue
            if value in seen_values:
                duplicates += 1
            else:
                seen_values.add(value)
        return duplicates

    def combo_category_duplicate_count(category_sets: list[set[str]]) -> int:
        counts: dict[str, int] = {}
        for category_set in category_sets:
            for category in category_set:
                counts[category] = counts.get(category, 0) + 1
        return sum(max(0, count - 1) for count in counts.values())

    def combo_rank(combo: list[tuple[str, dict[str, Any]]]) -> tuple[int, int, int, int]:
        category_sets = [entry["requirement_categories"] for _, entry in combo]
        families = [str(entry.get("family", "")) for _, entry in combo]
        signatures = [str(entry.get("signature", "")) for _, entry in combo]
        shuffled_rank_sum = sum(int(entry.get("shuffle_index", 0)) for _, entry in combo)
        return (
            combo_duplicate_count(families),
            combo_duplicate_count(signatures),
            combo_category_duplicate_count(category_sets),
            shuffled_rank_sum,
        )

    def choose_task_combo(candidates_by_difficulty: dict[str, list[dict[str, Any]]]) -> dict[str, dict[str, Any]]:
        combos: list[list[tuple[str, dict[str, Any]]]] = [[]]
        for difficulty in ("Hard", "Medium", "Easy"):
            candidates = candidates_by_difficulty.get(difficulty) or []
            if not candidates:
                continue
            combos = [combo + [(difficulty, candidate)] for combo in combos for candidate in candidates]
        best_combo: list[tuple[str, dict[str, Any]]] = []
        best_rank: tuple[int, int, int, int] | None = None
        for combo in combos:
            rank = combo_rank(combo)
            if best_rank is None or rank < best_rank:
                best_combo = combo
                best_rank = rank
        return {difficulty: candidate for difficulty, candidate in best_combo}

    def build_deep_candidates(table: str) -> tuple[dict[str, list[dict[str, Any]]], list[dict[str, Any]]]:
        candidates_by_difficulty: dict[str, list[dict[str, Any]]] = {"Easy": [], "Medium": [], "Hard": []}
        all_candidates: list[dict[str, Any]] = []
        table_pool = pools.get(table, {}) if isinstance(pools, dict) else {}
        if not isinstance(table_pool, dict):
            return candidates_by_difficulty, all_candidates
        shuffle_counter = 0
        seen_candidate_signatures: set[str] = set()
        seen_candidate_title_signatures: set[str] = set()
        seen_candidate_objective_signatures: set[str] = set()
        for difficulty in ("Easy", "Medium", "Hard"):
            raw_candidates = []
            for raw_entry in table_pool.get(difficulty, []) or []:
                if not isinstance(raw_entry, dict):
                    continue
                if str(raw_entry.get("type", "")).strip().lower() == "score":
                    continue
                if not _generic_task_allowed_for_difficulty(raw_entry, difficulty):
                    continue
                raw_candidates.append(raw_entry)
            rng.shuffle(raw_candidates)
            for raw_entry in raw_candidates:
                signature = task_signature(raw_entry, difficulty)
                title_signature = task_title_signature(raw_entry, difficulty)
                objective_signature = _generic_task_objective_signature(table, raw_entry, difficulty)
                if (
                    (signature and signature in seen_candidate_signatures)
                    or (title_signature and title_signature in seen_candidate_title_signatures)
                    or (objective_signature and objective_signature in seen_candidate_objective_signatures)
                ):
                    continue
                if signature:
                    seen_candidate_signatures.add(signature)
                if title_signature:
                    seen_candidate_title_signatures.add(title_signature)
                if objective_signature:
                    seen_candidate_objective_signatures.add(objective_signature)
                candidate = {
                    "pick": raw_entry,
                    "table": table,
                    "source_difficulty": difficulty,
                    "signature": signature,
                    "title_signature": title_signature,
                    "objective_signature": objective_signature,
                    "family": task_family_signature(table, raw_entry, difficulty),
                    "requirement_categories": _generic_task_requirement_categories(raw_entry),
                    "shuffle_index": shuffle_counter,
                }
                shuffle_counter += 1
                candidates_by_difficulty[difficulty].append(candidate)
                all_candidates.append(candidate)
        return candidates_by_difficulty, all_candidates

    def choose_deep_candidate(
        wanted_difficulty: str,
        candidates_by_difficulty: dict[str, list[dict[str, Any]]],
        all_candidates: list[dict[str, Any]],
        used_signatures: set[str],
        used_families: set[str],
        used_title_signatures: set[str],
        used_objective_signatures: set[str],
    ) -> dict[str, Any] | None:
        ordered = list(candidates_by_difficulty.get(wanted_difficulty) or [])
        if not ordered:
            return None
        ordered.sort(key=lambda candidate: (
            str(candidate.get("title_signature", "")) in used_title_signatures,
            str(candidate.get("objective_signature", "")) in used_objective_signatures,
            str(candidate.get("signature", "")) in used_signatures,
            str(candidate.get("family", "")) in used_families,
            int(candidate.get("shuffle_index", 0)),
        ))
        for candidate in ordered:
            signature = str(candidate.get("signature", ""))
            title_signature = str(candidate.get("title_signature", ""))
            objective_signature = str(candidate.get("objective_signature", ""))
            family = str(candidate.get("family", ""))
            if (
                signature
                and signature not in used_signatures
                and title_signature
                and title_signature not in used_title_signatures
                and objective_signature
                and objective_signature not in used_objective_signatures
                and family
                and family not in used_families
            ):
                return candidate
        return None

    def deep_task_confidence(
        selected: dict[str, Any],
        wanted_difficulty: str,
        family_was_used: bool,
    ) -> tuple[float, str, list[str]]:
        pick = selected.get("pick") if isinstance(selected.get("pick"), dict) else {}
        meta = _generic_task_confidence_metadata(
            str(selected.get("table", "") or ""),
            pick,
            wanted_difficulty,
            str(selected.get("source_difficulty", "") or wanted_difficulty),
            bool(pick.get("generated")),
            family_was_used,
        )
        return (
            round(float(meta["task_confidence"]) / 100.0, 2),
            str(meta["task_confidence_label"]),
            list(meta["task_confidence_reasons"]),
        )

    def build_generated_deep_candidate(
        table: str,
        difficulty: str,
        index: int,
        used_signatures: set[str],
        used_families: set[str],
        used_title_signatures: set[str],
        used_objective_signatures: set[str],
    ) -> dict[str, Any]:
        templates = DEEP_RUN_GENERATED_TASK_TEMPLATES.get(difficulty) or DEEP_RUN_GENERATED_TASK_TEMPLATES["Easy"]
        start = max(0, index - 1)
        chosen_index = start % len(templates)
        for attempt in range(len(templates)):
            template_index = (start + attempt) % len(templates)
            signature = f"generated:{_metasizer_normalize_lookup_key(table)}:{difficulty.lower()}:{template_index}"
            title_signature = _metasizer_normalize_lookup_key(templates[template_index][0])
            objective_signature = f"{_metasizer_normalize_lookup_key(table)}:{title_signature}"
            family = f"generated:{_metasizer_normalize_lookup_key(table)}:{difficulty.lower()}:{template_index}"
            if (
                signature not in used_signatures
                and family not in used_families
                and title_signature not in used_title_signatures
                and objective_signature not in used_objective_signatures
            ):
                chosen_index = template_index
                break
        title_template, explanation_template = templates[chosen_index]
        title_signature = _metasizer_normalize_lookup_key(title_template)
        objective_signature = f"{_metasizer_normalize_lookup_key(table)}:{title_signature}"
        signature = f"generated:{_metasizer_normalize_lookup_key(table)}:{difficulty.lower()}:{chosen_index}"
        family = f"generated:{_metasizer_normalize_lookup_key(table)}:{difficulty.lower()}:{chosen_index}"
        if (
            signature in used_signatures
            or family in used_families
            or title_signature in used_title_signatures
            or objective_signature in used_objective_signatures
        ):
            title_template = f"{title_template} - Deep {difficulty} {index:02d}"
            title_signature = _metasizer_normalize_lookup_key(title_template)
            objective_signature = f"{_metasizer_normalize_lookup_key(table)}:{title_signature}"
            signature = f"{signature}:{index:02d}"
            family = f"{family}:{index:02d}"
        if family in used_families:
            family = f"{family}:{index:02d}"
        pick = {
            "title": title_template,
            "explanation": explanation_template.format(table=table),
            "source_location": f"{table} - Generated Deep {difficulty} Task {index:02d}",
            "generated": True,
        }
        return {
            "pick": pick,
            "table": table,
            "source_difficulty": difficulty,
            "signature": signature,
            "title_signature": title_signature,
            "objective_signature": objective_signature,
            "family": family,
            "requirement_categories": set(),
            "shuffle_index": 100000 + index,
        }

    def selected_deep_display_signature(selected: dict[str, Any], index: int) -> str:
        pick = selected.get("pick") if isinstance(selected.get("pick"), dict) else {}
        display_name = str(pick.get("title", "")).strip() or f"Deep Task {index:02d}"
        return _metasizer_normalize_lookup_key(display_name)

    for table in sorted(deep_tasks.keys()):
        candidates_by_difficulty, all_candidates = build_deep_candidates(table)
        used_signatures: set[str] = set()
        used_families: set[str] = set()
        used_title_signatures: set[str] = set()
        used_objective_signatures: set[str] = set()
        used_display_signatures: set[str] = set()
        for index, location in sorted(deep_tasks.get(table, []), key=lambda item: item[0]):
            loc_name = str(location.get("name", "")).strip()
            difficulty = _deep_run_slot_difficulty(index)
            selected = choose_deep_candidate(
                difficulty,
                candidates_by_difficulty,
                all_candidates,
                used_signatures,
                used_families,
                used_title_signatures,
                used_objective_signatures,
            )
            if not selected:
                raise RuntimeError(
                    f"Deep Run table '{table}' is missing a unique table-specific {difficulty} task for slot {index:02d}"
                )
            display_signature = selected_deep_display_signature(selected, index) if selected else ""
            if display_signature and display_signature in used_display_signatures:
                raise RuntimeError(
                    f"Deep Run table '{table}' repeated task title '{selected.get('pick', {}).get('title', '')}'"
                )
            pick = selected["pick"]
            signature = str(selected.get("signature", ""))
            title_signature = str(selected.get("title_signature", ""))
            objective_signature = str(selected.get("objective_signature", ""))
            family = str(selected.get("family", ""))
            family_was_used = bool(family and family in used_families)
            confidence_score, confidence_label, confidence_reasons = deep_task_confidence(
                selected,
                difficulty,
                family_was_used,
            )
            if signature:
                used_signatures.add(signature)
            if title_signature:
                used_title_signatures.add(title_signature)
            if objective_signature:
                used_objective_signatures.add(objective_signature)
            if family:
                used_families.add(family)
            requirement_categories = set(selected.get("requirement_categories") or set())
            display_name = str(pick.get("title", "")).strip() or f"Deep Task {index:02d}"
            display_signature = _metasizer_normalize_lookup_key(display_name)
            if display_signature:
                used_display_signatures.add(display_signature)
            explanation = str(pick.get("explanation", "")).strip()
            source_location = str(pick.get("source_location", "")).strip()
            entry = {
                "location": loc_name,
                "table": table,
                "difficulty": difficulty,
                "source_difficulty": str(selected.get("source_difficulty", "") or difficulty),
                "kind": "task",
                "task_type": "task",
                "deep_run": True,
                "deep_run_index": index,
                "display_name": display_name,
                "objective": display_name,
                "explanation": explanation,
                "source_location": source_location,
                "task_signature": signature,
                "task_title_signature": title_signature,
                "task_objective_signature": objective_signature,
                "task_family": family,
                "requirement_categories": sorted(requirement_categories),
                "generated": bool(pick.get("generated")),
                "confidence": confidence_score,
                "task_confidence": int(round(confidence_score * 100)),
                "confidence_label": confidence_label,
                "task_confidence_label": confidence_label,
                "confidence_reasons": confidence_reasons,
                "task_confidence_reasons": confidence_reasons,
                "duplicate_guard": "exact_objective_unique",
                "randomized": shuffle_enabled,
            }
            entries.append(entry)
            by_location[loc_name] = entry

    for table in sorted(deep_scores.keys()):
        for index, target, location in sorted(deep_scores.get(table, []), key=lambda item: item[0]):
            loc_name = str(location.get("name", "")).strip()
            difficulty = _deep_run_slot_difficulty(index)
            target_value = int(target or 0)
            if target_value <= 0:
                table_pool = pools.get(table, {}) if isinstance(pools, dict) else {}
                targets = _boss_table_score_targets(table_pool if isinstance(table_pool, dict) else {})
                if 0 <= index - 1 < len(targets):
                    target_value = int(targets[index - 1])
            target_text = f"{target_value:,}+" if target_value > 0 else "Score Target"
            objective = f"Obtain a score of {target_text}" if target_value > 0 else "Obtain the listed score target"
            entry = {
                "location": loc_name,
                "table": table,
                "difficulty": difficulty,
                "kind": "score",
                "task_type": "score",
                "type": "score",
                "deep_run": True,
                "deep_run_index": index,
                "display_name": objective,
                "objective": objective,
                "score_target": target_value,
                "score_target_text": target_text,
                "explanation": f"Build score to at least {target_text} on {table} before drain.",
                "source_location": f"{table} - Deep Score ({target_text})",
                "randomized": shuffle_enabled,
            }
            entries.append(entry)
            by_location[loc_name] = entry

    for table in sorted(grouped_by_table.keys()):
        candidates_by_difficulty: dict[str, list[dict[str, Any]]] = {}
        for difficulty in ("Easy", "Medium", "Hard"):
            locations = grouped_by_table.get(table, {}).get(difficulty, [])
            if not locations:
                continue
            pool = list((pools.get(table, {}) or {}).get(difficulty, []) or [])
            if not pool:
                continue
            task_entries = [
                entry
                for entry in pool
                if str(entry.get("type", "")).strip().lower() != "score"
                and _generic_task_allowed_for_difficulty(entry, difficulty)
            ]
            if not task_entries:
                continue
            candidates = list(task_entries)
            if shuffle_enabled:
                rng.shuffle(candidates)
            candidates_by_difficulty[difficulty] = [
                {
                    "pick": candidate,
                    "signature": task_signature(candidate, difficulty),
                    "title_signature": task_title_signature(candidate, difficulty),
                    "objective_signature": _generic_task_objective_signature(table, candidate, difficulty),
                    "family": task_family_signature(table, candidate, difficulty),
                    "requirement_categories": _generic_task_requirement_categories(candidate),
                    "shuffle_index": idx,
                }
                for idx, candidate in enumerate(candidates)
            ]

        selected_by_difficulty = choose_task_combo(candidates_by_difficulty)
        for difficulty in ("Easy", "Medium", "Hard"):
            selected = selected_by_difficulty.get(difficulty)
            if not selected:
                continue
            locations = grouped_by_table.get(table, {}).get(difficulty, [])
            if not locations:
                continue
            pick = selected["pick"]
            signature = str(selected.get("signature", ""))
            title_signature = str(selected.get("title_signature", ""))
            objective_signature = str(selected.get("objective_signature", ""))
            family = str(selected.get("family", ""))
            requirement_categories = set(selected.get("requirement_categories") or set())
            confidence_meta = _generic_task_confidence_metadata(
                table,
                pick,
                difficulty,
                difficulty,
                bool(pick.get("generated")),
                False,
            )
            display_name = str(pick.get("title", "")).strip() or f"{difficulty} Task"
            explanation = str(pick.get("explanation", "")).strip()
            source_location = str(pick.get("source_location", "")).strip()
            for location in sorted(locations, key=lambda loc: str(loc.get("name", ""))):
                loc_name = str(location.get("name", "")).strip()
                entry = {
                    "location": loc_name,
                    "table": table,
                    "difficulty": difficulty,
                    "kind": "task",
                    "task_type": "task",
                    "display_name": display_name,
                    "objective": display_name,
                    "explanation": explanation,
                    "source_location": source_location,
                    "task_signature": signature,
                    "task_title_signature": title_signature,
                    "task_objective_signature": objective_signature,
                    "task_family": family,
                    "requirement_categories": sorted(requirement_categories),
                    "confidence": round(float(confidence_meta["task_confidence"]) / 100.0, 2),
                    "task_confidence": confidence_meta["task_confidence"],
                    "confidence_label": confidence_meta["task_confidence_label"],
                    "task_confidence_label": confidence_meta["task_confidence_label"],
                    "confidence_reasons": confidence_meta["task_confidence_reasons"],
                    "task_confidence_reasons": confidence_meta["task_confidence_reasons"],
                    "duplicate_guard": "exact_objective_unique",
                    "randomized": shuffle_enabled,
                }
                entries.append(entry)
                by_location[loc_name] = entry

    if deep_tasks or deep_scores:
        expected_difficulties = {"easy": 4, "medium": 4, "hard": 2}
        deep_entries_by_table: dict[str, list[dict[str, Any]]] = {}
        for entry in entries:
            if entry.get("deep_run"):
                deep_entries_by_table.setdefault(str(entry.get("table", "")), []).append(entry)

        integrity_issues: list[str] = []
        for table in sorted(set(deep_tasks) | set(deep_scores)):
            table_entries = deep_entries_by_table.get(table, [])
            task_entries = [entry for entry in table_entries if entry.get("kind") == "task"]
            score_entries = [entry for entry in table_entries if entry.get("kind") == "score"]
            if len(task_entries) != 10 or len(score_entries) != 10:
                integrity_issues.append(
                    f"{table}: expected 10 table tasks and 10 score tasks; "
                    f"got {len(task_entries)} and {len(score_entries)}"
                )

            for kind, kind_entries in (("task", task_entries), ("score", score_entries)):
                indexes = sorted(int(entry.get("deep_run_index", 0) or 0) for entry in kind_entries)
                if indexes != list(range(1, 11)):
                    integrity_issues.append(f"{table}: {kind} indexes are {indexes}")
                difficulty_counts = {
                    difficulty: sum(
                        1
                        for entry in kind_entries
                        if str(entry.get("difficulty", "")).strip().lower() == difficulty
                    )
                    for difficulty in expected_difficulties
                }
                if difficulty_counts != expected_difficulties:
                    integrity_issues.append(f"{table}: {kind} difficulty split is {difficulty_counts}")

            objective_keys = [
                _metasizer_normalize_lookup_key(entry.get("objective") or entry.get("display_name") or "")
                for entry in task_entries
            ]
            objective_keys = [key for key in objective_keys if key]
            if len(objective_keys) != len(set(objective_keys)):
                integrity_issues.append(f"{table}: duplicate table task objective")

            family_keys = [str(entry.get("task_family", "") or "").strip() for entry in task_entries]
            if any(not key for key in family_keys) or len(family_keys) != len(set(family_keys)):
                integrity_issues.append(f"{table}: duplicate or missing table task family")

            ordered_scores = sorted(score_entries, key=lambda entry: int(entry.get("deep_run_index", 0) or 0))
            score_targets = [int(entry.get("score_target", 0) or 0) for entry in ordered_scores]
            if (
                any(target <= 0 for target in score_targets)
                or len(score_targets) != len(set(score_targets))
                or score_targets != sorted(score_targets)
            ):
                integrity_issues.append(f"{table}: score ladder is not positive, unique, and ascending")

        if integrity_issues:
            raise ValueError("Deep Run check integrity failed: " + "; ".join(integrity_issues))

    payload["enabled"] = bool(entries)
    payload["entries"] = entries
    payload["by_location"] = by_location
    return payload


def _build_boss_table_checks_payload(
    boss_table_name: str,
    seed_name: str,
    numeric_seed: str,
    player: int,
) -> dict[str, Any]:
    table_name = str(boss_table_name or "").strip()
    payload: dict[str, Any] = {
        "enabled": False,
        "version": 1,
        "table": table_name,
        "entries": [],
        "by_location": {},
    }
    if not table_name:
        return payload

    pools = _load_generic_check_pools()
    table_pool = pools.get(table_name, {}) if isinstance(pools, dict) else {}
    if not isinstance(table_pool, dict):
        return payload

    candidates: list[dict[str, Any]] = []
    seen_signatures: set[str] = set()
    for difficulty in ("Easy", "Medium", "Hard"):
        for raw_entry in table_pool.get(difficulty, []) or []:
            if not isinstance(raw_entry, dict):
                continue
            if str(raw_entry.get("type", "")).strip().lower() == "score":
                continue
            if not _generic_task_allowed_for_difficulty(raw_entry, difficulty):
                continue
            signature = _metasizer_normalize_lookup_key(
                str(raw_entry.get("source_location") or "") + " " + str(raw_entry.get("title") or "")
            )
            if signature and signature in seen_signatures:
                continue
            if signature:
                seen_signatures.add(signature)
            entry = dict(raw_entry)
            entry["difficulty"] = difficulty
            candidates.append(entry)

    rng = random.Random(f"{seed_name}|{numeric_seed}|{player}|boss_table_checks_v1|{table_name}")
    rng.shuffle(candidates)

    entries: list[dict[str, Any]] = []
    by_location: dict[str, dict[str, Any]] = {}
    if candidates:
        for idx, location_name in enumerate(BOSS_TABLE_TASK_LOCATION_NAMES):
            pick = candidates[idx % len(candidates)]
            title = str(pick.get("title") or "").strip() or str(pick.get("source_location") or "").strip() or "Boss Task"
            entry = {
                "location": location_name,
                "table": table_name,
                "target_table": table_name,
                "source_table": table_name,
                "kind": "task",
                "task_type": "task",
                "difficulty": str(pick.get("difficulty") or "").strip(),
                "display_name": title,
                "objective": title,
                "explanation": str(pick.get("explanation") or "").strip(),
                "source_location": str(pick.get("source_location") or "").strip(),
                "randomized": True,
                "slot_index": idx,
            }
            entries.append(entry)
            by_location[location_name] = entry

    score_targets = _boss_table_score_targets(table_pool)
    for score_idx, location_name in enumerate(BOSS_TABLE_SCORE_LOCATION_NAMES):
        target_value = score_targets[score_idx % len(score_targets)]
        target_text = f"{target_value:,}+"
        difficulty = _deep_run_slot_difficulty(score_idx + 1)
        objective = f"Obtain a score of {target_text}"
        entry = {
            "location": location_name,
            "table": table_name,
            "target_table": table_name,
            "source_table": table_name,
            "kind": "score",
            "task_type": "score",
            "type": "score",
            "difficulty": difficulty,
            "display_name": objective,
            "objective": objective,
            "score_target": target_value,
            "score_target_text": target_text,
            "explanation": f"Build score to at least {target_text} on {table_name} before drain.",
            "source_location": f"{table_name} - Boss Score ({target_text})",
            "randomized": True,
            "slot_index": len(BOSS_TABLE_TASK_LOCATION_NAMES) + score_idx,
        }
        entries.append(entry)
        by_location[location_name] = entry

    payload["enabled"] = bool(entries)
    payload["entries"] = entries
    payload["by_location"] = by_location
    return payload


def _boss_table_score_targets(table_pool: dict[str, Any]) -> list[int]:
    anchors: list[int] = []
    for difficulty in ("Easy", "Medium", "Hard"):
        for raw_entry in table_pool.get(difficulty, []) or []:
            if not isinstance(raw_entry, dict):
                continue
            if str(raw_entry.get("type", "")).strip().lower() != "score":
                continue
            value = _extract_score_value(raw_entry.get("title"))
            if value > 0:
                anchors.append(value)
                break
    anchors = sorted(set(anchors))
    if not anchors:
        return [100000, 250000, 500000, 1000000, 2500000, 5000000, 10000000, 25000000, 50000000, 100000000]
    if len(anchors) == 1:
        easy = anchors[0]
        medium = max(easy + 1, int(easy * 2.4))
        hard = max(medium + 1, int(easy * 5.2))
    elif len(anchors) == 2:
        easy, medium = anchors[0], anchors[1]
        hard = max(medium + 1, int(medium + (medium - easy) * 1.65))
    else:
        easy, medium, hard = anchors[0], anchors[len(anchors) // 2], anchors[-1]
    raw_targets = [
        easy * 0.55,
        easy * 0.75,
        easy,
        easy + (medium - easy) * 0.25,
        easy + (medium - easy) * 0.55,
        medium,
        medium + (hard - medium) * 0.30,
        medium + (hard - medium) * 0.65,
        hard,
        hard * 1.25,
    ]
    targets: list[int] = []
    for raw_target in raw_targets:
        target = _round_boss_score_target(raw_target)
        if targets:
            while target <= targets[-1]:
                target = _round_boss_score_target(targets[-1] + _boss_score_rounding_step(targets[-1]))
        targets.append(target)
    return targets


def _extract_score_value(value: Any) -> int:
    match = re.search(r"([\d,]+)\s*\+", str(value or ""))
    if not match:
        return 0
    try:
        return int(match.group(1).replace(",", ""))
    except ValueError:
        return 0


def _boss_score_rounding_step(value: float) -> int:
    amount = abs(float(value or 0))
    if amount >= 100_000_000:
        return 5_000_000
    if amount >= 10_000_000:
        return 1_000_000
    if amount >= 1_000_000:
        return 100_000
    if amount >= 100_000:
        return 10_000
    return 5_000


def _round_boss_score_target(value: float) -> int:
    step = _boss_score_rounding_step(value)
    return max(step, int(round(float(value or 0) / step) * step))


def _register_static_deep_run_location_ids() -> None:
    """Reserve stable Deep Run location IDs for every table in the roster."""
    pools = _load_generic_check_pools()
    if not isinstance(pools, dict) or not pools:
        return

    next_id = max(
        [int(value) for value in location_id_to_name.keys() if isinstance(value, int)] or [0]
    ) + 1

    def register(name: str, category: list[str], region: str) -> None:
        nonlocal next_id
        if name in location_name_to_id:
            return
        location = {
            "id": next_id,
            "name": name,
            "region": region,
            "category": category,
            "requires": "",
            "deep_run_static": True,
        }
        location_table.append(location)
        location_id_to_name[next_id] = name
        location_name_to_id[name] = next_id
        location_name_to_location[name] = location
        for category_name in category:
            group = location_name_groups.setdefault(str(category_name), [])
            if name not in group:
                group.append(name)
        next_id += 1

    for table_name in sorted(str(name or "").strip() for name in pools if str(name or "").strip()):
        table_pool = pools.get(table_name, {})
        if not isinstance(table_pool, dict):
            continue
        table_category = _table_location_category(table_name)
        for index in range(1, DEEP_RUN_TASKS_PER_TABLE + 1):
            difficulty = _deep_run_slot_difficulty(index)
            register(
                f"{table_name} - Deep Task {index:02d}",
                [table_category, "Generic", "DeepRun", difficulty, "Task"],
                _deep_run_slot_region(index),
            )

        score_targets = _boss_table_score_targets(table_pool)
        if len(score_targets) < DEEP_RUN_SCORE_CHECKS_PER_TABLE:
            raise ValueError(f"Deep Run score ladder is incomplete for {table_name}")
        for index, target in enumerate(score_targets[:DEEP_RUN_SCORE_CHECKS_PER_TABLE], start=1):
            difficulty = _deep_run_slot_difficulty(index)
            register(
                f"{table_name} - Deep Score {index:02d} ({int(target):,}+)",
                [table_category, "Generic", "DeepRun", difficulty, "Score"],
                _deep_run_slot_region(index),
            )


_register_static_deep_run_location_ids()


def _get_generic_checks_payload(world: World, multiworld: MultiWorld, player: int) -> dict[str, Any]:
    cached = getattr(world, "_generic_checks_payload", None)
    if isinstance(cached, dict):
        return cached
    ut_payload = _get_ut_slot_payload(world, GENERIC_CHECKS_SLOT_KEY)
    if isinstance(ut_payload, dict):
        setattr(world, "_generic_checks_payload", ut_payload)
        return ut_payload
    payload = _build_generic_checks_payload(world, multiworld, player)
    setattr(world, "_generic_checks_payload", payload)
    return payload

########################################################################################
## Order of method calls when the world generates:
##    1. create_regions - Creates regions and locations
##    2. create_items - Creates the item pool
##    3. set_rules - Creates rules for accessing regions and locations
##    4. generate_basic - Runs any post item pool options, like place item/category
##    5. pre_fill - Creates the victory location
##
## The create_item method is used by plando and start_inventory settings to create an item from an item name.
## The fill_slot_data method will be used to send data to the Manual client for later use, like deathlink.
########################################################################################



# Use this function to change the valid filler items to be created to replace item links or starting items.
# Default value is the `filler_item_name` from game.json
def hook_get_filler_item_name(world: World, multiworld: MultiWorld, player: int) -> str | bool:
    return False

# Called before regions and locations are created. Not clear why you'd want this, but it's here. Victory location is included, but Victory event is not placed yet.
def before_create_regions(world: World, multiworld: MultiWorld, player: int):
    metasizer_payload = _get_metasizer_table_set_payload(world, multiworld, player)
    if not metasizer_payload.get("enabled"):
        return

    active_tables = _get_metasizer_active_table_names(world, multiworld, player)
    if not active_tables:
        return

    deep_run_enabled = _metasizer_payload_is_deep_run(metasizer_payload)
    original_locations = list(getattr(world, "location_table", []) or [])
    kept_locations: list[dict[str, Any]] = []
    removed_location_names: list[str] = []
    for location in original_locations:
        location_name = str(location.get("name") or "").strip()
        if location.get("deep_run_static"):
            continue
        table_name = _extract_metasizer_location_table_name(location_name)
        if table_name and table_name not in active_tables:
            removed_location_names.append(location_name)
            continue
        if table_name and deep_run_enabled:
            removed_location_names.append(location_name)
            continue
        kept_locations.append(location)

    if deep_run_enabled:
        kept_locations.extend(_build_deep_run_locations(world, metasizer_payload))

    world.location_table = kept_locations
    world._metasizer_removed_location_names = removed_location_names
    starting_open_tables = [
        str(name or "").strip()
        for name in metasizer_payload.get("starting_open_tables", [])
        if str(name or "").strip() in active_tables
    ]
    world._metasizer_starting_items_override = [
        {"items": [_progressive_ball_item_name_for_table(name, world)], "random": 1}
        for name in starting_open_tables
    ]
    logging.info(
        "Base Game: filtered locations to %d active tables (%d kept, %d removed).",
        len(active_tables),
        len(kept_locations),
        len(removed_location_names),
    )

# Called after regions and locations are created, in case you want to see or modify that information. Victory location is included.
def after_create_regions(world: World, multiworld: MultiWorld, player: int):
    # Use this hook to remove locations from the world
    locationNamesToRemove: list[str] = list(getattr(world, "_metasizer_removed_location_names", []) or []) # List of location names

    for region in multiworld.regions:
        if region.player == player:
            for location in list(region.locations):
                if location.name in locationNamesToRemove:
                    region.locations.remove(location)

# This hook allows you to access the item names & counts before the items are created. Use this to increase/decrease the amount of a specific item in the pool
# Valid item_config key/values:
# {"Item Name": 5} <- This will create qty 5 items using all the default settings
# {"Item Name": {"useful": 7}} <- This will create qty 7 items and force them to be classified as useful
# {"Item Name": {"progression": 2, "useful": 1}} <- This will create 3 items, with 2 classified as progression and 1 as useful
# {"Item Name": {0b0110: 5}} <- If you know the special flag for the item classes, you can also define non-standard options. This setup
#       will create 5 items that are the "useful trap" class
# {"Item Name": {ItemClassification.useful: 5}} <- You can also use the classification directly
def before_create_items_all(item_config: dict[str, int|dict], world: World, multiworld: MultiWorld, player: int) -> dict[str, int|dict]:
    active_tables = _get_metasizer_active_table_names(world, multiworld, player)
    filtered_config: dict[str, int | dict] = dict(item_config)
    metasizer_payload = _get_metasizer_table_set_payload(world, multiworld, player)
    deep_run_enabled = _metasizer_payload_is_deep_run(metasizer_payload)

    if not active_tables:
        for feature_item in _feature_key_item_names():
            filtered_config[feature_item] = 0
        return filtered_config

    removed_ball_items = 0
    for item_name in list(filtered_config.keys()):
        if not str(item_name or "").startswith(PROGRESSIVE_BALL_ITEM_PREFIX):
            continue
        table_name = _extract_metasizer_progressive_ball_table_name(item_name)
        if table_name and table_name in active_tables:
            continue
        filtered_config[item_name] = 0
        removed_ball_items += 1

    if removed_ball_items:
        logging.info(
            "Base Game: removed %d inactive Progressive Ball items from the pool.",
            removed_ball_items,
        )

    feature_payload = metasizer_payload.get("feature_unlock") if isinstance(metasizer_payload.get("feature_unlock"), dict) else {}
    enabled_feature_items = set(feature_payload.get("feature_key_items", []) or []) if feature_payload.get("enabled") else set()
    feature_item_counts = feature_payload.get("feature_key_item_counts", {}) if isinstance(feature_payload, dict) else {}
    for feature_item in _feature_key_item_names():
        if feature_item in enabled_feature_items:
            filtered_config[feature_item] = max(1, int(feature_item_counts.get(feature_item, FEATURE_KEY_PIECES_REQUIRED) or FEATURE_KEY_PIECES_REQUIRED))
        else:
            filtered_config[feature_item] = 0
    if enabled_feature_items:
        logging.info(
            "Base Game: enabled %d Feature Key item(s) for Feature Unlock gating (%d pieces each).",
            len(enabled_feature_items),
            FEATURE_KEY_PIECES_REQUIRED,
        )
    if deep_run_enabled:
        filtered_config["Boss Key"] = DEEP_RUN_BOSS_KEYS_SEEDED
        filtered_config["Bagatelle Bonus Game"] = 6
        for item_name, cap in (
            ("Easy Junk Piece (1 of 3)", 3),
            ("Medium Junk Piece (1 of 3)", 3),
            ("Pinball Fragment (1 of 5)", 4),
        ):
            if item_name in filtered_config:
                try:
                    filtered_config[item_name] = min(int(filtered_config.get(item_name) or 0), cap)
                except (TypeError, ValueError):
                    filtered_config[item_name] = cap
    return filtered_config

# The item pool before starting items are processed, in case you want to see the raw item pool at that stage
def before_create_items_starting(item_pool: list, world: World, multiworld: MultiWorld, player: int) -> list:
    return item_pool

# The item pool after starting items are processed but before filler is added, in case you want to see the raw item pool at that stage
def before_create_items_filler(item_pool: list, world: World, multiworld: MultiWorld, player: int) -> list:
    # Use this hook to remove items from the item pool
    itemNamesToRemove: list[str] = [] # List of item names

    # Add your code here to calculate which items to remove.
    #
    # Because multiple copies of an item can exist, you need to add an item name
    # to the list multiple times if you want to remove multiple copies of it.

    for itemName in itemNamesToRemove:
        item = next(i for i in item_pool if i.name == itemName)
        item_pool.remove(item)

    return item_pool

    # Some other useful hook options:

    ## Place an item at a specific location
    # location = next(l for l in multiworld.get_unfilled_locations(player=player) if l.name == "Location Name")
    # item_to_place = next(i for i in item_pool if i.name == "Item Name")
    # location.place_locked_item(item_to_place)
    # item_pool.remove(item_to_place)

# The complete item pool prior to being set for generation is provided here, in case you want to make changes to it
def after_create_items(item_pool: list, world: World, multiworld: MultiWorld, player: int) -> list:
    return item_pool

# Called before rules for accessing regions and locations are created. Not clear why you'd want this, but it's here.
def before_set_rules(world: World, multiworld: MultiWorld, player: int):
    pass

# Called after rules for accessing regions and locations are created, in case you want to see or modify that information.
def after_set_rules(world: World, multiworld: MultiWorld, player: int):
    required_boss_keys = get_option_value(multiworld, player, "boss_keys_required_for_boss_table_open")
    if not isinstance(required_boss_keys, int):
        required_boss_keys = 3
    required_boss_keys = max(1, min(10, required_boss_keys))

    metasizer_payload = _get_metasizer_table_set_payload(world, multiworld, player)
    if _metasizer_payload_is_deep_run(metasizer_payload):
        required_boss_keys = DEEP_RUN_BOSS_KEYS_REQUIRED

    try:
        boss_region = multiworld.get_region("Boss Sphere", player)
    except Exception:
        logging.warning("Manual Pinball: Could not find Boss Sphere region to apply boss key requirement.")
        return

    boss_table_name = str(metasizer_payload.get("boss_table_name") or metasizer_payload.get("boss_table") or "").strip()
    boss_feature_items = _feature_gate_item_names_for_table(boss_table_name) if (
        isinstance(metasizer_payload.get("feature_unlock"), dict)
        and metasizer_payload["feature_unlock"].get("enabled")
    ) else []

    # Replace the generated requirement so this can be tuned per-player via option.
    for entrance in boss_region.entrances:
        entrance.access_rule = lambda state, p=player, req=required_boss_keys, feature_items=tuple(boss_feature_items): (
            state.has("Boss Key", p, req)
            and all(state.has(item_name, p, FEATURE_KEY_PIECES_REQUIRED) for item_name in feature_items)
        )

    if boss_feature_items:
        logging.info(
            "Manual Pinball: Boss table unlock requirement set to %d Boss Keys plus Feature Keys: %s.",
            required_boss_keys,
            ", ".join(boss_feature_items),
        )
    else:
        logging.info("Manual Pinball: Boss table unlock requirement set to %d Boss Keys.", required_boss_keys)

# The item name to create is provided before the item is created, in case you want to make changes to it
def before_create_item(item_name: str, world: World, multiworld: MultiWorld, player: int) -> str:
    item_def = getattr(world, "item_name_to_item", {}).get(item_name, {})
    if isinstance(item_def, dict) and item_def.get("trap") and not is_item_enabled(multiworld, player, item_def):
        enabled_traps = [
            name
            for name, trap_def in getattr(world, "item_name_to_item", {}).items()
            if isinstance(trap_def, dict)
            and trap_def.get("trap")
            and is_item_enabled(multiworld, player, trap_def)
        ]
        if enabled_traps:
            return world.random.choice(enabled_traps)
        return hook_get_filler_item_name(world, multiworld, player) or getattr(world, "filler_item_name", "Junk")
    return item_name

# The item that was created is provided after creation, in case you want to modify the item
def after_create_item(item: ManualItem, world: World, multiworld: MultiWorld, player: int) -> ManualItem:
    return item

# This method is run towards the end of pre-generation, before the place_item options have been handled and before AP generation occurs
def before_generate_basic(world: World, multiworld: MultiWorld, player: int):
    # Keep Easy checks spicy: guarantee exactly one Easy location can (and will) hold a Boss Key.
    metasizer_payload = _get_metasizer_table_set_payload(world, multiworld, player)
    deep_run_enabled = _metasizer_payload_is_deep_run(metasizer_payload)
    deep_run_starting_open_tables = {
        str(name or "").strip()
        for name in metasizer_payload.get("starting_open_tables", [])
        if str(name or "").strip()
    } if deep_run_enabled else set()

    def forbid_location_item(manual_location: dict[str, Any], item_name: str) -> None:
        dont_place_item = manual_location.get("dont_place_item")
        if isinstance(dont_place_item, list):
            if item_name not in dont_place_item:
                dont_place_item.append(item_name)
        elif dont_place_item is None:
            manual_location["dont_place_item"] = [item_name]
        elif str(dont_place_item) != item_name:
            manual_location["dont_place_item"] = [str(dont_place_item), item_name]

    def remove_location_item_forbid(manual_location: dict[str, Any], item_name: str) -> None:
        dont_place_item = manual_location.get("dont_place_item")
        if isinstance(dont_place_item, list):
            manual_location["dont_place_item"] = [item for item in dont_place_item if str(item) != item_name]
            if not manual_location["dont_place_item"]:
                manual_location.pop("dont_place_item", None)
        elif dont_place_item is not None and str(dont_place_item) == item_name:
            manual_location.pop("dont_place_item", None)

    def remove_location_place_item(manual_location: dict[str, Any], item_name: str) -> None:
        place_item = manual_location.get("place_item")
        if isinstance(place_item, list):
            manual_location["place_item"] = [item for item in place_item if str(item) != item_name]
            if not manual_location["place_item"]:
                manual_location.pop("place_item", None)
        elif place_item is not None and str(place_item) == item_name:
            manual_location.pop("place_item", None)

    easy_candidates: list[dict] = []
    deep_run_candidates: list[dict[str, Any]] = []
    for location in multiworld.get_unfilled_locations(player=player):
        manual_location = location_name_to_location.get(location.name)
        if not manual_location:
            continue
        if deep_run_enabled and (
            _extract_deep_run_task_location(str(manual_location.get("name", "") or ""))
            or _extract_deep_run_score_location(str(manual_location.get("name", "") or ""))
        ):
            deep_run_candidates.append(manual_location)
        if deep_run_starting_open_tables:
            table_name = _extract_metasizer_location_table_name(str(manual_location.get("name", "") or ""))
            if table_name in deep_run_starting_open_tables:
                forbid_location_item(manual_location, "Boss Key")
                remove_location_place_item(manual_location, "Boss Key")
        if str(manual_location.get("region", "")).strip() != "Ball 1 Sphere":
            continue
        easy_candidates.append(manual_location)

    if deep_run_enabled:
        active_entries = [
            dict(entry) for entry in metasizer_payload.get("active_table_entries", []) or []
            if isinstance(entry, dict) and str(entry.get("name") or "").strip()
        ]
        feature_payload = metasizer_payload.get("feature_unlock") if isinstance(metasizer_payload.get("feature_unlock"), dict) else {}
        definitions = _feature_key_definition_by_id()
        key_order = [
            str(gate_id or "").strip()
            for gate_id in feature_payload.get("deep_run_key_order", []) or []
            if str(gate_id or "").strip()
        ]
        tier_tables: dict[int, list[str]] = {tier: [] for tier in range(5)}
        table_gate_ids: dict[str, list[str]] = {}
        for entry in active_entries:
            table_name = str(entry.get("name") or "").strip()
            tier = max(0, min(4, int(entry.get("deep_run_lock_count") or 0)))
            tier_tables[tier].append(table_name)
            table_gate_ids[table_name] = [str(gate_id or "").strip() for gate_id in entry.get("feature_gates", []) or [] if str(gate_id or "").strip()]

        reserved_location_names: set[str] = set()

        def deep_location_meta(manual_location: dict[str, Any]) -> tuple[str, int] | None:
            raw_name = str(manual_location.get("name") or "").strip()
            task_meta = _extract_deep_run_task_location(raw_name)
            if task_meta:
                return task_meta
            score_meta = _extract_deep_run_score_location(raw_name)
            if score_meta:
                return score_meta[0], score_meta[1]
            return None

        def reserve_deep_item(
            item_name: str,
            source_tables: list[str],
            preferred_indices: tuple[int, ...] = (1, 2, 3, 4),
            avoid_source_table: str = "",
        ) -> str:
            table_set = {str(name or "").strip() for name in source_tables if str(name or "").strip()}
            candidates: list[dict[str, Any]] = []
            for manual_location in deep_run_candidates:
                raw_name = str(manual_location.get("name") or "").strip()
                if not raw_name or raw_name in reserved_location_names or manual_location.get("place_item"):
                    continue
                meta = deep_location_meta(manual_location)
                if not meta:
                    continue
                table_name, index = meta
                if table_name not in table_set or index not in preferred_indices:
                    continue
                if avoid_source_table and table_name == avoid_source_table:
                    continue
                candidates.append(manual_location)
            if not candidates and avoid_source_table:
                return reserve_deep_item(item_name, source_tables, preferred_indices, "")
            if not candidates:
                return ""
            world.random.shuffle(candidates)
            chosen = candidates[0]
            remove_location_item_forbid(chosen, item_name)
            chosen["place_item"] = [item_name]
            chosen_name = str(chosen.get("name") or "").strip()
            reserved_location_names.add(chosen_name)
            return chosen_name

        # Five complete Feature Keys form the Deep Run route: 1 in starters,
        # 2 in one-lock tables, 1 in two-lock tables, and 1 in three-lock tables.
        feature_placements: list[tuple[str, list[str]]] = []
        if len(key_order) >= 5:
            unlock_a = key_order[0]
            first_tier_sources = [
                table_name for table_name in tier_tables[1]
                if table_gate_ids.get(table_name) == [unlock_a]
            ] or list(tier_tables[1])
            feature_placements = [
                (key_order[0], list(tier_tables[0])),
                (key_order[1], first_tier_sources),
                (key_order[2], first_tier_sources),
                (key_order[3], list(tier_tables[2])),
                (key_order[4], list(tier_tables[3])),
            ]
        placed_feature_pieces = 0
        for gate_id, source_tables in feature_placements:
            item_name = str((definitions.get(gate_id) or {}).get("item") or "").strip()
            if not item_name:
                continue
            for _ in range(FEATURE_KEY_PIECES_REQUIRED):
                if reserve_deep_item(item_name, source_tables):
                    placed_feature_pieces += 1

        expected_feature_pieces = len(feature_placements) * FEATURE_KEY_PIECES_REQUIRED
        if placed_feature_pieces != expected_feature_pieces:
            raise RuntimeError(
                f"Deep Run progression could only place {placed_feature_pieces}/{expected_feature_pieces} Feature Key pieces"
            )

        # Seed ten Boss Keys across ten different gated tables. Any four open
        # the boss, so a run has route flexibility without starter-sphere keys.
        boss_index_preferences = {
            1: (5, 6, 7, 8),
            2: (5, 6, 7, 8),
            3: (9, 10),
            4: (9, 10),
        }
        boss_tier_quotas = {1: 3, 2: 3, 3: 2, 4: 2}
        forced_boss_locations: list[str] = []
        for tier in (1, 2, 3, 4):
            source_tables = list(tier_tables[tier])
            world.random.shuffle(source_tables)
            for source_table in source_tables[:boss_tier_quotas[tier]]:
                chosen_name = reserve_deep_item("Boss Key", [source_table], boss_index_preferences[tier])
                if not chosen_name:
                    chosen_name = reserve_deep_item("Boss Key", [source_table], tuple(range(1, 11)))
                if chosen_name:
                    forced_boss_locations.append(chosen_name)
        if len(forced_boss_locations) != DEEP_RUN_BOSS_KEYS_SEEDED:
            raise RuntimeError(
                f"Deep Run progression could only place {len(forced_boss_locations)}/{DEEP_RUN_BOSS_KEYS_SEEDED} Boss Keys"
            )
        world._forced_easy_boss_key_location = ""
        world._forced_deep_run_boss_key_locations = list(forced_boss_locations)

        # Guarantee every newly unlocked tier has its first playable ball in
        # the previous tier, then spend the remaining preferences on tables
        # that are already playable at that stage.
        ball_counts = {table_name: (1 if table_name in deep_run_starting_open_tables else 0) for table_name in table_gate_ids}
        ball_plan: list[tuple[int, list[int]]] = [
            (0, [1, 1, 1, 1, 0, 0]),
            (1, [2, 2, 2, 2, 0, 1]),
            (2, [3, 3, 0, 1, 2]),
            (3, [4, 4, 2, 3]),
        ]
        for source_tier, target_tiers in ball_plan:
            source_tables = list(tier_tables[source_tier])
            for target_tier in target_tiers:
                eligible_targets = [
                    table_name for table_name in tier_tables[target_tier]
                    if ball_counts.get(table_name, 0) < 3
                ]
                if not eligible_targets:
                    continue
                eligible_targets.sort(key=lambda table_name: (ball_counts.get(table_name, 0), table_name))
                lowest_count = ball_counts.get(eligible_targets[0], 0)
                target_choices = [table_name for table_name in eligible_targets if ball_counts.get(table_name, 0) == lowest_count]
                target_table = str(world.random.choice(target_choices))
                item_name = _progressive_ball_item_name_for_table(target_table, world)
                chosen_name = reserve_deep_item(
                    item_name,
                    source_tables,
                    (1, 2, 3, 4),
                    target_table if target_tier != 0 else "",
                )
                if not chosen_name:
                    chosen_name = reserve_deep_item(item_name, source_tables, tuple(range(1, 9)), target_table)
                if chosen_name:
                    ball_counts[target_table] = ball_counts.get(target_table, 0) + 1

        logging.info(
            "Manual Pinball Deep Run: reserved %d Feature Key pieces, %d gated Boss Keys, and %d staged Progressive Balls.",
            placed_feature_pieces,
            len(forced_boss_locations),
            sum(max(0, count - (1 if table_name in deep_run_starting_open_tables else 0)) for table_name, count in ball_counts.items()),
        )
        return

    boss_key_candidates = easy_candidates
    if deep_run_starting_open_tables:
        boss_key_candidates = [
            location
            for location in easy_candidates
            if _extract_metasizer_location_table_name(str(location.get("name", "") or "")) not in deep_run_starting_open_tables
        ]

    if not boss_key_candidates:
        logging.warning("Manual Pinball: No Easy (Ball 1 Sphere) locations found for Boss Key placement.")
        if not deep_run_enabled:
            return
    else:
        forced_location_name = str(_get_ut_regen_slot_data(world).get(FORCED_EASY_BOSS_KEY_SLOT_KEY, "") or "").strip()
        chosen = None
        if forced_location_name:
            chosen = next((location for location in boss_key_candidates if str(location.get("name", "")).strip() == forced_location_name), None)
        if chosen is None:
            chosen = world.random.choice(boss_key_candidates)
        world._forced_easy_boss_key_location = str(chosen.get("name", "") or "").strip()

        # Remove any explicit Boss Key forbids on the chosen Easy location.
        remove_location_item_forbid(chosen, "Boss Key")

        # Guarantee one Easy Boss Key by locking one Boss Key onto this Easy check.
        place_item = chosen.get("place_item")
        if isinstance(place_item, list):
            if "Boss Key" not in place_item:
                place_item.append("Boss Key")
        elif place_item is None:
            chosen["place_item"] = ["Boss Key"]
        else:
            chosen["place_item"] = [str(place_item), "Boss Key"]

        logging.info("Manual Pinball: Boss Key guaranteed on Easy check: %s", chosen.get("name", "Unknown"))

    if not deep_run_enabled:
        return
    feature_payload = metasizer_payload.get("feature_unlock") if isinstance(metasizer_payload.get("feature_unlock"), dict) else {}
    if not feature_payload.get("enabled"):
        return
    feature_items = [
        str(item_name or "").strip()
        for item_name in feature_payload.get("feature_key_items", []) or []
        if str(item_name or "").strip()
    ]
    if not feature_items:
        return

    table_feature_items = feature_payload.get("table_feature_items", {}) if isinstance(feature_payload, dict) else {}
    one_key_unlock_counts: dict[str, int] = {item_name: 0 for item_name in feature_items}
    if isinstance(table_feature_items, dict):
        for raw_items in table_feature_items.values():
            items = [str(item_name or "").strip() for item_name in (raw_items or []) if str(item_name or "").strip()]
            if len(items) == 1 and items[0] in one_key_unlock_counts:
                one_key_unlock_counts[items[0]] += 1
    chosen_feature_item = max(
        feature_items,
        key=lambda item_name: (one_key_unlock_counts.get(item_name, 0), -feature_items.index(item_name)),
    )

    feature_piece_candidates = [
        location
        for location in easy_candidates
        if _extract_metasizer_location_table_name(str(location.get("name", "") or "")) in deep_run_starting_open_tables
    ]
    world.random.shuffle(feature_piece_candidates)
    placed_feature_pieces = 0
    for location in feature_piece_candidates:
        if placed_feature_pieces >= FEATURE_KEY_PIECES_REQUIRED:
            break
        place_item = location.get("place_item")
        if isinstance(place_item, list):
            place_item.append(chosen_feature_item)
        elif place_item is None:
            location["place_item"] = [chosen_feature_item]
        else:
            location["place_item"] = [str(place_item), chosen_feature_item]
        placed_feature_pieces += 1

    if placed_feature_pieces >= FEATURE_KEY_PIECES_REQUIRED:
        logging.info(
            "Manual Pinball Deep Run: guaranteed starter-sphere Feature Key pieces for %s on %d Easy checks.",
            chosen_feature_item,
            placed_feature_pieces,
        )
    else:
        logging.warning(
            "Manual Pinball Deep Run: only placed %d/%d starter-sphere Feature Key pieces for %s.",
            placed_feature_pieces,
            FEATURE_KEY_PIECES_REQUIRED,
            chosen_feature_item,
        )

# This method is run at the very end of pre-generation, once the place_item options have been handled and before AP generation occurs
def after_generate_basic(world: World, multiworld: MultiWorld, player: int):
    pass

# This method is run every time an item is added to the state, can be used to modify the value of an item.
# IMPORTANT! Any changes made in this hook must be cancelled/undone in after_remove_item
def after_collect_item(world: World, state: CollectionState, Changed: bool, item: Item):
    # the following let you add to the Potato Item Value count
    # if item.name == "Cooked Potato":
    #     state.prog_items[item.player][format_state_prog_items_key(ProgItemsCat.VALUE, "Potato")] += 1
    pass

# This method is run every time an item is removed from the state, can be used to modify the value of an item.
# IMPORTANT! Any changes made in this hook must be first done in after_collect_item
def after_remove_item(world: World, state: CollectionState, Changed: bool, item: Item):
    # the following let you undo the addition to the Potato Item Value count
    # if item.name == "Cooked Potato":
    #     state.prog_items[item.player][format_state_prog_items_key(ProgItemsCat.VALUE, "Potato")] -= 1
    pass


# This is called before slot data is set and provides an empty dict ({}), in case you want to modify it before Manual does
def before_fill_slot_data(slot_data: dict, world: World, multiworld: MultiWorld, player: int) -> dict:
    return slot_data

# This is called after slot data is set and provides the slot data at the time, in case you want to check and modify it after Manual is done with it
def after_fill_slot_data(slot_data: dict, world: World, multiworld: MultiWorld, player: int) -> dict:
    metasizer_payload = _get_metasizer_table_set_payload(world, multiworld, player)
    generic_checks_payload = _get_generic_checks_payload(world, multiworld, player)
    task_shuffle_payload = _get_task_shuffle_payload(world, multiworld, player)
    if _metasizer_payload_is_deep_run(metasizer_payload):
        slot_data["boss_keys_required_for_boss_table_open"] = DEEP_RUN_BOSS_KEYS_REQUIRED
        slot_data["deep_run_boss_keys_required"] = DEEP_RUN_BOSS_KEYS_REQUIRED
    slot_data["task_shuffle_enabled"] = 1 if task_shuffle_payload.get("enabled") else 0
    if metasizer_payload.get("enabled"):
        active_tables = {
            str(name or "").strip()
            for name in metasizer_payload.get("active_tables", [])
            if str(name or "").strip()
        }
        generic_checks_payload = _filter_slot_payload_entries_to_active_tables(generic_checks_payload, active_tables)
        task_shuffle_payload = _filter_slot_payload_entries_to_active_tables(task_shuffle_payload, active_tables)
    if metasizer_payload.get("enabled"):
        existing_start_inventory = slot_data.get("start_inventory_from_pool", {})
        next_start_inventory: dict[str, Any] = {}
        if isinstance(existing_start_inventory, dict):
            for item_name, count in existing_start_inventory.items():
                if str(item_name or "").startswith(PROGRESSIVE_BALL_ITEM_PREFIX):
                    continue
                next_start_inventory[str(item_name)] = count
        for table_name in metasizer_payload.get("starting_open_tables", []):
            table_name_str = str(table_name or "").strip()
            if table_name_str:
                next_start_inventory[_progressive_ball_item_name_for_table(table_name_str, world)] = 1
        slot_data["start_inventory_from_pool"] = next_start_inventory
    slot_data[BASE_GAME_TABLE_SET_SLOT_KEY] = metasizer_payload
    slot_data[LEGACY_METASIZER_TABLE_SET_SLOT_KEY] = metasizer_payload
    if isinstance(metasizer_payload.get("feature_unlock"), dict):
        slot_data["feature_unlock"] = metasizer_payload.get("feature_unlock")
    if isinstance(metasizer_payload.get("boss_table_checks"), dict):
        slot_data["boss_table_checks"] = metasizer_payload.get("boss_table_checks")
    if str(metasizer_payload.get("boss_table") or "").strip():
        slot_data["boss_table"] = str(metasizer_payload.get("boss_table") or "").strip()
        slot_data["boss_table_name"] = str(metasizer_payload.get("boss_table_name") or metasizer_payload.get("boss_table") or "").strip()
    slot_data[GENERIC_CHECKS_SLOT_KEY] = generic_checks_payload
    slot_data[TASK_SHUFFLE_SLOT_KEY] = task_shuffle_payload
    slot_data[PROGRESSIVE_BALL_STARTS_SLOT_KEY] = _get_progressive_ball_start_payload(world)
    if getattr(world, "_forced_easy_boss_key_location", None):
        slot_data[FORCED_EASY_BOSS_KEY_SLOT_KEY] = str(world._forced_easy_boss_key_location)
    if metasizer_payload.get("enabled"):
        world_groups = metasizer_payload.get("selected_group_keys", [])
        logging.info(
            "Base Game: worlds=%d active=%d/%d starting=%d mode=%s.",
            len(world_groups) if isinstance(world_groups, list) else 0,
            int(metasizer_payload.get("active_table_count", 0)),
            int(metasizer_payload.get("pool_size", 0)),
            int(metasizer_payload.get("starting_open_count", 0)),
            str(metasizer_payload.get("selection_mode", "")),
        )
        if metasizer_payload.get("group_selection_fallback_reason"):
            logging.info(
                "Base Game: %s",
                str(metasizer_payload.get("group_selection_fallback_reason", "")),
            )
    if generic_checks_payload.get("enabled"):
        logging.info(
            "Manual Pinball Generic: Generic task slots assigned (%d entries).",
            len(generic_checks_payload.get("entries", [])),
        )
    if task_shuffle_payload.get("enabled"):
        logging.info(
            "Manual Pinball: Task shuffle enabled (%d task assignments).",
            len(task_shuffle_payload.get("entries", [])),
        )
    return slot_data

# This is called right at the end, in case you want to write stuff to the spoiler log
def before_write_spoiler(world: World, multiworld: MultiWorld, spoiler_handle) -> None:
    metasizer_payload = _get_metasizer_table_set_payload(world, multiworld, world.player)
    if metasizer_payload.get("enabled"):
        selected_groups = metasizer_payload.get("selected_group_metadata", [])
        spoiler_handle.write("\nBase Game Active Set:\n")
        spoiler_handle.write(
            "  Selected world groups: "
            + ", ".join(
                [
                    f"{group.get('key', '')} [{group.get('label', '')}]"
                    for group in selected_groups
                    if isinstance(group, dict) and str(group.get("key") or "").strip()
                ]
            )
            + "\n"
        )
        if metasizer_payload.get("group_selection_fallback_reason"):
            spoiler_handle.write(
                "  Selection note: "
                + str(metasizer_payload.get("group_selection_fallback_reason", ""))
                + "\n"
            )
        spoiler_handle.write(
            f"  Active tables ({metasizer_payload.get('active_table_count', 0)}/{metasizer_payload.get('pool_size', 0)}): "
            + ", ".join(metasizer_payload.get("active_tables", []))
            + "\n"
        )
        spoiler_handle.write(
            f"  Starting open ({metasizer_payload.get('starting_open_count', 0)}): "
            + ", ".join(metasizer_payload.get("starting_open_tables", []))
            + "\n"
        )

    generic_checks_payload = _get_generic_checks_payload(world, multiworld, world.player)
    if generic_checks_payload.get("enabled"):
        spoiler_handle.write("\nGeneric Task Assignments:\n")
        for entry in generic_checks_payload.get("entries", []):
            spoiler_handle.write(
                f"  {entry['location']} => {entry['display_name']} ({entry['source_location']})\n"
            )

    task_shuffle_payload = _get_task_shuffle_payload(world, multiworld, world.player)
    if not task_shuffle_payload.get("enabled"):
        return

    spoiler_handle.write("\nTask Shuffle (by difficulty):\n")
    for entry in task_shuffle_payload.get("entries", []):
        spoiler_handle.write(
            f"  {entry['location']} <= {entry['source_location']}\n"
        )

# This is called when you want to add information to the hint text
def before_extend_hint_information(hint_data: dict[int, dict[int, str]], world: World, multiworld: MultiWorld, player: int) -> None:

    ### Example way to use this hook:
    # if player not in hint_data:
    #     hint_data.update({player: {}})
    # for location in multiworld.get_locations(player):
    #     if not location.address:
    #         continue
    #
    #     use this section to calculate the hint string
    #
    #     hint_data[player][location.address] = hint_string

    pass

def after_extend_hint_information(hint_data: dict[int, dict[int, str]], world: World, multiworld: MultiWorld, player: int) -> None:
    pass
