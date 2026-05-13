from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "manual_flippermizerworldsofpinball_base_game" / "data"

DIFFICULTIES = ("Easy", "Medium", "Hard")
FORBIDDEN_HARD_RE = re.compile(
    r"\b(?:start|begin|qualify|reach|complete|play|light)\b.*\b(?:wizard\s*mode|wizard|grand\s*finale|join\s*the\s*cirqus|battle\s*for\s*the\s*kingdom|final\s*battle|final\s*frontier|champion\s*challenge)\b",
    re.IGNORECASE,
)


def normalize(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", str(value or "").lower())


def task_text(entry: dict) -> str:
    return " ".join(str(entry.get(field, "") or "") for field in ("title", "source_location", "explanation"))


def task_label_text(entry: dict) -> str:
    return " ".join(str(entry.get(field, "") or "") for field in ("title", "source_location"))


def task_family(table: str, entry: dict) -> str:
    norm = normalize(task_label_text(entry))
    if not norm:
        return ""
    if "collectsuperjackpot" in norm or "collect2multiballjackpots" in norm or "collectamultiballjackpot" in norm:
        return f"{table}:multiball_jackpot"
    if "startmultiballandcollectajackpot" in norm:
        return f"{table}:multiball_start_and_jackpot"
    if "start" in norm and "multiball" in norm:
        return f"{table}:multiball_start"
    if "lock1ball" in norm or "lock2balls" in norm or "lockasecondball" in norm or "lightlock" in norm:
        return f"{table}:multiball_lock_progress"
    if "startanymode" in norm or "startamode" in norm or "startanymission" in norm or "startanysongmode" in norm:
        return f"{table}:mode_start"
    if "completeanymode" in norm or "complete1mode" in norm or "completeanymission" in norm or "completeanysongmode" in norm:
        return f"{table}:mode_completion"
    return norm


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def group_tables(table_pool: dict, groups: list[str]) -> list[str]:
    entries = list(table_pool.get("tables") or [])
    by_code = {str(entry.get("code") or ""): entry for entry in entries if isinstance(entry, dict)}
    group_defs = {str(group.get("key") or ""): group for group in table_pool.get("world_groups") or [] if isinstance(group, dict)}
    out: list[str] = []
    for group_key in groups:
        group = group_defs.get(group_key)
        if not group:
            continue
        for code in group.get("table_codes") or []:
            entry = by_code.get(str(code))
            name = str((entry or {}).get("name") or "").strip()
            if name and name not in out:
                out.append(name)
    return out


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate Flippermizer task pool policy.")
    parser.add_argument("--group", action="append", dest="groups", help="Restrict validation to one or more world group keys.")
    parser.add_argument("--strict-all", action="store_true", help="Fail on every legacy table policy issue, not just selected groups.")
    args = parser.parse_args()

    pools = load_json(DATA / "generic_check_pools.json")
    table_pool = load_json(DATA / "table_pool.json")
    if args.groups:
        tables = group_tables(table_pool, args.groups)
    else:
        tables = sorted(pools.keys()) if args.strict_all else []
    if not tables:
        tables = sorted(pools.keys()) if args.strict_all else group_tables(table_pool, ["inside_out_lanes", "pixel_quest"])

    errors: list[str] = []
    warnings: list[str] = []
    for table in tables:
        pool = pools.get(table)
        if not isinstance(pool, dict):
            errors.append(f"{table}: missing generic check pool")
            continue
        seen_titles: set[str] = set()
        seen_families_by_diff: dict[str, set[str]] = {}
        for diff in DIFFICULTIES:
            entries = pool.get(diff)
            if not isinstance(entries, list) or len(entries) != 6:
                errors.append(f"{table}/{diff}: expected 6 entries, found {0 if not isinstance(entries, list) else len(entries)}")
                continue
            task_entries = [entry for entry in entries if str(entry.get("type", "")).strip().lower() != "score"]
            if not task_entries:
                errors.append(f"{table}/{diff}: no task entries")
                continue
            score_entries = [entry for entry in entries if str(entry.get("type", "")).strip().lower() == "score"]
            if len(score_entries) != 1:
                warnings.append(f"{table}/{diff}: expected exactly one score entry, found {len(score_entries)}")
            families = seen_families_by_diff.setdefault(diff, set())
            for entry in task_entries:
                title = str(entry.get("title") or "").strip()
                title_key = normalize(title)
                if diff == "Hard" and FORBIDDEN_HARD_RE.search(task_text(entry)):
                    errors.append(f"{table}/Hard: forbidden wizard-style hard task: {title}")
                if title_key in seen_titles:
                    warnings.append(f"{table}: repeated task title across difficulties: {title}")
                seen_titles.add(title_key)
                fam = task_family(table, entry)
                if fam and fam in families:
                    warnings.append(f"{table}/{diff}: repeated task family within difficulty: {title}")
                if fam:
                    families.add(fam)

    if errors:
        print("Task policy validation failed:")
        for error in errors:
            print(f"ERROR: {error}")
        for warning in warnings:
            print(f"WARN: {warning}")
        return 1
    print(f"Task policy validation passed for {len(tables)} table(s).")
    for warning in warnings:
        print(f"WARN: {warning}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
