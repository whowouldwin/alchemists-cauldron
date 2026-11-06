import type { LaboratoryState } from "../../laboratory/laboratory-state.ts";
import type { LaboratoryResult } from "../../laboratory/laboratory-result.ts";
import { createElement } from "../shared/create-element.ts";
import { renderTopbar } from "../shared/render-layout.ts";
import { renderLaboratoryRecipeSelector } from "./render-laboratory-recipe-selector.ts";
import { renderLaboratoryShelf } from "./render-laboratory-shelf.ts";
import { renderLaboratoryMixture } from "./render-laboratory-mixture.ts";

export function renderLaboratory(
  state: LaboratoryState,
  result: LaboratoryResult,
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
    "Unlimited portions. No timer or lives. Practice base mixtures with reactions off.",
  );
  const workspace = createElement("div", "laboratory-layout");

  backButton.type = "button";
  backButton.dataset.action = "close-laboratory";
  topbar.append(backButton);
  introduction.append(heading, description);
  headingRow.append(introduction, renderLaboratoryRecipeSelector(state.recipe));
  workspace.append(
    renderLaboratoryShelf(state),
    renderLaboratoryMixture(state, result),
  );
  screen.append(topbar, headingRow, workspace);

  return screen;
}
