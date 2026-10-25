import assert from "node:assert/strict";
import test from "node:test";
import { LEVEL_ONE_INGREDIENTS } from "../src/data/ingredients.ts";
import { DIFFICULTY_SETTINGS } from "../src/data/difficulty-settings.ts";
import { getRecipesByDifficulty } from "../src/logic/recipe-generator.ts";
import { isValidReactionSelection } from "../src/logic/reactions/reaction-catalog.ts";
import { MAX_CAULDRON_INGREDIENTS } from "../src/state/game-state.ts";
import { createGameState } from "../src/state/create-game-state.ts";
import {
  addIngredient,
  addIngredientWithReactions,
  canAddIngredient,
} from "../src/state/game-actions.ts";
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
    {
      difficulty: "easy",
      shelfSize: 4,
      startingTime: 180,
      lives: 5,
      reactionCount: 0,
    },
    {
      difficulty: "medium",
      shelfSize: 6,
      startingTime: 150,
      lives: 3,
      reactionCount: 2,
    },
    {
      difficulty: "hard",
      shelfSize: 8,
      startingTime: 150,
      lives: 3,
      reactionCount: 3,
    },
  ] as const;

  for (const {
    difficulty,
    shelfSize,
    startingTime,
    lives,
    reactionCount,
  } of expectedSettings) {
    const state = createGameState(() => 0, 10_000, difficulty);

    assert.equal(state.difficulty, difficulty);
    assert.equal(Object.keys(state.shelfStock).length, shelfSize);
    assert.equal(state.endTime, 10_000 + startingTime * 1_000);
    assert.equal(state.lives, lives);
    assert.equal(state.activeRecipe.difficulty, difficulty);
    assert.equal(
      DIFFICULTY_SETTINGS[state.difficulty].reactionCount,
      reactionCount,
    );
    assert.equal(state.activeReactionIds.length, reactionCount);
    assert.ok(isValidReactionSelection(state.activeReactionIds, difficulty));
  }
});

test("adds ingredients in order and spends one stock per addition", () => {
  const initialState = createGameState(() => 0.5);
  const firstIngredientId = LEVEL_ONE_INGREDIENTS[0].id;
  const secondIngredientId = LEVEL_ONE_INGREDIENTS[1].id;
  assert.equal(canAddIngredient(initialState, firstIngredientId), true);
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

test("applies Bubbling's time penalty only when it first activates", () => {
  const generatedState = createGameState(() => 0.5);
  const initialState = {
    ...generatedState,
    activeReactionIds: ["bubbling"],
    endTime: 100_000,
    shelfStock: {
      ...generatedState.shelfStock,
      "fairy-dust": 2,
      "caustic-acid": 2,
      "dragon-tears": 2,
    },
  };
  const afterFairyDust = addIngredient(initialState, "fairy-dust");
  const acidAddition = addIngredientWithReactions(
    afterFairyDust,
    "caustic-acid",
  );
  const afterAnotherIngredient = addIngredientWithReactions(
    acidAddition.state,
    "dragon-tears",
  );

  assert.deepEqual(
    acidAddition.activatedReactions.map(({ id }) => id),
    ["bubbling"],
  );
  assert.equal(acidAddition.state.endTime, 90_000);
  assert.deepEqual(afterAnotherIngredient.activatedReactions, []);
  assert.equal(afterAnotherIngredient.state.endTime, 90_000);
});

test("Volatile Mix removes one life and clears the cauldron", () => {
  const generatedState = createGameState(() => 0.5, 0, "hard");
  const initialState = {
    ...generatedState,
    activeReactionIds: ["volatile-mix"],
    shelfStock: {
      ...generatedState.shelfStock,
      "phoenix-feather": 2,
      "essence-of-the-void": 2,
    },
  };
  const afterPhoenixFeather = addIngredient(initialState, "phoenix-feather");
  const volatileMixAddition = addIngredientWithReactions(
    afterPhoenixFeather,
    "essence-of-the-void",
  );

  assert.deepEqual(
    volatileMixAddition.activatedReactions.map(({ id }) => id),
    ["volatile-mix"],
  );
  assert.equal(volatileMixAddition.state.lives, initialState.lives - 1);
  assert.deepEqual(volatileMixAddition.state.cauldronIngredients, []);
  assert.equal(volatileMixAddition.state.shelfStock["essence-of-the-void"], 1);
});

test("does not add an ingredient whose stock is empty", () => {
  const initialState = createGameState(() => 0);
  const ingredientId = LEVEL_ONE_INGREDIENTS[0].id;
  const stateAfterTwoAdditions = addIngredient(
    addIngredient(initialState, ingredientId),
    ingredientId,
  );

  assert.equal(stateAfterTwoAdditions.shelfStock[ingredientId], 0);
  assert.equal(canAddIngredient(stateAfterTwoAdditions, ingredientId), false);
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
  assert.equal(canAddIngredient(fullState, ingredientId), false);
  assert.equal(addIngredient(fullState, ingredientId), fullState);
  assert.equal(
    fullState.shelfStock[ingredientId],
    15 - MAX_CAULDRON_INGREDIENTS,
  );
});

test("uses the selected difficulty cauldron capacity", () => {
  const hardState = createGameState(() => 0.999, 0, "hard");
  let fullState = hardState;

  for (let index = 0; index < 5; index += 1) {
    fullState = addIngredient(fullState, "toad-slime");
  }

  assert.equal(fullState.cauldronIngredients.length, 5);
  assert.equal(addIngredient(fullState, "toad-slime"), fullState);
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

  assert.equal(canAddIngredient(state, ingredientId), false);
  assert.equal(addIngredient(state, ingredientId), state);
});
