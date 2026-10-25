import type { Ingredient } from "../../data/ingredients.ts";
import type { Difficulty } from "../../data/recipes.ts";
import { calculateCauldron } from "../calculate-cauldron.ts";
import { getReactionsForDifficulty } from "./reaction-catalog.ts";
import type { IReaction, ReactionResolution } from "./reaction-types.ts";

export function resolveCauldronReactions(
  ingredients: readonly Ingredient[],
  difficulty: Difficulty,
): ReactionResolution {
  let values = calculateCauldron(ingredients);
  const activeReactions: IReaction[] = [];

  for (const reaction of getReactionsForDifficulty(difficulty)) {
    if (!reaction.isActive(ingredients, values)) {
      continue;
    }

    activeReactions.push(reaction);
    values = reaction.apply(values);
  }

  return { values, activeReactions };
}

export function getNewlyActivatedReactions(
  previousIngredients: readonly Ingredient[],
  currentIngredients: readonly Ingredient[],
  difficulty: Difficulty,
): readonly IReaction[] {
  const previouslyActiveIds = new Set(
    resolveCauldronReactions(
      previousIngredients,
      difficulty,
    ).activeReactions.map(({ id }) => id),
  );
  const activeReactions = resolveCauldronReactions(
    currentIngredients,
    difficulty,
  ).activeReactions;

  return activeReactions.filter(({ id }) => !previouslyActiveIds.has(id));
}
