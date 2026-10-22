import { LEVEL_ONE_INGREDIENTS, type Ingredient } from "../data/ingredients.ts";
import { createShelfStock } from "../logic/create-shelf-stock.ts";
import { pickRandomRecipe } from "../logic/recipe-generator.ts";
import type { Recipe } from "../data/recipes.ts";

export const MAX_CAULDRON_INGREDIENTS = 4;
export const LEVEL_ONE_MAX_TIME = 150;
export const LEVEL_ONE_STARTING_LIVES = 3;
const LEVEL_ONE_SCORE_PER_BREW = 200;
const LEVEL_ONE_TIME_BONUS = 10;
const LEVEL_ONE_RECIPE_DIFFICULTY = "medium";

export interface GameState {
  readonly cauldronIngredients: readonly Ingredient[];
  readonly shelfStock: Readonly<Record<string, number>>;
  readonly activeRecipe: Recipe;
  readonly score: number;
  readonly timeRemaining: number;
  readonly lives: number;
}

export function createGameState(random: () => number = Math.random): GameState {
  return {
    cauldronIngredients: [],
    shelfStock: createShelfStock(LEVEL_ONE_INGREDIENTS, random),
    activeRecipe: pickRandomRecipe(LEVEL_ONE_RECIPE_DIFFICULTY, random),
    score: 0,
    timeRemaining: LEVEL_ONE_MAX_TIME,
    lives: LEVEL_ONE_STARTING_LIVES,
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
): GameState {
  if (state.cauldronIngredients.length === 0) {
    return state;
  }

  const clearedState = { ...state, cauldronIngredients: [] };

  if (!succeeded) {
    return { ...clearedState, lives: Math.max(state.lives - 1, 0) };
  }

  return {
    ...clearedState,
    activeRecipe: pickRandomRecipe(LEVEL_ONE_RECIPE_DIFFICULTY, random),
    score: state.score + LEVEL_ONE_SCORE_PER_BREW,
    timeRemaining: Math.min(
      state.timeRemaining + LEVEL_ONE_TIME_BONUS,
      LEVEL_ONE_MAX_TIME,
    ),
  };
}
