import { DIFFICULTY_SETTINGS } from "../data/difficulty-settings.ts";
import type { RecipeRange } from "../data/recipes.ts";
import { isBrewSuccessful } from "../logic/brew-check.ts";
import {
  calculateCauldron,
  type CauldronValues,
} from "../logic/calculate-cauldron.ts";
import type { LaboratoryState } from "./laboratory-state.ts";

export interface LaboratoryResult {
  readonly values: CauldronValues;
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
  const values = calculateCauldron(ingredients);
  const tolerance = DIFFICULTY_SETTINGS[recipe.difficulty].recipeTolerance;

  return {
    values,
    targetRanges: {
      temperature: expandRange(recipe.temperature, tolerance),
      density: expandRange(recipe.density, tolerance),
      magicPower: expandRange(recipe.magicPower, tolerance),
    },
    matchesRecipe:
      ingredients.length > 0 &&
      isBrewSuccessful(values, recipe, recipe.difficulty),
  };
}

function expandRange(range: RecipeRange, tolerance: number): RecipeRange {
  return {
    minimum: range.minimum - tolerance,
    maximum: range.maximum + tolerance,
  };
}
