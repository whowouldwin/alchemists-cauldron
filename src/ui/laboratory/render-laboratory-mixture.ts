import { DIFFICULTY_SETTINGS } from "../../data/difficulty-settings.ts";
import type { LaboratoryState } from "../../laboratory/laboratory-state.ts";
import type { LaboratoryResult } from "../../laboratory/laboratory-result.ts";
import { createElement } from "../shared/create-element.ts";
import { renderParameterBars } from "../parameter-bars/render-parameter-bars.ts";
import { getLaboratoryStatusMessage } from "./laboratory-status.ts";
import { renderReactionTrace } from "./render-reaction-trace.ts";

export function renderLaboratoryMixture(
  state: LaboratoryState,
  result: LaboratoryResult,
  calculationIsOpen: boolean,
  experimentActions: HTMLElement,
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
  status.classList.toggle(
    "laboratory-mixture__status--explosion",
    result.hasExplosion,
  );
  panel.append(headingRow);

  if (state.ingredients.length > 0) {
    panel.append(list);
  }

  panel.append(
    status,
    experimentActions,
    renderParameterBars(
      result.trace.values,
      result.targetRanges,
      state.recipe.difficulty,
    ),
    renderReactionTrace(result.trace, calculationIsOpen),
  );

  return panel;
}
