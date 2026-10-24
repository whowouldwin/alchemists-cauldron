import type { GameState } from "../../state/game-state.ts";
import { renderActiveGame } from "./render-active-game.ts";
import { renderGameOver } from "./render-game-over.ts";
import { renderStartScreen } from "./render-start-screen.ts";

export function renderGame(state: GameState | null): HTMLElement {
  if (state === null) {
    return renderStartScreen();
  }

  if (state.gameOverReason !== null) {
    return renderGameOver(state, state.gameOverReason);
  }

  return renderActiveGame(state);
}
