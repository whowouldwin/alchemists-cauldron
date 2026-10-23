import assert from "node:assert/strict";
import test from "node:test";
import { LEVEL_ONE_INGREDIENTS } from "../src/data/ingredients.ts";
import {
  addIngredient,
  applyBrewResult,
  createGameState,
  getGameTimeRemaining,
  LEVEL_ONE_MAX_TIME,
} from "../src/state/game-state.ts";

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

test("does not apply a brew result to an empty cauldron", () => {
  const state = createGameState(() => 0, 0);

  assert.equal(applyBrewResult(state, true), state);
  assert.equal(applyBrewResult(state, false), state);
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
