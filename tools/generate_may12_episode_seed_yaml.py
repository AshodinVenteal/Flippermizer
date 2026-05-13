from __future__ import annotations

import argparse
import random
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
PARENT_ROOT = REPO_ROOT.parent

WORLD_KEYS = [
    "inside_out_lanes",
    "pixel_quest",
    "nineties_movie_mayhem",
    "sci_fi_signal",
    "badges_and_chases",
]


def build_yaml(player_name: str, world_keys: list[str]) -> str:
    curated = ", ".join(world_keys)
    return "\n".join(
        [
            f"name: {player_name}",
            'description: "Episode seed 2026-05-12: sealed two-new-world mix."',
            "game: Manual_FlippermizerBaseGame_Ashodin",
            "",
            "Manual_FlippermizerBaseGame_Ashodin:",
            "  progression_balancing: 50",
            "  accessibility: items",
            "  boss_keys_required_for_boss_table_open: 3",
            "  filter_mode_trap_enabled: true",
            "  task_shuffle_enabled: true",
            "  random_start_tables_open: false",
            "  filler_traps: 16",
            "  score_adjustment_mode: normal",
            "  base_game_active_table_count: 25",
            "  base_game_selection_mode: curated_catalog_groups",
            f'  base_game_curated_world_groups: "{curated}"',
            "  base_game_random_one_featured_designer_only: false",
            "  base_game_starting_open_table_count: 5",
            "  base_game_enabled: true",
            "",
        ]
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate the sealed May 12 episode player YAML.")
    parser.add_argument("--slug", default="episode-seed-2026-05-12")
    parser.add_argument("--player-name", default="Ashodin_BaseGame")
    parser.add_argument("--seed", type=int, default=None)
    args = parser.parse_args()

    rng = random.SystemRandom()
    world_keys = WORLD_KEYS[:]
    rng.shuffle(world_keys)
    seed_number = args.seed if args.seed is not None else rng.randrange(100000, 999999999)

    out_dir = PARENT_ROOT / "generated-yamls" / args.slug
    out_dir.mkdir(parents=True, exist_ok=True)
    yaml_path = out_dir / "Manual_FlippermizerBaseGame_Ashodin.generated.yaml"
    seed_path = out_dir / ".seed-number"
    yaml_path.write_text(build_yaml(args.player_name, world_keys), encoding="utf-8")
    seed_path.write_text(f"{seed_number}\n", encoding="utf-8")

    print(f"yaml={yaml_path}")
    print(f"seed_file={seed_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
