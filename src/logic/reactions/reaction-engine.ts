import type { Ingredient } from "../../data/ingredients.ts";
import { traceCauldronReactions } from "./reaction-trace.ts";
import type { IReaction, ReactionResolution } from "./reaction-types.ts";

export function resolveCauldronReactions(
  ingredients: readonly Ingredient[],
  activeReactionIds: readonly string[],
): ReactionResolution {
  const { values, steps } = traceCauldronReactions(
    ingredients,
    activeReactionIds,
  );
  const activeReactions = steps.map(({ reaction }) => reaction);

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
