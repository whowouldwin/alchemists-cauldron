import type { Ingredient } from "../data/ingredients.ts";
import type { CauldronValues } from "./calculate-cauldron.ts";

export type CauldronParameter = keyof CauldronValues;

export interface ParameterScale {
  readonly minimum: number;
  readonly maximum: number;
}

export interface ParameterTargetRange {
  readonly minimum: number;
  readonly maximum: number;
}

export interface ParameterTargetPosition {
  readonly left: number;
  readonly width: number;
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

export function calculateTargetPosition(
  targetRange: ParameterTargetRange,
  scale: ParameterScale,
): ParameterTargetPosition {
  const start = calculateMarkerPosition(targetRange.minimum, scale);
  const end = calculateMarkerPosition(targetRange.maximum, scale);
  const left = Math.max(0, Math.min(start, 100));
  const right = Math.max(0, Math.min(end, 100));

  return { left, width: Math.max(right - left, 0) };
}

export function isValueInTargetRange(
  value: number,
  targetRange: ParameterTargetRange,
): boolean {
  return value >= targetRange.minimum && value <= targetRange.maximum;
}
