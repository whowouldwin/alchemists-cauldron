import { DIFFICULTY_SETTINGS } from "../../data/difficulty-settings.ts";
import {
  isLaboratoryFull,
  type LaboratoryState,
} from "../../laboratory/laboratory-state.ts";
import type { LaboratoryResult } from "../../laboratory/laboratory-result.ts";
import { createElement } from "../shared/create-element.ts";
import { renderParameterBars } from "../parameter-bars/render-parameter-bars.ts";

export function getLaboratoryStatusMessage(
  state: LaboratoryState,
  result: LaboratoryResult,
): string {
  if (state.ingredients.length === 0) {
    return "Add ingredients to start your experiment.";
  }

  if (result.matchesRecipe) {
    return `Your mixture matches ${state.recipe.name}.`;
  }

  if (isLaboratoryFull(state)) {
    return "The mixture is full and does not match yet. Clear it to try another combination.";
  }

  return "Keep experimenting: bring all three values into their target ranges.";
}

export function renderLaboratoryMixture(
  state: LaboratoryState,
  result: LaboratoryResult,
): HTMLElement {
  const panel = createElement("section", "laboratory-panel laboratory-mixture");
  const headingRow = createElement("div", "laboratory-mixture__heading");
  const heading = createElement("h2", undefined, "Your mixture");
  const maximumIngredients =
    DIFFICULTY_SETTINGS[state.recipe.difficulty].maxCauldronIngredients;
  const count = createElement(
    "span",
    "laboratory-mixture__count",
    `${state.ingredients.length} / ${maximumIngredients}`,
  );
  const clearButton = createElement(
    "button",
    "leaderboard-link",
    "Clear mixture",
  );
  const list = createElement("ol", "laboratory-mixture__ingredients");
  const status = createElement(
    "p",
    "laboratory-mixture__status",
    getLaboratoryStatusMessage(state, result),
  );

  heading.id = "laboratory-mixture-heading";
  panel.setAttribute("aria-labelledby", heading.id);
  count.setAttribute(
    "aria-label",
    `${state.ingredients.length} of ${maximumIngredients} ingredient slots used`,
  );
  clearButton.type = "button";
  clearButton.dataset.action = "clear-laboratory-mixture";
  clearButton.disabled = state.ingredients.length === 0;
  headingRow.append(heading, count, clearButton);

  for (const ingredient of state.ingredients) {
    list.append(createElement("li", undefined, ingredient.name));
  }

  status.classList.toggle(
    "laboratory-mixture__status--match",
    result.matchesRecipe,
  );
  panel.append(headingRow);

  if (state.ingredients.length > 0) {
    panel.append(list);
  }

  panel.append(
    status,
    renderParameterBars(
      result.values,
      result.targetRanges,
      state.recipe.difficulty,
    ),
  );

  return panel;
}
