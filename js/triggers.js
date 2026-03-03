const SUPPORTED_TRIGGER_TYPES = new Set(["onEnterCell", "onInteractCell"]);
const SUPPORTED_ACTION_KINDS = new Set([
    "playSound",
    "openModalText",
    "openModalVideo",
    "openModalHtml",
    "teleport"
]);

export function createTriggerEngine({ triggers, executeAction, logger = console }) {
    if (typeof executeAction !== "function") {
        throw new Error("createTriggerEngine requires an executeAction function.");
    }

    const consumedTriggerIds = new Set();
    const normalizedTriggers = normalizeTriggers(triggers, logger);

    function run(eventType, eventX, eventY, context = {}) {
        const matches = normalizedTriggers.filter((trigger) => {
            return trigger.type === eventType && trigger.x === eventX && trigger.y === eventY;
        });

        let executedCount = 0;

        for (const trigger of matches) {
            if (trigger.once && consumedTriggerIds.has(trigger.id)) {
                continue;
            }

            const didSucceed = executeAction(trigger.action, {
                ...context,
                trigger,
                eventType,
                eventX,
                eventY
            });

            if (didSucceed !== false) {
                executedCount += 1;
                if (trigger.once) {
                    consumedTriggerIds.add(trigger.id);
                }
            }
        }

        return executedCount;
    }

    return {
        run,
        resetOnceTriggers() {
            consumedTriggerIds.clear();
        },
        getConsumedTriggerIds() {
            return Array.from(consumedTriggerIds);
        }
    };
}

function normalizeTriggers(input, logger) {
    if (!Array.isArray(input)) {
        logger.warn("[triggers] Expected triggers to be an array. No triggers were loaded.");
        return [];
    }

    const usedIds = new Set();
    const validTriggers = [];

    input.forEach((rawTrigger, index) => {
        if (!rawTrigger || typeof rawTrigger !== "object") {
            logger.warn(`[triggers] Trigger at index ${index} is not an object. Skipping.`);
            return;
        }

        const { id, type, x, y, action } = rawTrigger;

        if (typeof id !== "string" || id.trim() === "") {
            logger.warn(`[triggers] Trigger at index ${index} is missing a valid id. Skipping.`);
            return;
        }

        if (usedIds.has(id)) {
            logger.warn(`[triggers] Duplicate trigger id \"${id}\". Only the first one is used.`);
            return;
        }

        if (!SUPPORTED_TRIGGER_TYPES.has(type)) {
            logger.warn(`[triggers] Trigger \"${id}\" has unsupported type \"${String(type)}\". Skipping.`);
            return;
        }

        if (!Number.isInteger(x) || !Number.isInteger(y)) {
            logger.warn(`[triggers] Trigger \"${id}\" must use integer tile coordinates. Skipping.`);
            return;
        }

        if (!action || typeof action !== "object") {
            logger.warn(`[triggers] Trigger \"${id}\" is missing an action object. Skipping.`);
            return;
        }

        if (!SUPPORTED_ACTION_KINDS.has(action.kind)) {
            logger.warn(`[triggers] Trigger \"${id}\" has unsupported action kind \"${String(action.kind)}\". Skipping.`);
            return;
        }

        usedIds.add(id);
        validTriggers.push({
            ...rawTrigger,
            id,
            type,
            x,
            y,
            once: rawTrigger.once === true,
            action: { ...action }
        });
    });

    return validTriggers;
}
