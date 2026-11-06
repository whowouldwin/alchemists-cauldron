import {
  getIngredientsForDifficulty,
  type Ingredient,
} from "../../data/ingredients.ts";
import {
  isLaboratoryFull,
  type LaboratoryState,
} from "../../laboratory/laboratory-state.ts";
import { createElement } from "../shared/create-element.ts";
import { formatIngredientValue } from "../shared/format-ingredient-value.ts";
import { renderIngredientIcon } from "../shared/render-ingredient-icon.ts";

export function renderLaboratoryShelf(state: LaboratoryState): HTMLElement {
  const shelf = createElement("section", "laboratory-panel");
  const heading = createElement("h2", undefined, "Ingredients");
  const hint = createElement(
    "p",
    "laboratory-description",
    "Select an ingredient to add one portion.",
  );
  const cards = createElement("div", "laboratory-shelf");
  const isFull = isLaboratoryFull(state);

  heading.id = "laboratory-shelf-heading";
  shelf.setAttribute("aria-labelledby", heading.id);

  for (const ingredient of getIngredientsForDifficulty(
    state.recipe.difficulty,
  )) {
    cards.append(renderLaboratoryIngredient(ingredient, isFull));
  }

  shelf.append(heading, hint, cards);

  return shelf;
}

function renderLaboratoryIngredient(
  ingredient: Ingredient,
  isFull: boolean,
): HTMLButtonElement {
  const button = createElement("button", "laboratory-ingredient");
  const icon = renderIngredientIcon(ingredient);
  const name = createElement(
    "span",
    "laboratory-ingredient__name",
    ingredient.name,
  );
  const stats = createElement("span", "laboratory-ingredient__stats");
  const temperature = formatIngredientValue(ingredient.temperature);
  const density = formatIngredientValue(ingredient.density);
  const magicPower = formatIngredientValue(ingredient.magicPower);

  button.type = "button";
  button.dataset.action = "add-laboratory-ingredient";
  button.dataset.laboratoryIngredientId = ingredient.id;
  button.disabled = isFull;
  button.setAttribute(
    "aria-label",
    `Add ${ingredient.name}. Temperature ${temperature}, Density ${density}, Magic Power ${magicPower}.`,
  );

  if (icon !== null) {
    icon.draggable = false;
    button.append(icon);
  }

  stats.append(
    createElement("span", undefined, `Temp ${temperature}`),
    createElement("span", undefined, `Density ${density}`),
    createElement("span", undefined, `Magic ${magicPower}`),
  );
  button.append(name, stats);

  return button;
}
