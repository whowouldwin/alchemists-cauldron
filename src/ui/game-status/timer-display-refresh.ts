import {
  getGameTimeRemaining,
  type GameState,
} from "../../state/game-state.ts";
import { formatTimeRemaining } from "../shared/format-time-remaining.ts";

const TIMER_REFRESH_INTERVAL_MS = 1000;

export function createTimerDisplayRefresh(
  applicationRoot: HTMLElement,
  getGameState: () => GameState | null,
): { start: () => void; stop: () => void } {
  let intervalId: number | null = null;

  function refresh(): void {
    const state = getGameState();

    if (state === null) {
      return;
    }

    const timerDisplay = applicationRoot.querySelector<HTMLElement>(
      "[data-time-remaining]",
    );

    if (timerDisplay === null) {
      return;
    }

    timerDisplay.textContent = formatTimeRemaining(getGameTimeRemaining(state));
  }

  function stop(): void {
    if (intervalId === null) {
      return;
    }

    window.clearInterval(intervalId);
    intervalId = null;
  }

  function start(): void {
    stop();
    intervalId = window.setInterval(refresh, TIMER_REFRESH_INTERVAL_MS);
  }

  return { start, stop };
}
