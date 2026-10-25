import {
  getIngredientsForDifficulty,
  INGREDIENTS,
} from "../data/ingredients.ts";
import { DIFFICULTY_SETTINGS } from "../data/difficulty-settings.ts";
import { RECIPES, type Difficulty, type Recipe } from "../data/recipes.ts";
import { MILLISECONDS_PER_SECOND } from "../logic/timer.ts";
import {
  isValidReactionSelection,
  selectReactionIdsForDifficulty,
} from "../logic/reactions/reaction-catalog.ts";
import type { GameState } from "../state/game-state.ts";
import { getGameTimeRemaining } from "../state/game-status.ts";

export const GAME_SAVE_STORAGE_KEY = "alchemists-cauldron.save";

export interface GameSaveStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface SavedGame {
  readonly version: 2;
  readonly difficulty: Difficulty;
  readonly activeReactionIds: GameState["activeReactionIds"];
  readonly score: number;
  readonly timeLeft: number;
  readonly lives: number;
  readonly activeRecipe: Recipe;
  readonly cauldronIngredients: GameState["cauldronIngredients"];
  readonly shelfStock: GameState["shelfStock"];
  readonly status: "playing" | "paused";
}

interface LegacySavedGame extends Omit<
  SavedGame,
  "version" | "activeReactionIds"
> {
  readonly version: 1;
}

export function saveGame(
  state: GameState,
  storage?: GameSaveStorage,
  currentTime: number = Date.now(),
): boolean {
  if (state.gameOverReason !== null) {
    clearSave(storage);
    return false;
  }

  const timeLeft = getGameTimeRemaining(state, currentTime);

  if (timeLeft === 0) {
    clearSave(storage);
    return false;
  }

  const savedGame: SavedGame = {
    version: 2,
    difficulty: state.difficulty,
    activeReactionIds: state.activeReactionIds,
    score: state.score,
    timeLeft,
    lives: state.lives,
    activeRecipe: state.activeRecipe,
    cauldronIngredients: state.cauldronIngredients,
    shelfStock: state.shelfStock,
    status: state.remainingTimeAtPauseMs === null ? "playing" : "paused",
  };

  try {
    getStorage(storage).setItem(
      GAME_SAVE_STORAGE_KEY,
      JSON.stringify(savedGame),
    );
    return true;
  } catch {
    return false;
  }
}

export function loadGame(storage?: GameSaveStorage): SavedGame | null {
  try {
    const rawSave = getStorage(storage).getItem(GAME_SAVE_STORAGE_KEY);

    if (rawSave === null) {
      return null;
    }

    const parsedSave: unknown = JSON.parse(rawSave);

    if (isValidSavedGame(parsedSave)) {
      return parsedSave;
    }

    if (isValidLegacySavedGame(parsedSave)) {
      return migrateLegacySavedGame(parsedSave);
    }

    clearSave(storage);
    return null;
  } catch {
    clearSave(storage);
    return null;
  }
}

