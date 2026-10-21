import type { Ingredient } from "../../data/ingredients.ts";
import type { GameState } from "../../state/game-state.ts";
import { MAX_CAULDRON_INGREDIENTS } from "../../state/game-state.ts";
import { createElement } from "../shared/create-element.ts";
import { formatIngredientValue } from "../shared/format-ingredient-value.ts";
import { renderIngredientIcon } from "../shared/render-ingredient-icon.ts";
import { CAULDRON_ICON } from "../shared/ui-assets.ts";

function renderAddedIngredient(
  ingredient: Ingredient,
  index: number,
): HTMLLIElement {
  const values = [
    ingredient.temperature,
    ingredient.density,
    ingredient.magicPower,
  ]
    .map(formatIngredientValue)
    .join(" · ");

  const listItem = createElement("li", "cauldron-ingredient");
  const ingredientNumber = createElement(
    "span",
    "cauldron-ingredient__number",
    String(index + 1),
  );
  const ingredientIcon = renderIngredientIcon(ingredient);
  const ingredientName = createElement(
    "span",
    "cauldron-ingredient__name",
    ingredient.name,
  );
  const ingredientValues = createElement(
    "span",
    "cauldron-ingredient__values",
    values,
  );

  listItem.append(ingredientNumber);

  if (ingredientIcon !== null) {
    listItem.append(ingredientIcon);
  }

  listItem.append(ingredientName, ingredientValues);

  return listItem;
}

function renderContents(state: GameState): HTMLElement {
  if (state.cauldronIngredients.length === 0) {
    return createElement(
      "p",
      "empty-cauldron",
      "Your mixture is waiting for its first ingredient.",
    );
  }

  const ingredientsList = createElement("ol", "cauldron-list");
  state.cauldronIngredients.forEach((ingredient, index) => {
    ingredientsList.append(renderAddedIngredient(ingredient, index));
  });

  return ingredientsList;
}

export function renderCauldron(state: GameState): HTMLElement {
  const isFull = state.cauldronIngredients.length >= MAX_CAULDRON_INGREDIENTS;
  const panel = createElement("section", "panel cauldron-panel");
  const panelHeading = createElement("div", "panel-heading");
  const headingContent = createElement("div");
  const eyebrowText = createElement("p", "eyebrow", "The mixing vessel");
  const heading = createElement("h2", undefined, "Cauldron");
  const itemCount = createElement(
    "span",
    isFull ? "item-count item-count--full" : "item-count",
    `${state.cauldronIngredients.length} / ${MAX_CAULDRON_INGREDIENTS}`,
  );
  const cauldronArtWrap = createElement("div", "cauldron-art-wrap");
  const cauldronImage = createElement("img", "cauldron-art");
  const cauldronFooter = createElement("div", "cauldron-footer");
  const orderNote = createElement(
    "span",
    undefined,
    "Ingredients are listed in the order added.",
  );
  const maximumNote = createElement(
    "span",
    undefined,
    `Maximum ${MAX_CAULDRON_INGREDIENTS}`,
  );

  panel.setAttribute("aria-labelledby", "cauldron-heading");
  heading.id = "cauldron-heading";
  headingContent.append(eyebrowText, heading);
  panelHeading.append(headingContent, itemCount);

  cauldronImage.src = CAULDRON_ICON;
  cauldronImage.alt = "";
  cauldronImage.setAttribute("aria-hidden", "true");
  cauldronArtWrap.append(cauldronImage);

  cauldronFooter.append(orderNote, maximumNote);
  panel.append(
    panelHeading,
    cauldronArtWrap,
    renderContents(state),
    cauldronFooter,
  );

  return panel;
}
