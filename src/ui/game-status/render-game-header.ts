import type { GameState } from "../../state/game-state.ts";
import { createElement } from "../shared/create-element.ts";
import { renderBrand } from "../shared/render-layout.ts";
import { renderGameStatus } from "./render-game-status.ts";

export function renderGameHeader(state: GameState): HTMLElement {
  const header = createElement("header", "game-header");
  const identity = createElement("div", "game-header__identity");
  const heading = createElement("h1", "visually-hidden", "Alchemy workbench");
  const difficulty = createElement(
    "span",
    "game-header__difficulty",
    `${state.difficulty} difficulty`,
  );
  const controls = createElement("div", "game-header__controls");
  const pauseButton = createElement("button", "pause-button", "Pause");

  pauseButton.type = "button";
  pauseButton.dataset.action = "pause-game";
  pauseButton.disabled = state.remainingTimeAtPauseMs !== null;
  identity.append(heading, renderBrand(), difficulty);
  controls.append(renderGameStatus(state), pauseButton);
  header.append(identity, controls);

  return header;
}
