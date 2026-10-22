import assert from "node:assert/strict";
import test from "node:test";
import { LEVEL_ONE_INGREDIENTS } from "../src/data/ingredients.ts";
import {
  addIngredient,
  applyBrewResult,
  createGameState,
  LEVEL_ONE_MAX_TIME,
} from "../src/state/game-state.ts";

function createStateWithIngredient() {
  const state = createGameState(() => 0);
  const ingredientId = LEVEL_ONE_INGREDIENTS[0].id;

  return addIngredient(state, ingredientId);
}

test("awards score and time, clears the cauldron, and selects a recipe on success", () => {
  const state = {
    ...createStateWithIngredient(),
    timeRemaining: 145,
  };
  const nextState = applyBrewResult(state, true, () => 0.5);

  assert.deepEqual(nextState.cauldronIngredients, []);
  assert.equal(nextState.score, 200);
  assert.equal(nextState.timeRemaining, LEVEL_ONE_MAX_TIME);
  assert.equal(nextState.lives, state.lives);
  assert.notEqual(nextState.activeRecipe.id, state.activeRecipe.id);
});

test("deducts a life and clears the cauldron on failure", () => {
  const state = createStateWithIngredient();
  const nextState = applyBrewResult(state, false);

  assert.deepEqual(nextState.cauldronIngredients, []);
  assert.equal(nextState.score, state.score);
  assert.equal(nextState.timeRemaining, state.timeRemaining);
  assert.equal(nextState.lives, state.lives - 1);
  assert.equal(nextState.activeRecipe, state.activeRecipe);
});

test("does not apply a brew result to an empty cauldron", () => {
  const state = createGameState(() => 0);

  assert.equal(applyBrewResult(state, true), state);
  assert.equal(applyBrewResult(state, false), state);
});

test("does not deduct lives below zero", () => {
  const state = { ...createStateWithIngredient(), lives: 1 };
  const nextState = applyBrewResult(state, false);

  assert.equal(nextState.lives, 0);
});
