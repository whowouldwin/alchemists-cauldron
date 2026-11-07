import { GameDialogController } from "./game-controller/game-dialog-controller.ts";
import { DiscoveryJournalController } from "./game-controller/discovery-journal-controller.ts";
import { JournalScreenController } from "./game-controller/journal-screen-controller.ts";
import { LaboratoryController } from "./game-controller/laboratory-controller.ts";
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
import {
  createLaboratoryClickHandler,
  createLaboratoryChangeHandler,
} from "./ui/laboratory/laboratory-events.ts";

export function initializeGameController(
  applicationRoot: HTMLElement,
  announcements: GameAnnouncements,
): void {
  function renderScreen(): HTMLElement {
    if (laboratory.isVisible) {
      return laboratory.render();
    }

    if (journalScreen.isVisible) {
      return journalScreen.render();
    }

    if (leaderboardController.isVisible()) {
      return leaderboardController.render();
    }

    return renderGame(
      gameSession.currentGameState,
      gameSession.isLeaderboardEntryPending,
      {
        selectedDifficulty: gameSession.selectedGameDifficulty,
        isDifficultySettingsOpen: dialogs.isSettingsOpen,
        isHelpOpen: dialogs.isHelpOpen,
        hasSavedGame: gameSession.hasSavedGame,
      },
    );
  }

  function render(): void {
    const focusedButton = getFocusedGameButton(applicationRoot);

    applicationRoot.replaceChildren(renderScreen());
    restoreGameButtonFocus(applicationRoot, focusedButton);
    leaderboardController.afterRender();
    dialogs.afterRender();
  }

  const dialogs = new GameDialogController(
    applicationRoot,
    () => gameSession.selectedGameDifficulty,
    render,
  );
  const journal = new DiscoveryJournalController();
  const journalScreen = new JournalScreenController({
    applicationRoot,
    journal,
    render,
  });
  const laboratory = new LaboratoryController({
    applicationRoot,
    canOpen: () => gameSession.currentGameState === null,
    render,
    announce: (message) => {
      announcements.region.textContent = message;
    },
  });
  const gameSession = new GameSessionController({
    applicationRoot,
    announcements,
    render,
    onSuccessfulBrew: journal.recordRecipe,
    onReactionsActivated: journal.recordReactions,
    resetOtherControllers: () => {
      dialogs.reset();
      leaderboardController.reset();
      journalScreen.reset();
      laboratory.reset();
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
    createLaboratoryClickHandler(laboratory),
  );
  applicationRoot.addEventListener(
    "change",
    createLaboratoryChangeHandler(laboratory),
  );

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
      openJournal: journalScreen.open,
      closeJournal: journalScreen.close,
      selectJournalSection: journalScreen.selectSection,
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
