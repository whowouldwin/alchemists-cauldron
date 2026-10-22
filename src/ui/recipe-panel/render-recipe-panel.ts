import type { RecipeRange } from "../../data/recipes.ts";
import type { GameState } from "../../state/game-state.ts";
import { MAX_CAULDRON_INGREDIENTS } from "../../state/game-state.ts";
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
  const countClassName =
    ingredientCount >= MAX_CAULDRON_INGREDIENTS
      ? "recipe-panel__counter recipe-panel__counter--full"
      : "recipe-panel__counter";
  const counter = createElement(
    "p",
    countClassName,
    `Ingredients: ${ingredientCount} / ${MAX_CAULDRON_INGREDIENTS}`,
  );
  const ranges = createElement("dl", "recipe-panel__ranges");

  panel.setAttribute("aria-labelledby", "recipe-panel-name");
  heading.id = "recipe-panel-name";
  headingContent.append(eyebrow, heading);
  panelHeading.append(headingContent, counter);
  ranges.append(
    renderRecipeRange("Temperature", state.activeRecipe.temperature),
    renderRecipeRange("Density", state.activeRecipe.density),
    renderRecipeRange("Magic Power", state.activeRecipe.magicPower),
  );
  panel.append(panelHeading, ranges);

  return panel;
}
