import { DIFFICULTY_SETTINGS } from "../data/difficulty-settings.ts";
import type { Difficulty } from "../data/recipes.ts";
import { isBrewSuccessful } from "../logic/brew-check.ts";
import { calculateCauldron } from "../logic/calculate-cauldron.ts";
import { qualifiesForLeaderboard } from "../storage/leaderboard.ts";
import {
  clearSave,
  loadGame,
  restoreGameState,
  saveGame,
} from "../storage/game-save.ts";
import type { GameState } from "../state/game-state.ts";
import {
  addIngredient,
  applyBrewResult,
  canAddIngredient,
} from "../state/game-actions.ts";
import { createGameState } from "../state/create-game-state.ts";
import {
  finishGame,
  getGameOverReason,
  pauseGame,
  resumeGame,
} from "../state/game-status.ts";
import type { GameAnnouncements } from "../ui/game-announcements.ts";
import { createTimerDisplayRefresh } from "../ui/game-status/timer-display-refresh.ts";

interface GameSessionControllerOptions {
  readonly applicationRoot: HTMLElement;
  readonly announcements: GameAnnouncements;
  readonly render: () => void;
  readonly resetOtherControllers: () => void;
}

export class GameSessionController {
  private gameState: GameState | null = null;
  private savedGame = loadGame();
  private selectedDifficulty: Difficulty =
    this.savedGame?.difficulty ?? "medium";
  private leaderboardEntryPending = false;
  private readonly timerDisplayRefresh: ReturnType<
    typeof createTimerDisplayRefresh
  >;

  constructor(private readonly options: GameSessionControllerOptions) {
    this.timerDisplayRefresh = createTimerDisplayRefresh(
      options.applicationRoot,
      () => this.gameState,
      () => this.finishGameIfNeeded(),
    );
  }

  get currentGameState(): GameState | null {
    return this.gameState;
  }

  get currentDifficulty(): Difficulty {
    return this.gameState?.difficulty ?? this.selectedDifficulty;
  }

  get hasSavedGame(): boolean {
    return this.savedGame !== null;
  }

  get isLeaderboardEntryPending(): boolean {
    return this.leaderboardEntryPending;
  }

  get selectedGameDifficulty(): Difficulty {
    return this.selectedDifficulty;
  }

  readonly setLeaderboardEntryPending = (pending: boolean): void => {
    this.leaderboardEntryPending = pending;
  };

  readonly startGame = (): void => {
    this.gameState = createGameState(
      Math.random,
      Date.now(),
      this.selectedDifficulty,
    );
    this.savedGame = null;
    this.leaderboardEntryPending = false;
    this.options.resetOtherControllers();
    this.saveCurrentGame();
    this.options.render();
    this.timerDisplayRefresh.start();
  };

  readonly continueGame = (): void => {
    if (this.savedGame === null) {
      return;
    }

    this.gameState = restoreGameState(this.savedGame);
    this.selectedDifficulty = this.savedGame.difficulty;
    this.savedGame = null;
    this.leaderboardEntryPending = false;
    this.options.resetOtherControllers();
    this.options.render();
    this.focusResumeButton();
  };

  readonly selectDifficulty = (difficulty: Difficulty): void => {
    this.selectedDifficulty = difficulty;
    this.options.render();
  };

  readonly canAddIngredient = (ingredientId: string): boolean =>
    this.gameState !== null && canAddIngredient(this.gameState, ingredientId);

  readonly addIngredient = (ingredientId: string): void => {
    if (this.gameState === null || this.finishGameIfNeeded()) {
      return;
    }

    const nextState = addIngredient(this.gameState, ingredientId);

    if (nextState === this.gameState) {
      return;
    }

    const addedIngredient = nextState.cauldronIngredients.at(-1);

    if (addedIngredient === undefined) {
      return;
    }

    this.gameState = nextState;
    this.saveCurrentGame();
    this.options.render();
    this.options.announcements.ingredientAdded(
      addedIngredient.name,
      nextState.cauldronIngredients.length,
      DIFFICULTY_SETTINGS[nextState.difficulty].maxCauldronIngredients,
    );
  };

  readonly pauseGame = (): void => {
    if (this.pauseActiveGame()) {
      this.focusResumeButton();
    }
  };

  readonly resumeGame = (): void => {
    if (
      this.gameState === null ||
      this.gameState.remainingTimeAtPauseMs === null
    ) {
      return;
    }

    this.gameState = resumeGame(this.gameState);
    this.saveCurrentGame();
    this.options.render();
    this.timerDisplayRefresh.start();
    this.focusAction("pause-game");
  };

  readonly exitToMenu = (): void => {
    if (
      this.gameState === null ||
      this.gameState.remainingTimeAtPauseMs === null
    ) {
      return;
    }

    this.gameState = null;
    this.savedGame = null;
    this.leaderboardEntryPending = false;
    clearSave();
    this.timerDisplayRefresh.stop();
    this.options.render();
    this.focusAction("start-game");
  };

  readonly brew = (): void => {
    if (
      this.gameState === null ||
      this.finishGameIfNeeded() ||
      this.gameState.cauldronIngredients.length === 0
    ) {
      return;
    }

    const values = calculateCauldron(this.gameState.cauldronIngredients);
    const succeeded = isBrewSuccessful(
      values,
      this.gameState.activeRecipe,
      this.gameState.difficulty,
    );

    this.gameState = applyBrewResult(this.gameState, succeeded);

    if (this.finishGameIfNeeded()) {
      return;
    }

    this.saveCurrentGame();
    this.options.render();
    this.options.announcements.brewResult(
      succeeded,
      DIFFICULTY_SETTINGS[this.gameState.difficulty].scorePerBrew,
    );
  };

  readonly handleVisibilityChange = (): void => {
    if (document.hidden) {
      this.pauseActiveGame();
      return;
    }

    if (
      this.gameState !== null &&
      this.gameState.remainingTimeAtPauseMs !== null
    ) {
      this.focusResumeButton();
    }
  };

  readonly handlePageHide = (): void => {
    this.saveCurrentGame();
  };

  private pauseActiveGame(): boolean {
    if (this.gameState === null || this.finishGameIfNeeded()) {
      return false;
    }

    if (this.gameState.remainingTimeAtPauseMs !== null) {
      return false;
    }

    const pausedState = pauseGame(this.gameState);

    if (pausedState === this.gameState) {
      return false;
    }

    this.gameState = pausedState;
    this.timerDisplayRefresh.stop();
    this.saveCurrentGame();
    this.options.render();

    return true;
  }

  private finishGameIfNeeded(): boolean {
    if (this.gameState === null) {
      return false;
    }

    if (this.gameState.gameOverReason !== null) {
      return true;
    }

    const reason = getGameOverReason(this.gameState);

    if (reason === null) {
      return false;
    }

    this.gameState = finishGame(this.gameState, reason);
    this.savedGame = null;
    clearSave();
    this.leaderboardEntryPending = qualifiesForLeaderboard(
      this.gameState.score,
      this.gameState.difficulty,
    );
    this.timerDisplayRefresh.stop();
    this.options.render();
    this.options.announcements.gameOver(reason);

    return true;
  }

  private saveCurrentGame(): void {
    if (this.gameState !== null) {
      saveGame(this.gameState);
    }
  }

  private focusResumeButton(): void {
    this.focusAction("resume-game");
  }

  private focusAction(action: string): void {
    this.options.applicationRoot
      .querySelector<HTMLButtonElement>(`[data-action="${action}"]`)
      ?.focus();
  }
}
