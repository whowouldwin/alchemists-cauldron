import type { LeaderboardEntry } from "../../storage/leaderboard.ts";
import { createElement } from "../shared/create-element.ts";
import { renderTopbar } from "../shared/render-layout.ts";

export function renderLeaderboard(
  entries: readonly LeaderboardEntry[],
): HTMLElement {
  const appShell = createElement("main", "app-shell");
  const panel = createElement("section", "leaderboard-panel");
  const panelHeading = createElement("div", "leaderboard-panel__heading");
  const eyebrow = createElement("p", "eyebrow", "Level 1");
  const heading = createElement("h1", undefined, "Leaderboard");
  const backButton = createElement("button", "leaderboard-link", "Back");

  panel.setAttribute("aria-labelledby", "leaderboard-heading");
  heading.id = "leaderboard-heading";
  backButton.type = "button";
  backButton.dataset.action = "close-leaderboard";
  panelHeading.append(eyebrow, heading, backButton);
  panel.append(panelHeading);

  if (entries.length === 0) {
    const emptyMessage = createElement(
      "p",
      "leaderboard-empty",
      "No scores yet. Play a game to claim the first place.",
    );
    panel.append(emptyMessage);
  } else {
    panel.append(renderEntriesTable(entries));
  }

  appShell.append(renderTopbar(), panel);

  return appShell;
}

function renderEntriesTable(entries: readonly LeaderboardEntry[]): HTMLElement {
  const tableWrap = createElement("div", "leaderboard-table-wrap");
  const table = createElement("table", "leaderboard-table");
  const caption = createElement(
    "caption",
    "visually-hidden",
    "Level 1 leaderboard, sorted by score",
  );
  const header = createElement("thead");
  const headerRow = createElement("tr");
  const body = createElement("tbody");

  for (const label of ["Rank", "Name", "Score", "Date"]) {
    const cell = createElement("th", undefined, label);
    cell.scope = "col";
    headerRow.append(cell);
  }

  header.append(headerRow);

  entries.forEach((entry, index) => {
    const row = createElement("tr");
    row.append(
      createCell(String(index + 1)),
      createCell(entry.name),
      createCell(String(entry.score)),
      createCell(formatLeaderboardDate(entry.achievedAt)),
    );
    body.append(row);
  });

  table.append(caption, header, body);
  tableWrap.append(table);

  return tableWrap;
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
