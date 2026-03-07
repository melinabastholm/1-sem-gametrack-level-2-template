import { GAME_CONFIG } from "./config.js";
import { MODAL_CONTENT } from "../content/modals.js";
import { createAudioController } from "./audio.js";
import { createModalController } from "./modal.js";
import { createTriggerEngine } from "./triggers.js";

const DIRECTION_VECTORS = {
    up: { dx: 0, dy: -1 },
    down: { dx: 0, dy: 1 },
    left: { dx: -1, dy: 0 },
    right: { dx: 1, dy: 0 },
};

const KEY_TO_DIRECTION = {
    ArrowUp: "up",
    KeyW: "up",
    ArrowDown: "down",
    KeyS: "down",
    ArrowLeft: "left",
    KeyA: "left",
    ArrowRight: "right",
    KeyD: "right",
};

const INTERACT_KEYS = new Set(["Space", "Enter", "NumpadEnter"]);
const TURN_DELAY_MS = 120;
const CONDITION_OPERATORS = new Set(["===", ">", ">=", "<", "<="]);

const refs = {
    gameStage: document.querySelector(".game-stage"),
    scaleRoot: document.getElementById("game-scale-root"),
    viewport: document.getElementById("game-viewport"),
    world: document.getElementById("game-world"),
    mapLayer: document.getElementById("map-layer"),
    triggerLayer: document.getElementById("trigger-layer"),
    playerSprite: document.getElementById("player-sprite"),
    teleportEffect: document.getElementById("teleport-effect"),
    debugToggle: document.getElementById("debug-toggle"),
    debugPanel: document.getElementById("debug-panel"),
    gameInfo: document.getElementById("game-info"),
    itemsInfo: document.getElementById("items-info"),
    statsInfo: document.getElementById("stats-info"),
    fatalError: document.getElementById("fatal-error"),
    modalRoot: document.getElementById("game-modal"),
    modalTitle: document.getElementById("modal-title"),
    modalContent: document.getElementById("modal-content"),
    modalClose: document.getElementById("modal-close"),
};

const state = {
    activeDirections: [],
    queuedDirection: null,
    turnLockDirection: null,
    turnLockUntil: 0,
    lastFrameTime: 0,
    currentScale: 1,
    cameraX: 0,
    cameraY: 0,
    isDebugOpen: false,
    solidTileSet: new Set(),
    deferredEnterTrigger: null,
    fatalError: false,
    triggerSprites: new Map(),
    preservedTriggerSpriteIds: new Set(),
    isTeleporting: false,
    teleportEffect: {
        active: false,
        element: null,
        frames: 1,
        speed: 150,
        startTime: 0,
        direction: "forward",
        mode: "sheet",
        durationMs: 0,
        resolve: null,
    },

    player: {
        tileX: 0,
        tileY: 0,
        pixelX: 0,
        pixelY: 0,
        facing: GAME_CONFIG.player.defaultFacing,
        isMoving: false,
        moveProgress: 0,
        startPixelX: 0,
        startPixelY: 0,
        endPixelX: 0,
        endPixelY: 0,
        endTileX: 0,
        endTileY: 0,
    },

    audio: null,
    modal: null,
    triggerEngine: null,
    playerState: createInitialPlayerState(),
};

boot();

async function boot() {
    try {
        ensureDomReferences();
        validateConfig(GAME_CONFIG);
        buildSolidTileSet();
        applyViewportSize();

        const [mapImage, spriteSheet] = await Promise.all([
            loadImageIntoElement(refs.mapLayer, GAME_CONFIG.map.imageSrc),
            loadImage(GAME_CONFIG.player.spriteSheetSrc),
        ]);

        validateMapDimensions(mapImage);
        validateSpriteSheet(spriteSheet);

        setupWorldDimensions();
        setupTeleportEffect();
        buildTriggerSprites();
        setupPlayerSprite();
        setupDebugControls();
        setupModalSystem();
        setupAudioSystem();
        setupTriggerSystem();
        placePlayerAtStart();
        updateScale();
        render();

        window.addEventListener("resize", updateScale);
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
        window.addEventListener("blur", clearInputState);

        state.lastFrameTime = performance.now();
        requestAnimationFrame(gameLoop);
    } catch (error) {
        failStartup(error);
    }
}

function ensureDomReferences() {
    const missing = Object.entries(refs)
        .filter(([, value]) => !value)
        .map(([key]) => key);

    if (missing.length > 0) {
        throw new Error(`Missing required DOM elements: ${missing.join(", ")}`);
    }
}

function validateConfig(config) {
    const fail = (message) => {
        throw new Error(`[config] ${message}`);
    };

    if (!config || typeof config !== "object") {
        fail("GAME_CONFIG must be an object.");
    }

    if (!Number.isInteger(config.tileSize) || config.tileSize <= 0) {
        fail("tileSize must be a positive integer.");
    }

    if (!config.map || typeof config.map !== "object") {
        fail("map configuration is missing.");
    }

    if (
        typeof config.map.imageSrc !== "string" ||
        config.map.imageSrc.trim() === ""
    ) {
        fail("map.imageSrc must be a non-empty string.");
    }

    if (
        !Number.isInteger(config.map.widthTiles) ||
        config.map.widthTiles <= 0
    ) {
        fail("map.widthTiles must be a positive integer.");
    }

    if (
        !Number.isInteger(config.map.heightTiles) ||
        config.map.heightTiles <= 0
    ) {
        fail("map.heightTiles must be a positive integer.");
    }

    if (!config.camera || typeof config.camera !== "object") {
        fail("camera configuration is missing.");
    }

    if (
        !Number.isInteger(config.camera.widthPx) ||
        config.camera.widthPx <= 0
    ) {
        fail("camera.widthPx must be a positive integer.");
    }

    if (
        !Number.isInteger(config.camera.heightPx) ||
        config.camera.heightPx <= 0
    ) {
        fail("camera.heightPx must be a positive integer.");
    }

    if (!config.player || typeof config.player !== "object") {
        fail("player configuration is missing.");
    }

    if (
        !Number.isInteger(config.player.frameWidth) ||
        config.player.frameWidth <= 0
    ) {
        fail("player.frameWidth must be a positive integer.");
    }

    if (
        !Number.isInteger(config.player.frameHeight) ||
        config.player.frameHeight <= 0
    ) {
        fail("player.frameHeight must be a positive integer.");
    }

    if (
        typeof config.player.spriteSheetSrc !== "string" ||
        config.player.spriteSheetSrc.trim() === ""
    ) {
        fail("player.spriteSheetSrc must be a non-empty string.");
    }

    if (
        !Number.isInteger(config.player.moveDurationMs) ||
        config.player.moveDurationMs <= 0
    ) {
        fail("player.moveDurationMs must be a positive integer.");
    }

    if (
        !config.player.startTile ||
        typeof config.player.startTile !== "object"
    ) {
        fail("player.startTile is required.");
    }

    const { x: startX, y: startY } = config.player.startTile;
    if (!Number.isInteger(startX) || !Number.isInteger(startY)) {
        fail("player.startTile coordinates must be integers.");
    }

    if (
        startX < 0 ||
        startX >= config.map.widthTiles ||
        startY < 0 ||
        startY >= config.map.heightTiles
    ) {
        fail("player.startTile must be inside map bounds.");
    }

    const requiredDirections = ["up", "down", "left", "right"];
    for (const direction of requiredDirections) {
        const directionConfig = config.player.directions?.[direction];

        if (!directionConfig) {
            fail(`player.directions.${direction} is required.`);
        }

        if (!Number.isInteger(directionConfig.row) || directionConfig.row < 0) {
            fail(`player.directions.${direction}.row must be an integer >= 0.`);
        }

        if (
            !Number.isInteger(directionConfig.frames) ||
            directionConfig.frames < 1
        ) {
            fail(
                `player.directions.${direction}.frames must be an integer >= 1.`,
            );
        }
    }

    if (!requiredDirections.includes(config.player.defaultFacing)) {
        fail("player.defaultFacing must be one of: up, down, left, right.");
    }

    validatePlayerStateConfig(config.playerState, fail);
}

