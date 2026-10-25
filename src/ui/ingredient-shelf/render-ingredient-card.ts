import type { Ingredient } from "../../data/ingredients.ts";
import { formatIngredientValue } from "../shared/format-ingredient-value.ts";
import { renderIngredientIcon } from "../shared/render-ingredient-icon.ts";
import { createElement } from "../shared/create-element.ts";
import { renderIngredientStats } from "./render-ingredient-stats.ts";
import {
  renderIngredientTooltip,
  updateIngredientTooltipPosition,
} from "./render-ingredient-tooltip.ts";

export function renderIngredientCard(
  ingredient: Ingredient,
  stock: number,
  cauldronIsFull: boolean,
  showTooltip = false,
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
  const ingredientTooltip =
    showTooltip && !isDepleted ? renderIngredientTooltip(ingredient) : null;
  const ariaLabel = createIngredientCardLabel(
    ingredient,
    stock,
    isDepleted,
    showTooltip,
  );

  ingredientCard.type = "button";
  ingredientCard.draggable = !isDisabled;
  ingredientCard.dataset.ingredientId = ingredient.id;
  ingredientCard.disabled = isDisabled;
  ingredientCard.setAttribute("aria-label", ariaLabel);

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
    ingredientCard.append(ingredientName);

    if (ingredientTooltip === null) {
      ingredientCard.append(renderIngredientStats(ingredient));
    } else {
      ingredientTooltip.id = `ingredient-tooltip-${ingredient.id}`;
      ingredientCard.setAttribute("aria-describedby", ingredientTooltip.id);
      ingredientCard.append(ingredientTooltip);
      addTooltipInteractions(ingredientCard, ingredientTooltip);
    }
  }

  return ingredientCard;
}

function createIngredientCardLabel(
  ingredient: Ingredient,
  stock: number,
  isDepleted: boolean,
  showTooltip: boolean,
): string {
  if (isDepleted) {
    return `${ingredient.name}. Depleted.`;
  }

  const stockDescription = `Add ${ingredient.name}. Stock: ${stock}.`;

  if (showTooltip) {
    return stockDescription;
  }

  return `${stockDescription} Temperature ${formatIngredientValue(ingredient.temperature)}, density ${formatIngredientValue(ingredient.density)}, magic power ${formatIngredientValue(ingredient.magicPower)}.`;
}

function addTooltipInteractions(
  ingredientCard: HTMLButtonElement,
  ingredientTooltip: HTMLElement,
): void {
  const showTooltip = (): void => {
    ingredientCard.classList.add("ingredient-card--tooltip-visible");
    updateIngredientTooltipPosition(ingredientCard, ingredientTooltip);
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
