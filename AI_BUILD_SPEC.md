# Level 2 Game Template Blueprint (PRD + AI Build Spec)

## 1) Purpose

Build a **beginner-friendly web game template** for Multimediedesign 1st semester (Level 2: World Building), so students can integrate their own graphics and create simple interactive behavior with minimal/no JavaScript experience.

This template is for teaching:
- Layout/responsiveness
- CSS variables
- Asset integration
- Basic Git/hosting workflow
- Basic game-logic authoring through config

---

## 2) Audience and Constraints

### Target users
- 1st semester students
- Only basic HTML/CSS skills
- Very limited/no JavaScript knowledge

### Hard constraints
- Use only **HTML, CSS, JavaScript (vanilla)**
- No frameworks/libraries unless absolutely necessary
- Code must be simple, readable, and heavily commented
- Students should be able to add logic mostly by editing **config data**, not core JS logic

---

## 3) Project Scope

### In scope
- Playable top-down template with:
  - Tile-based movement
  - Camera following player
  - Trigger system
  - Modal system
  - Sound effect support
  - Beginner-editable content config
  - Responsive UI shell around fixed game viewport
  - Clear folder structure for assets and content

### Out of scope
- Complex combat systems
- Inventory, quest trees, save systems
- Build tools (npm, bundlers, frameworks)

---

## 4) Core Technical Requirements

### 4.1 Grid, world, and player
- Tile size: **32x32 px**
- Map designed on 32x32 tile logic
- Player sprite source: one sprite sheet with 4 directions (`up/down/left/right`)
- Each frame is **32x32 px**
- Must support single-frame directions (no animation), with optional multi-frame animation later
- All movement/state is tile-based internally (tile coordinates)
- Full map size must be configurable in `config.js` (for example: `mapWidthTiles`, `mapHeightTiles`)
- If configured map dimensions do not match the map asset dimensions, game load must fail with a clear error message

### 4.2 Camera and viewport
- In-game camera/viewport size (pixel-based) must be configurable in `config.js`
- Camera follows player as they move
- Camera clamped to map bounds (never show outside world)
- Game must scale to available screen space while preserving pixel art:
  - Integer scale steps only (1x, 2x, 3x...)
  - Never use fractional scale
  - No smoothing/antialiasing when scaled (`image-rendering: pixelated` and equivalent)
  - Preserve aspect ratio of configured camera viewport
  - If screen/container is smaller than 1x viewport, keep 1x (no downscale) and allow overflow handling in outer UI shell

### 4.3 Movement behavior
- Visual movement should be smooth (interpolated)
- Movement resolves to exact 32x32 grid snap points
- If movement key is released mid-move, player continues until next snap point
- One-step movement queue allowed for clarity and stability
- Movement is 4-direction only (`up/down/left/right`), no diagonal movement

### 4.4 Trigger system (beginner-friendly)
Must support at least:
1. `onEnterCell` (step onto cell)
2. `onInteractCell` (point at/facing cell + press Space)

Must support actions:
1. `playSound`
2. `openModalText`
3. `openModalVideo`
4. `openModalHtml`
5. `teleport`

Trigger conflict handling:
- If multiple triggers match the same tile/event, evaluate in array order.
- Execute all valid matching triggers in array order.
- For `once: true`, mark consumed after successful execution.
- Trigger evaluation is based on the original triggering event; do not recursively process newly caused `onEnterCell` triggers in the same tick.

### 4.5 Collision / solid tiles
- The world must support non-walkable tiles (solid cells) so player cannot walk through them.
- Collision data must be beginner-editable.
- Collision format (required): a simple coordinate list in `config.js` (example: `[{ x: 4, y: 7 }, { x: 5, y: 7 }]`).
- Optional advanced approach: support a separate collision image/layer later, but not required for first version.

---

## 5) Beginner Dynamic Logic Model (Data-Driven)

Students should add/edit interactions via simple config files (JS objects).  
Goal: students modify data, not engine logic.

Example shape:

```js
const TRIGGERS = [
    {
        id: "welcome_tile",
        type: "onEnterCell",
        x: 3,
        y: 5,
        once: true,
        action: {
            kind: "openModalText",
            title: "Welcome",
            text: "You entered the village."
        }
    },
    {
        id: "portal_a",
        type: "onInteractCell",
        x: 10,
        y: 8,
        action: {
            kind: "teleport",
            targetX: 1,
            targetY: 14,
            sfx: "teleport"
        }
    }
];
```

Notes:
- Trigger IDs should be unique.
- Coordinates use tile units (not pixels).
- Unknown trigger/action kinds should be ignored with a console warning.
- Same coordinate system is used for collision (solid tile) definitions.

---

## 6) Modal + Media Requirements

- One reusable modal component in HTML/CSS/JS
- Modal supports:
  - Plain text content
  - Embedded video
  - Injected safe HTML block from predefined content map
- Must include close button and ESC-to-close
- Must not crash on invalid/missing content; log warning and continue

---

## 7) Sound System Requirements

