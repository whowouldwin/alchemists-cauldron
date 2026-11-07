import { DIFFICULTY_SETTINGS } from "../../data/difficulty-settings.ts";
import {
  getAvailableReactionsForDifficulty,
  getReactionsByIds,
} from "../../logic/reactions/reaction-catalog.ts";
import type { LaboratoryState } from "../../laboratory/laboratory-state.ts";
import type { LaboratoryResult } from "../../laboratory/laboratory-result.ts";
import { createElement } from "../shared/create-element.ts";
import { REACTION_NOTES } from "../shared/reaction-notes.ts";

export function renderLaboratoryReactions(
  state: LaboratoryState,
  result: LaboratoryResult,
): HTMLElement {
  const panel = createElement(
    "section",
    "laboratory-panel laboratory-reactions",
  );
  const heading = createElement("h2", undefined, "Reactions");
  const limit = DIFFICULTY_SETTINGS[state.recipe.difficulty].reactionCount;

  heading.id = "laboratory-reactions-heading";
  panel.setAttribute("aria-labelledby", heading.id);
  panel.append(heading);

  if (limit === 0) {
    panel.append(
      createElement(
        "p",
        "laboratory-description",
        "Easy recipes use no reactions. Choose a Medium or Hard recipe to explore their effects.",
      ),
    );
    return panel;
  }

  panel.append(
    renderReactionSelector(state, limit),
    createElement(
      "p",
      "laboratory-description",
      "Effects follow the order below. Remove and add a reaction again to move it to the end.",
    ),
    renderSelectedReactions(state, result),
  );

  return panel;
}

function renderReactionSelector(
  state: LaboratoryState,
  limit: number,
): HTMLElement {
  const field = createElement("div", "laboratory-recipe");
  const label = createElement(
    "label",
    undefined,
    `Add a reaction (${state.selectedReactionIds.length} / ${limit})`,
  );
  const select = createElement("select");
  const placeholder = createElement(
    "option",
    undefined,
    state.selectedReactionIds.length >= limit
      ? "All reaction slots are filled"
      : "Choose a reaction",
  );

  select.id = "laboratory-reaction";
  select.dataset.action = "add-laboratory-reaction";
  select.disabled = state.selectedReactionIds.length >= limit;
  label.htmlFor = select.id;
  placeholder.value = "";
  placeholder.disabled = true;
  placeholder.selected = true;
  select.append(placeholder);

  for (const reaction of getAvailableReactionsForDifficulty(
    state.recipe.difficulty,
  )) {
    if (!state.selectedReactionIds.includes(reaction.id)) {
      const option = createElement("option", undefined, reaction.name);
      option.value = reaction.id;
      select.append(option);
    }
  }

  field.append(label, select);
  return field;
}

function renderSelectedReactions(
  state: LaboratoryState,
  result: LaboratoryResult,
): HTMLElement {
  const list = createElement("ol", "laboratory-reactions__list");

  for (const reaction of getReactionsByIds(state.selectedReactionIds)) {
    const item = createElement("li");
    const row = createElement("div", "laboratory-reactions__row");
    const isActive = result.trace.steps.some(
      (step) => step.reaction.id === reaction.id,
    );
    const status = createElement(
      "span",
      "laboratory-reactions__status",
      isActive ? "Active" : "Condition not met",
    );
    const removeButton = createElement("button", "leaderboard-link", "Remove");

    status.classList.toggle("laboratory-reactions__status--active", isActive);
    removeButton.type = "button";
    removeButton.dataset.action = "remove-laboratory-reaction";
    removeButton.dataset.reactionId = reaction.id;
    removeButton.setAttribute("aria-label", `Remove ${reaction.name}`);
    row.append(
      createElement("strong", undefined, reaction.name),
      status,
      removeButton,
    );
    item.append(row);

    const notes = REACTION_NOTES[reaction.id];
    if (notes !== undefined) {
      item.append(
        createElement("p", "laboratory-reactions__condition", notes.condition),
      );
    }
    list.append(item);
  }

  return list;
}
