import type { SavedExperiment } from "../laboratory/saved-experiment.ts";
import { readSavedExperiments } from "./saved-experiment-validation.ts";

const EXPERIMENTS_STORAGE_KEY = "alchemists-cauldron.experiments";

export interface ExperimentsStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function loadExperiments(
  storage?: ExperimentsStorage,
): readonly SavedExperiment[] | null {
  try {
    const activeStorage = storage ?? window.localStorage;
    const raw = activeStorage.getItem(EXPERIMENTS_STORAGE_KEY);
    if (raw === null) {
      return [];
    }

    const saved: unknown = JSON.parse(raw);
    return readSavedExperiments(saved);
  } catch {
    return null;
  }
}

export function saveExperiments(
  experiments: readonly SavedExperiment[],
  storage?: ExperimentsStorage,
): boolean {
  try {
    const activeStorage = storage ?? window.localStorage;
    activeStorage.setItem(
      EXPERIMENTS_STORAGE_KEY,
      JSON.stringify({ version: 1, experiments }),
    );
    return true;
  } catch {
    return false;
  }
}
