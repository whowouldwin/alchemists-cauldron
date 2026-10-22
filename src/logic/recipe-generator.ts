import { RECIPES, type Difficulty, type Recipe } from "../data/recipes.ts";

export function getRecipesByDifficulty(
  difficulty: Difficulty,
): readonly Recipe[] {
  return RECIPES.filter((recipe) => recipe.difficulty === difficulty);
}

export function pickRandomRecipe(
  difficulty: Difficulty,
  random: () => number = Math.random,
): Recipe {
  const availableRecipes = getRecipesByDifficulty(difficulty);
  const recipeIndex = Math.floor(random() * availableRecipes.length);
  const recipe = availableRecipes[recipeIndex];

  if (recipe === undefined) {
    throw new RangeError("The random generator must return a value in [0, 1).");
  }

  return recipe;
}
