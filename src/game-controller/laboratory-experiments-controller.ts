import type { LaboratoryState } from "../laboratory/laboratory-state.ts";
import {
  renderExperimentActions,
  type ExperimentFeedback,
} from "../ui/laboratory/render-experiment-actions.ts";
import { renderSavedExperiments } from "../ui/laboratory/render-saved-experiments.ts";
import { focusLaboratoryRecipe } from "../ui/laboratory/laboratory-focus.ts";
import {
  ExperimentLibrary,
  type SaveExperimentResult,
} from "./experiment-library.ts";
import { focusGameAction } from "./focus-game-action.ts";

interface LaboratoryExperimentsOptions {
  readonly applicationRoot: HTMLElement;
  readonly getState: () => LaboratoryState;
  readonly restoreState: (state: LaboratoryState) => void;
  readonly render: () => void;
  readonly announce: (message: string) => void;
}

const SAVE_MESSAGES: Readonly<Record<SaveExperimentResult, string>> = {
  saved: "Experiment saved in this browser.",
  "already-saved": "This experiment is already saved.",
  invalid: "Only a successful, non-explosive mixture can be saved.",
  "storage-error":
    "Could not save the experiment. Your mixture is still here; try again.",
};

export class LaboratoryExperimentsController {
  private readonly library = new ExperimentLibrary();
  private feedback: ExperimentFeedback | null = null;
  private readonly options: LaboratoryExperimentsOptions;

  constructor(options: LaboratoryExperimentsOptions) {
    this.options = options;
  }

  renderActions(canSave: boolean): HTMLElement {
    const isSaved =
      !this.library.hasReadError &&
      this.library.contains(this.options.getState());
    return renderExperimentActions(canSave, isSaved, this.feedback);
  }

  renderLibrary(): HTMLElement {
    const isOpen =
      this.options.applicationRoot.querySelector<HTMLDetailsElement>(
        "#saved-experiments",
      )?.open ?? false;
    return renderSavedExperiments(
      this.library.entries,
      this.library.hasReadError,
      isOpen,
    );
  }

  clearFeedback(): void {
    this.feedback = null;
  }

  readonly save = (): void => {
    const result = this.library.save(this.options.getState());
    const failed = result === "invalid" || result === "storage-error";
    this.showFeedback(SAVE_MESSAGES[result], failed);
    if (failed) {
      focusGameAction(
        this.options.applicationRoot,
        "save-laboratory-experiment",
      );
    } else {
      this.focusLibrary();
    }
  };

  readonly restore = (key: string): void => {
    const state = this.library.restore(key);
    if (state === null) {
      this.showFeedback("This experiment could not be opened.", true);
      this.focusLibrary();
      return;
    }

    this.options.restoreState(state);
    this.showFeedback(
      `Loaded ${state.recipe.name}. The ingredients and reactions are ready to inspect.`,
      false,
    );
    focusLaboratoryRecipe(this.options.applicationRoot);
  };

  readonly remove = (key: string): void => {
    const removed = this.library.remove(key);
    this.showFeedback(
      removed
        ? "Experiment removed from saved experiments."
        : "Could not remove the experiment. Try again.",
      !removed,
    );
    this.focusLibrary();
  };

  readonly reload = (): void => {
    const loaded = this.library.refresh();
    this.showFeedback(
      loaded
        ? "Saved experiments reloaded."
        : "Saved experiments are still unavailable. Existing data has not been replaced.",
      !loaded,
    );
    this.focusLibrary();
  };

  private showFeedback(text: string, isError: boolean): void {
    this.feedback = { text, isError };
    this.options.render();
    this.options.announce(text);
  }

  private focusLibrary(): void {
    this.options.applicationRoot
      .querySelector<HTMLElement>("#saved-experiments-toggle")
      ?.focus();
  }
}
