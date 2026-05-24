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

## Quick Start

Home Edition runs now open a first-launch Quick Start inside the app. Open **Singleplayer -> Quick Start** any time to revisit it, or **Singleplayer -> Table List** for the expected table set.

- A seed is a generated run layout: worlds, tables, checks, progression items, and surprise events.
- Worlds are themed groups of tables. Clearing checks earns items that open more balls, more tables, and eventually the boss route.
- Checks are table goals. Complete the listed VPX goal, then redeem it in Flippermizer; score checks can be entered manually from the Checks page.
- Play checks on Ball 1 unless a future seed or rule screen explicitly says otherwise.
- After a reward animation, Home Edition returns to Checks so the next goal is ready without losing the current table context.
- Sieges are surprise defense events. Their score targets now scale by table era so early solid-state tables ask for smaller totals than later high-scoring tables.

## Table Requirements And VPX Flow

The in-app Table List is the source of truth for expected tables. Flippermizer uses real machine metadata where available, plus a small number of Original VPX entries where the seed expects them. Current compatibility notes are intentionally practical: use VPX builds that run the named tables reliably, keep the table names recognizable, and prefer stable community builds over experimental edits.

For repeated Ball 1 attempts, fully restarting a table is often safer than using F3 if that table loses trough state or behaves oddly after script reset. Score capture and screen-reading tools are still future workflow helpers; for now the supported Home Edition flow is manual score entry and check redemption from the Checks page.

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
