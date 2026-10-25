import type { Ingredient } from "../../data/ingredients.ts";
import { formatIngredientValue } from "../shared/format-ingredient-value.ts";
import { createElement } from "../shared/create-element.ts";

const INGREDIENT_PROPERTIES = [
  ["Temperature", "temperature"],
  ["Density", "density"],
  ["Magic Power", "magicPower"],
] as const satisfies readonly (readonly [string, keyof Ingredient])[];

export function renderIngredientTooltip(ingredient: Ingredient): HTMLElement {
  const tooltip = createElement("span", "ingredient-tooltip");

  tooltip.setAttribute("role", "tooltip");

  INGREDIENT_PROPERTIES.forEach(([label, property]) => {
    const row = createElement("span", "ingredient-tooltip__row");
    const propertyLabel = createElement(
      "span",
      "ingredient-tooltip__label",
      label,
    );
    const value = createElement(
      "span",
      "ingredient-tooltip__value",
      formatIngredientValue(ingredient[property]),
    );

    row.append(propertyLabel, value);
    tooltip.append(row);
  });

  return tooltip;
}
