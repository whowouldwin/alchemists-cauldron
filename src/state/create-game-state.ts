import { getIngredientsForDifficulty } from "../data/ingredients.ts";
import { DIFFICULTY_SETTINGS } from "../data/difficulty-settings.ts";
import type { Difficulty } from "../data/recipes.ts";
import { createShelfStock } from "../logic/create-shelf-stock.ts";
import { pickRandomRecipe } from "../logic/recipe-generator.ts";
import { selectReactionIdsForDifficulty } from "../logic/reactions/reaction-catalog.ts";
import { MILLISECONDS_PER_SECOND } from "../logic/timer.ts";
import { LEVEL_ONE_RECIPE_DIFFICULTY, type GameState } from "./game-state.ts";

export function createGameState(
  random: () => number = Math.random,
  currentTime: number = Date.now(),
  difficulty: Difficulty = LEVEL_ONE_RECIPE_DIFFICULTY,
): GameState {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  const shelfIngredients = getIngredientsForDifficulty(difficulty);
  const shelfStock = createShelfStock(shelfIngredients, random);
  const activeRecipe = pickRandomRecipe(difficulty, random);
  const activeReactionIds = selectReactionIdsForDifficulty(difficulty, random);

  return {
    difficulty,
    activeReactionIds,
    cauldronIngredients: [],
    shelfStock,
    activeRecipe,
    score: 0,
    endTime:
      currentTime + settings.startingTimeSeconds * MILLISECONDS_PER_SECOND,
    remainingTimeAtPauseMs: null,
    lives: settings.startingLives,
    lastBrewResult: null,
    gameOverReason: null,
  };
}
