import { RECIPES } from "../../data/recipes.ts";
import { REACTIONS } from "../../logic/reactions/reaction-catalog.ts";
import type { DiscoveryJournal } from "../../progress/discovery-journal.ts";
import { createElement } from "../shared/create-element.ts";
import { renderTopbar } from "../shared/render-layout.ts";
import {
  renderJournalCollection,
  type JournalSection,
} from "./render-journal-collection.ts";

export function renderDiscoveryJournal(
  journal: DiscoveryJournal,
  section: JournalSection,
  hasUnsavedDiscoveries: boolean,
): HTMLElement {
  const screen = createElement("main", "app-shell journal-screen");
  const topbar = renderTopbar();
  const backButton = createElement("button", "leaderboard-link", "Back");
  const panel = createElement("section", "journal-panel");
  const heading = createElement("h1", undefined, "Discovery journal");
  const description = createElement(
    "p",
    "journal-panel__description",
    "Every successful brew and new reaction becomes part of your collection.",
  );

  backButton.type = "button";
  backButton.dataset.action = "close-journal";
  topbar.append(backButton);
  heading.id = "journal-heading";
  panel.setAttribute("aria-labelledby", heading.id);
  panel.append(heading, description);

  if (hasUnsavedDiscoveries) {
    panel.append(
      createElement(
        "p",
        "journal-notice",
        "Some discoveries could not be saved in this browser. Keep this page open; saving will be retried on your next discovery.",
      ),
    );
  }

  panel.append(
    renderSectionSelector(journal, section),
    renderJournalCollection(journal, section),
  );
  screen.append(topbar, panel);

  return screen;
}

function renderSectionSelector(
  journal: DiscoveryJournal,
  selectedSection: JournalSection,
): HTMLElement {
  const selector = createElement("nav", "journal-sections");
  selector.setAttribute("aria-label", "Journal category");

  const sections = [
    {
      id: "recipes",
      label: "Recipes",
      count: journal.recipeIds.length,
      total: RECIPES.length,
    },
    {
      id: "reactions",
      label: "Reactions",
      count: journal.reactionIds.length,
      total: REACTIONS.length,
    },
  ] as const;

  for (const { id, label, count, total } of sections) {
    const button = createElement("button", "journal-section");
    const countLabel = createElement(
      "span",
      "journal-section__count",
      `${count} / ${total}`,
    );

    button.type = "button";
    button.dataset.action = "select-journal-section";
    button.dataset.journalSection = id;
    button.setAttribute("aria-pressed", String(id === selectedSection));
    button.setAttribute("aria-controls", "journal-collection");
    button.setAttribute(
      "aria-label",
      `${label}: ${count} of ${total} discovered`,
    );
    button.append(label, countLabel);
    selector.append(button);
  }

  return selector;
}
