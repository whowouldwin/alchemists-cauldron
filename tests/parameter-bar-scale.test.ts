import assert from "node:assert/strict";
import test from "node:test";
import { LEVEL_ONE_INGREDIENTS } from "../src/data/ingredients.ts";
import {
  calculateMarkerPosition,
  calculateParameterScale,
} from "../src/logic/parameter-bar-scale.ts";

const INGREDIENT_LIMIT = 4;

test("creates symmetric scales for parameters that allow negative values", () => {
  assert.deepEqual(
    calculateParameterScale(
      LEVEL_ONE_INGREDIENTS,
      "temperature",
      INGREDIENT_LIMIT,
      true,
    ),
    { minimum: -100, maximum: 100 },
  );
  assert.deepEqual(
    calculateParameterScale(
      LEVEL_ONE_INGREDIENTS,
      "density",
      INGREDIENT_LIMIT,
      true,
    ),
    { minimum: -80, maximum: 80 },
  );
});

test("starts nonnegative parameter scales at zero", () => {
  assert.deepEqual(
    calculateParameterScale(
      LEVEL_ONE_INGREDIENTS,
      "magicPower",
      INGREDIENT_LIMIT,
      false,
    ),
    { minimum: 0, maximum: 160 },
  );
});

test("places zero at the center of a scale that supports negative values", () => {
  const scale = calculateParameterScale(
    LEVEL_ONE_INGREDIENTS,
    "temperature",
    INGREDIENT_LIMIT,
    true,
  );

  assert.equal(calculateMarkerPosition(0, scale), 50);
});

test("places minimum, maximum, and intermediate values proportionally", () => {
  const scale = calculateParameterScale(
    LEVEL_ONE_INGREDIENTS,
    "density",
    INGREDIENT_LIMIT,
    true,
  );

  assert.equal(calculateMarkerPosition(-80, scale), 0);
  assert.equal(calculateMarkerPosition(-40, scale), 25);
  assert.equal(calculateMarkerPosition(80, scale), 100);
});