export function clearSave(storage?: GameSaveStorage): boolean {
  try {
    getStorage(storage).removeItem(GAME_SAVE_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function restoreGameState(
  savedGame: SavedGame,
  currentTime: number = Date.now(),
): GameState {
  const remainingTimeAtPauseMs = savedGame.timeLeft * MILLISECONDS_PER_SECOND;

  return {
    difficulty: savedGame.difficulty,
    activeReactionIds: savedGame.activeReactionIds,
    score: savedGame.score,
    lives: savedGame.lives,
    activeRecipe: savedGame.activeRecipe,
    cauldronIngredients: savedGame.cauldronIngredients,
    shelfStock: savedGame.shelfStock,
    endTime: currentTime + remainingTimeAtPauseMs,
    remainingTimeAtPauseMs,
    lastBrewResult: null,
    gameOverReason: null,
  };
}

function isValidSavedGame(value: unknown): value is SavedGame {
  if (
    !isRecord(value) ||
    value.version !== 2 ||
    !hasValidSavedGameData(value)
  ) {
    return false;
  }

  return isValidReactionSelection(value.activeReactionIds, value.difficulty);
}

function isValidLegacySavedGame(value: unknown): value is LegacySavedGame {
  return (
    isRecord(value) &&
    value.version === 1 &&
    !Object.hasOwn(value, "activeReactionIds") &&
    hasValidSavedGameData(value)
  );
}

function hasValidSavedGameData(
  value: Record<string, unknown>,
): value is Record<string, unknown> & { difficulty: Difficulty } {
  const difficulty = value.difficulty;

  if (!isDifficulty(difficulty)) {
    return false;
  }

  return (
    isNonNegativeInteger(value.score) &&
    isPositiveInteger(value.timeLeft) &&
    isValidLives(value.lives, difficulty) &&
    isRecipeForDifficulty(value.activeRecipe, difficulty) &&
    isValidCauldronIngredients(value.cauldronIngredients, difficulty) &&
    isValidShelfStock(value.shelfStock, difficulty) &&
    (value.status === "playing" || value.status === "paused") &&
    value.timeLeft <= DIFFICULTY_SETTINGS[difficulty].startingTimeSeconds
  );
}

function migrateLegacySavedGame(savedGame: LegacySavedGame): SavedGame {
  return {
    ...savedGame,
    version: 2,
    activeReactionIds: selectReactionIdsForDifficulty(
      savedGame.difficulty,
      () => 0,
    ),
  };
}

function isDifficulty(value: unknown): value is Difficulty {
  return value === "easy" || value === "medium" || value === "hard";
}

function isValidLives(value: unknown, difficulty: Difficulty): value is number {
  return (
    isPositiveInteger(value) &&
    value <= DIFFICULTY_SETTINGS[difficulty].startingLives
  );
}

function isRecipeForDifficulty(
  value: unknown,
  difficulty: Difficulty,
): value is Recipe {
  if (!isRecord(value) || value.difficulty !== difficulty) {
    return false;
  }

  const recipe = RECIPES.find((candidate) => candidate.id === value.id);

  return (
    recipe !== undefined &&
    value.name === recipe.name &&
    value.difficulty === recipe.difficulty &&
    isSameRange(value.temperature, recipe.temperature) &&
    isSameRange(value.density, recipe.density) &&
    isSameRange(value.magicPower, recipe.magicPower)
  );
}

function isSameRange(value: unknown, expected: Recipe["temperature"]): boolean {
  return (
    isRecord(value) &&
    value.minimum === expected.minimum &&
    value.maximum === expected.maximum
  );
}

function isValidCauldronIngredients(
  value: unknown,
  difficulty: Difficulty,
): boolean {
  if (
    !Array.isArray(value) ||
    value.length > DIFFICULTY_SETTINGS[difficulty].maxCauldronIngredients
  ) {
    return false;
  }

  return value.every((ingredient) => isKnownIngredient(ingredient, difficulty));
}

function isValidShelfStock(value: unknown, difficulty: Difficulty): boolean {
  if (!isRecord(value)) {
    return false;
  }

  const shelfIngredients = getIngredientsForDifficulty(difficulty);
  const stockIds = Object.keys(value);

  return (
    stockIds.length === shelfIngredients.length &&
    shelfIngredients.every(
      ({ id }) => Object.hasOwn(value, id) && isStockCount(value[id]),
    )
  );
}

function isKnownIngredient(value: unknown, difficulty: Difficulty): boolean {
  if (!isRecord(value) || typeof value.id !== "string") {
    return false;
  }

  const ingredient = INGREDIENTS.find(({ id }) => id === value.id);

  return (
    ingredient !== undefined &&
    getIngredientsForDifficulty(difficulty).some(({ id }) => id === value.id) &&
    value.name === ingredient.name &&
    value.temperature === ingredient.temperature &&
    value.density === ingredient.density &&
    value.magicPower === ingredient.magicPower
  );
}

function isStockCount(value: unknown): value is number {
  return isNonNegativeInteger(value) && value <= 15;
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && typeof value === "number" && value >= 0;
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && typeof value === "number" && value > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getStorage(storage?: GameSaveStorage): GameSaveStorage {
  return storage ?? window.localStorage;
}
