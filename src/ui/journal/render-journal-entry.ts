import type { Recipe, RecipeRange } from "../../data/recipes.ts";
import type { IReaction } from "../../logic/reactions/reaction-types.ts";
import { createElement } from "../shared/create-element.ts";
import { formatIngredientValue } from "../shared/format-ingredient-value.ts";
import { REACTION_NOTES } from "./reaction-notes.ts";

export function renderJournalRecipe(recipe: Recipe): HTMLElement {
  const card = createEntry(recipe.name, "recipe");
  const difficulty = createElement(
    "p",
    "journal-entry__difficulty",
    `${recipe.difficulty} recipe`,
  );
  const ranges = createElement("dl", "journal-entry__details");

  appendDetail(ranges, "Temperature", formatRange(recipe.temperature));
  appendDetail(ranges, "Density", formatRange(recipe.density));
  appendDetail(ranges, "Magic Power", formatRange(recipe.magicPower));
  card.append(difficulty, ranges);

  return card;
}

export function renderJournalReaction(reaction: IReaction): HTMLElement {
  const card = createEntry(reaction.name, "reaction");
  const notes = REACTION_NOTES[reaction.id];

  if (notes !== undefined) {
    const details = createElement(
      "dl",
      "journal-entry__details journal-entry__details--stacked",
    );
    appendDetail(details, "When it activates", notes.condition);
    appendDetail(details, "What it changes", notes.effect);
    card.append(details);
  }

  return card;
}

function createEntry(name: string, kind: "recipe" | "reaction"): HTMLElement {
  const card = createElement("article", `journal-entry journal-entry--${kind}`);
  const heading = createElement("h3", "journal-entry__heading");
  const mark = createElement("span", "journal-entry__mark", "✦");

  mark.setAttribute("aria-hidden", "true");
  heading.append(mark, name);
  card.append(heading);

  return card;
}

function appendDetail(
  list: HTMLDListElement,
  label: string,
  value: string,
): void {
  const row = createElement("div");
  row.append(
    createElement("dt", undefined, label),
    createElement("dd", undefined, value),
  );
  list.append(row);
}

function formatRange(range: RecipeRange): string {
  return `${formatIngredientValue(range.minimum)} to ${formatIngredientValue(range.maximum)}`;
}
