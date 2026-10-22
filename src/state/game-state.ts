import { LEVEL_ONE_INGREDIENTS, type Ingredient } from "../data/ingredients.ts";
import { createShelfStock } from "../logic/create-shelf-stock.ts";
import { pickRandomRecipe } from "../logic/recipe-generator.ts";
import type { Recipe } from "../data/recipes.ts";

export const MAX_CAULDRON_INGREDIENTS = 4;
const LEVEL_ONE_RECIPE_DIFFICULTY = "medium";

export interface GameState {
  readonly cauldronIngredients: readonly Ingredient[];
  readonly shelfStock: Readonly<Record<string, number>>;
  readonly activeRecipe: Recipe;
}

export function createGameState(random: () => number = Math.random): GameState {
  return {
    cauldronIngredients: [],
    shelfStock: createShelfStock(LEVEL_ONE_INGREDIENTS, random),
    activeRecipe: pickRandomRecipe(LEVEL_ONE_RECIPE_DIFFICULTY, random),
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
    cauldronIngredients: [...state.cauldronIngredients, ingredient],
    shelfStock: {
      ...state.shelfStock,
      [ingredientId]: stock - 1,
    },
    activeRecipe: state.activeRecipe,
  };
}
