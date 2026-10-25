import type { RecipeRange } from "../../data/recipes.ts";
import { DIFFICULTY_SETTINGS } from "../../data/difficulty-settings.ts";
import type { BrewResult, GameState } from "../../state/game-state.ts";
import { createElement } from "../shared/create-element.ts";
import { formatIngredientValue } from "../shared/format-ingredient-value.ts";

function renderRecipeRange(label: string, range: RecipeRange): HTMLDivElement {
  const rangeDetails = createElement("div", "recipe-panel__range");
  const rangeLabel = createElement("dt", "recipe-panel__label", label);
  const rangeValue = createElement(
    "dd",
    "recipe-panel__value",
    `${formatIngredientValue(range.minimum)} to ${formatIngredientValue(range.maximum)}`,
  );

  rangeDetails.append(rangeLabel, rangeValue);

  return rangeDetails;
}

function renderBrewResult(
  result: BrewResult | null,
): HTMLParagraphElement | null {
  if (result === null) {
    return null;
  }

  const message =
    result === "success"
      ? "Brew successful! A new recipe is ready."
      : "Brew failed. One life was lost.";
  const resultClassName = `recipe-panel__result recipe-panel__result--${result}`;

  return createElement("p", resultClassName, message);
}

export function renderRecipePanel(state: GameState): HTMLElement {
  const panel = createElement("section", "panel recipe-panel");
  const panelHeading = createElement("div", "recipe-panel__heading");
  const headingContent = createElement("div");
  const eyebrow = createElement("p", "recipe-panel__eyebrow", "Current recipe");
  const heading = createElement(
    "h2",
    "recipe-panel__name",
    state.activeRecipe.name,
  );
  const ingredientCount = state.cauldronIngredients.length;
  const maximumIngredients =
    DIFFICULTY_SETTINGS[state.difficulty].maxCauldronIngredients;
  const countClassName =
    ingredientCount >= maximumIngredients
      ? "recipe-panel__counter recipe-panel__counter--full"
      : "recipe-panel__counter";
  const counter = createElement(
    "p",
    countClassName,
    `Ingredients: ${ingredientCount} / ${maximumIngredients}`,
  );
  const ranges = createElement("dl", "recipe-panel__ranges");
  const actions = createElement("div", "recipe-panel__actions");
  const brewButton = createElement("button", "primary-button brew-button");
  const brewButtonLabel = createElement("span", undefined, "Brew");
  const brewButtonIcon = createElement("span", undefined, "↗");
  const pourOutButton = createElement("button", "pour-out-button", "Pour Out");
  const brewResult = renderBrewResult(state.lastBrewResult);

  panel.setAttribute("aria-labelledby", "recipe-panel-name");
  heading.id = "recipe-panel-name";
  brewButton.type = "button";
  brewButton.dataset.action = "brew";
  brewButton.disabled = ingredientCount === 0;
  pourOutButton.type = "button";
  pourOutButton.dataset.action = "pour-out";
  pourOutButton.disabled = ingredientCount === 0;
  brewButtonIcon.setAttribute("aria-hidden", "true");
  brewButton.append(brewButtonLabel, brewButtonIcon);
  headingContent.append(eyebrow, heading);
  panelHeading.append(headingContent, counter);
  ranges.append(
    renderRecipeRange("Temperature", state.activeRecipe.temperature),
    renderRecipeRange("Density", state.activeRecipe.density),
    renderRecipeRange("Magic Power", state.activeRecipe.magicPower),
  );
  actions.append(brewButton, pourOutButton);

  if (brewResult !== null) {
    actions.prepend(brewResult);
  }

  panel.append(panelHeading, ranges, actions);

  return panel;
}
