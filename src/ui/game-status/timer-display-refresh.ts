import type { GameState } from "../../state/game-state.ts";
import { getGameTimeRemaining } from "../../state/game-status.ts";
import { isTimerUrgent } from "../../logic/timer.ts";
import { formatTimeRemaining } from "../shared/format-time-remaining.ts";

const TIMER_REFRESH_INTERVAL_MS = 1000;

export function createTimerDisplayRefresh(
  applicationRoot: HTMLElement,
  getGameState: () => GameState | null,
  onTimeExpired: () => void,
): { start: () => void; stop: () => void } {
  let intervalId: number | null = null;

  function refresh(): void {
    const state = getGameState();

    if (state === null) {
      return;
    }

    const timerStatus = applicationRoot.querySelector<HTMLElement>(
      "[data-timer-status]",
    );
    const timerDisplay = applicationRoot.querySelector<HTMLElement>(
      "[data-time-remaining]",
    );
    const timerProgress = applicationRoot.querySelector<HTMLProgressElement>(
      "[data-time-remaining-bar]",
    );

    if (
      timerStatus === null ||
      timerDisplay === null ||
      timerProgress === null
    ) {
      return;
    }

    const remainingSeconds = getGameTimeRemaining(state);

    if (remainingSeconds === 0) {
      onTimeExpired();
      return;
    }

    timerDisplay.textContent = formatTimeRemaining(remainingSeconds);
    timerProgress.value = remainingSeconds;
    timerStatus.classList.toggle(
      "active-stats__timer--urgent",
      isTimerUrgent(remainingSeconds),
    );
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