function validatePlayerStateConfig(playerState, fail) {
    if (playerState === undefined) {
        return;
    }

    if (!playerState || typeof playerState !== "object") {
        fail("playerState must be an object when provided.");
    }

    validatePlayerStateBucket(playerState.items, "playerState.items", fail);
    validatePlayerStateBucket(playerState.stats, "playerState.stats", fail);
}

function validatePlayerStateBucket(bucket, label, fail) {
    if (bucket === undefined) {
        return;
    }

    if (!bucket || typeof bucket !== "object" || Array.isArray(bucket)) {
        fail(`${label} must be an object when provided.`);
    }

    for (const [key, value] of Object.entries(bucket)) {
        if (!Number.isFinite(value)) {
            fail(`${label}.${key} must be a number.`);
        }
    }
}

function createInitialPlayerState() {
    return {
        items: createStateBucket(GAME_CONFIG.playerState?.items),
        stats: createStateBucket(GAME_CONFIG.playerState?.stats),
    };
}

function createStateBucket(source) {
    if (!source || typeof source !== "object" || Array.isArray(source)) {
        return {};
    }

    const bucket = {};

    for (const [key, value] of Object.entries(source)) {
        if (Number.isFinite(value)) {
            bucket[key] = value;
        }
    }

    return bucket;
}

function buildSolidTileSet() {
    state.solidTileSet.clear();

    addSolidTilesFromConfig();
    addSolidTilesFromTriggers();
}

function addSolidTilesFromConfig() {
    if (!Array.isArray(GAME_CONFIG.solidTiles)) {
        console.warn(
            "[config] solidTiles is not an array. No solid tiles loaded.",
        );
        return;
    }

    for (const tile of GAME_CONFIG.solidTiles) {
        if (isSolidPointEntry(tile)) {
            addSolidTile(tile.x, tile.y);
            continue;
        }

        if (isSolidRangeEntry(tile)) {
            addSolidTileRange(tile);
            continue;
        }

        console.warn("[config] Invalid solid tile entry was skipped.", tile);
    }
}

function addSolidTilesFromTriggers() {
    if (!Array.isArray(GAME_CONFIG.triggers)) {
        return;
    }

    for (const trigger of GAME_CONFIG.triggers) {
        if (!trigger || typeof trigger !== "object") {
            continue;
        }

        if (trigger.isSolid !== true) {
            continue;
        }

        if (!Number.isInteger(trigger.x) || !Number.isInteger(trigger.y)) {
            console.warn(
                "[triggers] isSolid trigger needs integer x/y coordinates.",
                trigger,
            );
            continue;
        }

        addSolidTile(trigger.x, trigger.y);
    }
}

function isSolidPointEntry(tile) {
    return (
        Boolean(tile) && Number.isInteger(tile.x) && Number.isInteger(tile.y)
    );
}

function isSolidRangeEntry(tile) {
    return (
        Boolean(tile) &&
        Number.isInteger(tile.x1) &&
        Number.isInteger(tile.y1) &&
        Number.isInteger(tile.x2) &&
        Number.isInteger(tile.y2)
    );
}

function addSolidTileRange(tile) {
    const minX = Math.min(tile.x1, tile.x2);
    const maxX = Math.max(tile.x1, tile.x2);
    const minY = Math.min(tile.y1, tile.y2);
    const maxY = Math.max(tile.y1, tile.y2);

    for (let y = minY; y <= maxY; y += 1) {
        for (let x = minX; x <= maxX; x += 1) {
            addSolidTile(x, y);
        }
    }
}

function addSolidTile(tileX, tileY) {
    if (!isInsideMap(tileX, tileY)) {
        console.warn(
            `[config] solid tile (${tileX}, ${tileY}) is outside map bounds and was skipped.`,
        );
        return;
    }

    state.solidTileSet.add(tileKey(tileX, tileY));
}

function removeSolidTile(tileX, tileY) {
    state.solidTileSet.delete(tileKey(tileX, tileY));
}

function applyViewportSize() {
    refs.viewport.style.width = `${GAME_CONFIG.camera.widthPx}px`;
    refs.viewport.style.height = `${GAME_CONFIG.camera.heightPx}px`;
}

function setupWorldDimensions() {
    const mapWidthPx = GAME_CONFIG.map.widthTiles * GAME_CONFIG.tileSize;
    const mapHeightPx = GAME_CONFIG.map.heightTiles * GAME_CONFIG.tileSize;

    refs.world.style.width = `${mapWidthPx}px`;
    refs.world.style.height = `${mapHeightPx}px`;
    refs.mapLayer.style.width = `${mapWidthPx}px`;
    refs.mapLayer.style.height = `${mapHeightPx}px`;
    refs.triggerLayer.style.width = `${mapWidthPx}px`;
    refs.triggerLayer.style.height = `${mapHeightPx}px`;
}

function setupTeleportEffect() {
    state.teleportEffect.element = refs.teleportEffect;
    refs.teleportEffect.style.width = `${GAME_CONFIG.tileSize}px`;
    refs.teleportEffect.style.height = `${GAME_CONFIG.tileSize}px`;
    refs.teleportEffect.style.display = "none";
}

