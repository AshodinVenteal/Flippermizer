# Object classes from AP core, to represent an entire MultiWorld and this individual World that's part of it
from worlds.AutoWorld import World
from BaseClasses import MultiWorld, CollectionState, Item

# Object classes from Manual -- extending AP core -- representing items and locations that are used in generation
from ..Items import ManualItem
from ..Locations import ManualLocation, location_name_to_location

# Raw JSON data from the Manual apworld, respectively:
#          data/game.json, data/items.json, data/locations.json, data/regions.json
#
from ..Data import game_table, item_table, location_table, region_table

# These helper methods allow you to determine if an option has been set, or what its value is, for any player in the multiworld
from ..Helpers import is_option_enabled, get_option_value, format_state_prog_items_key, ProgItemsCat, load_data_file

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
GENERIC_TASK_RE = re.compile(r"^(?P<table>.+?)\s-\s(?P<difficulty>Easy|Medium|Hard)\sTask$", re.IGNORECASE)
METASIZER_SELECTION_MODES = {
    0: "random_catalog_pool",
    1: "curated_catalog_groups",
    2: "hybrid_curated_random_fill",
}
METASIZER_DEFAULT_SELECTION_MODE = "random_catalog_pool"
METASIZER_GROUP_SELECTION_SPLIT_RE = re.compile(r"[\r\n,|]+")
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
        if not isinstance(item_name, str) or not item_name.startswith("Progressive Ball - "):
            continue
        if int(count or 0) <= 0:
            continue
        payload.append({
            "item": item_name,
            "table": item_name.replace("Progressive Ball - ", "", 1).strip(),
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
            "guide_key": code.lower() if code else re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_"),
            "flyer_code": code,
            "notes": notes,
        })
    return out


def _metasizer_table_pool_names() -> list[str]:
    return [str(entry.get("name") or "").strip() for entry in _metasizer_table_entries() if str(entry.get("name") or "").strip()]


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
    group_size = 5
    desired_world_count = max(1, min(len(catalog_groups), requested_count // group_size if requested_count > 0 else len(catalog_groups)))
    seed_name = str(getattr(multiworld, "seed_name", ""))
    numeric_seed = str(getattr(multiworld, "seed", ""))
    rng = random.Random(f"{seed_name}|{numeric_seed}|{player}|metasizer_table_set_v2")
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
    active_tables = [str(entry.get("name") or "").strip() for entry in active_entries if str(entry.get("name") or "").strip()]
    active_group_metadata = []
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
        "version": 4,
        "base_variant": "Base Game",
        "variant": "Base Game",
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
        "group_selection_fallback_reason": group_selection_fallback_reason,
        "manual_pick_scaffold": selection_mode_applied != METASIZER_DEFAULT_SELECTION_MODE,
        "curated_pick_scaffold": selection_mode_applied in ("curated_catalog_groups", "hybrid_curated_random_fill"),
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
            "Explicit world definitions can now reuse the same table across multiple candidate worlds."
        ]
    }
    if not payload["enabled"]:
        return payload

    active_count = len(active_tables)
    if active_entries:
        start_open_count = max(1, min(active_count, requested_start_open if requested_start_open > 0 else min(5, active_count)))
        opening_entries = [dict(entry) for entry in rng.sample(active_entries, start_open_count)]
        opening_entries.sort(key=lambda entry: active_tables.index(str(entry.get("name") or "").strip()) if str(entry.get("name") or "").strip() in active_tables else 10**9)
    else:
        start_open_count = 0
        opening_entries = []
    opening_tables = [str(entry.get("name") or "").strip() for entry in opening_entries]
    world_layout = _build_metasizer_world_layout(active_entries, opening_tables)
    boss_table_entry = _select_metasizer_boss_table_entry(active_entries, seed_name, numeric_seed, player)
    boss_table_name = str(boss_table_entry.get("name") or "").strip()
    boss_table_checks = _build_boss_table_checks_payload(boss_table_name, seed_name, numeric_seed, player)

    payload["active_table_count"] = len(active_tables)
    payload["starting_open_count"] = len(opening_tables)
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
    prefix = "Progressive Ball - "
    item_name = str(item_name or "").strip()
    if not item_name.startswith(prefix):
        return None
    table_name = item_name[len(prefix):].strip()
    if table_name in _metasizer_table_pool_names():
        return table_name
    return None


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
    globals()["_GENERIC_CHECK_POOLS_CACHE"] = pools
    return pools


def _generic_task_allowed_for_difficulty(pick: dict[str, Any], difficulty: str) -> bool:
    if str(difficulty or "").strip().title() != "Hard":
        return True
    text = " ".join(
        str(pick.get(field, "") or "")
        for field in ("title", "source_location", "explanation")
    )
    return HARD_TASK_FORBIDDEN_OBJECTIVE_RE.search(text) is None


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
        # Every jackpot task in the pool is gated by multiball or a jackpot mode.
        # Treat it as multiball-overlapping so E/M/H cannot stack "start MB"
        # with "collect MB jackpot" on the same table.
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
    if has_word("bonus", "multiplier", "multipliers"):
        categories.add("requires:bonus_multiplier")
    if has_word("extra ball", "extraball"):
        categories.add("requires:extra_ball")
    return categories


