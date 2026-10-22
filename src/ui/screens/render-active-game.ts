import type { GameState } from "../../state/game-state.ts";
import { renderCauldron } from "../cauldron/render-cauldron.ts";
import { renderIngredientShelf } from "../ingredient-shelf/render-ingredient-shelf.ts";
import { renderRecipePanel } from "../recipe-panel/render-recipe-panel.ts";
import { renderGameStatus } from "../game-status/render-game-status.ts";
import { renderTopbar } from "../shared/render-layout.ts";
import { createElement } from "../shared/create-element.ts";

export function renderActiveGame(state: GameState): HTMLElement {
  const appShell = createElement("main", "app-shell");
  const gameIntro = createElement("section", "game-intro");
  const introContent = createElement("div");
  const eyebrowText = createElement(
    "p",
    "eyebrow",
    "Level 1 · First experiments",
  );
  const heading = createElement("h1", undefined, "Prepare your mixture");
  const description = createElement(
    "p",
    undefined,
    "Choose from the shelf. Each ingredient changes the nature of your brew.",
  );
  const gameLayout = createElement("div", "game-layout");

  gameIntro.setAttribute("aria-labelledby", "game-heading");
  heading.id = "game-heading";
  introContent.append(eyebrowText, heading, description);
  gameIntro.append(introContent, renderGameStatus(state));
  gameLayout.append(renderIngredientShelf(state), renderCauldron(state));
  appShell.append(
    renderTopbar(),
    gameIntro,
    renderRecipePanel(state),
    gameLayout,
  );

  return appShell;
}
