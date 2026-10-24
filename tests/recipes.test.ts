import assert from "node:assert/strict";
import test from "node:test";
import { RECIPES } from "../src/data/recipes.ts";

test("matches the full 20-recipe table", () => {
  assert.deepEqual(
    RECIPES.map(
      ({ id, name, difficulty, temperature, density, magicPower }) => [
        id,
        name,
        difficulty,
        temperature.minimum,
        temperature.maximum,
        density.minimum,
        density.maximum,
        magicPower.minimum,
        magicPower.maximum,
      ],
    ),
    [
      ["moon-mist", "Moon Mist", "easy", 32, 42, 12, 22, 17, 27],
      ["root-bloom", "Root Bloom", "easy", 2, 12, 24, 34, 15, 25],
      ["frost-steam", "Frost Steam", "easy", 2, 12, 7, 17, 19, 29],
      ["quiet-swirl", "Quiet Swirl", "easy", -28, -18, 19, 29, 17, 27],
      ["bright-dew", "Bright Dew", "easy", 27, 37, 32, 42, 25, 35],
      ["snow-dust", "Snow Dust", "easy", -16, -6, 28, 38, 29, 39],
      ["acid-spark", "Acid Spark", "medium", 17, 27, 18, 28, 29, 39],
      ["void-ember", "Void Ember", "medium", 0, 10, 0, 10, 45, 55],
      ["heavy-acid", "Heavy Acid", "medium", 0, 10, 29, 39, 25, 35],
      ["frost-acid", "Frost Acid", "medium", -13, -3, 13, 23, 31, 41],
      ["dusty-void", "Dusty Void", "medium", -13, -3, 0, 10, 47, 57],
      ["dragon-void", "Dragon Void", "medium", 25, 35, 1, 11, 55, 65],
      ["rooted-night", "Rooted Night", "medium", -18, -8, 14, 24, 55, 65],
      ["phoenix-pulse", "Phoenix Pulse", "hard", 57, 67, 0, 10, 37, 47],
      ["slime-crown", "Slime Crown", "hard", -5, 5, 45, 55, 3, 13],
      ["void-flame", "Void Flame", "hard", 25, 35, 0, 10, 60, 70],
      ["acid-bog", "Acid Bog", "hard", 10, 20, 39, 49, 17, 27],
      ["frozen-ash", "Frozen Ash", "hard", 27, 37, 0, 10, 39, 49],
      ["triple-eclipse", "Triple Eclipse", "hard", -20, -10, 19, 29, 60, 70],
      ["ember-soup", "Ember Soup", "hard", 62, 72, 24, 34, 37, 47],
    ],
  );
});

test("keeps recipe ranges ordered", () => {
  for (const recipe of RECIPES) {
    assert.ok(recipe.temperature.minimum <= recipe.temperature.maximum);
    assert.ok(recipe.density.minimum <= recipe.density.maximum);
    assert.ok(recipe.magicPower.minimum <= recipe.magicPower.maximum);
  }
});