def _extract_generic_task_location(location_name: str) -> tuple[str, str] | None:
    match = GENERIC_TASK_RE.match(str(location_name or "").strip())
    if not match:
        return None
    table = str(match.group("table") or "").strip()
    difficulty = str(match.group("difficulty") or "").strip().title()
    if not table or difficulty not in ("Easy", "Medium", "Hard"):
        return None
    return table, difficulty


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
        "version": 4,
        "mode": "generic_task_slots",
        "entries": [],
        "by_location": {},
    }
    pools = _load_generic_check_pools()
    if not pools:
        return payload

    grouped_tasks: dict[tuple[str, str], list[dict[str, Any]]] = {}
    for location in world.location_table:
        name = str(location.get("name", "")).strip()
        meta = _extract_generic_task_location(name)
        if not meta:
            continue
        grouped_tasks.setdefault(meta, []).append(location)

    if not grouped_tasks:
        return payload

    seed_name = str(getattr(multiworld, "seed_name", ""))
    numeric_seed = str(getattr(multiworld, "seed", ""))
    shuffle_enabled = True
    rng = random.Random(f"{seed_name}|{numeric_seed}|{player}|generic_checks_v4")

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

    def task_family_signature(table_name: str, pick: dict[str, Any], difficulty: str) -> str:
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
        return norm

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
            combo_category_duplicate_count(category_sets),
            combo_duplicate_count(families),
            combo_duplicate_count(signatures),
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
            pick = selected["pick"]
            signature = str(selected.get("signature", ""))
            family = str(selected.get("family", ""))
            requirement_categories = set(selected.get("requirement_categories") or set())
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
                    "task_family": family,
                    "requirement_categories": sorted(requirement_categories),
                    "randomized": shuffle_enabled,
                }
                entries.append(entry)
                by_location[loc_name] = entry

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

    if not candidates:
        return payload

    rng = random.Random(f"{seed_name}|{numeric_seed}|{player}|boss_table_checks_v1|{table_name}")
    rng.shuffle(candidates)

    entries: list[dict[str, Any]] = []
    by_location: dict[str, dict[str, Any]] = {}
    for idx, location_name in enumerate(BOSS_TABLE_TASK_LOCATION_NAMES):
        pick = candidates[idx % len(candidates)]
        title = str(pick.get("title") or "").strip() or str(pick.get("source_location") or "").strip() or "Boss Task"
        entry = {
            "location": location_name,
            "table": table_name,
            "target_table": table_name,
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

    payload["enabled"] = bool(entries)
    payload["entries"] = entries
    payload["by_location"] = by_location
    return payload


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

    original_locations = list(getattr(world, "location_table", []) or [])
    kept_locations: list[dict[str, Any]] = []
    removed_location_names: list[str] = []
    for location in original_locations:
        location_name = str(location.get("name") or "").strip()
        table_name = _extract_metasizer_location_table_name(location_name)
        if table_name and table_name not in active_tables:
            removed_location_names.append(location_name)
            continue
        kept_locations.append(location)

    world.location_table = kept_locations
    world._metasizer_removed_location_names = removed_location_names
    starting_open_tables = [
        str(name or "").strip()
        for name in metasizer_payload.get("starting_open_tables", [])
        if str(name or "").strip() in active_tables
    ]
    world._metasizer_starting_items_override = [
        {"items": [f"Progressive Ball - {name}"], "random": 1}
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
    removed_trap_items = 0
    for item_name in list(filtered_config.keys()):
        item_def = getattr(world, "item_name_to_item", {}).get(item_name, {})
        if isinstance(item_def, dict) and item_def.get("trap"):
            if filtered_config.get(item_name, 0):
                removed_trap_items += 1
            filtered_config[item_name] = 0
    if removed_trap_items:
        logging.info("Base Game: no-trap build removed %d trap item types from the pool.", removed_trap_items)

    if not active_tables:
        return filtered_config

    removed_ball_items = 0
    for item_name in list(filtered_config.keys()):
        table_name = _extract_metasizer_progressive_ball_table_name(item_name)
        if not table_name or table_name in active_tables:
            continue
        filtered_config[item_name] = 0
        removed_ball_items += 1

    if removed_ball_items:
        logging.info(
            "Base Game: removed %d inactive Progressive Ball items from the pool.",
            removed_ball_items,
        )
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
    logging.info("Manual Pinball: Boss Key AP item emission disabled; Home Edition handles boss unlocks locally.")

# The item name to create is provided before the item is created, in case you want to make changes to it
def before_create_item(item_name: str, world: World, multiworld: MultiWorld, player: int) -> str:
    return item_name

# The item that was created is provided after creation, in case you want to modify the item
def after_create_item(item: ManualItem, world: World, multiworld: MultiWorld, player: int) -> ManualItem:
    return item

# This method is run towards the end of pre-generation, before the place_item options have been handled and before AP generation occurs
def before_generate_basic(world: World, multiworld: MultiWorld, player: int):
    pass

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
                if str(item_name or "").startswith("Progressive Ball - "):
                    continue
                next_start_inventory[str(item_name)] = count
        for table_name in metasizer_payload.get("starting_open_tables", []):
            table_name_str = str(table_name or "").strip()
            if table_name_str:
                next_start_inventory[f"Progressive Ball - {table_name_str}"] = 1
        slot_data["start_inventory_from_pool"] = next_start_inventory
    slot_data[BASE_GAME_TABLE_SET_SLOT_KEY] = metasizer_payload
    slot_data[LEGACY_METASIZER_TABLE_SET_SLOT_KEY] = metasizer_payload
    slot_data[GENERIC_CHECKS_SLOT_KEY] = generic_checks_payload
    slot_data[TASK_SHUFFLE_SLOT_KEY] = task_shuffle_payload
    slot_data[PROGRESSIVE_BALL_STARTS_SLOT_KEY] = _get_progressive_ball_start_payload(world)
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
