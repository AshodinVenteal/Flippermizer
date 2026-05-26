# Flippermizer

Flippermizer! Pinball Randomized! is a pinball randomizer client for Archipelago and singleplayer Home Edition runs.

This repository now keeps the Home Edition source, Stream Edition source, and viewable APWorld source folders together so the code can be browsed directly on GitHub. Generated release bundles, dependency folders, and packaged APWorld archives stay out of Git.

## Repository Layout

- `Flippermizer Home Edition/` - Home Edition Electron launcher, basic HTML overlay, hosted player options page, and Home assets.
- `Flippermizer Stream Edition/` - Stream Edition launcher source and stream overlay assets.
- `Flippermizer Stream Edition/apworld/manual_flippermizerworldsofpinball_base_game/` - extracted Manual APWorld source package.
- `Flippermizer Stream Edition/apworld/FlippermizerWorldsofPinball/` - extracted FlippermizerWorldsofPinball APWorld source package.

## Release

The current stable release is **Home Edition 1.1**:

https://github.com/AshodinVenteal/Flippermizer/releases/tag/home-edition-v1.1.0

Release asset:

- `Flippermizer-Home-Edition-1.1.0-portable.exe`

### Home Edition 1.1 Hotfix - 2026-05-26

- Fixed vertical 1080x1920 orientation so the top HUD, Overview, and controls stack within the Electron window without right-edge overhang.
- Updated the portrait scaling baseline to 1080x1920 for cleaner Home Edition capture and portable launcher behavior.

## Home Edition Player Options

Online, you can build a trapless Home Edition YAML in the hosted player options page:

https://ashodinventeal.github.io/Flippermizer/player-options.html

## Run Home Edition From Source

```powershell
cd "Flippermizer Home Edition"
npm install
npm start
```

## Build The Home Edition Launcher

```powershell
cd "Flippermizer Home Edition"
npm install
npm run check
npm run dist:portable
```

The unpacked app and portable launcher are written to `dist/`. Build output is intentionally ignored by Git; publish launcher binaries through GitHub Releases.

## Run Stream Edition From Source

```powershell
cd "Flippermizer Stream Edition"
npm install
npm start
```

## Basic HTML Version

Open `Flippermizer Home Edition/flippermizer_overlay_tower_v3.html` directly for the basic HTML overlay version. Keep these runtime assets beside it:

- `flippermizer_table_repository.js`
- `flippermizer_task_explanations.js`
- `vendor/`
- `Flippermizer Images/`
- `WorldsBanners/`
- `sounds/`
