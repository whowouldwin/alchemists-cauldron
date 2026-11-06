import { RECIPES } from "../data/recipes.ts";
import { REACTIONS } from "../logic/reactions/reaction-catalog.ts";

export interface DiscoveryJournal {
  readonly recipeIds: readonly string[];
  readonly reactionIds: readonly string[];
}

export function createDiscoveryJournal(): DiscoveryJournal {
  return { recipeIds: [], reactionIds: [] };
}

export function recordRecipeDiscovery(
  journal: DiscoveryJournal,
  recipeId: string,
): DiscoveryJournal {
  const isKnownRecipe = RECIPES.some(({ id }) => id === recipeId);

  if (!isKnownRecipe || journal.recipeIds.includes(recipeId)) {
    return journal;
  }

  return { ...journal, recipeIds: [...journal.recipeIds, recipeId] };
}

export function recordReactionDiscoveries(
  journal: DiscoveryJournal,
  reactionIds: readonly string[],
): DiscoveryJournal {
  const discoveredReactionIds = [...journal.reactionIds];

  for (const reactionId of reactionIds) {
    const isKnownReaction = REACTIONS.some(({ id }) => id === reactionId);

    if (isKnownReaction && !discoveredReactionIds.includes(reactionId)) {
      discoveredReactionIds.push(reactionId);
    }
  }

  if (discoveredReactionIds.length === journal.reactionIds.length) {
    return journal;
  }

  return { ...journal, reactionIds: discoveredReactionIds };
}
