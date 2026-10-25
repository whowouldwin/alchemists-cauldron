import type { Ingredient } from "../../data/ingredients.ts";

export function createIngredientCardLabel(
  ingredient: Ingredient,
  stock: number,
): string {
  if (stock === 0) {
    return `${ingredient.name}. Depleted.`;
  }

  return `Add ${ingredient.name}. Stock: ${stock}.`;
}