- Simple event-to-audio mapping (config-based)
- Example events:
  - `step`
  - `interact`
  - `teleport`
  - `ui_open_modal`
- Missing sound file should fail gracefully (warning only)

Runtime/loading:
- Project is expected to run from a web server environment (not `file://`).
- Using `fetch` for config/content/media metadata is allowed.

---

## 8) File/Folder Structure (required)

```text
project-root/
  index.html
  README.md
  css/
    variables.css
    style.css
  js/
    config.js       # map size, tile size, player start, camera settings
    game.js         # game loop, movement, camera, render positioning
    triggers.js     # trigger lookup + dispatch
    modal.js        # reusable modal open/close/render logic
    audio.js        # audio registry + play helpers
  content/
    modals.js       # predefined safe HTML/text/video content entries
  assets/
    map/
      map.png
    player/
      player_sheet.png
    sfx/
      step.wav
      interact.wav
      teleport.wav
    video/
      intro.mp4
```

Clarifications:
- `config.js` is the main student-editable file for gameplay values:
  - tile size
  - map width/height in tiles
  - camera width/height in pixels
  - sprite sheet layout (direction rows, frames per direction; minimum 1)
  - trigger definitions
  - solid tile coordinate list
- `content/modals.js` stores reusable modal payloads (HTML/text/video metadata), referenced by trigger actions.
- Keep engine files (`game.js`, `triggers.js`, `modal.js`, `audio.js`) mostly stable for teaching.

---

## 9) HTML/CSS Standards

- Semantic HTML
- Mobile-first CSS
- Use CSS variables (`variables.css`) for:
  - Colors
  - Spacing
  - Radii
  - Font sizes
- Keep class naming clear and beginner readable
- Keep styles organized by section/components

---

## 10) Student Authoring Experience

A student should be able to do these tasks without editing engine logic:

1. Replace map image
2. Replace player sprite sheet (direction rows: up/down/left/right)
3. Change map size and camera size in config
4. Mark tiles as solid/non-solid
5. Add a trigger on a tile
6. Make trigger open text/video/html modal
7. Make trigger play a sound
8. Make trigger teleport player

---

## 11) Acceptance Criteria

### Gameplay and camera
- [ ] Player snaps exactly to 32x32 grid at rest
- [ ] Movement is smooth but grid-correct
- [ ] Releasing movement mid-step still completes next snap point
- [ ] Camera follows player and respects map bounds
- [ ] Camera size is configurable
- [ ] Full map size is configurable
- [ ] Game scales up using integer scale only (no fractional scaling, no smoothing blur)
- [ ] Player cannot move into solid tiles
- [ ] Player displays correct directional sprite (up/down/left/right) from sprite sheet
- [ ] No diagonal movement is possible
- [ ] Game load fails with clear error if map config dimensions do not match map asset dimensions

### Trigger system
- [ ] `onEnterCell` works
- [ ] `onInteractCell` works (facing/pointing + Space)
- [ ] All required action types work
- [ ] Trigger conflicts are deterministic (all valid matches run in array order)

### Modal and audio
- [ ] Modal opens/closes robustly
- [ ] Text/video/html modal modes function
- [ ] Sound actions can be assigned per trigger
- [ ] Missing media fails gracefully

### Beginner friendliness
- [ ] Trigger/action setup editable via config only
- [ ] Clear comments in config and JS
- [ ] README includes "how to add trigger" examples

---

## 12) Error Handling Rules

- No unhandled runtime crash on bad config/media
- Invalid trigger/action -> console warning + skip
- Invalid teleport target -> warning + no teleport
- Missing sound/video/html key -> warning + continue
- Controlled startup failure is allowed for fatal validation errors (for example: map dimension mismatch)

---

## 13) Performance and Simplicity Guidelines

- Keep JS modular but minimal
- Avoid premature optimization
- Prefer clear code over abstract architecture
- Keep feature set small and stable for teaching use

---

## 14) Deliverables for AI (must output)

1. `index.html`
2. `css/variables.css`
3. `css/style.css`
4. `js/config.js`
5. `js/game.js`
6. `js/triggers.js`
7. `js/modal.js`
8. `js/audio.js`
9. `content/modals.js`
10. `README.md` with beginner instructions
11. `assets/map/map.png` (placeholder allowed)
12. `assets/player/player_sheet.png` (placeholder allowed)
13. `assets/sfx/step.wav` (placeholder allowed)
14. `assets/sfx/interact.wav` (placeholder allowed)
15. `assets/sfx/teleport.wav` (placeholder allowed)
16. `assets/video/intro.mp4` (placeholder allowed)

---

## 15) AI Build Instructions (for Codex)

Use this repo blueprint to generate a complete starter project.

Rules:
- Do not use frameworks
- Keep code beginner-readable
- Add comments where students are expected to edit values
- Implement required movement/camera/trigger/modal/audio features
- Prioritize reliability and clarity over advanced patterns
- Ensure project runs in a local web server (no build step)

When done, include:
- Short setup notes in `README`
- "Add your first trigger" walkthrough
- "Replace assets" walkthrough
