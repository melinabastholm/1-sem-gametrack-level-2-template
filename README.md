# Level 2 Top-Down Game Template

This project is a beginner-friendly top-down game engine built with HTML, CSS, and vanilla JavaScript.

Most game building happens in [js/config.js](C:/Code/1sem-spillinje/1-sem-gametrack-level-2-template/js/config.js). You can change the map, player start position, collisions, sounds, and triggers without editing the engine code.

## How the engine works

The game world is tile-based:

- Every tile is `32x32` pixels.
- The player also uses `32x32` frames.
- Movement is smooth, but the player always snaps exactly to the grid.
- Releasing a movement key mid-step still finishes the current tile move.
- Pressing a different direction briefly turns the player first, then moves if the key is held.
- The camera follows the player and stays inside the map bounds.

The engine is built around three editable layers:

1. The map image in `assets/map/`
2. Collision data in `solidTiles`
3. Event logic in `triggers`

## Where to edit things

### Main game data

Use [js/config.js](C:/Code/1sem-spillinje/1-sem-gametrack-level-2-template/js/config.js) for:

- `map.imageSrc`, `map.widthTiles`, `map.heightTiles`
- `camera.widthPx`, `camera.heightPx`
- `player.startTile`
- `player.moveDurationMs`
- `player.spriteSheetSrc`
- `player.frameWidth`, `player.frameHeight`
- `player.directions`
- `playerState`
- `audioEvents`
- `sounds`
- `solidTiles`
- `triggers`

### Reusable modal content

Use [content/modals.js](C:/Code/1sem-spillinje/1-sem-gametrack-level-2-template/content/modals.js) when you want:

- Styled HTML popups
- Reusable video entries
- Custom modal sizes for specific content

### Visual styling

Use these files when changing the interface:

- [css/style.css](C:/Code/1sem-spillinje/1-sem-gametrack-level-2-template/css/style.css) for the main layout, viewport, sprites, and modal shell
- [css/variables.css](C:/Code/1sem-spillinje/1-sem-gametrack-level-2-template/css/variables.css) for colors, spacing, radius, and text sizes
- [css/custom-content.css](C:/Code/1sem-spillinje/1-sem-gametrack-level-2-template/css/custom-content.css) for styling custom HTML modal content

## Building a map

The map is a single image. The engine checks that the image size matches the tile counts:

- Width must equal `map.widthTiles * tileSize`
- Height must equal `map.heightTiles * tileSize`

Example:

```js
map: {
    imageSrc: "assets/map/my_map.png",
    widthTiles: 50,
    heightTiles: 30
}
```

If the dimensions are wrong, the game stops at startup with a clear error message.

## Setting up the player

The player uses one spritesheet with rows for directions.

Example:

```js
player: {
    startTile: { x: 2, y: 2 },
    moveDurationMs: 150,
    defaultFacing: "right",
    spriteSheetSrc: "assets/player/player_sheet.png",
    frameWidth: 32,
    frameHeight: 32,
    directions: {
        up: { row: 0, frames: 4 },
        down: { row: 1, frames: 4 },
        left: { row: 2, frames: 4 },
        right: { row: 3, frames: 4 }
    }
}
```

Notes:

- `row` is the row number in the spritesheet.
- `frames` is how many frames exist for that direction.
- Set `frames: 1` if you want a still frame in that direction.
- The engine validates that the image is large enough for the configured rows and frames.

## Player state

The engine has one simple `playerState` object for inventory-like values and stats.

Example:

```js
playerState: {
    items: {
        coin: 0
    },
    stats: {
        health: 3,
        strength: 1
    }
}
```

Use:

- `items` for things the player has or collects
- `stats` for numbers like health, strength, score, or energy

Triggers can:

- check these values with `conditions`
- run `action` if the conditions pass
- run `elseAction` if they fail
- change values with `giveItem`, `removeItem`, `changeStat`, and `setStat`

## Blocking movement with `solidTiles`

`solidTiles` defines map collision. The player cannot walk onto these tiles.

