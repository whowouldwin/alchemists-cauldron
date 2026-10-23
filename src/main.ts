import "./styles/game.scss";
import {
  addIngredient,
  applyBrewResult,
  createGameState,
  finishGame,
  getGameOverReason,
  type GameState,
} from "./state/game-state.ts";
import { calculateCauldron } from "./logic/calculate-cauldron.ts";
import { isBrewSuccessful } from "./logic/brew-check.ts";
import { createGameAnnouncements } from "./ui/game-announcements.ts";
import { createGameClickHandler } from "./ui/game-click-handler.ts";
import { createTimerDisplayRefresh } from "./ui/game-status/timer-display-refresh.ts";
import { renderGame } from "./ui/screens/render-game.ts";

const announcements = createGameAnnouncements();
const applicationRoot = document.createElement("div");
applicationRoot.id = "app";

document.body.append(announcements.region, applicationRoot);

let gameState: GameState | null = null;
const timerDisplayRefresh = createTimerDisplayRefresh(
  applicationRoot,
  () => gameState,
  finishGameIfNeeded,
);

function render(): void {
  applicationRoot.replaceChildren(renderGame(gameState));
}

function startGame(): void {
  gameState = createGameState();
  render();
  timerDisplayRefresh.start();
}

function handleIngredientClick(ingredientId: string): void {
  if (gameState === null || finishGameIfNeeded()) {
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
  announcements.ingredientAdded(
    addedIngredient.name,
    nextState.cauldronIngredients.length,
  );
}

function handleBrewClick(): void {
  if (
    gameState === null ||
    finishGameIfNeeded() ||
    gameState.cauldronIngredients.length === 0
  ) {
    return;
  }

  const values = calculateCauldron(gameState.cauldronIngredients);
  const succeeded = isBrewSuccessful(values, gameState.activeRecipe);

  gameState = applyBrewResult(gameState, succeeded);
  if (finishGameIfNeeded()) {
    return;
  }

  render();
  announcements.brewResult(succeeded);
}

function finishGameIfNeeded(): boolean {
  if (gameState === null) {
    return false;
  }

  if (gameState.gameOverReason !== null) {
    return true;
  }

  const reason = getGameOverReason(gameState);

  if (reason === null) {
    return false;
  }

  gameState = finishGame(gameState, reason);
  timerDisplayRefresh.stop();
  render();
  announcements.gameOver(reason);

  return true;
}

applicationRoot.addEventListener(
  "click",
  createGameClickHandler({
    startGame,
    brew: handleBrewClick,
    addIngredient: handleIngredientClick,
  }),
);

render();
