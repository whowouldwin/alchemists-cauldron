import type { Difficulty } from "./recipes.ts";

export interface DifficultySettings {
  readonly shelfIngredientCount: number;
  readonly maxCauldronIngredients: number;
  readonly startingTimeSeconds: number;
  readonly recipeTolerance: number;
  readonly startingLives: number;
  readonly scorePerBrew: number;
  readonly timeBonusSeconds: number;
  readonly reactionCount: number;
}

export const DIFFICULTY_SETTINGS = {
  easy: {
    shelfIngredientCount: 4,
    maxCauldronIngredients: 4,
    startingTimeSeconds: 180,
    recipeTolerance: 12,
    startingLives: 5,
    scorePerBrew: 100,
    timeBonusSeconds: 15,
    reactionCount: 0,
  },
  medium: {
    shelfIngredientCount: 6,
    maxCauldronIngredients: 4,
    startingTimeSeconds: 150,
    recipeTolerance: 8,
    startingLives: 3,
    scorePerBrew: 200,
    timeBonusSeconds: 10,
    reactionCount: 2,
  },
  hard: {
    shelfIngredientCount: 8,
    maxCauldronIngredients: 5,
    startingTimeSeconds: 150,
    recipeTolerance: 5,
    startingLives: 3,
    scorePerBrew: 300,
    timeBonusSeconds: 5,
    reactionCount: 3,
  },
} as const satisfies Readonly<Record<Difficulty, DifficultySettings>>;
