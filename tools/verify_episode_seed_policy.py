from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
PARENT_ROOT = REPO_ROOT.parent
sys.path.insert(0, str(PARENT_ROOT / "tools"))

from run_overlay_seed_smoke import load_multidata_from_zip  # noqa: E402


TABLE_POOL_PATH = PARENT_ROOT / "manual_flippermizerworldsofpinball_base_game" / "data" / "table_pool.json"
GENERIC_POOLS_PATH = PARENT_ROOT / "manual_flippermizerworldsofpinball_base_game" / "data" / "generic_check_pools.json"
LOCATIONS_PATH = PARENT_ROOT / "manual_flippermizerworldsofpinball_base_game" / "data" / "locations.json"

REQUIRED_GROUPS = {
    "inside_out_lanes",
    "pixel_quest",
    "nineties_movie_mayhem",
    "sci_fi_signal",
    "badges_and_chases",
}
NEW_GROUPS = {"inside_out_lanes", "pixel_quest"}
FORBIDDEN_HARD_RE = re.compile(
    r"\b("
    r"wizard|finale|grand\s+finale|wizard\s+mode|final\s+wizard|"
    r"join\s+the\s+cirqus|rule\s+the\s+universe|lost\s+in\s+the\s+zone|"
    r"champion\s+challenge|ultimate\s+challenge|final\s+battle"
    r")\b",
    re.IGNORECASE,
)


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def table_groups(table_pool: dict) -> dict[str, list[str]]:
    code_to_name = {entry["code"]: entry["name"] for entry in table_pool.get("tables", []) if entry.get("code") and entry.get("name")}
    return {
        group["key"]: [code_to_name.get(code, code) for code in group.get("table_codes", [])]
        for group in table_pool.get("world_groups", [])
        if group.get("key")
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Verify the May 12 generated seed policy without printing spoiler order.")
    parser.add_argument("--seed-zip", required=True)
    parser.add_argument("--slot", type=int, default=1)
    args = parser.parse_args()

    multidata, _spoiler = load_multidata_from_zip(Path(args.seed_zip).resolve())
    slot_data = multidata["slot_data"][args.slot]
    table_pool = load_json(TABLE_POOL_PATH)
    generic_pools = load_json(GENERIC_POOLS_PATH)
    locations = load_json(LOCATIONS_PATH)
    groups = table_groups(table_pool)

    table_set = slot_data.get("base_game_table_set", {}) or {}
    active_group_keys = [str(v) for v in table_set.get("selected_group_keys", [])]
    active_tables = [str(v) for v in table_set.get("active_tables", [])]
    entries = (slot_data.get("generic_checks", {}) or {}).get("entries", []) or []

    errors: list[str] = []
    if set(active_group_keys) != REQUIRED_GROUPS:
        errors.append("Generated seed does not contain exactly the intended five non-overlapping world groups.")
    if len(active_group_keys) != 5:
        errors.append(f"Expected 5 active worlds, found {len(active_group_keys)}.")
    if len(set(active_tables)) != 25:
        errors.append(f"Expected 25 unique active tables, found {len(set(active_tables))}.")

    table_counter = Counter()
    for group_key in active_group_keys:
        table_counter.update(groups.get(group_key, []))
    overlaps = sorted(table for table, count in table_counter.items() if count > 1)
    if overlaps:
        errors.append("World group overlap detected in active tables.")

    entries_by_key: dict[tuple[str, str], list[dict]] = {}
    for entry in entries:
        table = str(entry.get("table") or "").strip()
        difficulty = str(entry.get("difficulty") or "").strip().title()
        entries_by_key.setdefault((table, difficulty), []).append(entry)

    location_names = {str(location.get("name") or "") for location in locations}
    missing_assignments: list[str] = []
    generic_titles: list[str] = []
    forbidden_hard: list[str] = []
    missing_scores: list[str] = []

    for table in sorted(active_tables):
        pool = generic_pools.get(table, {}) or {}
        for difficulty in ("Easy", "Medium", "Hard"):
            assigned = entries_by_key.get((table, difficulty), [])
            if not assigned:
                missing_assignments.append(f"{table} {difficulty}")
                continue
            title = str(assigned[0].get("display_name") or "").strip()
            valid_titles = {
                str(item.get("title") or "").strip()
                for item in pool.get(difficulty, [])
                if str(item.get("type") or "").lower() == "task"
            }
            if title not in valid_titles:
                generic_titles.append(f"{table} {difficulty}: {title}")
            if difficulty == "Hard":
                source = title + " " + str(assigned[0].get("explanation") or "")
                if FORBIDDEN_HARD_RE.search(source):
                    forbidden_hard.append(f"{table}: {title}")

            score_prefix = f"{table} - {difficulty} Score "
            if not any(name.startswith(score_prefix) for name in location_names):
                missing_scores.append(f"{table} {difficulty}")

    if missing_assignments:
        errors.append(f"Missing task assignments: {len(missing_assignments)}")
    if generic_titles:
        errors.append(f"Unexpected/generic task titles: {len(generic_titles)}")
    if forbidden_hard:
        errors.append(f"Forbidden Hard wizard/final-mode tasks: {len(forbidden_hard)}")
    if missing_scores:
        errors.append(f"Missing score locations: {len(missing_scores)}")

    result = {
        "status": "pass" if not errors else "fail",
        "active_world_count": len(active_group_keys),
        "active_table_count": len(set(active_tables)),
        "new_worlds_present": NEW_GROUPS.issubset(set(active_group_keys)),
        "task_assignment_count": len(entries),
        "table_overlap_count": len(overlaps),
        "errors": errors,
    }
    print(json.dumps(result, indent=2))
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
