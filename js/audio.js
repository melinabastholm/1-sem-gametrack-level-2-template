export function createAudioController(soundMap, logger = console) {
    const templates = new Map();

    if (!soundMap || typeof soundMap !== "object") {
        logger.warn(
            "[audio] Sound map is missing or invalid. Sound will be disabled.",
        );
        return {
            playSound() {
                return false;
            },
        };
    }

    const bgMusic = new Audio("../assets/sfx/Baggrundsmusik.wav");

    bgMusic.loop = true;
    bgMusic.volume = 0.2;

    document.addEventListener("click", () => {
        bgMusic.play().then(() => {
            console.log("Musik spiller!");
        }).catch(err => {
            console.log("Fejl:", err);
        });
    }, { once: true });

    Object.entries(soundMap).forEach(([soundKey, soundSrc]) => {
        if (typeof soundSrc !== "string" || soundSrc.trim() === "") {
            logger.warn(`[audio] Invalid sound path for key \"${soundKey}\".`);
            return;
        }

        const audio = new Audio(soundSrc);
        audio.preload = "auto";
        templates.set(soundKey, audio);
    });

    function playSound(soundKey) {
        if (typeof soundKey !== "string" || soundKey.trim() === "") {
            logger.warn("[audio] playSound called without a valid sound key.");
            return false;
        }

        const template = templates.get(soundKey);
        if (!template) {
            logger.warn(`[audio] Unknown sound key \"${soundKey}\".`);
            return false;
        }

        const clip = template.cloneNode(true);
        const playPromise = clip.play();

        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {
                logger.warn(`[audio] Failed to play sound \"${soundKey}\".`);
            });
        }

        return true;
    }

    return {
        playSound,
    };
}
