# Level 2 Top-Down Template

Beginner-friendly top-down game template for Level 2 World Building.

## Implemented Status

- [x] Tile-based movement on a 32x32 grid
- [x] Smooth movement with exact grid snapping
- [x] No diagonal movement
- [x] Camera follows player and clamps to map bounds
- [x] Configurable camera size and map size
- [x] Integer-only pixel scaling (no smoothing)
- [x] Solid tile collision from config list
- [x] Trigger system (`onEnterCell`, `onInteractCell`)
- [x] Trigger actions (`playSound`, `openModalText`, `openModalVideo`, `openModalHtml`, `teleport`)
- [x] Reusable modal with ESC and close button
- [x] Basic sound system with graceful warnings
- [x] Sprite sheet support for up/down/left/right (single frame or multi-frame)
- [x] Side-panel live info box (position, facing tile, and interactable tile hints)

## Run Locally

Use a local web server (not `file://`).

Example options:

```bash
python -m http.server 4173
```

Then open `http://127.0.0.1:4173`.

## Controls

- Move: Arrow keys or WASD
- Interact: Space or Enter
- Close modal: Escape

## Main Files

- `index.html`
- `css/variables.css`
- `css/style.css`
- `js/config.js` (main student editing file)
- `js/game.js`
- `js/triggers.js`
- `js/modal.js`
- `js/audio.js`
- `content/modals.js`

## Edit Gameplay Without Engine Changes

Most edits should be in `js/config.js`:

- `map.widthTiles`, `map.heightTiles`
- `camera.widthPx`, `camera.heightPx`
- `player.startTile`
- `player.directions` (sprite sheet rows and frame counts)
- `solidTiles`
- `triggers`
- `audioEvents` and `sounds`

## Add Your First Trigger

1. Open `js/config.js`.
2. Find `triggers: [...]`.
3. Add a new trigger object:

```js
{
    id: "my_first_trigger",
    type: "onEnterCell",
    x: 5,
    y: 4,
    once: true,
    action: {
        kind: "openModalText",
        title: "Hello",
        text: "You stepped on tile (5,4)."
    }
}
```

4. Save and refresh the browser.

For interact triggers, use `type: "onInteractCell"`. The player must face the target tile and press Space or Enter.

## Replace Assets

### Map

1. Replace `assets/map/map.png`.
2. Keep tile size logic at 32x32.
3. Make sure map image dimensions match:
   - width = `map.widthTiles * tileSize`
   - height = `map.heightTiles * tileSize`

If dimensions do not match, startup fails with a clear error.

### Player sprite sheet

1. Replace `assets/player/player_sheet.png`.
2. Sheet uses direction rows in `js/config.js`:
   - `up`, `down`, `left`, `right`
3. Each frame is `32x32` by default.
4. Keep `frames: 1` for no animation, or set larger values for multi-frame movement.

### Sound and video

- Replace files in `assets/sfx/` and `assets/video/`.
- Keep paths aligned with `js/config.js` and `content/modals.js`.

## Trigger Notes

- Multiple triggers on the same tile/event run in array order.
- `once: true` triggers are consumed after successful execution.
- Unknown/invalid triggers are skipped with warnings.
- Triggers may add `isSolid: true` to make the trigger tile non-walkable (best used with `onInteractCell`).
- Triggers may add `sprite: "assets/sprites/your_image.png"` to draw a 32x32 image on that tile.
- Spritesheets are supported: `sprite: { src: "...", frames: 4, speed: 150 }` (frames across a single row).
- Animated GIFs are supported: `sprite: "assets/sprites/portal.gif"`.
- If a trigger has `sprite` and `once: true`, the sprite is removed after the trigger runs successfully.
- Modal actions can set `maxWidth` and `maxHeight` (for example `"900px"` or `"80vh"`).
- `content/modals.js` entries can also define `maxWidth` and `maxHeight` for reusable modal sizing.

### Teleport effect sprite

Teleport actions can optionally add a spritesheet effect that plays forward at the start tile and backward at the target:

```js
action: {
    kind: "teleport",
    targetX: 10,
    targetY: 5,
    sprite: { src: "assets/sprites/portal_effect.png", frames: 4, speed: 150 }
}
```

For animated GIFs, use `sprite: "assets/sprites/portal_effect.gif"` and set `speed` (in ms) to control how long
the effect stays visible.

## Collision Notes

- `solidTiles` supports both:
  - Single tile entries: `{ x: 10, y: 4 }`
  - Filled range entries (line or rectangle): `{ x1: 8, y1: 4, x2: 12, y2: 4 }`
- The player cannot move into solid tiles.
- Map bounds are always non-walkable.

## Known Constraints

- Integer-only scaling is used to preserve crisp pixels.
- If the screen is smaller than the camera at 1x scale, the stage can overflow and scroll.
