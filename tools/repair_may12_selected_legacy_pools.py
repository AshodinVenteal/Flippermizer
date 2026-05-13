from __future__ import annotations

import json
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
ROOT = REPO_ROOT.parent
POOLS_PATH = ROOT / "manual_flippermizerworldsofpinball_base_game" / "data" / "generic_check_pools.json"


REPLACEMENTS = {
    ("Dirty Harry", "Hard", "Start a wizard mode"): {
        "title": "Collect two Multiball jackpots in one game",
        "type": "task",
        "explanation": "Start Multiball and cash in two jackpot shots before returning to single-ball play.",
        "source_location": "Collect two Multiball jackpots in one game",
    },
    ("The X-Files", "Hard", "Start a wizard mode"): {
        "title": "Complete 3 case modes in one game",
        "type": "task",
        "explanation": "Start and finish three different case modes before the game ends.",
        "source_location": "Complete 3 case modes in one game",
    },
    ("Attack from Mars", "Medium", "Destroy 1 saucer"): {
        "title": "Destroy 2 saucers in one game",
        "type": "task",
        "explanation": "Progress two separate Martian Attack waves all the way through and destroy both saucers.",
        "source_location": "Destroy 2 saucers in one game",
    },
    ("Independence Day", "Medium", "Start 2-ball multiball"): {
        "title": "Complete two city-mode shots in one mode",
        "type": "task",
        "explanation": "Start a city mode and collect two lit mode shots before the mode ends.",
        "source_location": "Complete two city-mode shots in one mode",
    },
}

ROBOCOP = {
    "Easy": [
        {
            "title": "Complete GREEN-YELLOW-RED targets",
            "type": "task",
            "explanation": "",
            "source_location": "Complete GREEN-YELLOW-RED targets",
        },
        {
            "title": "Easy Score (528,270+)",
            "type": "score",
            "explanation": "Build score to at least 528,270 before drain. Focus lit modes, jackpots, and bonus multipliers.",
            "source_location": "Robocop - Easy Score (528,270+)",
        },
        {
            "title": "Complete one target-bank cycle",
            "type": "task",
            "explanation": "Clear a full target cycle to build early mode progress.",
            "source_location": "Complete one target-bank cycle",
        },
        {
            "title": "Shoot the center ramp 3 times",
            "type": "task",
            "explanation": "Make three successful center ramp shots in one game.",
            "source_location": "Shoot the center ramp 3 times",
        },
        {
            "title": "Collect a lit target-bank award",
            "type": "task",
            "explanation": "Complete enough target progress to claim any lit award from the bank.",
            "source_location": "Collect a lit target-bank award",
        },
        {
            "title": "Light Multiball",
            "type": "task",
            "explanation": "Advance the required shots until Multiball is lit.",
            "source_location": "Light Multiball",
        },
    ],
    "Medium": [
        {
            "title": "Lock 1 ball for Multiball",
            "type": "task",
            "explanation": "Advance the required shots until one Multiball lock is secured.",
            "source_location": "Lock 1 ball for Multiball",
        },
        {
            "title": "Medium Score (1,091,399+)",
            "type": "score",
            "explanation": "Build score to at least 1,091,399 before drain. Focus lit modes, jackpots, and bonus multipliers.",
            "source_location": "Robocop - Medium Score (1,091,399+)",
        },
        {
            "title": "Start Multiball",
            "type": "task",
            "explanation": "Qualify and start Multiball.",
            "source_location": "Start Multiball",
        },
        {
            "title": "Complete two target-bank cycles",
            "type": "task",
            "explanation": "Clear two full target-bank cycles in one game.",
            "source_location": "Complete two target-bank cycles",
        },
        {
            "title": "Collect a Jackpot in Multiball",
            "type": "task",
            "explanation": "Start Multiball and collect one lit jackpot.",
            "source_location": "Collect a Jackpot in Multiball",
        },
        {
            "title": "Score 500,000+ from target-bank awards",
            "type": "task",
            "explanation": "Build and collect target-bank awards worth at least 500,000 total.",
            "source_location": "Score 500,000+ from target-bank awards",
        },
    ],
    "Hard": [
        {
            "title": "Collect 2 Multiball jackpots",
            "type": "task",
            "explanation": "Start Multiball and score two jackpots during the mode.",
            "source_location": "Collect 2 Multiball jackpots",
        },
        {
            "title": "Hard Score (1,961,971+)",
            "type": "score",
            "explanation": "Build score to at least 1,961,971 before drain. Focus lit modes, jackpots, and bonus multipliers.",
            "source_location": "Robocop - Hard Score (1,961,971+)",
        },
        {
            "title": "Collect a 1,000,000+ jackpot",
            "type": "task",
            "explanation": "Build Multiball value and collect a jackpot worth at least 1,000,000.",
            "source_location": "Collect a 1,000,000+ jackpot",
        },
        {
            "title": "Complete three target-bank cycles",
            "type": "task",
            "explanation": "Clear three full target-bank cycles in one game.",
            "source_location": "Complete three target-bank cycles",
        },
        {
            "title": "Start Multiball twice in one game",
            "type": "task",
            "explanation": "Qualify and start Multiball two separate times in one game.",
            "source_location": "Start Multiball twice in one game",
        },
        {
            "title": "Score 1,000,000+ from target-bank awards",
            "type": "task",
            "explanation": "Build and collect target-bank awards worth at least 1,000,000 total.",
            "source_location": "Score 1,000,000+ from target-bank awards",
        },
    ],
}


def main() -> int:
    data = json.loads(POOLS_PATH.read_text(encoding="utf-8"))
    for (table, difficulty, title), replacement in REPLACEMENTS.items():
        entries = data.get(table, {}).get(difficulty, [])
        if any(str(entry.get("title") or "") == replacement["title"] for entry in entries):
            continue
        for index, entry in enumerate(entries):
            if str(entry.get("title") or "") == title:
                entries[index] = replacement
                break
        else:
            raise RuntimeError(f"Could not find {table}/{difficulty}/{title}")
    data["Robocop"] = ROBOCOP
    POOLS_PATH.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    print(f"Updated {POOLS_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
