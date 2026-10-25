import type { Difficulty } from "../data/recipes.ts";
import { focusGameAction } from "./focus-game-action.ts";
import { clearLeaderboard } from "../storage/leaderboard.ts";

interface LeaderboardClearControllerOptions {
  readonly applicationRoot: HTMLElement;
  readonly getSelectedDifficulty: () => Difficulty;
  readonly render: () => void;
}

export class LeaderboardClearController {
  private isOpen = false;
  private errorMessage: string | null = null;

  constructor(private readonly options: LeaderboardClearControllerOptions) {}

  get isConfirmationOpen(): boolean {
    return this.isOpen;
  }

  get clearErrorMessage(): string | null {
    return this.errorMessage;
  }

  readonly reset = (): void => {
    this.isOpen = false;
    this.errorMessage = null;
  };

  readonly afterRender = (): void => {
    if (!this.isOpen) {
      return;
    }

    const dialog =
      this.options.applicationRoot.querySelector<HTMLDialogElement>(
        ".leaderboard-confirmation",
      );

    if (dialog === null) {
      return;
    }

    dialog.addEventListener("cancel", this.handleDialogCancel, {
      once: true,
    });
    dialog.showModal();
    focusGameAction(this.options.applicationRoot, "cancel-leaderboard-clear");
  };

  readonly open = (): void => {
    this.errorMessage = null;
    this.isOpen = true;
    this.options.render();
  };

  readonly cancel = (): void => {
    this.isOpen = false;
    this.errorMessage = null;
    this.options.render();
    focusGameAction(
      this.options.applicationRoot,
      "open-leaderboard-clear-confirmation",
    );
  };

  readonly confirm = (): void => {
    if (!clearLeaderboard(this.options.getSelectedDifficulty())) {
      this.errorMessage = "Could not clear the leaderboard. Please try again.";
      this.options.render();
      return;
    }

    this.isOpen = false;
    this.errorMessage = null;
    this.options.render();
    focusGameAction(
      this.options.applicationRoot,
      "open-leaderboard-clear-confirmation",
    );
  };

  private readonly handleDialogCancel = (event: Event): void => {
    event.preventDefault();
    this.cancel();
  };
}
