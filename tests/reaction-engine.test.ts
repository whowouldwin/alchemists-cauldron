import assert from "node:assert/strict";
import test from "node:test";
import {
  getIngredientsForDifficulty,
  INGREDIENTS,
} from "../src/data/ingredients.ts";
import {
  getReactionsForDifficulty,
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

test("enables two available reactions on medium and three on hard", () => {
  const mediumReactions = getReactionsForDifficulty("medium");
  const hardReactions = getReactionsForDifficulty("hard");
  const mediumIngredients = getIngredientsForDifficulty("medium");
  const mediumIngredientIds = new Set(mediumIngredients.map(({ id }) => id));

  assert.equal(getReactionsForDifficulty("easy").length, 0);
  assert.equal(mediumReactions.length, 2);
  assert.equal(hardReactions.length, 3);
  assert.deepEqual(
    mediumReactions.map(({ id }) => id),
    ["bubbling", "solar-frost"],
  );
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

  const result = resolveCauldronReactions(ingredients, "medium");

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
    "hard",
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
    getNewlyActivatedReactions(before, current, "medium").map(({ id }) => id),
    ["bubbling"],
  );
  assert.deepEqual(
    getNewlyActivatedReactions(current, stillActive, "medium"),
    [],
  );
});
