import { DIFFICULTY_SETTINGS } from "../../data/difficulty-settings.ts";
import { resolveCauldronReactions } from "../../logic/reactions/reaction-engine.ts";
import type { GameState } from "../../state/game-state.ts";
import { renderParameterBars } from "../parameter-bars/render-parameter-bars.ts";
import { createElement } from "../shared/create-element.ts";
import { renderBrewActions } from "./render-brew-actions.ts";

export function renderRecipePanel(state: GameState): HTMLElement {
  const panel = createElement("section", "panel recipe-panel");
  const panelHeading = createElement("div", "recipe-panel__heading");
  const headingContent = createElement("div");
  const eyebrow = createElement("p", "recipe-panel__eyebrow", "Current recipe");
  const heading = createElement(
    "h2",
    "recipe-panel__name",
    state.activeRecipe.name,
  );
  const ingredientCount = state.cauldronIngredients.length;
  const maximumIngredients =
    DIFFICULTY_SETTINGS[state.difficulty].maxCauldronIngredients;
  const counter = createElement(
    "p",
    "recipe-panel__counter",
    `Ingredients: ${ingredientCount} / ${maximumIngredients}`,
  );
  const { values } = resolveCauldronReactions(
    state.cauldronIngredients,
    state.activeReactionIds,
  );
  const { temperature, density, magicPower } = state.activeRecipe;

  panel.setAttribute("aria-labelledby", "recipe-panel-name");
  heading.id = "recipe-panel-name";
  counter.classList.toggle(
    "recipe-panel__counter--full",
    ingredientCount >= maximumIngredients,
  );
  headingContent.append(eyebrow, heading);
  panelHeading.append(headingContent, counter);
  panel.append(
    panelHeading,
    renderParameterBars(
      values,
      { temperature, density, magicPower },
      state.difficulty,
    ),
    renderBrewActions(state),
  );

  return panel;
}
