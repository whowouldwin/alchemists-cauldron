import { DIFFICULTY_SETTINGS } from "../data/difficulty-settings.ts";
import type { RecipeRange } from "../data/recipes.ts";
import { isBrewSuccessful } from "../logic/brew-check.ts";
import {
  traceCauldronReactions,
  type ReactionTrace,
} from "../logic/reactions/reaction-trace.ts";
import type { LaboratoryState } from "./laboratory-state.ts";

export interface LaboratoryResult {
  readonly trace: ReactionTrace;
  readonly hasExplosion: boolean;
  readonly targetRanges: {
    readonly temperature: RecipeRange;
    readonly density: RecipeRange;
    readonly magicPower: RecipeRange;
  };
  readonly matchesRecipe: boolean;
}

export function evaluateLaboratoryMixture(
  state: LaboratoryState,
): LaboratoryResult {
  const { recipe, ingredients } = state;
  const trace = traceCauldronReactions(ingredients, state.selectedReactionIds);
  const hasExplosion = trace.steps.some(
    ({ reaction }) => reaction.effects?.clearCauldron === true,
  );
  const tolerance = DIFFICULTY_SETTINGS[recipe.difficulty].recipeTolerance;

  return {
    trace,
    hasExplosion,
    targetRanges: {
      temperature: expandRange(recipe.temperature, tolerance),
      density: expandRange(recipe.density, tolerance),
      magicPower: expandRange(recipe.magicPower, tolerance),
    },
    matchesRecipe:
      ingredients.length > 0 &&
      !hasExplosion &&
      isBrewSuccessful(trace.values, recipe, recipe.difficulty),
  };
}

function expandRange(range: RecipeRange, tolerance: number): RecipeRange {
  return {
    minimum: range.minimum - tolerance,
    maximum: range.maximum + tolerance,
  };
}
