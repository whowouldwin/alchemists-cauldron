import { createLeaderboardController } from "./game-controller/leaderboard-controller.ts";
import { DIFFICULTY_SETTINGS } from "./data/difficulty-settings.ts";
import type { Difficulty } from "./data/recipes.ts";
import { isBrewSuccessful } from "./logic/brew-check.ts";
import { calculateCauldron } from "./logic/calculate-cauldron.ts";
import { createGameState } from "./state/create-game-state.ts";
import { addIngredient, applyBrewResult } from "./state/game-actions.ts";
import type { GameState } from "./state/game-state.ts";
import {
  finishGame,
  getGameOverReason,
  pauseGame,
  resumeGame,
} from "./state/game-status.ts";
import { qualifiesForLeaderboard } from "./storage/leaderboard.ts";
import type { GameAnnouncements } from "./ui/game-announcements.ts";
import { createGameClickHandler } from "./ui/game-click-handler.ts";
import { createTimerDisplayRefresh } from "./ui/game-status/timer-display-refresh.ts";
import { renderGame } from "./ui/screens/render-game.ts";

export function initializeGameController(
  applicationRoot: HTMLElement,
  announcements: GameAnnouncements,
): void {
  let gameState: GameState | null = null;
  let selectedDifficulty: Difficulty = "medium";
  let isDifficultySettingsOpen = false;
  let isHelpOpen = false;
  let leaderboardEntryPending = false;
  const leaderboardController = createLeaderboardController({
    applicationRoot,
    getGameState: () => gameState,
    isEntryPending: () => leaderboardEntryPending,
    setEntryPending: (pending) => {
      leaderboardEntryPending = pending;
    },
    render,
  });
  const timerDisplayRefresh = createTimerDisplayRefresh(
    applicationRoot,
    () => gameState,
    finishGameIfNeeded,
  );

  function render(): void {
    const screen = leaderboardController.isVisible()
      ? leaderboardController.render()
      : renderGame(gameState, leaderboardEntryPending, {
          selectedDifficulty,
          isDifficultySettingsOpen,
          isHelpOpen,
        });

    applicationRoot.replaceChildren(screen);
    leaderboardController.afterRender();
    afterRenderHelp();
    afterRenderDifficultySettings();
  }

  function startGame(): void {
    gameState = createGameState(Math.random, Date.now(), selectedDifficulty);
    isDifficultySettingsOpen = false;
    isHelpOpen = false;
    leaderboardEntryPending = false;
    leaderboardController.reset();
    render();
    timerDisplayRefresh.start();
  }

  function openDifficultySettings(): void {
    isDifficultySettingsOpen = true;
    isHelpOpen = false;
    render();
  }

  function closeDifficultySettings(): void {
    isDifficultySettingsOpen = false;
    render();
    applicationRoot
      .querySelector<HTMLButtonElement>(
        '[data-action="open-difficulty-settings"]',
      )
      ?.focus();
  }

  function openHelp(): void {
    isHelpOpen = true;
    isDifficultySettingsOpen = false;
    render();
  }

  function closeHelp(): void {
    isHelpOpen = false;
    render();
    applicationRoot
      .querySelector<HTMLButtonElement>('[data-action="open-help"]')
      ?.focus();
  }

  function afterRenderHelp(): void {
    if (!isHelpOpen) {
      return;
    }

    const dialog =
      applicationRoot.querySelector<HTMLDialogElement>("#game-help");

    if (dialog === null) {
      return;
    }

    dialog.addEventListener("cancel", handleHelpDialogCancel, { once: true });
    dialog.showModal();
    dialog
      .querySelector<HTMLButtonElement>('[data-action="close-help"]')
      ?.focus();
  }

  function handleHelpDialogCancel(event: Event): void {
    event.preventDefault();
    closeHelp();
  }

  function afterRenderDifficultySettings(): void {
    if (!isDifficultySettingsOpen) {
      return;
    }

    const dialog = applicationRoot.querySelector<HTMLDialogElement>(
      "#difficulty-settings",
    );

    if (dialog === null) {
      return;
    }

    dialog.addEventListener("cancel", handleDifficultySettingsCancel, {
      once: true,
    });
    dialog.showModal();
    focusSelectedDifficulty();
  }

  function handleDifficultySettingsCancel(event: Event): void {
    event.preventDefault();
    closeDifficultySettings();
  }

  function selectDifficulty(difficulty: Difficulty): void {
    selectedDifficulty = difficulty;
    render();
  }

  function focusSelectedDifficulty(): void {
    applicationRoot
      .querySelector<HTMLButtonElement>(
        `[data-action="select-difficulty"][data-difficulty="${selectedDifficulty}"]`,
      )
      ?.focus();
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
    leaderboardEntryPending = false;
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
    leaderboardEntryPending = qualifiesForLeaderboard(gameState.score);
    timerDisplayRefresh.stop();
    render();
    announcements.gameOver(reason);

    return true;
  }

  applicationRoot.addEventListener(
    "click",
    createGameClickHandler({
      startGame,
      openDifficultySettings,
      closeDifficultySettings,
      selectDifficulty,
      openHelp,
      closeHelp,
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
  document.addEventListener("visibilitychange", handleVisibilityChange);
  applicationRoot.addEventListener(
    "submit",
    leaderboardController.handleNameSubmit,
  );

  render();
}