Use a single tile:

```js
{ x: 10, y: 4 }
```

Use a line or rectangle:

```js
{ x1: 8, y1: 4, x2: 12, y2: 4 }
```

Example:

```js
solidTiles: [
    { x: 4, y: 5 },
    { x1: 8, y1: 2, x2: 8, y2: 8 },
    { x1: 12, y1: 10, x2: 18, y2: 14 }
]
```

This is useful for:

- Walls
- Water
- Furniture
- Buildings
- Edges the player should not cross

## Trigger system

Triggers are the main way to build game logic. Every trigger lives in the `triggers` array in [js/config.js](C:/Code/1sem-spillinje/1-sem-gametrack-level-2-template/js/config.js).

Each trigger needs:

- `id`
- `type`
- `x`
- `y`
- `action`

Optional keys:

- `once`
- `isSolid`
- `sprite`
- `conditions`
- `elseAction`

Basic example:

```js
{
    id: "coin_1",
    type: "onEnterCell",
    x: 3,
    y: 2,
    once: true,
    sprite: "assets/sprites/coin.gif",
    action: {
        kind: "giveItem",
        itemKey: "coin",
        amount: 1
    }
}
```

Condition example:

```js
{
    id: "village_sign",
    type: "onInteractCell",
    x: 10,
    y: 3,
    isSolid: true,
    conditions: [
        { scope: "items", key: "coin", op: ">=", value: 1 }
    ],
    action: {
        kind: "openModalHtml",
        contentKey: "village_sign"
    },
    elseAction: {
        kind: "openModalText",
        title: "Village Sign",
        text: "You need 1 coin."
    }
}
```

### Trigger types

#### `onEnterCell`

Runs when the player steps onto the trigger tile.

Good for:

- Area messages
- Damage zones
- Pickups
- Teleports
- Ambient sounds

#### `onInteractCell`

Runs when the player faces a tile and presses `Space` or `Enter`.

Good for:

- Signs
- NPC interaction tiles
- Doors
- Computers
- Treasure chests

If you want an interactable object to block movement, combine it with `isSolid: true`.

Example:

```js
{
    id: "sign_1",
    type: "onInteractCell",
    x: 10,
    y: 3,
    isSolid: true,
    sprite: "assets/sprites/sign.png",
    action: {
        kind: "openModalHtml",
        title: "Village Sign",
        contentKey: "village_sign"
    }
}
```

### Trigger action types

#### `playSound`

Plays a sound by key from `sounds`.

```js
action: {
    kind: "playSound",
    soundKey: "teleport"
}
```

#### `openModalText`

Opens a simple text modal.

```js
action: {
    kind: "openModalText",
    title: "Hint",
    text: "Try using the switch near the door."
}
```

#### `openModalVideo`

Opens a modal with a local video file. You can provide values directly or reuse an entry from `content/modals.js`.

Direct example:

```js
action: {
    kind: "openModalVideo",
    title: "Intro",
    src: "assets/video/intro.mp4",
    videoType: "video/mp4",
    description: "Opening cutscene"
}
```

Reusable content example:

```js
action: {
    kind: "openModalVideo",
    contentKey: "intro_clip"
}
```

#### `openModalHtml`

Opens styled HTML content from [content/modals.js](C:/Code/1sem-spillinje/1-sem-gametrack-level-2-template/content/modals.js).

```js
action: {
    kind: "openModalHtml",
    title: "Notice Board",
    contentKey: "village_sign"
}
```

Use this for:

- Styled quest cards
- Dialogue layouts
- Lore panels
- Journal pages
- Menus or fake UI screens

#### `teleport`

Moves the player to a new tile if the target is inside the map and not solid.

```js
action: {
    kind: "teleport",
    targetX: 13,
    targetY: 3,
    sfx: "teleport"
}
```

Teleport is useful for:

- Portals
- Doors between rooms
- Staircases
- Secret passages
- Entering buildings

#### `giveItem`

Adds to an item count in `playerState.items`.

