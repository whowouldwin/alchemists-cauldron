import assert from "node:assert/strict";
import test from "node:test";
import { RECIPES, type Difficulty } from "../src/data/recipes.ts";
import {
  getRecipesByDifficulty,
  pickRandomRecipe,
} from "../src/logic/recipe-generator.ts";

const RECIPE_COUNTS: Readonly<Record<Difficulty, number>> = {
  easy: 6,
  medium: 7,
  hard: 7,
};
const DIFFICULTIES: readonly Difficulty[] = ["easy", "medium", "hard"];

test("returns only recipes for the requested difficulty", () => {
  for (const difficulty of DIFFICULTIES) {
    const recipes = getRecipesByDifficulty(difficulty);

    assert.equal(recipes.length, RECIPE_COUNTS[difficulty]);
    assert.ok(recipes.every((recipe) => recipe.difficulty === difficulty));
  }
});

test("picks a recipe from the matching difficulty pool", () => {
  for (const difficulty of DIFFICULTIES) {
    const availableRecipes = RECIPES.filter(
      (recipe) => recipe.difficulty === difficulty,
    );

    assert.equal(
      pickRandomRecipe(difficulty, () => 0),
      availableRecipes[0],
    );
    assert.equal(
      pickRandomRecipe(difficulty, () => 0.999),
      availableRecipes.at(-1),
    );
  }
});

test("uses the random generator once for each selection", () => {
  let callCount = 0;

  pickRandomRecipe("medium", () => {
    callCount += 1;
    return 0.5;
  });

  assert.equal(callCount, 1);
});

test("rejects a random value outside the supported range", () => {
  assert.throws(() => pickRandomRecipe("easy", () => 1), RangeError);
});
