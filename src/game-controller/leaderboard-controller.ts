import type { Difficulty } from "../data/recipes.ts";
import type { GameState } from "../state/game-state.ts";
import {
  clearLeaderboard,
  isValidPlayerName,
  readLeaderboard,
  saveLeaderboardEntry,
} from "../storage/leaderboard.ts";
import { renderLeaderboard } from "../ui/screens/render-leaderboard.ts";

interface LeaderboardControllerOptions {
  readonly applicationRoot: HTMLElement;
  readonly getGameState: () => GameState | null;
  readonly isEntryPending: () => boolean;
  readonly setEntryPending: (pending: boolean) => void;
  readonly getCurrentDifficulty: () => Difficulty;
  readonly render: () => void;
}

export class LeaderboardController {
  private isLeaderboardVisible = false;
  private selectedDifficulty: Difficulty;
  private isClearConfirmationOpen = false;
  private clearErrorMessage: string | null = null;

  constructor(private readonly options: LeaderboardControllerOptions) {
    this.selectedDifficulty = options.getCurrentDifficulty();
  }

  readonly isVisible = (): boolean => this.isLeaderboardVisible;

  readonly render = (): HTMLElement =>
    renderLeaderboard(
      readLeaderboard(this.selectedDifficulty),
      this.isClearConfirmationOpen,
      this.clearErrorMessage,
      this.selectedDifficulty,
    );

  readonly afterRender = (): void => {
    if (!this.isClearConfirmationOpen) {
      return;
    }

    const dialog =
      this.options.applicationRoot.querySelector<HTMLDialogElement>(
        ".leaderboard-confirmation",
      );

    if (dialog === null) {
      return;
    }

    dialog.addEventListener("cancel", this.handleClearDialogCancel, {
      once: true,
    });
    dialog.showModal();
    this.focusAction("cancel-leaderboard-clear");
  };

  readonly reset = (): void => {
    this.isLeaderboardVisible = false;
    this.selectedDifficulty = this.options.getCurrentDifficulty();
    this.isClearConfirmationOpen = false;
    this.clearErrorMessage = null;
  };

  readonly open = (): void => {
    this.isLeaderboardVisible = true;
    this.selectedDifficulty = this.options.getCurrentDifficulty();
    this.options.render();
    this.focusAction("close-leaderboard");
  };

  readonly close = (): void => {
    this.isLeaderboardVisible = false;
    this.options.render();
    this.focusAction("open-leaderboard");
  };

  readonly selectDifficulty = (difficulty: Difficulty): void => {
    this.selectedDifficulty = difficulty;
    this.options.render();
    this.focusSelectedDifficulty();
  };

  readonly openClearConfirmation = (): void => {
    this.clearErrorMessage = null;
    this.isClearConfirmationOpen = true;
    this.options.render();
  };

  readonly cancelClear = (): void => {
    this.isClearConfirmationOpen = false;
    this.clearErrorMessage = null;
    this.options.render();
    this.focusAction("open-leaderboard-clear-confirmation");
  };

  readonly confirmClear = (): void => {
    if (!clearLeaderboard(this.selectedDifficulty)) {
      this.clearErrorMessage =
        "Could not clear the leaderboard. Please try again.";
      this.options.render();
      return;
    }

    this.isClearConfirmationOpen = false;
    this.clearErrorMessage = null;
    this.options.render();
    this.focusAction("open-leaderboard-clear-confirmation");
  };

  readonly handleNameSubmit = (event: SubmitEvent): void => {
    const gameState = this.options.getGameState();

    if (
      !(event.target instanceof HTMLFormElement) ||
      event.target.dataset.form !== "leaderboard-entry" ||
      gameState === null ||
      gameState.gameOverReason === null ||
      !this.options.isEntryPending()
    ) {
      return;
    }

    event.preventDefault();

    const input = event.target.querySelector<HTMLInputElement>(
      '[name="playerName"]',
    );
    const status = event.target.querySelector<HTMLElement>('[role="status"]');

    if (input === null || status === null) {
      return;
    }

    if (!isValidPlayerName(input.value)) {
      input.setCustomValidity(
        "Enter 2–15 letters, numbers, spaces, underscores or hyphens.",
      );
      input.reportValidity();
      return;
    }

    if (
      !saveLeaderboardEntry(input.value, gameState.score, gameState.difficulty)
    ) {
      status.textContent = "Could not save your score. Please try again.";
      return;
    }

    this.options.setEntryPending(false);
    this.options.render();
    this.focusAction("start-game");
  };

  private readonly handleClearDialogCancel = (event: Event): void => {
    event.preventDefault();
    this.cancelClear();
  };

  private focusSelectedDifficulty(): void {
    this.options.applicationRoot
      .querySelector<HTMLButtonElement>(
        `[data-action="select-leaderboard-difficulty"][data-difficulty="${this.selectedDifficulty}"]`,
      )
      ?.focus();
  }

  private focusAction(action: string): void {
    this.options.applicationRoot
      .querySelector<HTMLButtonElement>(`[data-action="${action}"]`)
      ?.focus();
  }
}
