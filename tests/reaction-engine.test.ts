import assert from "node:assert/strict";
import test from "node:test";
import type { Recipe } from "../src/data/recipes.ts";
import {
  getIngredientsForDifficulty,
  INGREDIENTS,
} from "../src/data/ingredients.ts";
import { isBrewSuccessful } from "../src/logic/brew-check.ts";
import {
  getAvailableReactionsForDifficulty,
  isValidReactionSelection,
  selectReactionIdsForDifficulty,
  REACTIONS,
} from "../src/logic/reactions/reaction-catalog.ts";
import {
  getNewlyActivatedReactions,
  resolveCauldronReactions,
} from "../src/logic/reactions/reaction-engine.ts";

function getIngredient(id: string) {
  const ingredient = INGREDIENTS.find((item) => item.id === id);

  assert.ok(ingredient, `Expected ingredient "${id}" to exist.`);

  return ingredient;
}

test("defines all reactions in one typed catalogue with unique ids", () => {
  assert.equal(REACTIONS.length, 15);
  assert.equal(new Set(REACTIONS.map(({ id }) => id)).size, REACTIONS.length);
});

test("selects a distinct eligible reaction set for each difficulty", () => {
  const mediumIds = selectReactionIdsForDifficulty("medium", () => 0);
  const anotherMediumIds = selectReactionIdsForDifficulty(
    "medium",
    () => 0.999,
  );
  const hardIds = selectReactionIdsForDifficulty("hard", () => 0.5);
  const mediumIngredients = getIngredientsForDifficulty("medium");
  const mediumIngredientIds = new Set(mediumIngredients.map(({ id }) => id));
  const availableMediumReactionIds = new Set(
    getAvailableReactionsForDifficulty("medium").map(({ id }) => id),
  );

  assert.deepEqual(
    selectReactionIdsForDifficulty("easy", () => 0),
    [],
  );
  assert.equal(mediumIds.length, 2);
  assert.equal(hardIds.length, 3);
  assert.notDeepEqual(mediumIds, anotherMediumIds);
  assert.equal(new Set(mediumIds).size, mediumIds.length);
  assert.equal(new Set(hardIds).size, hardIds.length);
  assert.ok(isValidReactionSelection(mediumIds, "medium"));
  assert.ok(isValidReactionSelection(hardIds, "hard"));
  assert.ok(availableMediumReactionIds.has("bubbling"));
  assert.ok(availableMediumReactionIds.has("solar-frost"));
  assert.ok(!availableMediumReactionIds.has("volatile-mix"));
  assert.ok(!availableMediumReactionIds.has("rooted-steam"));
  assert.ok(mediumIngredientIds.has("fairy-dust"));
  assert.ok(mediumIngredientIds.has("caustic-acid"));
  assert.ok(mediumIngredientIds.has("dragon-tears"));
  assert.ok(mediumIngredientIds.has("frost-lotus"));
});

test("recalculates values from ingredients before applying active reactions", () => {
  const ingredients = [
    getIngredient("fairy-dust"),
    getIngredient("caustic-acid"),
  ];

  const result = resolveCauldronReactions(ingredients, ["bubbling"]);

  assert.deepEqual(result.values, {
    temperature: 22,
    density: 23,
    magicPower: 51,
  });
  assert.deepEqual(
    result.activeReactions.map(({ id }) => id),
    ["bubbling"],
  );
});

test("applies Solar Frost to the current cauldron values", () => {
  const result = resolveCauldronReactions(
    [getIngredient("dragon-tears"), getIngredient("frost-lotus")],
    ["solar-frost"],
  );

  assert.deepEqual(result.values, {
    temperature: 0,
    density: 14.4,
    magicPower: 24,
  });
  assert.deepEqual(
    result.activeReactions.map(({ id }) => id),
    ["solar-frost"],
  );
});

test("reports a reaction only when it first becomes active", () => {
  const before = [getIngredient("fairy-dust")];
  const current = [...before, getIngredient("caustic-acid")];
  const stillActive = [...current, getIngredient("dragon-tears")];

  assert.deepEqual(
    getNewlyActivatedReactions(before, current, ["bubbling"]).map(
      ({ id }) => id,
    ),
    ["bubbling"],
  );
  assert.deepEqual(
    getNewlyActivatedReactions(current, stillActive, ["bubbling"]),
    [],
  );
});

test("uses reaction-adjusted values for brew checks", () => {
  const ingredients = [
    getIngredient("fairy-dust"),
    getIngredient("caustic-acid"),
  ];
  const { values } = resolveCauldronReactions(ingredients, ["bubbling"]);
  const recipe: Recipe = {
    id: "bubbling-test",
    name: "Bubbling Test",
    difficulty: "medium",
    temperature: { minimum: 22, maximum: 22 },
    density: { minimum: 23, maximum: 23 },
    magicPower: { minimum: 51, maximum: 51 },
  };

  assert.equal(isBrewSuccessful(values, recipe, "medium"), true);
  assert.equal(
    isBrewSuccessful({ ...values, magicPower: 34 }, recipe, "medium"),
    false,
  );
});
