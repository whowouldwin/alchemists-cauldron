import { LEVEL_ONE_INGREDIENTS, type Ingredient } from "../data/ingredients.ts";
import { createShelfStock } from "../logic/create-shelf-stock.ts";

export const MAX_CAULDRON_INGREDIENTS = 4;

export interface GameState {
  readonly cauldronIngredients: readonly Ingredient[];
  readonly shelfStock: Readonly<Record<string, number>>;
}

export function createGameState(random: () => number = Math.random): GameState {
  return {
    cauldronIngredients: [],
    shelfStock: createShelfStock(LEVEL_ONE_INGREDIENTS, random),
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
  };
}
