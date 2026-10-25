import { INGREDIENTS } from "../data/ingredients.ts";
import type { Ingredient } from "../data/ingredients.ts";
import { DIFFICULTY_SETTINGS } from "../data/difficulty-settings.ts";
import { pickRandomRecipe } from "../logic/recipe-generator.ts";
import { getNewlyActivatedReactions } from "../logic/reactions/reaction-engine.ts";
import type { IReaction } from "../logic/reactions/reaction-types.ts";
import { MILLISECONDS_PER_SECOND } from "../logic/timer.ts";
import type { GameState } from "./game-state.ts";

export interface IngredientAdditionResult {
  readonly state: GameState;
  readonly ingredient: Ingredient | null;
  readonly activatedReactions: readonly IReaction[];
}

const POUR_OUT_TIME_COST_SECONDS = 10;

export function addIngredient(
  state: GameState,
  ingredientId: string,
): GameState {
  return addIngredientWithReactions(state, ingredientId).state;
}

export function addIngredientWithReactions(
  state: GameState,
  ingredientId: string,
): IngredientAdditionResult {
  if (!canAddIngredient(state, ingredientId)) {
    return { state, ingredient: null, activatedReactions: [] };
  }

  const ingredient = INGREDIENTS.find(({ id }) => id === ingredientId);
  const stock = state.shelfStock[ingredientId];

  if (ingredient === undefined || stock === undefined) {
    return { state, ingredient: null, activatedReactions: [] };
  }

  const cauldronIngredients = [...state.cauldronIngredients, ingredient];
  const activatedReactions = getNewlyActivatedReactions(
    state.cauldronIngredients,
    cauldronIngredients,
    state.activeReactionIds,
  );
  const nextState: GameState = {
    ...state,
    cauldronIngredients,
    lastBrewResult: null,
    shelfStock: {
      ...state.shelfStock,
      [ingredientId]: stock - 1,
    },
  };

  return {
    state: applyReactionEffects(nextState, activatedReactions),
    ingredient,
    activatedReactions,
  };
}

export function canAddIngredient(
  state: GameState,
  ingredientId: string,
): boolean {
  const settings = DIFFICULTY_SETTINGS[state.difficulty];

  if (
    state.remainingTimeAtPauseMs !== null ||
    state.cauldronIngredients.length >= settings.maxCauldronIngredients
  ) {
    return false;
  }

  const stock = state.shelfStock[ingredientId];

  return (
    INGREDIENTS.some(({ id }) => id === ingredientId) &&
    stock !== undefined &&
    stock > 0
  );
}

export function clearCauldron(state: GameState): GameState {
  return { ...state, cauldronIngredients: [] };
}

export function pourOut(state: GameState): GameState {
  if (
    state.remainingTimeAtPauseMs !== null ||
    state.cauldronIngredients.length === 0
  ) {
    return state;
  }

  return {
    ...clearCauldron(state),
    endTime:
      state.endTime - POUR_OUT_TIME_COST_SECONDS * MILLISECONDS_PER_SECOND,
  };
}

export function applyBrewResult(
  state: GameState,
  succeeded: boolean,
  random: () => number = Math.random,
  currentTime: number = Date.now(),
): GameState {
  if (
    state.remainingTimeAtPauseMs !== null ||
    state.cauldronIngredients.length === 0
  ) {
    return state;
  }

  const clearedState = clearCauldron(state);
  const settings = DIFFICULTY_SETTINGS[state.difficulty];

  if (!succeeded) {
    return {
      ...clearedState,
      lives: Math.max(state.lives - 1, 0),
      lastBrewResult: "failure",
    };
  }

  const maximumEndTime =
    currentTime + settings.startingTimeSeconds * MILLISECONDS_PER_SECOND;
  const bonusEndTime =
    state.endTime + settings.timeBonusSeconds * MILLISECONDS_PER_SECOND;

  return {
    ...clearedState,
    activeRecipe: pickRandomRecipe(state.difficulty, random),
    score: state.score + settings.scorePerBrew,
    endTime: Math.min(bonusEndTime, maximumEndTime),
    lastBrewResult: "success",
  };
}

function applyReactionEffects(
  state: GameState,
  reactions: readonly IReaction[],
): GameState {
  const timePenaltySeconds = reactions.reduce(
    (total, reaction) => total + (reaction.effects?.timePenaltySeconds ?? 0),
    0,
  );
  const livesLost = reactions.reduce(
    (total, reaction) => total + (reaction.effects?.livesLost ?? 0),
    0,
  );
  const shouldClearCauldron = reactions.some(
    ({ effects }) => effects?.clearCauldron === true,
  );

  return {
    ...state,
    endTime: state.endTime - timePenaltySeconds * MILLISECONDS_PER_SECOND,
    lives: Math.max(state.lives - livesLost, 0),
    cauldronIngredients: shouldClearCauldron ? [] : state.cauldronIngredients,
  };
}
