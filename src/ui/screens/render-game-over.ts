import type { GameOverReason, GameState } from "../../state/game-state.ts";
import { createElement } from "../shared/create-element.ts";
import {
  renderLeaderboardButton,
  renderTopbar,
} from "../shared/render-layout.ts";

const GAME_OVER_CONTENT: Record<
  GameOverReason,
  { readonly title: string; readonly message: string }
> = {
  time: {
    title: "Time is up",
    message: "The last grains of time slipped away.",
  },
  lives: {
    title: "No lives left",
    message: "The last brew used your final life.",
  },
  "out-of-ingredients": {
    title: "Out of ingredients",
    message: "The shelf is empty and the cauldron has been cleared.",
  },
};

export function renderGameOver(
  state: GameState,
  reason: GameOverReason,
  showLeaderboardNameEntry: boolean,
): HTMLElement {
  const appShell = createElement("main", "app-shell");
  const panel = createElement("section", "game-over-panel");
  const eyebrow = createElement("p", "eyebrow", "Experiment complete");
  const heading = createElement(
    "h1",
    undefined,
    GAME_OVER_CONTENT[reason].title,
  );
  const message = createElement(
    "p",
    undefined,
    GAME_OVER_CONTENT[reason].message,
  );
  const finalScore = createElement("p", "game-over-score");
  const scoreLabel = createElement("span", undefined, "Final score");
  const scoreValue = createElement("strong", undefined, String(state.score));
  const playAgainButton = createElement("button", "primary-button");
  const buttonLabel = createElement("span", undefined, "Play again");
  const buttonIcon = createElement("span", undefined, "↗");
  const scoreEntryForm = showLeaderboardNameEntry
    ? createLeaderboardNameForm()
    : null;

  panel.setAttribute("aria-labelledby", "game-over-heading");
  heading.id = "game-over-heading";
  playAgainButton.type = "button";
  playAgainButton.dataset.action = "start-game";
  buttonIcon.setAttribute("aria-hidden", "true");
  playAgainButton.append(buttonLabel, buttonIcon);
  finalScore.append(scoreLabel, scoreValue);
  panel.append(eyebrow, heading, message, finalScore);

  if (scoreEntryForm !== null) {
    panel.append(scoreEntryForm);
  }

  panel.append(playAgainButton);

  const topbar = renderTopbar("A little magic lab");
  topbar.append(renderLeaderboardButton());
  appShell.append(topbar, panel);

  return appShell;
}

function createLeaderboardNameForm(): HTMLFormElement {
  const form = createElement("form", "leaderboard-entry-form");
  const label = createElement(
    "label",
    "leaderboard-entry-form__label",
    "Your name for the leaderboard",
  );
  const input = createElement("input", "leaderboard-entry-form__input");
  const helpText = createElement(
    "p",
    "leaderboard-entry-form__help",
    "Use 2–15 letters, numbers, spaces, underscores or hyphens.",
  );
  const status = createElement("p", "leaderboard-entry-form__status");
  const submitButton = createElement("button", "primary-button", "Save score");

  form.dataset.form = "leaderboard-entry";
  input.id = "leaderboard-player-name";
  input.name = "playerName";
  input.type = "text";
  input.required = true;
  input.minLength = 2;
  input.maxLength = 15;
  input.setAttribute("autocomplete", "nickname");
  input.setAttribute("aria-describedby", "leaderboard-name-help");
  label.htmlFor = input.id;
  helpText.id = "leaderboard-name-help";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  submitButton.type = "submit";
  input.addEventListener("input", () => input.setCustomValidity(""));
  form.append(label, input, helpText, status, submitButton);

  return form;
}
