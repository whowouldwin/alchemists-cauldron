import type { Ingredient } from "../data/ingredients.ts";

export interface CauldronValues {
  readonly temperature: number;
  readonly density: number;
  readonly magicPower: number;
}

export function calculateCauldron(
  ingredients: readonly Ingredient[],
): CauldronValues {
  let temperature = 0;
  let density = 0;
  let magicPower = 0;

  for (const ingredient of ingredients) {
    temperature += ingredient.temperature;
    density += ingredient.density;
    magicPower += ingredient.magicPower;
  }

  return { temperature, density, magicPower };
}
