import type { GameState } from "../../state/game-state.ts";
import { resolveCauldronReactions } from "../../logic/reactions/reaction-engine.ts";
import { renderCauldron } from "../cauldron/render-cauldron.ts";
import { renderIngredientShelf } from "../ingredient-shelf/render-ingredient-shelf.ts";
import {
  renderParameterBars,
  type CauldronTargetRanges,
} from "../parameter-bars/render-parameter-bars.ts";
import { renderRecipePanel } from "../recipe-panel/render-recipe-panel.ts";
import { renderGameStatus } from "../game-status/render-game-status.ts";
import { renderTopbar } from "../shared/render-layout.ts";
import { createElement } from "../shared/create-element.ts";
import { renderPauseDialog } from "./render-pause-dialog.ts";

export function renderActiveGame(state: GameState): HTMLElement {
  const isPaused = state.remainingTimeAtPauseMs !== null;
  const appShell = createElement(
    "main",
    isPaused ? "app-shell app-shell--paused" : "app-shell",
  );
  const gameContent = createElement("div", "game-content");
  const topbar = renderTopbar();
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
  const cauldronValues = resolveCauldronReactions(
    state.cauldronIngredients,
    state.difficulty,
  ).values;
  const targetRanges: CauldronTargetRanges = {
    temperature: state.activeRecipe.temperature,
    density: state.activeRecipe.density,
    magicPower: state.activeRecipe.magicPower,
  };

  if (isPaused) {
    gameContent.inert = true;
    gameContent.setAttribute("aria-hidden", "true");
  }

  topbar.append(createPauseButton(isPaused));

  gameIntro.setAttribute("aria-labelledby", "game-heading");
  heading.id = "game-heading";
  introContent.append(eyebrowText, heading, description);
  gameIntro.append(introContent, renderGameStatus(state));
  gameLayout.append(renderIngredientShelf(state), renderCauldron(state));
  gameContent.append(
    topbar,
    gameIntro,
    renderRecipePanel(state),
    gameLayout,
    renderParameterBars(cauldronValues, targetRanges, state.difficulty),
  );
  appShell.append(gameContent);

  if (isPaused) {
    appShell.append(renderPauseDialog());
  }

  return appShell;
}

function createPauseButton(isPaused: boolean): HTMLButtonElement {
  const button = createElement("button", "pause-button", "Pause");

  button.type = "button";
  button.dataset.action = "pause-game";
  button.disabled = isPaused;

  return button;
}
