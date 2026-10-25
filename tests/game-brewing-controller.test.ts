import assert from "node:assert/strict";
import test from "node:test";
import { LEVEL_ONE_INGREDIENTS } from "../src/data/ingredients.ts";
import { GameBrewingController } from "../src/game-controller/game-brewing-controller.ts";
import { addIngredient } from "../src/state/game-actions.ts";
import { createGameState } from "../src/state/create-game-state.ts";
import type { GameState } from "../src/state/game-state.ts";

function createController(initialState: GameState | null) {
  let gameState = initialState;
  let saveCount = 0;
  let renderCount = 0;
  let pourOutAnnouncementCount = 0;

  const controller = new GameBrewingController({
    getGameState: () => gameState,
    setGameState: (nextState) => {
      gameState = nextState;
    },
    finishGameIfNeeded: () => false,
    saveCurrentGame: () => {
      saveCount += 1;
    },
    render: () => {
      renderCount += 1;
    },
    announcements: {
      region: {} as HTMLDivElement,
      ingredientAdded: () => {},
      brewResult: () => {},
      cauldronPouredOut: () => {
        pourOutAnnouncementCount += 1;
      },
      gameOver: () => {},
    },
  });

  return {
    controller,
    get gameState() {
      return gameState;
    },
    get saveCount() {
      return saveCount;
    },
    get renderCount() {
      return renderCount;
    },
    get pourOutAnnouncementCount() {
      return pourOutAnnouncementCount;
    },
  };
}

function createStateWithIngredient(): GameState {
  const state = createGameState(() => 0, 0);
  const firstIngredient = LEVEL_ONE_INGREDIENTS[0];

  assert.ok(firstIngredient !== undefined);

  return addIngredient(state, firstIngredient.id);
}

test("pours out the cauldron, then saves, renders, and announces", () => {
  const initialState = createStateWithIngredient();
  const controller = createController(initialState);

  controller.controller.pourOut();

  assert.deepEqual(controller.gameState, {
    ...initialState,
    cauldronIngredients: [],
    endTime: initialState.endTime - 10_000,
  });
  assert.equal(controller.saveCount, 1);
  assert.equal(controller.renderCount, 1);
  assert.equal(controller.pourOutAnnouncementCount, 1);
});

test("does not save, render, or announce when the game has no cauldron contents", () => {
  const controller = createController(createGameState(() => 0, 0));

  controller.controller.pourOut();

  assert.equal(controller.saveCount, 0);
  assert.equal(controller.renderCount, 0);
  assert.equal(controller.pourOutAnnouncementCount, 0);
});
