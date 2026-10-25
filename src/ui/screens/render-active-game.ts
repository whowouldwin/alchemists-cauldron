import type { GameState } from "../../state/game-state.ts";
import { renderCauldron } from "../cauldron/render-cauldron.ts";
import { renderIngredientShelf } from "../ingredient-shelf/render-ingredient-shelf.ts";
import { renderRecipePanel } from "../recipe-panel/render-recipe-panel.ts";
import { renderGameHeader } from "../game-status/render-game-header.ts";
import { createElement } from "../shared/create-element.ts";
import { renderPauseDialog } from "./render-pause-dialog.ts";

export function renderActiveGame(state: GameState): HTMLElement {
  const isPaused = state.remainingTimeAtPauseMs !== null;
  const appShell = createElement("main", "app-shell app-shell--playing");
  const gameContentClassName =
    state.lastBrewResult === "failure"
      ? "game-content game-content--brew-failure"
      : "game-content";
  const gameContent = createElement("div", gameContentClassName);
  const gameLayout = createElement("div", "game-layout");

  if (isPaused) {
    appShell.classList.add("app-shell--paused");
    gameContent.inert = true;
    gameContent.setAttribute("aria-hidden", "true");
  }

  gameLayout.append(
    renderRecipePanel(state),
    renderIngredientShelf(state),
    renderCauldron(state),
  );
  gameContent.append(renderGameHeader(state), gameLayout);
  appShell.append(gameContent);

  if (isPaused) {
    appShell.append(renderPauseDialog());
  }

  return appShell;
}
