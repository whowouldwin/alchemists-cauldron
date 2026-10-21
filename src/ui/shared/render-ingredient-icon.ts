import type { Ingredient } from "../../data/ingredients.ts";
import { INGREDIENT_ICONS } from "./ui-assets.ts";

export function renderIngredientIcon(
  ingredient: Ingredient,
): HTMLImageElement | null {
  const iconPath = INGREDIENT_ICONS[ingredient.id];

  if (iconPath === undefined) {
    return null;
  }

  const icon = document.createElement("img");

  icon.className = "ingredient-icon";
  icon.src = iconPath;
  icon.alt = "";
  icon.setAttribute("aria-hidden", "true");

  return icon;
}
