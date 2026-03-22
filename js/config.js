// Main student-editable configuration file.
// Most gameplay changes should happen here, not in engine files.

export const GAME_CONFIG = {
    tileSize: 32,

    // Map size is counted in tiles, not pixels.
    map: {
        imageSrc: "assets/map/map.png",
        overlaySrc: "assets/map/map_overlay.png",
        widthTiles: 24,
        heightTiles: 30,
    },

    // Camera size is in pixels.
    // Smaller values feel more zoomed in.
    camera: {
        widthPx: 280,
        heightPx: 200,
    },

    // Player setup.
    player: {
        startTile: { x: 13, y: 1 },
        moveDurationMs: 150,
        defaultFacing: "down",
        spriteSheetSrc: "assets/player/player_sheet2.png",
        frameWidth: 32,
        frameHeight: 32,

        // Direction rows in the sprite sheet.
        // Frames can stay at 1 if you do not want animation.
        directions: {
            up: { row: 0, frames: 4 },
            down: { row: 1, frames: 4 },
            left: { row: 2, frames: 2 },
            right: { row: 3, frames: 2 },
        },

        // Extra named animations can use any other row in the same sheet.
        // Use these names from trigger actions with:
        // { kind: "playPlayerAnimation", animationKey: "happy", loops: 2 }
        animations: {
            happy: { row: 4, frames: 2, speed: 180 },
            sad: { row: 5, frames: 2, speed: 180 },
        },
    },

    // Simple player data that triggers can read and change.
    // Use items for keys, coins, quest items, and collectibles.
    // Use stats for numbers like health, score, energy, or strength.
    // Example trigger checks:
    // { scope: "items", key: "coin", op: ">=", value: 1 }
    // { scope: "stats", key: "health", op: "<=", value: 2 }


    // Event -> sound key mapping.
    // These are built-in engine events.
    audioEvents: {
        step: "step",
        teleport: "teleport",
    },

    // Sound key -> file path mapping.
    // Add your own keys here, then use them in trigger actions.
    sounds: {
        step: "assets/sfx/step.wav",
        done: "assets/sfx/done.wav",
        yummy: "assets/sfx/yummy.wav",
        teleport: "assets/sfx/teleport.wav",
        yuck: "assets/sfx/yuck.wav"



    },

    // Non-walkable cells.
    // Use either:
    // - Single tile: { x: 10, y: 4 }
    // - Filled range (line or rectangle): { x1: 8, y1: 4, x2: 12, y2: 4 }
    // Good for walls, water, furniture, and room borders.
    solidTiles: [
        { x1: 0, y1: 0, x2: 0, y2: 28 },
        { x1: 0, y1: 29, x2: 23, y2: 29},
        { x1: 1, y1: 0, x2: 23, y2: 0 },
        { x1: 23, y1: 0, x2: 23, y2: 29 },
        { x1: 2, y1: 28, x2: 2, y2: 27 },
        { x1: 3, y1: 27 ,  x2: 7, y2: 27 },
        { x1: 9, y1: 27 , x2: 10, y2: 27 },
        { x1: 12, y1: 27, x2: 20, y2: 27 },
        { x1: 15, y1: 28, x2:15, y2:22},
        {x:22, y:27},
        { x1: 6, y1: 22, x2: 6, y2: 27 },
        { x1: 1, y1: 24, x2: 3, y2: 24 },
        { x1: 4, y1: 22, x2: 5, y2: 22 },
        {x:2, y:22},
        { x1: 8, y1: 24, x2: 9, y2: 24 },
        { x1: 8, y1: 25, x2: 9, y2: 25 },
        { x1: 11, y1: 24, x2: 15, y2: 24 },
        { x1: 12, y1: 25, x2: 12, y2: 22 },
        { x1: 8, y1: 22, x2: 11, y2: 22 },
        { x1: 19, y1: 20, x2: 19, y2: 26 },
        {x:21, y:22},
        {x:21, y:25},
        {x:3, y:25},
        {x:7, y:11},
        { x1: 17, y1: 24, x2: 18, y2: 24 },
        { x1: 1, y1: 19, x2: 3, y2: 19 },
        { x1: 3, y1: 16, x2: 3, y2: 20 },
        { x1: 2, y1: 20, x2: 3, y2: 20 },
        { x1: 5, y1: 20, x2: 12, y2: 20 },
        {x:8, y:18},
        {x:4, y:17},
        {x:11, y:19},
        {x:10, y:17},
        { x1: 11, y1: 17, x2: 11, y2: 15 },
        { x1: 11, y1: 15, x2: 7, y2: 15 },
        {x:7, y:16},
        { x1: 6, y1: 16, x2: 6, y2: 19 },
        { x1: 4, y1: 14, x2: 5, y2: 14 },
        { x1: 1, y1: 13, x2: 2, y2: 13 },
        { x1: 4, y1: 12, x2: 7, y2: 12 },
        { x1: 3, y1: 10, x2: 4, y2: 10 },
        {x:4, y:11},
        {x:9, y:13},
        { x1: 7, y1: 10, x2: 14, y2: 10 },
        { x1: 12, y1: 12, x2: 11, y2: 12 },
        { x1: 14, y1: 11, x2: 14, y2: 19 },
        { x1: 15, y1: 19, x2: 16, y2: 19 },
        { x1: 15, y1: 2, x2: 21, y2: 2 },
        { x1: 8, y1: 1, x2: 10, y2: 1 },
        { x1: 3, y1: 2, x2: 3, y2: 5 },
        { x1: 4, y1: 3, x2: 7, y2: 3 },
        { x1: 7, y1: 4, x2: 7, y2: 7 },
        { x1: 1, y1: 7, x2: 12, y2: 7 },
        { x1: 10, y1: 3, x2: 10, y2: 7 },
        { x1: 21, y1: 2, x2: 21, y2: 5 },
        { x1: 20, y1: 5, x2: 17, y2: 5 },
        {x:17, y:4},
        { x1: 12, y1: 4, x2: 13, y2: 4 },
        { x1: 12, y1: 5, x2: 13, y2: 5 },
        {x:5, y:5},
        { x1: 16, y1: 7, x2: 21, y2: 7 },
        { x1: 15, y1: 3, x2: 15, y2: 7 },
        {x:21, y:8},
        { x1: 14, y1: 9, x2: 21, y2: 9 },
        { x1: 16, y1: 12, x2: 17, y2: 12 },
        { x1: 20, y1: 12, x2: 21, y2: 12 },
        { x1: 16, y1: 16, x2: 17, y2: 16 },
        { x1: 20, y1: 16, x2: 21, y2: 16 },
        {x:16, y:13},
        {x:21, y:13},
        {x:16, y:15},
        {x:21, y:15},
        {x:18, y:14},
        {x:19, y:14},
        { x1: 20, y1: 18, x2: 22, y2: 18 },







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
    // - drawAbovePlayer: true (draws the trigger sprite above the player, but below map.overlaySrc)
    // - conditions: [{ scope: "items", key: "coin", op: ">=", value: 1 }]
    // - actions: [{ kind: "playSound", soundKey: "interact" }, { kind: "giveItem", itemKey: "coin", amount: 1 }]
    // - elseAction: { kind: "openModalText", title: "...", text: "..." }
    //
    // Supported action kinds:
    // - playSound
    // - playPlayerAnimation
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
    // { kind: "playPlayerAnimation", animationKey: "happy", loops: 2 }
    // { kind: "openModalText", title: "Hello", text: "Welcome!" }
    // { kind: "teleport", targetX: 10, targetY: 4 }
    // { kind: "makePassable", passableSprite: null }
    triggers: [
        {
            id: "broccoli",
            type: "onEnterCell",
            x: 22,
            y: 1,
            once: true,
            sprite: "assets/sprites/broccoli.png",
            actions: [
                {
                    kind: "playSound",
                    soundKey: "yummy",
                },
                {
                    kind: "giveItem",
                    itemKey: "spiselig",
                    amount: 1,
                },
                {
                    kind: "playPlayerAnimation",
                    animationKey: "happy",
                    loops: 2,
                },
            ],
        },
        {
            id: "banan",
            type: "onEnterCell",
            x: 20,
            y: 4,
            once: true,
            sprite: "assets/sprites/banan.png",
            actions: [
                {
                    kind: "playSound",
                    soundKey: "yummy",
                },
                {
                    kind: "giveItem",
                    itemKey: "spiselig",
                    amount: 1,
                },
                {
                    kind: "playPlayerAnimation",
                    animationKey: "happy",
                    loops: 2,
                },
            ],
        },

        {
            id: "gulerod",
            type: "onEnterCell",
            x: 6,
            y: 4,
            once: true,
            sprite: "assets/sprites/gulerod.png",
            actions: [
                {
                    kind: "playSound",
                    soundKey: "yummy",
                },
                {
                    kind: "giveItem",
                    itemKey: "spiselig",
                    amount: 1,
                },
                {
                    kind: "playPlayerAnimation",
                    animationKey: "happy",
                    loops: 2,
                },
            ],
        },
        {
            id: "ho",
            type: "onEnterCell",
            x: 3,
            y: 6,
            once: true,
            sprite: "assets/sprites/ho.png",
            actions: [
                {
                    kind: "playSound",
                    soundKey: "yummy",
                },
                {
                    kind: "giveItem",
                    itemKey: "spiselig",
                    amount: 2,
                },
                {
                    kind: "playPlayerAnimation",
                    animationKey: "happy",
                    loops: 2,
                },
            ],
        },

        {
            id: "peberfrugt",
            type: "onEnterCell",
            x: 11,
            y: 4,
            once: true,
            sprite: "assets/sprites/peberfrugt.png",
            actions: [
                {
                    kind: "playSound",
                    soundKey: "yummy",
                },
                {
                    kind: "giveItem",
                    itemKey: "spiselig",
                    amount: 1,
                },
                {
                    kind: "playPlayerAnimation",
                    animationKey: "happy",
                    loops: 2,
                },
            ],
        },
        {
            id: "salat",
            type: "onEnterCell",
            x: 20,
            y: 8,
            once: true,
            sprite: "assets/sprites/salat.png",
            actions: [
                {
                    kind: "playSound",
                    soundKey: "yummy",
                },
                {
                    kind: "giveItem",
                    itemKey: "spiselig",
                    amount: 1,
                },
                {
                    kind: "playPlayerAnimation",
                    animationKey: "happy",
                    loops: 2,
                },
            ],
        },


        {
            id: "broccoli1",
            type: "onEnterCell",
            x: 1,
            y: 8,
            once: true,
            sprite: "assets/sprites/broccoli.png",
            actions: [
                {
                    kind: "playSound",
                    soundKey: "yummy",
                },
                {
                    kind: "giveItem",
                    itemKey: "spiselig",
                    amount: 1,
                },
                {
                    kind: "playPlayerAnimation",
                    animationKey: "happy",
                    loops: 2,
                },
            ],
        },

        {
            id: "banan1",
            type: "onEnterCell",
            x: 11,
            y: 11,
            once: true,
            sprite: "assets/sprites/banan.png",
            actions: [
                {
                    kind: "playSound",
                    soundKey: "yummy",
                },
                {
                    kind: "giveItem",
                    itemKey: "spiselig",
                    amount: 1,
                },
                {
                    kind: "playPlayerAnimation",
                    animationKey: "happy",
                    loops: 2,
                },
            ],
        },

        {
            id: "gulerod1",
            type: "onEnterCell",
            x: 6,
            y: 11,
            once: true,
            sprite: "assets/sprites/gulerod.png",
            actions: [
                {
                    kind: "playSound",
                    soundKey: "yummy",
                },
                {
                    kind: "giveItem",
                    itemKey: "spiselig",
                    amount: 1,
                },
                {
                    kind: "playPlayerAnimation",
                    animationKey: "happy",
                    loops: 2,
                },
            ],
        },
        {
            id: "ho1",
            type: "onEnterCell",
            x: 15,
            y: 10,
            once: true,
            sprite: "assets/sprites/ho.png",
            actions: [
                {
                    kind: "playSound",
                    soundKey: "yummy",
                },
                {
                    kind: "giveItem",
                    itemKey: "spiselig",
                    amount: 2,
                },
                {
                    kind: "playPlayerAnimation",
                    animationKey: "happy",
                    loops: 2,
                },
            ],
        },
        {
            id: "peberfrugt1",
            type: "onEnterCell",
            x: 15,
            y: 13,
            once: true,
            sprite: "assets/sprites/peberfrugt.png",
            actions: [
                {
                    kind: "playSound",
                    soundKey: "yummy",
                },
                {
                    kind: "giveItem",
                    itemKey: "spiselig",
                    amount: 1,
                },
                {
                    kind: "playPlayerAnimation",
                    animationKey: "happy",
                    loops: 2,
                },
            ],
        },
        {
            id: "rodbede1",
            type: "onEnterCell",
            x: 22,
            y: 17,
            once: true,
            sprite: "assets/sprites/rodbede.png",
            actions: [
                {
                    kind: "playSound",
                    soundKey: "yummy",
                },
                {
                    kind: "giveItem",
                    itemKey: "spiselig",
                    amount: 1,
                },
                {
                    kind: "playPlayerAnimation",
                    animationKey: "happy",
                    loops: 2,
                },
            ],
        },


        {
            id: "ho5",
            type: "onEnterCell",
            x: 2,
            y: 18,
            once: true,
            sprite: "assets/sprites/ho.png",
            actions: [
                {
                    kind: "playSound",
                    soundKey: "yummy",
                },
                {
                    kind: "giveItem",
                    itemKey: "spiselig",
                    amount: 2,
                },
                {
                    kind: "playPlayerAnimation",
                    animationKey: "happy",
                    loops: 2,
                },
            ],
        },

        {
            id: "ho2",
            type: "onEnterCell",
            x: 10,
            y: 16,
            once: true,
            sprite: "assets/sprites/ho.png",
            actions: [
                {
                    kind: "playSound",
                    soundKey: "yummy",
                },
                {
                    kind: "giveItem",
                    itemKey: "spiselig",
                    amount: 2,
                },
                {
                    kind: "playPlayerAnimation",
                    animationKey: "happy",
                    loops: 2,
                },
            ],
        },

        {
            id: "broccoli2",
            type: "onEnterCell",
            x: 17,
            y: 22,
            once: true,
            sprite: "assets/sprites/broccoli.png",
            actions: [
                {
                    kind: "playSound",
                    soundKey: "yummy",
                },
                {
                    kind: "giveItem",
                    itemKey: "spiselig",
                    amount: 1,
                },
                {
                    kind: "playPlayerAnimation",
                    animationKey: "happy",
                    loops: 2,
                },
            ],
        },

        {
            id: "salat2",
            type: "onEnterCell",
            x: 21,
            y: 23,
            once: true,
            sprite: "assets/sprites/salat.png",
            actions: [
                {
                    kind: "playSound",
                    soundKey: "yummy",
                },
                {
                    kind: "giveItem",
                    itemKey: "spiselig",
                    amount: 1,
                },
                {
                    kind: "playPlayerAnimation",
                    animationKey: "happy",
                    loops: 2,
                },
            ],
        },

        {
            id: "peberfrugt2",
            type: "onEnterCell",
            x: 22,
            y: 28,
            once: true,
            sprite: "assets/sprites/peberfrugt.png",
            actions: [
                {
                    kind: "playSound",
                    soundKey: "yummy",
                },
                {
                    kind: "giveItem",
                    itemKey: "spiselig",
                    amount: 1,
                },
                {
                    kind: "playPlayerAnimation",
                    animationKey: "happy",
                    loops: 2,
                },
            ],
        },
        {
            id: "ho",
            type: "onEnterCell",
            x: 14,
            y: 25,
            once: true,
            sprite: "assets/sprites/ho.png",
            actions: [
                {
                    kind: "playSound",
                    soundKey: "yummy",
                },
                {
                    kind: "giveItem",
                    itemKey: "spiselig",
                    amount: 2,
                },
                {
                    kind: "playPlayerAnimation",
                    animationKey: "happy",
                    loops: 2,
                },
            ],
        },


        {
            id: "gulerod2",
            type: "onEnterCell",
            x: 14,
            y: 28,
            once: true,
            sprite: "assets/sprites/gulerod.png",
            actions: [
                {
                    kind: "playSound",
                    soundKey: "yummy",
                },
                {
                    kind: "giveItem",
                    itemKey: "spiselig",
                    amount: 1,
                },
                {
                    kind: "playPlayerAnimation",
                    animationKey: "happy",
                    loops: 2,
                },
            ],
        },


        {
            id: "slikpind",
            type: "onEnterCell",
            x: 1,
            y: 1,
            once: true,
            sprite: "assets/sprites/slikpind.png",
            actions: [
                {
                    kind: "playSound",
                    soundKey: "yuck",
                },

                {
                    kind: "changeStat",
                    statKey: "IkkeSpiseligt",
                    amount: -1,
                },
                {
                    kind: "playPlayerAnimation",
                    animationKey: "sad",
                    loops: 2,
                },
            ],
        },
        {
            id: "chokolade",
            type: "onEnterCell",
            x: 18,
            y: 4,
            once: true,
            sprite: "assets/sprites/chokolade.png",
            actions: [
                {
                    kind: "playSound",
                    soundKey: "yuck",
                },

                {
                    kind: "changeStat",
                    statKey: "IkkeSpiseligt",
                    amount: -1,
                },
                {
                    kind: "playPlayerAnimation",
                    animationKey: "sad",
                    loops: 2,
                },
            ],
        },

        {
            id: "Log",
            type: "onEnterCell",
            x: 13,
            y: 9,
            once: true,
            sprite: "assets/sprites/log.png",
            actions: [
                {
                    kind: "playSound",
                    soundKey: "yuck",
                },

                {
                    kind: "changeStat",
                    statKey: "IkkeSpiseligt",
                    amount: -1,
                },
                {
                    kind: "playPlayerAnimation",
                    animationKey: "sad",
                    loops: 2,
                },
            ],
        },
        {
            id: "avokado",
            type: "onEnterCell",
            x: 5,
            y: 11,
            once: true,
            sprite: "assets/sprites/avokado.png",
            actions: [
                {
                    kind: "playSound",
                    soundKey: "yuck",
                },

                {
                    kind: "changeStat",
                    statKey: "IkkeSpiseligt",
                    amount: -1,
                },
                {
                    kind: "playPlayerAnimation",
                    animationKey: "sad",
                    loops: 2,
                },
            ],
        },
        {
            id: "karamel",
            type: "onEnterCell",
            x: 1,
            y: 15,
            once: true,
            sprite: "assets/sprites/karamel.png",
            actions: [
                {
                    kind: "playSound",
                    soundKey: "yuck",
                },

                {
                    kind: "changeStat",
                    statKey: "IkkeSpiseligt",
                    amount: -1,
                },
                {
                    kind: "playPlayerAnimation",
                    animationKey: "sad",
                    loops: 2,
                },
            ],
        },

        {
            id: "chokolade1",
            type: "onEnterCell",
            x: 7,
            y: 18,
            once: true,
            sprite: "assets/sprites/chokolade.png",
            actions: [
                {
                    kind: "playSound",
                    soundKey: "yuck",
                },

                {
                    kind: "changeStat",
                    statKey: "IkkeSpiseligt",
                    amount: -1,
                },
                {
                    kind: "playPlayerAnimation",
                    animationKey: "sad",
                    loops: 2,
                },
            ],
        },

        {
            id: "chokolade2",
            type: "onEnterCell",
            x:22,
            y: 12,
            once: true,
            sprite: "assets/sprites/chokolade.png",
            actions: [
                {
                    kind: "playSound",
                    soundKey: "yuck",
                },

                {
                    kind: "changeStat",
                    statKey: "IkkeSpiseligt",
                    amount: -1,
                },
                {
                    kind: "playPlayerAnimation",
                    animationKey: "sad",
                    loops: 2,
                },
            ],
        },

        {
            id: "karamel1",
            type: "onEnterCell",
            x: 16,
            y: 17,
            once: true,
            sprite: "assets/sprites/karamel.png",
            actions: [
                {
                    kind: "playSound",
                    soundKey: "yuck",
                },

                {
                    kind: "changeStat",
                    statKey: "IkkeSpiseligt",
                    amount: -1,
                },
                {
                    kind: "playPlayerAnimation",
                    animationKey: "sad",
                    loops: 2,
                },
            ],
        },

        {
            id: "karamel2",
            type: "onEnterCell",
            x: 22,
            y: 23,
            once: true,
            sprite: "assets/sprites/karamel.png",
            actions: [
                {
                    kind: "playSound",
                    soundKey: "yuck",
                },

                {
                    kind: "changeStat",
                    statKey: "IkkeSpiseligt",
                    amount: -1,
                },
                {
                    kind: "playPlayerAnimation",
                    animationKey: "sad",
                    loops: 2,
                },
            ],
        },

        {
            id: "log1",
            type: "onEnterCell",
            x: 16,
            y: 28,
            once: true,
            sprite: "assets/sprites/log.png",
            actions: [
                {
                    kind: "playSound",
                    soundKey: "yuck",
                },

                {
                    kind: "changeStat",
                    statKey: "IkkeSpiseligt",
                    amount: -1,
                },
                {
                    kind: "playPlayerAnimation",
                    animationKey: "sad",
                    loops: 2,
                },
            ],
        },

        {
            id: "slikpind1",
            type: "onEnterCell",
            x: 3,
            y: 28,
            once: true,
            sprite: "assets/sprites/slikpind.png",
            actions: [
                {
                    kind: "playSound",
                    soundKey: "yuck",
                },

                {
                    kind: "changeStat",
                    statKey: "IkkeSpiseligt",
                    amount: -1,
                },
                {
                    kind: "playPlayerAnimation",
                    animationKey: "sad",
                    loops: 2,
                },
            ],
        },

        {
            id: "slikpind2",
            type: "onEnterCell",
            x: 13,
            y: 23,
            once: true,
            sprite: "assets/sprites/slikpind.png",
            actions: [
                {
                    kind: "playSound",
                    soundKey: "yuck",
                },

                {
                    kind: "changeStat",
                    statKey: "IkkeSpiseligt",
                    amount: -1,
                },
                {
                    kind: "playPlayerAnimation",
                    animationKey: "sad",
                    loops: 2,
                },
            ],
        },


        {
            id: "portal_1_jump",
            type: "onEnterCell",
            x: 5,
            y: 2,
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
                    kind: "teleport",
                    targetX: 4,
                    targetY: 4,
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
            id: "portal_2_jump",
            type: "onEnterCell",
            x: 5,
            y: 4,
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
                    kind: "teleport",
                    targetX: 4,
                    targetY: 2,
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
            id: "portal_3_jump",
            type: "onEnterCell",
            x: 19,
            y: 1,
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
                    kind: "teleport",
                    targetX: 20,
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
            id: "portal_4_jump",
            type: "onEnterCell",
            x: 19,
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
                    kind: "teleport",
                    targetX: 20,
                    targetY: 1,
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
            id: "portal_5_jump",
            type: "onEnterCell",
            x: 15,
            y: 18,
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
                    kind: "teleport",
                    targetX: 13,
                    targetY: 17,
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
            id: "portal_6_jump",
            type: "onEnterCell",
            x: 13,
            y: 18,
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
                    kind: "teleport",
                    targetX: 15,
                    targetY: 17,
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
            id: "portal_7_jump",
            type: "onEnterCell",
            x: 1,
            y: 18,
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
                    kind: "teleport",
                    targetX: 1,
                    targetY: 21,
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
            id: "portal_8_jump",
            type: "onEnterCell",
            x: 1,
            y: 20,
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
                    kind: "teleport",
                    targetX: 2,
                    targetY: 18,
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
            id: "portal_9_jump",
            type: "onEnterCell",
            x: 4,
            y: 28,
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
                    kind: "teleport",
                    targetX: 3,
                    targetY: 26,
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
            id: "portal_10_jump",
            type: "onEnterCell",
            x: 4,
            y: 26,
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
                    kind: "teleport",
                    targetX: 5,
                    targetY: 28,
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
            id: "portal_11_jump",
            type: "onEnterCell",
            x: 18,
            y: 28,
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
                    kind: "teleport",
                    targetX: 17,
                    targetY: 26,
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
            id: "portal_12_jump",
            type: "onEnterCell",
            x: 18,
            y: 26,
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
                    kind: "teleport",
                    targetX: 19,
                    targetY: 28,
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
            x: 1,
            y: 28,
            actions: [
                {
                    kind: "playSound",
                    soundKey: "done",
                },
                {
                    kind: "teleport",
                    targetX:13,
                    targetY:1,
                    sfx: "done",
                },
            ],
        },
    ],
};
