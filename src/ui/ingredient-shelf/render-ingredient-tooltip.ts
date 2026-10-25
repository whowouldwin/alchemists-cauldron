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

export function attachIngredientTooltipInteractions(
  ingredientCard: HTMLElement,
  tooltip: HTMLElement,
): void {
  const showTooltip = (): void => {
    ingredientCard.classList.add("ingredient-card--tooltip-visible");
    updateIngredientTooltipPosition(ingredientCard, tooltip);
  };
  const hideTooltipIfInactive = (): void => {
    const cardHasFocus = ingredientCard.contains(document.activeElement);

    if (!cardHasFocus && !ingredientCard.matches(":hover")) {
      ingredientCard.classList.remove("ingredient-card--tooltip-visible");
    }
  };

  ingredientCard.addEventListener("pointerenter", showTooltip);
  ingredientCard.addEventListener("focusin", showTooltip);
  ingredientCard.addEventListener("pointerleave", hideTooltipIfInactive);
  ingredientCard.addEventListener("focusout", hideTooltipIfInactive);
}

function updateIngredientTooltipPosition(
  ingredientCard: HTMLElement,
  tooltip: HTMLElement,
): void {
  ingredientCard.classList.remove(
    "ingredient-card--tooltip-left",
    "ingredient-card--tooltip-up",
  );

  const tooltipBounds = tooltip.getBoundingClientRect();

  if (tooltipBounds.right > window.innerWidth) {
    ingredientCard.classList.add("ingredient-card--tooltip-left");
  }

  if (tooltipBounds.bottom > window.innerHeight) {
    ingredientCard.classList.add("ingredient-card--tooltip-up");
  }
}
