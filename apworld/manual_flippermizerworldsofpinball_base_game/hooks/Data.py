import json
from pathlib import Path
from typing import Any


FEATURE_KEY_FALLBACKS = [
    "Feature Key - DMD Screen Games",
    "Feature Key - Upper Playfield Games",
    "Feature Key - Extra Flipper Games",
    "Feature Key - Spinner Games",
    "Feature Key - Ramp Games",
]


def _load_feature_key_names() -> list[str]:
    config_path = Path(__file__).resolve().parents[1] / "data" / "feature_gates.json"
    try:
        data = json.loads(config_path.read_text(encoding="utf-8"))
    except Exception:
        return list(FEATURE_KEY_FALLBACKS)

    names: list[str] = []
    for raw_entry in data.get("feature_keys", []) or []:
        if not isinstance(raw_entry, dict):
            continue
        item_name = str(raw_entry.get("item") or "").strip()
        if item_name and item_name not in names:
            names.append(item_name)
    return names or list(FEATURE_KEY_FALLBACKS)


# called after the game.json file has been loaded
def after_load_game_file(game_table: dict) -> dict:
    return game_table
# called after the items.json file has been loaded, before any item loading or processing has occurred
# if you need access to the items after processing to add ids, etc., you should use the hooks in World.py
def after_load_item_file(item_table: list) -> list:
    existing_names = {
        str(item.get("name") or "").strip()
        for item in item_table
        if isinstance(item, dict)
    }
    for item_name in _load_feature_key_names():
        if item_name in existing_names:
            continue
        item_table.append({
            "name": item_name,
            "count": 0,
            "progression": True,
            "local": True,
            "category": ["Progression", "Key", "Feature Key"],
        })
    return item_table

# NOTE: Progressive items are not currently supported in Manual. Once they are,
#       this hook will provide the ability to meaningfully change those.
def after_load_progressive_item_file(progressive_item_table: list) -> list:
    return progressive_item_table

# called after the locations.json file has been loaded, before any location loading or processing has occurred
# if you need access to the locations after processing to add ids, etc., you should use the hooks in World.py
def after_load_location_file(location_table: list) -> list:
    # Boss Keys should only come from Medium/Hard checks.
    # Forbid Boss Key placement on all Easy checks (Ball 1 Sphere).
    for location in location_table:
        if str(location.get("region", "")).strip() != "Ball 1 Sphere":
            continue

        existing = location.get("dont_place_item")
        if existing is None:
            location["dont_place_item"] = ["Boss Key"]
            continue

        if isinstance(existing, list):
            if "Boss Key" not in existing:
                existing.append("Boss Key")
            continue

        # Normalize unexpected non-list values to list format.
        location["dont_place_item"] = [str(existing), "Boss Key"]

    return location_table

# called after the locations.json file has been loaded, before any location loading or processing has occurred
# if you need access to the locations after processing to add ids, etc., you should use the hooks in World.py
def after_load_region_file(region_table: dict) -> dict:
    return region_table

# called after the categories.json file has been loaded
def after_load_category_file(category_table: dict) -> dict:
    return category_table

# called after the categories.json file has been loaded
def after_load_option_file(option_table: dict) -> dict:
    # option_table["core"] is the dictionary of modification of existing options
    # option_table["user"] is the dictionary of custom options
    return option_table

# called after the meta.json file has been loaded and just before the properties of the apworld are defined. You can use this hook to change what is displayed on the webhost
# for more info check https://github.com/ArchipelagoMW/Archipelago/blob/main/docs/world%20api.md#webworld-class
def after_load_meta_file(meta_table: dict) -> dict:
    return meta_table

# called when an external tool (eg Universal Tracker) asks for slot data to be read
# use this if you want to restore more data
# return a dict to override what gets passed through to UT regeneration
def hook_interpret_slot_data(world, player: int, slot_data: dict[str, Any]) -> dict | bool:
    return False
