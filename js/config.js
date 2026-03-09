// Main student-editable configuration file.
// Most gameplay changes should happen here, not in engine files.

export const GAME_CONFIG = {
    tileSize: 32,

    // Map size is counted in tiles, not pixels.
    map: {
        imageSrc: "assets/map/map.png",
        overlaySrc: "assets/map/map_overlay.png",
        widthTiles: 40,
        heightTiles: 30,
    },

    // Camera size is in pixels.
    // Smaller values feel more zoomed in.
    camera: {
        widthPx: 320,
        heightPx: 240,
    },

    // Player setup.
    player: {
        startTile: { x: 1, y: 1 },
        moveDurationMs: 150,
        defaultFacing: "down",
        spriteSheetSrc: "assets/player/player_sheet.png",
        frameWidth: 32,
        frameHeight: 32,

        // Direction rows in the sprite sheet.
        // Frames can stay at 1 if you do not want animation.
        directions: {
            up: { row: 0, frames: 4 },
            down: { row: 1, frames: 1 },
            left: { row: 2, frames: 1 },
            right: { row: 3, frames: 1 },
        },
    },

    // Simple player data that triggers can read and change.
    // Use items for keys, coins, quest items, and collectibles.
    // Use stats for numbers like health, score, energy, or strength.
    // Example trigger checks:
    // { scope: "items", key: "coin", op: ">=", value: 1 }
    // { scope: "stats", key: "health", op: "<=", value: 2 }
    playerState: {
        items: {
            coin: 0,
        },
        stats: {
            health: 3,
            strength: 1,
        },
    },

    // Event -> sound key mapping.
    // These are built-in engine events.
    audioEvents: {
        step: "step",
        interact: "interact",
        teleport: "teleport",
        ui_open_modal: "ui_open_modal",
    },

    // Sound key -> file path mapping.
    // Add your own keys here, then use them in trigger actions.
    sounds: {
        step: "assets/sfx/step.wav",
        interact: "assets/sfx/interact.wav",
        pickup: "assets/sfx/pickup.wav",
        teleport: "assets/sfx/teleport.wav",
        ui_open_modal: "assets/sfx/interact.wav",
    },

    // Non-walkable cells.
    // Use either:
    // - Single tile: { x: 10, y: 4 }
    // - Filled range (line or rectangle): { x1: 8, y1: 4, x2: 12, y2: 4 }
    // Good for walls, water, furniture, and room borders.
    solidTiles: [
        { x1: 0, y1: 0, x2: 2, y2: 0 },
        { x1: 0, y1: 1, x2: 0, y2: 7 },
        { x1: 2, y1: 1, x2: 2, y2: 4 },
        { x1: 2, y1: 6, x2: 2, y2: 7 },
        { x1: 3, y1: 4, x2: 4, y2: 6 },
        { x: 8, y: 2 }, { x: 12, y: 2 },
        { x: 9, y: 3 }, { x: 11, y: 3 },
        { x1: 8, y1: 4, x2: 12, y2: 4 },
        { x: 6, y: 9 },
    ],

    // Triggers are the main way to build gameplay.
    // One trigger can do multiple things by using actions: [...]
    //
    // Trigger types:
    // - onEnterCell: runs when the player steps on the tile
    // - onInteractCell: runs when the player faces the tile and presses Space/Enter
    //
    // Trigger helper keys:
    // - isSolid: true (blocks movement on that tile)
    // - sprite: "assets/sprites/your_image.png" (draws a 32x32 image on the tile)
    // - sprite: "assets/sprites/portal.gif" (animated gif)
    // - sprite: { src: "assets/sprites/portal.png", frames: 4, speed: 150 } (spritesheet)
    // - conditions: [{ scope: "items", key: "coin", op: ">=", value: 1 }]
    // - actions: [{ kind: "playSound", soundKey: "interact" }, { kind: "giveItem", itemKey: "coin", amount: 1 }]
    // - elseAction: { kind: "openModalText", title: "...", text: "..." }
    //
    // Supported action kinds:
    // - playSound
    // - openModalText
    // - openModalVideo
    // - openModalHtml
    // - teleport
    // - giveItem
    // - removeItem
    // - changeStat
    // - setStat
    // - makePassable
    //
    // Small action examples:
    // { kind: "playSound", soundKey: "interact" }
    // { kind: "giveItem", itemKey: "coin", amount: 1 }
    // { kind: "changeStat", statKey: "health", amount: -1 }
    // { kind: "openModalText", title: "Hello", text: "Welcome!" }
    // { kind: "teleport", targetX: 10, targetY: 4 }
    // { kind: "makePassable", passableSprite: null }
    triggers: [
        {
            id: "coin_1",
            type: "onEnterCell",
            x: 1,
            y: 2,
            once: true,
            sprite: "assets/sprites/coin.gif",
            actions: [
                {
                    kind: "playSound",
                    soundKey: "pickup",
                },
                {
                    kind: "giveItem",
                    itemKey: "coin",
                    amount: 1,
                },
            ],
        },
        {
            id: "picked_up_coin",
            type: "onEnterCell",
            x: 1,
            y: 3,
            once: true,
            sprite: "assets/sprites/question.png",
            actions: [
                {
                    kind: "openModalText",
                    title: "Wow, did you see that!",
                    text: "You picked up a coin! It was defined as a trigger in the config.js, try to find it.",
                },
            ],
        },
        {
            id: "coin_sign",
            type: "onInteractCell",
            x: 3,
            y: 5,
            isSolid: true,
            sprite: "assets/sprites/sign.png",
            conditions: [{ scope: "items", key: "coin", op: ">=", value: 2 }],
            actions: [
                {
                    kind: "openModalHtml",
                    title: "Coin Sign",
                    contentKey: "coin_sign",
                },
            ],
            elseAction: {
                kind: "openModalText",
                title: "Oh no!!!",
                text: "This sign requires at least 2 coins. It says so in the 'conditions' for the trigger for this sign.",
            },
        },
        {
            id: "coin_2",
            type: "onEnterCell",
            x: 1,
            y: 6,
            once: true,
            sprite: "assets/sprites/coin.gif",
            actions: [
                {
                    kind: "playSound",
                    soundKey: "pickup",
                },
                {
                    kind: "giveItem",
                    itemKey: "coin",
                    amount: 1,
                },
            ],
        },
        {
            id: "key_pink",
            type: "onInteractCell",
            x: 1,
            y: 3,
            once: true,
            sprite: "assets/sprites/question.png",
            actions: [
                {
                    kind: "playSound",
                    soundKey: "pickup",
                },
                {
                    kind: "giveItem",
                    itemKey: "key_pink",
                    amount: 1,
                },
                {
                    kind: "openModalText",
                    title: "Good catch!",
                    text: "You found the super secret pink key! Now you can open the door with it.",
                },
            ],
        },
        {
            id: "door_pink",
            type: "onInteractCell",
            x: 1,
            y: 7,
            once: true,
            isSolid: true,
            sprite: "assets/sprites/door_pink.png",
            conditions: [
                { scope: "items", key: "key_pink", op: ">=", value: 1 },
            ],
            actions: [
                {
                    kind: "makePassable",
                    passableSprite: "assets/sprites/door_pink_open.png",
                },
                {
                    kind: "openModalText",
                    title: "You opened the door!",
                    text: "You used the pink key to open this door. Congrats on finding the secret pink key!",
                },
            ],
            elseAction: {
                kind: "openModalText",
                title: "Locked!",
                text: "This door is locked with a pink key (original i know). Take a closer look at the question mark.",
            },
        },
        {
            id: "village_sign",
            type: "onInteractCell",
            x: 10,
            y: 3,
            isSolid: true,
            sprite: "assets/sprites/sign.png",
            conditions: [{ scope: "stats", key: "health", op: "<=", value: 1 }],
            actions: [
                {
                    kind: "openModalHtml",
                    title: "Village Sign",
                    contentKey: "village_sign",
                },
            ],
            elseAction: {
                kind: "openModalText",
                title: "Village Sign",
                text: "You can only view this if you're almost dead!",
            },
        },
        {
            id: "intro_video",
            type: "onEnterCell",
            x: 6,
            y: 6,
            sprite: "assets/sprites/question.png",
            actions: [
                {
                    kind: "openModalVideo",
                    title: "Intro Video",
                    contentKey: "intro_clip",
                },
            ],
        },
        {
            id: "portal_left_jump",
            type: "onEnterCell",
            x: 8,
            y: 3,
            sprite: {
                src: "assets/sprites/portal_overlay.png",
                frames: 4,
                speed: 150,
            },
            actions: [
                {
                    kind: "playSound",
                    soundKey: "teleport",
                },
                {
                    kind: "changeStat",
                    statKey: "health",
                    amount: -1,
                },
                {
                    kind: "teleport",
                    targetX: 13,
                    targetY: 3,
                    sfx: "teleport",
                    sprite: {
                        src: "assets/sprites/portal_action.png",
                        frames: 4,
                        speed: 150,
                    },
                },
            ],
        },
        {
            id: "portal_right_jump",
            type: "onEnterCell",
            x: 12,
            y: 3,
            actions: [
                {
                    kind: "playSound",
                    soundKey: "teleport",
                },
                {
                    kind: "teleport",
                    targetX: 7,
                    targetY: 3,
                    sfx: "teleport",
                },
            ],
        },
    ],
};
