import {
  isLaboratoryFull,
  type LaboratoryState,
} from "../../laboratory/laboratory-state.ts";
import type { LaboratoryResult } from "../../laboratory/laboratory-result.ts";

export function getLaboratoryStatusMessage(
  state: LaboratoryState,
  result: LaboratoryResult,
): string {
  if (state.ingredients.length === 0) {
    return "Add ingredients to start your experiment.";
  }

  if (result.hasExplosion) {
    return "This mixture would explode in a game. It is kept here for inspection and cannot be a successful brew.";
  }

  if (result.matchesRecipe) {
    return `Your mixture matches ${state.recipe.name}.`;
  }

  if (isLaboratoryFull(state)) {
    return "The mixture is full and does not match yet. Clear it to try another combination.";
  }

  return "Keep experimenting: bring all three values into their target ranges.";
}
