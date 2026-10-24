import { LEVEL_ONE_INGREDIENTS } from "../data/ingredients.ts";
import { pickRandomRecipe } from "../logic/recipe-generator.ts";
import { MILLISECONDS_PER_SECOND } from "../logic/timer.ts";
import {
  LEVEL_ONE_MAX_TIME,
  LEVEL_ONE_RECIPE_DIFFICULTY,
  MAX_CAULDRON_INGREDIENTS,
  type GameState,
} from "./game-state.ts";

const LEVEL_ONE_SCORE_PER_BREW = 200;
const LEVEL_ONE_TIME_BONUS = 10;

export function addIngredient(
  state: GameState,
  ingredientId: string,
): GameState {
  if (
    state.remainingTimeAtPauseMs !== null ||
    state.cauldronIngredients.length >= MAX_CAULDRON_INGREDIENTS
  ) {
    return state;
  }

  const ingredient = LEVEL_ONE_INGREDIENTS.find(
    ({ id }) => id === ingredientId,
  );
  const stock = state.shelfStock[ingredientId];

  if (ingredient === undefined || stock === undefined || stock <= 0) {
    return state;
  }

  return {
    ...state,
    cauldronIngredients: [...state.cauldronIngredients, ingredient],
    lastBrewResult: null,
    shelfStock: {
      ...state.shelfStock,
      [ingredientId]: stock - 1,
    },
  };
}

export function applyBrewResult(
  state: GameState,
  succeeded: boolean,
  random: () => number = Math.random,
  currentTime: number = Date.now(),
): GameState {
  if (
    state.remainingTimeAtPauseMs !== null ||
    state.cauldronIngredients.length === 0
  ) {
    return state;
  }

  const clearedState = { ...state, cauldronIngredients: [] };

  if (!succeeded) {
    return {
      ...clearedState,
      lives: Math.max(state.lives - 1, 0),
      lastBrewResult: "failure",
    };
  }

  const maximumEndTime =
    currentTime + LEVEL_ONE_MAX_TIME * MILLISECONDS_PER_SECOND;
  const bonusEndTime =
    state.endTime + LEVEL_ONE_TIME_BONUS * MILLISECONDS_PER_SECOND;

  return {
    ...clearedState,
    activeRecipe: pickRandomRecipe(LEVEL_ONE_RECIPE_DIFFICULTY, random),
    score: state.score + LEVEL_ONE_SCORE_PER_BREW,
    endTime: Math.min(bonusEndTime, maximumEndTime),
    lastBrewResult: "success",
  };
}
