import { GameDialogController } from "./game-controller/game-dialog-controller.ts";
import { LeaderboardController } from "./game-controller/leaderboard-controller.ts";
import { DIFFICULTY_SETTINGS } from "./data/difficulty-settings.ts";
import type { Difficulty } from "./data/recipes.ts";
import { isBrewSuccessful } from "./logic/brew-check.ts";
import { calculateCauldron } from "./logic/calculate-cauldron.ts";
import { createGameState } from "./state/create-game-state.ts";
import {
  addIngredient,
  applyBrewResult,
  canAddIngredient,
} from "./state/game-actions.ts";
import type { GameState } from "./state/game-state.ts";
import {
  finishGame,
  getGameOverReason,
  pauseGame,
  resumeGame,
} from "./state/game-status.ts";
import { qualifiesForLeaderboard } from "./storage/leaderboard.ts";
import {
  clearSave,
  loadGame,
  restoreGameState,
  saveGame,
} from "./storage/game-save.ts";
import type { GameAnnouncements } from "./ui/game-announcements.ts";
import { createGameClickHandler } from "./ui/game-click-handler.ts";
import { createGameDragHandler } from "./ui/game-drag-handler.ts";
import { createTimerDisplayRefresh } from "./ui/game-status/timer-display-refresh.ts";
import { renderGame } from "./ui/screens/render-game.ts";

