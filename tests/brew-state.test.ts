import assert from "node:assert/strict";
import test from "node:test";
import { DIFFICULTY_SETTINGS } from "../src/data/difficulty-settings.ts";
import { LEVEL_ONE_INGREDIENTS } from "../src/data/ingredients.ts";
import { LEVEL_ONE_MAX_TIME } from "../src/state/game-state.ts";
import { createGameState } from "../src/state/create-game-state.ts";
import { getGameTimeRemaining, pauseGame } from "../src/state/game-status.ts";
import {
  addIngredient,
  applyBrewResult,
  pourOut,
} from "../src/state/game-actions.ts";

function createStateWithIngredient(currentTime: number) {
  const state = createGameState(() => 0, currentTime);
  const ingredientId = LEVEL_ONE_INGREDIENTS[0].id;

  return addIngredient(state, ingredientId);
}

test("awards score and time, clears the cauldron, and selects a recipe on success", () => {
  const currentTime = 30_000;
  const state = {
    ...createStateWithIngredient(0),
    endTime: currentTime + 120_000,
  };
  const nextState = applyBrewResult(state, true, () => 0.5, currentTime);

  assert.deepEqual(nextState.cauldronIngredients, []);
  assert.equal(nextState.score, 200);
  assert.equal(getGameTimeRemaining(nextState, currentTime), 130);
  assert.equal(nextState.lives, state.lives);
  assert.notEqual(nextState.activeRecipe.id, state.activeRecipe.id);
  assert.equal(nextState.lastBrewResult, "success");
});

test("caps the successful brew time bonus at the Level 1 maximum", () => {
  const currentTime = 30_000;
  const state = {
    ...createStateWithIngredient(0),
    endTime: currentTime + (LEVEL_ONE_MAX_TIME - 5) * 1000,
  };
  const nextState = applyBrewResult(state, true, () => 0.5, currentTime);

  assert.equal(
    getGameTimeRemaining(nextState, currentTime),
    LEVEL_ONE_MAX_TIME,
  );
});

test("deducts a life and clears the cauldron on failure", () => {
  const currentTime = 1_000;
  const state = createStateWithIngredient(currentTime);
  const nextState = applyBrewResult(state, false, Math.random, currentTime);

  assert.deepEqual(nextState.cauldronIngredients, []);
  assert.equal(nextState.score, state.score);
  assert.equal(nextState.endTime, state.endTime);
  assert.equal(nextState.lives, state.lives - 1);
  assert.equal(nextState.activeRecipe, state.activeRecipe);
  assert.equal(nextState.lastBrewResult, "failure");
});

test("pours out the cauldron for ten seconds without changing other state", () => {
  const state = {
    ...createStateWithIngredient(0),
    score: 400,
    lives: 2,
    endTime: 80_000,
  };
  const nextState = pourOut(state);

  assert.deepEqual(nextState.cauldronIngredients, []);
  assert.equal(nextState.endTime, 70_000);
  assert.equal(nextState.score, state.score);
  assert.equal(nextState.lives, state.lives);
  assert.equal(nextState.activeRecipe, state.activeRecipe);
  assert.deepEqual(nextState.shelfStock, state.shelfStock);
  assert.deepEqual(nextState.activeReactionIds, state.activeReactionIds);
});

test("does not charge time when pouring out an empty or paused cauldron", () => {
  const emptyState = createGameState(() => 0, 0);
  const pausedState = pauseGame(createStateWithIngredient(0), 1_000);

  assert.equal(pourOut(emptyState), emptyState);
  assert.equal(pourOut(pausedState), pausedState);
});

test("does not apply a brew result to an empty cauldron", () => {
  const state = createGameState(() => 0, 0);

  assert.equal(applyBrewResult(state, true), state);
  assert.equal(applyBrewResult(state, false), state);
});

test("does not brew while the game is paused", () => {
  const pausedState = pauseGame(createStateWithIngredient(0), 1_000);

  assert.equal(applyBrewResult(pausedState, true), pausedState);
  assert.equal(applyBrewResult(pausedState, false), pausedState);
});

test("does not deduct lives below zero", () => {
  const state = { ...createStateWithIngredient(0), lives: 1 };
  const nextState = applyBrewResult(state, false);

  assert.equal(nextState.lives, 0);
});

test("clears the previous brew message when another ingredient is added", () => {
  const state = applyBrewResult(createStateWithIngredient(0), false);
  const ingredientId = LEVEL_ONE_INGREDIENTS[0].id;
  const nextState = addIngredient(state, ingredientId);

  assert.equal(nextState.lastBrewResult, null);
});

test("applies score and time bonuses for the selected difficulty", () => {
  const expectedResults = [
    { difficulty: "easy", score: 100, timeBonus: 15 },
    { difficulty: "medium", score: 200, timeBonus: 10 },
    { difficulty: "hard", score: 300, timeBonus: 5 },
  ] as const;

  for (const { difficulty, score, timeBonus } of expectedResults) {
    const currentTime = 10_000;
    const initialState = createGameState(() => 0, currentTime, difficulty);
    const ingredientId = Object.keys(initialState.shelfStock)[0];

    assert.ok(ingredientId !== undefined);

    const state = addIngredient(initialState, ingredientId);
    const stateWithLessTime = {
      ...state,
      endTime: state.endTime - 30_000,
    };
    const nextState = applyBrewResult(
      stateWithLessTime,
      true,
      () => 0,
      currentTime,
    );

    assert.equal(nextState.score, score);
    assert.equal(
      getGameTimeRemaining(nextState, currentTime),
      DIFFICULTY_SETTINGS[difficulty].startingTimeSeconds - 30 + timeBonus,
    );
    assert.equal(nextState.activeRecipe.difficulty, difficulty);
  }
});
