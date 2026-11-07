import { DIFFICULTY_SETTINGS } from "../data/difficulty-settings.ts";
import {
  getIngredientsForDifficulty,
  type Ingredient,
} from "../data/ingredients.ts";
import { RECIPES, type Recipe } from "../data/recipes.ts";

export interface LaboratoryState {
  readonly recipe: Recipe;
  readonly ingredients: readonly Ingredient[];
  readonly selectedReactionIds: readonly string[];
}

export function createLaboratoryState(): LaboratoryState {
  return { recipe: RECIPES[0], ingredients: [], selectedReactionIds: [] };
}

export function isLaboratoryFull(state: LaboratoryState): boolean {
  const maximumIngredients =
    DIFFICULTY_SETTINGS[state.recipe.difficulty].maxCauldronIngredients;

  return state.ingredients.length >= maximumIngredients;
}

export function addLaboratoryIngredient(
  state: LaboratoryState,
  ingredientId: string,
): LaboratoryState {
  if (isLaboratoryFull(state)) {
    return state;
  }

  const ingredient = getIngredientsForDifficulty(state.recipe.difficulty).find(
    ({ id }) => id === ingredientId,
  );

  if (ingredient === undefined) {
    return state;
  }

  return { ...state, ingredients: [...state.ingredients, ingredient] };
}

export function selectLaboratoryRecipe(
  state: LaboratoryState,
  recipeId: string,
): LaboratoryState {
  const recipe = RECIPES.find(({ id }) => id === recipeId);

  if (recipe === undefined || recipe.id === state.recipe.id) {
    return state;
  }

  return { recipe, ingredients: [], selectedReactionIds: [] };
}

export function clearLaboratoryMixture(
  state: LaboratoryState,
): LaboratoryState {
  if (state.ingredients.length === 0) {
    return state;
  }

  return { ...state, ingredients: [] };
}
