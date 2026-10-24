import { getIngredientsForDifficulty } from "../../data/ingredients.ts";
import { DIFFICULTY_SETTINGS } from "../../data/difficulty-settings.ts";
import type { GameState } from "../../state/game-state.ts";
import { createElement } from "../shared/create-element.ts";
import { renderIngredientCard } from "./render-ingredient-card.ts";

export function renderIngredientShelf(state: GameState): HTMLElement {
  const ingredients = getIngredientsForDifficulty(state.difficulty);
  const maximumIngredients =
    DIFFICULTY_SETTINGS[state.difficulty].maxCauldronIngredients;
  const cauldronIsFull = state.cauldronIngredients.length >= maximumIngredients;
  const shelfPanel = createElement("section", "panel shelf-panel");
  const panelHeading = createElement("div", "panel-heading");
  const headingContent = createElement("div");
  const eyebrowText = createElement("p", "eyebrow", "Your ingredients");
  const heading = createElement("h2", undefined, "Ingredient shelf");
  const itemCount = createElement(
    "span",
    "item-count",
    `${ingredients.length} types`,
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

  ingredients.forEach((ingredient) => {
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
