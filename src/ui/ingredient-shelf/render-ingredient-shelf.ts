import { LEVEL_ONE_INGREDIENTS } from "../../data/ingredients.ts";
import type { GameState } from "../../state/game-state.ts";
import { MAX_CAULDRON_INGREDIENTS } from "../../state/game-state.ts";
import { createElement } from "../shared/create-element.ts";
import { renderIngredientCard } from "./render-ingredient-card.ts";

export function renderIngredientShelf(state: GameState): HTMLElement {
  const cauldronIsFull =
    state.cauldronIngredients.length >= MAX_CAULDRON_INGREDIENTS;
  const shelfPanel = createElement("section", "panel shelf-panel");
  const panelHeading = createElement("div", "panel-heading");
  const headingContent = createElement("div");
  const eyebrowText = createElement("p", "eyebrow", "Your ingredients");
  const heading = createElement("h2", undefined, "Ingredient shelf");
  const itemCount = createElement(
    "span",
    "item-count",
    `${LEVEL_ONE_INGREDIENTS.length} types`,
  );
  const panelNote = createElement(
    "p",
    cauldronIsFull ? "panel-note panel-note--warning" : "panel-note",
    cauldronIsFull
      ? "The cauldron is full."
      : "Choose an ingredient to add it to the cauldron.",
  );
  const shelfGrid = createElement("div", "shelf-grid");

  shelfPanel.setAttribute("aria-labelledby", "shelf-heading");
  heading.id = "shelf-heading";
  headingContent.append(eyebrowText, heading);
  panelHeading.append(headingContent, itemCount);

  if (cauldronIsFull) {
    panelNote.setAttribute("role", "status");
  }

  LEVEL_ONE_INGREDIENTS.forEach((ingredient) => {
    shelfGrid.append(
      renderIngredientCard(
        ingredient,
        state.shelfStock[ingredient.id] ?? 0,
        cauldronIsFull,
      ),
    );
  });

  shelfPanel.append(panelHeading, panelNote, shelfGrid);

  return shelfPanel;
}
