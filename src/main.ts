import "./styles/game.scss";
import {
  addIngredient,
  applyBrewResult,
  createGameState,
  MAX_CAULDRON_INGREDIENTS,
  type GameState,
} from "./state/game-state.ts";
import { calculateCauldron } from "./logic/calculate-cauldron.ts";
import { isBrewSuccessful } from "./logic/brew-check.ts";
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

function announceBrewResult(succeeded: boolean): void {
  announcementRegion.textContent = succeeded
    ? "Brew successful. 200 points awarded. A new recipe is ready."
    : "Brew failed. One life was lost.";
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

function handleBrewClick(): void {
  if (gameState === null || gameState.cauldronIngredients.length === 0) {
    return;
  }

  const values = calculateCauldron(gameState.cauldronIngredients);
  const succeeded = isBrewSuccessful(values, gameState.activeRecipe);

  gameState = applyBrewResult(gameState, succeeded);
  render();
  announceBrewResult(succeeded);
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

function handleBrewButtonClick(target: Element): boolean {
  const brewButton = target.closest<HTMLButtonElement>('[data-action="brew"]');

  if (brewButton === null) {
    return false;
  }

  if (!brewButton.disabled) {
    handleBrewClick();
  }

  return true;
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

  if (handleBrewButtonClick(event.target)) {
    return;
  }

  handleIngredientButtonClick(event.target);
}

applicationRoot.addEventListener("click", handleApplicationClick);

render();
