# Flippermizer

Flippermizer! Pinball Randomized! is a pinball randomizer client for Archipelago and singleplayer Home Edition runs.

This repository is intentionally kept to the runnable Home Edition Electron launcher source plus the basic HTML overlay entrypoint. Experimental AP world files, YAML generators, task repository editors, reports, and generated release bundles are kept out of the tracked repo.

## Release

The current stable release is **Home Edition 1.1**:

https://github.com/AshodinVenteal/Flippermizer/releases/tag/home-edition-v1.1.0

Release asset:

- `Flippermizer-Home-Edition-1.1.0-portable.exe`

## Home Edition Player Options

Build a trapless Home Edition YAML in the hosted player options page:

https://ashodinventeal.github.io/Flippermizer/player-options.html

## Run From Source

```powershell
npm install
npm start
```

## Build The Launcher

```powershell
npm install
npm run check
npm run dist:portable
```

The unpacked app and portable launcher are written to `dist/`. Build output is intentionally ignored by git; publish launcher binaries through GitHub Releases.

## Basic HTML Version

Open `flippermizer_overlay_tower_v3.html` directly for the basic HTML overlay version. Keep these runtime assets beside it:

- `flippermizer_table_repository.js`
- `flippermizer_task_explanations.js`
- `vendor/`
- `Flippermizer Images/`
- `WorldsBanners/`
- `sounds/`

## Important Files

- `electron/` - Electron launcher, preload, and Home Edition bridge.
- `docs/player-options.html` - hosted Home Edition YAML/player options builder.
- `flippermizer_overlay_tower_v3.html` - main HTML overlay surface.
- `flippermizer_table_repository.js` - table data and metadata.
- `flippermizer_task_explanations.js` - task and strategy guide text.
- `tools/ensure_home_icon_ico.js` - prepares the Windows icon for packaging.
- `tools/stamp_unpacked_icon.js` - stamps the icon onto the unpacked executable.
