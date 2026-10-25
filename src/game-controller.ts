import { GameDialogController } from "./game-controller/game-dialog-controller.ts";
import { LeaderboardController } from "./game-controller/leaderboard-controller.ts";
import { GameSessionController } from "./game-controller/game-session-controller.ts";
import type { GameAnnouncements } from "./ui/game-announcements.ts";
import { createGameClickHandler } from "./ui/game-click-handler.ts";
import { createGameKeyboardHandler } from "./ui/game-keyboard-handler.ts";
import { GameDragHandler } from "./ui/game-drag-handler.ts";
import {
  getFocusedGameButton,
  restoreGameButtonFocus,
} from "./ui/game-focus.ts";
import { initializeIngredientTooltips } from "./ui/ingredient-shelf/ingredient-tooltip-interactions.ts";
import { renderGame } from "./ui/screens/render-game.ts";

export function initializeGameController(
  applicationRoot: HTMLElement,
  announcements: GameAnnouncements,
): void {
  function render(): void {
    const focusedButton = getFocusedGameButton(applicationRoot);
    const screen = leaderboardController.isVisible()
      ? leaderboardController.render()
      : renderGame(
          gameSession.currentGameState,
          gameSession.isLeaderboardEntryPending,
          {
            selectedDifficulty: gameSession.selectedGameDifficulty,
            isDifficultySettingsOpen: dialogs.isSettingsOpen,
            isHelpOpen: dialogs.isHelpOpen,
            hasSavedGame: gameSession.hasSavedGame,
          },
        );

    applicationRoot.replaceChildren(screen);
    restoreGameButtonFocus(applicationRoot, focusedButton);
    leaderboardController.afterRender();
    dialogs.afterRender();
  }

  const dialogs = new GameDialogController(
    applicationRoot,
    () => gameSession.selectedGameDifficulty,
    render,
  );
  const gameSession = new GameSessionController({
    applicationRoot,
    announcements,
    render,
    resetOtherControllers: () => {
      dialogs.reset();
      leaderboardController.reset();
    },
  });

  const leaderboardController = new LeaderboardController({
    applicationRoot,
    getGameState: () => gameSession.currentGameState,
    isEntryPending: () => gameSession.isLeaderboardEntryPending,
    setEntryPending: gameSession.setLeaderboardEntryPending,
    getCurrentDifficulty: () => gameSession.currentDifficulty,
    render,
  });

  const gameDragHandler = new GameDragHandler({
    canAddIngredient: gameSession.canAddIngredient,
    addIngredient: gameSession.addIngredient,
  });

  applicationRoot.addEventListener(
    "click",
    createGameClickHandler({
      startGame: gameSession.startGame,
      continueGame: gameSession.continueGame,
      openDifficultySettings: () => dialogs.openSettings(),
      closeDifficultySettings: () => dialogs.closeSettings(),
      selectDifficulty: gameSession.selectDifficulty,
      openHelp: () => dialogs.openHelp(),
      closeHelp: () => dialogs.closeHelp(),
      selectLeaderboardDifficulty: leaderboardController.selectDifficulty,
      pauseGame: gameSession.pauseGame,
      resumeGame: gameSession.resumeGame,
      exitToMenu: gameSession.exitToMenu,
      brew: gameSession.brew,
      pourOut: gameSession.pourOut,
      addIngredient: gameSession.addIngredient,
      openLeaderboard: leaderboardController.open,
      closeLeaderboard: leaderboardController.close,
      openLeaderboardClearConfirmation:
        leaderboardController.openClearConfirmation,
      cancelLeaderboardClear: leaderboardController.cancelClear,
      confirmLeaderboardClear: leaderboardController.confirmClear,
    }),
  );
  document.addEventListener(
    "keydown",
    createGameKeyboardHandler({
      getGameState: () => gameSession.currentGameState,
      canAddIngredient: gameSession.canAddIngredient,
      addIngredient: gameSession.addIngredient,
      brew: gameSession.brew,
      pourOut: gameSession.pourOut,
      pauseGame: gameSession.pauseGame,
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
  document.addEventListener(
    "visibilitychange",
    gameSession.handleVisibilityChange,
  );
  window.addEventListener("pagehide", gameSession.handlePageHide);
  applicationRoot.addEventListener(
    "submit",
    leaderboardController.handleNameSubmit,
  );

  initializeIngredientTooltips(applicationRoot);
  render();
}
