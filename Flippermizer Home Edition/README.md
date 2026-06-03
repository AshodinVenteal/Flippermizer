# Flippermizer

Flippermizer! Pinball Randomized! is a pinball randomizer client for Archipelago and singleplayer Home Edition runs.

This repository is intentionally kept to the runnable Home Edition Electron launcher source plus the basic HTML overlay entrypoint. Experimental AP world files, YAML generators, task repository editors, reports, and generated release bundles are kept out of the tracked repo.

## Release

The current stable release is **Home Edition 1.1.1**:

https://github.com/AshodinVenteal/Flippermizer/releases/tag/flippermizer-v1.1.1-2026-06-03

Release assets:

- `Flippermizer-Home-Edition-1.1.1-portable.exe`
- `Flippermizer-Home-Edition-1.1.1-win-unpacked.zip`

### Home Edition 1.1.1 Task + Boss Hotfix - 2026-06-03

- Retuned table goals and score targets for Attack from Mars, Harlem Globetrotters, Scared Stiff, Congo, Tales of the Arabian Nights, Cirqus Voltaire, Paragon, High Speed, and Bram Stoker's Dracula.
- Boss table setup now emits table-specific boss task checks and score checks, and Away With You can be cleared through gated Dev Tools if AP check reconciliation misses it.
- Curated worlds now carry their banner presentation into Tower and Checks, with improved world label/name sizing and per-world curated-by signatures in the YAML Builder.
- YAML Builder dropdowns now use dark option backgrounds with light text for readability.

### Home Edition 1.1.1 Checks + Counter Hotfix - 2026-05-29

- Darkened the Checks by World banner bubbles, enlarged the world names, and restored each table's own banner on Checks table sections, including City Slicker.
- Kept the Boss Table section on the Boss Table banner while the boss world bubble uses the boss world banner treatment.
- Fixed Item Counters so full AP inventory snapshots rebuild Junk Redeems from the given/used ledger instead of minting fresh charges after reconnecting.
- Added an Easy + Medium fusion animation that visibly transforms both ready redeems into a combined HARD redeem before targeting Hard checks.
- Refreshed the Toccata Terror and Tabletop Rumblespot banner art across Home Edition and Stream Edition assets.
- Rebuilt and refreshed the portable EXE and win-unpacked release copy with these fixes.

### Home Edition 1.1.1 Incremental - 2026-05-28

- Added curated table list generation and the mixed-era Well-Made Tables preset.
- Added a fullscreen control to the app chrome.
- Updated relic cards to show what each relic does, how to acquire it, and card-level Details/Equip controls.
- Added relic double-click behavior: double-click an unfocused relic to focus it, or double-click the focused relic to equip or unequip it.
- Updated Tilted Compass progression behavior so it marks one table per world with an uncollected Progressive Ball or Boss Key when spoiler truth is loaded.
- Updated AP hint handling so hint commands stay on Status unless they return a real hit, and AP worlds can emit Hint: Progressive Ball rewards with Boss Key/Progressive Ball hint groups.
- Removed Skateball's hard score target from the random Hard task pool; its separate score check remains available.

### Home Edition 1.1 Hotfix - 2026-05-26

- Fixed vertical 1080x1920 orientation so the top HUD, Overview, and controls stack within the Electron window without right-edge overhang.
- Updated the portrait layout to use the actual Electron viewport, including smaller saved vertical windows such as 968x1356.
- Refreshed the portable EXE and win-unpacked ZIP so both release downloads include the vertical viewport fix.

## Home Edition Player Options

Online, you can build a trapless Home Edition YAML in the hosted player options page:

https://ashodinventeal.github.io/Flippermizer/player-options.html

## Quick Start

Home Edition runs now open a first-launch Quick Start inside the app. Open **Singleplayer -> Quick Start** any time to revisit it, or **Singleplayer -> Table List** for the expected table set.

- A seed is a generated run layout: worlds, tables, checks, progression items, and surprise events.
- Worlds are themed groups of tables. Clearing checks earns items that open more balls, more tables, and eventually the boss route.
- Checks are table goals. Complete the listed VPX goal, then redeem it in Flippermizer; score checks can be entered manually from the Checks page.
- Play checks on Ball 1 unless a future seed or rule screen explicitly says otherwise.
- After a reward animation, Home Edition returns to Checks so the next goal is ready without losing the current table context.
- Sieges are surprise defense events. Their score targets use each table's score-guide anchors with era-aware profiles, keeping early solid-state tables generous and high-scoring tables reachable.

## Table Requirements And VPX Flow

The in-app Table List is the source of truth for expected tables. The Flippermizer Current Catalog of tables are based on real pinball machines plus curated Original VPX entries. It will prefer complete, stable VPX releases along with working scoring and rules.

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
