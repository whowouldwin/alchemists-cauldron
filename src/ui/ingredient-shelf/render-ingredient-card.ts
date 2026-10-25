import type { Ingredient } from "../../data/ingredients.ts";
import { formatIngredientValue } from "../shared/format-ingredient-value.ts";
import { renderIngredientIcon } from "../shared/render-ingredient-icon.ts";
import { createElement } from "../shared/create-element.ts";
import { renderIngredientStats } from "./render-ingredient-stats.ts";

export function renderIngredientCard(
  ingredient: Ingredient,
  stock: number,
  cauldronIsFull: boolean,
): HTMLButtonElement {
  const isDepleted = stock === 0;
  const isDisabled = isDepleted || cauldronIsFull;
  const ingredientCard = createElement("button", "ingredient-card");
  const cardTop = createElement("span", "ingredient-card__top");
  const iconWrap = createElement("span", "ingredient-card__icon-wrap");
  const stockBadge = createElement("span", "stock-badge", String(stock));
  const ingredientName = createElement(
    "span",
    "ingredient-card__name",
    ingredient.name,
  );
  const ingredientIcon = isDepleted ? null : renderIngredientIcon(ingredient);

  ingredientCard.type = "button";
  ingredientCard.draggable = !isDisabled;
  ingredientCard.dataset.ingredientId = ingredient.id;
  ingredientCard.disabled = isDisabled;
  ingredientCard.setAttribute(
    "aria-label",
    isDepleted
      ? `${ingredient.name}. Depleted.`
      : `Add ${ingredient.name}. Stock: ${stock}. Temperature ${formatIngredientValue(ingredient.temperature)}, density ${formatIngredientValue(ingredient.density)}, magic power ${formatIngredientValue(ingredient.magicPower)}.`,
  );

  if (isDepleted) {
    ingredientCard.classList.add("is-depleted");
  }

  if (ingredientIcon !== null) {
    iconWrap.append(ingredientIcon);
  }

  stockBadge.setAttribute("aria-label", `${stock} portions left`);
  cardTop.append(iconWrap, stockBadge);
  ingredientCard.append(cardTop);

  if (isDepleted) {
    ingredientCard.append(
      createElement("span", "ingredient-card__status", "Depleted"),
    );
  } else {
    ingredientCard.append(ingredientName, renderIngredientStats(ingredient));
  }

  return ingredientCard;
}
