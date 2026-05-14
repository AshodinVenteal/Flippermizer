from __future__ import annotations

import json
import re
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
ROOT = REPO_ROOT.parent
POOLS_PATH = ROOT / "manual_flippermizerworldsofpinball_base_game" / "data" / "generic_check_pools.json"

FORBIDDEN_HARD_RE = re.compile(
    r"\b("
    r"wizard|finale|grand\s+finale|wizard\s+mode|final\s+wizard|"
    r"join\s+the\s+cirqus|rule\s+the\s+universe|lost\s+in\s+the\s+zone|"
    r"champion\s+challenge|ultimate\s+challenge|final\s+battle"
    r")\b",
    re.IGNORECASE,
)

REPLACEMENTS = {
    ("Batman 66", "Hard", "Start Villain Escape wizard mode"): {
        "title": "Complete 2 Major Villain phases in one game",
        "type": "task",
        "explanation": "Start major villain modes and finish two full villain phases before the game ends.",
        "source_location": "Complete 2 Major Villain phases in one game",
    },
    ("Ghostbusters", "Hard", "Start a mini-wizard mode"): {
        "title": "Complete 3 modes in one game",
        "type": "task",
        "explanation": "Start and finish three regular modes before the game ends.",
        "source_location": "Complete 3 modes in one game",
    },
    ("Judge Dredd", "Hard", "Start Ultimate Challenge"): {
        "title": "Complete 3 Chain feature modes in one game",
        "type": "task",
        "explanation": "Start and complete three different Chain feature modes before the game ends.",
        "source_location": "Complete 3 Chain feature modes in one game",
    },
    ("Rolling Stones", "Hard", "Start a wizard mode"): {
        "title": "Collect 2 song awards in one game",
        "type": "task",
        "explanation": "Start song play and collect two separate song awards before the game ends.",
        "source_location": "Collect 2 song awards in one game",
    },
    ("The Beatles", "Hard", "Start a wizard mode"): {
        "title": "Complete 3 drop-target banks in one game",
        "type": "task",
        "explanation": "Complete three full drop-target banks before the game ends.",
        "source_location": "Complete 3 drop-target banks in one game",
    },
}


def hard_task_text(entry: dict) -> str:
    return " ".join(str(entry.get(field, "") or "") for field in ("title", "source_location", "explanation"))


def replace_entry(entries: list[dict], title: str, replacement: dict) -> bool:
    for index, entry in enumerate(entries):
        if str(entry.get("title") or "") == replacement["title"]:
            return False
        if str(entry.get("title") or "") == title:
            entries[index] = replacement
            return True
    raise RuntimeError(f"Could not find Hard task titled {title!r}")


def main() -> int:
    pools = json.loads(POOLS_PATH.read_text(encoding="utf-8"))
    changed = 0
    for (table, difficulty, title), replacement in REPLACEMENTS.items():
        entries = pools.get(table, {}).get(difficulty)
        if not isinstance(entries, list):
            raise RuntimeError(f"Missing pool: {table}/{difficulty}")
        if replace_entry(entries, title, replacement):
            changed += 1

    offenders: list[str] = []
    for table, pool in sorted(pools.items()):
        entries = pool.get("Hard", []) if isinstance(pool, dict) else []
        for entry in entries:
            if str(entry.get("type", "")).strip().lower() == "score":
                continue
            if FORBIDDEN_HARD_RE.search(hard_task_text(entry)):
                offenders.append(f"{table}: {entry.get('title')}")

    if offenders:
        raise RuntimeError("Forbidden Hard wizard/final-mode tasks remain:\n" + "\n".join(offenders))

    POOLS_PATH.write_text(json.dumps(pools, indent=2) + "\n", encoding="utf-8")
    print(f"Updated {changed} Hard task(s) in {POOLS_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