function buildTriggerSprites() {
    refs.triggerLayer.innerHTML = "";
    state.triggerSprites.clear();
    state.preservedTriggerSpriteIds.clear();

    if (!Array.isArray(GAME_CONFIG.triggers)) {
        return;
    }

    for (const trigger of GAME_CONFIG.triggers) {
        if (!trigger || typeof trigger !== "object") {
            continue;
        }

        const spriteConfig = resolveTriggerSpriteConfig(trigger);
        if (!spriteConfig) {
            continue;
        }

        if (!Number.isInteger(trigger.x) || !Number.isInteger(trigger.y)) {
            console.warn(
                "[triggers] sprite trigger needs integer x/y coordinates.",
                trigger,
            );
            continue;
        }

        if (!isInsideMap(trigger.x, trigger.y)) {
            console.warn(
                `[triggers] sprite trigger (${trigger.x}, ${trigger.y}) is outside map bounds.`,
            );
            continue;
        }

        setTriggerSprite(trigger.id, trigger.sprite);
    }
}

function resolveTriggerSpriteConfig(trigger) {
    const rawSprite = trigger.sprite;

    if (typeof rawSprite === "string") {
        const trimmed = rawSprite.trim();
        return trimmed === ""
            ? null
            : {
                  src: trimmed,
                  frames: 1,
                  speed: 0,
                  mode: "image",
                  isAnimatedImage: isAnimatedGifSource(trimmed),
              };
    }

    if (!rawSprite || typeof rawSprite !== "object") {
        return null;
    }

    const src = typeof rawSprite.src === "string" ? rawSprite.src.trim() : "";
    if (src === "") {
        console.warn(
            "[triggers] sprite object needs a non-empty src string.",
            trigger,
        );
        return null;
    }
    const isGif = isAnimatedGifSource(src);

    let frames = 1;
    if (Number.isInteger(rawSprite.frames) && rawSprite.frames > 0) {
        frames = rawSprite.frames;
    } else if (rawSprite.frames !== undefined) {
        console.warn(
            "[triggers] sprite.frames should be a positive integer.",
            trigger,
        );
    }
    if (isGif) {
        frames = 1;
    }

    let speed = 150;
    if (Number.isInteger(rawSprite.speed) && rawSprite.speed > 0) {
        speed = rawSprite.speed;
    } else if (rawSprite.speed !== undefined) {
        console.warn(
            "[triggers] sprite.speed should be a positive integer.",
            trigger,
        );
    }

    const mode = !isGif && frames > 1 ? "sheet" : "image";
    return { src, frames, speed, mode, isAnimatedImage: isGif };
}

function getTriggerById(triggerId) {
    if (typeof triggerId !== "string" || triggerId.trim() === "") {
        return null;
    }

    if (!Array.isArray(GAME_CONFIG.triggers)) {
        return null;
    }

    return (
        GAME_CONFIG.triggers.find((trigger) => trigger?.id === triggerId) ||
        null
    );
}

function setTriggerSprite(triggerId, spriteValue) {
    const trigger = getTriggerById(triggerId);
    if (!trigger) {
        console.warn(
            `[triggers] Unknown trigger id "${String(triggerId)}" for sprite update.`,
        );
        return false;
    }

    const currentEntry = state.triggerSprites.get(triggerId);
    if (currentEntry?.element) {
        currentEntry.element.remove();
        state.triggerSprites.delete(triggerId);
    }

    const spriteConfig = resolveTriggerSpriteConfig({ sprite: spriteValue });
    if (!spriteConfig) {
        return true;
    }

    if (!Number.isInteger(trigger.x) || !Number.isInteger(trigger.y)) {
        console.warn(
            `[triggers] Trigger "${triggerId}" needs integer x/y coordinates for sprite updates.`,
        );
        return false;
    }

    if (!isInsideMap(trigger.x, trigger.y)) {
        console.warn(
            `[triggers] Trigger "${triggerId}" is outside map bounds for sprite updates.`,
        );
        return false;
    }

    const sprite = createTriggerSpriteElement(trigger, spriteConfig);
    refs.triggerLayer.appendChild(sprite);
    state.triggerSprites.set(triggerId, {
        element: sprite,
        frames: spriteConfig.frames,
        speed: spriteConfig.speed,
        startTime: performance.now(),
        mode: spriteConfig.mode,
    });

    preloadSpriteImage(spriteConfig.src, triggerId);
    return true;
}

function createTriggerSpriteElement(trigger, spriteConfig) {
    const sprite =
        spriteConfig.mode === "sheet"
            ? document.createElement("div")
            : document.createElement("img");

    sprite.className = "trigger-sprite";

    if (spriteConfig.mode === "sheet") {
        sprite.style.backgroundImage = `url("${spriteConfig.src}")`;
    } else {
        sprite.src = spriteConfig.src;
        sprite.alt = "";
    }

    sprite.style.width = `${GAME_CONFIG.tileSize}px`;
    sprite.style.height = `${GAME_CONFIG.tileSize}px`;
    sprite.style.left = `${trigger.x * GAME_CONFIG.tileSize}px`;
    sprite.style.top = `${trigger.y * GAME_CONFIG.tileSize}px`;

    return sprite;
}

function isAnimatedGifSource(src) {
    return /\.gif(\?.*)?$/i.test(src);
}

function preloadSpriteImage(src, triggerId) {
    const image = new Image();
    image.onerror = () => {
        const id = typeof triggerId === "string" ? triggerId : "unknown";
        console.warn(
            `[triggers] sprite \"${src}\" failed to load for trigger \"${id}\".`,
        );
    };
    image.src = src;
}

function handleTriggerConsumed(trigger) {
    if (!trigger || typeof trigger !== "object") {
        return;
    }

    if (state.preservedTriggerSpriteIds.has(trigger.id)) {
        return;
    }

    const hasStringSprite =
        typeof trigger.sprite === "string" && trigger.sprite.trim() !== "";
    const hasObjectSprite =
        typeof trigger.sprite === "object" &&
        trigger.sprite &&
        typeof trigger.sprite.src === "string" &&
        trigger.sprite.src.trim() !== "";

    if (!hasStringSprite && !hasObjectSprite) {
        return;
    }

    const spriteEntry = state.triggerSprites.get(trigger.id);
    if (spriteEntry?.element) {
        spriteEntry.element.remove();
        state.triggerSprites.delete(trigger.id);
    }
}

function setupPlayerSprite() {
    refs.playerSprite.style.width = `${GAME_CONFIG.player.frameWidth}px`;
    refs.playerSprite.style.height = `${GAME_CONFIG.player.frameHeight}px`;
    refs.playerSprite.style.backgroundImage = `url("${GAME_CONFIG.player.spriteSheetSrc}")`;
}

