import type { Difficulty } from "../data/recipes.ts";
import type { GameState } from "../state/game-state.ts";
import { LeaderboardClearController } from "./leaderboard-clear-controller.ts";
import { LeaderboardEntryController } from "./leaderboard-entry-controller.ts";
import { readLeaderboard } from "../storage/leaderboard.ts";
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
  private readonly clearConfirmation: LeaderboardClearController;
  private readonly entryController: LeaderboardEntryController;

  constructor(private readonly options: LeaderboardControllerOptions) {
    this.selectedDifficulty = options.getCurrentDifficulty();
    this.clearConfirmation = new LeaderboardClearController({
      applicationRoot: options.applicationRoot,
      getSelectedDifficulty: () => this.selectedDifficulty,
      render: options.render,
    });
    this.entryController = new LeaderboardEntryController({
      applicationRoot: options.applicationRoot,
      getGameState: options.getGameState,
      isEntryPending: options.isEntryPending,
      setEntryPending: options.setEntryPending,
      render: options.render,
    });
  }

  readonly isVisible = (): boolean => this.isLeaderboardVisible;

  readonly render = (): HTMLElement =>
    renderLeaderboard(
      readLeaderboard(this.selectedDifficulty),
      this.clearConfirmation.isConfirmationOpen,
      this.clearConfirmation.clearErrorMessage,
      this.selectedDifficulty,
    );

  readonly afterRender = (): void => this.clearConfirmation.afterRender();

  readonly reset = (): void => {
    this.isLeaderboardVisible = false;
    this.selectedDifficulty = this.options.getCurrentDifficulty();
    this.clearConfirmation.reset();
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

  readonly openClearConfirmation = (): void => this.clearConfirmation.open();

  readonly cancelClear = (): void => this.clearConfirmation.cancel();

  readonly confirmClear = (): void => this.clearConfirmation.confirm();

  get handleNameSubmit(): (event: SubmitEvent) => void {
    return this.entryController.handleSubmit;
  }

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
