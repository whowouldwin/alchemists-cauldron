import {
  getRemainingSeconds,
  MILLISECONDS_PER_SECOND,
} from "../logic/timer.ts";
import type { GameOverReason, GameState } from "./game-state.ts";

export function getGameTimeRemaining(
  state: GameState,
  currentTime: number = Date.now(),
): number {
  if (state.remainingTimeAtPauseMs !== null) {
    return Math.ceil(state.remainingTimeAtPauseMs / MILLISECONDS_PER_SECOND);
  }

  return getRemainingSeconds(state.endTime, currentTime);
}

export function pauseGame(
  state: GameState,
  currentTime: number = Date.now(),
): GameState {
  if (state.gameOverReason !== null || state.remainingTimeAtPauseMs !== null) {
    return state;
  }

  const remainingTime = Math.max(0, state.endTime - currentTime);

  if (remainingTime === 0) {
    return state;
  }

  return { ...state, remainingTimeAtPauseMs: remainingTime };
}

export function resumeGame(
  state: GameState,
  currentTime: number = Date.now(),
): GameState {
  if (state.remainingTimeAtPauseMs === null) {
    return state;
  }

  return {
    ...state,
    endTime: currentTime + state.remainingTimeAtPauseMs,
    remainingTimeAtPauseMs: null,
  };
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
