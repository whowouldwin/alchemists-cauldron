import assert from "node:assert/strict";
import test from "node:test";

import { INGREDIENTS, LEVEL_ONE_INGREDIENTS } from "../src/data/ingredients.ts";
import { createInitialShelfStock } from "../src/logic/create-shelf-stock.ts";

test("keeps all eight ingredients in catalogue order and uses the first six in Level 1", () => {
  assert.equal(INGREDIENTS.length, 8);
  assert.deepEqual(
    LEVEL_ONE_INGREDIENTS.map((ingredient) => ingredient.id),
    INGREDIENTS.slice(0, 6).map((ingredient) => ingredient.id),
  );
});

test("creates a stock value from 2 through 15 for each Level 1 ingredient", () => {
  const randomValues = [0, 0.5, 0.999999, 0.25, 0.75, 0.1];
  const stock = createInitialShelfStock(() => randomValues.shift() ?? 0);

  assert.deepEqual(
    Object.keys(stock),
    LEVEL_ONE_INGREDIENTS.map((ingredient) => ingredient.id),
  );
  assert.deepEqual(Object.values(stock), [2, 9, 15, 5, 12, 3]);
  assert.ok(Object.values(stock).every((value) => value >= 2 && value <= 15));
});
