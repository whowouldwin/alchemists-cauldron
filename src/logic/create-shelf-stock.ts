import type { Ingredient } from "../data/ingredients.ts";

const MIN_INGREDIENT_STOCK = 2;
const MAX_INGREDIENT_STOCK = 15;
const STOCK_RANGE_SIZE = MAX_INGREDIENT_STOCK - MIN_INGREDIENT_STOCK + 1;

export function createShelfStock(
  ingredients: readonly Ingredient[],
  random: () => number = Math.random,
): Record<string, number> {
  return Object.fromEntries(
    ingredients.map(({ id }) => [
      id,
      Math.floor(random() * STOCK_RANGE_SIZE) + MIN_INGREDIENT_STOCK,
    ]),
  );
}
