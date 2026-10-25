import type { BrewResult, GameState } from "../../state/game-state.ts";
import { createElement } from "../shared/create-element.ts";

export function renderBrewActions(state: GameState): HTMLElement {
  const actions = createElement("div", "recipe-panel__actions");
  const brewButton = createElement("button", "primary-button brew-button");
  const brewLabel = createElement("span", undefined, "Brew");
  const brewIcon = createElement("span", undefined, "↗");
  const pourOutButton = createElement("button", "pour-out-button", "Pour Out");
  const isEmpty = state.cauldronIngredients.length === 0;

  brewButton.type = "button";
  brewButton.dataset.action = "brew";
  brewButton.disabled = isEmpty;
  pourOutButton.type = "button";
  pourOutButton.dataset.action = "pour-out";
  pourOutButton.disabled = isEmpty;
  brewIcon.setAttribute("aria-hidden", "true");
  brewButton.append(brewLabel, brewIcon);
  actions.append(
    renderBrewResult(state.lastBrewResult),
    brewButton,
    pourOutButton,
  );

  return actions;
}

function renderBrewResult(result: BrewResult | null): HTMLParagraphElement {
  const feedback = createElement("p", "recipe-panel__result");

  if (result !== null) {
    feedback.classList.add(`recipe-panel__result--${result}`);
    feedback.textContent =
      result === "success"
        ? "Brew successful! A new recipe is ready."
        : "Brew failed. One life was lost.";
  }

  return feedback;
}