```js
action: {
    kind: "giveItem",
    itemKey: "coin",
    amount: 1
}
```

#### `removeItem`

Removes from an item count in `playerState.items`.

```js
action: {
    kind: "removeItem",
    itemKey: "coin",
    amount: 1
}
```

#### `changeStat`

Adds or subtracts from a value in `playerState.stats`.

```js
action: {
    kind: "changeStat",
    statKey: "health",
    amount: -1
}
```

#### `setStat`

Sets a value directly in `playerState.stats`.

```js
action: {
    kind: "setStat",
    statKey: "health",
    value: 5
}
```

## Trigger helper keys

### `once: true`

The trigger only works once. If it succeeds, it is consumed and does not run again.

Use it for:

- Collectibles
- One-time messages
- First-time cutscenes
- Single-use switches

### `isSolid: true`

Adds collision to that trigger tile.

Use it for:

- Signs
- Computers
- Lockers
- Tables with interaction
- Doors you want the player to face before interacting

### `sprite`

Draws a tile-sized visual on the map at the trigger position.

Supported forms:

Static image:

```js
sprite: "assets/sprites/sign.png"
```

Animated GIF:

```js
sprite: "assets/sprites/coin.gif"
```

Spritesheet animation:

```js
sprite: {
    src: "assets/sprites/portal_overlay.png",
    frames: 4,
    speed: 150
}
```

Notes:

- Spritesheet frames are read left-to-right on a single row.
- Each frame is treated as one `32x32` tile.
- `speed` is milliseconds per frame.
- If a trigger has both `sprite` and `once: true`, the sprite disappears after the trigger succeeds.

## Teleport effect sprites

Teleport actions can also have an optional `sprite` key. This effect is drawn on top of the player:

- It plays forward before the player disappears
- The player is moved
- It plays backward on the destination tile

Example:

```js
action: {
    kind: "teleport",
    targetX: 20,
    targetY: 8,
    sfx: "teleport",
    sprite: {
        src: "assets/sprites/portal_action.png",
        frames: 4,
        speed: 150
    }
}
```

Notes:

- The teleport effect sprite is optional.
- While the teleport effect is playing, movement and interaction are temporarily locked.

## Condition rules

Conditions are checked in order. All conditions must pass for the trigger `action` to run.

Example:

```js
conditions: [
    { scope: "items", key: "coin", op: ">=", value: 1 },
    { scope: "stats", key: "health", op: "<=", value: 3 },
    { scope: "stats", key: "strength", op: ">=", value: 1 },
    { scope: "stats", key: "strength", op: "<=", value: 4 }
]
```

Supported values:

- `scope`: `items` or `stats`
- `key`: the item/stat name to check
- `op`: `===`, `>`, `>=`, `<`, `<=`
- `value`: number to compare against

If any condition fails:

- `elseAction` runs if it exists
- otherwise nothing happens

## Modal content workflow

Use [content/modals.js](C:/Code/1sem-spillinje/1-sem-gametrack-level-2-template/content/modals.js) for reusable content entries.

Example text-rich HTML entry:

```js
export const MODAL_CONTENT = {
    village_sign: {
        title: "Village Sign",
        maxWidth: "90vw",
        maxHeight: "90vh",
        html: `
            <article class="village-sign">
                <h3>Welcome</h3>
                <p>This town was built with trigger data.</p>
            </article>
        `
    }
};
```

Example video entry:

```js
intro_clip: {
    title: "Intro Clip",
    videoSrc: "assets/video/intro.mp4",
    videoType: "video/mp4",
    description: "Sample local video file"
}
```

You can also set modal size per action or per content entry:

```js
maxWidth: "900px",
maxHeight: "80vh"
```

## Sound system

The sound system has two layers in [js/config.js](C:/Code/1sem-spillinje/1-sem-gametrack-level-2-template/js/config.js):

- `sounds`: maps a sound key to a file path
- `audioEvents`: maps built-in game events to a sound key

Example:

