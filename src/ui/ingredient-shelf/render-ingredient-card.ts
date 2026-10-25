import type { Ingredient } from "../../data/ingredients.ts";
import { createElement } from "../shared/create-element.ts";
import { renderIngredientIcon } from "../shared/render-ingredient-icon.ts";
import { createIngredientCardLabel } from "./ingredient-card-label.ts";
import { renderIngredientStats } from "./render-ingredient-stats.ts";
import {
  attachIngredientTooltipInteractions,
  renderIngredientTooltip,
} from "./render-ingredient-tooltip.ts";

export function renderIngredientCard(
  ingredient: Ingredient,
  stock: number,
  cauldronIsFull: boolean,
  showTooltip = false,
): HTMLButtonElement {
  const isDepleted = stock === 0;
  const isDisabled = isDepleted || cauldronIsFull;
  const card = createIngredientCardButton(
    ingredient,
    stock,
    isDisabled,
    showTooltip,
  );

  card.append(renderIngredientCardTop(ingredient, stock));

  if (isDepleted) {
    card.append(createElement("span", "ingredient-card__status", "Depleted"));
    return card;
  }

  card.append(createElement("span", "ingredient-card__name", ingredient.name));
  appendIngredientDetails(card, ingredient, showTooltip);

  return card;
}

function createIngredientCardButton(
  ingredient: Ingredient,
  stock: number,
  isDisabled: boolean,
  showTooltip: boolean,
): HTMLButtonElement {
  const card = createElement("button", "ingredient-card");

  card.type = "button";
  card.draggable = !isDisabled;
  card.dataset.ingredientId = ingredient.id;
  card.disabled = isDisabled;
  card.setAttribute(
    "aria-label",
    createIngredientCardLabel(ingredient, stock, showTooltip),
  );

  if (stock === 0) {
    card.classList.add("is-depleted");
  }

  return card;
}

function renderIngredientCardTop(
  ingredient: Ingredient,
  stock: number,
): HTMLElement {
  const cardTop = createElement("span", "ingredient-card__top");
  const iconWrap = createElement("span", "ingredient-card__icon-wrap");
  const stockBadge = createElement("span", "stock-badge", String(stock));

  if (stock !== 0) {
    const icon = renderIngredientIcon(ingredient);

    if (icon !== null) {
      iconWrap.append(icon);
    }
  }

  stockBadge.setAttribute("aria-label", `${stock} portions left`);
  cardTop.append(iconWrap, stockBadge);

  return cardTop;
}

function appendIngredientDetails(
  card: HTMLButtonElement,
  ingredient: Ingredient,
  showTooltip: boolean,
): void {
  if (!showTooltip) {
    card.append(renderIngredientStats(ingredient));
    return;
  }

  const tooltip = renderIngredientTooltip(ingredient);

  tooltip.id = `ingredient-tooltip-${ingredient.id}`;
  card.setAttribute("aria-describedby", tooltip.id);
  card.append(tooltip);
  attachIngredientTooltipInteractions(card, tooltip);
}
