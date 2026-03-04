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
        defaultFacing: "down",
        spriteSheetSrc: "assets/player/player_sheet.png",
        frameWidth: 32,
        frameHeight: 32,

        // Direction rows in the sprite sheet.
        // Frames can stay at 1 if you do not want animation.
        directions: {
            up: { row: 0, frames: 1 },
            down: { row: 1, frames: 1 },
            left: { row: 2, frames: 1 },
            right: { row: 3, frames: 1 }
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

    // Simple coordinate list for non-walkable cells.
    solidTiles: [
        { x: 8, y: 2 }, { x: 12, y: 2 },
        { x: 9, y: 3 }, { x: 10, y: 3 }, { x: 11, y: 3 },
        { x: 8, y: 4 }, { x: 9, y: 4 }, { x: 10, y: 4 }, { x: 11, y: 4 }, { x: 12, y: 4 },
    ],

    triggers: [
        {
            id: "welcome_tile",
            type: "onEnterCell",
            x: 6,
            y: 6,
            once: true,
            action: {
                kind: "openModalText",
                title: "Welcome",
                text: "This is the starter map. Edit js/config.js to add your own triggers."
            }
        },
        {
            id: "village_sign",
            type: "onInteractCell",
            x: 10,
            y: 3,
            action: {
                kind: "openModalHtml",
                title: "Village Sign",
                contentKey: "village_sign"
            }
        },
        {
            id: "intro_video",
            type: "onEnterCell",
            x: 3,
            y: 2,
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
            action: {
                kind: "teleport",
                targetX: 13,
                targetY: 3,
                sfx: "teleport"
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
