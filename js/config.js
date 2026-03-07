// Main student-editable configuration file.
// Most gameplay changes should happen here, not in engine files.

export const GAME_CONFIG = {
    tileSize: 32,

    map: {
        imageSrc: "assets/map/map.png",
        widthTiles: 40,
        heightTiles: 30
    },

    camera: {
        widthPx: 320,
        heightPx: 240
    },

    player: {
        startTile: { x: 2, y: 2 },
        moveDurationMs: 150,
        defaultFacing: "right",
        spriteSheetSrc: "assets/player/player_sheet.png",
        frameWidth: 32,
        frameHeight: 32,

        // Direction rows in the sprite sheet.
        // Frames can stay at 1 if you do not want animation.
        directions: {
            up: { row: 0, frames: 4 },
            down: { row: 1, frames: 1 },
            left: { row: 2, frames: 1 },
            right: { row: 3, frames: 1 }
        }
    },

    // Simple player data that triggers can read and change.
    playerState: {
        items: {
            coin: 0
        },
        stats: {
            health: 3,
            strength: 1
        }
    },

    // Event -> sound key mapping.
    audioEvents: {
        step: "step",
        interact: "interact",
        teleport: "teleport",
        ui_open_modal: "ui_open_modal"
    },

    // Sound key -> file path mapping.
    sounds: {
        step: "assets/sfx/step.wav",
        interact: "assets/sfx/interact.wav",
        teleport: "assets/sfx/teleport.wav",
        ui_open_modal: "assets/sfx/interact.wav"
    },

    // Non-walkable cells.
    // Use either:
    // - Single tile: { x: 10, y: 4 }
    // - Filled range (line or rectangle): { x1: 8, y1: 4, x2: 12, y2: 4 }
    solidTiles: [
        { x: 8, y: 2 }, { x: 12, y: 2 },
        { x: 9, y: 3 }, { x: 11, y: 3 },
        { x1: 8, y1: 4, x2: 12, y2: 4 },
    ],

    // Triggers can also set optional helpers:
    // - isSolid: true (blocks movement on that tile)
    // - sprite: "assets/sprites/your_image.png" (draws a 32x32 image on the tile)
    // - sprite: "assets/sprites/portal.gif" (animated gif)
    // - sprite: { src: "assets/sprites/portal.png", frames: 4, speed: 150 } (spritesheet)
    // - conditions: [{ scope: "items", key: "coin", op: ">=", value: 1 }]
    // - elseAction: { kind: "openModalText", title: "...", text: "..." }
    triggers: [
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
        },
        {
            id: "village_sign",
            type: "onInteractCell",
            x: 10,
            y: 3,
            isSolid: true,
            sprite: "assets/sprites/sign.png",
            conditions: [
                { scope: "items", key: "coin", op: ">=", value: 1 }
            ],
            action: {
                kind: "openModalHtml",
                title: "Village Sign",
                contentKey: "village_sign"
            },
            elseAction: {
                kind: "openModalText",
                title: "Village Sign",
                text: "The sign slot takes 1 coin before it lights up."
            }
        },
        {
            id: "intro_video",
            type: "onEnterCell",
            x: 6,
            y: 6,
            sprite: "assets/sprites/question.png",
            action: {
                kind: "openModalVideo",
                title: "Intro Video",
                contentKey: "intro_clip"
            }
        },
        {
            id: "portal_left_sound",
            type: "onEnterCell",
            x: 8,
            y: 3,
            action: {
                kind: "playSound",
                soundKey: "teleport"
            }
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
            action: {
                kind: "teleport",
                targetX: 13,
                targetY: 3,
                sfx: "teleport",
                sprite: {
                    src: "assets/sprites/portal_action.png",
                    frames: 4,
                    speed: 150,
                },
            }
        },
        {
            id: "portal_right_sound",
            type: "onEnterCell",
            x: 12,
            y: 3,
            action: {
                kind: "playSound",
                soundKey: "teleport"
            }
        },
        {
            id: "portal_right_jump",
            type: "onEnterCell",
            x: 12,
            y: 3,
            action: {
                kind: "teleport",
                targetX: 7,
                targetY: 3,
                sfx: "teleport"
            }
        },
    ]
};
