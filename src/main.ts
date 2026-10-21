import "./styles/game.css";

import {
  addIngredient,
  clearCauldron,
  createInitialGameState,
  isKnownIngredient,
} from "./logic/game-state.ts";
import { renderGameMarkup } from "./ui/render-game.ts";

const applicationRoot = document.querySelector<HTMLElement>("#app");

if (applicationRoot === null) {
  throw new Error('Required app root element "#app" was not found.');
}

const appRoot = applicationRoot;
let gameState = createInitialGameState();

function renderGame(): void {
  appRoot.innerHTML = renderGameMarkup(gameState);
}

appRoot.addEventListener("click", (event: MouseEvent) => {
  const target = event.target;

  if (!(target instanceof Element)) {
    return;
  }

  if (
    target.closest<HTMLButtonElement>('button[data-action="clear-cauldron"]')
  ) {
    gameState = clearCauldron(gameState);
    renderGame();
    return;
  }

  const card = target.closest<HTMLButtonElement>("button[data-ingredient-id]");
  const ingredientId = card?.dataset.ingredientId;

  if (!ingredientId || !isKnownIngredient(ingredientId) || card?.disabled) {
    return;
  }

  gameState = addIngredient(gameState, ingredientId);
  renderGame();
});

renderGame();
