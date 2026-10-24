import assert from "node:assert/strict";
import test from "node:test";
import { LEVEL_ONE_INGREDIENTS } from "../src/data/ingredients.ts";
import { getRecipesByDifficulty } from "../src/logic/recipe-generator.ts";
import { MAX_CAULDRON_INGREDIENTS } from "../src/state/game-state.ts";
import { createGameState } from "../src/state/create-game-state.ts";
import { addIngredient } from "../src/state/game-actions.ts";
import { getGameTimeRemaining, pauseGame } from "../src/state/game-status.ts";

test("starts with an empty cauldron and stock for the Level 1 shelf", () => {
  const currentTime = 10_000;
  const state = createGameState(() => 0, currentTime);

  assert.deepEqual(state.cauldronIngredients, []);
  assert.deepEqual(Object.keys(state.shelfStock), [
    ...LEVEL_ONE_INGREDIENTS.map(({ id }) => id),
  ]);
  assert.deepEqual(Object.values(state.shelfStock), [2, 2, 2, 2, 2, 2]);
  assert.ok(getRecipesByDifficulty("medium").includes(state.activeRecipe));
  assert.equal(state.score, 0);
  assert.equal(state.endTime, currentTime + 150_000);
  assert.equal(getGameTimeRemaining(state, currentTime), 150);
  assert.equal(state.lives, 3);
  assert.equal(state.difficulty, "medium");
  assert.equal(state.lastBrewResult, null);
});

test("creates the initial state from the selected difficulty settings", () => {
  const expectedSettings = [
    { difficulty: "easy", shelfSize: 4, startingTime: 180, lives: 5 },
    { difficulty: "medium", shelfSize: 6, startingTime: 150, lives: 3 },
    { difficulty: "hard", shelfSize: 8, startingTime: 150, lives: 3 },
  ] as const;

  for (const {
    difficulty,
    shelfSize,
    startingTime,
    lives,
  } of expectedSettings) {
    const state = createGameState(() => 0, 10_000, difficulty);

    assert.equal(state.difficulty, difficulty);
    assert.equal(Object.keys(state.shelfStock).length, shelfSize);
    assert.equal(state.endTime, 10_000 + startingTime * 1_000);
    assert.equal(state.lives, lives);
    assert.equal(state.activeRecipe.difficulty, difficulty);
  }
});

test("adds ingredients in order and spends one stock per addition", () => {
  const initialState = createGameState(() => 0.5);
  const firstIngredientId = LEVEL_ONE_INGREDIENTS[0].id;
  const secondIngredientId = LEVEL_ONE_INGREDIENTS[1].id;
  const afterFirstAddition = addIngredient(initialState, firstIngredientId);
  const afterSecondAddition = addIngredient(
    afterFirstAddition,
    secondIngredientId,
  );

  assert.deepEqual(
    afterSecondAddition.cauldronIngredients.map(({ id }) => id),
    [firstIngredientId, secondIngredientId],
  );
  assert.equal(afterSecondAddition.shelfStock[firstIngredientId], 8);
  assert.equal(afterSecondAddition.shelfStock[secondIngredientId], 8);
  assert.equal(initialState.shelfStock[firstIngredientId], 9);
});

test("does not add an ingredient whose stock is empty", () => {
  const initialState = createGameState(() => 0);
  const ingredientId = LEVEL_ONE_INGREDIENTS[0].id;
  const stateAfterTwoAdditions = addIngredient(
    addIngredient(initialState, ingredientId),
    ingredientId,
  );

  assert.equal(stateAfterTwoAdditions.shelfStock[ingredientId], 0);
  assert.equal(
    addIngredient(stateAfterTwoAdditions, ingredientId),
    stateAfterTwoAdditions,
  );
});

test("does not exceed the cauldron capacity", () => {
  const initialState = createGameState(() => 0.999);
  const ingredientId = LEVEL_ONE_INGREDIENTS[0].id;
  let fullState = initialState;

  for (let index = 0; index < MAX_CAULDRON_INGREDIENTS; index += 1) {
    fullState = addIngredient(fullState, ingredientId);
  }

  assert.equal(fullState.cauldronIngredients.length, MAX_CAULDRON_INGREDIENTS);
  assert.equal(addIngredient(fullState, ingredientId), fullState);
  assert.equal(
    fullState.shelfStock[ingredientId],
    15 - MAX_CAULDRON_INGREDIENTS,
  );
});

test("ignores ingredient identifiers that are not on the shelf", () => {
  const state = createGameState(() => 0.5);

  assert.equal(addIngredient(state, "unknown-ingredient"), state);
});

test("does not add ingredients while the game is paused", () => {
  const state = pauseGame(
    createGameState(() => 0.5),
    1_000,
  );
  const ingredientId = LEVEL_ONE_INGREDIENTS[0].id;

  assert.equal(addIngredient(state, ingredientId), state);
});
