import { createElement } from "../shared/create-element.ts";

const GAME_RULES = [
  "Choose a difficulty in Settings before starting. It sets your ingredients, recipe tolerance, time, lives and rewards.",
  "Click or drag ingredients into the cauldron. Hover or focus a card to see its values. Each addition uses one portion from the shelf.",
  "Match all three values to the active recipe's target ranges. The selected difficulty sets how much tolerance each range allows.",
  "Press Brew to check your mixture. A successful brew earns points and extra time, then gives you a new recipe. A failed brew costs one life. Both clear the cauldron.",
  "Pour Out clears the cauldron for 10 seconds without losing a life. Used ingredients do not return to the shelf.",
  "Medium enables 2 reactions and Hard enables 3. Some ingredient combinations change the mixture's values, spend time or cost a life.",
  "The game ends when time or lives run out, or when you have no ingredients left to use. Pause stops the timer until you resume.",
] as const;

export function renderHelpPanel(): HTMLDialogElement {
  const panel = createElement("dialog", "help-dialog");
  const headingRow = createElement("div", "help-dialog__heading");
  const heading = createElement("h2", undefined, "How to play");
  const closeButton = createElement("button", "leaderboard-link", "Close help");
  const rules = createElement("ol", "help-dialog__rules");
  const shortcuts = createElement(
    "p",
    "help-dialog__shortcuts",
    "Keyboard: 1–8 add the corresponding available ingredient, B brews, O pours out, and P pauses. Use Tab to focus Resume, then Enter or Space to continue.",
  );

  panel.id = "game-help";
  panel.setAttribute("aria-labelledby", "game-help-heading");
  heading.id = "game-help-heading";
  closeButton.type = "button";
  closeButton.dataset.action = "close-help";
  headingRow.append(heading, closeButton);

  for (const rule of GAME_RULES) {
    rules.append(createElement("li", undefined, rule));
  }

  panel.append(headingRow, rules, shortcuts);

  return panel;
}
