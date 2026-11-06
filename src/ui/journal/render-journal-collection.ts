import { RECIPES } from "../../data/recipes.ts";
import { REACTIONS } from "../../logic/reactions/reaction-catalog.ts";
import type { DiscoveryJournal } from "../../progress/discovery-journal.ts";
import { createElement } from "../shared/create-element.ts";
import {
  renderJournalRecipe,
  renderJournalReaction,
} from "./render-journal-entry.ts";

export type JournalSection = "recipes" | "reactions";

export function renderJournalCollection(
  journal: DiscoveryJournal,
  section: JournalSection,
): HTMLElement {
  const collection = createElement("section", "journal-collection");
  const isRecipes = section === "recipes";
  const count = isRecipes
    ? journal.recipeIds.length
    : journal.reactionIds.length;
  const total = isRecipes ? RECIPES.length : REACTIONS.length;
  const heading = createElement(
    "h2",
    undefined,
    isRecipes ? "Discovered recipes" : "Discovered reactions",
  );
  const progress = createElement("progress", "journal-progress");
  const hint = createElement(
    "p",
    "journal-collection__hint",
    isRecipes
      ? "These are the recipe's base ranges. Your difficulty adds extra tolerance during a game."
      : "Only the reactions selected for a game can activate. Conditions use ingredient totals before reaction effects.",
  );

  collection.id = "journal-collection";
  heading.id = "journal-collection-heading";
  collection.setAttribute("aria-labelledby", heading.id);
  progress.max = total;
  progress.value = count;
  progress.setAttribute("aria-label", `${section} discovered`);
  progress.textContent = `${count} / ${total}`;
  collection.append(heading, progress);

  if (count === 0) {
    const empty = createElement("div", "journal-empty");
    empty.append(
      createElement(
        "h3",
        undefined,
        isRecipes ? "Your first potion awaits" : "There is more to a mixture",
      ),
      createElement(
        "p",
        undefined,
        isRecipes
          ? "Successfully brew a potion in any difficulty to add its recipe here. Try Easy to get started."
          : "Play Medium or Hard and trigger one of the game's selected reactions to add it here.",
      ),
    );
    collection.append(empty);
    return collection;
  }

  const entries = createElement("div", "journal-entries");

  if (isRecipes) {
    for (const recipe of RECIPES) {
      if (journal.recipeIds.includes(recipe.id)) {
        entries.append(renderJournalRecipe(recipe));
      }
    }
  } else {
    for (const reaction of REACTIONS) {
      if (journal.reactionIds.includes(reaction.id)) {
        entries.append(renderJournalReaction(reaction));
      }
    }
  }

  collection.append(hint, entries);

  return collection;
}
