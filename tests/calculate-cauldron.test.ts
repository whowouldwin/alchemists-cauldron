import assert from "node:assert/strict";
import test from "node:test";
import { INGREDIENTS } from "../src/data/ingredients.ts";
import { calculateCauldron } from "../src/logic/calculate-cauldron.ts";

test("returns zero values for an empty cauldron", () => {
  assert.deepEqual(calculateCauldron([]), {
    temperature: 0,
    density: 0,
    magicPower: 0,
  });
});

test("sums all ingredient values, including negative values", () => {
  const ingredients = [INGREDIENTS[0], INGREDIENTS[2], INGREDIENTS[5]];

  assert.deepEqual(calculateCauldron(ingredients), {
    temperature: -13,
    density: 2,
    magicPower: 64,
  });
});

test("does not change the ingredients", () => {
  const ingredients = [INGREDIENTS[0], INGREDIENTS[2], INGREDIENTS[5]];
  const originalIngredients = structuredClone(ingredients);

  calculateCauldron(ingredients);

  assert.deepEqual(ingredients, originalIngredients);
});
