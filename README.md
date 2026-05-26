# Flippermizer

Flippermizer! Pinball Randomized! is a pinball randomizer client for Archipelago and singleplayer Home Edition runs.

This repository keeps the Home Edition source, Stream Edition source, and viewable APWorld source folders together so the code can be browsed directly on GitHub. Generated release bundles, dependency folders, and packaged APWorld archives stay out of Git.

## Repository Layout

- `Flippermizer Home Edition/` - Home Edition Electron launcher, basic HTML overlay, hosted player options page, and Home assets.
- `Flippermizer Stream Edition/` - Stream Edition launcher source and stream overlay assets.
- `apworld/manual_flippermizerworldsofpinball_base_game/` - extracted Manual APWorld source package.
- `apworld/FlippermizerWorldsofPinball/` - extracted FlippermizerWorldsofPinball APWorld source package.

## Release

The current stable release is **Home Edition 1.1**:

https://github.com/AshodinVenteal/Flippermizer/releases/tag/home-edition-v1.1.0

Release asset:

- `Flippermizer-Home-Edition-1.1.0-portable.exe`

### Home Edition 1.1 Hotfix - 2026-05-26

- Fixed vertical 1080x1920 orientation so the top HUD, Overview, and controls stack within the Electron window without right-edge overhang.
- Updated the portrait layout to use the actual Electron viewport, including smaller saved vertical windows such as 968x1356.
- Refreshed the portable EXE and win-unpacked ZIP so both release downloads include the vertical viewport fix.

## Home Edition Player Options

Online, you can build a trapless Home Edition YAML in the hosted player options page:

https://ashodinventeal.github.io/Flippermizer/player-options.html

## Hosted Task Updates

Home Edition and Stream Edition can check GitHub Pages for a stable task repository override pack when an online Archipelago run connects. The hosted manifest lives at:

https://ashodinventeal.github.io/Flippermizer/tasks/manifest.json

Clients merge the hosted pack after bundled defaults and before any local Task Repository Editor overrides. If the hosted files are unavailable or fail validation, the app keeps using its bundled task data.

## Quick Start

Home Edition runs now open a first-launch Quick Start inside the app. Open **Singleplayer -> Quick Start** any time to revisit it, or **Singleplayer -> Table List** for the expected table set.

- A seed is a generated run layout: worlds, tables, checks, progression items, and surprise events.
- Worlds are themed groups of tables. Clearing checks earns items that open more balls, more tables, and eventually the boss route.
- Checks are table goals. Complete the listed VPX goal, then redeem it in Flippermizer; score checks can be entered manually from the Checks page.
- Play checks on Ball 1 unless a future seed or rule screen explicitly says otherwise.
- After a reward animation, Home Edition returns to Checks so the next goal is ready without losing the current table context.
- Sieges are surprise defense events. Their score targets now scale by table era so early solid-state tables ask for smaller totals than later high-scoring tables.

## Table Requirements And VPX Flow

The in-app Table List is the source of truth for expected tables. The Flippermizer Current Catalog of tables are based on real pinball machines plus curated Original VPX entries. It will prefer complete, stable VPX releases along with working scoring and rules.

For repeated Ball 1 attempts, fully restarting a table is often safer than using F3 if that table loses trough state or behaves oddly after script reset. Score capture and screen-reading tools are still future workflow helpers; for now the supported Home Edition flow is manual score entry and check redemption from the Checks page.

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

The unpacked app and portable launcher are written to `dist/`. Build output is intentionally ignored by git; publish launcher binaries through GitHub Releases.

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

## Important Files

- `electron/` - Electron launcher, preload, and Home Edition bridge.
- `docs/player-options.html` - hosted Home Edition YAML/player options builder.
- `flippermizer_overlay_tower_v3.html` - main HTML overlay surface.
- `flippermizer_table_repository.js` - table data and metadata.
- `flippermizer_task_explanations.js` - task and strategy guide text.
- `tools/ensure_home_icon_ico.js` - prepares the Windows icon for packaging.
- `tools/stamp_unpacked_icon.js` - stamps the icon onto the unpacked executable.
