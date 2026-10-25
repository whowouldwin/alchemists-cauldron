import type { Ingredient } from "../../data/ingredients.ts";
import { calculateCauldron } from "../calculate-cauldron.ts";
import { getReactionsByIds } from "./reaction-catalog.ts";
import type { IReaction, ReactionResolution } from "./reaction-types.ts";

export function resolveCauldronReactions(
  ingredients: readonly Ingredient[],
  activeReactionIds: readonly string[],
): ReactionResolution {
  const baseValues = calculateCauldron(ingredients);
  const activeReactions = getReactionsByIds(activeReactionIds).filter(
    (reaction) => reaction.isActive(ingredients, baseValues),
  );
  const values = activeReactions.reduce(
    (currentValues, reaction) => reaction.apply(currentValues),
    baseValues,
  );

  return { values, activeReactions };
}

export function getNewlyActivatedReactions(
  previousIngredients: readonly Ingredient[],
  currentIngredients: readonly Ingredient[],
  activeReactionIds: readonly string[],
): readonly IReaction[] {
  const previouslyActiveIds = new Set(
    resolveCauldronReactions(
      previousIngredients,
      activeReactionIds,
    ).activeReactions.map(({ id }) => id),
  );
  const activeReactions = resolveCauldronReactions(
    currentIngredients,
    activeReactionIds,
  ).activeReactions;

  return activeReactions.filter(({ id }) => !previouslyActiveIds.has(id));
}
