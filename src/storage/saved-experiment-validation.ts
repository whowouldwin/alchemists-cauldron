import {
  getExperimentKey,
  restoreExperiment,
  type SavedExperiment,
} from "../laboratory/saved-experiment.ts";

export function readSavedExperiments(
  value: unknown,
): readonly SavedExperiment[] | null {
  if (
    typeof value !== "object" ||
    value === null ||
    !("version" in value) ||
    value.version !== 1 ||
    !("experiments" in value) ||
    !Array.isArray(value.experiments)
  ) {
    return null;
  }

  const experiments: SavedExperiment[] = [];
  const keys = new Set<string>();

  for (const item of value.experiments) {
    const experiment = readExperiment(item);
    if (experiment === null) {
      return null;
    }

    const key = getExperimentKey(experiment);
    if (!keys.has(key)) {
      experiments.push(experiment);
      keys.add(key);
    }
  }

  return experiments;
}

function readExperiment(value: unknown): SavedExperiment | null {
  if (
    typeof value !== "object" ||
    value === null ||
    !("recipeId" in value) ||
    typeof value.recipeId !== "string" ||
    !("ingredientIds" in value) ||
    !isStringArray(value.ingredientIds) ||
    !("selectedReactionIds" in value) ||
    !isStringArray(value.selectedReactionIds)
  ) {
    return null;
  }

  const experiment: SavedExperiment = {
    recipeId: value.recipeId,
    ingredientIds: [...value.ingredientIds],
    selectedReactionIds: [...value.selectedReactionIds],
  };

  return restoreExperiment(experiment) === null ? null : experiment;
}

function isStringArray(value: unknown): value is readonly string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}
