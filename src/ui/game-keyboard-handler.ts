import { getIngredientsForDifficulty } from "../data/ingredients.ts";
import type { GameState } from "../state/game-state.ts";

export interface GameKeyboardActions {
  readonly getGameState: () => GameState | null;
  readonly canAddIngredient: (ingredientId: string) => boolean;
  readonly addIngredient: (ingredientId: string) => void;
  readonly brew: () => void;
  readonly pourOut: () => void;
  readonly pauseGame: () => void;
}

export function createGameKeyboardHandler(
  actions: GameKeyboardActions,
): (event: KeyboardEvent) => void {
  return (event) => {
    const gameState = actions.getGameState();

    if (
      !isActiveGame(gameState) ||
      isTextEntryTarget(event.target) ||
      event.repeat ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    ) {
      return;
    }

    const key = event.key.toLowerCase();

    if (key === "p") {
      event.preventDefault();
      actions.pauseGame();
      return;
    }

    if (key === "b" && gameState.cauldronIngredients.length > 0) {
      event.preventDefault();
      actions.brew();
      return;
    }

    if (key === "o" && gameState.cauldronIngredients.length > 0) {
      event.preventDefault();
      actions.pourOut();
      return;
    }

    const ingredientIndex = Number(key) - 1;

    if (!Number.isInteger(ingredientIndex) || ingredientIndex < 0) {
      return;
    }

    const ingredient = getIngredientsForDifficulty(gameState.difficulty)[
      ingredientIndex
    ];

    if (ingredient !== undefined && actions.canAddIngredient(ingredient.id)) {
      event.preventDefault();
      actions.addIngredient(ingredient.id);
    }
  };
}

function isActiveGame(gameState: GameState | null): gameState is GameState {
  return (
    gameState !== null &&
    gameState.remainingTimeAtPauseMs === null &&
    gameState.gameOverReason === null
  );
}

function isTextEntryTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    target.closest(
      "input, textarea, select, [contenteditable]:not([contenteditable='false'])",
    ) !== null
  );
}
