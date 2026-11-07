import { DIFFICULTY_SETTINGS } from "../data/difficulty-settings.ts";
import { getAvailableReactionsForDifficulty } from "../logic/reactions/reaction-catalog.ts";
import type { LaboratoryState } from "./laboratory-state.ts";

export function addLaboratoryReaction(
  state: LaboratoryState,
  reactionId: string,
): LaboratoryState {
  const { selectedReactionIds, recipe } = state;
  const limit = DIFFICULTY_SETTINGS[recipe.difficulty].reactionCount;

  if (
    selectedReactionIds.length >= limit ||
    selectedReactionIds.includes(reactionId)
  ) {
    return state;
  }

  const isAvailable = getAvailableReactionsForDifficulty(
    recipe.difficulty,
  ).some(({ id }) => id === reactionId);

  if (!isAvailable) {
    return state;
  }

  return {
    ...state,
    selectedReactionIds: [...selectedReactionIds, reactionId],
  };
}

export function removeLaboratoryReaction(
  state: LaboratoryState,
  reactionId: string,
): LaboratoryState {
  if (!state.selectedReactionIds.includes(reactionId)) {
    return state;
  }

  return {
    ...state,
    selectedReactionIds: state.selectedReactionIds.filter(
      (id) => id !== reactionId,
    ),
  };
}