function setupDebugControls() {
    updateDebugPanelVisibility();

    refs.debugToggle.addEventListener("click", () => {
        state.isDebugOpen = !state.isDebugOpen;
        updateDebugPanelVisibility();
    });
}

function updateDebugPanelVisibility() {
    refs.debugPanel.classList.toggle("hidden", !state.isDebugOpen);
    refs.debugToggle.setAttribute("aria-expanded", String(state.isDebugOpen));
}

function setupModalSystem() {
    state.modal = createModalController({
        modalRoot: refs.modalRoot,
        titleElement: refs.modalTitle,
        contentElement: refs.modalContent,
        closeButton: refs.modalClose,
        onOpen() {
            playEventSound("ui_open_modal");
        },
    });
}

function setupAudioSystem() {
    state.audio = createAudioController(GAME_CONFIG.sounds);
}

function setupTriggerSystem() {
    state.triggerEngine = createTriggerEngine({
        triggers: GAME_CONFIG.triggers,
        executeAction: executeTriggerAction,
        onTriggerConsumed: handleTriggerConsumed,
    });
}

function placePlayerAtStart() {
    const { x, y } = GAME_CONFIG.player.startTile;
    state.player.facing = GAME_CONFIG.player.defaultFacing;
    setPlayerTilePosition(x, y);

    if (isSolidTile(x, y)) {
        throw new Error(
            `[config] player.startTile (${x}, ${y}) is inside a solid tile.`,
        );
    }
}

function updateScale() {
    const availableWidth = refs.gameStage.clientWidth;
    const availableHeight = refs.gameStage.clientHeight;

    const scaleX = Math.floor(availableWidth / GAME_CONFIG.camera.widthPx);
    const scaleY = Math.floor(availableHeight / GAME_CONFIG.camera.heightPx);
    const scale = Math.max(1, Math.min(scaleX, scaleY));

    state.currentScale = scale;

    refs.scaleRoot.style.width = `${GAME_CONFIG.camera.widthPx * scale}px`;
    refs.scaleRoot.style.height = `${GAME_CONFIG.camera.heightPx * scale}px`;
    refs.viewport.style.transform = `scale(${scale})`;
}

function gameLoop(now) {
    if (state.fatalError) {
        return;
    }

    const deltaMs = Math.min(50, now - state.lastFrameTime);
    state.lastFrameTime = now;

    update(deltaMs, now);
    render(now);

    requestAnimationFrame(gameLoop);
}

function update(deltaMs, now) {
    runDeferredEnterTrigger();

    if (!state.modal.isOpen() && !state.isTeleporting) {
        if (state.player.isMoving) {
            updateMovement(deltaMs);
        } else {
            tryStartNextMove(now);
        }
    }

    updateCamera();
    updateInfoBox();
}

function updateMovement(deltaMs) {
    state.player.moveProgress += deltaMs / GAME_CONFIG.player.moveDurationMs;

    const clampedProgress = Math.min(1, state.player.moveProgress);
    state.player.pixelX = lerp(
        state.player.startPixelX,
        state.player.endPixelX,
        clampedProgress,
    );
    state.player.pixelY = lerp(
        state.player.startPixelY,
        state.player.endPixelY,
        clampedProgress,
    );

    if (clampedProgress >= 1) {
        state.player.isMoving = false;
        state.player.moveProgress = 0;
        setPlayerTilePosition(state.player.endTileX, state.player.endTileY);
        playEventSound("step");
        state.triggerEngine.run(
            "onEnterCell",
            state.player.tileX,
            state.player.tileY,
            { source: "movement" },
        );
    }
}

function tryStartNextMove(now) {
    const direction = consumeNextDirection();
    if (!direction) {
        return;
    }

    if (state.turnLockDirection === direction) {
        if (now < state.turnLockUntil) {
            return;
        }

        state.turnLockDirection = null;
    }

    const vector = DIRECTION_VECTORS[direction];
    const targetX = state.player.tileX + vector.dx;
    const targetY = state.player.tileY + vector.dy;

    state.player.facing = direction;

    if (!isInsideMap(targetX, targetY) || isSolidTile(targetX, targetY)) {
        return;
    }

    state.player.isMoving = true;
    state.player.moveProgress = 0;

    state.player.startPixelX = state.player.tileX * GAME_CONFIG.tileSize;
    state.player.startPixelY = state.player.tileY * GAME_CONFIG.tileSize;
    state.player.endPixelX = targetX * GAME_CONFIG.tileSize;
    state.player.endPixelY = targetY * GAME_CONFIG.tileSize;
    state.player.endTileX = targetX;
    state.player.endTileY = targetY;
}

function consumeNextDirection() {
    if (state.queuedDirection) {
        const queued = state.queuedDirection;
        state.queuedDirection = null;
        return queued;
    }

    if (state.activeDirections.length === 0) {
        return null;
    }

    return state.activeDirections[state.activeDirections.length - 1];
}

function updateCamera() {
    const halfTile = GAME_CONFIG.tileSize / 2;

    const targetCameraX =
        state.player.pixelX + halfTile - GAME_CONFIG.camera.widthPx / 2;
    const targetCameraY =
        state.player.pixelY + halfTile - GAME_CONFIG.camera.heightPx / 2;

    const maxCameraX = Math.max(
        0,
        GAME_CONFIG.map.widthTiles * GAME_CONFIG.tileSize -
            GAME_CONFIG.camera.widthPx,
    );
    const maxCameraY = Math.max(
        0,
        GAME_CONFIG.map.heightTiles * GAME_CONFIG.tileSize -
            GAME_CONFIG.camera.heightPx,
    );

    state.cameraX = clamp(targetCameraX, 0, maxCameraX);
    state.cameraY = clamp(targetCameraY, 0, maxCameraY);

    refs.world.style.transform = `translate(${-state.cameraX}px, ${-state.cameraY}px)`;
}

function updateInfoBox() {
    const facingTile = getFacingTileCoordinates();
    const isFacingInsideMap = isInsideMap(facingTile.x, facingTile.y);
    const isFacingBlocked =
        !isFacingInsideMap || isSolidTile(facingTile.x, facingTile.y);
    const interactableTriggers = getAvailableInteractTriggersAt(
        facingTile.x,
        facingTile.y,
    );
    const actionKinds = Array.from(
        new Set(
            interactableTriggers.flatMap((trigger) => {
                if (!Array.isArray(trigger.actions)) {
                    return [];
                }

                return trigger.actions.map((action) => action.kind);
            }),
        ),
    );

    const facingStatus = isFacingInsideMap
        ? `(${facingTile.x}, ${facingTile.y})`
        : `(${facingTile.x}, ${facingTile.y}) outside map`;

    const interactStatus =
        interactableTriggers.length > 0
            ? `Yes (${actionKinds.join(", ")})`
            : "No";

    const blockedStatus = isFacingBlocked ? "Yes" : "No";

    refs.gameInfo.textContent = [
        `Position: (${state.player.tileX}, ${state.player.tileY})`,
        `Facing: ${state.player.facing}`,
        `Looking at: ${facingStatus}`,
        `Tile ahead blocked: ${blockedStatus}`,
        `Interactable: ${interactStatus}`,
        `Scale: ${state.currentScale}x`,
    ].join("\n");

    renderStateBucket(refs.itemsInfo, state.playerState.items, "No items");
    renderStateBucket(refs.statsInfo, state.playerState.stats, "No stats");
}

