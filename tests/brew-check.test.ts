import assert from "node:assert/strict";
import test from "node:test";
import type { Recipe } from "../src/data/recipes.ts";
import {
  isBrewSuccessful,
  LEVEL_ONE_RECIPE_TOLERANCE,
} from "../src/logic/brew-check.ts";
import type { CauldronValues } from "../src/logic/calculate-cauldron.ts";

const RECIPE: Recipe = {
  id: "test-recipe",
  name: "Test Recipe",
  difficulty: "medium",
  temperature: { minimum: 32, maximum: 42 },
  density: { minimum: 12, maximum: 22 },
  magicPower: { minimum: 17, maximum: 27 },
};

const VALUES_AT_TARGET_MIDPOINT: CauldronValues = {
  temperature: 37,
  density: 17,
  magicPower: 22,
};

test("accepts values at the expanded minimum and maximum boundaries", () => {
  const valuesAtMinimum = {
    temperature: RECIPE.temperature.minimum - LEVEL_ONE_RECIPE_TOLERANCE,
    density: RECIPE.density.minimum - LEVEL_ONE_RECIPE_TOLERANCE,
    magicPower: RECIPE.magicPower.minimum - LEVEL_ONE_RECIPE_TOLERANCE,
  };
  const valuesAtMaximum = {
    temperature: RECIPE.temperature.maximum + LEVEL_ONE_RECIPE_TOLERANCE,
    density: RECIPE.density.maximum + LEVEL_ONE_RECIPE_TOLERANCE,
    magicPower: RECIPE.magicPower.maximum + LEVEL_ONE_RECIPE_TOLERANCE,
  };

  assert.equal(isBrewSuccessful(valuesAtMinimum, RECIPE), true);
  assert.equal(isBrewSuccessful(valuesAtMaximum, RECIPE), true);
});

test("fails when any cauldron value is outside its expanded target range", () => {
  const failingValues: readonly CauldronValues[] = [
    {
      ...VALUES_AT_TARGET_MIDPOINT,
      temperature: RECIPE.temperature.minimum - LEVEL_ONE_RECIPE_TOLERANCE - 1,
    },
    {
      ...VALUES_AT_TARGET_MIDPOINT,
      density: RECIPE.density.maximum + LEVEL_ONE_RECIPE_TOLERANCE + 1,
    },
    {
      ...VALUES_AT_TARGET_MIDPOINT,
      magicPower: RECIPE.magicPower.minimum - LEVEL_ONE_RECIPE_TOLERANCE - 1,
    },
  ];

  for (const values of failingValues) {
    assert.equal(isBrewSuccessful(values, RECIPE), false);
  }
});
