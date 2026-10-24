import { INGREDIENTS } from "../data/ingredients.ts";
import { DIFFICULTY_SETTINGS } from "../data/difficulty-settings.ts";
import { pickRandomRecipe } from "../logic/recipe-generator.ts";
import { MILLISECONDS_PER_SECOND } from "../logic/timer.ts";
import type { GameState } from "./game-state.ts";

export function addIngredient(
  state: GameState,
  ingredientId: string,
): GameState {
  const settings = DIFFICULTY_SETTINGS[state.difficulty];

  if (
    state.remainingTimeAtPauseMs !== null ||
    state.cauldronIngredients.length >= settings.maxCauldronIngredients
  ) {
    return state;
  }

  const ingredient = INGREDIENTS.find(({ id }) => id === ingredientId);
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
  const settings = DIFFICULTY_SETTINGS[state.difficulty];

  if (!succeeded) {
    return {
      ...clearedState,
      lives: Math.max(state.lives - 1, 0),
      lastBrewResult: "failure",
    };
  }

  const maximumEndTime =
    currentTime + settings.startingTimeSeconds * MILLISECONDS_PER_SECOND;
  const bonusEndTime =
    state.endTime + settings.timeBonusSeconds * MILLISECONDS_PER_SECOND;

  return {
    ...clearedState,
    activeRecipe: pickRandomRecipe(state.difficulty, random),
    score: state.score + settings.scorePerBrew,
    endTime: Math.min(bonusEndTime, maximumEndTime),
    lastBrewResult: "success",
  };
}
