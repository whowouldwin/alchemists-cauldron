import { REACTIONS } from "./reaction-definitions.ts";
import type { IReaction } from "./reaction-types.ts";

export { REACTIONS } from "./reaction-definitions.ts";
export {
  getAvailableReactionsForDifficulty,
  isValidReactionSelection,
  selectReactionIdsForDifficulty,
} from "./reaction-selection.ts";

const REACTIONS_BY_ID = new Map(
  REACTIONS.map((reaction) => [reaction.id, reaction] as const),
);

export function getReactionsByIds(
  reactionIds: readonly string[],
): readonly IReaction[] {
  return reactionIds.flatMap((id) => {
    const reaction = REACTIONS_BY_ID.get(id);

    return reaction === undefined ? [] : [reaction];
  });
}
