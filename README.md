# Flippermizer

Publishable essential overlay package for the Flippermizer project.

## Included

- `flippermizer_overlay_tower_v3.html`
- `flippermizer_table_repository.js`
- `flippermizer_task_explanations.js`
- `flippermizer_table_repository_library.html`
- runtime assets in `WorldsBanners/`, `Flippermizer Images/`, `sounds/`, and `vendor/`

## Not Included

- Archipelago world source and `.apworld` build artifacts
- Electron launcher, bots, local bridge services, and packaging output
- backup HTML snapshots and local-only development files

## Notes

- This publish copy removes local absolute file paths.
- The local FLPR bot bridge is disabled by default in the published overlay copy.
- JSZip is vendored locally at `vendor/jszip.min.js`.

## Run

Open `flippermizer_overlay_tower_v3.html` in a browser or OBS browser source.

For the built-in bestiary link, keep `flippermizer_table_repository_library.html` in the same folder as the overlay file.
