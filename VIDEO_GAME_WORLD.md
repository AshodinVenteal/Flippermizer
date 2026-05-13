# Pixel Quest World Candidate

Video-game-themed 5-table world candidate for Flippermizer.

## Table Lineup

| Code | Table | Manufacturer / Year | Status |
| --- | --- | --- | --- |
| `SMB` | Super Mario Bros. | Gottlieb 1992 | VPX/INI staged; flyer acquired; needs guide, scores, tasks |
| `SF2` | Street Fighter II | Gottlieb 1993 | VPX/INI staged; flyer acquired; needs guide, scores, tasks |
| `QBERT` | Q*bert's Quest | Gottlieb 1983 | VPX/INI staged; flyer acquired; needs guide, scores, tasks |
| `MMPAC` | Mr. & Mrs. Pac-Man | Bally 1982 | VPX/INI staged; flyer acquired; needs guide, scores, tasks |
| `SINV` | Space Invaders | Bally 1980 | VPX/INI staged; flyer acquired; needs guide, scores, tasks |

## Staging Notes

- World group label: `Pixel Quest`
- AP group key recommendation: `pixel_quest`
- Keep generation-ready off until all five tables have 3-ball score ranges and objective tasks.
- This world intentionally leans classic arcade rather than broader game-adjacent media, so it stays visually distinct from Sci-Fi Signal and Comic Book Collision.
- VPX pool scaffold created at `C:\vPinball\VisualPinball\Tables\Flippermizer Randomizer Themes\World Themes\Pool 18 - Pixel Quest`.
- All five Pixel Quest VPX files are staged in normal `Table # - Name (Maker Year)` order with matching `.ini` viewport files.
- Flyer art is wired through `WorldsBanners/BestiaryFlyers` for all five Pixel Quest tables.

## 3-Ball Check

- `SMB` and `SF2` are Gottlieb System 3 games and can be configured for 3-ball play.
- `QBERT` is Gottlieb System 80A and can be configured for 3-ball play.
- `MMPAC` and `SINV` are Bally AS-2518-35 games and can be configured for 3-ball play.
- Strict interpretation: this is not a "factory 3-ball only" lineup because several machines also support 5-ball configuration.
- Practical Flippermizer interpretation: valid if we lock/verify each VPX/NVRAM to 3 balls before score-range capture.
