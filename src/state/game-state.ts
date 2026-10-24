import type { Ingredient } from "../data/ingredients.ts";
import type { Recipe } from "../data/recipes.ts";

export const MAX_CAULDRON_INGREDIENTS = 4;
export const LEVEL_ONE_MAX_TIME = 150;
export const LEVEL_ONE_STARTING_LIVES = 3;
export const LEVEL_ONE_RECIPE_DIFFICULTY = "medium";

export type BrewResult = "success" | "failure";
export type GameOverReason = "time" | "lives" | "out-of-ingredients";

export interface GameState {
  readonly cauldronIngredients: readonly Ingredient[];
  readonly shelfStock: Readonly<Record<string, number>>;
  readonly activeRecipe: Recipe;
  readonly score: number;
  readonly endTime: number;
  readonly remainingTimeAtPauseMs: number | null;
  readonly lives: number;
  readonly lastBrewResult: BrewResult | null;
  readonly gameOverReason: GameOverReason | null;
}
