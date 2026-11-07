import type { Ingredient } from "../../data/ingredients.ts";
import {
  calculateCauldron,
  type CauldronValues,
} from "../calculate-cauldron.ts";
import { getReactionsByIds } from "./reaction-catalog.ts";
import type { IReaction } from "./reaction-types.ts";

export interface ReactionStep {
  readonly reaction: IReaction;
  readonly before: CauldronValues;
  readonly after: CauldronValues;
}

export interface ReactionTrace {
  readonly baseValues: CauldronValues;
  readonly values: CauldronValues;
  readonly steps: readonly ReactionStep[];
}

export function traceCauldronReactions(
  ingredients: readonly Ingredient[],
  selectedReactionIds: readonly string[],
): ReactionTrace {
  const baseValues = calculateCauldron(ingredients);
  const steps: ReactionStep[] = [];
  let values = baseValues;

  for (const reaction of getReactionsByIds(selectedReactionIds)) {
    if (!reaction.isActive(ingredients, baseValues)) {
      continue;
    }

    const after = reaction.apply(values);
    steps.push({ reaction, before: values, after });
    values = after;
  }

  return { baseValues, values, steps };
}
