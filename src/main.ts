import "./styles/game.scss";
import {
  addIngredient,
  createGameState,
  MAX_CAULDRON_INGREDIENTS,
  type GameState,
} from "./state/game-state.ts";
import { renderGame } from "./ui/screens/render-game.ts";

const announcementRegion = document.createElement("div");
announcementRegion.id = "app-announcements";
announcementRegion.className = "visually-hidden";
announcementRegion.setAttribute("role", "status");
announcementRegion.setAttribute("aria-live", "polite");
announcementRegion.setAttribute("aria-atomic", "true");

const applicationRoot = document.createElement("div");
applicationRoot.id = "app";

document.body.append(announcementRegion, applicationRoot);

let gameState: GameState | null = null;

function render(): void {
  applicationRoot.replaceChildren(renderGame(gameState));
}

function announceIngredientAdded(
  ingredientName: string,
  ingredientCount: number,
): void {
  const cauldronMessage =
    ingredientCount >= MAX_CAULDRON_INGREDIENTS
      ? `The cauldron is full at ${ingredientCount} of ${MAX_CAULDRON_INGREDIENTS}.`
      : `The cauldron contains ${ingredientCount} of ${MAX_CAULDRON_INGREDIENTS} ingredients.`;

  announcementRegion.textContent = `${ingredientName} added. ${cauldronMessage}`;
}

function startGame(): void {
  gameState = createGameState();
  render();
}

function handleIngredientClick(ingredientId: string): void {
  if (gameState === null) {
    return;
  }

  const nextState = addIngredient(gameState, ingredientId);

  if (nextState === gameState) {
    return;
  }

  const addedIngredient = nextState.cauldronIngredients.at(-1);

  if (addedIngredient === undefined) {
    return;
  }

  gameState = nextState;
  render();
  announceIngredientAdded(
    addedIngredient.name,
    nextState.cauldronIngredients.length,
  );
}

function handleIngredientButtonClick(target: Element): void {
  const ingredientButton = target.closest<HTMLButtonElement>(
    "[data-ingredient-id]",
  );

  if (ingredientButton === null || ingredientButton.disabled) {
    return;
  }

  const ingredientId = ingredientButton.dataset.ingredientId;

  if (ingredientId === undefined) {
    return;
  }

  handleIngredientClick(ingredientId);
}

function handleApplicationClick(event: MouseEvent): void {
  if (!(event.target instanceof Element)) {
    return;
  }

  const startButton = event.target.closest<HTMLButtonElement>(
    '[data-action="start-game"]',
  );

  if (startButton !== null) {
    startGame();
    return;
  }

  handleIngredientButtonClick(event.target);
}

applicationRoot.addEventListener("click", handleApplicationClick);

render();