function formatStateBucket(bucket) {
    const entries = Object.entries(bucket);
    if (entries.length === 0) {
        return "none";
    }

    return entries.map(([key, value]) => `${key}=${value}`).join(", ");
}

function renderStateBucket(targetElement, bucket, emptyLabel) {
    targetElement.innerHTML = "";

    const entries = Object.entries(bucket);
    if (entries.length === 0) {
        const emptyState = document.createElement("div");
        emptyState.className = "state-empty";
        emptyState.textContent = emptyLabel;
        targetElement.appendChild(emptyState);
        return;
    }

    const list = document.createElement("div");
    list.className = "state-list";

    for (const [key, value] of entries) {
        const row = document.createElement("div");
        row.className = "state-row";

        const keyLabel = document.createElement("span");
        keyLabel.className = "state-key";
        keyLabel.textContent = formatStateKeyLabel(key);

        const valueLabel = document.createElement("span");
        valueLabel.className = "state-value";
        valueLabel.textContent = String(value);

        row.appendChild(keyLabel);
        row.appendChild(valueLabel);
        list.appendChild(row);
    }

    targetElement.appendChild(list);
}

function formatStateKeyLabel(key) {
    return key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getFacingTileCoordinates() {
    const vector = DIRECTION_VECTORS[state.player.facing];
    return {
        x: state.player.tileX + vector.dx,
        y: state.player.tileY + vector.dy,
    };
}

function getAvailableInteractTriggersAt(tileX, tileY) {
    if (!Array.isArray(GAME_CONFIG.triggers)) {
        return [];
    }

    const consumedIds = state.triggerEngine
        ? new Set(state.triggerEngine.getConsumedTriggerIds())
        : new Set();

    return GAME_CONFIG.triggers.filter((trigger) => {
        if (!trigger || typeof trigger !== "object") {
            return false;
        }

        if (trigger.type !== "onInteractCell") {
            return false;
        }

        if (trigger.x !== tileX || trigger.y !== tileY) {
            return false;
        }

        if (!Array.isArray(trigger.actions) || trigger.actions.length === 0) {
            return false;
        }

        if (trigger.once === true && consumedIds.has(trigger.id)) {
            return false;
        }

        return true;
    });
}

function render(now = performance.now()) {
    updateTriggerSpriteFrames(now);
    updateTeleportEffect(now);
    refs.playerSprite.style.transform = `translate(${state.player.pixelX}px, ${state.player.pixelY}px)`;
    updatePlayerSpriteFrame();
}

function updateTeleportEffect(now) {
    const effect = state.teleportEffect;
    if (!effect.active || !effect.element) {
        return;
    }

    const elapsed = now - effect.startTime;
    if (effect.mode === "sheet") {
        const rawFrame = Math.min(
            effect.frames - 1,
            Math.floor(elapsed / effect.speed),
        );
        const frameIndex =
            effect.direction === "backward"
                ? Math.max(0, effect.frames - 1 - rawFrame)
                : rawFrame;

        const offsetX = -(frameIndex * GAME_CONFIG.tileSize);
        effect.element.style.backgroundPosition = `${offsetX}px 0px`;
    }

    if (elapsed >= effect.durationMs) {
        finishTeleportEffect();
    }
}

function updateTriggerSpriteFrames(now) {
    if (state.triggerSprites.size === 0) {
        return;
    }

    for (const spriteEntry of state.triggerSprites.values()) {
        if (
            !spriteEntry ||
            spriteEntry.mode !== "sheet" ||
            spriteEntry.frames <= 1 ||
            spriteEntry.speed <= 0
        ) {
            continue;
        }

        const elapsed = now - spriteEntry.startTime;
        const frameIndex =
            Math.floor(elapsed / spriteEntry.speed) % spriteEntry.frames;
        const offsetX = -(frameIndex * GAME_CONFIG.tileSize);
        spriteEntry.element.style.backgroundPosition = `${offsetX}px 0px`;
    }
}

function finishTeleportEffect() {
    const effect = state.teleportEffect;
    effect.active = false;

    if (effect.element) {
        effect.element.style.display = "none";
    }

    const resolve = effect.resolve;
    effect.resolve = null;
    if (resolve) {
        resolve();
    }
}

function updatePlayerSpriteFrame() {
    const directionConfig = GAME_CONFIG.player.directions[state.player.facing];
    const frameCount = Math.max(1, directionConfig.frames);

    let frameIndex = 0;
    if (frameCount > 1 && state.player.isMoving) {
        frameIndex = Math.min(
            frameCount - 1,
            Math.floor(state.player.moveProgress * frameCount),
        );
    }

    const offsetX = -(frameIndex * GAME_CONFIG.player.frameWidth);
    const offsetY = -(directionConfig.row * GAME_CONFIG.player.frameHeight);
    refs.playerSprite.style.backgroundPosition = `${offsetX}px ${offsetY}px`;
}

function onKeyDown(event) {
    const direction = KEY_TO_DIRECTION[event.code];

    if (direction) {
        event.preventDefault();

        if (state.modal.isOpen() || state.isTeleporting) {
            return;
        }

        if (!state.player.isMoving && state.player.facing !== direction) {
            state.player.facing = direction;
            state.turnLockDirection = direction;
            state.turnLockUntil = performance.now() + TURN_DELAY_MS;

            if (!state.activeDirections.includes(direction)) {
                state.activeDirections.push(direction);
            }

            return;
        }

        if (!state.activeDirections.includes(direction)) {
            state.activeDirections.push(direction);
        }

        if (state.player.isMoving) {
            state.queuedDirection = direction;
        }

        return;
    }

    if (INTERACT_KEYS.has(event.code)) {
        event.preventDefault();

        if (state.modal.isOpen() || state.isTeleporting) {
            return;
        }

        if (event.repeat) {
            return;
        }

        handleInteract();
    }
}

function onKeyUp(event) {
    const direction = KEY_TO_DIRECTION[event.code];
    if (!direction) {
        return;
    }

    if (state.turnLockDirection === direction) {
        state.turnLockDirection = null;
        state.turnLockUntil = 0;
    }

    const index = state.activeDirections.indexOf(direction);
    if (index !== -1) {
        state.activeDirections.splice(index, 1);
    }
}

function clearInputState() {
    state.activeDirections = [];
    state.queuedDirection = null;
    state.turnLockDirection = null;
    state.turnLockUntil = 0;
}

function handleInteract() {
    const vector = DIRECTION_VECTORS[state.player.facing];
    const targetX = state.player.tileX + vector.dx;
    const targetY = state.player.tileY + vector.dy;

    playEventSound("interact");
    state.triggerEngine.run("onInteractCell", targetX, targetY, {
        source: "interact",
    });
}

function runDeferredEnterTrigger() {
    if (!state.deferredEnterTrigger) {
        return;
    }

    const { x, y } = state.deferredEnterTrigger;
    state.deferredEnterTrigger = null;
    state.triggerEngine.run("onEnterCell", x, y, { source: "deferred" });
}

function executeTriggerAction(actions, context = {}) {
    const resolution = resolveTriggerActions(actions, context.trigger);
    const resolvedActions = resolution?.actions;

    if (!Array.isArray(resolvedActions) || resolvedActions.length === 0) {
        return false;
    }

    let didAnyActionSucceed = false;

    for (const action of resolvedActions) {
        if (
            !action ||
            typeof action !== "object" ||
            typeof action.kind !== "string"
        ) {
            console.warn("[triggers] Invalid action object.");
            continue;
        }

        const didSucceed = executeSingleTriggerAction(action, context);
        if (didSucceed !== false) {
            didAnyActionSucceed = true;
        }
    }

    return formatTriggerExecutionResult(
        didAnyActionSucceed,
        resolution.shouldConsume,
    );
}

function executeSingleTriggerAction(action, context = {}) {
    switch (action.kind) {
        case "playSound":
            return executePlaySoundAction(action);
        case "openModalText":
            return executeOpenTextAction(action);
        case "openModalVideo":
            return executeOpenVideoAction(action);
        case "openModalHtml":
            return executeOpenHtmlAction(action);
        case "teleport":
            return executeTeleportAction(action);
        case "makePassable":
            return executeMakePassableAction(action, context);
        case "giveItem":
            return executeGiveItemAction(action);
        case "removeItem":
            return executeRemoveItemAction(action);
        case "changeStat":
            return executeChangeStatAction(action);
        case "setStat":
            return executeSetStatAction(action);
        default:
            console.warn(
                `[triggers] Unsupported action kind: ${String(action.kind)}`,
            );
            return false;
    }
}

function resolveTriggerActions(actions, trigger) {
    if (!trigger || typeof trigger !== "object") {
        return {
            actions,
            shouldConsume: true,
        };
    }

    const conditions = Array.isArray(trigger.conditions)
        ? trigger.conditions
        : null;
    if (!conditions || conditions.length === 0) {
        return {
            actions: trigger.actions,
            shouldConsume: true,
        };
    }

    const didPass = evaluateTriggerConditions(conditions);
    if (didPass) {
        return {
            actions: trigger.actions,
            shouldConsume: true,
        };
    }

    if (trigger.elseAction && typeof trigger.elseAction === "object") {
        return {
            actions: [trigger.elseAction],
            shouldConsume: false,
        };
    }

    return null;
}

function formatTriggerExecutionResult(didSucceed, shouldConsume) {
    if (didSucceed === false) {
        return false;
    }

    return {
        didSucceed: true,
        shouldConsume,
    };
}

function evaluateTriggerConditions(conditions) {
    for (const condition of conditions) {
        if (!evaluateSingleCondition(condition)) {
            return false;
        }
    }

    return true;
}

function evaluateSingleCondition(condition) {
    if (!condition || typeof condition !== "object") {
        console.warn("[triggers] Condition must be an object.");
        return false;
    }

    const scope = condition.scope;
    const key = condition.key;
    const op = condition.op;
    const expectedValue = condition.value;

    if (scope !== "items" && scope !== "stats") {
        console.warn(
            `[triggers] Unsupported condition scope: ${String(scope)}.`,
        );
        return false;
    }

    if (typeof key !== "string" || key.trim() === "") {
        console.warn("[triggers] Condition needs a non-empty key.");
        return false;
    }

    if (!CONDITION_OPERATORS.has(op)) {
        console.warn(
            `[triggers] Unsupported condition operator: ${String(op)}.`,
        );
        return false;
    }

    if (!Number.isFinite(expectedValue)) {
        console.warn("[triggers] Condition value must be a number.");
        return false;
    }

    const currentValue = Number(state.playerState[scope]?.[key] ?? 0);
    return compareConditionValues(currentValue, op, expectedValue);
}

function compareConditionValues(leftValue, op, rightValue) {
    switch (op) {
        case "===":
            return leftValue === rightValue;
        case ">":
            return leftValue > rightValue;
        case ">=":
            return leftValue >= rightValue;
        case "<":
            return leftValue < rightValue;
        case "<=":
            return leftValue <= rightValue;
        default:
            return false;
    }
}

function executePlaySoundAction(action) {
    const soundKey = action.soundKey || action.sfx;

    if (typeof soundKey !== "string" || soundKey.trim() === "") {
        console.warn("[triggers] playSound action is missing soundKey.");
        return false;
    }

    return state.audio.playSound(soundKey);
}

function executeMakePassableAction(action, context = {}) {
    const targetTriggerId =
        typeof action.triggerId === "string" && action.triggerId.trim() !== ""
            ? action.triggerId
            : context.trigger?.id;

    if (typeof targetTriggerId !== "string" || targetTriggerId.trim() === "") {
        console.warn(
            "[triggers] makePassable action needs a triggerId or must run from a trigger with an id.",
        );
        return false;
    }

    const trigger = getTriggerById(targetTriggerId);
    if (!trigger) {
        console.warn(
            `[triggers] makePassable could not find trigger "${targetTriggerId}".`,
        );
        return false;
    }

    if (!Number.isInteger(trigger.x) || !Number.isInteger(trigger.y)) {
        console.warn(
            `[triggers] makePassable trigger "${targetTriggerId}" needs integer x/y coordinates.`,
        );
        return false;
    }

    removeSolidTile(trigger.x, trigger.y);

    if (Object.prototype.hasOwnProperty.call(action, "passableSprite")) {
        if (
            action.passableSprite === null ||
            action.passableSprite === false ||
            action.passableSprite === ""
        ) {
            state.preservedTriggerSpriteIds.delete(targetTriggerId);
            setTriggerSprite(targetTriggerId, null);
        } else {
            state.preservedTriggerSpriteIds.add(targetTriggerId);
            setTriggerSprite(targetTriggerId, action.passableSprite);
        }
    } else {
        state.preservedTriggerSpriteIds.delete(targetTriggerId);
        setTriggerSprite(targetTriggerId, null);
    }

    return true;
}

function executeGiveItemAction(action) {
    const itemKey = action.itemKey;
    const amount = Number.isFinite(action.amount) ? action.amount : 1;

    if (typeof itemKey !== "string" || itemKey.trim() === "") {
        console.warn("[triggers] giveItem action needs a non-empty itemKey.");
        return false;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        console.warn("[triggers] giveItem action needs a positive amount.");
        return false;
    }

    changePlayerStateValue("items", itemKey, amount);
    return true;
}

function executeRemoveItemAction(action) {
    const itemKey = action.itemKey;
    const amount = Number.isFinite(action.amount) ? action.amount : 1;

    if (typeof itemKey !== "string" || itemKey.trim() === "") {
        console.warn("[triggers] removeItem action needs a non-empty itemKey.");
        return false;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        console.warn("[triggers] removeItem action needs a positive amount.");
        return false;
    }

    const currentValue = Number(state.playerState.items[itemKey] ?? 0);
    if (currentValue < amount) {
        console.warn(
            `[triggers] Cannot remove ${amount} of item \"${itemKey}\" because the player only has ${currentValue}.`,
        );
        return false;
    }

    changePlayerStateValue("items", itemKey, -amount);
    return true;
}

function executeChangeStatAction(action) {
    const statKey = action.statKey;
    const amount = action.amount;

    if (typeof statKey !== "string" || statKey.trim() === "") {
        console.warn("[triggers] changeStat action needs a non-empty statKey.");
        return false;
    }

    if (!Number.isFinite(amount)) {
        console.warn("[triggers] changeStat action needs a numeric amount.");
        return false;
    }

    changePlayerStateValue("stats", statKey, amount);
    return true;
}

function executeSetStatAction(action) {
    const statKey = action.statKey;
    const value = action.value;

    if (typeof statKey !== "string" || statKey.trim() === "") {
        console.warn("[triggers] setStat action needs a non-empty statKey.");
        return false;
    }

    if (!Number.isFinite(value)) {
        console.warn("[triggers] setStat action needs a numeric value.");
        return false;
    }

    setPlayerStateValue("stats", statKey, value);
    return true;
}

function executeOpenTextAction(action) {
    const sizeOptions = resolveModalSizeOptions(action);

    const didOpen = state.modal.openText({
        title: action.title || "Message",
        text: action.text || "",
        maxWidth: sizeOptions.maxWidth,
        maxHeight: sizeOptions.maxHeight,
    });

    return didOpen;
}

function executeOpenVideoAction(action) {
    const contentEntry = getContentEntry(action.contentKey);
    const sizeOptions = resolveModalSizeOptions(action, contentEntry);

    const videoSrc = action.src || contentEntry?.videoSrc;
    const videoType =
        action.videoType || contentEntry?.videoType || "video/mp4";
    const title = action.title || contentEntry?.title || "Video";
    const description = action.description || contentEntry?.description || "";

    if (typeof videoSrc !== "string" || videoSrc.trim() === "") {
        console.warn(
            "[triggers] openModalVideo action is missing a valid video source.",
        );
        return false;
    }

    return state.modal.openVideo({
        title,
        src: videoSrc,
        type: videoType,
        description,
        maxWidth: sizeOptions.maxWidth,
        maxHeight: sizeOptions.maxHeight,
    });
}

function executeOpenHtmlAction(action) {
    const contentEntry = getContentEntry(action.contentKey);
    const sizeOptions = resolveModalSizeOptions(action, contentEntry);

    const html = contentEntry?.html;
    const title = action.title || contentEntry?.title || "Info";

    if (typeof html !== "string" || html.trim() === "") {
        console.warn(
            `[triggers] openModalHtml action is missing content for key \"${String(action.contentKey)}\".`,
        );
        return false;
    }

    return state.modal.openHtml({
        title,
        html,
        maxWidth: sizeOptions.maxWidth,
        maxHeight: sizeOptions.maxHeight,
    });
}

function resolveModalSizeOptions(action, contentEntry = null) {
    return {
        maxWidth: action?.maxWidth ?? contentEntry?.maxWidth,
        maxHeight: action?.maxHeight ?? contentEntry?.maxHeight,
    };
}

function resolveTeleportSpriteConfig(action) {
    if (!Object.prototype.hasOwnProperty.call(action, "sprite")) {
        return null;
    }

    const rawSprite = action.sprite;

    if (typeof rawSprite === "string") {
        const trimmed = rawSprite.trim();
        if (trimmed === "") {
            console.warn("[triggers] teleport sprite string cannot be empty.");
            return null;
        }
        return { src: trimmed, frames: 1, speed: 150, mode: "image" };
    }

    if (!rawSprite || typeof rawSprite !== "object") {
        console.warn("[triggers] teleport sprite must be a string or object.");
        return null;
    }

    const src = typeof rawSprite.src === "string" ? rawSprite.src.trim() : "";
    if (src === "") {
        console.warn(
            "[triggers] teleport sprite object needs a non-empty src string.",
        );
        return null;
    }
    const isGif = isAnimatedGifSource(src);

    let frames = 1;
    if (Number.isInteger(rawSprite.frames) && rawSprite.frames > 0) {
        frames = rawSprite.frames;
    } else if (rawSprite.frames !== undefined) {
        console.warn(
            "[triggers] teleport sprite.frames should be a positive integer.",
        );
    }
    if (isGif) {
        frames = 1;
    }

    let speed = 150;
    if (Number.isInteger(rawSprite.speed) && rawSprite.speed > 0) {
        speed = rawSprite.speed;
    } else if (rawSprite.speed !== undefined) {
        console.warn(
            "[triggers] teleport sprite.speed should be a positive integer.",
        );
    }

    const mode = !isGif && frames > 1 ? "sheet" : "image";
    return { src, frames, speed, mode };
}

function startTeleportEffect(tileX, tileY, spriteConfig, direction) {
    if (!spriteConfig || !state.teleportEffect.element) {
        return Promise.resolve();
    }

    const effect = state.teleportEffect;
    const frames = Math.max(1, spriteConfig.frames);
    const speed = Math.max(1, spriteConfig.speed);

    effect.active = true;
    effect.frames = frames;
    effect.speed = speed;
    effect.startTime = performance.now();
    effect.direction = direction === "backward" ? "backward" : "forward";
    effect.mode = spriteConfig.mode;
    effect.durationMs = spriteConfig.mode === "sheet" ? frames * speed : speed;

    effect.element.style.backgroundImage = `url("${spriteConfig.src}")`;
    effect.element.style.left = `${tileX * GAME_CONFIG.tileSize}px`;
    effect.element.style.top = `${tileY * GAME_CONFIG.tileSize}px`;
    if (effect.mode === "sheet") {
        const initialFrame = effect.direction === "backward" ? frames - 1 : 0;
        effect.element.style.backgroundPosition = `${-(initialFrame * GAME_CONFIG.tileSize)}px 0px`;
    } else {
        effect.element.style.backgroundPosition = "0px 0px";
    }
    effect.element.style.display = "block";

    preloadSpriteImage(spriteConfig.src, "teleport_effect");

    return new Promise((resolve) => {
        effect.resolve = resolve;
    });
}

function executeTeleportAction(action) {
    if (
        !Number.isInteger(action.targetX) ||
        !Number.isInteger(action.targetY)
    ) {
        console.warn(
            "[triggers] teleport action needs integer targetX and targetY.",
        );
        return false;
    }

    if (!isInsideMap(action.targetX, action.targetY)) {
        console.warn(
            `[triggers] teleport target (${action.targetX}, ${action.targetY}) is outside map bounds.`,
        );
        return false;
    }

    if (isSolidTile(action.targetX, action.targetY)) {
        console.warn(
            `[triggers] teleport target (${action.targetX}, ${action.targetY}) is a solid tile.`,
        );
        return false;
    }

    if (state.isTeleporting) {
        console.warn(
            "[triggers] teleport action skipped because another teleport is running.",
        );
        return false;
    }

    const spriteConfig = resolveTeleportSpriteConfig(action);
    if (!spriteConfig) {
        setPlayerTilePosition(action.targetX, action.targetY);
        clearInputState();

        const teleportSound =
            typeof action.sfx === "string" && action.sfx.trim() !== ""
                ? action.sfx
                : GAME_CONFIG.audioEvents.teleport;

        state.audio.playSound(teleportSound);

        // Run destination enter triggers on the next frame, not recursively in the same tick.
        state.deferredEnterTrigger = { x: action.targetX, y: action.targetY };
        return true;
    }

    const startX = state.player.tileX;
    const startY = state.player.tileY;
    const targetX = action.targetX;
    const targetY = action.targetY;

    state.isTeleporting = true;
    clearInputState();

    startTeleportEffect(startX, startY, spriteConfig, "forward")
        .then(() => {
            setPlayerTilePosition(targetX, targetY);

            const teleportSound =
                typeof action.sfx === "string" && action.sfx.trim() !== ""
                    ? action.sfx
                    : GAME_CONFIG.audioEvents.teleport;

            state.audio.playSound(teleportSound);

            return startTeleportEffect(
                targetX,
                targetY,
                spriteConfig,
                "backward",
            );
        })
        .then(() => {
            state.isTeleporting = false;
            state.deferredEnterTrigger = { x: targetX, y: targetY };
        });

    return true;
}

function getContentEntry(contentKey) {
    if (typeof contentKey !== "string" || contentKey.trim() === "") {
        return null;
    }

    const entry = MODAL_CONTENT[contentKey];
    if (!entry) {
        console.warn(`[content] Unknown content key \"${contentKey}\".`);
        return null;
    }

    return entry;
}

function changePlayerStateValue(scope, key, amount) {
    const currentValue = Number(state.playerState[scope]?.[key] ?? 0);
    const nextValue = currentValue + amount;
    state.playerState[scope][key] = nextValue;
}

function setPlayerStateValue(scope, key, value) {
    state.playerState[scope][key] = value;
}

function setPlayerTilePosition(tileX, tileY) {
    state.player.tileX = tileX;
    state.player.tileY = tileY;
    state.player.pixelX = tileX * GAME_CONFIG.tileSize;
    state.player.pixelY = tileY * GAME_CONFIG.tileSize;
    state.player.isMoving = false;
    state.player.moveProgress = 0;
}

function isInsideMap(tileX, tileY) {
    return (
        tileX >= 0 &&
        tileX < GAME_CONFIG.map.widthTiles &&
        tileY >= 0 &&
        tileY < GAME_CONFIG.map.heightTiles
    );
}

function isSolidTile(tileX, tileY) {
    return state.solidTileSet.has(tileKey(tileX, tileY));
}

function tileKey(tileX, tileY) {
    return `${tileX},${tileY}`;
}

function playEventSound(eventName) {
    const soundKey = GAME_CONFIG.audioEvents?.[eventName];

    if (typeof soundKey !== "string" || soundKey.trim() === "") {
        return false;
    }

    return state.audio.playSound(soundKey);
}

function validateMapDimensions(mapImage) {
    const expectedWidth = GAME_CONFIG.map.widthTiles * GAME_CONFIG.tileSize;
    const expectedHeight = GAME_CONFIG.map.heightTiles * GAME_CONFIG.tileSize;

    if (
        mapImage.naturalWidth !== expectedWidth ||
        mapImage.naturalHeight !== expectedHeight
    ) {
        throw new Error(
            `[map] Map dimension mismatch. Expected ${expectedWidth}x${expectedHeight}px ` +
                `but got ${mapImage.naturalWidth}x${mapImage.naturalHeight}px.`,
        );
    }
}

function validateSpriteSheet(image) {
    const directionEntries = Object.values(GAME_CONFIG.player.directions);
    const maxFrames = Math.max(
        ...directionEntries.map((entry) => entry.frames),
    );
    const maxRow = Math.max(...directionEntries.map((entry) => entry.row));

    const requiredWidth = maxFrames * GAME_CONFIG.player.frameWidth;
    const requiredHeight = (maxRow + 1) * GAME_CONFIG.player.frameHeight;

    if (
        image.naturalWidth < requiredWidth ||
        image.naturalHeight < requiredHeight
    ) {
        throw new Error(
            `[player] Sprite sheet is too small. Required minimum ${requiredWidth}x${requiredHeight}px ` +
                `but got ${image.naturalWidth}x${image.naturalHeight}px.`,
        );
    }
}

function loadImageIntoElement(imgElement, src) {
    return new Promise((resolve, reject) => {
        imgElement.onload = () => resolve(imgElement);
        imgElement.onerror = () =>
            reject(new Error(`Failed to load image: ${src}`));
        imgElement.src = src;
    });
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        image.src = src;
    });
}

function failStartup(error) {
    state.fatalError = true;
    console.error(error);

    refs.fatalError.hidden = false;
    refs.fatalError.textContent = [
        "Game failed to load.",
        String(error?.message || error),
        "Check js/config.js and media file dimensions.",
    ].join(" ");
}

function lerp(start, end, t) {
    return start + (end - start) * t;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
