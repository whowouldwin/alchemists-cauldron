import type { GameOverReason, GameState } from "../../state/game-state.ts";
import { createElement } from "../shared/create-element.ts";
import { renderTopbar } from "../shared/render-layout.ts";

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

  panel.setAttribute("aria-labelledby", "game-over-heading");
  heading.id = "game-over-heading";
  playAgainButton.type = "button";
  playAgainButton.dataset.action = "start-game";
  buttonIcon.setAttribute("aria-hidden", "true");
  playAgainButton.append(buttonLabel, buttonIcon);
  finalScore.append(scoreLabel, scoreValue);
  panel.append(eyebrow, heading, message, finalScore, playAgainButton);
  appShell.append(renderTopbar("A little magic lab"), panel);

  return appShell;
}