export function initializeGameController(
  applicationRoot: HTMLElement,
  announcements: GameAnnouncements,
): void {
  let gameState: GameState | null = null;
  let savedGame = loadGame();
  let selectedDifficulty: Difficulty = savedGame?.difficulty ?? "medium";
  let leaderboardEntryPending = false;
  const dialogs = new GameDialogController(
    applicationRoot,
    () => selectedDifficulty,
    render,
  );
  const leaderboardController = new LeaderboardController({
    applicationRoot,
    getGameState: () => gameState,
    isEntryPending: () => leaderboardEntryPending,
    setEntryPending: (pending) => {
      leaderboardEntryPending = pending;
    },
    getCurrentDifficulty: () => gameState?.difficulty ?? selectedDifficulty,
    render,
  });
  const timerDisplayRefresh = createTimerDisplayRefresh(
    applicationRoot,
    () => gameState,
    finishGameIfNeeded,
  );
  const gameDragHandler = createGameDragHandler({
    canAddIngredient: (ingredientId) =>
      gameState !== null && canAddIngredient(gameState, ingredientId),
    addIngredient: handleIngredientClick,
  });

  function render(): void {
    const screen = leaderboardController.isVisible()
      ? leaderboardController.render()
      : renderGame(gameState, leaderboardEntryPending, {
          selectedDifficulty,
          isDifficultySettingsOpen: dialogs.isSettingsOpen,
          isHelpOpen: dialogs.isHelpOpen,
          hasSavedGame: savedGame !== null,
        });

    applicationRoot.replaceChildren(screen);
    leaderboardController.afterRender();
    dialogs.afterRender();
  }

  function startGame(): void {
    gameState = createGameState(Math.random, Date.now(), selectedDifficulty);
    savedGame = null;
    dialogs.reset();
    leaderboardEntryPending = false;
    leaderboardController.reset();
    saveCurrentGame();
    render();
    timerDisplayRefresh.start();
  }

  function continueGame(): void {
    if (savedGame === null) {
      return;
    }

    gameState = restoreGameState(savedGame);
    selectedDifficulty = savedGame.difficulty;
    savedGame = null;
    dialogs.reset();
    leaderboardEntryPending = false;
    leaderboardController.reset();
    render();
    focusResumeButton();
  }

  function selectDifficulty(difficulty: Difficulty): void {
    selectedDifficulty = difficulty;
    render();
  }

  function handleIngredientClick(ingredientId: string): void {
    if (gameState === null || finishGameIfNeeded()) {
      return;
    }

    const nextState = addIngredient(gameState, ingredientId);

    if (nextState === gameState) {
      return;
    }

    const addedIngredient = nextState.cauldronIngredients.at(-1);

    if (addedIngredient === undefined) {
      return;
    }

    gameState = nextState;
    saveCurrentGame();
    render();
    announcements.ingredientAdded(
      addedIngredient.name,
      nextState.cauldronIngredients.length,
      DIFFICULTY_SETTINGS[nextState.difficulty].maxCauldronIngredients,
    );
  }

  function handlePause(): void {
    if (!pauseActiveGame()) {
      return;
    }

    focusResumeButton();
  }

  function pauseActiveGame(): boolean {
    if (gameState === null || finishGameIfNeeded()) {
      return false;
    }

    if (gameState.remainingTimeAtPauseMs !== null) {
      return false;
    }

    const pausedState = pauseGame(gameState);

    if (pausedState === gameState) {
      return false;
    }

    gameState = pausedState;
    timerDisplayRefresh.stop();
    saveCurrentGame();
    render();

    return true;
  }

  function focusResumeButton(): void {
    applicationRoot
      .querySelector<HTMLButtonElement>('[data-action="resume-game"]')
      ?.focus();
  }

  function handleVisibilityChange(): void {
    if (document.hidden) {
      pauseActiveGame();
      return;
    }

    if (gameState !== null && gameState.remainingTimeAtPauseMs !== null) {
      focusResumeButton();
    }
  }

  function handleResume(): void {
    if (gameState === null || gameState.remainingTimeAtPauseMs === null) {
      return;
    }

    gameState = resumeGame(gameState);
    saveCurrentGame();
    render();
    timerDisplayRefresh.start();
    applicationRoot
      .querySelector<HTMLButtonElement>('[data-action="pause-game"]')
      ?.focus();
  }

  function handleExitToMenu(): void {
    if (gameState === null || gameState.remainingTimeAtPauseMs === null) {
      return;
    }

    gameState = null;
    savedGame = null;
    leaderboardEntryPending = false;
    clearSave();
    timerDisplayRefresh.stop();
    render();
    applicationRoot
      .querySelector<HTMLButtonElement>('[data-action="start-game"]')
      ?.focus();
  }

  function handleBrewClick(): void {
    if (
      gameState === null ||
      finishGameIfNeeded() ||
      gameState.cauldronIngredients.length === 0
    ) {
      return;
    }

    const values = calculateCauldron(gameState.cauldronIngredients);
    const succeeded = isBrewSuccessful(
      values,
      gameState.activeRecipe,
      gameState.difficulty,
    );

    gameState = applyBrewResult(gameState, succeeded);

    if (finishGameIfNeeded()) {
      return;
    }

    saveCurrentGame();
    render();
    announcements.brewResult(
      succeeded,
      DIFFICULTY_SETTINGS[gameState.difficulty].scorePerBrew,
    );
  }

  function finishGameIfNeeded(): boolean {
    if (gameState === null) {
      return false;
    }

    if (gameState.gameOverReason !== null) {
      return true;
    }

    const reason = getGameOverReason(gameState);

    if (reason === null) {
      return false;
    }

    gameState = finishGame(gameState, reason);
    savedGame = null;
    clearSave();
    leaderboardEntryPending = qualifiesForLeaderboard(
      gameState.score,
      gameState.difficulty,
    );
    timerDisplayRefresh.stop();
    render();
    announcements.gameOver(reason);

    return true;
  }

  function saveCurrentGame(): void {
    if (gameState !== null) {
      saveGame(gameState);
    }
  }

  function handlePageHide(): void {
    saveCurrentGame();
  }

  applicationRoot.addEventListener(
    "click",
    createGameClickHandler({
      startGame,
      continueGame,
      openDifficultySettings: () => dialogs.openSettings(),
      closeDifficultySettings: () => dialogs.closeSettings(),
      selectDifficulty,
      openHelp: () => dialogs.openHelp(),
      closeHelp: () => dialogs.closeHelp(),
      selectLeaderboardDifficulty: leaderboardController.selectDifficulty,
      pauseGame: handlePause,
      resumeGame: handleResume,
      exitToMenu: handleExitToMenu,
      brew: handleBrewClick,
      addIngredient: handleIngredientClick,
      openLeaderboard: leaderboardController.open,
      closeLeaderboard: leaderboardController.close,
      openLeaderboardClearConfirmation:
        leaderboardController.openClearConfirmation,
      cancelLeaderboardClear: leaderboardController.cancelClear,
      confirmLeaderboardClear: leaderboardController.confirmClear,
    }),
  );
  applicationRoot.addEventListener(
    "dragstart",
    gameDragHandler.handleDragStart,
  );
  applicationRoot.addEventListener("dragover", gameDragHandler.handleDragOver);
  applicationRoot.addEventListener(
    "dragleave",
    gameDragHandler.handleDragLeave,
  );
  applicationRoot.addEventListener("drop", gameDragHandler.handleDrop);
  applicationRoot.addEventListener("dragend", gameDragHandler.handleDragEnd);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("pagehide", handlePageHide);
  applicationRoot.addEventListener(
    "submit",
    leaderboardController.handleNameSubmit,
  );

  render();
}
