import assert from "node:assert/strict";
import test from "node:test";
import { LEVEL_ONE_INGREDIENTS } from "../src/data/ingredients.ts";
import {
  calculateTargetPosition,
  calculateMarkerPosition,
  calculateParameterScale,
  isValueInTargetRange,
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

test("places zero at the start of a nonnegative scale", () => {
  const scale = calculateParameterScale(
    LEVEL_ONE_INGREDIENTS,
    "magicPower",
    INGREDIENT_LIMIT,
    false,
  );

  assert.equal(calculateMarkerPosition(0, scale), 0);
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

test("positions recipe target zones within the visible scale", () => {
  assert.deepEqual(
    calculateTargetPosition(
      { minimum: -40, maximum: 20 },
      { minimum: -80, maximum: 80 },
    ),
    { left: 25, width: 37.5 },
  );
  assert.deepEqual(
    calculateTargetPosition(
      { minimum: 90, maximum: 120 },
      { minimum: -80, maximum: 80 },
    ),
    { left: 100, width: 0 },
  );
});

test("includes both target range boundaries", () => {
  const targetRange = { minimum: -8, maximum: 12 };

  assert.equal(isValueInTargetRange(-8, targetRange), true);
  assert.equal(isValueInTargetRange(12, targetRange), true);
  assert.equal(isValueInTargetRange(13, targetRange), false);
});
