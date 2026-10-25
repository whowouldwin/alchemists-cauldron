import type { Ingredient } from "../../data/ingredients.ts";
import type { CauldronValues } from "../calculate-cauldron.ts";

export interface ReactionEffects {
  readonly timePenaltySeconds?: number;
  readonly livesLost?: number;
  readonly clearCauldron?: boolean;
}

export interface IReaction {
  readonly id: string;
  readonly name: string;
  readonly isActive: (
    ingredients: readonly Ingredient[],
    values: CauldronValues,
  ) => boolean;
  readonly apply: (values: CauldronValues) => CauldronValues;
  readonly effects?: ReactionEffects;
}

export interface ReactionResolution {
  readonly values: CauldronValues;
  readonly activeReactions: readonly IReaction[];
}
