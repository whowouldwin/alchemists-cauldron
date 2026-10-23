import { LEVEL_ONE_INGREDIENTS, type Ingredient } from "../data/ingredients.ts";
import { createShelfStock } from "../logic/create-shelf-stock.ts";
import { pickRandomRecipe } from "../logic/recipe-generator.ts";
import { getRemainingSeconds } from "../logic/timer.ts";
import type { Recipe } from "../data/recipes.ts";

export const MAX_CAULDRON_INGREDIENTS = 4;
export const LEVEL_ONE_MAX_TIME = 150;
export const LEVEL_ONE_STARTING_LIVES = 3;
const LEVEL_ONE_SCORE_PER_BREW = 200;
const LEVEL_ONE_TIME_BONUS = 10;
const MILLISECONDS_PER_SECOND = 1000;
const LEVEL_ONE_RECIPE_DIFFICULTY = "medium";

export type BrewResult = "success" | "failure";
export type GameOverReason = "time" | "lives" | "out-of-ingredients";

export interface GameState {
  readonly cauldronIngredients: readonly Ingredient[];
  readonly shelfStock: Readonly<Record<string, number>>;
  readonly activeRecipe: Recipe;
  readonly score: number;
  readonly endTime: number;
  readonly lives: number;
  readonly lastBrewResult: BrewResult | null;
  readonly gameOverReason: GameOverReason | null;
}

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
    lives: LEVEL_ONE_STARTING_LIVES,
    lastBrewResult: null,
    gameOverReason: null,
  };
}

export function addIngredient(
  state: GameState,
  ingredientId: string,
): GameState {
  if (state.cauldronIngredients.length >= MAX_CAULDRON_INGREDIENTS) {
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
  if (state.cauldronIngredients.length === 0) {
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

export function getGameTimeRemaining(
  state: GameState,
  currentTime: number = Date.now(),
): number {
  return getRemainingSeconds(state.endTime, currentTime);
}

export function getGameOverReason(
  state: GameState,
  currentTime: number = Date.now(),
): GameOverReason | null {
  if (getGameTimeRemaining(state, currentTime) === 0) {
    return "time";
  }

  if (state.lives === 0) {
    return "lives";
  }

  const shelfIsEmpty = Object.values(state.shelfStock).every(
    (stock) => stock === 0,
  );
  const cauldronIsEmpty = state.cauldronIngredients.length === 0;

  if (shelfIsEmpty && cauldronIsEmpty) {
    return "out-of-ingredients";
  }

  return null;
}

export function finishGame(
  state: GameState,
  reason: GameOverReason,
): GameState {
  return { ...state, gameOverReason: reason };
}
