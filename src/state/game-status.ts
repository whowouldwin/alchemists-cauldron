import { getRemainingSeconds } from "../logic/timer.ts";
import type { GameOverReason, GameState } from "./game-state.ts";

export function getGameTimeRemaining(
  state: GameState,
  currentTime: number = Date.now(),
): number {
  return getRemainingSeconds(state.endTime, currentTime);
}

export function getGameOverReason(
  state: GameState,
  currentTime: number = Date.now(),
): GameOverReason | null {
  if (getGameTimeRemaining(state, currentTime) === 0) {
    return "time";
  }

  if (state.lives === 0) {
    return "lives";
  }

  const shelfIsEmpty = Object.values(state.shelfStock).every(
    (stock) => stock === 0,
  );
  const cauldronIsEmpty = state.cauldronIngredients.length === 0;

  if (shelfIsEmpty && cauldronIsEmpty) {
    return "out-of-ingredients";
  }

  return null;
}

export function finishGame(
  state: GameState,
  reason: GameOverReason,
): GameState {
  return { ...state, gameOverReason: reason };
}
