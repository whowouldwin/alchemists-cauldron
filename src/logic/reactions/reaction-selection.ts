import { DIFFICULTY_SETTINGS } from "../../data/difficulty-settings.ts";
import { getIngredientsForDifficulty } from "../../data/ingredients.ts";
import type { Difficulty } from "../../data/recipes.ts";
import { REACTIONS } from "./reaction-definitions.ts";
import type { IReaction } from "./reaction-types.ts";

export function getAvailableReactionsForDifficulty(
  difficulty: Difficulty,
): readonly IReaction[] {
  const availableIngredientIds = new Set(
    getIngredientsForDifficulty(difficulty).map(({ id }) => id),
  );

  return REACTIONS.filter(
    (reaction) =>
      reaction.requiredIngredientIds?.every((id) =>
        availableIngredientIds.has(id),
      ) ?? true,
  );
}

export function selectReactionIdsForDifficulty(
  difficulty: Difficulty,
  random: () => number = Math.random,
): readonly string[] {
  const candidates = [...getAvailableReactionsForDifficulty(difficulty)];
  const reactionCount = DIFFICULTY_SETTINGS[difficulty].reactionCount;

  if (candidates.length < reactionCount) {
    throw new RangeError(
      `Difficulty "${difficulty}" requires ${reactionCount} reactions, but only ${candidates.length} are available.`,
    );
  }

  for (let index = 0; index < reactionCount; index += 1) {
    const remainingCount = candidates.length - index;
    const selectedIndex = Math.floor(random() * remainingCount);

    if (selectedIndex < 0 || selectedIndex >= remainingCount) {
      throw new RangeError(
        "The random generator must return a value in [0, 1).",
      );
    }

    const swapIndex = index + selectedIndex;
    const currentReaction = candidates[index];
    const selectedReaction = candidates[swapIndex];

    if (currentReaction === undefined || selectedReaction === undefined) {
      throw new RangeError("The selected reaction is unavailable.");
    }

    [candidates[index], candidates[swapIndex]] = [
      selectedReaction,
      currentReaction,
    ];
  }

  return candidates.slice(0, reactionCount).map(({ id }) => id);
}

export function isValidReactionSelection(
  value: unknown,
  difficulty: Difficulty,
): value is readonly string[] {
  if (!Array.isArray(value)) {
    return false;
  }

  const reactionIds: string[] = [];

  for (const reactionId of value) {
    if (typeof reactionId !== "string") {
      return false;
    }

    reactionIds.push(reactionId);
  }

  const availableReactionIds = new Set(
    getAvailableReactionsForDifficulty(difficulty).map(({ id }) => id),
  );

  return (
    reactionIds.length === DIFFICULTY_SETTINGS[difficulty].reactionCount &&
    new Set(reactionIds).size === reactionIds.length &&
    reactionIds.every((id) => availableReactionIds.has(id))
  );
}
