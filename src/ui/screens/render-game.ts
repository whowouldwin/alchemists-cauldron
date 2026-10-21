import type { GameState } from "../../state/game-state.ts";
import { renderActiveGame } from "./render-active-game.ts";
import { renderStartScreen } from "./render-start-screen.ts";

export function renderGame(state: GameState | null): HTMLElement {
  return state === null ? renderStartScreen() : renderActiveGame(state);
}
