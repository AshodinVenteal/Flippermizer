# Flippermizer

Flippermizer! Pinball Randomized! is a pinball randomizer client for Archipelago and singleplayer Home Edition runs. It randomizes pinball table objectives, tracks received and sent items, opens tables through progression, and wraps the run in a cyber-pinball UI built from HTML, CSS, JavaScript, and Electron.

The current release focus is **Flippermizer! Pinball Randomized! | Home Edition**, a desktop client built for Archipelago multiworld play and local singleplayer seeds without stream-only integrations.

## Home Edition 1.1

Home Edition 1.1 is the current stable release intended for real Archipelago run use. It is published from the `home-edition` branch with the tag `home-edition-v1.1.0`.

Release assets:

- `Flippermizer-Home-Edition-1.1.0-portable.exe` - Windows portable Electron launcher.

The included AP World no longer emits Boss Key items into Archipelago generation. Home Edition handles boss key discovery, boss table presentation, and boss progression locally while normal checks still report through Archipelago.

## Latest Update Patch Notes

- Home Edition now throttles background seed-save, profile HUD, counter, and auto-swap refresh work to reduce lag when clicking and hovering in the launcher.
- Visuals / Music now includes a bundled font selector with Press Start 2P, Hubot Sans, and Jersey 15, and the Home header uses the Stream-style layout with HOME EDITION branding.
- Score checks now keep their pending redemption metadata long enough to pair with later AP ReceivedItems snapshots, including the case where RoomUpdate confirms the check first.
- Cross-game ReceivedItems now wait for known DataPackage item names instead of processing as generic `Item #...` placeholders, restoring Progressive Ball reward handling.
- Stream and Home runtime polling has been tightened so Bonus Pinball and launcher windows do less idle refresh work.
- Promoted Home Edition 1.1 from the `home-edition` branch as the latest stable release.
- Added the Task Repository Editor, repeated-task grouping, template table markers, and exportable template guidance for task/title/tooltip cleanup.
- Normalized Home and Stream task titles and strategy tooltips with `GUIDE:` / `NOTE:` labels preserved in task hover cards.
- Packaged the Windows portable launcher for players.
- Kept the YAML Options helper and latest AP World in source while keeping release uploads focused on the launcher.
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
- Fixed Grand Lizard's Home Edition task catalog so it renders a full six-check set with distinct easy, medium, and hard objectives.
- Reworked the siege intro so the selected table morphs from its normal bubble card into the full siege card while the other table cards fade away.
- Updated the siege intro staging so the attacking force approaches the selected table first, then the castle appears before defense controls unlock.
- Reworked the siege-clear victory into a full-screen defense animation with the damaged castle visible, the attacking force driven off, victory lights, cheer timing, and regression coverage.
- Fixed the Home Edition launcher defense-button path so clearing a siege from Electron reliably plays the full-screen siege victory animation without double-playing it.
- Filler, junk, and Pinball Fragment rewards delivered through live AP received snapshots now show the same full-size received-item notification as other item rewards.

## Running Home Edition

Use the packaged release for normal play:

1. Download `Flippermizer-Home-Edition-1.1.0-portable.exe` from the latest Home Edition release.
2. Run `Flippermizer-Home-Edition-1.1.0-portable.exe`.
3. For Archipelago generation, use the AP World and YAML helper from source.

## Building From Source

```powershell
npm install
npm run check
npm run dist:portable
```

The unpacked app and portable build are written to `dist/`.

## New World Flyer Routine

When adding or staging new worlds, every new table flyer must come directly from the same source-acquisition pass used for the table build and guide research. Do not create placeholder flyer art.

Use `WorldsBanners/BestiaryFlyers/<TABLE_CODE>.jpg` for newly sourced flyer assets. If a new JPG replaces an older PNG for the same table code, remove the PNG from both the overlay asset folder and the parent packaging asset folder, update the table repository and overlay defaults to the JPG, and add a PNG-to-JPG migration for existing saved state.

Run `npm run check:flyers` before a new world is considered ready. The check fails if a banner ref points at a missing asset, if a placeholder-style flyer name is present, or if a table keeps both JPG and PNG flyer variants.

## Important Files

- `electron/` - Electron launcher, preload, and Home Edition bridge.
- `flippermizer_overlay_tower_v3.html` - main UI surface.
- `flippermizer_yaml_options.html` - AP YAML helper.
- `flippermizer_table_repository.js` - table data and metadata.
- `flippermizer_task_explanations.js` - task and strategy guide text.
- `ap_multiworld_test/world_source/` - Flippermizer AP World source.
- `WorldsBanners/`, `Flippermizer Images/`, `sounds/`, `vendor/` - runtime assets.
