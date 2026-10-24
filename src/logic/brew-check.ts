import { DIFFICULTY_SETTINGS } from "../data/difficulty-settings.ts";
import type { Difficulty } from "../data/recipes.ts";
import type { Recipe, RecipeRange } from "../data/recipes.ts";
import type { CauldronValues } from "./calculate-cauldron.ts";

export const LEVEL_ONE_RECIPE_TOLERANCE =
  DIFFICULTY_SETTINGS.medium.recipeTolerance;

function isValueWithinTolerance(
  value: number,
  target: RecipeRange,
  tolerance: number,
): boolean {
  return (
    value >= target.minimum - tolerance && value <= target.maximum + tolerance
  );
}

export function isBrewSuccessful(
  values: CauldronValues,
  recipe: Recipe,
  difficulty: Difficulty = "medium",
): boolean {
  const tolerance = DIFFICULTY_SETTINGS[difficulty].recipeTolerance;

  return (
    isValueWithinTolerance(values.temperature, recipe.temperature, tolerance) &&
    isValueWithinTolerance(values.density, recipe.density, tolerance) &&
    isValueWithinTolerance(values.magicPower, recipe.magicPower, tolerance)
  );
}
