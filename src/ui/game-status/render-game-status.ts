import { DIFFICULTY_SETTINGS } from "../../data/difficulty-settings.ts";
import type { GameState } from "../../state/game-state.ts";
import { getGameTimeRemaining } from "../../state/game-status.ts";
import { createElement } from "../shared/create-element.ts";
import { formatTimeRemaining } from "../shared/format-time-remaining.ts";
import { isTimerUrgent } from "../../logic/timer.ts";

export function renderGameStatus(state: GameState): HTMLElement {
  const status = createElement("section", "active-stats");
  const score = createStatusItem("Score", String(state.score));
  const time = createTimerStatusItem(
    getGameTimeRemaining(state),
    DIFFICULTY_SETTINGS[state.difficulty].startingTimeSeconds,
  );
  const lives = createStatusItem("Lives", String(state.lives));

  status.setAttribute("aria-label", "Game status");
  status.append(score, time, lives);

  return status;
}

function createTimerStatusItem(
  remainingSeconds: number,
  maximumSeconds: number,
): HTMLElement {
  const item = createElement("div", "active-stats__timer");
  const label = createElement("span", undefined, "Time");
  const value = createElement(
    "strong",
    undefined,
    formatTimeRemaining(remainingSeconds),
  );
  const progress = createElement("progress", "active-stats__timer-bar");

  item.dataset.timerStatus = "";
  value.setAttribute("data-time-remaining", "");
  progress.max = maximumSeconds;
  progress.value = remainingSeconds;
  progress.setAttribute("aria-label", "Time remaining");
  progress.setAttribute("data-time-remaining-bar", "");
  item.classList.toggle(
    "active-stats__timer--urgent",
    isTimerUrgent(remainingSeconds),
  );
  item.append(label, value, progress);

  return item;
}

function createStatusItem(label: string, value: string): HTMLElement {
  const item = createElement("div");
  const itemLabel = createElement("span", undefined, label);
  const itemValue = createElement("strong", undefined, value);

  item.append(itemLabel, itemValue);

  return item;
}
