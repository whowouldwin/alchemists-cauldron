import type { Difficulty } from "../data/recipes.ts";
import { GameBrewingController } from "./game-brewing-controller.ts";
import { GameLifecycleController } from "./game-lifecycle-controller.ts";
import { focusGameAction } from "./focus-game-action.ts";
import { qualifiesForLeaderboard } from "../storage/leaderboard.ts";
import {
  clearSave,
  loadGame,
  restoreGameState,
  saveGame,
} from "../storage/game-save.ts";
import type { GameState } from "../state/game-state.ts";
import { createGameState } from "../state/create-game-state.ts";
import { finishGame, getGameOverReason } from "../state/game-status.ts";
import type { GameAnnouncements } from "../ui/game-announcements.ts";

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
  private readonly brewingController: GameBrewingController;
  private readonly lifecycleController: GameLifecycleController;

  constructor(private readonly options: GameSessionControllerOptions) {
    this.brewingController = new GameBrewingController({
      getGameState: () => this.gameState,
      setGameState: (gameState) => {
        this.gameState = gameState;
      },
      finishGameIfNeeded: () => this.finishGameIfNeeded(),
      saveCurrentGame: () => this.saveCurrentGame(),
      render: options.render,
      announcements: options.announcements,
    });
    this.lifecycleController = new GameLifecycleController({
      applicationRoot: options.applicationRoot,
      getGameState: () => this.gameState,
      setGameState: (gameState) => {
        this.gameState = gameState;
      },
      finishGameIfNeeded: () => this.finishGameIfNeeded(),
      saveCurrentGame: () => this.saveCurrentGame(),
      render: options.render,
    });
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

  get canAddIngredient(): (ingredientId: string) => boolean {
    return this.brewingController.canAddIngredient;
  }

  get addIngredient(): (ingredientId: string) => void {
    return this.brewingController.addIngredient;
  }

  get brew(): () => void {
    return this.brewingController.brew;
  }

  get pauseGame(): () => void {
    return this.lifecycleController.pauseGame;
  }

  get resumeGame(): () => void {
    return this.lifecycleController.resumeGame;
  }

  get handleVisibilityChange(): () => void {
    return this.lifecycleController.handleVisibilityChange;
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
    this.lifecycleController.startTimer();
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
    focusGameAction(this.options.applicationRoot, "resume-game");
  };

  readonly selectDifficulty = (difficulty: Difficulty): void => {
    this.selectedDifficulty = difficulty;
    this.options.render();
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
    this.lifecycleController.stopTimer();
    this.options.render();
    focusGameAction(this.options.applicationRoot, "start-game");
  };

  readonly handlePageHide = (): void => {
    this.saveCurrentGame();
  };

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
    this.lifecycleController.stopTimer();
    this.options.render();
    this.options.announcements.gameOver(reason);

    return true;
  }

  private saveCurrentGame(): void {
    if (this.gameState !== null) {
      saveGame(this.gameState);
    }
  }
}
