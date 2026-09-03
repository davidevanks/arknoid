# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

This is an Arkanoid/Breakout game to be built with **vanilla HTML, CSS, and JavaScript — zero dependencies**, playable directly in a browser. The game itself is **not yet implemented**; so far the repo contains only art assets and a sprite-rendering helper. The README is in Spanish; project language for docs/comments is otherwise open.

## Running

No build step. Because `assets/spritesheet.js` loads the spritesheet via `new Image()` with a relative `src`, the game must be served over HTTP (not opened as a `file://` URL) or the canvas will taint / fail to load. Serve the project root with any static server, e.g.:

```
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Architecture

- `assets/spritesheet.js` — the sprite layer, and the intended rendering path for all game entities. Key points:
  - `loadSpritesheet(cb)` loads `assets/spritesheet-breakout.png` **once**, draws it into an offscreen `<canvas>` (`ssImg`), and fires queued callbacks. Call this before starting the game loop and gate first render on it.
  - `drawSprite(ctx, name, x, y, w, h)` — `name` is a key of `SPRITES` (`paddle`, `ball`) or `block_<color>` (e.g. `block_red`), where color is a key of `SPRITES.blocks`.
  - `drawFrame(ctx, frame, x, y, w, h)` — for explosion animations; `EXPLOSION_FRAMES[color]` is a 4-frame array, `EXPLOSION_DURATION` (150ms) is the total animation length.
  - Both draw calls are no-ops until `ssLoaded` is true.
  - Source sprite rects are hardcoded pixel coords into `spritesheet-breakout.png`; block colors are `gray, red, yellow, cyan, magenta, hotpink, green`.
- `assets/sounds/` — `ball-bounce.mp3`, `break-sound.mp3` for collision / block-break audio.
- `assets/spritesheet-breakout.png` — the live spritesheet. (`spritesheet-breakout/` at the repo root is a duplicate copy; `assets/spritesheet.js` points at the `assets/` one.)

When implementing the game, keep the dependency-free constraint and route all drawing through the `spritesheet.js` helpers rather than adding new image loads.
