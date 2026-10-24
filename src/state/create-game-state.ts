import { LEVEL_ONE_INGREDIENTS } from "../data/ingredients.ts";
import { createShelfStock } from "../logic/create-shelf-stock.ts";
import { pickRandomRecipe } from "../logic/recipe-generator.ts";
import { MILLISECONDS_PER_SECOND } from "../logic/timer.ts";
import {
  LEVEL_ONE_MAX_TIME,
  LEVEL_ONE_RECIPE_DIFFICULTY,
  LEVEL_ONE_STARTING_LIVES,
  type GameState,
} from "./game-state.ts";

export function createGameState(
  random: () => number = Math.random,
  currentTime: number = Date.now(),
): GameState {
  return {
    cauldronIngredients: [],
    shelfStock: createShelfStock(LEVEL_ONE_INGREDIENTS, random),
    activeRecipe: pickRandomRecipe(LEVEL_ONE_RECIPE_DIFFICULTY, random),
    score: 0,
    endTime: currentTime + LEVEL_ONE_MAX_TIME * MILLISECONDS_PER_SECOND,
    remainingTimeAtPauseMs: null,
    lives: LEVEL_ONE_STARTING_LIVES,
    lastBrewResult: null,
    gameOverReason: null,
  };
}
