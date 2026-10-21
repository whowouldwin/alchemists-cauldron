import {
  LEVEL_ONE_INGREDIENTS,
  type IngredientId,
} from "../data/ingredients.ts";
import {
  createInitialShelfStock,
  type ShelfStock,
} from "./create-shelf-stock.ts";

export const CAULDRON_CAPACITY = 4;

export type GameState = {
  shelfStock: ShelfStock;
  cauldronIngredients: IngredientId[];
};

export function createInitialGameState(
  random: () => number = Math.random,
): GameState {
  return {
    shelfStock: createInitialShelfStock(random),
    cauldronIngredients: [],
  };
}

export function addIngredient(
  state: GameState,
  ingredientId: IngredientId,
): GameState {
  const stock = state.shelfStock[ingredientId] ?? 0;

  if (stock < 1 || state.cauldronIngredients.length >= CAULDRON_CAPACITY) {
    return state;
  }

  return {
    shelfStock: {
      ...state.shelfStock,
      [ingredientId]: stock - 1,
    },
    cauldronIngredients: [...state.cauldronIngredients, ingredientId],
  };
}

export function isShelfBlocked(state: GameState): boolean {
  return state.cauldronIngredients.length >= CAULDRON_CAPACITY;
}

export function clearCauldron(state: GameState): GameState {
  return {
    ...state,
    cauldronIngredients: [],
  };
}

export function isKnownIngredient(
  ingredientId: string,
): ingredientId is IngredientId {
  return LEVEL_ONE_INGREDIENTS.some(
    (ingredient) => ingredient.id === ingredientId,
  );
}
