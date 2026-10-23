import {
  getGameTimeRemaining,
  type GameState,
} from "../../state/game-state.ts";
import { createElement } from "../shared/create-element.ts";
import { formatTimeRemaining } from "../shared/format-time-remaining.ts";

export function renderGameStatus(state: GameState): HTMLElement {
  const status = createElement("section", "active-stats");
  const score = createStatusItem("Score", String(state.score));
  const time = createStatusItem(
    "Time",
    formatTimeRemaining(getGameTimeRemaining(state)),
  );
  const lives = createStatusItem("Lives", String(state.lives));

  time.querySelector("strong")?.setAttribute("data-time-remaining", "");
  status.setAttribute("aria-label", "Game status");
  status.append(score, time, lives);

  return status;
}

function createStatusItem(label: string, value: string): HTMLElement {
  const item = createElement("div");
  const itemLabel = createElement("span", undefined, label);
  const itemValue = createElement("strong", undefined, value);

  item.append(itemLabel, itemValue);

  return item;
}
