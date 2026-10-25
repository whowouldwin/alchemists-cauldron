import { createElement } from "../shared/create-element.ts";

const GAME_RULES = [
  "Choose a difficulty in Settings before starting. It sets the shelf, cauldron limit, time, lives, recipe tolerance, points, time bonus, and reaction count.",
  "Add ingredients from the shelf to change the cauldron's temperature, density, and magic power. Each addition uses one item from its stock.",
  "Match all three values to the active recipe's target ranges. The selected difficulty sets how much tolerance each range allows.",
  "Press Brew to check your mixture. A successful brew earns points and extra time, then gives you a new recipe. A failed brew costs one life. Both clear the cauldron.",
  "The game ends when time or lives run out, or when you have no ingredients left to use. Pause stops the timer until you resume.",
] as const;

export function renderHelpPanel(): HTMLDialogElement {
  const panel = createElement("dialog", "help-dialog");
  const headingRow = createElement("div", "help-dialog__heading");
  const heading = createElement("h2", undefined, "How to play");
  const closeButton = createElement("button", "leaderboard-link", "Close help");
  const rules = createElement("ol", "help-dialog__rules");

  panel.id = "game-help";
  panel.setAttribute("aria-labelledby", "game-help-heading");
  heading.id = "game-help-heading";
  closeButton.type = "button";
  closeButton.dataset.action = "close-help";
  headingRow.append(heading, closeButton);

  for (const rule of GAME_RULES) {
    rules.append(createElement("li", undefined, rule));
  }

  panel.append(headingRow, rules);

  return panel;
}
