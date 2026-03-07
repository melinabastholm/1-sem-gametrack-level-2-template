const SUPPORTED_TRIGGER_TYPES = new Set(["onEnterCell", "onInteractCell"]);
const SUPPORTED_ACTION_KINDS = new Set([
  "playSound",
  "openModalText",
  "openModalVideo",
  "openModalHtml",
  "teleport",
  "makePassable",
  "giveItem",
  "removeItem",
  "changeStat",
  "setStat",
]);

export function createTriggerEngine({
  triggers,
  executeAction,
  onTriggerConsumed = null,
  logger = console,
}) {
  if (typeof executeAction !== "function") {
    throw new Error("createTriggerEngine requires an executeAction function.");
  }

  const consumedTriggerIds = new Set();
  const normalizedTriggers = normalizeTriggers(triggers, logger);

  function run(eventType, eventX, eventY, context = {}) {
    const matches = normalizedTriggers.filter((trigger) => {
      return (
        trigger.type === eventType &&
        trigger.x === eventX &&
        trigger.y === eventY
      );
    });

    let executedCount = 0;

    for (const trigger of matches) {
      if (trigger.once && consumedTriggerIds.has(trigger.id)) {
        continue;
      }

      const executionResult = executeAction(trigger.actions, {
        ...context,
        trigger,
        eventType,
        eventX,
        eventY,
      });

      const didSucceed =
        executionResult !== false &&
        (!executionResult ||
          typeof executionResult !== "object" ||
          executionResult.didSucceed !== false);
      const shouldConsume =
        executionResult && typeof executionResult === "object"
          ? executionResult.shouldConsume !== false
          : didSucceed;

      if (didSucceed !== false) {
        executedCount += 1;
        if (trigger.once && shouldConsume) {
          consumedTriggerIds.add(trigger.id);
          if (typeof onTriggerConsumed === "function") {
            try {
              onTriggerConsumed(trigger);
            } catch (error) {
              logger.warn(
                `[triggers] onTriggerConsumed failed for \"${trigger.id}\".`,
                error,
              );
            }
          }
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
    },
  };
}

function normalizeTriggers(input, logger) {
  if (!Array.isArray(input)) {
    logger.warn(
      "[triggers] Expected triggers to be an array. No triggers were loaded.",
    );
    return [];
  }

  const usedIds = new Set();
  const validTriggers = [];

  input.forEach((rawTrigger, index) => {
    if (!rawTrigger || typeof rawTrigger !== "object") {
      logger.warn(
        `[triggers] Trigger at index ${index} is not an object. Skipping.`,
      );
      return;
    }

    const { id, type, x, y, actions } = rawTrigger;

    if (typeof id !== "string" || id.trim() === "") {
      logger.warn(
        `[triggers] Trigger at index ${index} is missing a valid id. Skipping.`,
      );
      return;
    }

    if (usedIds.has(id)) {
      logger.warn(
        `[triggers] Duplicate trigger id \"${id}\". Only the first one is used.`,
      );
      return;
    }

    if (!SUPPORTED_TRIGGER_TYPES.has(type)) {
      logger.warn(
        `[triggers] Trigger \"${id}\" has unsupported type \"${String(type)}\". Skipping.`,
      );
      return;
    }

    if (!Number.isInteger(x) || !Number.isInteger(y)) {
      logger.warn(
        `[triggers] Trigger \"${id}\" must use integer tile coordinates. Skipping.`,
      );
      return;
    }

    if (!Array.isArray(actions) || actions.length === 0) {
      logger.warn(
        `[triggers] Trigger \"${id}\" is missing an actions array. Skipping.`,
      );
      return;
    }

    const normalizedActions = [];
    for (const action of actions) {
      if (!action || typeof action !== "object") {
        logger.warn(
          `[triggers] Trigger \"${id}\" has an invalid action entry. Skipping.`,
        );
        return;
      }

      if (!SUPPORTED_ACTION_KINDS.has(action.kind)) {
        logger.warn(
          `[triggers] Trigger \"${id}\" has unsupported action kind \"${String(action.kind)}\". Skipping.`,
        );
        return;
      }

      normalizedActions.push({ ...action });
    }

    if (rawTrigger.elseAction) {
      if (typeof rawTrigger.elseAction !== "object") {
        logger.warn(
          `[triggers] Trigger \"${id}\" has an invalid elseAction. Skipping.`,
        );
        return;
      }

      if (!SUPPORTED_ACTION_KINDS.has(rawTrigger.elseAction.kind)) {
        logger.warn(
          `[triggers] Trigger \"${id}\" has unsupported elseAction kind \"${String(rawTrigger.elseAction.kind)}\". Skipping.`,
        );
        return;
      }
    }

    usedIds.add(id);
    validTriggers.push({
      ...rawTrigger,
      id,
      type,
      x,
      y,
      once: rawTrigger.once === true,
      actions: normalizedActions,
      elseAction: rawTrigger.elseAction ? { ...rawTrigger.elseAction } : null,
    });
  });

  return validTriggers;
}
