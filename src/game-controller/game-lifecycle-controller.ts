import type { GameState } from "../state/game-state.ts";
import { pauseGame, resumeGame } from "../state/game-status.ts";
import { createTimerDisplayRefresh } from "../ui/game-status/timer-display-refresh.ts";

interface GameLifecycleControllerOptions {
  readonly applicationRoot: HTMLElement;
  readonly getGameState: () => GameState | null;
  readonly setGameState: (gameState: GameState) => void;
  readonly finishGameIfNeeded: () => boolean;
  readonly saveCurrentGame: () => void;
  readonly render: () => void;
}

export class GameLifecycleController {
  private readonly timerDisplayRefresh: ReturnType<
    typeof createTimerDisplayRefresh
  >;

  constructor(private readonly options: GameLifecycleControllerOptions) {
    this.timerDisplayRefresh = createTimerDisplayRefresh(
      options.applicationRoot,
      options.getGameState,
      options.finishGameIfNeeded,
    );
  }

  readonly startTimer = (): void => {
    this.timerDisplayRefresh.start();
  };

  readonly stopTimer = (): void => {
    this.timerDisplayRefresh.stop();
  };

  readonly pauseGame = (): void => {
    if (this.pauseActiveGame()) {
      this.focusAction("resume-game");
    }
  };

  readonly resumeGame = (): void => {
    const gameState = this.options.getGameState();

    if (gameState === null || gameState.remainingTimeAtPauseMs === null) {
      return;
    }

    this.options.setGameState(resumeGame(gameState));
    this.options.saveCurrentGame();
    this.options.render();
    this.startTimer();
    this.focusAction("pause-game");
  };

  readonly handleVisibilityChange = (): void => {
    if (document.hidden) {
      this.pauseActiveGame();
      return;
    }

    const gameState = this.options.getGameState();

    if (gameState !== null && gameState.remainingTimeAtPauseMs !== null) {
      this.focusAction("resume-game");
    }
  };

  private pauseActiveGame(): boolean {
    const gameState = this.options.getGameState();

    if (gameState === null || this.options.finishGameIfNeeded()) {
      return false;
    }

    if (gameState.remainingTimeAtPauseMs !== null) {
      return false;
    }

    const pausedState = pauseGame(gameState);

    if (pausedState === gameState) {
      return false;
    }

    this.options.setGameState(pausedState);
    this.stopTimer();
    this.options.saveCurrentGame();
    this.options.render();

    return true;
  }

  private focusAction(action: string): void {
    this.options.applicationRoot
      .querySelector<HTMLButtonElement>(`[data-action="${action}"]`)
      ?.focus();
  }
}
