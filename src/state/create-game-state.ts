import { INGREDIENTS } from "../data/ingredients.ts";
import { DIFFICULTY_SETTINGS } from "../data/difficulty-settings.ts";
import type { Difficulty } from "../data/recipes.ts";
import { createShelfStock } from "../logic/create-shelf-stock.ts";
import { pickRandomRecipe } from "../logic/recipe-generator.ts";
import { MILLISECONDS_PER_SECOND } from "../logic/timer.ts";
import { LEVEL_ONE_RECIPE_DIFFICULTY, type GameState } from "./game-state.ts";

export function createGameState(
  random: () => number = Math.random,
  currentTime: number = Date.now(),
  difficulty: Difficulty = LEVEL_ONE_RECIPE_DIFFICULTY,
): GameState {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  const shelfIngredients = INGREDIENTS.slice(0, settings.shelfIngredientCount);

  return {
    difficulty,
    cauldronIngredients: [],
    shelfStock: createShelfStock(shelfIngredients, random),
    activeRecipe: pickRandomRecipe(difficulty, random),
    score: 0,
    endTime:
      currentTime + settings.startingTimeSeconds * MILLISECONDS_PER_SECOND,
    remainingTimeAtPauseMs: null,
    lives: settings.startingLives,
    lastBrewResult: null,
    gameOverReason: null,
  };
}
