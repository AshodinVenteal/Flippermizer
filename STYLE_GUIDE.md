# Flippermizer Shared Style Guide

This is the shared reference for keeping the Stream client and the AP/SP Home Edition client visually and behaviorally aligned.

Use it whenever a feature, animation, sound, title, control, or layout polish is added to one client and may need to land in the other.

## Client Names

- **Stream client**: the full streaming overlay in `flippermizer_overlay_tower_v3.html`, usually run through the Electron launcher in `../flippermizer-launcher`.
- **AP/SP Home Edition**: the desktop client packaged from this repo through `electron/main.js`, `electron/preload.js`, and `electron/standalone-overlay-bridge.js`.
- **Shared tower HTML**: `flippermizer_overlay_tower_v3.html`. This is the first place to check for shared UI, animation, audio, and Controls-panel behavior.

## Parity Rule

When a change affects the look, feel, or player-facing behavior of Flippermizer, record whether it is:

- **Shared**: should exist in both Stream and AP/SP Home Edition.
- **Stream-only**: needs Twitch, OBS, traps, stream overlays, launcher renderer controls, or other streaming-specific runtime pieces.
- **AP/SP-only**: supports the Home Edition desktop flow, singleplayer/multiworld setup, or simplified non-stream play.

If a change is intentionally not shared, write down why. Future updates should not have to rediscover the reason.

## Visual Style

- Use the Press Start 2P arcade identity for major UI labels, panel titles, badges, and buttons.
- Keep the primary palette anchored in electric cyan, bright green, deep navy/black panels, gold reward accents, and red danger/boss accents.
- Prefer high-contrast arcade panels with glowing borders, inset highlights, and readable dense layouts.
- Scrollable Controls regions should use the Flippermizer themed scrollbar treatment, not default browser scrollbars.
- Button and tab states should have clear idle, hover, active, disabled, and busy states.
- Dense tool panels should stay compact and scannable. Avoid marketing-style hero layouts inside the app surface.
- New animations should respect the existing pixel/arcade energy: lightning, sparks, shimmer, impact shake, scanlines, and controlled glow.

## Shared Integration Checklist

Use this checklist when porting or reviewing a change:

- **Window titles**: Stream overlay windows and Home Edition should use the current product naming.
- **Controls UI**: tabs, resizable panels, AP connection controls, logs, received items, achievements, and scrollbars should stay visually consistent.
- **Boss key flow**: cinematic timing, aether spiral, spiral key reveal, snap, acquired text, travel sizzle, slam impact, sparks, and dock slot behavior should stay aligned.
- **SFX hooks**: any new animation beat should document the `playSfx(...)` key and whether both clients can trigger it.
- **Assets**: shared sounds, banners, icons, and table imagery should be included in both package configs when needed.
- **Renderer behavior**: launcher-only renderer controls should stay hidden or adapted in Home Edition.
- **Persistence**: settings saved through launcher/user data should have an AP/SP-safe fallback or a documented stream-only reason.
- **Build outputs**: after shared changes, rebuild both Electron deliverables if the packaged clients need the update.

## Current Parity Matrix

| Area | Shared Source | Stream Client | AP/SP Home Edition | Notes |
| --- | --- | --- | --- | --- |
| Product title | `flippermizer_overlay_tower_v3.html`, `../flippermizer-launcher/main.js`, `electron/main.js` | Shared | Shared | Stream title is `Flippermizer! Pinball Randomized!`; Home Edition app title includes `| Home Edition`. |
| Boss key cinematic | `flippermizer_overlay_tower_v3.html` | Shared | Shared | Includes lightning, aether spiral beneath key, spiral reveal, snap, acquired text, sizzle travel, slam boom, sparks, and dock shake. |
| Controls themed scrollbars | `flippermizer_overlay_tower_v3.html`, `electron/standalone-overlay-bridge.js` | Shared | Shared | Controls panels, AP logs, received items, table banner gallery, and achievement lists should not use default scrollbars. |
| AP connection controls | `flippermizer_overlay_tower_v3.html`, `electron/standalone-overlay-bridge.js` | Shared with stream extras | Shared with Home Edition layout | Keep connection/status/log language consistent even when layouts differ. |
| Twitch redemption flow | `flippermizer_overlay_tower_v3.html` | Stream-only | Not included | Home Edition should not require Twitch or channel point runtime code. |
| OBS/chroma/stream renderer controls | `flippermizer_overlay_tower_v3.html`, `../flippermizer-launcher/main.js` | Stream-only | Hidden/adapted | Keep Home Edition from surfacing launcher-only controls. |
| Bonus pinball stream panel | `FLPRBonusPinballField.*`, launcher assets | Stream-only | Not included | Only include in AP/SP if the Home Edition design later adds that mode. |

## Update Workflow

1. Make shared UI and animation changes in `flippermizer_overlay_tower_v3.html` whenever possible.
2. Put Home Edition-specific adaptation in `electron/standalone-overlay-bridge.js`.
3. Put Stream launcher window/app behavior in `../flippermizer-launcher/main.js`.
4. Sync Stream launcher assets from `../flippermizer-launcher`:

   ```powershell
   npm run sync:assets
   ```

5. Rebuild the Stream Electron launcher when packaged users need the change:

   ```powershell
   npm run dist:portable
   ```

6. Rebuild AP/SP Home Edition from this repo when packaged users need the change:

   ```powershell
   npm run dist:portable
   ```

7. Verify shared HTML copies match when the change should be shared:

   - source: `flippermizer_overlay_tower_v3.html`
   - parent synced copy: `../flippermizer_overlay_tower_v3.html`
   - launcher packaged asset: `../flippermizer-launcher/dist/win-unpacked/resources/app-assets/flippermizer_overlay_tower_v3.html`
   - Home Edition packaged asset: `dist/win-unpacked/resources/app/flippermizer_overlay_tower_v3.html`

## Change Log Template

Copy this into future notes or PRs when a cross-client change lands:

```markdown
### Shared Client Change

- Change:
- Shared / Stream-only / AP/SP-only:
- Source files:
- Stream client status:
- AP/SP Home Edition status:
- SFX/assets added:
- Build artifacts refreshed:
- Verification:
- Intentional gaps:
```
