# Flippermizer

Flippermizer! Pinball Randomized! is a pinball randomizer client for Archipelago and singleplayer Home Edition runs. It randomizes pinball table objectives, tracks received and sent items, opens tables through progression, and wraps the run in a cyber-pinball UI built from HTML, CSS, JavaScript, and Electron.

The current release focus is **Flippermizer! Pinball Randomized! | Home Edition**, a desktop client built for Archipelago multiworld play and local singleplayer seeds without stream-only integrations.

## Home Edition 1.0 RC1

Home Edition 1.0 RC1 is the first release candidate intended for real Archipelago run use. It is published from the `home-edition` branch with the tag `home-edition-v1.0.0-rc1`.

Release assets:

- `Flippermizer-Home-Edition-1.0.0-portable.exe` - Windows portable Electron launcher.
- `Flippermizer-Home-Edition-1.0.0-upload-bundle.zip` - launcher plus helper files for setup and distribution.

The upload bundle includes:

- Home Edition portable launcher.
- `flippermizer_yaml_options.html` for generating Flippermizer AP player YAML.
- `manual_flippermizerworldsofpinball_base_game.apworld`.
- This README.

The included AP World no longer emits Boss Key items into Archipelago generation. Home Edition handles boss key discovery, boss table presentation, and boss progression locally while normal checks still report through Archipelago.

## Latest Update Patch Notes

- Published Home Edition 1.0 RC1 from the `home-edition` branch.
- Packaged the Windows portable launcher and an upload bundle for players.
- Added the YAML Options helper and latest AP World to the release bundle.
- Updated the AP World package so Boss Key and Boss Key Hint item counts are zero.
- Added profile/save support for Home Edition, including profile identity, FLPRP, local seed saves, and progression tracking.
- Split controls into singleplayer and multiplayer flows, with AP connection, item log, connection log, and hints focused under multiplayer.
- Added AP Text Client-style connection logging with color-coded player, item, hint, and status text.
- Added Received, Sent, and Hint logs with selectable/copyable entries and scroll retention.
- Improved AP sync handling so received/sent logs do not replay when the server state has not changed.
- Added corrected AP sent-item reporting so external players see the item actually sent by the server.
- Added full-size progression sent/received notifications and color-coded item type presentation.
- Added strategy guide tooltips for tasks and score goals, with table-specific corrections.
- Added boss table flow, boss table checks, siege timing, boss victory presentation, and phase music behavior.
- Stabilized table selection so AP sync, now-playing artifacts, and episode/live systems do not move the selected table in Home Edition.
- Removed stream-only systems from Home Edition, including chat stream hangman, FLPR-Bot sync, now-playing artifacts, and episode/live notifications.
- Added visuals/music options for background choices, logo positioning, hardware acceleration, and launcher display preferences.
- Cleaned the repository so tracked Markdown is limited to this README and generated AP logs, old upload bundles, backups, and episode helper scripts are no longer tracked.
- Filler Junk Items in Home Edition now play the Stream Edition easy/medium randomize roll before updating the junk drawers.
- Simplified junk counter drawers: Easy, Medium, and Fragment counters now show piece progress plus a small READY count for spendable rewards.
- Added readable collapsed counter chips for junk redeems and Extra Ball tokens so hidden drawer handles still show what is ready.
- Reworked the siege intro so the selected table morphs from its normal bubble card into the full siege card while the other table cards fade away.
- Updated the siege intro staging so the attacking force approaches the selected table first, then the castle appears before defense controls unlock.
- Reworked the siege-clear victory into a full-screen defense animation with the damaged castle visible, the attacking force driven off, victory lights, cheer timing, and regression coverage.
- Filler, junk, and Pinball Fragment rewards delivered through live AP received snapshots now show the same full-size received-item notification as other item rewards.

## Running Home Edition

Use the packaged release for normal play:

1. Download `Flippermizer-Home-Edition-1.0.0-upload-bundle.zip` from the RC1 release.
2. Extract it.
3. Run `Flippermizer-Home-Edition-1.0.0-portable.exe`.
4. For Archipelago generation, use the included `.apworld` and the YAML helper.

## Building From Source

```powershell
npm install
npm run check
npm run dist:portable
```

The unpacked app and portable build are written to `dist/`.

## Important Files

- `electron/` - Electron launcher, preload, and Home Edition bridge.
- `flippermizer_overlay_tower_v3.html` - main UI surface.
- `flippermizer_yaml_options.html` - AP YAML helper.
- `flippermizer_table_repository.js` - table data and metadata.
- `flippermizer_task_explanations.js` - task and strategy guide text.
- `ap_multiworld_test/world_source/` - Flippermizer AP World source.
- `WorldsBanners/`, `Flippermizer Images/`, `sounds/`, `vendor/` - runtime assets.
