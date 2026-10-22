import type { Ingredient } from "../data/ingredients.ts";
import type { CauldronValues } from "./calculate-cauldron.ts";

export type CauldronParameter = keyof CauldronValues;

export interface ParameterScale {
  readonly minimum: number;
  readonly maximum: number;
}

export function calculateParameterScale(
  ingredients: readonly Ingredient[],
  parameter: CauldronParameter,
  ingredientLimit: number,
  supportsNegativeValues: boolean,
): ParameterScale {
  const largestIngredientValue = ingredients.reduce(
    (largestValue, ingredient) =>
      Math.max(largestValue, Math.abs(ingredient[parameter])),
    0,
  );
  const maximum = largestIngredientValue * ingredientLimit;

  return {
    minimum: supportsNegativeValues ? -maximum : 0,
    maximum,
  };
}

export function calculateMarkerPosition(
  value: number,
  scale: ParameterScale,
): number {
  return ((value - scale.minimum) / (scale.maximum - scale.minimum)) * 100;
}
