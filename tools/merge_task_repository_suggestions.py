from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_TARGETS = [
    ROOT / "ap_multiworld_test" / "world_source" / "manual_flippermizerworldsofpinball_base_game" / "data" / "generic_check_pools.json",
    ROOT / "ap_multiworld_test" / "stream_regular_seed_work" / "manual_flippermizerworldsofpinball_base_game" / "data" / "generic_check_pools.json",
]
DIFFICULTIES = ("Easy", "Medium", "Hard")


def normalize_table(value: Any) -> str:
    text = str(value or "").lower()
    text = re.sub(r"[^a-z0-9 ]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def normalize_task(value: Any) -> str:
    text = str(value or "").lower()
    text = re.sub(r"[^a-z0-9%+ ]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def source_task_id(table_name: str, difficulty: str, index: int, task: dict[str, Any]) -> str:
    title = task.get("title") or task.get("name") or task.get("objective") or ""
    return "|".join([
        normalize_table(table_name),
        str(difficulty or "").lower(),
        str(index or 0),
        normalize_task(title),
    ])


def clean_suggestion(raw: Any) -> dict[str, str]:
    if not isinstance(raw, dict):
        return {}
    out: dict[str, str] = {}
    title = raw.get("title") or raw.get("task") or raw.get("task_title") or raw.get("rewritten_title") or raw.get("replacement_task") or raw.get("replacementTitle")
    task_type = raw.get("type") or raw.get("task_type") or raw.get("taskType")
    tooltip = raw.get("tooltip") or raw.get("how_to") or raw.get("howTo") or raw.get("explanation") or raw.get("rewritten_tooltip") or raw.get("rewrite_tooltip")
    if isinstance(title, str) and title.strip():
        out["title"] = title.strip()
    if isinstance(task_type, str) and task_type.strip():
        out["type"] = task_type.strip()
    if isinstance(tooltip, str) and tooltip.strip():
        out["explanation"] = tooltip.strip()
    return out


def load_suggestions(path: Path) -> dict[str, dict[str, str]]:
    parsed = json.loads(path.read_text(encoding="utf-8"))
    out: dict[str, dict[str, str]] = {}

    def add(row_id: Any, value: Any) -> None:
        clean_id = str(row_id or "").strip()
        suggestion = clean_suggestion(value)
        if clean_id and suggestion:
            out[clean_id] = suggestion

    def add_ids(ids: Any, value: Any) -> None:
        if not isinstance(ids, list):
            return
        for row_id in ids:
            add(row_id, value)

    def read_object(obj: Any) -> None:
        if not isinstance(obj, dict):
            return
        for key, value in obj.items():
            if isinstance(value, dict) and isinstance(value.get("ids"), list):
                add_ids(value.get("ids"), value)
            add(key, value)

    def read_array(arr: Any) -> None:
        if not isinstance(arr, list):
            return
        for item in arr:
            if not isinstance(item, dict):
                continue
            if isinstance(item.get("ids"), list):
                add_ids(item.get("ids"), item)
            else:
                add(item.get("id") or item.get("task_id") or item.get("rowId"), item)

    if isinstance(parsed, list):
        read_array(parsed)
    elif isinstance(parsed, dict):
        read_object(parsed)
        for key in ("codexSuggestions", "suggestions", "results", "rewrites"):
            read_object(parsed.get(key))
            read_array(parsed.get(key))
        read_array(parsed.get("groups"))

    return out


def merge_into_pools(path: Path, suggestions: dict[str, dict[str, str]]) -> int:
    pools = json.loads(path.read_text(encoding="utf-8"))
    changed = 0
    for table_name, difficulties in pools.items():
        if not isinstance(difficulties, dict):
            continue
        for difficulty in DIFFICULTIES:
            entries = difficulties.get(difficulty)
            if not isinstance(entries, list):
                continue
            for index, task in enumerate(entries):
                if not isinstance(task, dict):
                    continue
                row_id = source_task_id(table_name, difficulty, index, task)
                suggestion = suggestions.get(row_id)
                if not suggestion:
                    continue
                for field, value in suggestion.items():
                    if task.get(field) != value:
                        task[field] = value
                        changed += 1
    if changed:
        path.write_text(json.dumps(pools, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return changed


def main() -> int:
    parser = argparse.ArgumentParser(description="Merge Codex task repository suggestions into generic_check_pools.json.")
    parser.add_argument("suggestions", type=Path, help="JSON file with per-id suggestions or grouped ids.")
    parser.add_argument("--target", action="append", type=Path, help="generic_check_pools.json path. Can be passed more than once.")
    args = parser.parse_args()

    suggestions = load_suggestions(args.suggestions)
    if not suggestions:
        raise SystemExit("No mergeable suggestions found.")
    targets = args.target or DEFAULT_TARGETS
    for target in targets:
        changed = merge_into_pools(target.resolve(), suggestions)
        rel = target.resolve().relative_to(ROOT) if target.resolve().is_relative_to(ROOT) else target.resolve()
        print(f"{rel}: {changed} field update(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
