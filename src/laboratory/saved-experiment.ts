import {
  addLaboratoryIngredient,
  createLaboratoryState,
  selectLaboratoryRecipe,
  type LaboratoryState,
} from "./laboratory-state.ts";
import { addLaboratoryReaction } from "./laboratory-reactions.ts";
import { evaluateLaboratoryMixture } from "./laboratory-result.ts";

export interface SavedExperiment {
  readonly recipeId: string;
  readonly ingredientIds: readonly string[];
  readonly selectedReactionIds: readonly string[];
}

export function captureExperiment(
  state: LaboratoryState,
): SavedExperiment | null {
  const experiment: SavedExperiment = {
    recipeId: state.recipe.id,
    ingredientIds: state.ingredients.map(({ id }) => id),
    selectedReactionIds: [...state.selectedReactionIds],
  };

  return restoreExperiment(experiment) === null ? null : experiment;
}

export function restoreExperiment(
  experiment: SavedExperiment,
): LaboratoryState | null {
  let state = selectLaboratoryRecipe(
    createLaboratoryState(),
    experiment.recipeId,
  );

  if (state.recipe.id !== experiment.recipeId) {
    return null;
  }

  for (const ingredientId of experiment.ingredientIds) {
    const nextState = addLaboratoryIngredient(state, ingredientId);
    if (nextState === state) {
      return null;
    }
    state = nextState;
  }

  for (const reactionId of experiment.selectedReactionIds) {
    const nextState = addLaboratoryReaction(state, reactionId);
    if (nextState === state) {
      return null;
    }
    state = nextState;
  }

  return evaluateLaboratoryMixture(state).matchesRecipe ? state : null;
}

export function getExperimentKey(experiment: SavedExperiment): string {
  return JSON.stringify([
    experiment.recipeId,
    experiment.ingredientIds,
    experiment.selectedReactionIds,
  ]);
}
