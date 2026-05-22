from __future__ import annotations

import argparse
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = ROOT / "ap_multiworld_test" / "world_source" / "manual_flippermizerworldsofpinball_base_game" / "data" / "generic_check_pools.json"
DEFAULT_OUTPUT = ROOT / "flippermizer_task_repository_data.js"


def count_tasks(pools: dict) -> int:
    total = 0
    for difficulties in pools.values():
        if not isinstance(difficulties, dict):
            continue
        for entries in difficulties.values():
            if isinstance(entries, list):
                total += len(entries)
    return total


def main() -> int:
    parser = argparse.ArgumentParser(description="Build the standalone task repository data JS from generic_check_pools.json.")
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE, help="Path to generic_check_pools.json.")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="Path to write flippermizer_task_repository_data.js.")
    args = parser.parse_args()

    source_path = args.source.resolve()
    output_path = args.output.resolve()
    pools = json.loads(source_path.read_text(encoding="utf-8"))
    rel_source = source_path.relative_to(ROOT).as_posix() if source_path.is_relative_to(ROOT) else source_path.as_posix()
    payload = {
        "version": "1.0.0",
        "sourcePath": rel_source,
        "tableCount": len(pools),
        "taskCount": count_tasks(pools),
        "pools": pools,
    }
    json_text = json.dumps(payload, ensure_ascii=True, indent=2)
    output_path.write_text(
        "/* Generated from generic_check_pools.json for the standalone task repository. */\n"
        "(function(global){\n"
        "  'use strict';\n"
        "  global.FLPR_TASK_REPOSITORY_SOURCE = Object.freeze("
        + json_text
        + ");\n"
        "})(typeof window !== 'undefined' ? window : this);\n",
        encoding="utf-8",
    )
    print(f"Wrote {output_path.relative_to(ROOT)} from {rel_source}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
