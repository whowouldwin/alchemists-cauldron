import { DIFFICULTY_SETTINGS } from "../../data/difficulty-settings.ts";
import { RECIPES, type Recipe } from "../../data/recipes.ts";
import { createElement } from "../shared/create-element.ts";

export function renderLaboratoryRecipeSelector(recipe: Recipe): HTMLElement {
  const field = createElement("div", "laboratory-recipe");
  const label = createElement("label", undefined, "Recipe to practice");
  const select = createElement("select");
  const tolerance = DIFFICULTY_SETTINGS[recipe.difficulty].recipeTolerance;
  const hint = createElement(
    "p",
    "laboratory-recipe__hint",
    `Targets include ±${tolerance} tolerance. Changing the recipe clears your mixture.`,
  );

  select.id = "laboratory-recipe";
  select.dataset.action = "select-laboratory-recipe";
  label.htmlFor = select.id;
  hint.id = "laboratory-recipe-hint";
  select.setAttribute("aria-describedby", hint.id);

  for (const difficulty of ["easy", "medium", "hard"] as const) {
    const group = createElement("optgroup");
    group.label = `${difficulty[0].toUpperCase()}${difficulty.slice(1)}`;

    for (const candidate of RECIPES.filter(
      (item) => item.difficulty === difficulty,
    )) {
      const option = createElement("option", undefined, candidate.name);
      option.value = candidate.id;
      option.selected = candidate.id === recipe.id;
      group.append(option);
    }

    select.append(group);
  }

  field.append(label, select, hint);

  return field;
}
