import type { Ingredient } from "../data/ingredients.ts";
import type { Difficulty, Recipe } from "../data/recipes.ts";
import { DIFFICULTY_SETTINGS } from "../data/difficulty-settings.ts";

export const MAX_CAULDRON_INGREDIENTS =
  DIFFICULTY_SETTINGS.medium.maxCauldronIngredients;
export const LEVEL_ONE_MAX_TIME =
  DIFFICULTY_SETTINGS.medium.startingTimeSeconds;
export const LEVEL_ONE_STARTING_LIVES =
  DIFFICULTY_SETTINGS.medium.startingLives;
export const LEVEL_ONE_RECIPE_DIFFICULTY: Difficulty = "medium";

export type BrewResult = "success" | "failure";
export type GameOverReason = "time" | "lives" | "out-of-ingredients";

export interface GameState {
  readonly difficulty: Difficulty;
  readonly activeReactionIds: readonly string[];
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
