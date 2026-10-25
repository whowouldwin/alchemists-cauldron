import { DIFFICULTY_SETTINGS } from "../../data/difficulty-settings.ts";
import type { Difficulty } from "../../data/recipes.ts";
import { createElement } from "../shared/create-element.ts";
import { formatTimeRemaining } from "../shared/format-time-remaining.ts";

const DIFFICULTIES: readonly Difficulty[] = ["easy", "medium", "hard"];

export function renderDifficultySettings(
  selectedDifficulty: Difficulty,
): HTMLDialogElement {
  const panel = createElement("dialog", "difficulty-dialog");
  const heading = createElement("h2", undefined, "Choose a difficulty");
  const description = createElement(
    "p",
    "difficulty-dialog__description",
    "The rules change with each experiment.",
  );
  const closeButton = createElement("button", "leaderboard-link", "Close");
  const headingRow = createElement("div", "difficulty-dialog__heading");
  const options = createElement("div", "difficulty-options");

  panel.id = "difficulty-settings";
  panel.setAttribute("aria-labelledby", "difficulty-settings-heading");
  heading.id = "difficulty-settings-heading";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Close difficulty settings");
  closeButton.dataset.action = "close-difficulty-settings";
  headingRow.append(heading, closeButton);

  for (const difficulty of DIFFICULTIES) {
    options.append(
      renderDifficultyOption(difficulty, selectedDifficulty === difficulty),
    );
  }

  panel.append(headingRow, description, options);

  return panel;
}

function renderDifficultyOption(
  difficulty: Difficulty,
  isSelected: boolean,
): HTMLButtonElement {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  const option = createElement(
    "button",
    isSelected
      ? "difficulty-option difficulty-option--selected"
      : "difficulty-option",
  );
  const name = createElement(
    "span",
    "difficulty-option__name",
    toTitleCase(difficulty),
  );
  const firstDetails = createElement(
    "span",
    "difficulty-option__details",
    `${settings.shelfIngredientCount} shelf ingredients · ${settings.maxCauldronIngredients} per brew`,
  );
  const secondDetails = createElement(
    "span",
    "difficulty-option__details",
    `${formatTimeRemaining(settings.startingTimeSeconds)} · ${settings.startingLives} lives`,
  );
  const thirdDetails = createElement(
    "span",
    "difficulty-option__details",
    `±${settings.recipeTolerance} tolerance · ${settings.scorePerBrew} points · +${settings.timeBonusSeconds}s`,
  );

  option.type = "button";
  option.dataset.action = "select-difficulty";
  option.dataset.difficulty = difficulty;
  option.setAttribute("aria-pressed", String(isSelected));
  option.append(name, firstDetails, secondDetails, thirdDetails);

  return option;
}

function toTitleCase(value: string): string {
  return `${value[0].toUpperCase()}${value.slice(1)}`;
}
