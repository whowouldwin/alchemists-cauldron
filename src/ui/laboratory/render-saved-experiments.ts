import {
  getExperimentKey,
  restoreExperiment,
  type SavedExperiment,
} from "../../laboratory/saved-experiment.ts";
import { getReactionsByIds } from "../../logic/reactions/reaction-catalog.ts";
import { createElement } from "../shared/create-element.ts";

export function renderSavedExperiments(
  experiments: readonly SavedExperiment[],
  hasReadError: boolean,
  isOpen: boolean,
): HTMLDetailsElement {
  const details = createElement(
    "details",
    "laboratory-panel saved-experiments",
  );
  const summary = createElement(
    "summary",
    undefined,
    hasReadError
      ? "Saved experiments · unavailable"
      : `Saved experiments (${experiments.length})`,
  );
  const list = createElement("ul", "saved-experiments__list");

  details.id = "saved-experiments";
  details.open = isOpen;
  summary.id = "saved-experiments-toggle";
  details.append(summary);

  if (hasReadError) {
    const error = createElement(
      "p",
      "saved-experiments__error",
      "Saved experiments could not be read. Existing data has not been replaced.",
    );
    const retry = createElement("button", "leaderboard-link", "Retry loading");
    retry.type = "button";
    retry.dataset.action = "reload-laboratory-experiments";
    details.append(error, retry);
  } else if (experiments.length === 0) {
    details.append(
      createElement(
        "p",
        "laboratory-description",
        "No saved experiments yet. Match a recipe and select Save experiment.",
      ),
    );
  }

  if (experiments.length > 0) {
    details.append(
      createElement(
        "p",
        "laboratory-description",
        hasReadError
          ? "Previously loaded experiments are still available below. Opening one replaces your current mixture and reactions."
          : "Stored in this browser. Opening an experiment replaces your current mixture and reactions.",
      ),
    );
    for (const [index, experiment] of experiments.entries()) {
      const card = renderSavedExperiment(experiment, index);
      if (card !== null) {
        list.append(card);
      }
    }
    details.append(list);
  }

  return details;
}

function renderSavedExperiment(
  experiment: SavedExperiment,
  index: number,
): HTMLLIElement | null {
  const state = restoreExperiment(experiment);
  if (state === null) {
    return null;
  }

  const card = createElement("li", "saved-experiment");
  const heading = createElement("h3", undefined, state.recipe.name);
  const ingredients = createElement(
    "p",
    undefined,
    `Ingredients: ${state.ingredients.map(({ name }) => name).join(" → ")}`,
  );
  const reactionNames = getReactionsByIds(state.selectedReactionIds).map(
    ({ name }) => name,
  );
  const reactions = createElement(
    "p",
    undefined,
    reactionNames.length === 0
      ? "No reactions"
      : `Reactions: ${reactionNames.join(" → ")}`,
  );
  const actions = createElement("div", "saved-experiment__actions");
  const open = createElement("button", "leaderboard-link", "Open");
  const remove = createElement("button", "leaderboard-link", "Remove");
  const key = getExperimentKey(experiment);
  ingredients.id = `saved-experiment-ingredients-${index}`;
  reactions.id = `saved-experiment-reactions-${index}`;

  for (const button of [open, remove]) {
    button.type = "button";
    button.dataset.experimentKey = key;
    button.setAttribute(
      "aria-describedby",
      `${ingredients.id} ${reactions.id}`,
    );
  }
  open.dataset.action = "open-laboratory-experiment";
  open.setAttribute("aria-label", `Open ${state.recipe.name} experiment`);
  remove.dataset.action = "remove-laboratory-experiment";
  remove.setAttribute("aria-label", `Remove ${state.recipe.name} experiment`);
  actions.append(open, remove);
  card.append(heading, ingredients, reactions, actions);

  return card;
}
