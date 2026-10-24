import type { Ingredient } from "../../data/ingredients.ts";
import { formatIngredientValue } from "../shared/format-ingredient-value.ts";
import { createElement } from "../shared/create-element.ts";

export function renderIngredientStats(ingredient: Ingredient): HTMLElement {
  const stats = [
    ["Temp", ingredient.temperature],
    ["Density", ingredient.density],
    ["Magic", ingredient.magicPower],
  ] as const;
  const ingredientStats = createElement("span", "ingredient-card__stats");

  stats.forEach(([label, value]) => {
    const stat = createElement("span", "ingredient-stat");
    const statLabel = createElement("span", "ingredient-stat__label", label);
    const statValue = createElement(
      "span",
      "ingredient-stat__value",
      formatIngredientValue(value),
    );

    stat.append(statLabel, statValue);
    ingredientStats.append(stat);
  });

  return ingredientStats;
}
