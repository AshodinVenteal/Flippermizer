# Flippermizer

A fully built, runnable and re-runnable Archipelago AP Manual World client built in-browser (soon to have an Electron launcher .exe variant) that will allow you to play through Pinball tables (currently only the 25 set shown here) and randomize your objectives, what you need to complete, and the objectives to finish the randomizer.

It was built entirely by me, Ashodin, using CSS, JS, and HTML code over the past month from scratch, learning as I go, and copy-pasting code from other example sources online to retroactively understand the code as I built it.

Streams utilizing Flippermizer can be seen at http://twitch.tv/ashodin on Tuesdays every week.

## What's Included?

- `flippermizer_overlay_tower_v3.html`
- `flippermizer_standalone_client.html`
- `flippermizer_standalone_client.css`
- `flippermizer_standalone_client.js`
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
- Shared Stream/Home Edition UI and integration expectations live in `STYLE_GUIDE.md`.

## Run

Open `flippermizer_overlay_tower_v3.html` in a browser or OBS browser source.

For the built-in bestiary link, keep `flippermizer_table_repository_library.html` in the same folder as the overlay file.

For the standalone AP client, use **Flippermizer! Pinball Randomized! | Home Edition**. It provides a pared-back Multiworld/Singleplayer interface without stream integrations, traps, or bonus pinball.

## Home Edition

Flippermizer! Pinball Randomized! | Home Edition can be packaged as a Windows executable:

```powershell
npm install
npm run dist:portable
```

The unpacked app and portable build are written to `dist/`.
