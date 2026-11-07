import type { LaboratoryState } from "../laboratory/laboratory-state.ts";
import {
  captureExperiment,
  getExperimentKey,
  restoreExperiment,
  type SavedExperiment,
} from "../laboratory/saved-experiment.ts";
import {
  loadExperiments,
  saveExperiments,
  type ExperimentsStorage,
} from "../storage/saved-experiments.ts";

export type SaveExperimentResult =
  "saved" | "already-saved" | "invalid" | "storage-error";

export class ExperimentLibrary {
  private experiments: readonly SavedExperiment[] = [];
  private readFailed = false;
  private readonly storage: ExperimentsStorage | undefined;

  constructor(storage?: ExperimentsStorage) {
    this.storage = storage;
    this.refresh();
  }

  get entries(): readonly SavedExperiment[] {
    return this.experiments;
  }

  get hasReadError(): boolean {
    return this.readFailed;
  }

  refresh(): boolean {
    const loaded = loadExperiments(this.storage);
    this.readFailed = loaded === null;
    if (loaded === null) {
      return false;
    }
    this.experiments = loaded;
    return true;
  }

  contains(state: LaboratoryState): boolean {
    const experiment = captureExperiment(state);
    return (
      experiment !== null &&
      this.experiments.some(
        (item) => getExperimentKey(item) === getExperimentKey(experiment),
      )
    );
  }

  save(state: LaboratoryState): SaveExperimentResult {
    const experiment = captureExperiment(state);
    if (experiment === null) {
      return "invalid";
    }
    if (!this.refresh()) {
      return "storage-error";
    }
    if (this.contains(state)) {
      return "already-saved";
    }

    const updated = [experiment, ...this.experiments];
    if (!saveExperiments(updated, this.storage)) {
      return "storage-error";
    }
    this.experiments = updated;
    return "saved";
  }

  restore(key: string): LaboratoryState | null {
    const experiment = this.experiments.find(
      (item) => getExperimentKey(item) === key,
    );
    return experiment === undefined ? null : restoreExperiment(experiment);
  }

  remove(key: string): boolean {
    if (!this.refresh()) {
      return false;
    }
    const updated = this.experiments.filter(
      (item) => getExperimentKey(item) !== key,
    );
    if (updated.length === this.experiments.length) {
      return true;
    }
    if (!saveExperiments(updated, this.storage)) {
      return false;
    }
    this.experiments = updated;
    return true;
  }
}
