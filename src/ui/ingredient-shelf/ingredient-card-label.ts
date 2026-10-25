import type { Ingredient } from "../../data/ingredients.ts";
import { formatIngredientValue } from "../shared/format-ingredient-value.ts";

export function createIngredientCardLabel(
  ingredient: Ingredient,
  stock: number,
  showTooltip: boolean,
): string {
  if (stock === 0) {
    return `${ingredient.name}. Depleted.`;
  }

  const stockDescription = `Add ${ingredient.name}. Stock: ${stock}.`;

  if (showTooltip) {
    return stockDescription;
  }

  return `${stockDescription} Temperature ${formatIngredientValue(ingredient.temperature)}, density ${formatIngredientValue(ingredient.density)}, magic power ${formatIngredientValue(ingredient.magicPower)}.`;
}