```js
audioEvents: {
    step: "step",
    interact: "interact",
    teleport: "teleport",
    ui_open_modal: "ui_open_modal"
},

sounds: {
    step: "assets/sfx/step.wav",
    interact: "assets/sfx/interact.wav",
    teleport: "assets/sfx/teleport.wav",
    ui_open_modal: "assets/sfx/interact.wav"
}
```

The engine already uses these event names:

- `step`
- `interact`
- `teleport`
- `ui_open_modal`

You can also play sounds manually through triggers with `playSound`.

## Common game-building patterns

### Signpost

```js
{
    id: "forest_sign",
    type: "onInteractCell",
    x: 14,
    y: 6,
    isSolid: true,
    sprite: "assets/sprites/sign.png",
    action: {
        kind: "openModalText",
        title: "Forest Path",
        text: "North: Village  South: River"
    }
}
```

### One-time collectible

```js
{
    id: "coin_1",
    type: "onEnterCell",
    x: 7,
    y: 9,
    once: true,
    sprite: "assets/sprites/coin.gif",
    action: {
        kind: "giveItem",
        itemKey: "coin",
        amount: 1
    }
}
```

### Portal pair

```js
{
    id: "portal_a",
    type: "onEnterCell",
    x: 8,
    y: 3,
    sprite: {
        src: "assets/sprites/portal_overlay.png",
        frames: 4,
        speed: 150
    },
    action: {
        kind: "teleport",
        targetX: 20,
        targetY: 12,
        sfx: "teleport",
        sprite: {
            src: "assets/sprites/portal_action.png",
            frames: 4,
            speed: 150
        }
    }
}
```

### Information hotspot with custom layout

```js
{
    id: "museum_terminal",
    type: "onInteractCell",
    x: 18,
    y: 10,
    isSolid: true,
    action: {
        kind: "openModalHtml",
        contentKey: "museum_terminal"
    }
}
```

## Engine behavior and safety rules

The engine is designed to fail safely for beginner editing:

- Invalid triggers are skipped with console warnings
- Unknown trigger types and action kinds are skipped
- Missing modal content does not crash the game
- Missing sounds warn instead of crashing
- Invalid teleport targets are blocked safely
- Map, player start, and sprite sheet size are validated at startup

## File overview

- [index.html](C:/Code/1sem-spillinje/1-sem-gametrack-level-2-template/index.html): page structure, viewport, side panel, and modal root
- [js/config.js](C:/Code/1sem-spillinje/1-sem-gametrack-level-2-template/js/config.js): main editable game setup
- [js/game.js](C:/Code/1sem-spillinje/1-sem-gametrack-level-2-template/js/game.js): movement, camera, rendering, triggers, teleport effects
- [js/triggers.js](C:/Code/1sem-spillinje/1-sem-gametrack-level-2-template/js/triggers.js): trigger validation and execution rules
- [js/modal.js](C:/Code/1sem-spillinje/1-sem-gametrack-level-2-template/js/modal.js): modal open/close behavior
- [js/audio.js](C:/Code/1sem-spillinje/1-sem-gametrack-level-2-template/js/audio.js): sound loading and playback
- [content/modals.js](C:/Code/1sem-spillinje/1-sem-gametrack-level-2-template/content/modals.js): reusable HTML and video modal content
- [css/custom-content.css](C:/Code/1sem-spillinje/1-sem-gametrack-level-2-template/css/custom-content.css): styles for custom modal markup

## Suggested workflow for making a game

1. Replace the map image and set the correct map size.
2. Set the player start tile and player spritesheet rows.
3. Mark blocked areas in `solidTiles`.
4. Add `onInteractCell` triggers for objects like signs, doors, and terminals.
5. Add `onEnterCell` triggers for pickups, portals, and zone events.
6. Move bigger text or custom layouts into `content/modals.js`.
7. Add sound keys and connect them to actions.
8. Playtest and use the in-game info panel to inspect facing direction and interactable tiles.

This template works best when you treat `js/config.js` as your game data file and only touch engine files when you want to add a brand new mechanic.
