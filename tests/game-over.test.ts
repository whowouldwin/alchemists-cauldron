import assert from "node:assert/strict";
import test from "node:test";
import { LEVEL_ONE_INGREDIENTS } from "../src/data/ingredients.ts";
import { createGameState } from "../src/state/create-game-state.ts";
import { addIngredient } from "../src/state/game-actions.ts";
import {
  finishGame,
  getGameOverReason,
  getGameTimeRemaining,
  pauseGame,
  resumeGame,
} from "../src/state/game-status.ts";

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

test("pauses the timer and resumes with the same remaining time", () => {
  const state = createGameState(() => 0, 0);
  const pausedState = pauseGame(state, 12_345);
  const resumedState = resumeGame(pausedState, 60_000);

  assert.equal(getGameTimeRemaining(pausedState, 30_000), 138);
  assert.equal(getGameTimeRemaining(resumedState, 60_000), 138);
  assert.equal(resumedState.endTime, 197_655);
  assert.equal(pausedState.endTime, state.endTime);
});

test("does not change state when pausing or resuming is not applicable", () => {
  const state = createGameState(() => 0, 0);
  const pausedState = pauseGame(state, 1_000);
  const gameOverState = finishGame(state, "lives");

  assert.equal(pauseGame(pausedState, 2_000), pausedState);
  assert.equal(resumeGame(state, 2_000), state);
  assert.equal(pauseGame(gameOverState, 2_000), gameOverState);
  assert.equal(pauseGame(state, 150_000), state);
});
