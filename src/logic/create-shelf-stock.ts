import {
  LEVEL_ONE_INGREDIENTS,
  type IngredientId,
} from "../data/ingredients.ts";

export type ShelfStock = Partial<Record<IngredientId, number>>;

const MIN_STOCK = 2;
const STOCK_RANGE = 14;

export function createInitialShelfStock(
  random: () => number = Math.random,
): ShelfStock {
  const stock: ShelfStock = {};

  for (const ingredient of LEVEL_ONE_INGREDIENTS) {
    stock[ingredient.id] = Math.floor(random() * STOCK_RANGE) + MIN_STOCK;
  }

  return stock;
}
