import type { LaboratoryState } from "../../laboratory/laboratory-state.ts";
import type { LaboratoryResult } from "../../laboratory/laboratory-result.ts";
import { createElement } from "../shared/create-element.ts";
import { renderTopbar } from "../shared/render-layout.ts";
import { renderLaboratoryRecipeSelector } from "./render-laboratory-recipe-selector.ts";
import { renderLaboratoryShelf } from "./render-laboratory-shelf.ts";
import { renderLaboratoryMixture } from "./render-laboratory-mixture.ts";
import { renderLaboratoryReactions } from "./render-laboratory-reactions.ts";

interface LaboratoryViewOptions {
  readonly calculationIsOpen: boolean;
  readonly experimentActions: HTMLElement;
  readonly savedExperiments: HTMLElement;
}

export function renderLaboratory(
  state: LaboratoryState,
  result: LaboratoryResult,
  options: LaboratoryViewOptions,
): HTMLElement {
  const screen = createElement("main", "app-shell laboratory-screen");
  const topbar = renderTopbar();
  const backButton = createElement(
    "button",
    "leaderboard-link",
    "Back to menu",
  );
  const headingRow = createElement("div", "laboratory-heading");
  const introduction = createElement("div");
  const heading = createElement("h1", undefined, "Practice laboratory");
  const description = createElement(
    "p",
    "laboratory-description",
    "Unlimited portions. No timer or lives. Choose reactions and explore how they change your mixture.",
  );
  const workspace = createElement("div", "laboratory-layout");
  const ingredientsAndReactions = createElement("div", "laboratory-tools");

  backButton.type = "button";
  backButton.dataset.action = "close-laboratory";
  topbar.append(backButton);
  introduction.append(heading, description);
  headingRow.append(introduction, renderLaboratoryRecipeSelector(state.recipe));
  ingredientsAndReactions.append(
    renderLaboratoryShelf(state),
    renderLaboratoryReactions(state, result),
  );
  workspace.append(
    ingredientsAndReactions,
    renderLaboratoryMixture(
      state,
      result,
      options.calculationIsOpen,
      options.experimentActions,
    ),
  );
  screen.append(topbar, headingRow, options.savedExperiments, workspace);

  return screen;
}
