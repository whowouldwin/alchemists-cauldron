import assert from "node:assert/strict";
import test from "node:test";
import { LEVEL_ONE_INGREDIENTS } from "../src/data/ingredients.ts";
import { createGameState } from "../src/state/create-game-state.ts";
import { addIngredient } from "../src/state/game-actions.ts";
import { finishGame, getGameOverReason } from "../src/state/game-status.ts";

test("ends the game when the timer reaches zero", () => {
  const state = createGameState(() => 0, 0);

  assert.equal(getGameOverReason(state, 149_999), null);
  assert.equal(getGameOverReason(state, 150_000), "time");
});

test("ends the game when no lives remain", () => {
  const state = { ...createGameState(() => 0, 0), lives: 0 };

  assert.equal(getGameOverReason(state, 1), "lives");
});

test("ends the game when the shelf and cauldron are both empty", () => {
  const state = {
    ...createGameState(() => 0, 0),
    shelfStock: Object.fromEntries(
      LEVEL_ONE_INGREDIENTS.map(({ id }) => [id, 0]),
    ),
  };

  assert.equal(getGameOverReason(state, 1), "out-of-ingredients");
});

test("does not end the game while the cauldron still contains an ingredient", () => {
  const initialState = createGameState(() => 0, 0);
  const ingredientId = LEVEL_ONE_INGREDIENTS[0].id;
  const stateWithEmptyShelf = {
    ...addIngredient(initialState, ingredientId),
    shelfStock: Object.fromEntries(
      LEVEL_ONE_INGREDIENTS.map(({ id }) => [id, 0]),
    ),
  };

  assert.equal(getGameOverReason(stateWithEmptyShelf, 1), null);
});

test("stores the reason when the game is finished", () => {
  const state = createGameState(() => 0, 0);
  const gameOverState = finishGame(state, "lives");

  assert.equal(gameOverState.gameOverReason, "lives");
  assert.equal(gameOverState.score, state.score);
  assert.equal(state.gameOverReason, null);
});
