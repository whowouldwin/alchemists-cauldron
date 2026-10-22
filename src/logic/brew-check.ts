import type { Recipe, RecipeRange } from "../data/recipes.ts";

export const LEVEL_ONE_RECIPE_TOLERANCE = 8;

export interface CauldronValues {
  readonly temperature: number;
  readonly density: number;
  readonly magicPower: number;
}

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
): boolean {
  return (
    isValueWithinTolerance(
      values.temperature,
      recipe.temperature,
      LEVEL_ONE_RECIPE_TOLERANCE,
    ) &&
    isValueWithinTolerance(
      values.density,
      recipe.density,
      LEVEL_ONE_RECIPE_TOLERANCE,
    ) &&
    isValueWithinTolerance(
      values.magicPower,
      recipe.magicPower,
      LEVEL_ONE_RECIPE_TOLERANCE,
    )
  );
}
