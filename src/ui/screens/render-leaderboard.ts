import type { LeaderboardEntry } from "../../storage/leaderboard.ts";
import type { Difficulty } from "../../data/recipes.ts";
import { createElement } from "../shared/create-element.ts";
import { renderTopbar } from "../shared/render-layout.ts";

const DIFFICULTIES: readonly Difficulty[] = ["easy", "medium", "hard"];

export function renderLeaderboard(
  entries: readonly LeaderboardEntry[],
  showClearConfirmation: boolean,
  clearErrorMessage: string | null,
  difficulty: Difficulty,
): HTMLElement {
  const appShell = createElement("main", "app-shell");
  const panel = createElement("section", "leaderboard-panel");
  const panelHeading = createElement("div", "leaderboard-panel__heading");
  const eyebrow = createElement(
    "p",
    "eyebrow",
    `${toTitleCase(difficulty)} difficulty`,
  );
  const heading = createElement("h1", undefined, "Leaderboard");
  const backButton = createElement("button", "leaderboard-link", "Back");
  const clearButton = createElement(
    "button",
    "leaderboard-link leaderboard-link--clear",
    "Clear leaderboard",
  );
  const headingActions = createElement("div", "leaderboard-panel__actions");

  panel.setAttribute("aria-labelledby", "leaderboard-heading");
  heading.id = "leaderboard-heading";
  backButton.type = "button";
  backButton.dataset.action = "close-leaderboard";
  clearButton.type = "button";
  clearButton.dataset.action = "open-leaderboard-clear-confirmation";
  headingActions.append(clearButton, backButton);
  panelHeading.append(eyebrow, heading, headingActions);
  panel.append(
    panelHeading,
    renderDifficultySelector(difficulty),
    renderEntriesTable(entries, difficulty),
  );

  appShell.append(renderTopbar(), panel);

  if (showClearConfirmation) {
    appShell.append(renderClearConfirmation(clearErrorMessage, difficulty));
  }

  return appShell;
}

function renderClearConfirmation(
  errorMessage: string | null,
  difficulty: Difficulty,
): HTMLDialogElement {
  const dialog = createElement("dialog", "leaderboard-confirmation");
  const difficultyName = toTitleCase(difficulty);
  const heading = createElement(
    "h2",
    undefined,
    `Clear the ${difficultyName} leaderboard?`,
  );
  const message = createElement(
    "p",
    "leaderboard-confirmation__message",
    `This will permanently remove all saved ${difficultyName} scores from this browser.`,
  );
  const status = createElement(
    "p",
    "leaderboard-confirmation__status",
    errorMessage ?? "",
  );
  const actions = createElement("div", "leaderboard-confirmation__actions");
  const cancelButton = createElement("button", "leaderboard-link", "Cancel");
  const confirmButton = createElement(
    "button",
    "leaderboard-clear-button",
    "Clear scores",
  );

  dialog.setAttribute("aria-labelledby", "leaderboard-clear-heading");
  dialog.setAttribute("aria-describedby", "leaderboard-clear-message");
  heading.id = "leaderboard-clear-heading";
  message.id = "leaderboard-clear-message";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  cancelButton.type = "button";
  cancelButton.dataset.action = "cancel-leaderboard-clear";
  confirmButton.type = "button";
  confirmButton.dataset.action = "confirm-leaderboard-clear";
  actions.append(cancelButton, confirmButton);
  dialog.append(heading, message, status, actions);

  return dialog;
}

function renderDifficultySelector(selectedDifficulty: Difficulty): HTMLElement {
  const selector = createElement("nav", "leaderboard-difficulties");

  selector.setAttribute("aria-label", "Leaderboard difficulty");

  for (const difficulty of DIFFICULTIES) {
    const isSelected = difficulty === selectedDifficulty;
    const button = createElement(
      "button",
      isSelected
        ? "leaderboard-difficulty leaderboard-difficulty--selected"
        : "leaderboard-difficulty",
      toTitleCase(difficulty),
    );

    button.type = "button";
    button.dataset.action = "select-leaderboard-difficulty";
    button.dataset.difficulty = difficulty;
    button.setAttribute("aria-pressed", String(isSelected));
    selector.append(button);
  }

  return selector;
}

function renderEntriesTable(
  entries: readonly LeaderboardEntry[],
  difficulty: Difficulty,
): HTMLElement {
  const tableWrap = createElement("div", "leaderboard-table-wrap");
  const table = createElement("table", "leaderboard-table");
  const caption = createElement(
    "caption",
    "visually-hidden",
    `${toTitleCase(difficulty)} leaderboard, sorted by score`,
  );
  const header = createElement("thead");
  const headerRow = createElement("tr");
  const body = createElement("tbody");

  for (const label of ["Rank", "Name", "Difficulty", "Score", "Date"]) {
    const cell = createElement("th", undefined, label);
    cell.scope = "col";
    headerRow.append(cell);
  }

  header.append(headerRow);

  if (entries.length === 0) {
    const row = createElement("tr");
    const emptyMessage = createElement(
      "td",
      "leaderboard-empty",
      "No scores yet. Play a game to claim the first place.",
    );

    emptyMessage.colSpan = 5;
    row.append(emptyMessage);
    body.append(row);
  }

  entries.forEach((entry, index) => {
    const row = createElement("tr");
    row.append(
      createCell(String(index + 1)),
      createCell(entry.name),
      createCell(toTitleCase(difficulty)),
      createCell(String(entry.score)),
      createCell(formatLeaderboardDate(entry.achievedAt)),
    );
    body.append(row);
  });

  table.append(caption, header, body);
  tableWrap.append(table);

  return tableWrap;
}

function toTitleCase(value: string): string {
  return `${value[0].toUpperCase()}${value.slice(1)}`;
}

function createCell(text: string): HTMLTableCellElement {
  return createElement("td", undefined, text);
}

function formatLeaderboardDate(timestamp: number): string {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}.${month}.${year} ${hours}:${minutes}`;
}
